import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DesignElement, DataRow, Variable } from '../types';

export interface GenerationOptions {
  format: 'pdf' | 'png' | 'jpg';
  quality: number;
  filenameField: string;
  batchSize?: number; // Optional: certificates to process at once (default: 25)
  maxZipSize?: number; // Optional: max certificates per ZIP file (default: 100)
}

export class CertificateGenerator {
  private elements: DesignElement[];
  private variables: Variable[];
  private canvasWidth: number = 800;
  private canvasHeight: number = 600;

  constructor(elements: DesignElement[], variables: Variable[]) {
    this.elements = elements;
    this.variables = variables;
    
    // Calculate canvas size based on background image (same logic as PreviewModal)
    const backgroundElement = this.elements.find(el => el.zIndex === 0 && el.type === 'image');
    if (backgroundElement) {
      this.canvasWidth = backgroundElement.size.width;
      this.canvasHeight = backgroundElement.size.height;
    } else {
      // Fallback: use default size
      this.canvasWidth = 800;
      this.canvasHeight = 600;
    }
  }

  private checkMemoryUsage(): void {
    // Check if performance.memory is available (Chrome/Edge)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      console.log(`Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB (limit: ${limitMB.toFixed(2)}MB)`);
      
      // Warn if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn('High memory usage detected. Consider reducing batch size.');
      }
    }
  }

  private async forceGarbageCollection(): Promise<void> {
    // Force garbage collection by creating and releasing memory
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // Alternative: create temporary objects to trigger GC
    const temp = new Array(1000).fill(0).map(() => new Array(1000).fill(0));
    temp.length = 0;
    
    // Give browser time to clean up
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  async generateCertificates(
    data: DataRow[],
    options: GenerationOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // Validate inputs
    if (!data || data.length === 0) {
      throw new Error('No data available for generation');
    }
    
    if (!this.elements || this.elements.length === 0) {
      throw new Error('No design elements available for generation');
    }
    
    if (!options.format || !['pdf', 'png', 'jpg'].includes(options.format)) {
      throw new Error('Invalid format specified. Must be pdf, png, or jpg');
    }
    
    if (options.quality < 1 || options.quality > 100) {
      throw new Error('Quality must be between 1 and 100');
    }

    // For large datasets (>50 items), use batch processing to avoid memory issues
    if (data.length > 50) {
      await this.generateCertificatesBatched(data, options, onProgress);
      return;
    }

    const files: { name: string; blob: Blob }[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const filename = this.generateFilename(row, options.filenameField, i, options.format);
      
      try {
        const blob = await this.generateSingleCertificate(row, options);
        files.push({ name: filename, blob });
        
        if (onProgress) {
          onProgress(Math.round(((i + 1) / data.length) * 100));
        }
        
        // Force garbage collection for large datasets
        if (i > 0 && i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (error) {
        console.error(`Error generating certificate for row ${i + 1}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to generate certificate for ${filename}: ${errorMessage}`);
      }
    }

    // Download files
    if (files.length === 1) {
      // Single file - download directly
      this.downloadFile(files[0].blob, files[0].name);
    } else {
      // Multiple files - create zip
      await this.downloadAsZip(files);
    }
  }

  // Create DOM elements directly using the same logic as PreviewModal
  private renderCertificateToContainer(container: HTMLDivElement, dataRow: DataRow): Promise<void> {
    return new Promise((resolve) => {
      // Create main certificate container
      const certificateDiv = document.createElement('div');
      certificateDiv.style.width = `${this.canvasWidth}px`;
      certificateDiv.style.height = `${this.canvasHeight}px`;
      certificateDiv.style.position = 'relative';
      
      // Only set white background if there's no background image
      const hasBackgroundImage = this.elements.some(el => el.zIndex === 0 && el.type === 'image');
      if (!hasBackgroundImage) {
        certificateDiv.style.backgroundColor = 'white';
      }
      
      // Sort elements by zIndex and render them
      const sortedElements = this.elements.sort((a, b) => a.zIndex - b.zIndex);
      const imagePromises: Promise<void>[] = [];
      
      console.log('Rendering elements:', sortedElements.length);
      console.log('Background element:', sortedElements.find(el => el.zIndex === 0 && el.type === 'image'));
      
      sortedElements.forEach((element) => {
        const elementDiv = document.createElement('div');
        elementDiv.style.position = 'absolute';
        elementDiv.style.left = `${element.position.x}px`;
        elementDiv.style.top = `${element.position.y}px`;
        elementDiv.style.width = `${element.size.width}px`;
        elementDiv.style.height = `${element.size.height}px`;
        elementDiv.style.transform = `rotate(${element.rotation}deg)`;
        elementDiv.style.opacity = element.opacity.toString();
        elementDiv.style.zIndex = element.zIndex.toString();
        
        if (element.type === 'text') {
          let text = element.text || '';
          
          // Handle variable replacement (same logic as PreviewModal)
          if (element.isVariable && element.variableName && dataRow[element.variableName] !== undefined && dataRow[element.variableName] !== null) {
            text = dataRow[element.variableName].toString();
          } else {
            // Replace {{VARIABLE}} placeholders
            this.variables.forEach((variable) => {
              if (variable && variable.name) {
                const placeholder = `{{${variable.name}}}`;
                if (text.includes(placeholder) && dataRow[variable.name] !== undefined && dataRow[variable.name] !== null) {
                  text = text.replace(new RegExp(placeholder, 'g'), dataRow[variable.name].toString());
                }
              }
            });
          }
          
          // Set flex alignment for the container div (same as PreviewModal)
          elementDiv.style.display = 'flex';
          elementDiv.style.alignItems = element.textStyle?.verticalAlign === 'top' ? 'flex-start' :
                                       element.textStyle?.verticalAlign === 'bottom' ? 'flex-end' : 'center';
          elementDiv.style.justifyContent = element.textStyle?.textAlign === 'center' ? 'center' : 
                                           element.textStyle?.textAlign === 'right' ? 'flex-end' : 'flex-start';
          elementDiv.style.overflow = 'hidden';
          
          const textSpan = document.createElement('span');
          textSpan.textContent = text;
          textSpan.style.fontFamily = element.textStyle?.fontFamily || 'Arial, sans-serif';
          textSpan.style.fontSize = `${element.textStyle?.fontSize || 16}px`;
          textSpan.style.fontWeight = element.textStyle?.fontWeight || 'normal';
          textSpan.style.color = element.textStyle?.color || '#000000';
          textSpan.style.textAlign = element.textStyle?.textAlign || 'left';
          textSpan.style.width = '100%';
          textSpan.style.display = 'block';
          
          elementDiv.appendChild(textSpan);
        } else if (element.type === 'image' && element.imageUrl) {
          console.log(`Processing image element: zIndex=${element.zIndex}, url=${element.imageUrl}`);
          const imagePromise = new Promise<void>((resolveImage) => {
            // Convert external image to data URL to avoid CORS taint
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            tempImg.onload = () => {
              canvas.width = tempImg.width;
              canvas.height = tempImg.height;
              ctx?.drawImage(tempImg, 0, 0);
              
              const img = document.createElement('img');
              try {
                img.src = canvas.toDataURL('image/png');
              } catch (e) {
                // Fallback to original URL if conversion fails
                img.src = element.imageUrl!;
              }
              img.alt = 'Template element';
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'cover';
              
              img.onload = () => {
                 console.log('Image loaded successfully');
                 resolveImage();
               };
               img.onerror = () => {
                 console.error('Failed to load image:', element.imageUrl);
                 resolveImage();
               };
               
               elementDiv.appendChild(img);
            };
            
            tempImg.onerror = () => {
              // Fallback: use original image without conversion
              const img = document.createElement('img');
              img.src = element.imageUrl!;
              img.alt = 'Template element';
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'cover';
              
              img.onload = () => {
                 console.log('Fallback image loaded');
                 resolveImage();
               };
               img.onerror = () => {
                 console.error('Failed to load fallback image:', element.imageUrl);
                 resolveImage();
               };
               
               elementDiv.appendChild(img);
            };
            
            tempImg.src = element.imageUrl!;
          });
          imagePromises.push(imagePromise);
        } else if (element.type === 'line') {
          elementDiv.style.backgroundColor = element.lineStyle?.color || '#000000';
          elementDiv.style.height = `${element.lineStyle?.width || 1}px`;
          elementDiv.style.borderStyle = element.lineStyle?.style || 'solid';
        } else {
          // Rectangle and circle elements
          elementDiv.style.backgroundColor = element.backgroundColor || 'transparent';
          elementDiv.style.border = element.borderStyle ? 
            `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}` : 
            'none';
          elementDiv.style.borderRadius = element.type === 'circle' ? '50%' : '0';
        }
        
        certificateDiv.appendChild(elementDiv);
      });
      
      container.appendChild(certificateDiv);
      
      // Wait for all images to load
      Promise.all(imagePromises).then(() => {
        setTimeout(resolve, 100); // Give a bit more time for rendering
      });
    });
  }

  private async generateSingleCertificate(
    dataRow: DataRow,
    options: GenerationOptions
  ): Promise<Blob> {
    // Create a temporary container element
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${this.canvasWidth}px`;
    container.style.height = `${this.canvasHeight}px`;
    container.style.zIndex = '-1000';
    container.style.visibility = 'hidden';
    // Don't set background color - let background image show through
    
    // Add CSS styles for absolute positioning
    const style = document.createElement('style');
    style.textContent = `
      .absolute {
        position: absolute !important;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(container);

    try {
      // Render the certificate using DOM elements
      await this.renderCertificateToContainer(container, dataRow);

      // Make container visible for html2canvas
      container.style.visibility = 'visible';
      container.style.left = '0px';
      container.style.top = '0px';

      // Convert to image using html2canvas
      const htmlCanvas = await html2canvas(container, {
        width: this.canvasWidth,
        height: this.canvasHeight,
        scale: 2,
        backgroundColor: 'white',
        useCORS: false, // Disable CORS to allow tainted canvas
        allowTaint: true,
        logging: true,
        imageTimeout: 15000,
        timeout: 30000,
      });
      
      // Remove the style element
      document.head.removeChild(style);

      // Generate blob based on format
      let blob: Blob;
      
      if (options.format === 'pdf') {
        blob = await this.generatePDFBlob(htmlCanvas);
      } else {
        blob = await this.generateImageBlob(htmlCanvas, options.format, options.quality);
      }

      return blob;
    } catch (error) {
      console.error('Error in generateSingleCertificate:', error);
      throw error; // Re-throw to be caught by the calling function
    } finally {
      // Ensure container is always removed, even if there's an error
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  // Old rendering methods removed - now using React rendering approach



  private async generatePDFBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [this.canvasWidth, this.canvasHeight]
      });

      const imgData = canvas.toDataURL('image/png');
      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to convert canvas to image data');
      }
      
      pdf.addImage(
        imgData, 
        'PNG', 
        0, 
        0, 
        this.canvasWidth, 
        this.canvasHeight
      );
      
      const pdfBlob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateImageBlob(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpg',
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const adjustedQuality = quality / 100;
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image blob'));
            return;
          }
          if (blob.size === 0) {
            reject(new Error('Generated image is empty'));
            return;
          }
          resolve(blob);
        }, mimeType, adjustedQuality);
      } catch (error) {
        reject(new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  private generateFilename(
    row: DataRow, 
    filenameField: string, 
    index: number, 
    format: 'pdf' | 'png' | 'jpg'
  ): string {
    let baseName = 'certificate';
    
    if (filenameField && row[filenameField]) {
      // Clean the filename to remove invalid characters
      baseName = row[filenameField]
        .toString()
        .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove invalid characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .trim();
      
      // Ensure the filename is not empty after cleaning
      if (!baseName) {
        baseName = `certificate_${index + 1}`;
      }
    } else {
      baseName = `certificate_${index + 1}`;
    }
    
    // Add the appropriate file extension
    const extension = format === 'pdf' ? '.pdf' : format === 'png' ? '.png' : '.jpg';
    
    return `${baseName}${extension}`;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async generateCertificatesBatched(
    data: DataRow[],
    options: GenerationOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const BATCH_SIZE = options.batchSize || 25; // Process certificates at a time
     const MAX_ZIP_SIZE = options.maxZipSize || 100; // Maximum certificates per ZIP file
    const totalBatches = Math.ceil(data.length / BATCH_SIZE);
    const totalZips = Math.ceil(data.length / MAX_ZIP_SIZE);
    
    let allFiles: { name: string; blob: Blob }[] = [];
    let processedCount = 0;
    
    console.log(`Processing ${data.length} certificates in ${totalBatches} batches, creating ${totalZips} ZIP file(s)`);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, data.length);
      const batchData = data.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (items ${startIndex + 1}-${endIndex})`);
      
      // Process current batch
      const batchFiles: { name: string; blob: Blob }[] = [];
      
      for (let i = 0; i < batchData.length; i++) {
        const row = batchData[i];
        const globalIndex = startIndex + i;
        const filename = this.generateFilename(row, options.filenameField, globalIndex, options.format);
        
        try {
           const blob = await this.generateSingleCertificate(row, options);
           batchFiles.push({ name: filename, blob });
           processedCount++;
           
           if (onProgress) {
             onProgress(Math.round((processedCount / data.length) * 100));
           }
           
           // Small delay to prevent browser freezing
           if (i % 5 === 0) {
             await new Promise(resolve => setTimeout(resolve, 5));
           }
         } catch (error) {
           console.error(`Error generating certificate for row ${globalIndex + 1}:`, error);
           
           // For bulk generation, we'll skip failed certificates and continue
           // instead of stopping the entire process
           console.warn(`Skipping certificate ${globalIndex + 1} due to error: ${error}`);
           
           // Create a placeholder error file to indicate the failure
           const errorText = `Error generating certificate for row ${globalIndex + 1}: ${error}`;
           const errorBlob = new Blob([errorText], { type: 'text/plain' });
           const errorFilename = `ERROR_${filename.replace(/\.[^.]+$/, '.txt')}`;
           batchFiles.push({ name: errorFilename, blob: errorBlob });
           
           processedCount++;
           
           if (onProgress) {
             onProgress(Math.round((processedCount / data.length) * 100));
           }
         }
      }
      
      allFiles.push(...batchFiles);
      
      // If we've reached the maximum ZIP size or this is the last batch, create a ZIP
      if (allFiles.length >= MAX_ZIP_SIZE || batchIndex === totalBatches - 1) {
        const zipIndex = Math.floor((processedCount - 1) / MAX_ZIP_SIZE) + 1;
        const zipFilename = totalZips > 1 ? `certificates_part_${zipIndex}.zip` : 'certificates.zip';
        
        console.log(`Creating ZIP file: ${zipFilename} with ${allFiles.length} certificates`);
        await this.downloadAsZip(allFiles, zipFilename);
        
        // Clear files array to free memory
         allFiles = [];
         
         // Force garbage collection and check memory usage
         await this.forceGarbageCollection();
         this.checkMemoryUsage();
      }
    }
    
    console.log(`Successfully generated ${processedCount} certificates`);
  }

  private async downloadAsZip(files: { name: string; blob: Blob }[], filename: string = 'certificates.zip'): Promise<void> {
    const zip = new JSZip();
    
    // Add files to ZIP with progress tracking for large sets
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      zip.file(file.name, file.blob);
      
      // Small delay every 10 files to prevent blocking
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    console.log(`Generating ZIP file with ${files.length} certificates...`);
    
    // Generate ZIP with compression for better file size
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Balanced compression
      }
    });
    
    console.log(`ZIP file generated: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`);
    this.downloadFile(zipBlob, filename);
  }
}
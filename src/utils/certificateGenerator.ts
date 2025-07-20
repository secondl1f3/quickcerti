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
    if (data.length === 0) {
      throw new Error('No data available for generation');
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
        throw new Error(`Failed to generate certificate for ${filename}`);
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

  private async generateSingleCertificate(
    dataRow: DataRow,
    options: GenerationOptions
  ): Promise<Blob> {
    // Create a temporary canvas element
    const canvas = document.createElement('div');
    canvas.style.position = 'absolute';
    canvas.style.left = '-9999px';
    canvas.style.top = '-9999px';
    canvas.style.width = `${this.canvasWidth}px`;
    canvas.style.height = `${this.canvasHeight}px`;
    canvas.style.backgroundColor = 'white';
    canvas.style.fontFamily = 'Arial, sans-serif';
    
    document.body.appendChild(canvas);

    try {
      // Render elements to the canvas
      await this.renderElementsToCanvas(canvas, dataRow);

      // Convert to image with optimized settings for bulk generation
      const htmlCanvas = await html2canvas(canvas, {
        width: this.canvasWidth,
        height: this.canvasHeight,
        scale: 3, // Increase scale for better quality
        backgroundColor: null, // Use null for transparent background
        useCORS: true,
        allowTaint: true,
        logging: false, // Disable logging for better performance
        removeContainer: true, // Clean up after rendering
        imageTimeout: 15000, // 15 second timeout for images
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { font-family: Arial, sans-serif !important; }
            img { max-width: 100% !important; height: auto !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Generate blob based on format
      let blob: Blob;
      
      if (options.format === 'pdf') {
        blob = await this.generatePDFBlob(htmlCanvas);
      } else {
        blob = await this.generateImageBlob(htmlCanvas, options.format, options.quality);
      }

      return blob;
    } finally {
      document.body.removeChild(canvas);
    }
  }

  private async renderElementsToCanvas(canvas: HTMLDivElement, dataRow: DataRow): Promise<void> {
    // Sort elements by z-index
    const sortedElements = [...this.elements].sort((a, b) => a.zIndex - b.zIndex);
    const imagePromises: Promise<void>[] = [];

    sortedElements.forEach(element => {
      const elementDiv = document.createElement('div');
      elementDiv.style.position = 'absolute';
      elementDiv.style.left = `${element.position.x}px`;
      elementDiv.style.top = `${element.position.y}px`;
      elementDiv.style.width = `${element.size.width}px`;
      elementDiv.style.height = `${element.size.height}px`;
      elementDiv.style.transform = `rotate(${element.rotation}deg)`;
      elementDiv.style.opacity = element.opacity.toString();
      elementDiv.style.zIndex = element.zIndex.toString();

      switch (element.type) {
        case 'text':
          this.renderTextElement(elementDiv, element, dataRow);
          break;
        case 'rectangle':
          this.renderRectangleElement(elementDiv, element);
          break;
        case 'circle':
          this.renderCircleElement(elementDiv, element);
          break;
        case 'line':
          this.renderLineElement(elementDiv, element);
          break;
        case 'image':
          imagePromises.push(this.renderImageElement(elementDiv, element));
          break;
      }

      canvas.appendChild(elementDiv);
    });

    // Wait for all images to load
    await Promise.all(imagePromises);
  }

  private renderTextElement(div: HTMLDivElement, element: DesignElement, dataRow: DataRow): void {
    let text = element.text || '';
    
    // Replace variables with actual data
    if (element.isVariable && element.variableName && dataRow[element.variableName]) {
      const value = dataRow[element.variableName];
      text = value ? value.toString() : '';
    } else {
      // Replace {{VARIABLE}} placeholders
      this.variables.forEach(variable => {
        const placeholder = `{{${variable.name}}}`;
        if (text.includes(placeholder) && dataRow[variable.name]) {
          const value = dataRow[variable.name];
          text = text.replace(new RegExp(placeholder, 'g'), value ? value.toString() : '');
        }
      });
    }

    // Create container with proper flex alignment
    div.style.display = 'flex';
    div.style.alignItems = element.textStyle?.verticalAlign === 'top' ? 'flex-start' :
                          element.textStyle?.verticalAlign === 'bottom' ? 'flex-end' : 'center';
    div.style.justifyContent = element.textStyle?.textAlign === 'center' ? 'center' : 
                              element.textStyle?.textAlign === 'right' ? 'flex-end' : 'flex-start';
    div.style.wordWrap = 'break-word';

    // Create text span with proper styling and quality enhancements
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.fontFamily = element.textStyle?.fontFamily || 'Arial';
    textSpan.style.fontSize = `${element.textStyle?.fontSize || 16}px`;
    textSpan.style.fontWeight = element.textStyle?.fontWeight || 'normal';
    textSpan.style.color = element.textStyle?.color || '#000000';
    textSpan.style.textAlign = element.textStyle?.textAlign || 'left';
    textSpan.style.lineHeight = (element.textStyle?.lineHeight || 1.2).toString();
    textSpan.style.width = '100%';
      textSpan.style.display = 'block';

    div.appendChild(textSpan);
  }

  private renderRectangleElement(div: HTMLDivElement, element: DesignElement): void {
    div.style.backgroundColor = element.backgroundColor || 'transparent';
    if (element.borderStyle) {
      div.style.border = `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}`;
    }
  }

  private renderCircleElement(div: HTMLDivElement, element: DesignElement): void {
    div.style.backgroundColor = element.backgroundColor || 'transparent';
    div.style.borderRadius = '50%';
    if (element.borderStyle) {
      div.style.border = `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}`;
    }
  }

  private renderLineElement(div: HTMLDivElement, element: DesignElement): void {
    div.style.backgroundColor = element.lineStyle?.color || '#000000';
    div.style.height = `${element.lineStyle?.width || 1}px`;
    div.style.borderStyle = element.lineStyle?.style || 'solid';
  }

  private async renderImageElement(div: HTMLDivElement, element: DesignElement): Promise<void> {
    if (element.imageUrl) {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous'; // Handle CORS for images from other domains
        img.src = element.imageUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        img.onload = () => {
          div.appendChild(img);
          resolve();
        };

        img.onerror = (error) => {
          console.error('Error loading image:', element.imageUrl, error);
          // Optionally, append a placeholder or error message
          const errorText = document.createElement('div');
          errorText.textContent = 'Image not found';
          errorText.style.color = 'red';
          div.appendChild(errorText);
          reject(new Error(`Failed to load image: ${element.imageUrl}`));
        };
      });
    }
  }



  private async generatePDFBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [this.canvasWidth, this.canvasHeight]
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(
      imgData, 
      'PNG', 
      0, 
      0, 
      this.canvasWidth, 
      this.canvasHeight
    );
    
    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  private async generateImageBlob(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpg',
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const adjustedQuality = quality / 100;
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, mimeType, adjustedQuality);
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
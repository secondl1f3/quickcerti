import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DesignElement, DataRow, Variable } from '../types';

export interface GenerationOptions {
  format: 'pdf' | 'png' | 'jpg';
  quality: number;
  filenameField: string;
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

  async generateCertificates(
    data: DataRow[],
    options: GenerationOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (data.length === 0) {
      throw new Error('No data available for generation');
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
      this.renderElementsToCanvas(canvas, dataRow);

      // Convert to image with simplified settings for debugging
      const htmlCanvas = await html2canvas(canvas, {
        width: this.canvasWidth,
        height: this.canvasHeight,
        scale: 1,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging to debug issues
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

  private renderElementsToCanvas(canvas: HTMLDivElement, dataRow: DataRow): void {
    // Sort elements by z-index
    const sortedElements = [...this.elements].sort((a, b) => a.zIndex - b.zIndex);

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
          this.renderImageElement(elementDiv, element);
          break;
      }

      canvas.appendChild(elementDiv);
    });
  }

  private renderTextElement(div: HTMLDivElement, element: DesignElement, dataRow: DataRow): void {
    let text = element.text || '';
    
    // Replace variables with actual data
    if (element.isVariable && element.variableName && dataRow[element.variableName]) {
      text = dataRow[element.variableName].toString();
    } else {
      // Replace {{VARIABLE}} placeholders
      this.variables.forEach(variable => {
        const placeholder = `{{${variable.name}}}`;
        if (text.includes(placeholder) && dataRow[variable.name]) {
          text = text.replace(new RegExp(placeholder, 'g'), dataRow[variable.name].toString());
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

  private renderImageElement(div: HTMLDivElement, element: DesignElement): void {
    if (element.imageUrl) {
      const img = document.createElement('img');
      img.src = element.imageUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      div.appendChild(img);
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

  private async downloadAsZip(files: { name: string; blob: Blob }[]): Promise<void> {
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.downloadFile(zipBlob, 'certificates.zip');
  }
}
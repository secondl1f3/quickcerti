import { Template } from '../types';
import { getApiUrl, makeAuthenticatedRequest, getCurrentUserId } from '../config/api';

interface UploadUrlResponse {
  uploadUrl: string;
  finalUrl: string;
}

interface CreateTemplateRequest {
  name: string;
  templateUrl: string;
  userId: string;
  isPublic: boolean;
}

export class TemplateService {

  /**
   * Fix template URLs by properly encoding spaces and special characters
   */
  private static fixTemplateUrls(templates: Template[]): Template[] {
    return templates.map(template => ({
      ...template,
      thumbnail: template.thumbnail ? this.fixUrl(template.thumbnail) : template.thumbnail,
      templateUrl: template.templateUrl ? this.fixUrl(template.templateUrl) : template.templateUrl,
    }));
  }

  /**
   * Fix individual URL by replacing incorrectly formatted characters
   */
  private static fixUrl(url: string): string {
  // If the URL contains the R2 domain, fix common encoding issues
  if (url.includes('pub-3724d52ae2fc4ec1a79522de68127fa3.r2.dev')) {
    const urlParts = url.split('/templates/');
    if (urlParts.length === 2) {
      const [baseUrl, rawFileName] = urlParts;
      
      // First, decode the filename to handle existing encodings like %20
      const fileName = decodeURIComponent(rawFileName);

      // Define the pattern to find a UUID prefix
      const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-)/;
      const match = fileName.match(uuidPattern);
      
      let uuidPrefix = '';
      let actualFileName = fileName;

      // If a UUID is found, separate it from the rest of the filename
      if (match) {
        uuidPrefix = match[0]; // The full UUID prefix, e.g., "395401d8-...-"
        actualFileName = fileName.substring(uuidPrefix.length);
      }
      
      // Sanitize the filename part by replacing spaces with hyphens
      const fixedActualFileName = actualFileName
        .trim() // Remove leading/trailing whitespace
        .replace(/\s+/g, '-'); // Replace one or more spaces with a single hyphen

      // Reconstruct and return the corrected URL
      return `${baseUrl}/templates/${uuidPrefix}${fixedActualFileName}`;
    }
  }
  // Return the original URL if no modifications were needed
  return url;
}

  /**
   * Get pre-signed URL for uploading template file
   */
  static async getUploadUrl(fileName: string, contentType: string): Promise<UploadUrlResponse> {
    const response = await makeAuthenticatedRequest('/templates/upload-url', {
      method: 'POST',
      body: JSON.stringify({
        fileName,
        contentType,
      }),
    });



    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload file directly to R2 using pre-signed URL
   */
  static async uploadFileToR2(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });



    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  }

  /**
   * Save template metadata to database
   */
  static async createTemplate(templateData: CreateTemplateRequest): Promise<Template> {
    const response = await makeAuthenticatedRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });



    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get public templates
   */
  static async getPublicTemplates(): Promise<Template[]> {
    
    try {
      const response = await makeAuthenticatedRequest('/templates/public');
      if (!response.ok) {
        throw new Error(`Failed to fetch public templates: ${response.statusText}`);
      }
      const templates = await response.json();
      return this.fixTemplateUrls(templates);
    } catch (error) {
      console.error('Error fetching public templates:', error);
      throw error;
    }
  }

  /**
   * Get user's templates
   */
  static async getUserTemplates(): Promise<Template[]> {
    
    try {
      const response = await makeAuthenticatedRequest('/templates/my-templates');
      if (!response.ok) {
        throw new Error(`Failed to fetch user templates: ${response.statusText}`);
      }
      const templates = await response.json();
      return this.fixTemplateUrls(templates);
    } catch (error) {
      console.error('Error fetching user templates:', error);
      throw error;
    }
  }

  /**
   * Complete template upload workflow
   */
  static async uploadTemplate(
    file: File,
    templateData: { name: string; isPublic: boolean }
  ): Promise<Template> {
    
    try {
      // Get current user ID using centralized helper
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }



      // Step 1: Get pre-signed URL
      const { uploadUrl, finalUrl } = await this.getUploadUrl(file.name, file.type);

      // Step 2: Upload file to R2
      await this.uploadFileToR2(uploadUrl, file);

      // Step 3: Save template metadata
      const template = await this.createTemplate({
        name: templateData.name,
        templateUrl: finalUrl,
        userId: userId,
        isPublic: templateData.isPublic,
      });

      return template;
    } catch (error) {
      console.error('Error uploading template:', error);
      throw error;
    }
  }
}

// Hook for easier usage in components
export const useTemplateService = () => {
  return {
    uploadTemplate: TemplateService.uploadTemplate,
    getPublicTemplates: TemplateService.getPublicTemplates,
    getUserTemplates: TemplateService.getUserTemplates,
  };
};
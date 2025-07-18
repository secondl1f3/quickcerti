import { DesignElement } from '../types';
import { getApiUrl, makeAuthenticatedRequest } from '../config/api';

interface Design {
  id: string;
  name: string;
  elements: DesignElement[];
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SaveDesignRequest {
  name?: string;
  elements: DesignElement[];
  pageCount: number;
}

interface UpdateDesignRequest {
  id: string;
  name?: string;
  elements: DesignElement[];
  pageCount: number;
}

interface GenerateCertificateRequest {
  designId: string;
  pageCount: number;
}

interface GenerateCertificateResponse {
  downloadUrl: string;
  pointsDeducted: number;
  remainingPoints: number;
}

export class DesignService {

  /**
   * Save design to backend (create new design)
   */
  static async saveDesign(request: SaveDesignRequest): Promise<Design> {
    try {
      const response = await makeAuthenticatedRequest('/designs', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to save design: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error saving design:', error);
      throw error;
    }
  }

  /**
   * Update existing design
   */
  static async updateDesign(request: UpdateDesignRequest): Promise<Design> {
    try {
      const response = await makeAuthenticatedRequest(`/designs/${request.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: request.name,
          elements: request.elements,
          pageCount: request.pageCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update design: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating design:', error);
      throw error;
    }
  }

  /**
   * Save or update design based on whether ID exists
   */
  static async saveOrUpdateDesign(
    request: SaveDesignRequest,
    designId?: string
  ): Promise<Design> {
    if (designId) {
      return this.updateDesign({
        id: designId,
        ...request,
      });
    } else {
      return this.saveDesign(request);
    }
  }

  /**
   * Get user's saved designs
   */
  static async getUserDesigns(): Promise<Design[]> {
    try {
      const response = await makeAuthenticatedRequest('/designs');
      if (!response.ok) {
        console.warn('Failed to fetch designs:', response.statusText);
        return [];
      }
      return response.json();
    } catch (error) {
      console.warn('Error fetching designs:', error);
      return [];
    }
  }

  /**
   * Get specific design by ID
   */
  static async getDesign(designId: string): Promise<Design> {
    const response = await makeAuthenticatedRequest(`/designs/${designId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get design: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate certificate (costs points)
   */
  static async generateCertificate(request: GenerateCertificateRequest): Promise<GenerateCertificateResponse> {
    try {
      const response = await makeAuthenticatedRequest('/certificate/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          throw new InsufficientPointsError(
            errorData.message || 'Insufficient points',
            errorData.required || 0,
            errorData.available || 0
          );
        }
        throw new Error(`Failed to generate certificate: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof InsufficientPointsError) {
        throw error;
      }
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  /**
   * Calculate points required for generation
   */
  static calculateRequiredPoints(pageCount: number): number {
    return pageCount * 1; // 1 point per page
  }

  /**
   * Check if user has sufficient points before generation
   */
  static async checkPointsBeforeGeneration(pageCount: number): Promise<{ hasEnoughPoints: boolean; requiredPoints: number; currentPoints: number }> {
    try {
      const response = await makeAuthenticatedRequest('/certificate/check-points', {
        method: 'POST',
        body: JSON.stringify({ pageCount }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check points: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error checking points:', error);
      throw error;
    }
  }

  /**
   * Generate certificate with point deduction
   */
  static async generateCertificateWithPoints(request: GenerateCertificateRequest): Promise<GenerateCertificateResponse> {
    try {
      const result = await this.generateCertificate(request);
      return result;
    } catch (error) {
      if (error instanceof InsufficientPointsError) {
        throw error;
      }
      throw new Error(`Certificate generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Save and generate certificate in one workflow
   */
  static async saveAndGenerate(
    elements: DesignElement[],
    pageCount: number,
    designName?: string,
    designId?: string
  ): Promise<GenerateCertificateResponse> {
    try {
      // Step 1: Save or update the design
      const design = await this.saveOrUpdateDesign({
        name: designName || `Certificate Design ${new Date().toLocaleDateString()}`,
        elements,
        pageCount,
      }, designId);

      // Step 2: Generate certificate
      const result = await this.generateCertificate({
        designId: design.id,
        pageCount
      });
      
      return result;
    } catch (error) {
      console.error('Save and generate failed:', error);
      throw error;
    }
  }
}

/**
 * Custom error for insufficient points
 */
export class InsufficientPointsError extends Error {
  constructor(
    message: string,
    public requiredPoints: number,
    public currentPoints: number
  ) {
    super(message);
    this.name = 'InsufficientPointsError';
  }
}

/**
 * Hook for easier usage in components
 */
export const useDesignService = () => {
  return {
    saveDesign: DesignService.saveDesign,
    updateDesign: DesignService.updateDesign,
    saveOrUpdateDesign: DesignService.saveOrUpdateDesign,
    getUserDesigns: DesignService.getUserDesigns,
    getDesign: DesignService.getDesign,
    generateCertificate: DesignService.generateCertificate,
    saveAndGenerate: DesignService.saveAndGenerate,
    calculateRequiredPoints: DesignService.calculateRequiredPoints,
    checkPointsBeforeGeneration: DesignService.checkPointsBeforeGeneration,
    generateCertificateWithPoints: DesignService.generateCertificateWithPoints,
  };
};
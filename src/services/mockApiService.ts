// Mock API service for development and testing
// This provides fallback functionality when the actual backend is not available

import { Template } from '../types';

// Interface for certificate generation response
interface GenerateCertificateResponse {
  downloadUrl: string;
  pointsDeducted: number;
  remainingPoints: number;
}

// Custom error for insufficient points
class InsufficientPointsError extends Error {
  constructor(
    message: string,
    public requiredPoints: number,
    public currentPoints: number
  ) {
    super(message);
    this.name = 'InsufficientPointsError';
  }
}

// Mock templates data
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Certificate of Achievement',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNGFkZTgwIi8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BY2hpZXZlbWVudDwvdGV4dD4KPHN2Zz4=',
    templateUrl: 'https://example.com/templates/achievement.pdf',
    elements: [],
    variables: [],
    userId: 'user-1',
    isPublic: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'template-2',
    name: 'Business Certificate',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjM2I4MmY2Ii8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CdXNpbmVzczwvdGV4dD4KPHN2Zz4=',
    templateUrl: 'https://example.com/templates/business.pdf',
    elements: [],
    variables: [],
    userId: 'user-1',
    isPublic: true,
    createdAt: new Date('2024-01-16T14:30:00Z'),
  },
  {
    id: 'template-3',
    name: 'Education Certificate',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOGI1Y2Y2Ii8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FZHVjYXRpb248L3RleHQ+Cjwvc3ZnPg==',
    templateUrl: 'https://example.com/templates/education.pdf',
    elements: [],
    variables: [],
    userId: 'user-1',
    isPublic: true,
    createdAt: new Date('2024-01-17T09:15:00Z'),
  },
  {
    id: 'template-4',
    name: 'Training Certificate',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjU5ZTBiIi8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UcmFpbmluZzwvdGV4dD4KPHN2Zz4=',
    templateUrl: 'https://example.com/templates/training.pdf',
    elements: [],
    variables: [],
    userId: 'user-1',
    isPublic: true,
    createdAt: new Date('2024-01-17T16:45:00Z'),
  },
  {
    id: 'template-5',
    name: 'Participation Certificate',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QYXJ0aWNpcGF0aW9uPC90ZXh0Pgo8L3N2Zz4=',
    templateUrl: 'https://example.com/templates/participation.pdf',
    elements: [],
    variables: [],
    userId: 'user-1',
    isPublic: true,
    createdAt: new Date('2024-01-18T11:20:00Z'),
  },
  {
    id: 'template-6',
    name: 'Custom Template',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNmI3MjgwIi8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DdXN0b208L3RleHQ+Cjwvc3ZnPg==',
    templateUrl: 'https://example.com/templates/custom.pdf',
    elements: [],
    variables: [],
    userId: 'user-2',
    isPublic: false,
    createdAt: new Date('2024-01-18T13:30:00Z'),
  },
];

export class MockApiService {
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getPublicTemplates(): Promise<Template[]> {
    await this.delay();
    return mockTemplates.filter(t => t.isPublic);
  }

  static async getUserTemplates(): Promise<Template[]> {
    await this.delay();
    // Return empty array for now, as user templates would be stored separately
    return [];
  }

  static async uploadTemplate(file: File, templateData: any): Promise<Template> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name: templateData.name,
      thumbnail: URL.createObjectURL(file),
      templateUrl: URL.createObjectURL(file),
      elements: [],
      variables: [],
      userId: 'current-user',
      isPublic: templateData.isPublic || false,
      createdAt: new Date(),
    };
    
    return newTemplate;
  }

  static async saveDesign(designData: any, designId?: string): Promise<any> {
    await this.delay();
    
    const design = {
      id: designId || Date.now().toString(),
      name: designData.name || `Design ${new Date().toLocaleDateString()}`,
      elements: designData.elements || [],
      pageCount: designData.pageCount || 1,
      createdAt: designId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Mock: Design saved', design);
    return design;
  }

  static async generateCertificate(designId: string, pageCount: number): Promise<GenerateCertificateResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate points (1 point per page)
    const pointsRequired = pageCount * 1;
    const currentPoints = 100; // Mock user points
    
    if (currentPoints < pointsRequired) {
      throw new InsufficientPointsError(
        `Insufficient points. Required: ${pointsRequired}, Available: ${currentPoints}`,
        pointsRequired,
        currentPoints
      );
    }
    
    // Simulate point deduction
    const remainingPoints = currentPoints - pointsRequired;
    
    return {
      downloadUrl: `https://example.com/certificates/${designId}.pdf`,
      pointsDeducted: pointsRequired,
      remainingPoints: remainingPoints
    };
  }
}

// Note: shouldUseMockApi function has been moved to src/config/api.ts
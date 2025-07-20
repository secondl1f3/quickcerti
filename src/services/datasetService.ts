import { getApiUrl, makeAuthenticatedRequest } from '../config/api';
import { DataRow, Variable } from '../types';

// Types for API responses
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  designId?: string;
  designName?: string;
  userId: string;
  variableCount?: number;
  rowCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
  defaultValue?: string;
  position: number;
}

export interface DatasetRow {
  id: string;
  rowIndex: number;
  data: DataRow;
}

export interface DatasetDetail {
  id: string;
  name: string;
  description?: string;
  designId?: string;
  variables: DatasetVariable[];
  data: DatasetRow[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDatasetRequest {
  name: string;
  description?: string;
  designId?: string;
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
  designId?: string;
}

export interface CreateVariableRequest {
  name: string;
  type: 'text' | 'number' | 'date';
  defaultValue?: string;
  position?: number;
}

export interface UpdateVariableRequest {
  name?: string;
  type?: 'text' | 'number' | 'date';
  defaultValue?: string;
  position?: number;
}

export interface CreateRowRequest {
  data: DataRow;
}

export interface UpdateRowRequest {
  data: DataRow;
}

export interface ImportCsvRequest {
  csvData: string;
  replaceExisting?: boolean;
  createVariables?: boolean;
}

export interface ImportCsvResponse {
  importedRows: number;
  createdVariables: number;
  errors: string[];
}

export interface CompatibleDesign {
  id: string;
  name: string;
  matchingVariables: string[];
  missingVariables: string[];
  compatibilityScore: number;
}

export interface AssociateDesignRequest {
  designId: string;
}

/**
 * Service for managing datasets and their data
 */
export class DatasetService {
  /**
   * Get all datasets for the authenticated user
   */
  static async getDatasets(): Promise<Dataset[]> {
    try {
      const response = await makeAuthenticatedRequest('/datasets');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.statusText}`);
      }
      
      const result = await response.json();
      // Handle both wrapped and direct array responses
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  /**
   * Create a new dataset
   */
  static async createDataset(request: CreateDatasetRequest): Promise<Dataset> {
    try {
      const response = await makeAuthenticatedRequest('/datasets', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create dataset: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw error;
    }
  }

  /**
   * Get a specific dataset with its variables and data
   */
  static async getDataset(id: string): Promise<DatasetDetail> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${id}`);
      console.log("response dataset", response.body)
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Raw API response:', result);
      // The API returns the dataset directly, not nested under 'data'
      return result;
    } catch (error) {
      console.error('Error fetching dataset:', error);
      throw error;
    }
  }

  /**
   * Update dataset information
   */
  static async updateDataset(id: string, request: UpdateDatasetRequest): Promise<Dataset> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update dataset: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating dataset:', error);
      throw error;
    }
  }

  /**
   * Delete a dataset
   */
  static async deleteDataset(id: string): Promise<void> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete dataset: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  }

  /**
   * Add a new variable to a dataset
   */
  static async createVariable(datasetId: string, request: CreateVariableRequest): Promise<DatasetVariable> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/variables`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create variable: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating variable:', error);
      throw error;
    }
  }

  /**
   * Update a variable
   */
  static async updateVariable(
    datasetId: string,
    variableId: string,
    request: UpdateVariableRequest
  ): Promise<DatasetVariable> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/variables/${variableId}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update variable: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating variable:', error);
      throw error;
    }
  }

  /**
   * Delete a variable
   */
  static async deleteVariable(datasetId: string, variableId: string): Promise<void> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/variables/${variableId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete variable: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting variable:', error);
      throw error;
    }
  }

  /**
   * Add a new data row
   */
  static async createRow(datasetId: string, request: CreateRowRequest): Promise<DatasetRow> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/rows`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create row: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating row:', error);
      throw error;
    }
  }

  /**
   * Update a data row
   */
  static async updateRow(
    datasetId: string,
    rowId: string,
    request: UpdateRowRequest
  ): Promise<DatasetRow> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/rows/${rowId}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update row: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating row:', error);
      throw error;
    }
  }

  /**
   * Delete a data row
   */
  static async deleteRow(datasetId: string, rowId: string): Promise<void> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/rows/${rowId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete row: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      throw error;
    }
  }

  /**
   * Import data from CSV
   */
  static async importCsv(datasetId: string, request: ImportCsvRequest): Promise<ImportCsvResponse> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/import-csv`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to import CSV: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }

  /**
   * Export dataset as CSV
   */
  static async exportCsv(datasetId: string): Promise<Blob> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/export-csv`);
      
      if (!response.ok) {
        throw new Error(`Failed to export CSV: ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  /**
   * Get designs that are compatible with this dataset
   */
  static async getCompatibleDesigns(datasetId: string): Promise<CompatibleDesign[]> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/compatible-designs`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch compatible designs: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching compatible designs:', error);
      throw error;
    }
  }

  /**
   * Associate a dataset with a design
   */
  static async associateDesign(datasetId: string, request: AssociateDesignRequest): Promise<void> {
    try {
      const response = await makeAuthenticatedRequest(`/datasets/${datasetId}/associate-design`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to associate design: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error associating design:', error);
      throw error;
    }
  }

  /**
   * Helper method to download CSV file
   */
  static async downloadCsv(datasetId: string, filename?: string): Promise<void> {
    try {
      const blob = await this.exportCsv(datasetId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `dataset-${datasetId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      throw error;
    }
  }

  /**
   * Helper method to parse CSV content
   */
  static parseCsvContent(csvContent: string): { headers: string[]; rows: string[][] } {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    return { headers, rows };
  }

  /**
   * Helper method to convert parsed CSV to DataRow format
   */
  static csvToDataRows(headers: string[], rows: string[][]): DataRow[] {
    return rows.map(row => {
      const dataRow: DataRow = {};
      headers.forEach((header, index) => {
        dataRow[header] = row[index] || '';
      });
      return dataRow;
    });
  }
}

/**
 * Hook for using dataset service with React
 */
export const useDatasetService = () => {
  return {
    getDatasets: DatasetService.getDatasets,
    createDataset: DatasetService.createDataset,
    getDataset: DatasetService.getDataset,
    updateDataset: DatasetService.updateDataset,
    deleteDataset: DatasetService.deleteDataset,
    createVariable: DatasetService.createVariable,
    updateVariable: DatasetService.updateVariable,
    deleteVariable: DatasetService.deleteVariable,
    createRow: DatasetService.createRow,
    updateRow: DatasetService.updateRow,
    deleteRow: DatasetService.deleteRow,
    importCsv: DatasetService.importCsv,
    exportCsv: DatasetService.exportCsv,
    downloadCsv: DatasetService.downloadCsv,
    getCompatibleDesigns: DatasetService.getCompatibleDesigns,
    associateDesign: DatasetService.associateDesign,
    parseCsvContent: DatasetService.parseCsvContent,
    csvToDataRows: DatasetService.csvToDataRows,
  };
};
import { create } from 'zustand';
import { DataRow, Variable } from '../types';
import { 
  DatasetService, 
  Dataset, 
  DatasetVariable, 
  DatasetRow,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  CreateVariableRequest,
  UpdateVariableRequest,
  CreateRowRequest,
  UpdateRowRequest,
  ImportCsvRequest
} from '../services/datasetService';

interface DatasetState {
  // Current state
  datasets: Dataset[];
  currentDataset: Dataset | null;
  loading: boolean;
  error: string | null;

  // Actions for datasets
  loadDatasets: () => Promise<void>;
  createDataset: (request: CreateDatasetRequest) => Promise<void>;
  updateDataset: (datasetId: string, request: UpdateDatasetRequest) => Promise<void>;
  deleteDataset: (datasetId: string) => Promise<void>;
  setCurrentDataset: (dataset: Dataset | null) => void;

  // Actions for variables
  loadVariables: (datasetId: string) => Promise<void>;
  createVariable: (datasetId: string, request: CreateVariableRequest) => Promise<void>;
  updateDatasetVariable: (datasetId: string, variableId: string, request: UpdateVariableRequest) => Promise<void>;
  deleteDatasetVariable: (datasetId: string, variableId: string) => Promise<void>;

  // Data row management
  loadDataRows: (datasetId: string) => Promise<void>;
  createDataRow: (datasetId: string, request: CreateRowRequest) => Promise<void>;
  createDataRowAtIndex: (datasetId: string, request: CreateRowRequest, index: number) => Promise<any>;
  updateDataRow: (datasetId: string, rowId: string, request: UpdateRowRequest) => Promise<void>;
  deleteDataRow: (datasetId: string, rowId: string) => Promise<void>;

  // Bulk operations
  importCsv: (datasetId: string, request: ImportCsvRequest) => Promise<void>;
  exportCsv: (datasetId: string) => Promise<void>;

  // Legacy compatibility methods (for existing components)
  data: DataRow[];
  variables: Variable[];
  setData: (data: DataRow[]) => void;
  addDataRow: (row: DataRow) => void;
  updateDataRowLegacy: (index: number, row: DataRow) => void;
  deleteDataRowLegacy: (index: number) => void;
  setVariables: (variables: Variable[]) => void;
  addVariable: (variable: Variable) => void;
  updateVariable: (index: number, variable: Variable) => void;
  deleteVariable: (index: number) => void;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  // Initial state
  datasets: [],
  currentDataset: null,
  loading: false,
  error: null,
  data: [],
  variables: [],

  // Dataset management actions
  loadDatasets: async () => {
    set({ loading: true, error: null });
    try {
      const datasets = await DatasetService.getDatasets();
      set({ datasets, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch datasets',
        loading: false 
      });
    }
  },

  createDataset: async (request: CreateDatasetRequest) => {
    set({ loading: true, error: null });
    try {
      const dataset = await DatasetService.createDataset(request);
      set((state) => ({ 
        datasets: [...(state.datasets || []), dataset],
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create dataset',
        loading: false 
      });
      throw error;
    }
  },

  updateDataset: async (datasetId: string, request: UpdateDatasetRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedDataset = await DatasetService.updateDataset(datasetId, request);
      set((state) => ({
        datasets: (state.datasets || []).map(d => d.id === datasetId ? updatedDataset : d),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update dataset',
        loading: false 
      });
    }
  },

  deleteDataset: async (datasetId: string) => {
    set({ loading: true, error: null });
    try {
      await DatasetService.deleteDataset(datasetId);
      set((state) => ({
        datasets: (state.datasets || []).filter(d => d.id !== datasetId),
        currentDataset: state.currentDataset?.id === datasetId ? null : state.currentDataset,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete dataset',
        loading: false 
      });
    }
  },

  setCurrentDataset: (dataset: Dataset | null) => {
    set({ 
      currentDataset: dataset
      // Don't clear variables and data here - let the useEffect in components handle loading
    });
  },

  // Actions for variables
  loadVariables: async (datasetId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Loading variables for dataset:', datasetId);
      const dataset = await DatasetService.getDataset(datasetId);
      console.log('Dataset response:', dataset);
      // Convert DatasetVariable[] to Variable[]
      const variables = (dataset.variables || []).map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        defaultValue: v.defaultValue || '',
        position: v.position
      }));
      console.log('Converted variables:', variables);
      set({ variables, loading: false });
    } catch (error) {
      console.error('Error loading variables:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load variables', loading: false });
    }
  },

  createVariable: async (datasetId: string, request: CreateVariableRequest) => {
    set({ loading: true, error: null });
    try {
      const variable = await DatasetService.createVariable(datasetId, request);
      set(state => ({
        variables: [...state.variables, {
          name: variable.name,
          type: variable.type,
          defaultValue: variable.defaultValue || ''
        }],
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create variable', loading: false });
    }
  },

  updateDatasetVariable: async (datasetId: string, variableId: string, request: UpdateVariableRequest) => {
    set({ loading: true, error: null });
    try {
      const variable = await DatasetService.updateVariable(datasetId, variableId, request);
      set(state => ({
        variables: state.variables.map((v, index) => 
          index.toString() === variableId ? {
            name: variable.name,
            type: variable.type,
            defaultValue: variable.defaultValue || ''
          } : v
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update variable', loading: false });
    }
  },

  deleteDatasetVariable: async (datasetId: string, variableId: string) => {
    set({ loading: true, error: null });
    try {
      await DatasetService.deleteVariable(datasetId, variableId);
      set(state => ({
        variables: state.variables.filter((_, index) => index.toString() !== variableId),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete variable', loading: false });
    }
  },

  // Actions for data rows
  loadDataRows: async (datasetId: string) => {
    set({ loading: true, error: null });
    try {
      const dataset = await DatasetService.getDataset(datasetId);
      const data = dataset.data?.map((row: DatasetRow) => ({
        ...row.data,
        id: row.id // Preserve the row ID for API operations
      })) || [];
      set({ data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load data rows', loading: false });
    }
  },

  createDataRow: async (datasetId: string, request: CreateRowRequest) => {
    set({ loading: true, error: null });
    try {
      const row = await DatasetService.createRow(datasetId, request);
      set(state => ({
        data: [...state.data, row.data],
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create row', loading: false });
    }
  },

  createDataRowAtIndex: async (datasetId: string, request: CreateRowRequest, index: number) => {
    try {
      const response = await DatasetService.createRow(datasetId, request);
      // Update the row at the specific index with the new data and ID
      set((state) => {
        const newData = [...state.data];
        newData[index] = {
          ...response.data,
          id: response.id
        };
        return { data: newData };
      });
      return response;
    } catch (error) {
      console.error('Error creating data row at index:', error);
      throw error;
    }
  },

  updateDataRow: async (datasetId: string, rowId: string, request: UpdateRowRequest) => {
    set({ loading: true, error: null });
    try {
      const row = await DatasetService.updateRow(datasetId, rowId, request);
      set(state => ({
        data: state.data.map((r, index) => 
          index.toString() === rowId ? row.data : r
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update row', loading: false });
    }
  },

  deleteDataRow: async (datasetId: string, rowId: string) => {
    set({ loading: true, error: null });
    try {
      await DatasetService.deleteRow(datasetId, rowId);
      set(state => ({
        data: state.data.filter(row => row.id !== rowId),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete row', loading: false });
    }
  },

  // Bulk operations
  importCsv: async (datasetId: string, request: ImportCsvRequest) => {
    set({ loading: true, error: null });
    try {
      await DatasetService.importCsv(datasetId, request);
      // Reload data after import
      const dataset = await DatasetService.getDataset(datasetId);
      const data = dataset.data.map((row: DatasetRow) => row.data);
      set({ data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to import CSV', loading: false });
    }
  },

  exportCsv: async (datasetId: string) => {
    set({ loading: true, error: null });
    try {
      await DatasetService.exportCsv(datasetId);
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to export CSV', loading: false });
    }
  },

  // Legacy compatibility methods (for existing components)
  setData: (data) => set({ data }),
  
  addDataRow: (row) => {
    set(state => ({ data: [...state.data, row] }));
  },

  updateDataRowLegacy: (index, row) => {
    set(state => ({
      data: state.data.map((r, i) => i === index ? row : r)
    }));
  },

  deleteDataRowLegacy: (index) => {
    set(state => ({
      data: state.data.filter((_, i) => i !== index)
    }));
  },

  setVariables: (variables) => set({ variables }),
  
  addVariable: (variable) => {
    set(state => ({ variables: [...state.variables, variable] }));
  },

  updateVariable: (index, variable) => {
    set(state => ({
      variables: state.variables.map((v, i) => i === index ? variable : v)
    }));
  },

  deleteVariable: (index) => {
    set(state => ({
      variables: state.variables.filter((_, i) => i !== index)
    }));
  },


}));

// Export the original useDataStore for backward compatibility
export const useDataStore = useDatasetStore;
import { create } from 'zustand';
import { DataRow, Variable } from '../types';

interface DataState {
  data: DataRow[];
  variables: Variable[];
  
  // Actions
  setData: (data: DataRow[]) => void;
  addDataRow: (row: DataRow) => void;
  updateDataRow: (index: number, row: DataRow) => void;
  deleteDataRow: (index: number) => void;
  setVariables: (variables: Variable[]) => void;
  addVariable: (variable: Variable) => void;
  updateVariable: (index: number, variable: Variable) => void;
  deleteVariable: (index: number) => void;
  importFromCSV: (csvData: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  data: [],
  variables: [],

  setData: (data) => set({ data }),
  
  addDataRow: (row) => {
    set((state) => ({ data: [...state.data, row] }));
  },

  updateDataRow: (index, row) => {
    set((state) => ({
      data: state.data.map((item, i) => i === index ? row : item)
    }));
  },

  deleteDataRow: (index) => {
    set((state) => ({
      data: state.data.filter((_, i) => i !== index)
    }));
  },

  setVariables: (variables) => set({ variables }),
  
  addVariable: (variable) => {
    set((state) => ({ variables: [...state.variables, variable] }));
  },

  updateVariable: (index, variable) => {
    set((state) => ({
      variables: state.variables.map((item, i) => i === index ? variable : item)
    }));
  },

  deleteVariable: (index) => {
    set((state) => ({
      variables: state.variables.filter((_, i) => i !== index)
    }));
  },

  importFromCSV: (csvData) => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: DataRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    const variables = headers.map(header => ({
      name: header,
      type: 'text' as const,
      defaultValue: ''
    }));

    set({ data, variables });
  },
}));
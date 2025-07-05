import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DesignElement } from '../types';

interface DesignState {
  elements: DesignElement[];
  selectedElement: DesignElement | null;
  history: DesignElement[][];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string) => void;
  clearSelection: () => void;
  setElements: (elements: DesignElement[]) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useDesignStore = create<DesignState>()(
  subscribeWithSelector((set, get) => ({
    elements: [],
    selectedElement: null,
    history: [[]],
    historyIndex: 0,
    canUndo: false,
    canRedo: false,

    addElement: (element) => {
      set((state) => {
        const newElements = [...state.elements, element];
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newElements);
        
        return {
          elements: newElements,
          selectedElement: element,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false,
        };
      });
    },

    updateElement: (id, updates) => {
      set((state) => {
        const newElements = state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        );
        
        const selectedElement = state.selectedElement?.id === id 
          ? { ...state.selectedElement, ...updates }
          : state.selectedElement;

        return {
          elements: newElements,
          selectedElement,
        };
      });
    },

    deleteElement: (id) => {
      set((state) => {
        const newElements = state.elements.filter((el) => el.id !== id);
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newElements);

        return {
          elements: newElements,
          selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false,
        };
      });
    },

    selectElement: (id) => {
      set((state) => ({
        selectedElement: state.elements.find((el) => el.id === id) || null,
      }));
    },

    clearSelection: () => {
      set({ selectedElement: null });
    },

    setElements: (elements) => {
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(elements);

        return {
          elements,
          selectedElement: null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false,
        };
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const newElements = state.history[newIndex];
          
          return {
            elements: newElements,
            selectedElement: null,
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true,
          };
        }
        return state;
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const newElements = state.history[newIndex];
          
          return {
            elements: newElements,
            selectedElement: null,
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < state.history.length - 1,
          };
        }
        return state;
      });
    },

    saveToHistory: () => {
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...state.elements]);

        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false,
        };
      });
    },
  }))
);
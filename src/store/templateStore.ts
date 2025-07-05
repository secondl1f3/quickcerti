import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  elements: any[];
  variables: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateState {
  templates: Template[];
  
  // Actions
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  getTemplate: (id: string) => Template | undefined;
  getTemplatesByCategory: (category: string) => Template[];
  searchTemplates: (query: string) => Template[];
  clearAllTemplates: () => void;
  exportTemplates: () => string;
  importTemplates: (data: string) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        console.log('Adding template to store:', template);
        set((state) => {
          const newTemplates = [...state.templates, template];
          console.log('Templates after add:', newTemplates.length);
          return { templates: newTemplates };
        });
      },

      updateTemplate: (id, updates) => {
        console.log('Updating template:', id, updates);
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date() }
              : template
          ),
        }));
      },

      deleteTemplate: (id) => {
        console.log('Deleting template:', id);
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
      },

      duplicateTemplate: (id) => {
        console.log('Duplicating template:', id);
        const template = get().templates.find((t) => t.id === id);
        if (template) {
          const duplicated: Template = {
            ...template,
            id: Date.now().toString(),
            name: `${template.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            templates: [...state.templates, duplicated],
          }));
        }
      },

      getTemplate: (id) => {
        return get().templates.find((template) => template.id === id);
      },

      getTemplatesByCategory: (category) => {
        return get().templates.filter((template) => template.category === category);
      },

      searchTemplates: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().templates.filter(
          (template) =>
            template.name.toLowerCase().includes(lowercaseQuery) ||
            template.description.toLowerCase().includes(lowercaseQuery) ||
            template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      clearAllTemplates: () => {
        console.log('Clearing all templates');
        set({ templates: [] });
      },

      exportTemplates: () => {
        const templates = get().templates;
        return JSON.stringify(templates, null, 2);
      },

      importTemplates: (data) => {
        try {
          const importedTemplates = JSON.parse(data);
          if (Array.isArray(importedTemplates)) {
            set({ templates: importedTemplates });
            console.log('Templates imported successfully:', importedTemplates.length);
          } else {
            throw new Error('Invalid template data format');
          }
        } catch (error) {
          console.error('Error importing templates:', error);
          throw error;
        }
      },
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({ templates: state.templates }),
      onRehydrateStorage: () => (state) => {
        console.log('Template store rehydrated:', state?.templates?.length || 0, 'templates');
      },
    }
  )
);
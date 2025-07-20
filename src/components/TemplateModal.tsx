import React, { useState, useEffect } from 'react';
import { X, Plus, FileText, Save, Download, Search, Filter, Edit, Trash2, Copy, Eye, Upload, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useDatasetStore } from '../store/datasetStore';
import { useTemplateStore } from '../store/templateStore';
import { UploadModal } from './UploadModal';
import { TemplateEditor } from './TemplateEditor';
import { DesignElement } from '../types';
import { useTranslation } from '../i18n/i18nContext';

interface TemplateModalProps {
  onClose: () => void;
  onTemplateSelect?: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ onClose, onTemplateSelect }) => {
  const { elements, setElements } = useDesignStore();
  const { variables } = useDatasetStore();
  const { templates, addTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useTemplateStore();
  const { t } = useTranslation();
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Custom');
  const [templateTags, setTemplateTags] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [debugInfo, setDebugInfo] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const categories = ['All', 'Academic', 'Professional', 'Achievement', 'Custom'];

  // Debug: Log templates when they change
  useEffect(() => {
    console.log('Templates updated:', templates.length, templates);
  }, [templates]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    try {
      const template = {
        id: Date.now().toString(),
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        tags: templateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl: '', // Will be generated from canvas
        elements: [...elements],
        variables: [...variables],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      addTemplate(template);
      setShowSaveForm(false);
      setTemplateName('');
      setTemplateDescription('');
      setTemplateCategory('Custom');
      setTemplateTags('');
      
      console.log('Template saved successfully:', template);
    } catch (error) {
      console.error('Error saving template:', error);
      alert(t('templateSaveError'));
    }
  };

  const createBackgroundImageElement = (imageUrl: string): DesignElement => {
    return {
      id: `background-${Date.now()}`,
      type: 'image',
      position: { x: 0, y: 0 },
      size: { width: 800, height: 600 }, // Full canvas size
      rotation: 0,
      opacity: 1,
      zIndex: 0, // Background layer
      imageUrl: imageUrl,
    };
  };

  const handleLoadTemplate = async (template: any) => {
    setLoadingTemplate(template.id);
    
    try {
      console.log('Loading template:', template);
      
      let elementsToLoad: DesignElement[] = [];
      
      // Check if template has elements
      if (template.elements && Array.isArray(template.elements) && template.elements.length > 0) {
        // Template has design elements - use them
        elementsToLoad = template.elements;
        console.log('Loading template with existing elements:', template.elements.length);
      } else if (template.imageUrl) {
        // Template is an uploaded image without elements - create background image element
        const backgroundElement = createBackgroundImageElement(template.imageUrl);
        elementsToLoad = [backgroundElement];
        console.log('Creating background image element for uploaded template');
      } else {
        // Empty template
        elementsToLoad = [];
        console.log('Loading empty template');
      }
      
      // Load template elements
      setElements(elementsToLoad);
      
      console.log('Template loaded successfully:', elementsToLoad.length, 'elements');
      
      // Navigate to editor after successful load
      setTimeout(() => {
        onTemplateSelect?.();
      }, 500);
      
    } catch (error) {
        console.error('Error loading template:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`${t('templateLoadError')}: ${errorMessage}`);
    } finally {
      setLoadingTemplate(null);
    }
  };

  const handleEditTemplate = (template: any) => {
    console.log('Editing template:', template);
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        deleteTemplate(templateId);
        console.log('Template deleted:', templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
        alert(t('templateDeleteError'));
      }
    }
  };

  const handleDuplicateTemplate = (template: any) => {
    try {
      duplicateTemplate(template.id);
      console.log('Template duplicated:', template.id);
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert(t('templateDuplicateError'));
    }
  };

  const handleRefreshTemplates = () => {
    // Force re-render and log current state
    console.log('Refreshing templates...');
    console.log('Current templates:', templates);
    setDebugInfo(!debugInfo);
  };

  if (showUploadModal) {
    return <UploadModal onClose={() => setShowUploadModal(false)} />;
  }

  if (showTemplateEditor && selectedTemplate) {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onClose={() => {
          setShowTemplateEditor(false);
          setSelectedTemplate(null);
        }}
        onSave={(updatedTemplate) => {
          updateTemplate(selectedTemplate.id, updatedTemplate);
          setShowTemplateEditor(false);
          setSelectedTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">{t('templatesLibrary')}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{t('total')}: {templates.length}</span>
              <span>•</span>
              <span>{t('filtered')}: {filteredTemplates.length}</span>
              <button
                onClick={handleRefreshTemplates}
                className="p-1 hover:bg-gray-100 rounded"
                title={t('refreshTemplates')}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={20} />
              <span>{t('uploadTemplate')}</span>
            </button>
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              <span>{t('saveCurrent')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Save Form */}
        {showSaveForm && (
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Academic">Academic</option>
                  <option value="Professional">Professional</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter template description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  placeholder="e.g., certificate, award, completion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('saveTemplate')}
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false);
                  setTemplateName('');
                  setTemplateDescription('');
                  setTemplateCategory('Custom');
                  setTemplateTags('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchTemplates')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Total templates in store: {templates.length}</p>
              <p>Filtered templates: {filteredTemplates.length}</p>
              <p>Search term: "{searchTerm}"</p>
              <p>Selected category: {selectedCategory}</p>
            </div>
          )}

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {templates.length === 0 ? t('noTemplatesFound') : t('noMatchingTemplates')}
              </h3>
              <p className="text-gray-500 mb-4">
                {templates.length === 0
                  ? t('createFirstTemplate')
                  : searchTerm || selectedCategory !== 'All'
                  ? t('adjustSearchCriteria')
                  : t('noTemplatesMatchFilters')
                }
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('uploadTemplate')}
                </button>
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('saveCurrentDesign')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    {template.imageUrl ? (
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.error('Image load error for template:', template.id);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <FileText size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        title={t('edit')}
                      >
                        <Edit size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        title={t('duplicate')}
                      >
                        <Copy size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                    {loadingTemplate === template.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-sm">{t('loading')}</div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                        {template.category}
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    )}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{template.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {template.elements?.length || 0} elements
                        {template.imageUrl && !template.elements?.length && (
                          <span className="text-blue-600 ml-1">(+ background)</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(template)}
                        disabled={loadingTemplate === template.id}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                      >
                        {loadingTemplate === template.id ? t('loading') : t('useTemplate')}
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {t('created')}: {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
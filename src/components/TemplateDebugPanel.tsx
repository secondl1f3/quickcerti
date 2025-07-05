import React from 'react';
import { useTemplateStore } from '../store/templateStore';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';

interface TemplateDebugPanelProps {
  onClose: () => void;
}

export const TemplateDebugPanel: React.FC<TemplateDebugPanelProps> = ({ onClose }) => {
  const { templates, clearAllTemplates, exportTemplates, importTemplates } = useTemplateStore();

  const handleExport = () => {
    try {
      const data = exportTemplates();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'templates-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export templates');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          importTemplates(data);
          alert('Templates imported successfully');
        } catch (error) {
          alert('Failed to import templates');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL templates? This cannot be undone.')) {
      clearAllTemplates();
    }
  };

  const handleForceRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Template Debug Panel</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Template Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Template Status</h3>
            <div className="space-y-1 text-sm">
              <p>Total templates: <span className="font-mono">{templates.length}</span></p>
              <p>Storage key: <span className="font-mono">template-storage</span></p>
              <p>Last updated: <span className="font-mono">{new Date().toLocaleString()}</span></p>
            </div>
          </div>

          {/* Template List */}
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
            <h3 className="font-medium mb-2">Template List</h3>
            {templates.length === 0 ? (
              <p className="text-gray-500 text-sm">No templates found</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <div key={template.id} className="text-sm p-2 bg-white rounded border">
                    <div className="font-medium">{index + 1}. {template.name}</div>
                    <div className="text-gray-500">
                      ID: {template.id} | Category: {template.category} | Elements: {template.elements?.length || 0}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created: {new Date(template.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExport}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={20} />
              <span>Export Templates</span>
            </button>
            
            <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload size={20} />
              <span>Import Templates</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleForceRefresh}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <RefreshCw size={20} />
              <span>Force Refresh</span>
            </button>
            
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={20} />
              <span>Clear All</span>
            </button>
          </div>

          {/* Local Storage Info */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Troubleshooting Tips</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Templates are stored in browser localStorage</li>
              <li>• Clear browser cache if templates don't appear</li>
              <li>• Export templates before clearing browser data</li>
              <li>• Check browser console for error messages</li>
              <li>• Refresh page if templates don't load properly</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close Debug Panel
          </button>
        </div>
      </div>
    </div>
  );
};
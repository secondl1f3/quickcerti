import React from 'react';
import { ArrowLeft, Save, Download, Eye, Settings, Undo, Redo, FileText } from 'lucide-react';

interface EditorHeaderProps {
  onBack: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onBack,
  onSave,
  onPreview,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  projectName = 'Sertifikat Tanpa Judul',
  onProjectNameChange,
}) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(projectName);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onProjectNameChange?.(tempName.trim());
    } else {
      setTempName(projectName);
    }
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setTempName(projectName);
      setIsEditingName(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Navigation & Project Name */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleKeyPress}
                className="text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-emerald-500 focus:outline-none min-w-0 max-w-xs"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
              >
                {projectName}
              </button>
            )}
          </div>
        </div>

        {/* Center Section - Undo/Redo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Simpan (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Simpan</span>
            </button>
          )}
          
          {onPreview && (
            <button
              onClick={onPreview}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}
          
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
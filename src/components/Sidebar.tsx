import React, { useState } from 'react';
import { 
  MousePointer, 
  Hand, 
  Type, 
  Image, 
  Square, 
  Circle, 
  Minus,
  Database,
  Download,
  Eye,
  Save,
  Undo,
  Redo,
  FileText,
  Upload,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Tool } from '../types';
import { TemplateDebugPanel } from './TemplateDebugPanel';
import { useTranslation } from '../i18n/i18nContext';

interface SidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onDataManager: () => void;
  onGenerate: () => void;
  onTemplates: () => void;
  onPreview: () => void;
  onBackToTemplateSelection: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}



export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onToolChange,
  onDataManager,
  onGenerate,
  onTemplates,
  onPreview,
  onBackToTemplateSelection,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const { t } = useTranslation();

  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: t('select') },
    { id: 'pan' as Tool, icon: Hand, label: t('pan') },
    { id: 'text' as Tool, icon: Type, label: t('text') },
    { id: 'image' as Tool, icon: Image, label: t('image') },
    { id: 'rectangle' as Tool, icon: Square, label: t('rectangle') },
    { id: 'circle' as Tool, icon: Circle, label: t('circle') },
    { id: 'line' as Tool, icon: Minus, label: t('line') },
  ];

  return (
    <>
      <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col">
        {/* Tools */}
        <div className="p-2 space-y-1">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onToolChange(id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative ${
                activeTool === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={label}
            >
              <Icon size={20} />
              <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mx-2 my-2"></div>

        {/* History */}
        <div className="p-2 space-y-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative ${
              canUndo
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title={t('undo')}
          >
            <Undo size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('undo')}
            </span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative ${
              canRedo
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title={t('redo')}
          >
            <Redo size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('redo')}
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Actions */}
        <div className="p-2 space-y-1">
          <button
            onClick={onBackToTemplateSelection}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title="Kembali ke Pilihan Template"
          >
            <ArrowLeft size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Kembali ke Pilihan Template
            </span>
          </button>

          <button
            onClick={onTemplates}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title={t('templatesUpload')}
          >
            <FileText size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('templatesUpload')}
            </span>
          </button>

          <button
            onClick={onDataManager}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title={t('dataManager')}
          >
            <Database size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('dataManager')}
            </span>
          </button>

          <button
            onClick={onPreview}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title={t('preview')}
          >
            <Eye size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('preview')}
            </span>
          </button>

          <button
            onClick={() => setShowDebugPanel(true)}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title={t('debugTemplates')}
          >
            <Settings size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('debugTemplates')}
            </span>
          </button>

          <button
            onClick={onGenerate}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-600 text-white hover:bg-green-700 transition-colors group relative"
            title={t('generate')}
          >
            <Download size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('generate')}
            </span>
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <TemplateDebugPanel onClose={() => setShowDebugPanel(false)} />
      )}
    </>
  );
};
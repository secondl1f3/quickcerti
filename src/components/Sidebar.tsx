import React from 'react';
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
  Undo,
  Redo,
  ArrowLeft
} from 'lucide-react';
import { Tool } from '../types';
import { useTranslation } from '../i18n/i18nContext';

interface SidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onDataManager: () => void;
  onGenerate: () => void;
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
  onBackToTemplateSelection,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
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
          {tools.map(({ id, icon: Icon, label }) => {
            const isActive = activeTool === id;
            const isCreationTool = !['select', 'pan'].includes(id);
            
            return (
              <button
                key={id}
                onClick={() => onToolChange(id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${
                  isActive
                    ? isCreationTool
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-opacity-50'
                      : 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={label}
              >
                <Icon size={20} />
                {isActive && isCreationTool && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className={`absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap ${
                  isActive && isCreationTool ? 'bg-blue-700' : ''
                }`}>
                  {label}
                   {isActive && isCreationTool && (
                     <div className="text-xs text-blue-200 mt-1">
                       {t('clickOnCanvasToAdd')}
                     </div>
                   )}
                </span>
              </button>
            );
          })}
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

        {/* Divider */}
        <div className="border-t border-slate-700 mx-2 my-2"></div>

        {/* Data Management */}
        <div className="p-2 space-y-1">
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
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Actions */}
        {/* <div className="p-2 space-y-1">
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
            onClick={onGenerate}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-600 text-white hover:bg-green-700 transition-colors group relative"
            title={t('generate')}
          >
            <Download size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              {t('generate')}
            </span>
          </button>
        </div> */}
      </div>


    </>
  );
};
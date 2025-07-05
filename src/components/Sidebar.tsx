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
  Settings
} from 'lucide-react';
import { Tool } from '../types';
import { TemplateDebugPanel } from './TemplateDebugPanel';

interface SidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onDataManager: () => void;
  onGenerate: () => void;
  onTemplates: () => void;
  onPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const tools = [
  { id: 'select' as Tool, icon: MousePointer, label: 'Select' },
  { id: 'pan' as Tool, icon: Hand, label: 'Pan' },
  { id: 'text' as Tool, icon: Type, label: 'Text' },
  { id: 'image' as Tool, icon: Image, label: 'Image' },
  { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
  { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
  { id: 'line' as Tool, icon: Minus, label: 'Line' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onToolChange,
  onDataManager,
  onGenerate,
  onTemplates,
  onPreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

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
            title="Undo"
          >
            <Undo size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Undo
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
            title="Redo"
          >
            <Redo size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Redo
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Actions */}
        <div className="p-2 space-y-1">
          <button
            onClick={onTemplates}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title="Templates & Upload"
          >
            <FileText size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Templates & Upload
            </span>
          </button>

          <button
            onClick={onDataManager}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title="Data Manager"
          >
            <Database size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Data Manager
            </span>
          </button>

          <button
            onClick={onPreview}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title="Preview"
          >
            <Eye size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Preview
            </span>
          </button>

          <button
            onClick={() => setShowDebugPanel(true)}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
            title="Debug Templates"
          >
            <Settings size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Debug Templates
            </span>
          </button>

          <button
            onClick={onGenerate}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-600 text-white hover:bg-green-700 transition-colors group relative"
            title="Generate"
          >
            <Download size={20} />
            <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Generate
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
import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { DataManager } from './components/DataManager';
import { GenerateModal } from './components/GenerateModal';
import { TemplateModal } from './components/TemplateModal';
import { PreviewModal } from './components/PreviewModal';
import { useDesignStore } from './store/designStore';
import { useDataStore } from './store/dataStore';
import { DesignElement, Tool } from './types';

function App() {
  const [showDataManager, setShowDataManager] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  
  const { 
    selectedElement, 
    elements, 
    addElement, 
    updateElement, 
    deleteElement,
    selectElement,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDesignStore();
  
  const { data, variables } = useDataStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'select') {
      clearSelection();
    }
  }, [activeTool, clearSelection]);

  const handleElementClick = useCallback((element: DesignElement, e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  }, [selectElement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          e.preventDefault();
          break;
        case 'y':
          redo();
          e.preventDefault();
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedElement) {
            deleteElement(selectedElement.id);
          }
          e.preventDefault();
          break;
      }
    }
  }, [undo, redo, selectedElement, deleteElement]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onDataManager={() => setShowDataManager(true)}
        onGenerate={() => setShowGenerateModal(true)}
        onTemplates={() => setShowTemplateModal(true)}
        onPreview={() => setShowPreviewModal(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Certificate Designer</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Variables: {variables.length}
                </span>
                <span className="text-sm text-gray-500">
                  Data Rows: {data.length}
                </span>
              </div>
            </div>
          </div>
          
          <Canvas 
            ref={canvasRef}
            activeTool={activeTool}
            elements={elements}
            selectedElement={selectedElement}
            onCanvasClick={handleCanvasClick}
            onElementClick={handleElementClick}
            onElementUpdate={updateElement}
            onElementAdd={addElement}
          />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel 
          selectedElement={selectedElement}
          onElementUpdate={updateElement}
          variables={variables}
        />
      </div>

      {/* Modals */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
      
      {showGenerateModal && (
        <GenerateModal onClose={() => setShowGenerateModal(false)} />
      )}
      
      {showTemplateModal && (
        <TemplateModal onClose={() => setShowTemplateModal(false)} />
      )}
      
      {showPreviewModal && (
        <PreviewModal onClose={() => setShowPreviewModal(false)} />
      )}
    </div>
  );
}

export default App;
import React, { useState, useRef, useCallback } from 'react';
import { X, Save, Undo, Redo, Type, Square, Circle, Minus, MousePointer } from 'lucide-react';
import { DesignElement } from '../types';

interface TemplateEditorProps {
  template: any;
  onClose: () => void;
  onSave: (template: any) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onClose,
  onSave,
}) => {
  const [elements, setElements] = useState<DesignElement[]>(template.elements || []);
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'rectangle' | 'circle' | 'line'>('select');
  const [templateName, setTemplateName] = useState(template.name);
  const [templateDescription, setTemplateDescription] = useState(template.description);
  const [history, setHistory] = useState<DesignElement[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const saveToHistory = useCallback((newElements: DesignElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addElement = useCallback((element: DesignElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(element);
  }, [elements, saveToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  }, [elements, selectedElement]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    saveToHistory(newElements);
    
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  }, [elements, selectedElement, saveToHistory]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'select') {
      setSelectedElement(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newElement: DesignElement;

    switch (activeTool) {
      case 'text':
        newElement = {
          id: Date.now().toString(),
          type: 'text',
          position: { x, y },
          size: { width: 200, height: 40 },
          rotation: 0,
          opacity: 1,
          zIndex: elements.length,
          text: 'Editable Text',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#000000',
            textAlign: 'left',
          },
        };
        break;
      case 'rectangle':
        newElement = {
          id: Date.now().toString(),
          type: 'rectangle',
          position: { x, y },
          size: { width: 100, height: 60 },
          rotation: 0,
          opacity: 1,
          zIndex: elements.length,
          backgroundColor: '#f3f4f6',
          borderStyle: {
            width: 1,
            color: '#d1d5db',
            style: 'solid',
          },
        };
        break;
      case 'circle':
        newElement = {
          id: Date.now().toString(),
          type: 'circle',
          position: { x, y },
          size: { width: 80, height: 80 },
          rotation: 0,
          opacity: 1,
          zIndex: elements.length,
          backgroundColor: '#f3f4f6',
          borderStyle: {
            width: 1,
            color: '#d1d5db',
            style: 'solid',
          },
        };
        break;
      case 'line':
        newElement = {
          id: Date.now().toString(),
          type: 'line',
          position: { x, y },
          size: { width: 100, height: 2 },
          rotation: 0,
          opacity: 1,
          zIndex: elements.length,
          lineStyle: {
            color: '#000000',
            width: 2,
            style: 'solid',
          },
        };
        break;
      default:
        return;
    }

    addElement(newElement);
  }, [activeTool, elements.length, addElement]);

  const handleElementClick = useCallback((element: DesignElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(element);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setElements(history[newIndex]);
      setHistoryIndex(newIndex);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setElements(history[newIndex]);
      setHistoryIndex(newIndex);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      name: templateName,
      description: templateDescription,
      elements,
      updatedAt: new Date(),
    };
    onSave(updatedTemplate);
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none"
              placeholder="Template name"
            />
            <input
              type="text"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="text-sm text-gray-600 bg-transparent border-none outline-none mt-1 w-full"
              placeholder="Template description"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Undo"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Redo"
            >
              <Redo size={20} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="w-16 bg-gray-50 border-r flex flex-col p-2 space-y-1">
            {tools.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTool(id as any)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative ${
                  activeTool === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title={label}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white shadow-lg cursor-crosshair"
                style={{
                  width: 800,
                  height: 600,
                }}
                onClick={handleCanvasClick}
              >
                {/* Background Image */}
                {template.imageUrl && (
                  <img
                    src={template.imageUrl}
                    alt="Template background"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                )}

                {/* Elements */}
                {elements
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-pointer ${
                        selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: element.position.x,
                        top: element.position.y,
                        width: element.size.width,
                        height: element.size.height,
                        transform: `rotate(${element.rotation}deg)`,
                        opacity: element.opacity,
                        zIndex: element.zIndex,
                      }}
                      onClick={(e) => handleElementClick(element, e)}
                    >
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full flex items-center"
                          style={{
                            fontFamily: element.textStyle?.fontFamily,
                            fontSize: element.textStyle?.fontSize,
                            fontWeight: element.textStyle?.fontWeight,
                            color: element.textStyle?.color,
                            textAlign: element.textStyle?.textAlign,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            border: '1px dashed #3b82f6',
                            padding: '4px',
                          }}
                        >
                          {element.text}
                        </div>
                      )}
                      {element.type === 'rectangle' && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: element.backgroundColor || 'rgba(255, 255, 255, 0.8)',
                            border: element.borderStyle
                              ? `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}`
                              : '1px dashed #3b82f6',
                          }}
                        />
                      )}
                      {element.type === 'circle' && (
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            backgroundColor: element.backgroundColor || 'rgba(255, 255, 255, 0.8)',
                            border: element.borderStyle
                              ? `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}`
                              : '1px dashed #3b82f6',
                          }}
                        />
                      )}
                      {element.type === 'line' && (
                        <div
                          className="w-full"
                          style={{
                            height: element.lineStyle?.width || 1,
                            backgroundColor: element.lineStyle?.color || '#3b82f6',
                            marginTop: '50%',
                          }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-white border-l p-6 overflow-y-auto">
            {selectedElement ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {selectedElement.type} Properties
                  </h3>
                </div>

                {/* Position & Size */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Position & Size</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.position.x)}
                        onChange={(e) => updateElement(selectedElement.id, {
                          position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.position.y)}
                        onChange={(e) => updateElement(selectedElement.id, {
                          position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Width</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.size.width)}
                        onChange={(e) => updateElement(selectedElement.id, {
                          size: { ...selectedElement.size, width: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Height</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.size.height)}
                        onChange={(e) => updateElement(selectedElement.id, {
                          size: { ...selectedElement.size, height: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Properties */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Text Properties</h4>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Text</label>
                      <textarea
                        value={selectedElement.text || ''}
                        onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Font Size</label>
                      <input
                        type="number"
                        value={selectedElement.textStyle?.fontSize || 16}
                        onChange={(e) => updateElement(selectedElement.id, {
                          textStyle: { fontFamily: 'Arial', fontSize: 16, ...selectedElement.textStyle, fontSize: parseInt(e.target.value) || 16 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.textStyle?.color || '#000000'}
                        onChange={(e) => updateElement(selectedElement.id, {
                          textStyle: { fontFamily: 'Arial', fontSize: 16, ...selectedElement.textStyle, color: e.target.value }
                        })}
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Element
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Select an element to edit properties</p>
                <p className="text-sm mt-2">Or use the tools to add new elements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
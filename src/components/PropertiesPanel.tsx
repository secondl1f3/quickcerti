import React from 'react';
import { DesignElement, Variable } from '../types';
import { X, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
  variables: Variable[];
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onElementUpdate,
  variables,
}) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>Select an element to edit properties</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<DesignElement>) => {
    onElementUpdate(selectedElement.id, updates);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Element Type */}
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
                onChange={(e) => handleUpdate({
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
                onChange={(e) => handleUpdate({
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
                onChange={(e) => handleUpdate({
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
                onChange={(e) => handleUpdate({
                  size: { ...selectedElement.size, height: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Rotation (deg)</label>
            <input
              type="number"
              value={selectedElement.rotation}
              onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedElement.opacity}
              onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(selectedElement.opacity * 100)}%
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
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Font Family</label>
              <select
                value={selectedElement.textStyle?.fontFamily || 'Arial'}
                onChange={(e) => handleUpdate({
                  textStyle: { 
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fontWeight: 'normal',
                    color: '#000000',
                    textAlign: 'left',
                    ...selectedElement.textStyle, 
                    fontFamily: e.target.value 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Font Size</label>
              <input
                type="number"
                value={selectedElement.textStyle?.fontSize || 16}
                onChange={(e) => handleUpdate({
                  textStyle: { 
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fontWeight: 'normal',
                    color: '#000000',
                    textAlign: 'left',
                    ...selectedElement.textStyle, 
                    fontSize: parseInt(e.target.value) || 16 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Color</label>
              <input
                type="color"
                value={selectedElement.textStyle?.color || '#000000'}
                onChange={(e) => handleUpdate({
                  textStyle: { 
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fontWeight: 'normal',
                    color: '#000000',
                    textAlign: 'left',
                    ...selectedElement.textStyle, 
                    color: e.target.value 
                  }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Text Align</label>
              <div className="flex space-x-1">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleUpdate({
                      textStyle: { 
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fontWeight: 'normal',
                        color: '#000000',
                        textAlign: 'left',
                        ...selectedElement.textStyle, 
                        textAlign: align as any 
                      }
                    })}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      selectedElement.textStyle?.textAlign === align
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'left' && <AlignLeft size={16} />}
                    {align === 'center' && <AlignCenter size={16} />}
                    {align === 'right' && <AlignRight size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Vertical Align</label>
              <div className="flex space-x-1">
                {['top', 'center', 'bottom'].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleUpdate({
                      textStyle: { 
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fontWeight: 'normal',
                        color: '#000000',
                        textAlign: 'left',
                        ...selectedElement.textStyle, 
                        verticalAlign: align as any 
                      }
                    })}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      selectedElement.textStyle?.verticalAlign === align
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'top' && <AlignVerticalJustifyStart size={16} />}
                    {align === 'center' && <AlignVerticalJustifyCenter size={16} />}
                    {align === 'bottom' && <AlignVerticalJustifyEnd size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Font Weight</label>
              <select
                value={selectedElement.textStyle?.fontWeight || 'normal'}
                onChange={(e) => handleUpdate({
                  textStyle: { 
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fontWeight: 'normal',
                    color: '#000000',
                    textAlign: 'left',
                    ...selectedElement.textStyle, 
                    fontWeight: e.target.value 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>

            {/* Variable Assignment */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Variable</label>
              <select
                value={selectedElement.variableName || ''}
                onChange={(e) => handleUpdate({
                  isVariable: !!e.target.value,
                  variableName: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">No variable</option>
                {variables.map((variable) => (
                  <option key={variable.name} value={variable.name}>
                    {variable.name}
                  </option>
                ))}
              </select>
              {selectedElement.isVariable && (
                <p className="text-xs text-blue-600 mt-1">
                  This text will be replaced with variable data
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Shape Properties</h4>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Background Color</label>
              <input
                type="color"
                value={selectedElement.backgroundColor || '#ffffff'}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Border Color</label>
              <input
                type="color"
                value={selectedElement.borderStyle?.color || '#000000'}
                onChange={(e) => handleUpdate({
                  borderStyle: { ...selectedElement.borderStyle, color: e.target.value, width: selectedElement.borderStyle?.width || 1, style: selectedElement.borderStyle?.style || 'solid' }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Border Width</label>
              <input
                type="number"
                value={selectedElement.borderStyle?.width || 0}
                onChange={(e) => handleUpdate({
                  borderStyle: { ...selectedElement.borderStyle, width: parseInt(e.target.value) || 0, color: selectedElement.borderStyle?.color || '#000000', style: selectedElement.borderStyle?.style || 'solid' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {/* Line Properties */}
        {selectedElement.type === 'line' && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Line Properties</h4>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Color</label>
              <input
                type="color"
                value={selectedElement.lineStyle?.color || '#000000'}
                onChange={(e) => handleUpdate({
                  lineStyle: { ...selectedElement.lineStyle, color: e.target.value, width: selectedElement.lineStyle?.width || 1, style: selectedElement.lineStyle?.style || 'solid' }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={selectedElement.lineStyle?.width || 1}
                onChange={(e) => handleUpdate({
                  lineStyle: { ...selectedElement.lineStyle, width: parseInt(e.target.value) || 1, color: selectedElement.lineStyle?.color || '#000000', style: selectedElement.lineStyle?.style || 'solid' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Style</label>
              <select
                value={selectedElement.lineStyle?.style || 'solid'}
                onChange={(e) => handleUpdate({
                  lineStyle: { ...selectedElement.lineStyle, style: e.target.value as any, color: selectedElement.lineStyle?.color || '#000000', width: selectedElement.lineStyle?.width || 1 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
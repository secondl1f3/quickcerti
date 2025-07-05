import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useDataStore } from '../store/dataStore';

interface PreviewModalProps {
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ onClose }) => {
  const { elements } = useDesignStore();
  const { data, variables } = useDataStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderPreview = (dataRow: any) => {
    return elements.map((element) => {
      if (element.type === 'text') {
        let text = element.text || '';
        
        // Replace variables with actual data
        if (element.isVariable && element.variableName && dataRow[element.variableName] !== undefined && dataRow[element.variableName] !== null) {
          text = dataRow[element.variableName].toString();
        } else {
          // Replace {{VARIABLE}} placeholders
          variables.forEach((variable) => {
            const placeholder = `{{${variable.name}}}`;
            if (text.includes(placeholder) && dataRow[variable.name] !== undefined && dataRow[variable.name] !== null) {
              text = text.replace(new RegExp(placeholder, 'g'), dataRow[variable.name].toString());
            }
          });
        }

        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              transform: `rotate(${element.rotation}deg)`,
              opacity: element.opacity,
              zIndex: element.zIndex,
              display: 'flex',
              alignItems: element.textStyle?.verticalAlign === 'top' ? 'flex-start' :
                         element.textStyle?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
              justifyContent: element.textStyle?.textAlign === 'center' ? 'center' : 
                           element.textStyle?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontFamily: element.textStyle?.fontFamily,
                fontSize: element.textStyle?.fontSize,
                fontWeight: element.textStyle?.fontWeight,
                color: element.textStyle?.color,
                textAlign: element.textStyle?.textAlign,
                width: '100%',
                display: 'block',
              }}
            >
              {text}
            </span>
          </div>
        );
      }

      // Render other element types
      if (element.type === 'image') {
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              transform: `rotate(${element.rotation}deg)`,
              opacity: element.opacity,
              zIndex: element.zIndex,
            }}
          >
            {element.imageUrl && (
              <img
                src={element.imageUrl}
                alt="Template element"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
          </div>
        );
      }

      if (element.type === 'line') {
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.lineStyle?.width || 1,
              transform: `rotate(${element.rotation}deg)`,
              opacity: element.opacity,
              zIndex: element.zIndex,
              backgroundColor: element.lineStyle?.color || '#000000',
              borderStyle: element.lineStyle?.style || 'solid',
            }}
          />
        );
      }

      // Render rectangle and circle elements
      return (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: element.position.x,
            top: element.position.y,
            width: element.size.width,
            height: element.size.height,
            transform: `rotate(${element.rotation}deg)`,
            opacity: element.opacity,
            zIndex: element.zIndex,
            backgroundColor: element.backgroundColor,
            border: element.borderStyle ? 
              `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}` : 
              'none',
            borderRadius: element.type === 'circle' ? '50%' : '0',
          }}
        />
      );
    });
  };

  const nextPreview = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const prevPreview = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  if (data.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Preview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No data available for preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Preview</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {data.length}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPreview}
                disabled={data.length <= 1}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextPreview}
                disabled={data.length <= 1}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="flex justify-center">
            <div
              className="relative bg-white shadow-lg"
              style={{
                width: 800,
                height: 600,
              }}
            >
              {renderPreview(data[currentIndex])}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
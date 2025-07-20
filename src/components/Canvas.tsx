import React, { useState, useCallback, useRef, forwardRef, useEffect } from 'react';
import { DesignElement, Tool } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { Grid } from './Grid';
import { useTranslation } from '../i18n/i18nContext';

interface CanvasProps {
  activeTool: Tool;
  elements: DesignElement[];
  selectedElement: DesignElement | null;
  onCanvasClick: (e: React.MouseEvent) => void;
  onElementClick: (element: DesignElement, e: React.MouseEvent) => void;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onElementAdd: (element: DesignElement) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  activeTool,
  elements,
  selectedElement,
  onCanvasClick,
  onElementClick,
  onElementUpdate,
  onElementAdd,
}, ref) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (activeTool !== 'select') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        
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
              text: 'New Text',
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
              size: { width: 100, height: 100 },
              rotation: 0,
              opacity: 1,
              zIndex: elements.length,
              backgroundColor: 'transparent',
              borderStyle: {
                width: 2,
                color: '#000000',
                style: 'solid',
              },
            };
            break;
            
          case 'circle':
            newElement = {
              id: Date.now().toString(),
              type: 'circle',
              position: { x, y },
              size: { width: 100, height: 100 },
              rotation: 0,
              opacity: 1,
              zIndex: elements.length,
              backgroundColor: 'transparent',
              borderStyle: {
                width: 2,
                color: '#000000',
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
                width: 2,
                color: '#000000',
                style: 'solid',
              },
            };
            break;
            
          case 'image':
            newElement = {
              id: Date.now().toString(),
              type: 'image',
              position: { x, y },
              size: { width: 150, height: 150 },
              rotation: 0,
              opacity: 1,
              zIndex: elements.length,
              imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjYyLjUiIHk9IjYwIiB3aWR0aD0iMjUiIGhlaWdodD0iMzAiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSI3NSIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pgo8L3N2Zz4=',
            };
            break;
            
          default:
            return;
        }
        
        onElementAdd(newElement);
      }
    }
  }, [activeTool, zoom, pan, elements.length, onElementAdd]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && activeTool === 'pan') {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, activeTool, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  const { t } = useTranslation();

  // Calculate canvas size based on background image or use default
  const getCanvasSize = () => {
    const backgroundElement = elements.find(el => el.zIndex === 0 && el.type === 'image');
    if (backgroundElement) {
      return {
        width: backgroundElement.size.width,
        height: backgroundElement.size.height
      };
    }
    return { width: 800, height: 600 }; // Default size
  };

  const canvasSize = getCanvasSize();

  const getToolInstruction = () => {
    switch (activeTool) {
      case 'text':
        return t('clickToAddText');
      case 'rectangle':
        return t('clickToAddRectangle');
      case 'circle':
        return t('clickToAddCircle');
      case 'line':
        return t('clickToAddLine');
      case 'image':
        return t('clickToAddImage');
      case 'select':
        return t('clickToSelect');
      case 'pan':
        return t('clickAndDragToPan');
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 bg-gray-100 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md px-3 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Zoom:</span>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(1)}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tool instruction overlay */}
      {activeTool !== 'select' && activeTool !== 'pan' && (
        <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white rounded-lg shadow-md px-4 py-2 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{getToolInstruction()}</span>
          </div>
        </div>
      )}

      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}

        onClick={onCanvasClick}
        style={{
          cursor: activeTool === 'pan' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair'
        }}
      >
        <div
          className={`relative bg-white shadow-lg transition-all duration-200 ${
            activeTool !== 'select' && activeTool !== 'pan' 
              ? 'ring-2 ring-blue-300 ring-opacity-50' 
              : ''
          }`}
          style={{
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            margin: '100px auto',
          }}
        >
          <Grid zoom={zoom} />
          
          {elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                zoom={zoom}
                onClick={(e) => onElementClick(element, e)}
                onUpdate={(updates) => onElementUpdate(element.id, updates)}
              />
            ))}
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
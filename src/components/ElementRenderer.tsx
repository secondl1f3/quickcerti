import React, { useState, useRef, useEffect } from 'react';
import { DesignElement } from '../types';
import { useDesignStore } from '../store/designStore';

interface ElementRendererProps {
  element: DesignElement;
  isSelected: boolean;
  zoom: number;
  onClick: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<DesignElement>) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  zoom,
  onClick,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingVariable, setIsEditingVariable] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const variableRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Handle double-click for text editing BEFORE calling onClick
    if (element.type === 'text' && e.detail === 2) {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + double-click to edit variable name
        setIsEditingVariable(true);
      } else {
        // Regular double-click to edit text
        setIsEditing(true);
      }
      return;
    }
    
    onClick(e);
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x * zoom,
      y: e.clientY - element.position.y * zoom,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (element.type === 'text' && isSelected) {
      e.preventDefault();
      setIsEditingVariable(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      
      onUpdate({
        position: { x: newX, y: newY },
      });
    } else if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = element.position.x;
      let newY = element.position.y;
      
      switch (resizeHandle) {
        case 'top-left':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = element.position.x + (resizeStart.width - newWidth);
          newY = element.position.y + (resizeStart.height - newHeight);
          break;
        case 'top-right':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = element.position.y + (resizeStart.height - newHeight);
          break;
        case 'bottom-left':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          newX = element.position.x + (resizeStart.width - newWidth);
          break;
        case 'bottom-right':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
      }
      
      onUpdate({
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
    });
  };

  const handleTextSubmit = () => {
    if (textRef.current) {
      onUpdate({ text: textRef.current.value });
    }
    setIsEditing(false);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleVariableSubmit = () => {
    if (variableRef.current) {
      const variableName = variableRef.current.value.trim();
      onUpdate({ 
        variableName: variableName || undefined,
        isVariable: !!variableName 
      });
    }
    setIsEditingVariable(false);
  };

  const handleVariableKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVariableSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingVariable(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
    console.error('Failed to load file:', element.imageUrl);
  };



  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, zoom]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      textRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditingVariable && variableRef.current) {
      variableRef.current.focus();
      variableRef.current.select();
    }
  }, [isEditingVariable]);

  // Reset image state when imageUrl changes
  useEffect(() => {
    if (element.type === 'image' && element.imageUrl) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [element.imageUrl]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.position.x * zoom,
    top: element.position.y * zoom,
    width: element.size.width * zoom,
    height: element.size.height * zoom,
    transform: `rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    zIndex: element.zIndex,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const borderStyle = isSelected ? {
    border: '2px solid #3b82f6',
    borderRadius: '2px',
  } : {};

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        if (isEditing) {
          return (
            <textarea
              ref={textRef}
              value={element.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              onBlur={handleTextSubmit}
              onKeyDown={handleTextKeyDown}
              className="w-full h-full resize-none border-none outline-none bg-transparent"
              style={{
                fontSize: (element.textStyle?.fontSize || 16) * zoom,
                fontWeight: element.textStyle?.fontWeight || 'normal',
                color: element.textStyle?.color || '#000000',
                fontFamily: element.textStyle?.fontFamily || 'Arial',
                textAlign: element.textStyle?.textAlign || 'left',
                lineHeight: element.textStyle?.lineHeight || 1.2,
              }}
            />
          );
        }
        
        if (isEditingVariable) {
          return (
            <input
              ref={variableRef}
              type="text"
              value={element.variableName || ''}
              onChange={(e) => onUpdate({ variableName: e.target.value })}
              onBlur={handleVariableSubmit}
              onKeyDown={handleVariableKeyDown}
              placeholder="Variable name"
              className="w-full h-full border-none outline-none bg-yellow-50 px-1"
              style={{
                fontSize: (element.textStyle?.fontSize || 16) * zoom,
                fontFamily: element.textStyle?.fontFamily || 'Arial',
              }}
            />
          );
        }
        
        return (
          <div
            className="w-full h-full flex"
            style={{
              justifyContent: element.textStyle?.textAlign === 'center' ? 'center' : 
                           element.textStyle?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              alignItems: element.textStyle?.verticalAlign === 'top' ? 'flex-start' :
                         element.textStyle?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            }}
          >
            <span
              className="select-text"
              style={{
                fontFamily: element.textStyle?.fontFamily,
                fontSize: (element.textStyle?.fontSize || 16) * zoom,
                fontWeight: element.textStyle?.fontWeight,
                color: element.textStyle?.color,
                lineHeight: element.textStyle?.lineHeight || 1.2,
                textAlign: element.textStyle?.textAlign,
                width: '100%',
                display: 'block',
              }}
            >
              {element.isVariable && element.variableName ? (
                <span className="text-blue-600 font-medium">
                  {`{{${element.variableName}}}`}
                </span>
              ) : (
                element.text || 'Text'
              )}
            </span>
          </div>
        );

      case 'image':
        if (!element.imageUrl) {
          return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              No Image
            </div>
          );
        }

        if (imageError) {
          return (
            <div className="w-full h-full bg-red-100 border-2 border-red-300 border-dashed flex items-center justify-center text-red-600 text-sm">
              <div className="text-center">
                <div>File Load Error</div>
                <div className="text-xs mt-1">Check file URL</div>
              </div>
            </div>
          );
        }

        return (
          <div className="w-full h-full relative">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                Loading...
              </div>
            )}
            <img
              src={element.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            />
          </div>
        );

      case 'rectangle':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.backgroundColor,
              border: element.borderStyle ? 
                `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}` : 
                'none',
            }}
          />
        );

      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: element.backgroundColor,
              border: element.borderStyle ? 
                `${element.borderStyle.width}px ${element.borderStyle.style} ${element.borderStyle.color}` : 
                'none',
            }}
          />
        );

      case 'line':
        return (
          <div
            className="w-full"
            style={{
              height: (element.lineStyle?.width || 1) * zoom,
              backgroundColor: element.lineStyle?.color || '#000',
              borderStyle: element.lineStyle?.style || 'solid',
              marginTop: '50%',
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      style={{ ...style, ...borderStyle }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className={`${element.type === 'text' ? 'select-text' : 'select-none'} ${element.isVariable ? 'bg-yellow-100 border-yellow-300' : ''}`}
    >
      {renderElement()}
      
      {isSelected && !isEditing && (
        <>
          {/* Resize handles */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
          ></div>
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
          ></div>
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
          ></div>
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
          ></div>
          
          {/* Variable editing hint for text elements */}
          {element.type === 'text' && (
            <div
              className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
              style={{ top: -35, left: 0, whiteSpace: 'nowrap' }}
            >
              Double-click: Edit text | Right-click: Edit variable | Ctrl+Double-click: Edit variable
            </div>
          )}
        </>
      )}
    </div>
  );
};
import React, { useRef, useEffect, useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { ChevronDown, ChevronUp, X, Maximize2, Minimize2 } from 'lucide-react';

interface OutputPanelProps {
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function OutputPanel({
  initialHeight = 250,
  minHeight = 50,
  maxHeight = 600,
  initialWidth = 500,
  minWidth = 200,
  maxWidth = 1000
}: OutputPanelProps) {
  const outputMessages = useCircuitStore((state) => state.outputMessages);
  const clearOutputMessages = useCircuitStore((state) => state.clearOutputMessages);

  const [height, setHeight] = useState(initialHeight);
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const lastHeight = useRef(initialHeight);
  const lastWidth = useRef(initialWidth);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages are added
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputMessages]);

  // Handle mouse events for resizing height
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
          lastHeight.current = newHeight;
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight]);

  // Handle mouse events for resizing width
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingWidth) {
        const newWidth = e.clientX;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
          lastWidth.current = newWidth;
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
    };

    if (isResizingWidth) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingWidth, minWidth, maxWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleWidthResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingWidth(true);
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      setHeight(lastHeight.current);
      setIsCollapsed(false);
    } else {
      lastHeight.current = height;
      setHeight(30); // Header height
      setIsCollapsed(true);
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setHeight(lastHeight.current);
      setWidth(lastWidth.current);
      setIsMaximized(false);
    } else {
      lastHeight.current = height;
      lastWidth.current = width;
      setHeight(maxHeight);
      setWidth(maxWidth);
      setIsMaximized(true);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 bg-white border-t border-r border-gray-200 shadow-lg z-10 rounded-tr-md"
      style={{
        height: `${height}px`,
        width: `${width}px`
      }}
    >
      {/* Resize handle for height */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gray-200 cursor-ns-resize"
        onMouseDown={handleMouseDown}
      />

      {/* Resize handle for width */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1 bg-gray-200 cursor-ew-resize"
        onMouseDown={handleWidthResizeStart}
      />

      {/* Header */}
      <div className="px-4 py-1 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Output Console</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearOutputMessages}
            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-colors rounded"
            title="Clear console"
          >
            Clear
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={toggleCollapse}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Output content */}
      <div
        className="p-2 overflow-y-auto font-mono text-sm text-gray-800 bg-gray-50"
        style={{ height: `calc(100% - 32px)` }} // 32px is the header height
      >
        {outputMessages.length === 0 ? (
          <div className="text-gray-400 italic p-2">No output yet. Run your code with ECALL instructions to see output here.</div>
        ) : (
          <pre className="whitespace-pre m-0 p-0 pl-2">
            {outputMessages.join('')}
          </pre>
        )}
        <div ref={outputEndRef} />
      </div>
    </div>
  );
}
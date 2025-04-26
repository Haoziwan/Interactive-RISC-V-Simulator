import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface SymbolTableProps {
  labelMap: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
}

export function SymbolTable({ labelMap, isOpen, onClose }: SymbolTableProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Sort labels by address
  const sortedLabels = Object.entries(labelMap).sort((a, b) => a[1] - b[1]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current.querySelector('.symbol-table-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Handle mouse move for both dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        setSize({
          width: size.width + (e.clientX - resizeStart.x),
          height: size.height + (e.clientY - resizeStart.y)
        });
        setResizeStart({
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-50 overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="symbol-table-header flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200 cursor-move">
        <h3 className="text-sm font-medium">Symbol navigator</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* Table content */}
      <div className="overflow-auto h-[calc(100%-40px)]">
        <table className="w-full text-sm table-fixed border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="text-left py-2 px-3 font-medium w-1/2 whitespace-nowrap border-b border-gray-200">Address</th>
              <th className="text-left py-2 px-3 font-medium w-1/2 whitespace-nowrap border-b border-gray-200">Symbol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedLabels.length > 0 ? (
              sortedLabels.map(([label, address], index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-blue-600 text-xs whitespace-nowrap">
                    {`0x${address.toString(16).padStart(8, '0')}`}
                  </td>
                  <td className="py-2 px-3 font-mono text-xs whitespace-nowrap">{label}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-8 text-center text-gray-500">
                  No symbols found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
        style={{
          backgroundImage: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
        }}
      />
    </div>
  );
}

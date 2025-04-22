import React, { useRef, useEffect, useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { BarChart, Clock, Cpu, GitBranch, Database, ToggleLeft, ToggleRight, X, Maximize2, Minimize2, Zap } from 'lucide-react';

interface PerformanceViewProps {
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function PerformanceView({
  onClose,
  initialWidth = 800,
  initialHeight = 600,
  minWidth = 400,
  minHeight = 300,
  maxWidth = 1200,
  maxHeight = 800
}: PerformanceViewProps) {
  const performanceStats = useCircuitStore((state) => state.performanceStats);
  const togglePipelineStats = useCircuitStore((state) => state.togglePipelineStats);

  // Draggable and resizable state
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - initialWidth / 2, y: window.innerHeight / 2 - initialHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const lastSize = useRef({ width: initialWidth, height: initialHeight });
  const lastPosition = useRef({ x: window.innerWidth / 2 - initialWidth / 2, y: window.innerHeight / 2 - initialHeight / 2 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - width, position.x + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - height, position.y + deltaY))
        });

        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      lastPosition.current = position;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, width, height]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeDirection) {
        let newWidth = width;
        let newHeight = height;
        let newX = position.x;
        let newY = position.y;

        // Handle different resize directions
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minWidth, Math.min(maxWidth, width + (e.clientX - dragStartPos.current.x)));
        }
        if (resizeDirection.includes('w')) {
          const deltaX = e.clientX - dragStartPos.current.x;
          newWidth = Math.max(minWidth, Math.min(maxWidth, width - deltaX));
          if (newWidth !== width) {
            newX = position.x + (width - newWidth);
          }
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minHeight, Math.min(maxHeight, height + (e.clientY - dragStartPos.current.y)));
        }
        if (resizeDirection.includes('n')) {
          const deltaY = e.clientY - dragStartPos.current.y;
          newHeight = Math.max(minHeight, Math.min(maxHeight, height - deltaY));
          if (newHeight !== height) {
            newY = position.y + (height - newHeight);
          }
        }

        setWidth(newWidth);
        setHeight(newHeight);
        setPosition({ x: newX, y: newY });

        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      lastSize.current = { width, height };
      lastPosition.current = position;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, width, height, position, minWidth, maxWidth, minHeight, maxHeight]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isMaximized) {
      e.preventDefault();
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setWidth(lastSize.current.width);
      setHeight(lastSize.current.height);
      setPosition(lastPosition.current);
      setIsMaximized(false);
    } else {
      lastSize.current = { width, height };
      lastPosition.current = position;
      setWidth(window.innerWidth - 40);
      setHeight(window.innerHeight - 40);
      setPosition({ x: 20, y: 20 });
      setIsMaximized(true);
    }
  };

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Header/Drag handle */}
      <div
        className="flex justify-between items-center p-4 border-b border-gray-200 cursor-move bg-white"
        onMouseDown={handleDragStart}
      >
        <h2 className="text-xl font-bold text-gray-800">Performance Analysis</h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleMaximize}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="h-5 w-5 text-gray-500" /> : <Maximize2 className="h-5 w-5 text-gray-500" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title="Close Performance Analysis"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-57px)] overflow-auto p-4">
      {/* Pipeline Statistics Toggle */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Pipeline Statistics Collection</h3>
        </div>
        <button
          type="button"
          onClick={togglePipelineStats}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
          title={performanceStats.enablePipelineStats ? "Disable Pipeline Statistics Collection" : "Enable Pipeline Statistics Collection"}
        >
          {performanceStats.enablePipelineStats ? (
            <>
              <ToggleRight className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Enabled</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-6 h-6 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="text-sm font-medium text-blue-600">Cycles</div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{performanceStats.cycleCount}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-green-600" />
            <div className="text-sm font-medium text-green-600">Instructions</div>
          </div>
          <div className="text-2xl font-bold text-green-700">{performanceStats.instructionsExecuted}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-5 h-5 text-purple-600" />
            <div className="text-sm font-medium text-purple-600">CPI</div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{performanceStats.cpi.toFixed(2)}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-5 h-5 text-amber-600" />
            <div className="text-sm font-medium text-amber-600">IPC</div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{performanceStats.ipc.toFixed(2)}</div>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <div className="text-sm font-medium text-teal-600">Clock Rate</div>
          </div>
          <div className="text-2xl font-bold text-teal-700">
            {performanceStats.clockRate > 0
              ? performanceStats.clockRate >= 1000
                ? `${(performanceStats.clockRate / 1000).toFixed(2)} kHz`
                : `${performanceStats.clockRate.toFixed(2)} Hz`
              : '0 Hz'}
          </div>
        </div>
      </div>

      {/* Instruction Type Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Instruction Type Distribution</h3>
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-red-50 p-3 rounded-md">
            <div className="text-sm font-medium text-red-600 mb-1">R-Type</div>
            <div className="text-xl font-bold text-red-700">{performanceStats.rTypeCount}</div>
            <div className="text-xs text-red-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.rTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-600 mb-1">I-Type</div>
            <div className="text-xl font-bold text-blue-700">{performanceStats.iTypeCount}</div>
            <div className="text-xs text-blue-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.iTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-sm font-medium text-green-600 mb-1">S-Type</div>
            <div className="text-xl font-bold text-green-700">{performanceStats.sTypeCount}</div>
            <div className="text-xs text-green-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.sTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="text-sm font-medium text-yellow-600 mb-1">B-Type</div>
            <div className="text-xl font-bold text-yellow-700">{performanceStats.bTypeCount}</div>
            <div className="text-xs text-yellow-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.bTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm font-medium text-purple-600 mb-1">U-Type</div>
            <div className="text-xl font-bold text-purple-700">{performanceStats.uTypeCount}</div>
            <div className="text-xs text-purple-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.uTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-md">
            <div className="text-sm font-medium text-indigo-600 mb-1">J-Type</div>
            <div className="text-xl font-bold text-indigo-700">{performanceStats.jTypeCount}</div>
            <div className="text-xs text-indigo-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.jTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Branch and Memory Statistics */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Branch Statistics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Branches</span>
              <span className="font-medium">{performanceStats.branchCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branches Taken</span>
              <span className="font-medium">{performanceStats.branchTakenCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branches Not Taken</span>
              <span className="font-medium">{performanceStats.branchNotTakenCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branch Mispredictions</span>
              <span className="font-medium">{performanceStats.branchMispredictionCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Misprediction Rate</span>
              <span className="font-medium">
                {performanceStats.branchCount > 0
                  ? ((performanceStats.branchMispredictionCount / performanceStats.branchCount) * 100).toFixed(2)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Memory Statistics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Reads</span>
              <span className="font-medium">{performanceStats.memoryReadCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Writes</span>
              <span className="font-medium">{performanceStats.memoryWriteCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Memory Operations</span>
              <span className="font-medium">{performanceStats.memoryReadCount + performanceStats.memoryWriteCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Operation Ratio</span>
              <span className="font-medium">
                {performanceStats.instructionsExecuted > 0
                  ? (
                      ((performanceStats.memoryReadCount + performanceStats.memoryWriteCount) /
                        performanceStats.instructionsExecuted) *
                      100
                    ).toFixed(2)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stall Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pipeline Stall Analysis</h3>
        </div>
        <div className={`grid grid-cols-4 gap-4 ${!performanceStats.enablePipelineStats ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-red-50 p-3 rounded-md">
            <div className="text-sm font-medium text-red-600 mb-1">Data Hazards</div>
            <div className="text-xl font-bold text-red-700">{performanceStats.dataHazardStalls}</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-md">
            <div className="text-sm font-medium text-amber-600 mb-1">Control Hazards</div>
            <div className="text-xl font-bold text-amber-700">{performanceStats.controlHazardStalls}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-600 mb-1">Memory Stalls</div>
            <div className="text-xl font-bold text-blue-700">{performanceStats.memoryStalls}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm font-medium text-purple-600 mb-1">Total Stalls</div>
            <div className="text-xl font-bold text-purple-700">{performanceStats.totalStalls}</div>
          </div>
        </div>
      </div>

      {/* Execution Time */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Execution Time</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Execution Time</span>
            <span className="font-medium">{(performanceStats.executionTimeMs / 1000).toFixed(3)} seconds</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Clock Rate (Actual)</span>
            <span className="font-medium">
              {performanceStats.clockRate > 0
                ? performanceStats.clockRate >= 1000
                  ? `${(performanceStats.clockRate / 1000).toFixed(2)} kHz`
                  : `${performanceStats.clockRate.toFixed(2)} Hz`
                : '0 Hz'}
            </span>
          </div>
        </div>
      </div>
      </div>

      {/* Resize handles */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, 'se')} />
      <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
      <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, 'nw')} />

      <div className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className="absolute top-0 left-4 right-4 h-1 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, 'n')} />
      <div className="absolute left-0 top-4 bottom-4 w-1 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, 'w')} />
      <div className="absolute right-0 top-4 bottom-4 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, 'e')} />
    </div>
  );
}

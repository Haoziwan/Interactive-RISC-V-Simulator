import React from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  defaultLeftSize?: number;
  defaultRightSize?: number;
}

export function ResizablePanels({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultLeftSize = 20,
  defaultRightSize = 20,
}: ResizablePanelsProps) {
  const [isRightCollapsed, setIsRightCollapsed] = React.useState(false);

  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel
        defaultSize={defaultLeftSize}
        collapsible
        collapsedSize={0}
        minSize={0}
        maxSize={30}
        className="bg-white border-r border-gray-200 transition-all duration-300 h-full"
      >
        <div className="relative h-full overflow-hidden">
          {leftPanel}
        </div>
      </Panel>

      <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />

      <Panel minSize={40}>
        <div className="h-full relative">{centerPanel}</div>
      </Panel>

      {rightPanel && (
        <>
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
          <Panel
            defaultSize={defaultRightSize}
            collapsible
            collapsedSize={0}
            minSize={0}
            maxSize={30}
            className={`bg-white border-l border-gray-200 transition-all duration-300 ${isRightCollapsed ? 'w-0' : ''}`}
          >
            <div className="relative h-full">
              {rightPanel}
              <button
                type="button"
                onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-l flex items-center justify-center hover:bg-gray-50"
              >
                {isRightCollapsed ? (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
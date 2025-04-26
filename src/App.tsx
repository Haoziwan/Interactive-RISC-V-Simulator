import React, { useState } from 'react';
import { ResizablePanels } from './components/ResizablePanels';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { AssemblyEditor } from './components/AssemblyEditor';
import { RegPanel } from './components/RegPanel';
import { MemoryView } from './components/MemoryView';
import { OutputPanel } from './components/OutputPanel';
import { InstructionFormatButton } from './components/InstructionFormatPanel';
import { CacheView } from './components/CacheView';
import { PerformanceView } from './components/PerformanceView';
import { ChevronDown, ChevronRight, Code, Database, Cpu, Play, Pause, RotateCcw, StepForward, StepBack, Layers, BarChart } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useCircuitStore } from './store/circuitStore';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function CollapsibleSection({ title, children, defaultExpanded = true }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">{title}</span>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isExpanded && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 flex items-center space-x-2 ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('code');
  const [showOutput, setShowOutput] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  const renderContent = () => {
    return (
      <div className="h-full flex">
        <div className="flex-1">
          <div style={{ display: activeTab === 'code' ? 'flex' : 'none' }} className="h-full">
            <div className="flex-1">
              <AssemblyEditor />
            </div>
          </div>

          <div style={{ display: activeTab === 'memory' ? 'flex' : 'none' }} className="h-full">
            <div className="flex-1 p-4">
              <MemoryView />
            </div>
          </div>

          <div style={{ display: activeTab === 'cache' ? 'flex' : 'none' }} className="h-full">
            <div className="flex-1 p-4">
              <CacheView />
            </div>
          </div>



          <div style={{ display: activeTab === 'datapath' ? 'flex' : 'none' }} className="h-full">
            <ResizablePanels
              leftPanel={<ComponentLibrary />}
              centerPanel={
                <div className="h-full relative">
                  <div className="absolute inset-0">
                    <CircuitCanvas />
                  </div>
                  <ConfigPanel />
                </div>
              }
              defaultLeftSize={20}
              defaultRightSize={0}
            />
          </div>
        </div>
        <div className="w-64 border-l border-gray-200 bg-white">
          <RegPanel />
        </div>
      </div>
    )
  };

  const isSimulating = useCircuitStore((state) => state.isSimulating);
  const outputMessages = useCircuitStore((state) => state.outputMessages);

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      <header className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            <div className="flex items-center mr-8 min-w-[160px]">
              <a
                href="https://github.com/Haoziwan/Interactive-RISC-V-Simulator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:opacity-80 transition-opacity"
                title="View on GitHub"
              >
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">RISC-V Simulator</h1>
              </a>
            </div>
            <div className="flex-1 flex justify-center items-center space-x-2">
              <div className="flex bg-gray-50 rounded-lg p-1 space-x-1">
                <TabButton
                  isActive={activeTab === 'code'}
                  onClick={() => setActiveTab('code')}
                >
                  <Code className="w-4 h-4" />
                  <span className="text-sm">Editor</span>
                </TabButton>
                <TabButton
                  isActive={activeTab === 'datapath'}
                  onClick={() => setActiveTab('datapath')}
                >
                  <Cpu className="w-4 h-4" />
                  <span className="text-sm">Datapath</span>
                </TabButton>
                <TabButton
                  isActive={activeTab === 'memory'}
                  onClick={() => setActiveTab('memory')}
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Memory</span>
                </TabButton>
                <TabButton
                  isActive={activeTab === 'cache'}
                  onClick={() => setActiveTab('cache')}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">Cache</span>
                </TabButton>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => useCircuitStore.getState().toggleSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title={isSimulating ? 'Pause Simulation' : 'Start Simulation'}
                >
                  {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => useCircuitStore.getState().stepBackSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title="Step Back"
                  disabled={isSimulating}
                >
                  <StepBack className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => useCircuitStore.getState().stepSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title="Single Step"
                  disabled={isSimulating}
                >
                  <StepForward className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => useCircuitStore.getState().assembleCode()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 ml-4">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={useCircuitStore((state) => state.simulationInterval)}
                    onChange={(e) => useCircuitStore.setState({ simulationInterval: parseInt(e.target.value) })}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    title="Simulation Interval (ms) (not the actual exec interval)"
                  />
                  <span className="text-sm text-gray-600 min-w-[4rem]">
                    {useCircuitStore((state) => state.simulationInterval)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Right-aligned buttons */}
            <div className="flex items-center space-x-2 ml-2">
              <div className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                <InstructionFormatButton />
              </div>
              <button
                type="button"
                onClick={() => setShowPerformance(!showPerformance)}
                className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                title="Performance Analysis"
              >
                <BarChart className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowOutput(!showOutput)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${outputMessages.length > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title={showOutput ? 'Hide Output Console' : 'Show Output Console'}
              >
                <span>{showOutput ? 'Hide Output' : 'Show Output'}</span>
                {outputMessages.length > 0 && <span className="ml-0.5 px-1 py-0.5 text-xs bg-blue-500 text-white rounded-full">{outputMessages.length}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>

      {/* Output Panel */}
      {showOutput && <OutputPanel initialWidth={500} minWidth={250} maxWidth={1000} initialHeight={250} maxHeight={600} />}

      {/* Performance Popup */}
      {showPerformance && (
        <PerformanceView onClose={() => setShowPerformance(false)} />
      )}
    </div>
  );
}

export default App;
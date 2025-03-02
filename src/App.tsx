import React, { useState } from 'react';
import { ResizablePanels } from './components/ResizablePanels';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { AssemblyEditor } from './components/AssemblyEditor';
import { RegPanel } from './components/RegPanel';
import { MemoryView } from './components/MemoryView';
import { ChevronDown, ChevronRight, Code, Database, Cpu, Play, Pause, RotateCcw, StepForward, StepBack } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            <div className="flex items-center mr-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">RISC-V Simulator</h1>
            </div>
            <div className="flex-1 flex justify-center items-center space-x-4">
              <div className="flex bg-gray-50 rounded-lg p-1 space-x-1">
                <TabButton
                  isActive={activeTab === 'code'}
                  onClick={() => setActiveTab('code')}
                >
                  <Code className="w-4 h-4" />
                  <span className="text-sm">Code Editor</span>
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
                  <span className="text-sm">Memory View</span>
                </TabButton>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => useCircuitStore.getState().toggleSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title={isSimulating ? 'Pause Simulation' : 'Start Simulation'}
                >
                  {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => useCircuitStore.getState().stepBackSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title="Step Back"
                  disabled={isSimulating}
                >
                  <StepBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => useCircuitStore.getState().stepSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title="Single Step"
                  disabled={isSimulating}
                >
                  <StepForward className="w-5 h-5" />
                </button>
                <button
                  onClick={() => useCircuitStore.getState().resetSimulation()}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 ml-4">
                  <input
                    type="range"
                    min="0"
                    max="4000"
                    step="100"
                    value={useCircuitStore((state) => state.simulationInterval)}
                    onChange={(e) => useCircuitStore.setState({ simulationInterval: parseInt(e.target.value) })}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    title="Simulation Interval (ms)"
                  />
                  <span className="text-sm text-gray-600 min-w-[4rem]">
                    {useCircuitStore((state) => state.simulationInterval)}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
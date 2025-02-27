import React, { useState } from 'react';
import { ResizablePanels } from './components/ResizablePanels';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { AssemblyEditor } from './components/AssemblyEditor';
import { RegPanel } from './components/RegPanel';
import { MemoryView } from './components/MemoryView';
import { ChevronDown, ChevronRight, Code, Database, Cpu, Play, Pause, RotateCcw, StepForward } from 'lucide-react';
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

  React.useEffect(() => {
    // Load basic datapath when component mounts
    import('./examples/basic-datapath.json').then((module) => {
      useCircuitStore.getState().loadCircuit(JSON.stringify(module.default));
    });
  }, []);

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
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">RISC-V Simulator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => useCircuitStore.getState().toggleSimulation()}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title={isSimulating ? 'Pause Simulation' : 'Start Simulation'}
              >
                {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={() => useCircuitStore.getState().stepSimulation()}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Single Step"
                disabled={isSimulating}
              >
                <StepForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => useCircuitStore.getState().resetSimulation()}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Reset Simulation"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex space-x-4">
              <TabButton
                isActive={activeTab === 'code'}
                onClick={() => setActiveTab('code')}
              >
                <Code className="w-5 h-5" />
                <span>Code Editor</span>
              </TabButton>
              <TabButton
                isActive={activeTab === 'datapath'}
                onClick={() => setActiveTab('datapath')}
              >
                <Cpu className="w-5 h-5" />
                <span>Datapath</span>
              </TabButton>
              <TabButton
                isActive={activeTab === 'memory'}
                onClick={() => setActiveTab('memory')}
              >
                <Database className="w-5 h-5" />
                <span>Memory View</span>
              </TabButton>
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
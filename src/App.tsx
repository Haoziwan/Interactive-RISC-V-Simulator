import React, { useState } from 'react';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CircuitCanvas } from './components/CircuitCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { AssemblyEditor } from './components/AssemblyEditor';
import { RegPanel } from './components/RegPanel';
import { MemoryView } from './components/MemoryView';
import { ChevronDown, ChevronRight, Code, Database, Cpu } from 'lucide-react';

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
    switch (activeTab) {
      case 'code':
        return (
          <div className="h-full flex">
            <div className="flex-1">
              <AssemblyEditor />
            </div>
          </div>
        );
      case 'memory':
        return (
          <div className="h-full flex">
            <div className="flex-1 p-4">
              <h2 className="text-lg font-semibold mb-4">内存视图</h2>
              <MemoryView />
            </div>
          </div>
        );
      case 'datapath':
      default:
        return (
          <div className="h-full flex">
            <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-auto">
              <ComponentLibrary />
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <CircuitCanvas />
              </div>
              <ConfigPanel />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">RISC-V Simulator</h1>
            <div className="flex space-x-4">
              <TabButton
                isActive={activeTab === 'code'}
                onClick={() => setActiveTab('code')}
              >
                <Code className="w-5 h-5" />
                <span>代码编辑器</span>
              </TabButton>
              <TabButton
                isActive={activeTab === 'datapath'}
                onClick={() => setActiveTab('datapath')}
              >
                <Cpu className="w-5 h-5" />
                <span>数据通路</span>
              </TabButton>
              <TabButton
                isActive={activeTab === 'memory'}
                onClick={() => setActiveTab('memory')}
              >
                <Database className="w-5 h-5" />
                <span>内存视图</span>
              </TabButton>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
        <div className="w-64 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
          <RegPanel registers={{}} />
        </div>
      </main>
    </div>
  );
}

export default App;
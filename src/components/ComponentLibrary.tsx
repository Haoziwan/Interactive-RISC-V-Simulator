import React from 'react';
import {
  Cpu,
  Database,
  GitCompare,
  ArrowRightLeft,
  Hash,
  Save,
  FileInput,
  BookOpen,
  Timer,
  Plus,
  GitBranch,
  Tag,
  Hash as HashIcon,
  SplitSquareHorizontal,
  ArrowLeftRight,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

const components = [


  {
    type: 'constant',
    label: 'Constant',
    icon: <HashIcon className="w-6 h-6" />,
    description: 'Constant Output Component',
  },
  {
    type: 'pc',
    label: 'Program Counter',
    icon: <Timer className="w-6 h-6" />,
    description: 'Program Counter',
  },
  {
    type: 'fork',
    label: 'Fork',
    icon: <GitBranch className="w-6 h-6" />,
    description: 'Signal Fork Component',
  },
  {
    type: 'pipeline-register',
    label: 'Pipeline Register',
    icon: <Database className="w-6 h-6" />,
    description: 'Pipeline Register Component',
  },
  {
    type: 'jump-control',
    label: 'Jump Control',
    icon: <GitBranch className="w-6 h-6" />,
    description: 'Jump Control Unit',
  },
  {
    type: 'add',
    label: 'Add',
    icon: <Plus className="w-6 h-6" />,
    description: 'Adder Component',
  },
  {
    type: 'instr-distributer',
    label: 'Instruction Distributer',
    icon: <FileInput className="w-6 h-6" />,
    description: 'Instruction Distributor Component',
  },
  {
    type: 'instruction-memory',
    label: 'Instruction Memory',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Stores program instructions',
  },
  {
    type: 'alu',
    label: 'ALU',
    icon: <GitCompare className="w-6 h-6" />,
    description: 'Arithmetic Logic Unit',
  },
  {
    type: 'alu-control',
    label: 'ALU Control',
    icon: <Cpu className="w-6 h-6" />,
    description: 'ALU Control Unit',
  },
  {
    type: 'register',
    label: '32-bit Register',
    icon: <Database className="w-6 h-6" />,
    description: '32-bit Register',
  },
  {
    type: 'mux',
    label: 'Multiplexer',
    icon: <ArrowRightLeft className="w-6 h-6" />,
    description: 'Multiplexer',
  },
  {
    type: 'imm-gen',
    label: 'Immediate Gen',
    icon: <Hash className="w-6 h-6" />,
    description: 'Immediate Generator',
  },
  {
    type: 'control',
    label: 'Control Unit',
    icon: <Cpu className="w-6 h-6" />,
    description: 'Main Control Unit',
  },
  {
    type: 'memory',
    label: 'Data Memory',
    icon: <Database className="w-6 h-6" />,
    description: 'Data Memory Unit',
  },
  {
    type: 'label',
    label: 'Label',
    icon: <Tag className="w-6 h-6" />,
    description: 'Label Display Component',
  },
  {
    type: 'single-register',
    label: 'Single Register',
    icon: <Database className="w-6 h-6" />,
    description: 'Single Register Component',
  },
  {
    type: 'forwarding-unit',
    label: 'Forwarding Unit',
    icon: <ArrowLeftRight className="w-6 h-6" />,
    description: 'Data Forwarding Unit for Pipeline Hazard Control',
  },
  {
    type: 'hazard-detection-unit',
    label: 'Hazard Detection Unit',
    icon: <AlertTriangle className="w-6 h-6" />,
    description: 'Detects and resolves pipeline hazards by stalling',
  },
  {
    type: 'branch-hazard-unit',
    label: 'Branch Hazard Unit',
    icon: <FlaskConical className="w-6 h-6" />,
    description: 'Resolves control hazards by flushing the pipeline',
  }
];

export function ComponentLibrary() {
  const [showAssemblyResult, setShowAssemblyResult] = React.useState(false);
  const saveCircuit = useCircuitStore((state) => state.saveCircuit);
  const loadCircuit = useCircuitStore((state) => state.loadCircuit);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const currentInstructionIndex = useCircuitStore((state) => state.currentInstructionIndex);

  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = async () => {
    try {
      // 检查浏览器是否支持 File System Access API
      if ('showSaveFilePicker' in window) {
        const handle = await (window as unknown as {
          showSaveFilePicker: (options: {
            suggestedName: string;
            types: { description: string; accept: { [key: string]: string[] } }[]
          }) => Promise<FileSystemFileHandle>
        }).showSaveFilePicker({
          suggestedName: `circuit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const data = saveCircuit();
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
      } else {
        // 如果 showSaveFilePicker 不支持，使用传统下载方式
        const data = saveCircuit();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circuit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      // 使用类型守卫处理错误
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('保存文件失败:', err);
      }
    }
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          loadCircuit(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold tracking-tight text-gray-800">Components</h2>
          <button
            onClick={() => setShowAssemblyResult(!showAssemblyResult)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            title={showAssemblyResult ? "Show Components" : "Show Assembly Result"}
          >
            <SplitSquareHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={handleSave}
            className="flex items-center px-2.5 py-1 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 min-w-0 whitespace-nowrap overflow-hidden shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">save</span>
          </button>
          <label className="flex items-center px-2.5 py-1 text-xs font-medium bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer min-w-0 whitespace-nowrap overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-opacity-50">
            <FileInput className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">load</span>
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
            />
          </label>
          <div className="relative min-w-0 flex-1">
            <select
              onChange={(e) => {
                const selectedExample = e.target.value;
                if (selectedExample === 'basic-datapath') {
                  fetch('/datapath/basic-datapath.json')
                    .then(response => response.json())
                    .then(data => {
                      loadCircuit(JSON.stringify(data));
                    });
                } else if (selectedExample === 'basic-pipeline') {
                  fetch('/datapath/basic-pipeline.json')
                    .then(response => response.json())
                    .then(data => {
                      loadCircuit(JSON.stringify(data));
                    });
                } else if (selectedExample === 'pipeline-forward') {
                  fetch('/datapath/pipeline-forward.json')
                    .then(response => response.json())
                    .then(data => {
                      loadCircuit(JSON.stringify(data));
                    });
                } else if (selectedExample === 'pipeline-hazard') {
                  fetch('/datapath/pipeline-hazard.json')
                    .then(response => response.json())
                    .then(data => {
                      loadCircuit(JSON.stringify(data));
                    });
                } else if (selectedExample === 'empty-datapath') {
                  loadCircuit(JSON.stringify({ nodes: [], edges: [] }));
                }
              }}
              className="w-full flex items-center px-2.5 py-1 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors appearance-none cursor-pointer pr-7 truncate shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              title="Select Example Circuit"
              aria-label="Select example circuit to load"
            >
              <option value="">select</option>
              <option value="empty-datapath">empty</option>
              <option value="basic-datapath">single cycle</option>
              <option value="basic-pipeline">pipeline</option>
              {/* <option value="pipeline-hazard">pipeline hazard</option> */}
              <option value="pipeline-forward">pipeline with hazard control</option>
            </select>
            <BookOpen className="w-3.5 h-3.5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-white opacity-80" />
          </div>
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {showAssemblyResult ? (
            <div className="space-y-1.5 overflow-y-auto">
              {assembledInstructions.map((inst, i) => (
                <div
                  key={i}
                  ref={i === currentInstructionIndex ? (el) => {
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  } : undefined}
                  className={`p-2.5 rounded-md ${i === currentInstructionIndex ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}`}
                >
                  <div className="font-mono text-sm text-gray-700">{inst.assembly}</div>
                </div>
              ))}
            </div>
          ) : (
            components.map((component) => (
              <div
                key={component.type}
                className="flex items-center p-2.5 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                draggable
                onDragStart={(e) => onDragStart(e, component.type)}
              >
                <div className="text-gray-600">{component.icon}</div>
                <span className="ml-2.5 font-medium text-gray-700">{component.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
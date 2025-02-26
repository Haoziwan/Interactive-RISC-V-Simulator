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
  Hash as HashIcon
} from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

const components = [
  {
    type: 'jump-control',
    label: 'Jump Control',
    icon: <GitBranch className="w-6 h-6" />,
    description: '跳转控制单元',
  },
  {
    type: 'add',
    label: 'Add',
    icon: <Plus className="w-6 h-6" />,
    description: '加法器组件',
  },
  {
    type: 'label',
    label: 'Label',
    icon: <Tag className="w-6 h-6" />,
    description: '标签显示组件',
  },
  {
    type: 'constant',
    label: 'Constant',
    icon: <HashIcon className="w-6 h-6" />,
    description: '常量输出组件',
  },
  {
    type: 'single-register',
    label: 'Single Register',
    icon: <Database className="w-6 h-6" />,
    description: '单个寄存器组件',
  },
  {
    type: 'pc',
    label: 'Program Counter',
    icon: <Timer className="w-6 h-6" />,
    description: '程序计数器',
  },

  {
    type: 'fork',
    label: 'Fork',
    icon: <GitBranch className="w-6 h-6" />,
    description: '信号分叉组件',
  },
  {
    type: 'instr-distributer',
    label: 'Instruction Distributer',
    icon: <FileInput className="w-6 h-6" />,
    description: '指令分发器组件',
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
    label: 'Register',
    icon: <Database className="w-6 h-6" />,
    description: '32-bit Register',
  },
  {
    type: 'mux',
    label: 'Multiplexer',
    icon: <ArrowRightLeft className="w-6 h-6" />,
    description: '2-to-1 Multiplexer',
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
  }
];

export function ComponentLibrary() {
  const saveCircuit = useCircuitStore((state) => state.saveCircuit);
  const loadCircuit = useCircuitStore((state) => state.loadCircuit);

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
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Components</h2>
        <div className="flex flex-wrap gap-1 mb-3">
          <button
            onClick={handleSave}
            className="flex items-center px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors min-w-0 whitespace-nowrap overflow-hidden"
          >
            <Save className="w-3 h-3 mr-0.5 flex-shrink-0" />
            <span className="truncate">保存</span>
          </button>
          <label className="flex items-center px-1.5 py-0.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors cursor-pointer min-w-0 whitespace-nowrap overflow-hidden">
            <FileInput className="w-3 h-3 mr-0.5 flex-shrink-0" />
            <span className="truncate">加载</span>
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
                  import('../examples/basic-datapath.json').then((module) => {
                    loadCircuit(JSON.stringify(module.default));
                  });
                } else if (selectedExample === 'basic-pipeline') {
                  import('../examples/basic-pipeline.json').then((module) => {
                    loadCircuit(JSON.stringify(module.default));
                  });
                } else if (selectedExample === 'empty-datapath') {
                  loadCircuit(JSON.stringify({ nodes: [], edges: [] }));
                }
              }}
              className="w-full flex items-center px-1.5 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors appearance-none cursor-pointer pr-6 truncate"
              title="选择示例电路"
              aria-label="选择要加载的示例电路"
            >
              <option value="">选择示例</option>
              <option value="empty-datapath">空白数据通路</option>
              <option value="basic-datapath">基础数据通路</option>
              <option value="basic-pipeline">基础流水线</option>
            </select>
            <BookOpen className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-white" />
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {components.map((component) => (
            <div
              key={component.type}
              className="flex items-center p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
            >
              {component.icon}
              <span className="ml-2">{component.label}</span>
              <span className="ml-auto text-xs text-gray-500">{component.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
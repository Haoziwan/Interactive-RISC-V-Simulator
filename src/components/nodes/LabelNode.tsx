import { Handle, Position } from 'reactflow';
import { useEffect } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface LabelNodeData {
  label: string;
  value?: number;
}

export function LabelNode({ data, id, selected }: { data: LabelNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const value = data.value ?? 0;

  const handleValueChange = (newValue: number) => {
    updateNodeData(id, {
      ...data,
      value: newValue
    });
  };

  useEffect(() => {
    if (data.value !== value) {
      handleValueChange(data.value ?? 0);
    }
  }, [data.value, value]);

  return (
    <div className={`px-2 py-1 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="input" 
        className="w-2 h-2 bg-blue-400" 
        style={{ top: '50%' }}
        title="输入值"
      />
      
      <div className="flex items-center justify-center">
        <div className="text-base font-medium">{value}</div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="output" 
        className="w-2 h-2 bg-green-400" 
        style={{ top: '50%' }}
        title="输出值"
      />
    </div>
  );
}
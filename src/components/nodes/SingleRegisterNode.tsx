import { Handle, Position } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface SingleRegisterNodeData {
  label: string;
  value?: number;
  name?: string;
}

export function SingleRegisterNode({ data, id, selected }: { data: SingleRegisterNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const value = data.value ?? 0;
  const name = data.name || 'R';

  const handleValueChange = (newValue: number) => {
    updateNodeData(id, {
      ...data,
      value: newValue
    });
  };

  React.useEffect(() => {
    if (data.value !== value) {
      handleValueChange(data.value ?? 0);
    }
  }, [data.value, value]);

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-900 mb-2">{name}</div>
        <div className="text-xl font-bold text-gray-700">{value}</div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-2 h-2 bg-blue-400"
        style={{ top: '50%' }}
        title="输入值"
      />
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
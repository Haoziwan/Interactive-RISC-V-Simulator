import { Handle, Position } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface ConstantNodeData {
  label: string;
  value?: number;
}

export function ConstantNode({ data, id, selected }: { data: ConstantNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const value = data.value ?? 0;

  const handleValueChange = (newValue: number) => {
    // 避免重复更新相同的值
    if (value === newValue) return;

    updateNodeData(id, {
      ...data,
      value: newValue
    });

    // 获取所有边
    // const edges = useCircuitStore.getState().edges;
    // 找到所有以当前节点为源的边
    // const connectedEdges = edges.filter(edge => edge.source === id);
    
    // 更新所有连接的目标节点的值
    // connectedEdges.forEach(edge => {
    //   useCircuitStore.getState().updateNodeData(edge.target, {
    //     value: newValue
    //   });
    // });
  };

  React.useEffect(() => {
    if (data.value !== value) {
      handleValueChange(data.value ?? 0);
    }
  }, [data.value]); // 移除value依赖，避免循环更新

  return (
    <div className={`px-2 py-1 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-center space-x-2">
        <button
          className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
          onClick={() => handleValueChange(value - 1)}
        >
          -
        </button>
        <div className="text-xl font-bold text-gray-700">{value}</div>
        <button
          className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
          onClick={() => handleValueChange(value + 1)}
        >
          +
        </button>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="value" 
        className="w-2 h-2 bg-green-400" 
        style={{ top: '50%' }} 
        title="Constant Output Value" 
      />
    </div>
  );
}
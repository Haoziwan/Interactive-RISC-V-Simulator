import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface PCNodeData {
  label: string;
  value?: number;
  reset?: boolean;
}

export function PCNode({ data, id, selected }: { data: PCNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const value = data.value ?? 0;
  const reset = data.reset ?? false;
  const [inputValue, setInputValue] = React.useState<number>(0);
  const nodes = useNodes();
  const edges = useEdges();

  const handleValueChange = (newValue: number) => {
    updateNodeData(id, {
      ...data,
      value: newValue
    });
  };

  // 监听复位信号
  React.useEffect(() => {
    if (reset) {
      handleValueChange(0);
      setInputValue(0);
    }
  }, [reset]);

  // 监听输入连接的变化
  React.useEffect(() => {
    // 找到连接到此节点的边
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'next');
    if (inputEdge) {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === inputEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data && typeof sourceNode.data.value === 'number') {
        setInputValue(sourceNode.data.value);
      }
    }
  }, [nodes, edges, id]);

  // 监听时钟信号(stepCount)
  React.useEffect(() => {
    if (!reset) {
      // 首先将当前保存的输入值更新为寄存器的值
      handleValueChange(inputValue);
      
      // 在下一个事件循环中更新输入值
      setTimeout(() => {
        // 获取所有边
        const edges = useCircuitStore.getState().edges;
        // 找到所有连接到当前节点输入端口的边
        const inputEdges = edges.filter(edge => edge.target === id && edge.targetHandle === 'next');
        
        // 如果有输入连接，获取输入值并保存
        if (inputEdges.length > 0) {
          const inputEdge = inputEdges[0]; // 获取第一个输入连接
          const sourceNode = useCircuitStore.getState().nodes.find(node => node.id === inputEdge.source);
          if (sourceNode && sourceNode.data && typeof sourceNode.data.value === 'number') {
            setInputValue(sourceNode.data.value);
          }
        }
      }, 0);
    }
  }, [stepCount]);

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="next" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '50%' }}
        title="下一指令地址"
      />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">PC</div>
          <div className="text-gray-500">Current: 0x{value.toString(16).padStart(8, '0')}</div>
          <div className="text-gray-500">Next: 0x{inputValue.toString(16).padStart(8, '0')}</div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="address" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="当前指令地址"
      />
    </div>
  );
}
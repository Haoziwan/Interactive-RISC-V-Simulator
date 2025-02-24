import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface SingleRegisterNodeData {
  label: string;
  value?: number;
  name?: string;
  reset?: boolean;
}

export function SingleRegisterNode({ data, id, selected }: { data: SingleRegisterNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const value = data.value ?? 0;
  const name = data.name || 'R';
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
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'input');
    if (inputEdge) {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === inputEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        // 首先尝试根据输入端口ID查找对应字段
        const portId = inputEdge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          // 如果存在对应端口ID的字段，使用该字段值
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          // 否则使用默认的value字段
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        if (sourceValue !== undefined) {
          setInputValue(sourceValue);
        }
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
        const inputEdges = edges.filter(edge => edge.target === id && edge.targetHandle === 'input');
        
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
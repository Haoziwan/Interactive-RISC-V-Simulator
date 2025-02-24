import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface ForkNodeData {
  label: string;
  value?: number;
}

export function ForkNode({ data, id, selected }: { data: ForkNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = React.useRef<{ value: number }>({ value: 0 });

  // 获取源节点的值
  const getSourceNodeValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // 首先尝试根据输入端口ID查找对应字段
      const portId = edge.sourceHandle;
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

      return sourceValue ?? null;
    }
    return null;
  };

  // 监听输入连接的变化
  React.useEffect(() => {
    // 找到连接到此节点的边
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'input');
    const newValue = getSourceNodeValue(inputEdge);

    // 只有当输入值发生实际变化时才更新
    if (newValue !== null && newValue !== inputsRef.current.value) {
      // 更新ref中的值
      inputsRef.current.value = newValue;

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        value: newValue
      });
    }
  }, [edges, id, nodes, data]);

  return (
    <div className={`w-8 h-8 shadow-md rounded-full bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-2 h-2 bg-blue-400"
        style={{ top: '50%' }}
        title="输入"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-1"
        className="w-2 h-2 bg-green-400"
        style={{ top: '30%' }}
        title="输出1"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-2"
        className="w-2 h-2 bg-green-400"
        style={{ top: '70%' }}
        title="输出2"
      />
    </div>
  );
}
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React, { useRef } from 'react';

interface ForkNodeData {
  label: string;
  value?: number;
}

export function ForkNode({ data, id, selected }: { data: ForkNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  const prevInputRef = useRef<number | null>(null);

  // 监听输入连接的变化
  React.useEffect(() => {
    // 找到连接到此节点的边
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'input');
    if (inputEdge) {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === inputEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data && typeof sourceNode.data.value === 'number') {
        const newValue = sourceNode.data.value;
        // 只在值真正改变时才更新
        if (prevInputRef.current !== newValue) {
          prevInputRef.current = newValue;
          updateNodeData(id, {
            ...data,
            value: newValue
          });
        }
      }
    }
  }, [edges, id, nodes]);

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
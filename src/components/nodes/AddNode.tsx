import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React, { useRef } from 'react';

interface AddNodeData {
  label: string;
  value?: number;
}

export function AddNode({ data, id, selected }: { data: AddNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const [inputA, setInputA] = React.useState<number>(0);
  const [inputB, setInputB] = React.useState<number>(0);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = useRef({ a: 0, b: 0 });

  // 监听输入连接的变化并更新输出值
  React.useEffect(() => {
    // 找到连接到此节点的边
    const inputEdgeA = edges.find(edge => edge.target === id && edge.targetHandle === 'input-a');
    const inputEdgeB = edges.find(edge => edge.target === id && edge.targetHandle === 'input-b');

    // 获取源节点的值
    const getSourceNodeValue = (edge: any) => {
      if (!edge) return null;
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data && typeof sourceNode.data.value === 'number') {
        return sourceNode.data.value;
      }
      return null;
    };

    const newInputA = getSourceNodeValue(inputEdgeA);
    const newInputB = getSourceNodeValue(inputEdgeB);

    // 只有当输入值发生实际变化时才更新
    const hasChanges = (newInputA !== null && newInputA !== inputsRef.current.a) ||
                      (newInputB !== null && newInputB !== inputsRef.current.b);

    if (hasChanges) {
      const finalInputA = newInputA ?? inputsRef.current.a;
      const finalInputB = newInputB ?? inputsRef.current.b;
      const sum = finalInputA + finalInputB;

      // 更新ref中的值
      inputsRef.current = { a: finalInputA, b: finalInputB };

      // 只更新一次节点数据
      updateNodeData(id, {
        ...data,
        value: sum
      });
    }
  }, [edges, id, nodes, data]); // 添加data作为依赖

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-900 mb-2">ADD</div>
        <div className="text-xl font-bold text-gray-700">{data.value ?? 0}</div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input-a"
        className="w-2 h-2 bg-blue-400"
        style={{ top: '30%' }}
        title="输入A"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-b"
        className="w-2 h-2 bg-blue-400"
        style={{ top: '70%' }}
        title="输入B"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-2 h-2 bg-green-400"
        style={{ top: '50%' }}
        title="输出和"
      />
    </div>
  );
}
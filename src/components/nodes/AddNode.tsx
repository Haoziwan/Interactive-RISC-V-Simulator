import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React, { useRef } from 'react';

interface AddNodeData {
  label: string;
  value?: number;
}

export function AddNode({ data, id, selected }: { data: AddNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const [inputA, setInputA] = React.useState<number>(0);
  const [inputB, setInputB] = React.useState<number>(0);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = useRef({ a: 0, b: 0 });

  // 监听输入连接的变化并更新输出值
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const inputEdgeA = edges.find(edge => edge.target === id && edge.targetHandle === 'input-a');
    const inputEdgeB = edges.find(edge => edge.target === id && edge.targetHandle === 'input-b');

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
          const value = (sourceNode.data as { value?: number | string }).value;
          sourceValue = typeof value === 'number' ? Number(value) : undefined;
        }

        return sourceValue ?? null;
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

      // 更新状态
      setInputA(finalInputA);
      setInputB(finalInputB);

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        value: sum
      });
    }
  };

  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes, data]);

  return (
    <div className="relative" style={{ width: '80px', height: '80px' }}>
      {/* Traditional adder shape - D-shaped with flat left side and curved right side */}
      <svg width="80" height="80" viewBox="0 0 80 80" className="absolute top-0 left-0">
        <path
          d="M10,0 L50,0 Q80,0 80,40 Q80,80 50,80 L10,80 L10,0 Z"
          fill="white"
          stroke={selected ? "#3b82f6" : "#d1d5db"}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* + symbol inside */}
        <text x="40" y="30" fontSize="24" textAnchor="middle" dominantBaseline="middle" fill="#374151">+</text>
        {/* Output value - only show when UI updates are not disabled */}
        {!disableUIUpdates && (
          <text x="40" y="55" fontSize="18" textAnchor="middle" dominantBaseline="middle" fill="#374151" fontWeight="bold">
            {data.value ?? 0}
          </text>
        )}
      </svg>

      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-a"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '30%', left: '0' }}
        title="Input A"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-b"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '70%', left: '0' }}
        title="Input B"
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%', right: '0' }}
        title="Output Sum"
      />
    </div>
  );
}
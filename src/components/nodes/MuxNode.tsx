import { Handle, Position } from 'reactflow';
import React from 'react';
import { useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';

export function MuxNode({ data, id, selected }: { 
  data: { 
    label: string;
    select?: string;
    value?: number;
    onDelete?: () => void;
  }; 
  id: string;
  selected?: boolean 
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const [input0, setInput0] = React.useState<number>(0);
  const [input1, setInput1] = React.useState<number>(0);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = React.useRef({ in0: 0, in1: 0, select: '0' });

  // 监听输入连接的变化并更新输出值
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const input0Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'in0');
    const input1Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'in1');
    const selectEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'select');

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

    const newInput0 = getSourceNodeValue(input0Edge);
    const newInput1 = getSourceNodeValue(input1Edge);
    const newSelect = getSourceNodeValue(selectEdge);

    // 只有当输入值发生实际变化时才更新
    const hasChanges = (newInput0 !== null && newInput0 !== inputsRef.current.in0) ||
                      (newInput1 !== null && newInput1 !== inputsRef.current.in1) ||
                      (newSelect !== null && String(newSelect) !== inputsRef.current.select);

    if (hasChanges) {
      const finalInput0 = newInput0 ?? inputsRef.current.in0;
      const finalInput1 = newInput1 ?? inputsRef.current.in1;
      const finalSelect = String(newSelect ?? inputsRef.current.select);

      // 更新ref中的值
      inputsRef.current = { in0: finalInput0 as number, in1: finalInput1 as number, select: finalSelect };

      // 根据选择信号计算输出值
      const outputValue = finalSelect === '1' ? finalInput1 : finalInput0;

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        value: outputValue,
        select: finalSelect
      });

      // 更新状态
      setInput0(finalInput0 as number);
      setInput1(finalInput1 as number);
    }
  };
  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes, data, updateNodeData]);

  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="in0" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }}
        title="输入0"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="in1" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }}
        title="输入1"
      />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">MUX</div>
          <div className="text-gray-500">Input 0: {input0}</div>
          <div className="text-gray-500">Input 1: {input1}</div>
          <div className="text-gray-500">Select: {data.select || '0'}</div>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="out" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="输出"
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="select" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '50%' }}
        title="选择信号"
      />
    </div>
  );
}
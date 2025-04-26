import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface PCNodeData {
  label: string;
  value?: number;
  reset?: boolean;
  pcWrite?: number;
}

export function PCNode({ data, id, selected }: { data: PCNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const updatePcValue = useCircuitStore((state) => state.updatePcValue);
  const pcValue = useCircuitStore((state) => state.pcValue);
  const value = pcValue ?? 0;
  const reset = data.reset ?? false;
  const pcWrite = data.pcWrite ?? 1;
  const [inputValue, setInputValue] = React.useState<number>(pcValue ?? 0);
  const nodes = useNodes();
  const edges = useEdges();

  const handleValueChange = (newValue: number) => {
    if (newValue !== value) {
      updateNodeData(id, {
        ...data,
        value: newValue
      });
      updatePcValue(newValue);
    }
  };

  // 监听复位信号
  React.useEffect(() => {
    if (reset) {
      setInputValue(0);
      updatePcValue(0);
      // 重置reset标志
      updateNodeData(id, {
        ...data,
        reset: false
      });
    }
  }, [reset, id, data, updateNodeData, updatePcValue]);

  // 监听pcWrite信号和输入连接的变化
  const updateInputConnections = () => {
    // 检查pcWrite信号
    const pcWriteEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'pcWrite');
    let pcWriteValue = 1; // 默认可写入

    if (pcWriteEdge) {
      const sourceNode = nodes.find(node => node.id === pcWriteEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const sourceValue = sourceNode.data[pcWriteEdge.sourceHandle as keyof typeof sourceNode.data];
        pcWriteValue = typeof sourceValue === 'number' ? sourceValue : 1;
      }
    }

    // 更新pcWrite状态
    if (pcWriteValue !== data.pcWrite) {
      updateNodeData(id, {
        ...data,
        pcWrite: pcWriteValue
      });
    }

    // 查找next输入信号
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'next');
    if (inputEdge) {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === inputEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data && typeof sourceNode.data.value === 'number') {
        setInputValue(sourceNode.data.value);
      }
    }
  };

  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [nodes, edges, id]);

  // 监听时钟信号(stepCount)
  React.useEffect(() => {
    if (!reset) {
      // 检查pcWrite信号，只有当pcWrite=1时才更新PC值
      if (pcWrite === 1) {
        // 首先将当前保存的输入值更新为寄存器的值
        handleValueChange(inputValue);

      }
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
        style={{ top: '35%' }}
        title="Next Instruction Address"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="pcWrite"
        className="w-3 h-3 bg-yellow-400"
        style={{ top: '65%' }}
        title="PC Write Enable"
      />

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">PC</div>
          {!disableUIUpdates && (
            <>
              <div className="text-gray-500">Current: 0x{value.toString(16).padStart(8, '0')}</div>
              <div className="text-gray-500">Next: 0x{inputValue.toString(16).padStart(8, '0')}</div>
              <div className="text-gray-500">PCWrite: {pcWrite}</div>
            </>
          )}
          {/* Add placeholder div when UI updates are disabled to maintain height */}
          {disableUIUpdates && (
            <div style={{ height: '70px' }}></div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="address"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%' }}
        title="Current Instruction Address"
      />
    </div>
  );
}
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

export function InstructionMemoryNode({ data, id, selected }: {
  data: {
    label: string;
    instructions?: string[];  // 机器码指令数组
    pc?: number;             // 程序计数器值
    value?: string;          // 当前输出的指令
    size?: number;          // 指令存储器容量（字节）
    onDelete?: () => void;
  };
  id: string;
  selected?: boolean
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const nodes = useNodes();
  const edges = useEdges();

  const handleLoadInstructions = () => {
    if (assembledInstructions.length > 0) {
      updateNodeData(id, {
        ...data,
        instructions: assembledInstructions.map(inst => inst.hex),
        pc: 0
      });
    }
  };
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const pcEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'pc');
    if (pcEdge) {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === pcEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data && typeof sourceNode.data.value === 'number') {
        const pcValue = Math.floor(sourceNode.data.value / 4); // 将字节地址转换为指令索引
        if (pcValue !== data.pc) {
          updateNodeData(id, {
            ...data,
            pc: pcValue,
            value: data.instructions?.[pcValue] // 直接更新当前指令值
          });
        }
      }
    }
  };

  // 监听PC输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [nodes, edges, id]);
  // 监听PC值变化，更新输出指令
  React.useEffect(() => {
    const pcValue = data.pc || 0;
    let currentInstruction = "0";
    if (Array.isArray(data.instructions) && pcValue >= 0 && pcValue < data.instructions.length) {
      currentInstruction = data.instructions[pcValue];
    }
    if (currentInstruction !== data.value) {
      updateNodeData(id, {
        ...data,
        value: currentInstruction
      });
    }
  }, [data.pc, data.instructions]);


  // 计算显示的指令范围（当前指令前后各2条）
  const pcValue = data.pc || 0;
  const startIdx = Math.max(0, pcValue - 2);
  const endIdx = Math.min((data.instructions?.length || 0) - 1, pcValue + 2);
  const displayInstructions = data.instructions?.slice(startIdx, endIdx + 1) || [];
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>

      {/* Input port on left */}
      <Handle
        type="target"
        position={Position.Left}
        id="pc"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '50%' }}
        title="Program Counter Address"
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">Instruction Memory</div>
          {!disableUIUpdates && (
            <div className="text-sm text-gray-500">
              <div>Size: {data.size || 4096} bytes</div>
              <div>Output: {(data.value === "0" || !data.value) ? 'No instruction' : data.value}</div>
              <div className="mt-2 space-y-1 font-mono">
                {displayInstructions.map((inst, idx) => {
                  const actualIdx = startIdx + idx;
                  const isCurrentInst = actualIdx === pcValue;
                  return (
                    <div
                      key={actualIdx}
                      className={`flex items-center ${isCurrentInst ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
                    >
                      <span className="w-24 inline-block">
                        {`0x${(actualIdx * 4).toString(16).padStart(8, '0')}`}
                      </span>
                      <span>
                        {isCurrentInst ? '→ ' : '  '}
                        {inst || 'No instruction'}
                      </span>
                    </div>
                  );
                })}
              </div>
              {data.instructions && data.instructions.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Total Instructions: {data.instructions.length}
                </div>
              )}
            </div>
          )}
          {/* Add placeholder div when UI updates are disabled to maintain height */}
          {disableUIUpdates && (
            <div style={{ height: '160px' }}></div>
          )}
        </div>
        <button
          type="button"
          onClick={handleLoadInstructions}
          disabled={assembledInstructions.length === 0}
          className={`px-3 py-1.5 text-sm rounded ${
            assembledInstructions.length > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          title={assembledInstructions.length === 0 ? "Please assemble code in editor first" : "Load recently assembled instructions"}
        >
          Load
        </button>
      </div>

      {/* Output port on right */}
      <Handle
        type="source"
        position={Position.Right}
        id="instruction"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%' }}
        title="Current Instruction"
      />
    </div>
  );
}
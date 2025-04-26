import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React, { useRef } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface InstrDistributerNodeData {
  label: string;
  value?: string;
  opcode?: string;
  rd?: string;
  funct3?: string;
  rs1?: string;
  rs2?: string;
  funct7?: string;
  [key: string]: string | undefined;
}

export function InstrDistributerNode({ data, id, selected }: { data: InstrDistributerNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();
  const prevValueRef = useRef<string | undefined>(undefined);
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const inputEdge = edges.find(edge => edge.target === id);
    if (inputEdge) {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === inputEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data) {
        const newValue = sourceNode.data.value as string;
        // 只在值真正改变时才更新
        if (newValue !== prevValueRef.current) {
          prevValueRef.current = newValue;
          const instruction = newValue
            ? parseInt(newValue, 16).toString(2).padStart(32, '0')
            : '0'.repeat(32);

          // 解析指令的各个字段
          const opcode = instruction.slice(-7);
          const rd = instruction.slice(-12, -7);
          const funct3 = instruction.slice(-15, -12);
          const rs1 = instruction.slice(-20, -15);
          const rs2 = instruction.slice(-25, -20);
          const funct7 = instruction.slice(-32, -25);

          // 更新节点数据，为每个输出端口设置对应的字段
          updateNodeData(id, {
            ...data,
            value: newValue,
            opcode: parseInt(opcode, 2),
            rd: parseInt(rd, 2),
            funct3: parseInt(funct3, 2),
            rs1: parseInt(rs1, 2),
            rs2: parseInt(rs2, 2),
            funct7: parseInt(funct7, 2)
          });
        }
      }
    }
  };
  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes]);
  const instruction = data.value
    ? parseInt(data.value, 16).toString(2).padStart(32, '0')
    : '0'.repeat(32);

  // 解析指令的各个字段
  const opcode = instruction.slice(-7);
  const rd = instruction.slice(-12, -7);
  const funct3 = instruction.slice(-15, -12);
  const rs1 = instruction.slice(-20, -15);
  const rs2 = instruction.slice(-25, -20);
  const funct7 = instruction.slice(-32, -25);

  return (
    <div className={`w-40 py-4 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-400"
        style={{ top: '50%' }}
        title="Instruction Input"
      />

      <div className="flex flex-col space-y-2 px-2">
        {/* Show field values when UI updates are enabled */}
        {!disableUIUpdates && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">opcode:</span>
              <span className="font-mono">{opcode}</span>
              <Handle
                type="source"
                position={Position.Right}
                id="opcode"
                className="w-2 h-2 bg-green-400"
                style={{ top: '1.5rem' }}
                title="Operation Code"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">rd:</span>
              <span className="font-mono">{rd}</span>
              <Handle
                type="source"
                position={Position.Right}
                id="rd"
                className="w-2 h-2 bg-green-400"
                style={{ top: '3rem' }}
                title="Destination Register"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">funct3:</span>
              <span className="font-mono">{funct3}</span>
              <Handle
                type="source"
                position={Position.Right}
                id="funct3"
                className="w-2 h-2 bg-green-400"
                style={{ top: '4.5rem' }}
                title="Function Code 3"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">rs1:</span>
              <span className="font-mono">{rs1}</span>
              <Handle
                type="source"
                position={Position.Right}
                id="rs1"
                className="w-2 h-2 bg-green-400"
                style={{ top: '6rem' }}
                title="Source Register 1"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">rs2:</span>
              <span className="font-mono">{rs2}</span>
              <Handle
                type="source"
                position={Position.Right}
                id="rs2"
                className="w-2 h-2 bg-green-400"
                style={{ top: '7.5rem' }}
                title="Source Register 2"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">funct7:</span>
              <span className="font-mono">{funct7}</span>
              <Handle
                type="source"
                position={Position.Right}
                id="funct7"
                className="w-2 h-2 bg-green-400"
                style={{ top: '9rem' }}
                title="Function Code 7"
              />
            </div>
          </>
        )}

        {/* Only show handles when UI updates are disabled */}
        {disableUIUpdates && (
          <div className="relative" style={{ height: '180px' }}>
            <Handle
              type="source"
              position={Position.Right}
              id="opcode"
              className="w-2 h-2 bg-green-400 absolute"
              style={{ top: '1.5rem', right: '-10px' }}
              title="Operation Code"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="rd"
              className="w-2 h-2 bg-green-400 absolute"
              style={{ top: '3rem', right: '-10px' }}
              title="Destination Register"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="funct3"
              className="w-2 h-2 bg-green-400 absolute"
              style={{ top: '4.5rem', right: '-10px' }}
              title="Function Code 3"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="rs1"
              className="w-2 h-2 bg-green-400 absolute"
              style={{ top: '6rem', right: '-10px' }}
              title="Source Register 1"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="rs2"
              className="w-2 h-2 bg-green-400 absolute"
              style={{ top: '7.5rem', right: '-10px' }}
              title="Source Register 2"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="funct7"
              className="w-2 h-2 bg-green-400 absolute"
              style={{ top: '9rem', right: '-10px' }}
              title="Function Code 7"
            />
          </div>
        )}
      </div>
    </div>
  );
}
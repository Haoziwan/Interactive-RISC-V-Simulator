import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface JumpControlNodeData {
  label: string;
  funct3?: number;
  opcode?: number;
  zero?: number;
  jump?: number;
  jalr?: number;
}

export function JumpControlNode({ data, id, selected }: { data: JumpControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();

  const inputValuesRef = React.useRef({
    funct3: 0,
    opcode: 0,
    zero: 0
  });

  // 获取输入端口的值
  const getInputValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      const portId = edge.sourceHandle;
      let sourceValue: number | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' ? value : undefined;
      } else if ('value' in sourceNode.data) {
        const value = (sourceNode.data as { value?: number }).value;
        sourceValue = typeof value === 'number' ? value : undefined;
      }

      return sourceValue ?? null;
    }
    return null;
  };
  // 监听输入连接的变化并处理所有逻辑
  const updateInputConnections = () => {
    const inputEdges = edges.filter(edge => edge.target === id);
    let hasChanges = false;

    inputEdges.forEach(edge => {
      const sourceValue = getInputValue(edge);
      const portId = edge.targetHandle;

      if (sourceValue !== null && !isNaN(sourceValue)) {
        switch (portId) {
          case 'funct3':
            if (inputValuesRef.current.funct3 !== sourceValue) {
              inputValuesRef.current.funct3 = sourceValue;
              hasChanges = true;
            }
            break;
          case 'opcode':
            if (inputValuesRef.current.opcode !== sourceValue) {
              inputValuesRef.current.opcode = sourceValue;
              hasChanges = true;
            }
            break;
          case 'zero':
            if (inputValuesRef.current.zero !== sourceValue) {
              inputValuesRef.current.zero = sourceValue;
              hasChanges = true;
            }
            break;
        }
      }
    });

    // 只在输入值发生变化时更新跳转控制信号
    if (hasChanges) {
      const funct3 = inputValuesRef.current.funct3.toString(2).padStart(3, '0');
      const opcode = inputValuesRef.current.opcode.toString(2).padStart(7, '0');
      const zero = inputValuesRef.current.zero;

      let shouldJump = 0;
      let isJalr = 0;

      // 根据opcode和funct3判断指令类型和跳转条件
      if (opcode === '1101111') { // JAL指令
        shouldJump = 1;
        isJalr = 0;
      } else if (opcode === '1100111') { // JALR指令
        shouldJump = 1;
        isJalr = 1;
      } else if (opcode === '1100011') { // B型指令
        switch (funct3) {
          case '000': // BEQ
            shouldJump = zero ? 1 : 0;
            break;
          case '001': // BNE
            shouldJump = zero ? 0 : 1;
            break;
          case '100': // BLT
          case '110': // BLTU
            shouldJump = zero ? 0 : 1;
            break;
          case '101': // BGE
          case '111': // BGEU
            shouldJump = zero ? 1 : 0;
            break;
        }
      }

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        funct3: inputValuesRef.current.funct3,
        opcode: inputValuesRef.current.opcode,
        zero: zero,
        jump: shouldJump,
        jalr: isJalr
      });
    }
  };
  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [nodes, edges, id]);
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id="funct3"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '30%' }}
        title="Function Code 3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="opcode"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '50%' }}
        title="Operation Code"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="zero"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '70%' }}
        title="ALU Zero Flag"
      />

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Jump Control</div>
          {!disableUIUpdates && (
            <>
              <div className="text-gray-500">Funct3: {data.funct3?.toString(2).padStart(3, '0') || '000'}</div>
              <div className="text-gray-500">Opcode: {data.opcode?.toString(2).padStart(7, '0') || '0000000'}</div>
              <div className="text-gray-500">Zero: {data.zero || 0}</div>
              <div className="text-gray-500">Jump: {data.jump || 0}</div>
              <div className="text-gray-500">Jalr: {data.jalr || 0}</div>
            </>
          )}
          {/* Add placeholder div when UI updates are disabled to maintain height */}
          {disableUIUpdates && (
            <div style={{ height: '100px' }}></div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="jump"
        className="w-3 h-3 bg-green-400"
        style={{ top: '40%' }}
        title="Jump Control Signal"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="jalr"
        className="w-3 h-3 bg-green-400"
        style={{ top: '60%' }}
        title="JALR Control Signal"
      />
    </div>
  );
}
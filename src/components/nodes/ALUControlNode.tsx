import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface ALUControlNodeData {
  label: string;
  aluOp?: number;
  funct3?: number;
  funct7?: number;
  aluControl?: number;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ALUControlNode({ data, id, selected }: { data: ALUControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();

  // 监听输入连接的变化
  const updateInputConnections = () => {
    const inputEdges = edges.filter(edge => edge.target === id);
    let inputAluOp = data.aluOp ?? 0;
    let inputFunct3 = data.funct3 ?? 0;
    let inputFunct7 = data.funct7 ?? 0;
    let hasChanges = false;

    const getSourceNodeValue = (edge: any) => {
      if (!edge) return null;
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = edge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number | string }).value;
          sourceValue = typeof value === 'number' ? Number(value) : undefined;
        }

        return sourceValue ?? null;
      }
      return null;
    };

    inputEdges.forEach(edge => {
      const sourceValue = getSourceNodeValue(edge);
      const portId = edge.targetHandle;

      if (sourceValue !== null && !isNaN(sourceValue)) {
        switch (portId) {
          case 'aluOp':
            if (sourceValue !== inputAluOp) {
              inputAluOp = sourceValue;
              hasChanges = true;
            }
            break;
          case 'funct3':
            if (sourceValue !== inputFunct3) {
              inputFunct3 = sourceValue;
              hasChanges = true;
            }
            break;
          case 'funct7':
            if (sourceValue !== inputFunct7) {
              inputFunct7 = sourceValue;
              hasChanges = true;
            }
            break;
        }
      }
    });

    if (hasChanges) {
      // 转换为二进制字符串
      const aluOp = inputAluOp.toString(2).padStart(2, '0');
      const funct3 = inputFunct3.toString(2).padStart(3, '0');
      const funct7 = inputFunct7.toString(2).padStart(7, '0');

      // 生成ALU控制信号
      const generateALUControl = (aluOp: string, funct3: string, funct7: string): string => {
        if (aluOp === '00') {
          // Load/Store指令：执行加法
          return '0010'; // ADD (2)
        } else if (aluOp === '01') {
          // Branch指令：根据funct3确定比较类型
          switch (funct3) {
            case '000': return '0110'; // SUB (6) for beq
            case '001': return '0110'; // SUB (6) for bne
            case '100': return '0111'; // SLT (7) for blt
            case '101': return '0111'; // SLT (7) for bge
            case '110': return '1010'; // SLTU (10) for bltu
            case '111': return '1010'; // SLTU (10) for bgeu
            default: return '0110';
          }
        } else if (aluOp === '10') {
          // R-type指令：根据funct3和funct7确定
          if (funct7 === '0000001') {
            // M extension instructions (multiplication and division)
            switch (funct3) {
              case '000': return '1100'; // MUL (12)
              case '001': return '1101'; // MULH (13)
              case '010': return '1111'; // MULHSU (15)
              case '011': return '1110'; // MULHU (14)
              case '100': return '10000'; // DIV (16)
              case '101': return '10001'; // DIVU (17)
              case '110': return '10010'; // REM (18)
              case '111': return '10011'; // REMU (19)
              default: return '0000';
            }
          } else {
            // Standard R-type instructions
            switch (funct3) {
              case '000':
                return funct7 === '0000000' ? '0010' : '0110'; // ADD (2) / SUB (6)
              case '001': return '1011'; // SLL (11)
              case '010': return '0111'; // SLT (7)
              case '011': return '1010'; // SLTU (10)
              case '100': return '0011'; // XOR (3)
              case '101':
                return funct7 === '0000000' ? '1000' : '1001'; // SRL (8) / SRA (9)
              case '110': return '0001'; // OR (1)
              case '111': return '0000'; // AND (0)
              default: return '0000';
            }
          }
        } else if (aluOp === '11') {
          // I-type特殊指令
          switch (funct3) {
            case '000': return '0010'; // ADDI (2)
            case '001': return '1011'; // SLLI (11)
            case '010': return '0111'; // SLTI (7)
            case '011': return '1010'; // SLTIU (10)
            case '100': return '0011'; // XORI (3)
            case '101':
              return funct7 === '0000000' ? '1000' : '1001'; // SRLI (8) / SRAI (9)
            case '110': return '0001'; // ORI (1)
            case '111': return '0000'; // ANDI (0)
            default: return '0010';
          }
        }
        return '0000';
      };

      const aluControl = generateALUControl(aluOp, funct3, funct7);
      const aluControlValue = parseInt(aluControl, 2);

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        aluOp: inputAluOp,
        funct3: inputFunct3,
        funct7: inputFunct7,
        aluControl: aluControlValue
      });
    }
  };

  // 优化useEffect的依赖数组
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id]);
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>

      <Handle
        type="target"
        position={Position.Top}
        id="aluOp"
        className="w-3 h-3 bg-blue-400"
        style={{ left: '50%' }}
        title="ALU Operation Code"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="funct3"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '40%' }}
        title="Function Code 3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="funct7"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '60%' }}
        title="Function Code 7"
      />

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">ALU Control</div>
          {!disableUIUpdates && (
            <>
              <div className="text-gray-500">ALUOp: {data.aluOp?.toString(2).padStart(2, '0') || '00'}</div>
              <div className="text-gray-500">Funct3: {data.funct3?.toString(2).padStart(3, '0') || '000'}</div>
              <div className="text-gray-500">Funct7: {data.funct7?.toString(2).padStart(7, '0') || '0000000'}</div>
              <div className="text-gray-500">ALU Control: {data.aluControl?.toString(2).padStart(4, '0') || '0000'}</div>
            </>
          )}
          {/* Add placeholder div when UI updates are disabled to maintain height */}
          {disableUIUpdates && (
            <div style={{ height: '80px' }}></div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="aluControl"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%' }}
        title="ALU Control Signal"
      />
    </div>
  );
}
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface ImmGenNodeData {
  label: string;
  format?: 'R' | 'I' | 'S' | 'B' | 'U' | 'J';
  instruction?: string;
  immediate?: number;
  onDelete?: () => void;
}

export function ImmGenNode({ data, id, selected }: { 
  data: ImmGenNodeData; 
  id: string;
  selected?: boolean 
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  // 从32位指令中提取立即数
  const generateImmediate = (instruction: string, format: string): number => {
    if (!instruction || instruction.length !== 32) return 0;
    
    const bits = instruction.split('').map(Number);
    let imm = 0;

    switch (format) {
      case 'R':
        // R-type指令没有立即数
        return 0;
      case 'I':
        // I-type: imm[11:0] = inst[31:20]
        imm = parseInt(instruction.slice(0, 12), 2);
        // 符号扩展
        if (imm & 0x800) imm |= ~0xFFF;
        break;

      case 'S':
        // S-type: imm[11:5] = inst[31:25], imm[4:0] = inst[11:7]
        imm = (parseInt(instruction.slice(0, 7), 2) << 5) |
              parseInt(instruction.slice(20, 25), 2);
        if (imm & 0x800) imm |= ~0xFFF;
        break;

      case 'B':
        // B-type: imm[12|10:5] = inst[31|30:25], imm[4:1|11] = inst[11:8|7]
        imm = (parseInt(instruction.slice(0, 7), 2) << 5) |
              (parseInt(instruction.slice(20, 24), 2) << 1) |
              (parseInt(instruction.slice(24, 25), 2) << 11);
        if (imm & 0x1000) imm |= ~0x1FFF;
        imm <<= 1; // 左移一位，因为分支指令的立即数是2字节对齐的
        break;

      case 'U':
        // U-type: imm[31:12] = inst[31:12]
        imm = parseInt(instruction.slice(0, 20), 2) << 12;
        break;

      case 'J':
        // J-type: imm[20|10:1|11|19:12] = inst[31|30:21|20|19:12]
        imm = (parseInt(instruction.slice(0, 1), 2) << 20) |
              (parseInt(instruction.slice(1, 11), 2) << 1) |
              (parseInt(instruction.slice(11, 12), 2) << 11) |
              (parseInt(instruction.slice(12, 20), 2) << 12);
        if (imm & 0x100000) imm |= ~0x1FFFFF;
        imm <<= 1; // 左移一位，因为跳转指令的立即数是2字节对齐的
        break;
    }

    return imm;
  };

  // 根据opcode识别指令类型
  const getInstructionFormat = (opcode: string): 'R' | 'I' | 'S' | 'B' | 'U' | 'J' => {
    const opcodeNum = parseInt(opcode, 2);
    switch (opcodeNum) {
      case 0b0110011: // R-type (add, sub, sll, slt, sltu, xor, srl, sra, or, and)
        return 'R';
      case 0b0010011: // I-type (addi, slti, sltiu, xori, ori, andi, slli, srli, srai)
      case 0b0000011: // I-type (lb, lh, lw, lbu, lhu)
      case 0b1100111: // I-type (jalr)
        return 'I';
      case 0b0100011: // S-type (sb, sh, sw)
        return 'S';
      case 0b1100011: // B-type (beq, bne, blt, bge, bltu, bgeu)
        return 'B';
      case 0b0110111: // U-type (lui)
      case 0b0010111: // U-type (auipc)
        return 'U';
      case 0b1101111: // J-type (jal)
        return 'J';
      default:
        return 'R'; // 默认返回R类型
    }
  };

  // 监听输入连接的变化
  React.useEffect(() => {
    const instructionEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'instruction');

    if (instructionEdge) {
      const sourceNode = nodes.find(node => node.id === instructionEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data && typeof sourceNode.data.value === 'string') {
        const instruction = sourceNode.data.value;
        // 将十六进制指令转换为二进制字符串
        const binaryInstruction = parseInt(instruction, 16)
          .toString(2)
          .padStart(32, '0');
        
        // 从指令中提取opcode
        const opcode = binaryInstruction.slice(-7);
        // 根据opcode识别指令类型
        const format = getInstructionFormat(opcode);
        
        // 生成立即数
        const immediate = generateImmediate(binaryInstruction, format);
        
        // 更新节点数据
        if (immediate !== data.immediate || format !== data.format) {
          updateNodeData(id, {
            ...data,
            instruction: binaryInstruction,
            immediate,
            format
          });
        }
      }
    }
  }, [edges, nodes, id, data.format]);

  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      {/* Input port on left */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="instruction" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '50%' }}
        title="指令数据"
      />

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Immediate Gen</div>
          <div className="text-gray-500">Format: {data.format || 'R'}</div>
          <div className="text-gray-500">Immediate: {data.immediate || 0}</div>
        </div>
      </div>

      {/* Output port on right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="immediate" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="立即数"
      />
    </div>
  );
}
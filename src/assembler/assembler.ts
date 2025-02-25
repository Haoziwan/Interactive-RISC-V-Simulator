export type Instruction = {
  type: 'R' | 'I' | 'S' | 'B' | 'U' | 'J';
  opcode: string;
  rd?: number;
  rs1?: number;
  rs2?: number;
  funct3?: string;
  funct7?: string;
  imm?: number;
};

export type AssembledInstruction = {
  hex: string;
  binary: string;
};

export class AssemblerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssemblerError';
  }
}

export const parseRegister = (reg: string): number => {
  const match = reg.match(/x(\d+)/);
  if (!match) throw new AssemblerError(`无效的寄存器: ${reg}`);
  const num = parseInt(match[1]);
  if (num < 0 || num > 31) throw new AssemblerError(`寄存器编号必须在0-31之间: ${reg}`);
  return num;
};

export const parseImmediate = (imm: string, bits: number): number => {
  let value: number;
  if (imm.startsWith('0x')) {
    value = parseInt(imm.slice(2), 16);
    // 处理十六进制负数
    if (value >= (1 << (bits - 1))) {
      value -= (1 << bits);
    }
  } else {
    value = parseInt(imm);
  }
  const max = (1 << (bits - 1)) - 1;
  const min = -(1 << (bits - 1));
  if (isNaN(value)) {
    throw new AssemblerError(`无效的立即数格式: ${imm}`);
  }
  // 对于分支指令的偏移量，需要特殊处理
  if (bits === 13 || bits === 21) {
    if (value % 2 !== 0) {
      throw new AssemblerError(`分支/跳转目标必须是2字节对齐的: ${imm}`);
    }
    value = value >> 1; // 将字节偏移转换为字数偏移
  }
  if (value < min || value > max) {
    throw new AssemblerError(`立即数必须在${min}到${max}之间: ${imm}`);
  }
  return value;
};

export const parseInstruction = (line: string, currentAddress: number, labelMap: Record<string, number>): Instruction => {
  // 移除注释
  const lineWithoutComment = line.split('#')[0].trim();
  // 分割指令部分
  const parts = lineWithoutComment.split(/[\s,]+/).filter(Boolean);
  const op = parts[0].toLowerCase();

  switch (op) {
    case 'add':
    case 'sub':
    case 'and':
    case 'or':
    case 'xor':
    case 'sll':
    case 'srl':
    case 'sra':
    case 'slt':
    case 'sltu': {
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`);
      return {
        type: 'R',
        opcode: '0110011',
        rd: parseRegister(parts[1]),
        rs1: parseRegister(parts[2]),
        rs2: parseRegister(parts[3]),
        funct3: op === 'add' || op === 'sub' ? '000' :
               op === 'sll' ? '001' :
               op === 'slt' ? '010' :
               op === 'sltu' ? '011' :
               op === 'xor' ? '100' :
               op === 'srl' || op === 'sra' ? '101' :
               op === 'or' ? '110' : '111',
        funct7: op === 'sub' || op === 'sra' ? '0100000' : '0000000'
      };
    }
    case 'addi':
    case 'andi':
    case 'ori':
    case 'xori':
    case 'slti':
    case 'sltiu':
    case 'slli':
    case 'srli':
    case 'srai': {
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`);
      return {
        type: 'I',
        opcode: '0010011',
        rd: parseRegister(parts[1]),
        rs1: parseRegister(parts[2]),
        imm: parseImmediate(parts[3], 12),
        funct3: op === 'addi' ? '000' :
               op === 'slli' ? '001' :
               op === 'slti' ? '010' :
               op === 'sltiu' ? '011' :
               op === 'xori' ? '100' :
               op === 'srli' || op === 'srai' ? '101' :
               op === 'ori' ? '110' : '111'
      };
    }
    case 'lw': {
      if (parts.length !== 3) throw new AssemblerError(`${op}指令需要2个操作数和偏移量`);
      const [rd, memStr] = parts.slice(1);
      const match = memStr.match(/(-?\d+)\((x\d+)\)/);
      if (!match) throw new AssemblerError(`无效的内存访问格式: ${memStr}`);
      return {
        type: 'I',
        opcode: '0000011',
        rd: parseRegister(rd),
        rs1: parseRegister(match[2]),
        imm: parseImmediate(match[1], 12),
        funct3: '010'
      };
    }
    case 'sw': {
      if (parts.length !== 3) throw new AssemblerError(`${op}指令需要2个操作数和偏移量`);
      const [rs2, memStr] = parts.slice(1);
      const match = memStr.match(/(-?\d+)\((x\d+)\)/);
      if (!match) throw new AssemblerError(`无效的内存访问格式: ${memStr}`);
      return {
        type: 'S',
        opcode: '0100011',
        rs1: parseRegister(match[2]),
        rs2: parseRegister(rs2),
        imm: parseImmediate(match[1], 12),
        funct3: '010'
      };
    }
    case 'beq':
    case 'bne':
    case 'blt':
    case 'bge': {
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`);
      const targetLabel = parts[3];
      let offset: number;
      
      if (targetLabel in labelMap) {
        offset = labelMap[targetLabel] - currentAddress;
      } else {
        offset = parseImmediate(targetLabel, 13);
      }
      
      return {
        type: 'B',
        opcode: '1100011',
        rs1: parseRegister(parts[1]),
        rs2: parseRegister(parts[2]),
        imm: offset,
        funct3: op === 'beq' ? '000' :
               op === 'bne' ? '001' :
               op === 'blt' ? '100' : '101'
      };
    }
    case 'lui':
    case 'auipc': {
      if (parts.length !== 3) throw new AssemblerError(`${op}指令需要2个操作数`);
      return {
        type: 'U',
        opcode: op === 'lui' ? '0110111' : '0010111',
        rd: parseRegister(parts[1]),
        imm: parseImmediate(parts[2], 20)
      };
    }
    case 'jal': {
      if (parts.length !== 3) throw new AssemblerError(`${op}指令需要2个操作数`);
      const targetLabel = parts[2];
      let offset: number;
      
      if (targetLabel in labelMap) {
        offset = labelMap[targetLabel] - currentAddress;
      } else {
        offset = parseImmediate(targetLabel, 21);
      }
      
      return {
        type: 'J',
        opcode: '1101111',
        rd: parseRegister(parts[1]),
        imm: offset
      };
    }
    case 'jalr': {
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`);
      return {
        type: 'I',
        opcode: '1100111',
        rd: parseRegister(parts[1]),
        rs1: parseRegister(parts[2]),
        imm: parseImmediate(parts[3], 12),
        funct3: '000'
      };
    }
    default:
      throw new AssemblerError(`不支持的指令: ${op}`);
  }
};

export const generateMachineCode = (inst: Instruction): string => {
  let machineCode = parseInt(inst.opcode, 2);

  // 符号扩展函数
  const signExtend = (value: number, bits: number) => {
    const signBit = 1 << (bits - 1);
    return (value & (signBit - 1)) - (value & signBit);
  };

  switch (inst.type) {
    case 'R':
      machineCode = parseInt(inst.opcode, 2) & 0x7F;
      machineCode |= (inst.rd! & 0x1F) << 7;
      machineCode |= (parseInt(inst.funct3!, 2) & 0x7) << 12;
      machineCode |= (inst.rs1! & 0x1F) << 15;
      machineCode |= (inst.rs2! & 0x1F) << 20;
      machineCode |= (parseInt(inst.funct7!, 2) & 0x7F) << 25;
      break;

    case 'I':
      const iImm = signExtend(inst.imm!, 12);
      machineCode |= (inst.rd! & 0x1F) << 7;
      machineCode |= (parseInt(inst.funct3!, 2) & 0x7) << 12;
      machineCode |= (inst.rs1! & 0x1F) << 15;
      machineCode |= ((iImm & 0xFFF) << 20) >>> 0;
      break;

    case 'S':
      const sImm = signExtend(inst.imm!, 12);
      machineCode |= ((sImm & 0x1F) << 7);
      machineCode |= (parseInt(inst.funct3!, 2) & 0x7) << 12;
      machineCode |= (inst.rs1! & 0x1F) << 15;
      machineCode |= (inst.rs2! & 0x1F) << 20;
      machineCode |= ((sImm >> 5) << 25);
      break;

    case 'B':
      const bImm = signExtend(inst.imm!, 13) << 1; // 恢复字节偏移
      machineCode |= ((bImm & 0x1000) >> 12) << 31; // imm[12]
      machineCode |= ((bImm & 0x800) >> 11) << 7;   // imm[11]
      machineCode |= ((bImm & 0x7E0) >> 5) << 25;   // imm[10:5]
      machineCode |= ((bImm & 0x1E) >> 1) << 8;     // imm[4:1]
      machineCode |= (parseInt(inst.funct3!, 2) & 0x7) << 12;
      machineCode |= (inst.rs1! & 0x1F) << 15;
      machineCode |= (inst.rs2! & 0x1F) << 20;
      break;

    case 'U':
      machineCode |= (inst.rd! & 0x1F) << 7;
      machineCode |= ((inst.imm! & 0xFFFFF) << 12);
      break;

    case 'J':
      const jImm = signExtend(inst.imm!, 21) << 1; // 恢复字节偏移
      machineCode |= (inst.rd! & 0x1F) << 7;
      machineCode |= ((jImm & 0xFF000));
      machineCode |= ((jImm & 0x800) << 9);
      machineCode |= ((jImm & 0x7FE) << 20);
      machineCode |= ((jImm & 0x100000) << 11);
      break;
  }

  // 确保返回的是无符号32位整数的十六进制表示
  return `0x${(machineCode >>> 0).toString(16).padStart(8, '0')}`;
};

export class Assembler {
  private labelMap: Record<string, number> = {};
  private currentAddress = 0;
  public getLabelMap(): Record<string, number> {
    return this.labelMap;
  }
  public assemble(code: string): AssembledInstruction[] {
    this.labelMap = {};
    this.currentAddress = 0;

    // 第一遍：收集标签
    code.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;
      
      const labelMatch = trimmedLine.match(/^([a-zA-Z0-9_]+):/);
      if (labelMatch) {
        this.labelMap[labelMatch[1]] = this.currentAddress;
        return;
      }
      
      // 如果不是纯标签行，则增加地址
      if (!trimmedLine.endsWith(':')) {
        this.currentAddress += 4;
      }
    });

    // 第二遍：生成指令
    this.currentAddress = 0;
    return code
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line || line.startsWith('#')) return false;
        const withoutComment = line.split('#')[0].trim();
        return withoutComment.length > 0 && !withoutComment.endsWith(':');
      })
      .map(line => {
        const parsedInst = parseInstruction(line, this.currentAddress, this.labelMap);
        const hex = generateMachineCode(parsedInst);
        const binary = (parseInt(hex.slice(2), 16) >>> 0).toString(2).padStart(32, '0');
        this.currentAddress += 4;
        return { hex, binary };
      });
  }
}
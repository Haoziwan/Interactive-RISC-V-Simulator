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
  assembly?: string;
  source?: string;
};

export class AssemblerError extends Error {
  lineNumber?: number;
  instruction?: string;
  errorType: string;
  suggestion?: string;

  constructor(message: string, options?: {
    lineNumber?: number;
    instruction?: string;
    errorType?: string;
    suggestion?: string;
  }) {
    const formattedMessage = `${options?.lineNumber ? `第 ${options.lineNumber} 行: ` : ''}
${message}
${options?.instruction ? `指令: ${options.instruction}` : ''}
${options?.suggestion ? `建议: ${options.suggestion}` : ''}`;
    super(formattedMessage);
    this.name = 'AssemblerError';
    this.lineNumber = options?.lineNumber;
    this.instruction = options?.instruction;
    this.errorType = options?.errorType || '语法错误';
    this.suggestion = options?.suggestion;
  }
}

const registerAliases: Record<string, number> = {
  'zero': 0,
  'ra': 1,
  'sp': 2,
  'gp': 3,
  'tp': 4,
  't0': 5,
  't1': 6,
  't2': 7,
  's0': 8,
  'fp': 8,
  's1': 9,
  'a0': 10,
  'a1': 11,
  'a2': 12,
  'a3': 13,
  'a4': 14,
  'a5': 15,
  'a6': 16,
  'a7': 17,
  's2': 18,
  's3': 19,
  's4': 20,
  's5': 21,
  's6': 22,
  's7': 23,
  's8': 24,
  's9': 25,
  's10': 26,
  's11': 27,
  't3': 28,
  't4': 29,
  't5': 30,
  't6': 31
};

export const parseRegister = (reg: string): number => {
  // 尝试匹配ABI名称
  if (reg in registerAliases) {
    return registerAliases[reg];
  }

  // 尝试匹配x数字格式
  const match = reg.match(/x(\d+)/);
  if (!match) throw new AssemblerError(`无效的寄存器格式: ${reg}`, {
    errorType: '寄存器错误',
    suggestion: '寄存器应使用x0-x31的格式（如x0, x1）或ABI名称（如zero, ra, sp等）'
  });
  const num = parseInt(match[1]);
  if (num < 0 || num > 31) throw new AssemblerError(`寄存器编号必须在0-31之间: ${reg}`, {
    errorType: '寄存器错误',
    suggestion: '请检查寄存器编号是否在有效范围内（0-31）'
  });
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
    throw new AssemblerError(`无效的立即数格式: ${imm}`, {
    errorType: '立即数错误',
    suggestion: '立即数可以是十进制（如：42）或十六进制（如：0xff）格式'
  });
  }
  // 对于分支指令的偏移量，需要特殊处理
  if (bits === 13 || bits === 21) {
    if (value % 2 !== 0) {
      throw new AssemblerError(`分支/跳转目标必须是2字节对齐的: ${imm}`, {
    errorType: '对齐错误',
    suggestion: '分支和跳转指令的目标地址必须是2的倍数'
  });
    }
    value = value >> 1; // 将字节偏移转换为字数偏移
  }
  if (value < min || value > max) {
    throw new AssemblerError(`立即数必须在${min}到${max}之间: ${imm}`, {
    errorType: '立即数范围错误',
    suggestion: `请确保立即数在有效范围内（${min} 到 ${max}）`
  });
  }
  return value;
};

export const expandPseudoInstruction = (line: string): string[] => {
  // 移除注释
  const lineWithoutComment = line.split('#')[0].trim();
  const parts = lineWithoutComment.split(/[\s,]+/).filter(Boolean);
  const op = parts[0].toLowerCase();

  switch (op) {
    case 'li': {
      if (parts.length !== 3) {
        throw new AssemblerError(`li指令语法错误：需要2个操作数\n正确格式：li rd, immediate\n  - rd: 目标寄存器 (例如：x1, t0)\n  - immediate: 立即数值 (例如：42, 0xff)\n当前输入：${lineWithoutComment}`);
      }
      const rd = parts[1];
      let imm;
      try {
        imm = parts[2].startsWith('0x') ? parseInt(parts[2].slice(2), 16) : parseInt(parts[2]);
        if (isNaN(imm)) throw new Error();
      } catch {
        throw new AssemblerError(`li指令的立即数格式错误：${parts[2]}\n支持的格式：\n  - 十进制数字 (例如：42)\n  - 十六进制数字 (例如：0xff)`);
      }
      
      if (imm >= -2048 && imm < 2048) {
        return [`addi ${rd}, x0, ${imm}`];
      } else {
        const upper = (imm + 0x800) >> 12;
        const lower = imm - (upper << 12);
        return [
          `lui ${rd}, ${upper}`,
          `addi ${rd}, ${rd}, ${lower}`
        ];
      }
    }
    case 'mv': {
      if (parts.length !== 3) throw new AssemblerError('mv指令需要2个操作数');
      // mv rd, rs 等价于 addi rd, rs, 0
      return [`addi ${parts[1]}, ${parts[2]}, 0`];
    }
    case 'j': {
      if (parts.length !== 2) throw new AssemblerError('j指令需要1个操作数');
      // j offset 等价于 jal x0, offset
      return [`jal x0, ${parts[1]}`];
    }
    case 'ret': {
      // ret 等价于 jalr x0, ra, 0
      return ['jalr x0, ra, 0'];
    }
    case 'nop': {
      // nop 等价于 addi x0, x0, 0
      return ['addi x0, x0, 0'];
    }
    default:
      return [lineWithoutComment];
  }
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
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`, {
    errorType: '操作数错误',
    instruction: lineWithoutComment,
    suggestion: `${op}指令格式：${op} rd, rs1, rs2（例如：${op} x1, x2, x3）`
  });
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
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`, {
    errorType: '操作数错误',
    instruction: lineWithoutComment,
    suggestion: `${op}指令格式：${op} rd, rs1, rs2（例如：${op} x1, x2, x3）`
  });
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
      const match = memStr.match(/(-?\d+)\(([a-zA-Z0-9]+)\)/);
      if (!match) throw new AssemblerError(`无效的内存访问格式: ${memStr}`, {
    errorType: '内存访问格式错误',
    instruction: lineWithoutComment,
    suggestion: '内存访问格式应为：offset(register)，例如：4(x2)或4(sp)'
  });
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
      const match = memStr.match(/(-?\d+)\(([a-zA-Z0-9]+)\)/);
      if (!match) throw new AssemblerError(`无效的内存访问格式: ${memStr}`, {
    errorType: '内存访问格式错误',
    instruction: lineWithoutComment,
    suggestion: '内存访问格式应为：offset(register)，例如：4(x2)或4(sp)'
  });
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
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`, {
    errorType: '操作数错误',
    instruction: lineWithoutComment,
    suggestion: `${op}指令格式：${op} rd, rs1, rs2（例如：${op} x1, x2, x3）`
  });
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
      if (parts.length !== 4) throw new AssemblerError(`${op}指令需要3个操作数`, {
    errorType: '操作数错误',
    instruction: lineWithoutComment,
    suggestion: `${op}指令格式：${op} rd, rs1, rs2（例如：${op} x1, x2, x3）`
  });
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
      throw new AssemblerError(`不支持的指令: ${op}`, {
    errorType: '未知指令',
    instruction: lineWithoutComment,
    suggestion: '请检查指令拼写是否正确，或参考支持的指令列表'
  });
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
      const bImm = signExtend(inst.imm!, 13); // 不需要额外左移 1
    
      machineCode |= ((bImm & 0x1000) >> 12) << 31; // imm[12] -> bit 31
      machineCode |= ((bImm & 0x7E0) >> 5) << 25;   // imm[10:5] -> bits 30:25
      machineCode |= ((bImm & 0x1E) >> 1) << 8;     // imm[4:1] -> bits 11:8
      machineCode |= ((bImm & 0x800) >> 11) << 7;   // imm[11] -> bit 7
    
      machineCode |= (parseInt(inst.funct3!, 2) & 0x7) << 12; // funct3 -> bits 14:12
      machineCode |= (inst.rs1! & 0x1F) << 15; // rs1 -> bits 19:15
      machineCode |= (inst.rs2! & 0x1F) << 20; // rs2 -> bits 24:20
    
      // machineCode |= 0b1100011; // B 类型指令的 opcode
    
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
        // 处理伪指令，每个伪指令可能展开为多条基本指令
        const expandedInstructions = expandPseudoInstruction(trimmedLine);
        this.currentAddress += 4 * expandedInstructions.length;
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
      .flatMap(line => {
        // 展开伪指令
        const expandedInstructions = expandPseudoInstruction(line);
        return expandedInstructions.map(expandedLine => {
          const parsedInst = parseInstruction(expandedLine, this.currentAddress, this.labelMap);
          const hex = generateMachineCode(parsedInst);
          const binary = (parseInt(hex.slice(2), 16) >>> 0).toString(2).padStart(32, '0');
          this.currentAddress += 4;
          return { hex, binary };
        });
      });
  }
}
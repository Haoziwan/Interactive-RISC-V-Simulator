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
  segment?: 'text' | 'data';
  address?: number;
  data?: number[];
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
    case 'la': {
      if (parts.length !== 3) throw new AssemblerError(`la指令语法错误：需要2个操作数`, {
        errorType: '操作数错误',
        instruction: lineWithoutComment,
        suggestion: 'la指令格式：la rd, symbol（例如：la a0, msg）'
      });
      // la rd, symbol - 加载标签地址到寄存器
      // 在第一遍扫描时，标签地址未知，所以只能返回占位符
      // 在实际汇编过程中会替换为lui+addi指令
      return [`la ${parts[1]}, ${parts[2]}`];
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
    case 'la': {
      if (parts.length !== 3) throw new AssemblerError(`${op}指令需要2个操作数`, {
        errorType: '操作数错误',
        instruction: lineWithoutComment,
        suggestion: `la指令格式：la rd, symbol（例如：la a0, msg）`
      });
      
      const rd = parseRegister(parts[1]);
      const symbol = parts[2];
      
      if (!(symbol in labelMap)) {
        throw new AssemblerError(`未定义的标签: ${symbol}`, {
          errorType: '标签错误',
          instruction: lineWithoutComment,
          suggestion: '请确保标签已在代码中定义'
        });
      }
      
      const address = labelMap[symbol];
      // 首先生成lui指令部分
      const upper = (address >> 12) & 0xFFFFF;
      
      return {
        type: 'U',
        opcode: '0110111', // lui的opcode
        rd,
        imm: upper
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
               op === 'ori' ? '110' : '111',
        funct7: op === 'srai' ? '0100000' : op === 'slli' || op === 'srli' ? '0000000' : undefined
      };
    }
    case 'lb':
    case 'lh':
    case 'lw':
    case 'lbu':
    case 'lhu': {
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
        funct3: op === 'lb' ? '000' :
               op === 'lh' ? '001' :
               op === 'lw' ? '010' :
               op === 'lbu' ? '100' : '101'
      };
    }
    case 'sb':
    case 'sh':
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
        funct3: op === 'sb' ? '000' :
               op === 'sh' ? '001' : '010'
      };
    }
    case 'beq':
    case 'bne':
    case 'blt':
    case 'bge':
    case 'bltu':
    case 'bgeu': {
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
               op === 'blt' ? '100' :
               op === 'bge' ? '101' :
               op === 'bltu' ? '110' : '111'
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
    case 'ecall': {
      if (parts.length !== 1) throw new AssemblerError(`${op}指令不需要操作数`, {
        errorType: '操作数错误',
        instruction: lineWithoutComment,
        suggestion: 'ecall指令格式：ecall'
      });
      return {
        type: 'I',
        opcode: '1110011',
        rd: 0,
        rs1: 0,
        imm: 0,
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
    // 检查最高位是否为1（负数）
    const signBit = 1 << (bits - 1);
    if (value & signBit) {
      // 如果是负数，则进行符号扩展
      return value | (~0 << bits);
    } else {
      // 如果是正数，则保持不变
      return value;
    }
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
      // 直接使用原始的立即数值，不进行符号扩展
      const iImm = inst.imm!;
      
      machineCode |= (inst.rd! & 0x1F) << 7;
      machineCode |= (parseInt(inst.funct3!, 2) & 0x7) << 12;
      machineCode |= (inst.rs1! & 0x1F) << 15;
      
      // 对于移位指令（slli, srli, srai），需要特殊处理funct7字段
      if (inst.funct7) {
        machineCode |= (parseInt(inst.funct7, 2) & 0x7F) << 25;
        // 对于移位指令，立即数只使用低5位
        machineCode |= ((iImm & 0x1F) << 20) >>> 0;
      } else {
        // 对于其他I型指令，使用低12位
        machineCode |= ((iImm & 0xFFF) << 20) >>> 0;
      }
      
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
      const jImm = signExtend(inst.imm!, 21); // 立即数扩展到 21 位
    
      machineCode |= ((jImm & 0x100000) >> 20) << 31; // imm[20] -> bit 31
      machineCode |= ((jImm & 0xFF000) >> 12) << 12;  // imm[19:12] -> bits 19:12
      machineCode |= ((jImm & 0x800) >> 11) << 20;    // imm[11] -> bit 20
      machineCode |= ((jImm & 0x7FE) >> 1) << 21;     // imm[10:1] -> bits 30:21
    
      machineCode |= (inst.rd! & 0x1F) << 7; // rd -> bits 11:7
      machineCode |= 0b1101111; // JAL opcode
    
      break;
      
  }

  // 确保返回的是无符号32位整数的十六进制表示
  return `0x${(machineCode >>> 0).toString(16).padStart(8, '0')}`;
};

export class Assembler {
  private labelMap: Record<string, number> = {};
  private currentAddress = 0;
  private currentSegment: 'text' | 'data' = 'text';
  private textAddress = 0;
  private dataAddress = 0;
  private readonly GP_BASE = 0x10000000;  // GP 寄存器基址
  
  public getLabelMap(): Record<string, number> {
    return this.labelMap;
  }
  
  public assemble(code: string): AssembledInstruction[] {
    this.labelMap = {};
    this.currentAddress = 0;
    this.currentSegment = 'text';
    this.textAddress = 0;
    this.dataAddress = this.GP_BASE; // 数据段从GP寄存器基址开始

    // 第一遍：只收集标签所在的地址，不处理数据的地址偏移
    // 预先处理标签，单独一遍扫描
    let currentAddr = 0;
    let inDataSegment = false;
    
    // 首先分离所有行并保存它们（忽略注释和空行）
    const allLines: {text: string, hasLabel: boolean, label?: string, instr?: string}[] = [];
    
    code.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;
      
      const entry: {text: string, hasLabel: boolean, label?: string, instr?: string} = {
        text: trimmedLine,
        hasLabel: false
      };
      
      // 检查是否有标签
      const labelMatch = trimmedLine.match(/^([a-zA-Z0-9_]+):/);
      if (labelMatch) {
        entry.hasLabel = true;
        entry.label = labelMatch[1];
        
        // 提取标签后的指令或数据
        const afterLabel = trimmedLine.substring(labelMatch[0].length).trim();
        if (afterLabel) {
          entry.instr = afterLabel;
        }
      } else {
        entry.instr = trimmedLine;
      }
      
      allLines.push(entry);
    });
    
    // 现在进行第一遍遍历，只收集.text和.data指令和标签的位置
    currentAddr = 0;
    inDataSegment = false;
    
    for (let i = 0; i < allLines.length; i++) {
      const entry = allLines[i];
      
      // 处理段指令
      if (entry.instr === '.text') {
        inDataSegment = false;
        currentAddr = 0; // 代码段从0开始
        continue;
      } else if (entry.instr === '.data') {
        inDataSegment = true;
        currentAddr = this.GP_BASE; // 数据段从GP_BASE开始
        continue;
      }
      
      // 如果有标签，记录它的地址
      if (entry.hasLabel) {
        this.labelMap[entry.label!] = currentAddr;
      }
      
      // 根据指令或数据类型更新地址
      if (entry.instr) {
        if (!inDataSegment) {
          // 处理代码段
          const expandedInstrs = expandPseudoInstruction(entry.instr);
          currentAddr += 4 * expandedInstrs.length;
        } else {
          // 处理数据段
          if (entry.instr.startsWith('.word')) {
            const parts = entry.instr.split(/\s+/).slice(1);
            currentAddr += 4 * parts.length;
          } else if (entry.instr.startsWith('.byte')) {
            const parts = entry.instr.split(/\s+/).slice(1);
            currentAddr += parts.length;
          } else if (entry.instr.startsWith('.half')) {
            const parts = entry.instr.split(/\s+/).slice(1);
            currentAddr += 2 * parts.length;
          } else if (entry.instr.startsWith('.ascii') || entry.instr.startsWith('.asciz')) {
            const match = entry.instr.match(/"(.*)"/);
            if (match) {
              const str = match[1];
              const increment = entry.instr.startsWith('.asciz') ? str.length + 1 : str.length;
              currentAddr += increment;
            }
          }
        }
      }
    }
    
    // 完成标签收集后，开始第二遍正式汇编
    this.currentAddress = 0;
    this.currentSegment = 'text';
    
    const result: AssembledInstruction[] = [];
    const memoryBytes: Record<number, number> = {}; // 用于跟踪内存中的每个字节
    
    // 第二遍：生成实际的指令和数据
    let currentSection = 'text';
    
    for (const entry of allLines) {
      // 处理段指令
      if (entry.instr === '.text') {
        currentSection = 'text';
        this.currentAddress = result.filter(inst => inst.segment === 'text').reduce((acc, inst) => acc + 4, 0);
        continue;
      } else if (entry.instr === '.data') {
        currentSection = 'data';
        this.currentAddress = this.GP_BASE + result.filter(inst => inst.segment === 'data').reduce((acc, inst) => {
          if (inst.data) {
            return acc + inst.data.length;
          }
          return acc;
        }, 0);
        continue;
      }
      
      // 跳过纯标签行
      if (!entry.instr) continue;
      
      const instruction = entry.instr;
      
      if (currentSection === 'text') {
        // 处理代码段指令
        if (!instruction.startsWith('.')) {
          // 展开伪指令
          const expandedInstructions = expandPseudoInstruction(instruction);
          expandedInstructions.forEach((expandedLine, i) => {
            try {
              // 特殊处理 la 指令的第二部分 (addi)
              if (expandedLine.startsWith('la ')) {
                const parts = expandedLine.split(/[\s,]+/).filter(Boolean);
                if (parts.length === 3) {
                  const rd = parts[1];
                  const symbol = parts[2];
                  
                  if (symbol in this.labelMap) {
                    const address = this.labelMap[symbol];
                    
                    // 计算地址在数据段中的偏移量
                    let offset = 0;
                    let baseImm = 0x10000; // 默认的lui立即数，对应0x10000000
                    
                    // 检查标签是在数据段还是在代码段
                    if (address >= this.GP_BASE) {
                      // 数据段标签
                      offset = address - this.GP_BASE;
                    } else {
                      // 代码段标签
                      baseImm = address >>> 12;
                      offset = address & 0xFFF;
                    }
                    
                    // 确保偏移量在12位有符号整数范围内 (-2048 到 2047)
                    if (offset < -2048 || offset > 2047) {
                      console.warn(`警告: ${symbol} 的偏移量 ${offset} 超出了12位有符号整数范围`);
                    }
                    
                    // 生成 lui 指令
                    const luiInst = {
                      type: 'U' as const,
                      opcode: '0110111',
                      rd: parseRegister(rd),
                      imm: baseImm
                    };
                    const luiHex = generateMachineCode(luiInst);
                    const luiBinary = (parseInt(luiHex.slice(2), 16) >>> 0).toString(2).padStart(32, '0');
                    
                    result.push({
                      hex: luiHex,
                      binary: luiBinary,
                      assembly: `lui ${rd}, 0x${baseImm.toString(16)}`,
                      source: expandedLine,
                      segment: 'text',
                      address: this.currentAddress
                    });
                    this.currentAddress += 4;
                    
                    // 生成 addi 指令
                    const addiInst = {
                      type: 'I' as const,
                      opcode: '0010011',
                      rd: parseRegister(rd),
                      rs1: parseRegister(rd),
                      imm: offset,
                      funct3: '000'
                    };
                    const addiHex = generateMachineCode(addiInst);
                    const addiBinary = (parseInt(addiHex.slice(2), 16) >>> 0).toString(2).padStart(32, '0');
                    
                    result.push({
                      hex: addiHex,
                      binary: addiBinary,
                      assembly: `addi ${rd}, ${rd}, ${offset}`,
                      source: expandedLine,
                      segment: 'text',
                      address: this.currentAddress
                    });
                    this.currentAddress += 4;
                  }
                }
                return; // la 指令已处理完毕，跳过正常的处理
              }
              
              // 处理其他指令
              const parsedInst = parseInstruction(expandedLine, this.currentAddress, this.labelMap);
              const hex = generateMachineCode(parsedInst);
              const binary = (parseInt(hex.slice(2), 16) >>> 0).toString(2).padStart(32, '0');
              result.push({ 
                hex, 
                binary, 
                assembly: expandedLine,
                source: entry.text,
                segment: 'text',
                address: this.currentAddress
              });
              this.currentAddress += 4;
            } catch (error) {
              if (error instanceof AssemblerError) {
                throw new AssemblerError(error.message, {
                  ...error,
                  lineNumber: 0
                });
              } else {
                throw error;
              }
            }
          });
        }
      } else if (currentSection === 'data') {
        // 处理数据段指令
        try {
          let dataBytes: number[] = [];
          let dataSize = 0;
          
          if (instruction.startsWith('.word')) {
            const parts = instruction.split(/\s+/).slice(1);
            const data = parts.map(part => {
              if (part.startsWith('0x')) {
                return parseInt(part.slice(2), 16);
              } else {
                return parseInt(part);
              }
            });
            
            dataBytes = [];
            // 存储为小端序
            data.forEach(value => {
              dataBytes.push(value & 0xFF);
              dataBytes.push((value >> 8) & 0xFF);
              dataBytes.push((value >> 16) & 0xFF);
              dataBytes.push((value >> 24) & 0xFF);
            });
            dataSize = 4 * data.length;
            
            // 添加到结果数组
            result.push({
              hex: '0x' + data.map(d => d.toString(16).padStart(8, '0')).join(''),
              binary: data.map(d => d.toString(2).padStart(32, '0')).join(''),
              assembly: instruction,
              source: entry.text,
              segment: 'data',
              address: this.currentAddress,
              data: data
            });
            
          } else if (instruction.startsWith('.byte')) {
            const parts = instruction.split(/\s+/).slice(1);
            const data = parts.map(part => {
              if (part.startsWith('0x')) {
                return parseInt(part.slice(2), 16) & 0xFF;
              } else {
                return parseInt(part) & 0xFF;
              }
            });
            
            dataBytes = data;
            dataSize = data.length;
            
            result.push({
              hex: '0x' + data.map(d => d.toString(16).padStart(2, '0')).join(''),
              binary: data.map(d => d.toString(2).padStart(8, '0')).join(''),
              assembly: instruction,
              source: entry.text,
              segment: 'data',
              address: this.currentAddress,
              data: data
            });
            
          } else if (instruction.startsWith('.half')) {
            const parts = instruction.split(/\s+/).slice(1);
            const data = parts.map(part => {
              if (part.startsWith('0x')) {
                return parseInt(part.slice(2), 16) & 0xFFFF;
              } else {
                return parseInt(part) & 0xFFFF;
              }
            });
            
            dataBytes = [];
            // 存储为小端序
            data.forEach(value => {
              dataBytes.push(value & 0xFF);
              dataBytes.push((value >> 8) & 0xFF);
            });
            dataSize = 2 * data.length;
            
            result.push({
              hex: '0x' + data.map(d => d.toString(16).padStart(4, '0')).join(''),
              binary: data.map(d => d.toString(2).padStart(16, '0')).join(''),
              assembly: instruction,
              source: entry.text,
              segment: 'data',
              address: this.currentAddress,
              data: data
            });
            
          } else if (instruction.startsWith('.ascii') || instruction.startsWith('.asciz')) {
            const match = instruction.match(/"(.*)"/);
            if (match) {
              const str = match[1];
              const data = Array.from(str).map(c => c.charCodeAt(0));
              
              if (instruction.startsWith('.asciz')) {
                data.push(0); // 添加空字符结尾
              }
              
              dataBytes = data;
              dataSize = data.length;
              
              result.push({
                hex: '0x' + data.map(d => d.toString(16).padStart(2, '0')).join(''),
                binary: data.map(d => d.toString(2).padStart(8, '0')).join(''),
                assembly: instruction,
                source: entry.text,
                segment: 'data',
                address: this.currentAddress,
                data: data
              });
            }
          }
          
          // 存储到内存模型中并更新地址
          if (dataBytes.length > 0) {
            dataBytes.forEach((value, i) => {
              memoryBytes[this.currentAddress + i] = value;
            });
            
            this.currentAddress += dataSize;
          }
        } catch (error) {
          if (error instanceof AssemblerError) {
            throw new AssemblerError(error.message, {
              ...error,
              lineNumber: 0
            });
          } else {
            throw error;
          }
        }
      }
    }
    
    // 将内存数据添加到结果中
    // 作为一个特殊的属性添加到第一个结果元素上
    if (result.length > 0) {
      const memoryData: Record<string, number> = {};
      Object.entries(memoryBytes).forEach(([addr, value]) => {
        memoryData[`0x${parseInt(addr).toString(16).padStart(8, '0')}`] = value;
      });
      
      // @ts-ignore - 添加一个特殊的属性用于传递内存数据
      result[0].memoryData = memoryData;
    }
    
    return result;
  }
}
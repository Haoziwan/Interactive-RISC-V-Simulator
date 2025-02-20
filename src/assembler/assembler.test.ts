import { describe, it, expect } from 'vitest';
import { Assembler, AssemblerError, parseRegister, parseImmediate, parseInstruction, generateMachineCode } from './assembler';

describe('RISC-V Assembler', () => {
  describe('parseRegister', () => {
    it('应该正确解析有效的寄存器', () => {
      expect(parseRegister('x0')).toBe(0);
      expect(parseRegister('x1')).toBe(1);
      expect(parseRegister('x31')).toBe(31);
    });

    it('应该对无效的寄存器格式抛出错误', () => {
      expect(() => parseRegister('y0')).toThrow('无效的寄存器');
      expect(() => parseRegister('x32')).toThrow('寄存器编号必须在0-31之间');
      expect(() => parseRegister('x-1')).toThrow('无效的寄存器');
    });
  });

  describe('parseImmediate', () => {
    it('应该正确解析十进制立即数', () => {
      expect(parseImmediate('0', 12)).toBe(0);
      expect(parseImmediate('2047', 12)).toBe(2047);
      expect(parseImmediate('-2048', 12)).toBe(-2048);
    });

    it('应该正确解析十六进制立即数', () => {
      expect(parseImmediate('0x0', 12)).toBe(0);
      expect(parseImmediate('0x7ff', 12)).toBe(2047);
      expect(parseImmediate('0x800', 12)).toBe(-2048);
    });

    it('应该对超出范围的立即数抛出错误', () => {
      expect(() => parseImmediate('2048', 12)).toThrow('立即数必须在');
      expect(() => parseImmediate('-2049', 12)).toThrow('立即数必须在');
    });

    it('应该正确处理分支指令的偏移量', () => {
      expect(parseImmediate('2', 13)).toBe(1); // 2字节对齐，除以2
      expect(() => parseImmediate('3', 13)).toThrow('分支/跳转目标必须是2字节对齐的');
    });
  });

  describe('parseInstruction', () => {
    const labelMap = { 'loop': 8, 'end': 16 };

    it('应该正确解析R型指令', () => {
      const inst = parseInstruction('add x1, x2, x3', 0, {});
      expect(inst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '000',
        funct7: '0000000'
      });
    });

    it('应该正确解析I型指令', () => {
      const inst = parseInstruction('addi x1, x2, 10', 0, {});
      expect(inst).toEqual({
        type: 'I',
        opcode: '0010011',
        rd: 1,
        rs1: 2,
        imm: 10,
        funct3: '000'
      });
    });

    it('应该正确解析S型指令', () => {
      const inst = parseInstruction('sw x1, 4(x2)', 0, {});
      expect(inst).toEqual({
        type: 'S',
        opcode: '0100011',
        rs1: 2,
        rs2: 1,
        imm: 4,
        funct3: '010'
      });
    });

    it('应该正确解析B型指令', () => {
      const inst = parseInstruction('beq x1, x2, loop', 0, labelMap);
      expect(inst).toEqual({
        type: 'B',
        opcode: '1100011',
        rs1: 1,
        rs2: 2,
        imm: 8,
        funct3: '000'
      });
    });

    it('应该正确解析U型指令', () => {
      const inst = parseInstruction('lui x1, 0x12345', 0, {});
      expect(inst).toEqual({
        type: 'U',
        opcode: '0110111',
        rd: 1,
        imm: 0x12345
      });
    });

    it('应该正确解析J型指令', () => {
      const inst = parseInstruction('jal x1, end', 0, labelMap);
      expect(inst).toEqual({
        type: 'J',
        opcode: '1101111',
        rd: 1,
        imm: 16
      });
    });
  });

  describe('generateMachineCode', () => {
    it('应该正确生成R型指令的机器码', () => {
      const inst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '000',
        funct7: '0000000'
      };
      expect(generateMachineCode(inst)).toBe('0x00318133');
    });

    it('应该正确生成I型指令的机器码', () => {
      const inst = {
        type: 'I' as const,
        opcode: '0010011',
        rd: 1,
        rs1: 2,
        imm: 10,
        funct3: '000'
      };
      expect(generateMachineCode(inst)).toBe('0x00a10093');
    });

    it('应该正确生成S型指令的机器码', () => {
      const inst = {
        type: 'S' as const,
        opcode: '0100011',
        rs1: 2,
        rs2: 1,
        imm: 4,
        funct3: '010'
      };
      expect(generateMachineCode(inst)).toBe('0x00112223');
    });

    it('应该正确生成B型指令的机器码', () => {
      const inst = {
        type: 'B' as const,
        opcode: '1100011',
        rs1: 1,
        rs2: 2,
        imm: 8,
        funct3: '000'
      };
      expect(generateMachineCode(inst)).toBe('0x00208463');
    });

    it('应该正确生成U型指令的机器码', () => {
      const inst = {
        type: 'U' as const,
        opcode: '0110111',
        rd: 1,
        imm: 0x12345
      };
      expect(generateMachineCode(inst)).toBe('0x123450b7');
    });

    it('应该正确生成J型指令的机器码', () => {
      const inst = {
        type: 'J' as const,
        opcode: '1101111',
        rd: 1,
        imm: 16
      };
      expect(generateMachineCode(inst)).toBe('0x010000ef');
    });
  });

  describe('Assembler', () => {
    const assembler = new Assembler();

    it('应该正确汇编完整的程序', () => {
      const code = `
        # 简单的GCD程序
        addi x1, x0, 48     # a = 48
        addi x2, x0, 36     # b = 36

        loop:
        beq x2, x0, end     # if b == 0, 结束
        add x3, x2, x0      # temp = b
        sub x1, x1, x2      # a = a - b
        add x2, x1, x0      # b = a
        add x1, x3, x0      # a = temp
        beq x0, x0, loop    # 继续循环

        end:
      `;

      const result = assembler.assemble(code);
      expect(result).toHaveLength(7); // 7条指令
      expect(result[0].hex).toBe('0x03000093'); // addi x1, x0, 48
      expect(result[1].hex).toBe('0x02400113'); // addi x2, x0, 36
      expect(result[2].hex).toBe('0x00010663'); // beq x2, x0, end
      expect(result[3].hex).toBe('0x000101b3'); // add x3, x2, x0
      expect(result[4].hex).toBe('0x402080b3'); // sub x1, x1, x2
      expect(result[5].hex).toBe('0x00008133'); // add x2, x1, x0
      expect(result[6].hex).toBe('0x000180b3'); // add x1, x3, x0
    });

    it('应该正确处理注释和空行', () => {
      const code = `
        # 这是注释
        addi x1, x0, 1  # 这也是注释

        # 空行上面
        addi x2, x0, 2
      `;

      const result = assembler.assemble(code);
      expect(result).toHaveLength(2);
      expect(result[0].hex).toBe('0x00100093');
      expect(result[1].hex).toBe('0x00200113');
    });

    it('应该对无效指令抛出错误', () => {
      expect(() => assembler.assemble('invalid x1, x2, x3')).toThrow('不支持的指令');
      expect(() => assembler.assemble('add x1, x2')).toThrow('指令需要3个操作数');
      expect(() => assembler.assemble('addi x1, x2, 0x8000')).toThrow('立即数必须在');
    });
  });
});
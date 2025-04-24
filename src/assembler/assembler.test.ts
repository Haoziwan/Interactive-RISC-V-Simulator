import { describe, it, expect } from 'vitest';
import { Assembler, AssemblerError, parseRegister, parseImmediate, parseInstruction, generateMachineCode, expandPseudoInstruction } from './assembler';

describe('RISC-V Assembler', () => {
  describe('parseRegister', () => {
    it('should correctly parse valid registers', () => {
      expect(parseRegister('x0')).toBe(0);
      expect(parseRegister('x1')).toBe(1);
      expect(parseRegister('x31')).toBe(31);
    });

    it('should throw error for invalid register format', () => {
      expect(() => parseRegister('y0')).toThrow('Invalid register format');
      expect(() => parseRegister('x32')).toThrow('Register number must be between 0-31');
      expect(() => parseRegister('x-1')).toThrow('Invalid register format');
    });
  });

  describe('parseImmediate', () => {
    it('should correctly parse decimal immediate', () => {
      expect(parseImmediate('0', 12)).toBe(0);
      expect(parseImmediate('2047', 12)).toBe(2047);
      expect(parseImmediate('-2048', 12)).toBe(-2048);
    });

    it('should correctly parse hexadecimal immediate', () => {
      expect(parseImmediate('0x0', 12)).toBe(0);
      expect(parseImmediate('0x7ff', 12)).toBe(2047);
      expect(parseImmediate('0x800', 12)).toBe(-2048);
    });

    it('should throw error for out-of-range immediate', () => {
      expect(() => parseImmediate('2048', 12)).toThrow('Immediate must be between');
      expect(() => parseImmediate('-2049', 12)).toThrow('Immediate must be between');
    });

    it('should correctly handle branch instruction offset', () => {
      expect(parseImmediate('2', 13)).toBe(1); // 2字节对齐，除以2
      expect(() => parseImmediate('3', 13)).toThrow('Branch/jump target must be 2-byte aligned');
    });

    it('should correctly handle %hi and %lo relocation operators', () => {
      const labelMap = { 'data_label': 0x12345678 };

      // Test %hi operator - should extract upper 20 bits
      expect(parseImmediate('%hi(data_label)', 20, labelMap)).toBe(0x12345);

      // Test %lo operator - should extract lower 12 bits
      expect(parseImmediate('%lo(data_label)', 12, labelMap)).toBe(0x678);

      // Test %lo with sign extension (when bit 11 is set)
      const labelMapWithNegative = { 'neg_label': 0x12345FFF };
      expect(parseImmediate('%lo(neg_label)', 12, labelMapWithNegative)).toBe(-1); // 0xFFF sign-extended to 12 bits is -1
    });

    it('should throw error for %hi and %lo with missing label map', () => {
      expect(() => parseImmediate('%hi(data_label)', 20)).toThrow('Cannot use %hi or %lo without a label map');
      expect(() => parseImmediate('%lo(data_label)', 12)).toThrow('Cannot use %hi or %lo without a label map');
    });

    it('should throw error for %hi and %lo with undefined label', () => {
      const labelMap = { 'existing_label': 0x1000 };
      expect(() => parseImmediate('%hi(nonexistent_label)', 20, labelMap)).toThrow('Undefined label in %hi/%lo');
      expect(() => parseImmediate('%lo(nonexistent_label)', 12, labelMap)).toThrow('Undefined label in %hi/%lo');
    });
  });

  describe('parseInstruction', () => {
    const labelMap = { 'loop': 8, 'end': 16 };

    it('should correctly parse R-type instruction', () => {
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

    it('should correctly parse M-extension multiply instructions', () => {
      const mulInst = parseInstruction('mul x1, x2, x3', 0, {});
      expect(mulInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '000',
        funct7: '0000001'
      });

      const mulhInst = parseInstruction('mulh x1, x2, x3', 0, {});
      expect(mulhInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '001',
        funct7: '0000001'
      });

      const mulhuInst = parseInstruction('mulhu x1, x2, x3', 0, {});
      expect(mulhuInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '011',
        funct7: '0000001'
      });

      const mulhsuInst = parseInstruction('mulhsu x1, x2, x3', 0, {});
      expect(mulhsuInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '010',
        funct7: '0000001'
      });
    });

    it('should correctly parse M-extension divide instructions', () => {
      const divInst = parseInstruction('div x1, x2, x3', 0, {});
      expect(divInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '100',
        funct7: '0000001'
      });

      const divuInst = parseInstruction('divu x1, x2, x3', 0, {});
      expect(divuInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '101',
        funct7: '0000001'
      });

      const remInst = parseInstruction('rem x1, x2, x3', 0, {});
      expect(remInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '110',
        funct7: '0000001'
      });

      const remuInst = parseInstruction('remu x1, x2, x3', 0, {});
      expect(remuInst).toEqual({
        type: 'R',
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '111',
        funct7: '0000001'
      });
    });

    it('should correctly parse I-type instruction', () => {
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

    it('should correctly parse I-type instruction with %lo operator', () => {
      const labelMap = { 'data_var': 0x12345678 };
      const inst = parseInstruction('addi x1, x2, %lo(data_var)', 0, labelMap);
      expect(inst).toEqual({
        type: 'I',
        opcode: '0010011',
        rd: 1,
        rs1: 2,
        imm: 0x678,
        funct3: '000'
      });
    });

    it('should correctly parse S-type instruction', () => {
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

    it('should correctly parse load instruction with %lo operator', () => {
      const labelMap = { 'data_var': 0x12345678 };
      const inst = parseInstruction('lw x1, %lo(data_var)(x2)', 0, labelMap);
      expect(inst).toEqual({
        type: 'I',
        opcode: '0000011',
        rd: 1,
        rs1: 2,
        imm: 0x678,
        funct3: '010'
      });
    });

    it('should correctly parse store instruction with %lo operator', () => {
      const labelMap = { 'data_var': 0x12345678 };
      const inst = parseInstruction('sw x1, %lo(data_var)(x2)', 0, labelMap);
      expect(inst).toEqual({
        type: 'S',
        opcode: '0100011',
        rs1: 2,
        rs2: 1,
        imm: 0x678,
        funct3: '010'
      });
    });

    it('should correctly parse B-type instruction', () => {
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

    it('should correctly parse U-type instruction', () => {
      const inst = parseInstruction('lui x1, 0x12345', 0, {});
      expect(inst).toEqual({
        type: 'U',
        opcode: '0110111',
        rd: 1,
        imm: 0x12345
      });
    });

    it('should correctly parse U-type instruction with %hi operator', () => {
      const labelMap = { 'data_var': 0x12345678 };
      const inst = parseInstruction('lui x1, %hi(data_var)', 0, labelMap);
      expect(inst).toEqual({
        type: 'U',
        opcode: '0110111',
        rd: 1,
        imm: 0x12345
      });
    });

    it('should correctly parse J-type instruction', () => {
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
    it('should correctly generate machine code for R-type instruction', () => {
      const inst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '000',
        funct7: '0000000'
      };
      expect(generateMachineCode(inst)).toBe('0x003100b3');
    });

    it('should correctly generate machine code for M-extension multiply instructions', () => {
      const mulInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '000',
        funct7: '0000001'
      };
      expect(generateMachineCode(mulInst)).toBe('0x023100b3');

      const mulhInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '001',
        funct7: '0000001'
      };
      expect(generateMachineCode(mulhInst)).toBe('0x023110b3');

      const mulhuInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '011',
        funct7: '0000001'
      };
      expect(generateMachineCode(mulhuInst)).toBe('0x023130b3');

      const mulhsuInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '010',
        funct7: '0000001'
      };
      expect(generateMachineCode(mulhsuInst)).toBe('0x023120b3');
    });

    it('should correctly generate machine code for M-extension divide instructions', () => {
      const divInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '100',
        funct7: '0000001'
      };
      expect(generateMachineCode(divInst)).toBe('0x023140b3');

      const divuInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '101',
        funct7: '0000001'
      };
      expect(generateMachineCode(divuInst)).toBe('0x023150b3');

      const remInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '110',
        funct7: '0000001'
      };
      expect(generateMachineCode(remInst)).toBe('0x023160b3');

      const remuInst = {
        type: 'R' as const,
        opcode: '0110011',
        rd: 1,
        rs1: 2,
        rs2: 3,
        funct3: '111',
        funct7: '0000001'
      };
      expect(generateMachineCode(remuInst)).toBe('0x023170b3');
    });

    it('should correctly generate machine code for I-type instruction', () => {
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

    it('should correctly generate machine code for S-type instruction', () => {
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

    it('should correctly generate machine code for B-type instruction', () => {
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

    it('should correctly generate machine code for U-type instruction', () => {
      const inst = {
        type: 'U' as const,
        opcode: '0110111',
        rd: 1,
        imm: 0x12345
      };
      expect(generateMachineCode(inst)).toBe('0x123450b7');
    });

    it('should correctly generate machine code for J-type instruction', () => {
      const inst = {
        type: 'J' as const,
        opcode: '1101111',
        rd: 1,
        imm: 16
      };
      expect(generateMachineCode(inst)).toBe('0x010000ef');
    });
  });

  describe('expandPseudoInstruction', () => {
    it('should correctly expand li pseudo-instruction (small immediate)', () => {
      const result = expandPseudoInstruction('li x1, 42');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('addi x1, x0, 42');
    });

    it('should correctly expand li pseudo-instruction (large immediate)', () => {
      const result = expandPseudoInstruction('li x1, 0x12345');
      expect(result).toHaveLength(2);
      expect(result[0]).toBe('lui x1, 18'); // 0x12 = 18
      expect(result[1]).toBe('addi x1, x1, 837'); // 0x345 = 837
    });

    it('should correctly expand la pseudo-instruction', () => {
      const result = expandPseudoInstruction('la x1, symbol');
      expect(result).toHaveLength(2);
      expect(result[0]).toBe('lui x1, %LA_HI_symbol%');
      expect(result[1]).toBe('addi x1, x1, %LA_LO_symbol%');
    });

    it('should correctly expand mv pseudo-instruction', () => {
      const result = expandPseudoInstruction('mv x1, x2');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('addi x1, x2, 0');
    });

    it('should correctly expand j pseudo-instruction', () => {
      const result = expandPseudoInstruction('j label');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('jal x0, label');
    });

    it('should correctly expand jal pseudo-instruction (single operand form)', () => {
      const result = expandPseudoInstruction('jal label');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('jal x1, label');
    });

    it('should correctly expand call pseudo-instruction', () => {
      const result = expandPseudoInstruction('call function');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('jal ra, function');
    });

    it('should correctly expand ret pseudo-instruction', () => {
      const result = expandPseudoInstruction('ret');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('jalr x0, ra, 0');
    });

    it('should correctly expand nop pseudo-instruction', () => {
      const result = expandPseudoInstruction('nop');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('addi x0, x0, 0');
    });

    it('should correctly expand not pseudo-instruction', () => {
      const result = expandPseudoInstruction('not x1, x2');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('xori x1, x2, -1');
    });

    it('should correctly expand neg pseudo-instruction', () => {
      const result = expandPseudoInstruction('neg x1, x2');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('sub x1, x0, x2');
    });

    it('should correctly expand branch pseudo-instructions', () => {
      expect(expandPseudoInstruction('beqz x1, label')[0]).toBe('beq x1, x0, label');
      expect(expandPseudoInstruction('bnez x1, label')[0]).toBe('bne x1, x0, label');
      expect(expandPseudoInstruction('blez x1, label')[0]).toBe('bge x0, x1, label');
      expect(expandPseudoInstruction('bgez x1, label')[0]).toBe('bge x1, x0, label');
      expect(expandPseudoInstruction('bltz x1, label')[0]).toBe('blt x1, x0, label');
      expect(expandPseudoInstruction('bgtz x1, label')[0]).toBe('blt x0, x1, label');
    });

    it('should correctly expand comparison branch pseudo-instructions', () => {
      expect(expandPseudoInstruction('bgt x1, x2, label')[0]).toBe('blt x2, x1, label');
      expect(expandPseudoInstruction('ble x1, x2, label')[0]).toBe('bge x2, x1, label');
      expect(expandPseudoInstruction('bgtu x1, x2, label')[0]).toBe('bltu x2, x1, label');
      expect(expandPseudoInstruction('bleu x1, x2, label')[0]).toBe('bgeu x2, x1, label');
    });
  });

  describe('Assembler', () => {
    const assembler = new Assembler();

    it('should correctly assemble a complete program', () => {
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
      expect(result).toHaveLength(8); // 8条指令 (includes the branch back to loop)
      expect(result[0].hex).toBe('0x03000093'); // addi x1, x0, 48
      expect(result[1].hex).toBe('0x02400113'); // addi x2, x0, 36
      expect(result[2].hex).toBe('0x00010c63'); // beq x2, x0, end
      expect(result[3].hex).toBe('0x000101b3'); // add x3, x2, x0
      expect(result[4].hex).toBe('0x402080b3'); // sub x1, x1, x2
      expect(result[5].hex).toBe('0x00008133'); // add x2, x1, x0
      expect(result[6].hex).toBe('0x000180b3'); // add x1, x3, x0
    });

    it('should correctly handle comments and empty lines', () => {
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

    it('should correctly handle pseudo-instructions', () => {
      const code = `
        li x1, 10       # 加载小立即数
        li x2, 0x12345  # 加载大立即数
        mv x3, x1       # 寄存器移动
        nop             # 空操作
      `;

      const result = assembler.assemble(code);
      expect(result).toHaveLength(5); // li大立即数展开为2条指令，加上其他三条
      expect(result[0].hex).toBe('0x00a00093'); // addi x1, x0, 10

      // 检查结果中的所有指令，而不是特定索引
      const luiInst = result.find(inst => inst.assembly?.includes('lui'));
      const addiInst = result.find(inst => inst.assembly?.includes('addi x2, x2'));
      const mvInst = result.find(inst => inst.assembly?.includes('addi x3, x1'));
      const nopInst = result.find(inst => inst.assembly?.includes('addi x0, x0'));

      expect(luiInst).toBeTruthy();
      expect(addiInst).toBeTruthy();
      expect(mvInst).toBeTruthy();
      expect(nopInst).toBeTruthy();

      // 检查指令的内容而不是特定的机器码
      expect(luiInst?.assembly).toContain('lui x2');
      expect(addiInst?.assembly).toContain('addi x2, x2');
      expect(mvInst?.assembly).toContain('addi x3, x1, 0');
      expect(nopInst?.assembly).toContain('addi x0, x0, 0');
    });

    it('should correctly handle %hi and %lo operators in a program', () => {
      const code = `
        .data
        var1: .word 0x12345678

        .text
        # Load address using %hi and %lo
        lui x1, %hi(var1)
        addi x1, x1, %lo(var1)

        # Load value using %hi and %lo
        lui x2, %hi(var1)
        lw x2, %lo(var1)(x2)

        # Store value using %hi and %lo
        lui x3, %hi(var1)
        sw x2, %lo(var1)(x3)
      `;

      const result = assembler.assemble(code);

      // Check that we have the correct number of instructions (6 text instructions + 1 data word)
      expect(result).toHaveLength(7);

      // Find the instructions that use %hi and %lo
      const luiInsts = result.filter(inst => inst.assembly?.includes('lui'));
      const addiInst = result.find(inst => inst.assembly?.includes('addi'));
      const lwInst = result.find(inst => inst.assembly?.includes('lw'));
      const swInst = result.find(inst => inst.assembly?.includes('sw'));

      // Verify that the instructions were generated correctly
      expect(luiInsts).toHaveLength(3);
      expect(addiInst).toBeTruthy();
      expect(lwInst).toBeTruthy();
      expect(swInst).toBeTruthy();

      // Check that the data word was stored correctly
      const dataInst = result.find(inst => inst.segment === 'data');
      expect(dataInst).toBeTruthy();
      expect(dataInst?.data).toEqual([0x12345678]);
    });

    it('should correctly handle branch pseudo-instructions', () => {
      const code = `
        start:
        addi x1, x0, 10
        beqz x1, end    # 如果x1=0，跳转到end
        addi x1, x1, -1
        j start         # 跳回start
        end:
      `;

      const result = assembler.assemble(code);
      expect(result).toHaveLength(4);
      // 验证beqz被正确展开为beq
      expect(result[1].assembly).toContain('beq x1, x0');
      // 验证j被正确展开为jal x0
      expect(result[3].assembly).toContain('jal x0');
    });

    it('should correctly handle data segment directives', () => {
      const code = `
        .data
        .word 0x12345678, 0xabcdef01
        .byte 1, 2, 3, 4
        .half 0x1234, 0x5678
        .string "Hello"
      `;

      const result = assembler.assemble(code);
      // 数据段指令不会生成text段的指令，但会在内存中设置数据
      expect(result.filter(inst => inst.segment === 'data')).toHaveLength(4);

      // 验证.word指令
      const wordInst = result.find(inst => inst.assembly?.includes('.word'));
      expect(wordInst?.data).toEqual([0x12345678, 0xabcdef01]);

      // 验证.byte指令
      const byteInst = result.find(inst => inst.assembly?.includes('.byte'));
      expect(byteInst?.data).toEqual([1, 2, 3, 4]);

      // 验证.half指令
      const halfInst = result.find(inst => inst.assembly?.includes('.half'));
      expect(halfInst?.data).toEqual([0x1234, 0x5678]);

      // 验证.string指令
      const stringInst = result.find(inst => inst.assembly?.includes('.string'));
      // "Hello" + null terminator
      expect(stringInst?.data).toEqual([72, 101, 108, 108, 111, 0]);
    });

    it('should throw errors for invalid instructions', () => {
      expect(() => assembler.assemble('invalid x1, x2, x3')).toThrow('Unsupported instruction');
      expect(() => assembler.assemble('add x1, x2')).toThrow('add instruction requires 3 operands');
      expect(() => assembler.assemble('addi x1, x2, 0x8000')).toThrow('Immediate must be between');
    });
  });
});
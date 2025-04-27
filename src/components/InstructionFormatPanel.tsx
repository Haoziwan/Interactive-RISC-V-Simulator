import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { InstructionFormatDiagram } from './InstructionFormatDiagram';

// Define an interface for instruction formats; each format includes a type label and an array of instructions.
interface InstructionFormat {
  type: string;
  instructions: string[];
}

// Revised instruction formats array based on the RISC-V RV32I standard.
// Each instruction string includes the assembly syntax and a brief description.
const instructionFormats: InstructionFormat[] = [
  {
    type: 'R-Type Instructions',
    instructions: [
      'add rd, rs1, rs2 - Addition',
      'sub rd, rs1, rs2 - Subtraction',
      'sll rd, rs1, rs2 - Logical Left Shift',
      'slt rd, rs1, rs2 - Set Less Than (signed)',
      'sltu rd, rs1, rs2 - Set Less Than Unsigned',
      'xor rd, rs1, rs2 - Bitwise XOR',
      'srl rd, rs1, rs2 - Logical Right Shift',
      'sra rd, rs1, rs2 - Arithmetic Right Shift',
      'or rd, rs1, rs2 - Bitwise OR',
      'and rd, rs1, rs2 - Bitwise AND'
    ]
  },
  {
    type: 'I-Type Instructions',
    instructions: [
      'addi rd, rs1, imm - Immediate Addition',
      'slti rd, rs1, imm - Immediate Set Less Than (signed)',
      'sltiu rd, rs1, imm - Immediate Set Less Than Unsigned',
      'xori rd, rs1, imm - Immediate Bitwise XOR',
      'ori rd, rs1, imm - Immediate Bitwise OR',
      'andi rd, rs1, imm - Immediate Bitwise AND',
      'slli rd, rs1, imm - Immediate Logical Left Shift',
      'srli rd, rs1, imm - Immediate Logical Right Shift',
      'srai rd, rs1, imm - Immediate Arithmetic Right Shift',
      'jalr rd, rs1, imm - Jump and Link Register (I-Type)',
      'lb rd, offset(rs1) - Load Byte',
      'lh rd, offset(rs1) - Load Half Word',
      'lw rd, offset(rs1) - Load Word',
      'lbu rd, offset(rs1) - Load Byte Unsigned',
      'lhu rd, offset(rs1) - Load Half Word Unsigned'
    ]
  },
  {
    type: 'S-Type Instructions',
    instructions: [
      'sb rs2, offset(rs1) - Store Byte',
      'sh rs2, offset(rs1) - Store Half Word',
      'sw rs2, offset(rs1) - Store Word'
    ]
  },
  {
    type: 'B-Type Instructions',
    instructions: [
      'beq rs1, rs2, offset - Branch if Equal',
      'bne rs1, rs2, offset - Branch if Not Equal',
      'blt rs1, rs2, offset - Branch if Less Than (signed)',
      'bge rs1, rs2, offset - Branch if Greater Than or Equal (signed)',
      'bltu rs1, rs2, offset - Branch if Less Than Unsigned',
      'bgeu rs1, rs2, offset - Branch if Greater Than or Equal Unsigned'
    ]
  },
  {
    type: 'U-Type Instructions',
    instructions: [
      'lui rd, imm - Load Upper Immediate',
      'auipc rd, imm - Add Upper Immediate to PC'
    ]
  },
  {
    type: 'J-Type Instructions',
    instructions: [
      'jal rd, offset - Jump and Link'
    ]
  },
  {
    type: 'M-Extension Instructions',
    instructions: [
      'mul rd, rs1, rs2 - Multiplication (lower 32 bits)',
      'mulh rd, rs1, rs2 - Multiplication High (signed×signed)',
      'mulhu rd, rs1, rs2 - Multiplication High (unsigned×unsigned)',
      'mulhsu rd, rs1, rs2 - Multiplication High (signed×unsigned)',
      'div rd, rs1, rs2 - Division (signed)',
      'divu rd, rs1, rs2 - Division (unsigned)',
      'rem rd, rs1, rs2 - Remainder (signed)',
      'remu rd, rs1, rs2 - Remainder (unsigned)'
    ]
  },
  {
    type: 'Basic Pseudo-Instructions',
    instructions: [
      'li rd, imm - Load Immediate (expands to lui+addi or addi)',
      'la rd, symbol - Load Address (expands to lui+addi)',
      'mv rd, rs - Move (expands to addi rd, rs, 0)',
      'call label - Call subroutine (expands to jal ra, label)',
      'ret - Return from subroutine (expands to jalr x0, ra, 0)',
      'nop - No Operation (expands to addi x0, x0, 0)'
    ]
  },
  {
    type: 'Global Load/Store Pseudo-Instructions',
    instructions: [
      'lb rd, symbol - Load byte from global (auipc + lb)',
      'lh rd, symbol - Load halfword from global (auipc + lh)',
      'lw rd, symbol - Load word from global (auipc + lw)',
      'ld rd, symbol - Load doubleword from global (auipc + ld)',
      'lbu rd, symbol - Load byte unsigned from global (auipc + lbu)',
      'lhu rd, symbol - Load halfword unsigned from global (auipc + lhu)',
      'lwu rd, symbol - Load word unsigned from global (auipc + lwu)',
      'sb rs2, symbol, rt - Store byte to global (auipc + sb)',
      'sh rs2, symbol, rt - Store halfword to global (auipc + sh)',
      'sw rs2, symbol, rt - Store word to global (auipc + sw)',
      'sd rs2, symbol, rt - Store doubleword to global (auipc + sd)'
    ]
  },
  {
    type: 'Arithmetic Pseudo-Instructions',
    instructions: [
      'not rd, rs - One\'s complement (xori rd, rs, -1)',
      'neg rd, rs - Two\'s complement (sub rd, x0, rs)',
      'seqz rd, rs - Set if equal to zero (sltiu rd, rs, 1)',
      'snez rd, rs - Set if not equal to zero (sltu rd, x0, rs)',
      'sltz rd, rs - Set if less than zero (slt rd, rs, x0)',
      'sgtz rd, rs - Set if greater than zero (slt rd, x0, rs)'
    ]
  },
  {
    type: 'Branch Pseudo-Instructions',
    instructions: [
      'beqz rs, offset - Branch if equal to zero (beq rs, x0, offset)',
      'bnez rs, offset - Branch if not equal to zero (bne rs, x0, offset)',
      'blez rs, offset - Branch if less/equal to zero (bge x0, rs, offset)',
      'bgez rs, offset - Branch if greater/equal to zero (bge rs, x0, offset)',
      'bltz rs, offset - Branch if less than zero (blt rs, x0, offset)',
      'bgtz rs, offset - Branch if greater than zero (blt x0, rs, offset)',
      'bgt rs, rt, offset - Branch if greater than (blt rt, rs, offset)',
      'ble rs, rt, offset - Branch if less/equal (bge rt, rs, offset)',
      'bgtu rs, rt, offset - Branch if greater than unsigned (bltu rt, rs, offset)',
      'bleu rs, rt, offset - Branch if less/equal unsigned (bgeu rt, rs, offset)'
    ]
  },
  {
    type: 'Jump Pseudo-Instructions',
    instructions: [
      'j offset - Jump (jal x0, offset)',
      'jal offset - Jump and link (jal x1, offset)',
      'jr rs - Jump register (jalr x0, rs, 0)',
      'jalr rs - Jump and link register (jalr x1, rs, 0)',
      'jalr rd, imm(rs1) - Jump and link register with offset (jalr rd, rs1, imm)',
      'tail offset - Tail call subroutine (jal x0, offset)'
    ]
  },
  {
    type: 'Assembly Directives',
    instructions: [
      '.text - Text section declaration',
      '.data - Data section declaration',
      '.word w1, w2, ... - Define words (4 bytes)',
      '.half h1, h2, ... - Define half words (2 bytes)',
      '.byte b1, b2, ... - Define bytes',
      '.ascii "string" - Define ASCII string (not null terminated)',
      '.asciz "string" - Define ASCII string (null terminated)',
      '.string "string" - Define ASCII string (null terminated, same as .asciz)',
      '.space size - Allocate space of specified size (filled with zeros)',
      '.zero size - Allocate space of specified size (filled with zeros, same as .space)',
      '.equ symbol, value - Define a constant symbol with the specified value',

    ]
  },
  // {
  //   type: 'Relocation Operators',
  //   instructions: [
  //     '%hi(symbol) - Extract upper 20 bits of symbol address (bits 31:12)',
  //     '%lo(symbol) - Extract lower 12 bits of symbol address (bits 11:0)',
  //     'lui rd, %hi(symbol) - Load upper bits of address',
  //     'addi rd, rd, %lo(symbol) - Add lower bits to complete address',
  //     'lw rd, %lo(symbol)(rs1) - Load from address using %lo offset',
  //     'sw rs2, %lo(symbol)(rs1) - Store to address using %lo offset'
  //   ]
  // },
  {
    type: 'System Instructions',
    instructions: [
      'ecall - Environment Call (System Call)',
      'a7=1: Print Integer (a0 = integer to print)',
      'a7=4: Print String (a0 = address of string)',
      'a7=5: Read Integer (result stored in a0)',
      'a7=8: Read String (a0 = buffer address, a1 = max length)',
      'a7=10: Exit Program',
      'a7=11: Print Character (a0 = character code)',
      'a7=12: Read Character (result stored in a0)',
      'a7=93: Exit Program (Linux compatible)',
      'ebreak - Breakpoint (Debug Instruction)',
    ]
  }
];

// The InstructionFormatPanel component displays the supported instruction formats in a panel.
// It uses a state variable to control whether the panel is expanded or collapsed.
export function InstructionFormatPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* When expanded, display a modal-like panel with an overlay */}
      {isExpanded && (
        <>
          {/* Overlay: clicking on it will collapse the panel */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setIsExpanded(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] text-sm bg-white p-6 rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out z-[101] max-h-[80vh] overflow-y-auto"
            style={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? '1' : '0.95' }}
          >
            {/* Instruction Format Diagrams */}
            <div className="mb-6">
              <InstructionFormatDiagram />
            </div>

            {/* Instruction List */}
            <div className="grid grid-cols-3 gap-4">
              {instructionFormats.map((format) => (
                <div
                  key={format.type}
                  className="min-w-0 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <h4 className="font-semibold text-gray-800 mb-3">{format.type}</h4>
                  <ul className="list-none space-y-2">
                    {format.instructions.map((instruction, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// A button component that toggles the instruction format panel
export function InstructionFormatButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center"
        title="Instruction Guide"
      >
        <BookOpen className="w-4 h-4" />
      </button>

      {/* When expanded, display the panel */}
      {isExpanded && (
        <>
          {/* Overlay: clicking on it will collapse the panel */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setIsExpanded(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] text-sm bg-white p-6 rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out z-[101] max-h-[80vh] overflow-y-auto"
            style={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? '1' : '0.95' }}
          >
            {/* Instruction Format Diagrams */}
            <div className="mb-6">
              <InstructionFormatDiagram />
            </div>

            {/* Instruction List */}
            <div className="grid grid-cols-3 gap-4">
              {instructionFormats.map((format) => (
                <div
                  key={format.type}
                  className="min-w-0 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <h4 className="font-semibold text-gray-800 mb-3">{format.type}</h4>
                  <ul className="list-none space-y-2">
                    {format.instructions.map((instruction, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

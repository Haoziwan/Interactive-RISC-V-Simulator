import { useState } from 'react';
import { BookOpen } from 'lucide-react';

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
    type: 'Pseudo-Instructions',
    instructions: [
      'li rd, imm - Load Immediate (expands to lui+addi or addi)',
      'la rd, symbol - Load Address (expands to lui+addi)',
      'mv rd, rs - Move (expands to addi rd, rs, 0)',
      'j offset - Jump (expands to jal x0, offset)',
      'call label - Call subroutine (expands to jal ra, label)',
      'ret - Return from subroutine (expands to jalr x0, ra, 0)',
      'nop - No Operation (expands to addi x0, x0, 0)'
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
      '.asciz "string" - Define ASCII string (null terminated)'
    ]
  },
  {
    type: 'ECALL Instructions',
    instructions: [
      'ecall - Environment Call (System Call)',
      'a7=1: Print Integer (a0 = integer to print)',
      'a7=4: Print String (a0 = address of string)',
      'a7=10: Exit Program',
      'a7=11: Print Character (a0 = character code)',
      'a7=93: Exit Program (Linux compatible)'
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] grid grid-cols-3 gap-4 text-sm bg-white p-6 rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out z-[101] max-h-[80vh] overflow-y-auto"
            style={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? '1' : '0.95' }}
          >
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] grid grid-cols-3 gap-4 text-sm bg-white p-6 rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out z-[101] max-h-[80vh] overflow-y-auto"
            style={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? '1' : '0.95' }}
          >
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
        </>
      )}
    </>
  );
}

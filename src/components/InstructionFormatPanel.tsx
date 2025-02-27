import { useState } from 'react';

interface InstructionFormat {
  type: string;
  instructions: string[];
}

const instructionFormats: InstructionFormat[] = [
  {
    type: 'R-Type Instructions',
    instructions: [
      'add rd, rs1, rs2 - Addition',
      'sub rd, rs1, rs2 - Subtraction',
      'and rd, rs1, rs2 - Bitwise AND',
      'or rd, rs1, rs2 - Bitwise OR',
      'xor rd, rs1, rs2 - Bitwise XOR',
      'sll rd, rs1, rs2 - Logical Left Shift',
      'srl rd, rs1, rs2 - Logical Right Shift',
      'sra rd, rs1, rs2 - Arithmetic Right Shift',
      'slt rd, rs1, rs2 - Set Less Than',
      'sltu rd, rs1, rs2 - Set Less Than Unsigned'
    ]
  },
  {
    type: 'I-Type Instructions',
    instructions: [
      'addi rd, rs1, imm - Immediate Addition',
      'andi rd, rs1, imm - Immediate Bitwise AND',
      'ori rd, rs1, imm - Immediate Bitwise OR',
      'xori rd, rs1, imm - Immediate Bitwise XOR',
      'slli rd, rs1, imm - Immediate Logical Left Shift',
      'srli rd, rs1, imm - Immediate Logical Right Shift',
      'srai rd, rs1, imm - Immediate Arithmetic Right Shift',
      'lw rd, offset(rs1) - Load Word',
      'lb rd, offset(rs1) - Load Byte',
      'lh rd, offset(rs1) - Load Half Word'
    ]
  },
  {
    type: 'S-Type Instructions',
    instructions: [
      'sw rs2, offset(rs1) - Store Word',
      'sb rs2, offset(rs1) - Store Byte',
      'sh rs2, offset(rs1) - Store Half Word'
    ]
  },
  {
    type: 'B-Type Instructions',
    instructions: [
      'beq rs1, rs2, offset - Branch if Equal',
      'bne rs1, rs2, offset - Branch if Not Equal',
      'blt rs1, rs2, offset - Branch if Less Than',
      'bge rs1, rs2, offset - Branch if Greater or Equal',
      'bltu rs1, rs2, offset - Branch if Less Than Unsigned',
      'bgeu rs1, rs2, offset - Branch if Greater or Equal Unsigned'
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
      'jal rd, offset - Jump and Link',
      'jalr rd, offset(rs1) - Jump and Link Register'
    ]
  }
];

export function InstructionFormatPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4 relative">
      <div 
        className="flex items-center cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold">
          Supported Instruction Formats
        </h3>
        <span className="ml-2 text-gray-500">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="absolute bottom-full mb-2 left-0 right-0 grid grid-cols-3 gap-2 text-sm bg-gray-50 p-3 rounded shadow-lg transition-all duration-300 ease-in-out transform origin-bottom w-[800px]" style={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? '1' : '0.95' }}>
          {instructionFormats.map((format) => (
            <div key={format.type} className="min-w-0">
              <h4 className="font-medium text-gray-700 mb-1">{format.type}</h4>
              <ul className="list-none space-y-0.5">
                {format.instructions.map((instruction, index) => (
                  <li key={index} className="text-xs text-gray-600 truncate hover:text-clip hover:whitespace-normal">{instruction}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
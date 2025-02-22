import { useState } from 'react';

interface InstructionFormat {
  type: string;
  instructions: string[];
}

const instructionFormats: InstructionFormat[] = [
  {
    type: 'R型指令',
    instructions: [
      'add rd, rs1, rs2 - 加法',
      'sub rd, rs1, rs2 - 减法',
      'and rd, rs1, rs2 - 按位与',
      'or rd, rs1, rs2 - 按位或',
      'xor rd, rs1, rs2 - 按位异或',
      'sll rd, rs1, rs2 - 逻辑左移',
      'srl rd, rs1, rs2 - 逻辑右移',
      'sra rd, rs1, rs2 - 算术右移',
      'slt rd, rs1, rs2 - 小于则置位',
      'sltu rd, rs1, rs2 - 无符号小于则置位'
    ]
  },
  {
    type: 'I型指令',
    instructions: [
      'addi rd, rs1, imm - 立即数加法',
      'andi rd, rs1, imm - 立即数按位与',
      'ori rd, rs1, imm - 立即数按位或',
      'xori rd, rs1, imm - 立即数按位异或',
      'slli rd, rs1, imm - 立即数逻辑左移',
      'srli rd, rs1, imm - 立即数逻辑右移',
      'srai rd, rs1, imm - 立即数算术右移',
      'lw rd, offset(rs1) - 加载字',
      'lb rd, offset(rs1) - 加载字节',
      'lh rd, offset(rs1) - 加载半字'
    ]
  },
  {
    type: 'S型指令',
    instructions: [
      'sw rs2, offset(rs1) - 存储字',
      'sb rs2, offset(rs1) - 存储字节',
      'sh rs2, offset(rs1) - 存储半字'
    ]
  },
  {
    type: 'B型指令',
    instructions: [
      'beq rs1, rs2, offset - 相等跳转',
      'bne rs1, rs2, offset - 不等跳转',
      'blt rs1, rs2, offset - 小于跳转',
      'bge rs1, rs2, offset - 大于等于跳转',
      'bltu rs1, rs2, offset - 无符号小于跳转',
      'bgeu rs1, rs2, offset - 无符号大于等于跳转'
    ]
  },
  {
    type: 'U型指令',
    instructions: [
      'lui rd, imm - 加载高位立即数',
      'auipc rd, imm - PC相对加载高位立即数'
    ]
  },
  {
    type: 'J型指令',
    instructions: [
      'jal rd, offset - 跳转并链接',
      'jalr rd, offset(rs1) - 寄存器跳转并链接'
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
          支持的指令格式
        </h3>
        <span className="ml-2 text-gray-500">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="absolute bottom-full mb-2 left-0 right-0 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded shadow-lg transition-all duration-300 ease-in-out transform origin-bottom" style={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? '1' : '0.95' }}>
          {instructionFormats.map((format) => (
            <div key={format.type}>
              <h4 className="font-medium">{format.type}</h4>
              <ul className="list-disc list-inside">
                {format.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
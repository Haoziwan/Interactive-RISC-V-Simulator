import React from 'react';

// Define the structure for instruction format bit fields
interface BitField {
  start: number;
  end: number;
  label: string;
  description?: string;
}

// Define the structure for instruction formats
interface InstructionFormatType {
  name: string;
  fields: BitField[];
}

// Define the RISC-V instruction formats based on the provided image
const instructionFormats: InstructionFormatType[] = [
  {
    name: 'R-type',
    fields: [
      { start: 31, end: 25, label: 'funct7' },
      { start: 24, end: 20, label: 'rs2' },
      { start: 19, end: 15, label: 'rs1' },
      { start: 14, end: 12, label: 'funct3' },
      { start: 11, end: 7, label: 'rd' },
      { start: 6, end: 0, label: 'opcode' }
    ]
  },
  {
    name: 'I-type',
    fields: [
      { start: 31, end: 20, label: 'imm[11:0]' },
      { start: 19, end: 15, label: 'rs1' },
      { start: 14, end: 12, label: 'funct3' },
      { start: 11, end: 7, label: 'rd' },
      { start: 6, end: 0, label: 'opcode' }
    ]
  },
  {
    name: 'S-type',
    fields: [
      { start: 31, end: 25, label: 'imm[11:5]' },
      { start: 24, end: 20, label: 'rs2' },
      { start: 19, end: 15, label: 'rs1' },
      { start: 14, end: 12, label: 'funct3' },
      { start: 11, end: 7, label: 'imm[4:0]' },
      { start: 6, end: 0, label: 'opcode' }
    ]
  },
  {
    name: 'B-type',
    fields: [
      { start: 31, end: 25, label: 'imm[12|10:5]' },
      { start: 24, end: 20, label: 'rs2' },
      { start: 19, end: 15, label: 'rs1' },
      { start: 14, end: 12, label: 'funct3' },
      { start: 11, end: 7, label: 'imm[4:1|11]' },
      { start: 6, end: 0, label: 'opcode' }
    ]
  },
  {
    name: 'U-type',
    fields: [
      { start: 31, end: 12, label: 'imm[31:12]' },
      { start: 11, end: 7, label: 'rd' },
      { start: 6, end: 0, label: 'opcode' }
    ]
  },
  {
    name: 'J-type',
    fields: [
      { start: 31, end: 12, label: 'imm[20|10:1|11|19:12]' },
      { start: 11, end: 7, label: 'rd' },
      { start: 6, end: 0, label: 'opcode' }
    ]
  }
];

// Component to render a single bit field
const BitFieldCell: React.FC<{
  field: BitField;
  width: number;
  showBitNumbers?: boolean;
}> = ({ field, width, showBitNumbers = true }) => {
  return (
    <div
      className="border border-gray-300 py-1 px-0.5 text-center flex flex-col justify-center"
      style={{ width: `${width}%` }}
    >
      <div className="text-[10px] font-medium leading-tight">{field.label}</div>
      {showBitNumbers && (
        <div className="text-[8px] text-gray-500 mt-0.5 leading-tight">
          {field.start === field.end ? field.start : `${field.start}:${field.end}`}
        </div>
      )}
    </div>
  );
};

// Component to render bit numbers at the top of the diagram
const BitNumbers: React.FC = () => {
  const bits = [31, 27, 26, 25, 24, 20, 19, 15, 14, 12, 11, 7, 6, 0];

  return (
    <div className="flex justify-between w-full mb-0.5 px-0.5">
      {bits.map((bit, index) => (
        <div key={index} className="text-[9px] text-gray-500">{bit}</div>
      ))}
    </div>
  );
};

// Component to render a single instruction format diagram
const FormatDiagram: React.FC<{ format: InstructionFormatType }> = ({ format }) => {
  // Calculate the width of each field based on the number of bits it spans
  const getFieldWidth = (field: BitField) => {
    const totalBits = 32; // RISC-V uses 32-bit instructions
    const fieldBits = field.start - field.end + 1;
    return (fieldBits / totalBits) * 100;
  };

  return (
    <div className="mb-1">
      <h3 className="text-xs font-semibold mb-1">{format.name}</h3>
      <div className="flex">
        {format.fields.map((field, index) => (
          <BitFieldCell
            key={index}
            field={field}
            width={getFieldWidth(field)}
          />
        ))}
      </div>
    </div>
  );
};

// Main component to display all instruction format diagrams
export const InstructionFormatDiagram: React.FC = () => {
  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <h2 className="text-base font-bold mb-2">Core Instruction Formats</h2>
      <BitNumbers />
      <div className="space-y-1">
        {instructionFormats.map((format, index) => (
          <FormatDiagram key={index} format={format} />
        ))}
      </div>
    </div>
  );
};

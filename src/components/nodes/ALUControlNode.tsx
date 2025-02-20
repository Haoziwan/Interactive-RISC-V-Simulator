import { Handle, Position } from 'reactflow';

interface ALUControlNodeData {
  label: string;
  aluOp?: string;
  funct3?: string;
  funct7?: string;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ALUControlNode({ data, selected }: { data: ALUControlNodeData; selected?: boolean }) {
  const aluOp = data.aluOp || '00';
  const funct3 = data.funct3 || '000';
  const funct7 = data.funct7 || '0000000';

  // 根据ALUOp和funct字段生成ALU控制信号
  const generateALUControl = (aluOp: string, funct3: string, funct7: string): string => {
    if (aluOp === '00') {
      // Load/Store指令：执行加法
      return '0010';
    } else if (aluOp === '01') {
      // Branch指令：根据funct3确定比较类型
      switch (funct3) {
        case '000': return '0110'; // beq: 减法判断是否为0
        case '001': return '0110'; // bne: 减法判断是否不为0
        case '100': return '0111'; // blt: 有符号比较小于
        case '101': return '0111'; // bge: 有符号比较大于等于
        case '110': return '1010'; // bltu: 无符号比较小于
        case '111': return '1010'; // bgeu: 无符号比较大于等于
        default: return '0110';
      }
    } else if (aluOp === '10') {
      // R-type/I-type指令：根据funct3和funct7确定
      switch (funct3) {
        case '000':
          return funct7 === '0000000' ? '0010' : '0110'; // add/sub
        case '001': return '0111'; // sll: 逻辑左移
        case '010': return '0111'; // slt: 有符号比较设置
        case '011': return '1010'; // sltu: 无符号比较设置
        case '100': return '0011'; // xor: 异或
        case '101':
          return funct7 === '0000000' ? '1000' : '1001'; // srl/sra: 逻辑/算术右移
        case '110': return '0001'; // or: 逻辑或
        case '111': return '0000'; // and: 逻辑与
        default: return '0000';
      }
    } else if (aluOp === '11') {
      // I-type特殊指令
      switch (funct3) {
        case '000': return '0010'; // addi
        case '010': return '0111'; // slti
        case '011': return '1010'; // sltiu
        case '100': return '0011'; // xori
        case '110': return '0001'; // ori
        case '111': return '0000'; // andi
        default: return '0010';
      }
    }
    return '0000';
  };

  const aluControl = generateALUControl(aluOp, funct3, funct7);

  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="aluOp" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }} 
        title="ALU操作码" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="funct3" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '50%' }} 
        title="功能码3" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="funct7" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }} 
        title="功能码7" 
      />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">ALU Control</div>
          <div className="text-gray-500">ALUOp: {aluOp}</div>
          <div className="text-gray-500">Funct3: {funct3}</div>
          <div className="text-gray-500">Funct7: {funct7}</div>
          <div className="text-gray-500">ALU Control: {aluControl}</div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="control" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }} 
        title="ALU控制信号" 
      />
    </div>
  );
}
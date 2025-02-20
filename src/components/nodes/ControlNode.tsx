import { Handle, Position } from 'reactflow';

interface ControlNodeData {
  label: string;
  opcode?: string;
  regWrite?: boolean;
  memRead?: boolean;
  memWrite?: boolean;
  aluOp?: string;
  branch?: boolean;
  jump?: boolean;
  aluSrc?: boolean;
  memToReg?: boolean;
}

export function ControlNode({ data, selected }: { data: ControlNodeData; selected?: boolean }) {
  const opcode = data.opcode || '0000000';

  // 根据opcode生成控制信号
  const generateControlSignals = (opcode: string) => {
    // 提取opcode的关键位
    const op = opcode.slice(0, 7);
    
    switch (op) {
      case '0110011': // R-type
        return {
          regWrite: true,
          memRead: false,
          memWrite: false,
          aluOp: '10',
          branch: false,
          jump: false,
          aluSrc: false,
          memToReg: false
        };
      case '0010011': // I-type ALU
        return {
          regWrite: true,
          memRead: false,
          memWrite: false,
          aluOp: '11',
          branch: false,
          jump: false,
          aluSrc: true,
          memToReg: false
        };
      case '0000011': // I-type Load
        return {
          regWrite: true,
          memRead: true,
          memWrite: false,
          aluOp: '00',
          branch: false,
          jump: false,
          aluSrc: true,
          memToReg: true
        };
      case '0100011': // S-type
        return {
          regWrite: false,
          memRead: false,
          memWrite: true,
          aluOp: '00',
          branch: false,
          jump: false,
          aluSrc: true,
          memToReg: false
        };
      case '1100011': // B-type
        return {
          regWrite: false,
          memRead: false,
          memWrite: false,
          aluOp: '01',
          branch: true,
          jump: false,
          aluSrc: false,
          memToReg: false
        };
      case '1101111': // J-type (jal)
        return {
          regWrite: true,
          memRead: false,
          memWrite: false,
          aluOp: '00',
          branch: false,
          jump: true,
          aluSrc: false,
          memToReg: false
        };
      case '1100111': // I-type (jalr)
        return {
          regWrite: true,
          memRead: false,
          memWrite: false,
          aluOp: '00',
          branch: false,
          jump: true,
          aluSrc: true,
          memToReg: false
        };
      case '0110111': // U-type (lui)
      case '0010111': // U-type (auipc)
        return {
          regWrite: true,
          memRead: false,
          memWrite: false,
          aluOp: '00',
          branch: false,
          jump: false,
          aluSrc: true,
          memToReg: false
        };
      default:
        return {
          regWrite: false,
          memRead: false,
          memWrite: false,
          aluOp: '00',
          branch: false,
          jump: false,
          aluSrc: false,
          memToReg: false
        };
    }
  };

  const controlSignals = generateControlSignals(opcode);

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="opcode" 
        className="w-3 h-3 bg-blue-400" 
        title="指令操作码"
      />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Control Unit</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Opcode: {data.opcode || '0000000'}</div>
            <div>RegWrite: {data.regWrite ? '1' : '0'}</div>
            <div>MemRead: {data.memRead ? '1' : '0'}</div>
            <div>MemWrite: {data.memWrite ? '1' : '0'}</div>
            <div>ALUOp: {data.aluOp || '00'}</div>
            <div>Branch: {data.branch ? '1' : '0'}</div>
            <div>Jump: {data.jump ? '1' : '0'}</div>
            <div>ALUSrc: {data.aluSrc ? '1' : '0'}</div>
            <div>MemToReg: {data.memToReg ? '1' : '0'}</div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="regWrite" className="w-3 h-3 bg-green-400" style={{ top: '10%' }} title="寄存器写使能" />
      <Handle type="source" position={Position.Right} id="memRead" className="w-3 h-3 bg-green-400" style={{ top: '25%' }} title="内存读使能" />
      <Handle type="source" position={Position.Right} id="memWrite" className="w-3 h-3 bg-green-400" style={{ top: '40%' }} title="内存写使能" />
      <Handle type="source" position={Position.Right} id="aluOp" className="w-3 h-3 bg-green-400" style={{ top: '55%' }} title="ALU操作码" />
      <Handle type="source" position={Position.Right} id="branch" className="w-3 h-3 bg-green-400" style={{ top: '70%' }} title="分支信号" />
      <Handle type="source" position={Position.Right} id="jump" className="w-3 h-3 bg-green-400" style={{ top: '85%' }} title="跳转信号" />
      <Handle type="source" position={Position.Right} id="aluSrc" className="w-3 h-3 bg-green-400" style={{ top: '92%' }} title="ALU输入B选择" />
      <Handle type="source" position={Position.Right} id="memToReg" className="w-3 h-3 bg-green-400" style={{ top: '97%' }} title="写回数据选择" />
    </div>
  );
}
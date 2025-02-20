import { Handle, Position } from 'reactflow';

interface RegisterFileNodeData {
  label: string;
  registers?: { [key: number]: number };
  readReg1?: number;
  readReg2?: number;
  writeReg?: number;
  writeData?: number;
  regWrite?: boolean;
}

export function RegisterFileNode({ data, selected }: { data: RegisterFileNodeData; selected?: boolean }) {
  const registers = data.registers || {};
  const readReg1 = data.readReg1 || 0;
  const readReg2 = data.readReg2 || 0;
  const writeReg = data.writeReg || 0;
  const writeData = data.writeData || 0;
  const regWrite = data.regWrite || false;

  // 读取寄存器数据（组合逻辑）
  const readData1 = readReg1 === 0 ? 0 : (registers[readReg1] || 0);
  const readData2 = readReg2 === 0 ? 0 : (registers[readReg2] || 0);

  // 时钟上升沿触发寄存器写入
  const handleClockEdge = () => {
    if (regWrite && writeReg !== 0) {
      registers[writeReg] = writeData;
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Left} id="readReg1" className="w-2 h-2" />
      <Handle type="target" position={Position.Left} id="readReg2" className="w-2 h-2 mt-4" />
      <Handle type="target" position={Position.Left} id="writeReg" className="w-2 h-2 mt-8" />
      <Handle type="target" position={Position.Left} id="writeData" className="w-2 h-2 mt-12" />
      <Handle type="target" position={Position.Left} id="regWrite" className="w-2 h-2 mt-16" />
      <Handle type="target" position={Position.Left} id="clock" className="w-2 h-2 mt-20" />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Register File</div>
          <div className="text-gray-500">Read Reg 1: x{readReg1} = {readData1}</div>
          <div className="text-gray-500">Read Reg 2: x{readReg2} = {readData2}</div>
          <div className="text-gray-500">Write Reg: x{writeReg}</div>
          <div className="text-gray-500">Write Data: {writeData}</div>
          <div className="text-gray-500">RegWrite: {regWrite ? '1' : '0'}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="readData1" className="w-2 h-2" />
      <Handle type="source" position={Position.Right} id="readData2" className="w-2 h-2 mt-4" />
    </div>
  );
}
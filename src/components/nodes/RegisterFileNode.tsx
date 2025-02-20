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
      {/* Input ports on left */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="readReg1" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '20%' }}
        title="读寄存器1地址"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="readReg2" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '40%' }}
        title="读寄存器2地址"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="writeReg" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '60%' }}
        title="写寄存器地址"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="writeData" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '80%' }}
        title="写入数据"
      />
      
      {/* Output ports on right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="readData1" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '30%' }}
        title="读出数据1"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="readData2" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '70%' }}
        title="读出数据2"
      />

      {/* Control ports at bottom */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="regWrite" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '30%' }}
        title="寄存器写使能"
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="clock" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '70%' }}
        title="时钟信号"
      />
      
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
    </div>
  );
}
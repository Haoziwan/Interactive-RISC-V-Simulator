import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface RegisterFileNodeData {
  label: string;
  readReg1?: number;
  readReg2?: number;
  writeReg?: number;
  writeData?: number;
  regWrite?: boolean;
  reset?: boolean;
}

export function RegisterFileNode({ data, id, selected }: { data: RegisterFileNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const registers = useCircuitStore((state) => state.registers);
  const updateRegisters = useCircuitStore((state) => state.updateRegisters);
  
  const readReg1 = data.readReg1 || 0;
  const readReg2 = data.readReg2 || 0;
  const writeReg = data.writeReg || 0;
  const writeData = data.writeData || 0;
  const regWrite = data.regWrite || false;
  const reset = data.reset || false;
  
  const [inputReadReg1, setInputReadReg1] = React.useState<number>(0);
  const [inputReadReg2, setInputReadReg2] = React.useState<number>(0);
  const [inputWriteReg, setInputWriteReg] = React.useState<number>(0);
  const [inputWriteData, setInputWriteData] = React.useState<number>(0);
  const [inputRegWrite, setInputRegWrite] = React.useState<boolean>(false);
  
  const nodes = useNodes();
  const edges = useEdges();

  // 读取寄存器数据（组合逻辑）
  const readData1 = readReg1 === 0 ? 0 : (registers[readReg1] || 0);
  const readData2 = readReg2 === 0 ? 0 : (registers[readReg2] || 0);

  // 监听复位信号
  React.useEffect(() => {
    if (reset) {
      updateNodeData(id, {
        ...data,
        readReg1: 0,
        readReg2: 0,
        writeReg: 0,
        writeData: 0,
        regWrite: false
      });
      updateRegisters({});
      setInputReadReg1(0);
      setInputReadReg2(0);
      setInputWriteReg(0);
      setInputWriteData(0);
      setInputRegWrite(false);
    }
  }, [reset]);

  // 监听输入连接的变化
  React.useEffect(() => {
    edges.forEach(edge => {
      if (edge.target === id) {
        const sourceNode = nodes.find(node => node.id === edge.source);
        if (sourceNode?.data && typeof sourceNode.data === 'object' && 'value' in sourceNode.data) {
          const value = sourceNode.data.value;
          
          switch (edge.targetHandle) {
            case 'readReg1':
              if (typeof value === 'number') setInputReadReg1(value);
              break;
            case 'readReg2':
              if (typeof value === 'number') setInputReadReg2(value);
              break;
            case 'writeReg':
              if (typeof value === 'number') setInputWriteReg(value);
              break;
            case 'writeData':
              if (typeof value === 'number') setInputWriteData(value);
              break;
            case 'regWrite':
              setInputRegWrite(Boolean(value));
              break;
          }
        }
      }
    });
  }, [nodes, edges, id]);

  // 监听时钟信号(stepCount)
  React.useEffect(() => {
    if (!reset) {
      // 更新当前值，同时更新输出端口的值
      updateNodeData(id, {
        ...data,
        readReg1: inputReadReg1,
        readReg2: inputReadReg2,
        writeReg: inputWriteReg,
        writeData: inputWriteData,
        regWrite: inputRegWrite,
        readData1: readData1,  // 添加输出端口的值
        readData2: readData2   // 添加输出端口的值
      });
    }
  }, [stepCount, readData1, readData2]);

  // 监听寄存器写入
  React.useEffect(() => {
    if (regWrite && writeReg !== 0) {
      updateRegisters({
        [writeReg]: writeData
      });
    }
  }, [writeData, writeReg, regWrite]);

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Control port at top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="regWrite" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '50%' }}
        title="寄存器写使能"
      />

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
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
  
  const nodes = useNodes();
  const edges = useEdges();

  // 读取寄存器数据（组合逻辑）
  const readData1 = readReg1 === 0 ? 0 : (registers[readReg1] || 0);
  const readData2 = readReg2 === 0 ? 0 : (registers[readReg2] || 0);

  // 获取输入端口的值（组合逻辑）
  const getInputValue = (portId: string): number | boolean => {
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === portId);
    if (!inputEdge) return 0;

    const sourceNode = nodes.find(node => node.id === inputEdge.source);
    if (!sourceNode?.data || typeof sourceNode.data !== 'object') return 0;

    if ('value' in sourceNode.data) {
      const value = sourceNode.data.value;
      if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }
    }
    return 0;
  };

  // 更新输入值和读取数据（组合逻辑）
  React.useEffect(() => {
    const newReadReg1 = Number(getInputValue('readReg1'));
    const newReadReg2 = Number(getInputValue('readReg2'));
    const newWriteReg = Number(getInputValue('writeReg'));
    const newWriteData = Number(getInputValue('writeData'));
    const newRegWrite = Boolean(getInputValue('regWrite'));

    // 只在输入值发生变化时更新节点数据
    if (newReadReg1 !== readReg1 ||
        newReadReg2 !== readReg2 ||
        newWriteReg !== writeReg ||
        newWriteData !== writeData ||
        newRegWrite !== regWrite) {
      
      updateNodeData(id, {
        ...data,
        readReg1: newReadReg1,
        readReg2: newReadReg2,
        writeReg: newWriteReg,
        writeData: newWriteData,
        regWrite: newRegWrite,
        readData1: newReadReg1 === 0 ? 0 : (registers[newReadReg1] || 0),
        readData2: newReadReg2 === 0 ? 0 : (registers[newReadReg2] || 0)
      });
    }
  }, [edges, nodes, id, registers]);

  // 监听时钟信号(stepCount)，处理寄存器写入（时序逻辑）
  React.useEffect(() => {
    // 获取最新的输入值
    const currentWriteReg = Number(getInputValue('writeReg'));
    const currentWriteData = Number(getInputValue('writeData'));
    const currentRegWrite = Boolean(getInputValue('regWrite'));

    // 在时钟上升沿且未复位时进行写入操作
    if (!reset && currentRegWrite && currentWriteReg !== 0) {
      updateRegisters({
        [currentWriteReg]: currentWriteData
      });
    }
  }, [stepCount]);

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
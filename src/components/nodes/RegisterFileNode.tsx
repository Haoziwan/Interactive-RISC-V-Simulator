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
  readData1?: number;
  readData2?: number;
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
  const inputsRef = React.useRef({
    readReg1: 0,
    readReg2: 0,
    writeReg: 0,
    writeData: 0,
    regWrite: false
  });

  // 获取输入端口的值（组合逻辑）
  const getInputValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // 首先尝试根据输入端口ID查找对应字段
      const portId = edge.sourceHandle;
      let sourceValue: number | boolean | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        // 如果存在对应端口ID的字段，使用该字段值
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
      } else if ('value' in sourceNode.data) {
        // 否则使用默认的value字段
        const value = (sourceNode.data as { value?: number | boolean }).value;
        sourceValue = typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
      }

      return sourceValue ?? null;
    }
    return null;
  };

  // 更新输入值和读取数据（组合逻辑）
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const readReg1Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'readReg1');
    const readReg2Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'readReg2');
    const writeRegEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'writeReg');
    const writeDataEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'writeData');
    const regWriteEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'regWrite');

    const newReadReg1 = Number(getInputValue(readReg1Edge) ?? inputsRef.current.readReg1);
    const newReadReg2 = Number(getInputValue(readReg2Edge) ?? inputsRef.current.readReg2);
    const newWriteReg = Number(getInputValue(writeRegEdge) ?? inputsRef.current.writeReg);
    const newWriteData = Number(getInputValue(writeDataEdge) ?? inputsRef.current.writeData);
    const newRegWrite = Boolean(getInputValue(regWriteEdge) ?? inputsRef.current.regWrite);

    // 只有当输入值发生实际变化时才更新
    const hasChanges = newReadReg1 !== inputsRef.current.readReg1 ||
                      newReadReg2 !== inputsRef.current.readReg2 ||
                      newWriteReg !== inputsRef.current.writeReg ||
                      newWriteData !== inputsRef.current.writeData ||
                      newRegWrite !== inputsRef.current.regWrite;

    if (hasChanges) {
      // 更新ref中的值
      inputsRef.current = {
        readReg1: newReadReg1,
        readReg2: newReadReg2,
        writeReg: newWriteReg,
        writeData: newWriteData,
        regWrite: newRegWrite
      };

      // 计算读出的数据
      const readData1 = newReadReg1 === 0 ? 0 : (registers[newReadReg1] || 0);
      const readData2 = newReadReg2 === 0 ? 0 : (registers[newReadReg2] || 0);

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        readReg1: newReadReg1,
        readReg2: newReadReg2,
        writeReg: newWriteReg,
        writeData: newWriteData,
        regWrite: newRegWrite,
        readData1,
        readData2
      });
    }
  };
  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, nodes, id, registers]);

  // 监听时钟信号(stepCount)，处理寄存器写入（时序逻辑）
  React.useEffect(() => {
    if (!reset && inputsRef.current.regWrite && inputsRef.current.writeReg !== 0) {
      updateRegisters({
        [inputsRef.current.writeReg]: inputsRef.current.writeData
      });
    }
  }, [stepCount, reset]);

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
          <div className="text-gray-500">Read Reg 1: x{readReg1} = {data.readData1 || 0}</div>
          <div className="text-gray-500">Read Reg 2: x{readReg2} = {data.readData2 || 0}</div>
          <div className="text-gray-500">Write Reg: x{writeReg}</div>
          <div className="text-gray-500">Write Data: {writeData}</div>
          <div className="text-gray-500">RegWrite: {regWrite ? '1' : '0'}</div>
        </div>
      </div>
    </div>
  );
}
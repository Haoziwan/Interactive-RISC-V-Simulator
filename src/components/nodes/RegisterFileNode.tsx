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
  // Get input port value (combinational logic)
  const getInputValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // First try to find the corresponding field by input port ID
      const portId = edge.sourceHandle;
      let sourceValue: number | boolean | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        // If there is a field corresponding to the port ID, use that field value
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
      } else if ('value' in sourceNode.data) {
        // Otherwise use the default value field
        const value = (sourceNode.data as { value?: number | boolean }).value;
        sourceValue = typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
      }

      return sourceValue ?? null;
    }
    return null;
  };
  // Update input values and read data (combinational logic)
  const updateInputConnections = () => {
    // Find edges connected to this node
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

    // Only update when input values have actually changed
    const hasChanges = newReadReg1 !== inputsRef.current.readReg1 ||
                      newReadReg2 !== inputsRef.current.readReg2 ||
                      newWriteReg !== inputsRef.current.writeReg ||
                      newWriteData !== inputsRef.current.writeData ||
                      newRegWrite !== inputsRef.current.regWrite;

    if (hasChanges) {
      // Update values in ref
      inputsRef.current = {
        readReg1: newReadReg1,
        readReg2: newReadReg2,
        writeReg: newWriteReg,
        writeData: newWriteData,
        regWrite: newRegWrite
      };

      // Calculate read data
      const readData1 = newReadReg1 === 0 ? 0 : (registers[newReadReg1] || 0);
      const readData2 = newReadReg2 === 0 ? 0 : (registers[newReadReg2] || 0);

      // Update node data
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
  // Monitor changes in input connections
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, nodes, id, registers]);

  // Monitor clock signal (stepCount) and handle register write (sequential logic)
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
        title="Register Write Enable"
      />

      {/* Input ports on left */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="readReg1" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '20%' }}
        title="Read Register 1 Address"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="readReg2" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '40%' }}
        title="Read Register 2 Address"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="writeReg" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '60%' }}
        title="Write Register Address"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="writeData" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '80%' }}
        title="Write Data"
      />
      
      {/* Output ports on right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="readData1" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '30%' }}
        title="Read Data 1"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="readData2" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '70%' }}
        title="Read Data 2"
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
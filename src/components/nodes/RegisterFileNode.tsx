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
  writeFirst?: boolean;
}

export function RegisterFileNode({ data, id, selected }: { data: RegisterFileNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
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

    const newReadReg1 = Number(getInputValue(readReg1Edge) ?? data.readReg1 ?? 0);
    const newReadReg2 = Number(getInputValue(readReg2Edge) ?? data.readReg2 ?? 0);
    const newWriteReg = Number(getInputValue(writeRegEdge) ?? data.writeReg ?? 0);
    const newWriteData = Number(getInputValue(writeDataEdge) ?? data.writeData ?? 0);
    const newRegWrite = Boolean(getInputValue(regWriteEdge) ?? data.regWrite ?? false);

    // Calculate read data regardless of input changes
    const writeFirst = data.writeFirst || false;
    const readData1 = newReadReg1 === 0 ? 0 :
      (writeFirst && newRegWrite && newReadReg1 === newWriteReg) ? newWriteData : (registers[newReadReg1] || 0);
    const readData2 = newReadReg2 === 0 ? 0 :
      (writeFirst && newRegWrite && newReadReg2 === newWriteReg) ? newWriteData : (registers[newReadReg2] || 0);

    // Update node data if inputs changed or register values changed
    const hasChanges = newReadReg1 !== (data.readReg1 || 0) ||
                      newReadReg2 !== (data.readReg2 || 0) ||
                      newWriteReg !== (data.writeReg || 0) ||
                      newWriteData !== (data.writeData || 0) ||
                      newRegWrite !== (data.regWrite || false) ||
                      readData1 !== data.readData1 ||
                      readData2 !== data.readData2;

    if (hasChanges) {


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
    if (!reset && data.regWrite && data.writeReg && data.writeReg !== 0) {
      updateRegisters({
        [data.writeReg]: data.writeData || 0
      });
    }
  }, [stepCount, reset]);

  const [showConfig, setShowConfig] = React.useState(false);
  const [tempWriteFirst, setTempWriteFirst] = React.useState(data.writeFirst ?? false);

  // 确保在showConfig变化时同步tempWriteFirst状态
  React.useEffect(() => {
    if (showConfig) {
      setTempWriteFirst(data.writeFirst ?? false);
    }
  }, [showConfig, data.writeFirst]);

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

      <button
        type="button"
        onClick={() => setShowConfig(!showConfig)}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100"
        title="Configure"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

      {showConfig && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 right-0">
          <div className="mb-4">
            <label htmlFor="write-first-checkbox" className="block text-sm font-medium text-gray-700 mb-1">Write First</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={tempWriteFirst}
                onChange={(e) => setTempWriteFirst(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
                title="Enable write-first mode"
                id="write-first-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">Enable write-first</span>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowConfig(false);
                setTempWriteFirst(data.writeFirst || false);
              }}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                updateNodeData(id, {
                  ...data,
                  writeFirst: tempWriteFirst
                });
                setShowConfig(false);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Register File</div>
          {!disableUIUpdates && (
            <>
              <div className="text-gray-500">Read Reg 1: x{readReg1} = {data.readData1 || 0}</div>
              <div className="text-gray-500">Read Reg 2: x{readReg2} = {data.readData2 || 0}</div>
              <div className="text-gray-500">Write Reg: x{writeReg}</div>
              <div className="text-gray-500">Write Data: {writeData}</div>
              <div className="text-gray-500">RegWrite: {regWrite ? '1' : '0'}</div>
              <div className="text-gray-500">WriteFirst: {data.writeFirst ? 'true' : 'false'}</div>
            </>
          )}
          {/* Add placeholder div when UI updates are disabled to maintain height */}
          {disableUIUpdates && (
            <div style={{ height: '120px' }}></div>
          )}
        </div>
      </div>
    </div>
  );
}
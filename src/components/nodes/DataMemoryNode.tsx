import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface DataMemoryNodeData {
  label: string;
  address?: number;
  writeData?: number;
  memRead?: number;
  memWrite?: number;
  size?: number;
  readData?: number;
}

export function DataMemoryNode({ data, id, selected }: { data: DataMemoryNodeData; id: string; selected?: boolean }) {
  const memory = useCircuitStore((state) => state.memory);
  const updateMemory = useCircuitStore((state) => state.updateMemory);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  const address = data.address || 0;
  const writeData = data.writeData || 0;
  const memRead = data.memRead || 0;
  const memWrite = data.memWrite || 0;
  const size = data.size || 1024; // 默认1KB
  const stepCount = useCircuitStore((state) => state.stepCount);
  const [inputAddress, setInputAddress] = React.useState<number>(0);
  const [inputWriteData, setInputWriteData] = React.useState<number>(0);
  const [inputMemRead, setInputMemRead] = React.useState<number>(0);
  const [inputMemWrite, setInputMemWrite] = React.useState<number>(0);

  // 监听输入连接的变化
  React.useEffect(() => {
    // 找到连接到此节点的所有边
    const inputEdges = edges.filter(edge => edge.target === id);
    
    inputEdges.forEach(edge => {
      // 找到源节点
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = edge.targetHandle;
        let sourceValue: number | boolean | undefined;

        // 根据端口ID获取对应的值
        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          sourceValue = sourceNode.data[portId as keyof typeof sourceNode.data] as number | boolean;
        } else if ('value' in sourceNode.data) {
          sourceValue = (sourceNode.data as { value?: number | boolean }).value;
        }

        // 根据端口类型更新输入缓存
        if (sourceValue !== undefined) {
          switch (portId) {
            case 'address':
              if (typeof sourceValue === 'number') setInputAddress(sourceValue);
              break;
            case 'writeData':
              if (typeof sourceValue === 'number') setInputWriteData(sourceValue);
              break;
            case 'memRead':
              if (typeof sourceValue === 'number') setInputMemRead(sourceValue);
              break;
            case 'memWrite':
              if (typeof sourceValue === 'number') setInputMemWrite(sourceValue);
              break;
          }
        }
      }
    });
  }, [nodes, edges, id]);

  // 监听时钟信号(stepCount)
  React.useEffect(() => {
    // 更新当前值
    updateNodeData(id, {
      ...data,
      address: inputAddress,
      writeData: inputWriteData,
      memRead: inputMemRead,
      memWrite: inputMemWrite
    });

    // 写入数据（时序逻辑）
    if (inputMemWrite > 0) {
      const addressHex = `0x${inputAddress.toString(16).padStart(8, '0')}`;
      updateMemory({
        [addressHex]: inputWriteData
      });
    }
  }, [stepCount]);

  // 读取数据（组合逻辑）
  const addressHex = `0x${address.toString(16).padStart(8, '0')}`;
  const readData = memRead > 0 ? (memory[addressHex] || 0) : 0;

  // 更新readData到节点数据
  React.useEffect(() => {
    if (data.readData !== readData) {
      updateNodeData(id, { ...data, readData });
    }
  }, [readData, data.readData, id]);

  // 写入数据（组合逻辑）
  React.useEffect(() => {
    if (memWrite > 0) {
      updateMemory({
        [addressHex]: writeData
      });
    }
  }, [memWrite, addressHex, writeData, updateMemory]);

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Control ports on left */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="memWrite" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '30%' }}
        title="写使能信号"
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="memRead" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '70%' }}
        title="读使能信号"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="address" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }}
        title="内存地址"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="writeData" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }}
        title="写入数据"
      />

      {/* Output port on right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="readData" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="读出数据"
      />

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Data Memory</div>
          <div className="text-gray-500">Address: 0x{address.toString(16).padStart(8, '0')}</div>
          <div className="text-gray-500">Write Data: {writeData}</div>
          <div className="text-gray-500">Read Data: {readData}</div>
          <div className="text-gray-500">MemRead: {memRead}</div>
          <div className="text-gray-500">MemWrite: {memWrite}</div>
          <div className="text-xs text-gray-400 mt-2">
            Size: {size} bytes
          </div>
        </div>
      </div>
    </div>
  );
}
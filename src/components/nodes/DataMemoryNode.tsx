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
  const stepCount = useCircuitStore((state) => state.stepCount);
  const nodes = useNodes();
  const edges = useEdges();

  const size = data.size || 1024; // 默认1KB

  // 获取输入端口的值
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
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const addressEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'address');
    const memReadEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memRead');
  
    const newAddress = Number(getInputValue(addressEdge) ?? data.address ?? 0);
    const newMemRead = Number(getInputValue(memReadEdge) ?? data.memRead ?? 0);
  
    // 只有当输入值发生实际变化时才更新
    const hasChanges = newAddress !== (data.address || 0) || newMemRead !== (data.memRead || 0);
  
    if (hasChanges) {
      // 更新节点数据（只更新读取相关的状态）
      const addressHex = `0x${newAddress.toString(16).padStart(8, '0')}`;
      const readData = newMemRead > 0 ? (memory[addressHex] || 0) : 0;
  
      updateNodeData(id, {
        ...data,
        address: newAddress,
        memRead: newMemRead,
        readData: readData
      });
    }
  };
  
  // 监听输入连接的变化（组合逻辑部分：读取操作）
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes, memory]);
  // 监听时钟信号（时序逻辑部分：写入操作）
  React.useEffect(() => {
    // 找到连接到此节点的边
    const writeDataEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'writeData');
    const memWriteEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memWrite');
  
    const newWriteData = Number(getInputValue(writeDataEdge) ?? data.writeData ?? 0);
    const newMemWrite = Number(getInputValue(memWriteEdge) ?? data.memWrite ?? 0);
    const newAddress = data.address || 0;
  
    // 只有当输入值发生实际变化时才更新
    const hasChanges = newWriteData !== (data.writeData || 0) || newMemWrite !== (data.memWrite || 0);
  
    if (hasChanges) {
      // 更新节点数据（写入相关的状态）
      const addressHex = `0x${newAddress.toString(16).padStart(8, '0')}`;
  
      // 写入数据
      if (newMemWrite > 0 && newWriteData !== memory[addressHex]) {
        updateMemory({
          [addressHex]: newWriteData
        });
      }
  
      // 更新节点状态
      updateNodeData(id, {
        ...data,
        writeData: newWriteData,
        memWrite: newMemWrite
      });
    }
  }, [stepCount]);
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
        title="Write Enable Signal"
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="memRead" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '70%' }}
        title="Read Enable Signal"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="address" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }}
        title="Memory Address"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="writeData" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }}
        title="Write Data"
      />
  
      {/* Output port on right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="readData" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="Read Data"
      />
  
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Data Memory</div>
          <div className="text-gray-500">Address: 0x{(data.address || 0).toString(16).padStart(8, '0')}</div>
          <div className="text-gray-500">Write Data: {data.writeData || 0}</div>
          <div className="text-gray-500">Read Data: {data.readData || 0}</div>
          <div className="text-gray-500">MemRead: {data.memRead || 0}</div>
          <div className="text-gray-500">MemWrite: {data.memWrite || 0}</div>
          <div className="text-xs text-gray-400 mt-2">
            Size: {size} bytes
          </div>
        </div>
      </div>
    </div>
  );
}
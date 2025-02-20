import { Handle, Position } from 'reactflow';

interface DataMemoryNodeData {
  label: string;
  address?: number;
  writeData?: number;
  memRead?: boolean;
  memWrite?: boolean;
  size?: number;
  contents?: { [key: number]: number };
}

export function DataMemoryNode({ data, selected }: { data: DataMemoryNodeData; selected?: boolean }) {
  const address = data.address || 0;
  const writeData = data.writeData || 0;
  const memRead = data.memRead || false;
  const memWrite = data.memWrite || false;
  const size = data.size || 1024; // 默认1KB
  const contents = data.contents || {};

  // 读取数据（组合逻辑）
  const readData = memRead ? (contents[address] || 0) : 0;

  // 写入数据（时钟边沿触发）
  const handleClockEdge = () => {
    if (memWrite) {
      contents[address] = writeData;
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Left} id="address" className="w-2 h-2" />
      <Handle type="target" position={Position.Left} id="writeData" className="w-2 h-2 mt-4" />
      <Handle type="target" position={Position.Left} id="memRead" className="w-2 h-2 mt-8" />
      <Handle type="target" position={Position.Left} id="memWrite" className="w-2 h-2 mt-12" />
      <Handle type="target" position={Position.Left} id="clock" className="w-2 h-2 mt-16" />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Data Memory</div>
          <div className="text-gray-500">Address: 0x{address.toString(16).padStart(8, '0')}</div>
          <div className="text-gray-500">Write Data: {writeData}</div>
          <div className="text-gray-500">Read Data: {readData}</div>
          <div className="text-gray-500">MemRead: {memRead ? '1' : '0'}</div>
          <div className="text-gray-500">MemWrite: {memWrite ? '1' : '0'}</div>
          <div className="text-xs text-gray-400 mt-2">
            Size: {size} bytes
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="readData" className="w-2 h-2" />
    </div>
  );
}
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
      {/* Input ports on left */}
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

      {/* Control ports at bottom */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="memRead" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '20%' }}
        title="内存读使能"
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="memWrite" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '50%' }}
        title="内存写使能"
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="clock" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '80%' }}
        title="时钟信号"
      />
      
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
    </div>
  );
}
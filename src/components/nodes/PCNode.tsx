import { Handle, Position } from 'reactflow';

interface PCNodeData {
  label: string;
  currentAddress?: number;
  nextAddress?: number;
  reset?: boolean;
}

export function PCNode({ data, selected }: { data: PCNodeData; selected?: boolean }) {
  const currentAddress = data.currentAddress || 0;
  const nextAddress = data.nextAddress || currentAddress + 4; // 默认下一条指令地址为当前地址+4

  // 时钟下降沿触发更新PC
  const handleClockEdge = () => {
    if (data.reset) {
      // 复位时将PC设置为0
      return 0;
    } else {
      // 更新为下一条指令地址
      return nextAddress;
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="next" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }}
        title="下一指令地址"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="clock" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '50%' }}
        title="时钟信号"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="reset" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }}
        title="复位信号"
      />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">PC</div>
          <div className="text-gray-500">Current: 0x{currentAddress.toString(16).padStart(8, '0')}</div>
          <div className="text-gray-500">Next: 0x{nextAddress.toString(16).padStart(8, '0')}</div>
          <div className="text-gray-500">Reset: {data.reset ? '1' : '0'}</div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="address" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="当前指令地址"
      />
    </div>
  );
}
import { Handle, Position } from 'reactflow';

export function ImmGenNode({ data, selected }: { 
  data: { 
    label: string;
    format?: 'I' | 'S' | 'B' | 'U' | 'J';
    onDelete?: () => void;
  }; 
  selected?: boolean 
}) {
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      {/* Input port on left */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="instruction" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '50%' }}
        title="指令数据"
      />

      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Immediate Gen</div>
          <div className="text-gray-500">Format: {data.format || 'I'}</div>
        </div>
      </div>

      {/* Output port on right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="immediate" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="立即数"
      />

      {/* Format selector at bottom */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="format" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '50%' }}
        title="立即数格式选择"
      />
    </div>
  );
}
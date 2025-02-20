import { Handle, Position } from 'reactflow';

export function MuxNode({ data, selected }: { 
  data: { 
    label: string;
    select?: string;
    onDelete?: () => void;
  }; 
  selected?: boolean 
}) {
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="in0" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }}
        title="输入0"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="in1" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }}
        title="输入1"
      />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">MUX</div>
          <div className="text-gray-500">Select: {data.select || '0'}</div>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="out" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }}
        title="输出"
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="select" 
        className="w-3 h-3 bg-yellow-400" 
        style={{ left: '50%' }}
        title="选择信号"
      />
    </div>
  );
}
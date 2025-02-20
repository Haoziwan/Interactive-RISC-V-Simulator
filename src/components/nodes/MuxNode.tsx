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
      
      <Handle type="target" position={Position.Left} id="in0" className="w-2 h-2" />
      <Handle type="target" position={Position.Left} id="in1" className="w-2 h-2 mt-4" />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">MUX</div>
          <div className="text-gray-500">Select: {data.select || '0'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-2 h-2" />
    </div>
  );
}
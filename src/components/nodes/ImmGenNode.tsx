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
      
      <Handle type="target" position={Position.Left} id="instruction" className="w-2 h-2" />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Immediate Gen</div>
          <div className="text-gray-500">Format: {data.format || 'I'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="immediate" className="w-2 h-2" />
    </div>
  );
}
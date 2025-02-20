import { Handle, Position } from 'reactflow';

export function MemoryNode({ data, selected }: { 
  data: { 
    label: string;
    size?: number;
    contents?: Record<number, number>;
  }; 
  selected?: boolean 
}) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Left} id="address" className="w-2 h-2" style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} id="writeData" className="w-2 h-2" style={{ top: '70%' }} />
      <Handle type="target" position={Position.Top} id="memWrite" className="w-2 h-2" />
      <Handle type="target" position={Position.Top} id="memRead" className="w-2 h-2" style={{ left: '70%' }} />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Memory</div>
          <div className="text-gray-500">Size: {data.size || 1024} bytes</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="readData" className="w-2 h-2" />
    </div>
  );
}
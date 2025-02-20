import { Handle, Position } from 'reactflow';

export function InstructionMemoryNode({ data, selected }: { 
  data: { 
    label: string;
    instructions?: string[];
    pc?: number;
    onDelete?: () => void;
  }; 
  selected?: boolean 
}) {
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      <Handle type="target" position={Position.Left} id="pc" className="w-2 h-2" />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Instruction Memory</div>
          <div className="text-xs text-gray-500">
            PC: {data.pc || 0}
            {data.instructions && data.instructions.length > 0 && (
              <div className="mt-1">
                Current: {data.instructions[data.pc || 0] || 'No instruction'}
              </div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="instruction" className="w-2 h-2" />
    </div>
  );
}
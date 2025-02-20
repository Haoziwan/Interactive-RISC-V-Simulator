import { Handle, Position } from 'reactflow';

interface BranchAdderNodeData {
  label: string;
  pc?: number;
  offset?: number;
  result?: number;
}

export function BranchAdderNode({ data, selected }: { data: BranchAdderNodeData; selected?: boolean }) {
  const pc = data.pc || 0;
  const offset = data.offset || 0;
  const result = data.result || pc + offset;

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="pc" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }} 
        title="程序计数器值" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="offset" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '60%' }} 
        title="分支偏移量" 
      />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Branch Adder</div>
          <div className="text-gray-500">PC: {pc}</div>
          <div className="text-gray-500">Offset: {offset}</div>
          <div className="text-gray-500">Result: {result}</div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="result" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '45%' }} 
        title="分支目标地址" 
      />
    </div>
  );
}
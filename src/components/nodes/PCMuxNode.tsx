import { Handle, Position } from 'reactflow';

interface PCMuxNodeData {
  label: string;
  pc4?: number;
  branchTarget?: number;
  select?: boolean;
  result?: number;
}

export function PCMuxNode({ data, selected }: { data: PCMuxNodeData; selected?: boolean }) {
  const pc4 = data.pc4 || 0;
  const branchTarget = data.branchTarget || 0;
  const select = data.select || false;
  const result = select ? branchTarget : pc4;

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Left} id="pc4" className="w-2 h-2" />
      <Handle type="target" position={Position.Left} id="branchTarget" className="w-2 h-2 mt-4" />
      <Handle type="target" position={Position.Left} id="select" className="w-2 h-2 mt-8" />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">PC Mux</div>
          <div className="text-gray-500">PC+4: {pc4}</div>
          <div className="text-gray-500">Branch Target: {branchTarget}</div>
          <div className="text-gray-500">Select: {select ? '1' : '0'}</div>
          <div className="text-gray-500">Result: {result}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="result" className="w-2 h-2" />
    </div>
  );
}
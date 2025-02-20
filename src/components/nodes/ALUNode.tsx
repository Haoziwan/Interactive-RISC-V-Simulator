import { Handle, Position } from 'reactflow';

type ALUOperation = 'Add' | 'Sub' | 'And' | 'Or' | 'Xor' | 'Sll' | 'Srl' | 'Sra' | 'Slt' | 'Sltu' | 'Lui' | 'Auipc';

interface ALUNodeData {
  label: string;
  operation?: ALUOperation;
  a?: number;
  b?: number;
  result?: number;
  zero?: boolean;
  pc?: number; // 用于AUIPC指令
  onDelete?: () => void; // 添加删除节点的回调函数
}

export function ALUNode({ data, selected }: { data: ALUNodeData; selected?: boolean }) {
  // 计算ALU结果
  const calculateResult = (a: number, b: number, operation: ALUOperation): number => {
    switch (operation) {
      case 'Add': return (a + b) | 0; // 确保32位运算
      case 'Sub': return (a - b) | 0;
      case 'And': return a & b;
      case 'Or': return a | b;
      case 'Xor': return a ^ b;
      case 'Sll': return (a << (b & 0x1F)) | 0; // 只使用低5位作为移位量
      case 'Srl': return (a >>> (b & 0x1F)) | 0;
      case 'Sra': return (a >> (b & 0x1F)) | 0;
      case 'Slt': return ((a | 0) < (b | 0)) ? 1 : 0; // 有符号比较
      case 'Sltu': return ((a >>> 0) < (b >>> 0)) ? 1 : 0; // 无符号比较
      case 'Lui': return b & 0xFFFFF000; // 高20位立即数
      case 'Auipc': return ((data.pc || 0) + (b & 0xFFFFF000)) | 0; // PC + 高20位立即数
      default: return 0;
    }
  };

  const a = data.a || 0;
  const b = data.b || 0;
  const operation = data.operation || 'Add';
  const result = data.result ?? calculateResult(a, b, operation);
  const zero = data.zero ?? (result === 0);

  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="a" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }} 
        title="输入操作数A" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="b" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '60%' }} 
        title="输入操作数B" 
      />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">ALU</div>
          <div className="text-gray-500">Operation: {operation}</div>
          <div className="text-gray-500">A: {a}</div>
          <div className="text-gray-500">B: {b}</div>
          <div className="text-gray-500">Result: {result}</div>
          <div className="text-gray-500">Zero: {zero ? '1' : '0'}</div>
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="result" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '30%' }} 
        title="计算结果" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="zero" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '60%' }} 
        title="零标志位" 
      />
    </div>
  );
}
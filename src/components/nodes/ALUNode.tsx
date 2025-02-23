import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useEffect, useRef } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

type ALUOperation = 2 | 6 | 0 | 1 | 3 | 7 | 8 | 9 | 10;

interface ALUNodeData {
  label: string;
  operation?: ALUOperation;
  a?: number;
  b?: number;
  result?: number;
  zero?: number;
  pc?: number;
  onDelete?: () => void;
}

export function ALUNode({ data, id, selected }: { data: ALUNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  const prevValuesRef = useRef({ a: data.a, b: data.b, operation: data.operation });

  const calculateResult = (a: number, b: number, operation: ALUOperation): number => {
    a = a | 0;
    b = b | 0;

    switch (operation) {
      case 2: return (a + b) | 0; // 加法
      case 6: return (a - b) | 0; // 减法
      case 0: return a & b;      // 与
      case 1: return a | b;      // 或
      case 3: return a ^ b;      // 异或
      case 7: return ((a | 0) < (b | 0)) ? 1 : 0;  // 有符号比较
      case 8: return (a >>> (b & 0x1F));          // 逻辑右移
      case 9: return (a >> (b & 0x1F));           // 算术右移
      case 10: return ((a >>> 0) < (b >>> 0)) ? 1 : 0; // 无符号比较
      default: return 0;
    }
  };

  interface NodeData {
    [key: string]: number | string | boolean | undefined | (() => void);
  }

  // 获取输入端口的值
  const getInputValue = (portId: string) => {
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === portId);
    if (!inputEdge) return 0;

    const sourceNode = nodes.find(node => node.id === inputEdge.source);
    if (!sourceNode?.data) return 0;

    const sourcePortId = inputEdge.sourceHandle;
    if (sourcePortId && typeof (sourceNode.data as NodeData)[sourcePortId] === 'number') {
      return (sourceNode.data as NodeData)[sourcePortId] as number;
    }
    return 0;
  };

  // 更新节点数据
  const updateNodeValues = () => {
    const a = getInputValue('a');
    const b = getInputValue('b');
    const controlInput = getInputValue('control');
    const operation = controlInput !== 0 ? controlInput as ALUOperation : data.operation ?? 2;

    // 检查值是否发生变化
    const hasChanged = 
      a !== prevValuesRef.current.a || 
      b !== prevValuesRef.current.b || 
      operation !== prevValuesRef.current.operation;

    if (hasChanged) {
      const result = calculateResult(a, b, operation);
      // 确保零标志位正确反映结果是否为零
      const zero = result === 0 ? 1 : 0;

      // 更新引用值
      prevValuesRef.current = { a, b, operation };

      // 立即更新节点数据，包括零标志位
      updateNodeData(id, {
        ...data,
        a,
        b,
        operation,
        result,
        zero
      });
    }
  };

  // 监听输入连接的变化
  useEffect(() => {
    updateNodeValues();
  }, [edges]);

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
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="control" 
        className="w-3 h-3 bg-yellow-400" 
        title="ALU控制信号" 
      />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">ALU</div>
          <div className="text-gray-500">Control: {data.operation ?? 2}</div>
          <div className="text-gray-500">A: {data.a ?? 0}</div>
          <div className="text-gray-500">B: {data.b ?? 0}</div>
          <div className="text-gray-500">Result: {data.result ?? 0}</div>
          <div className="text-gray-500">Zero: {data.zero ?? 0}</div>
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
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useEffect, useRef } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

// RISC-V 32I ALU operations
enum ALUOperation {
  // R-type and I-type arithmetic/logical operations
  AND = 0,      // Logical AND (and, andi)
  OR = 1,       // Logical OR (or, ori)
  ADD = 2,      // Addition (add, addi, load, store)
  XOR = 3,      // Logical XOR (xor, xori)
  SLL = 11,     // Logical Left Shift (sll, slli)
  SRL = 8,      // Logical Right Shift (srl, srli)
  SRA = 9,      // Arithmetic Right Shift (sra, srai)
  SUB = 6,      // Subtraction (sub)
  SLT = 7,      // Set Less Than (signed) (slt, slti)
  SLTU = 10,    // Set Less Than (unsigned) (sltu, sltiu)

  // M extension operations
  MUL = 12,     // Multiplication (mul) - lower 32 bits
  MULH = 13,    // Multiplication High Signed×Signed (mulh)
  MULHU = 14,   // Multiplication High Unsigned×Unsigned (mulhu)
  MULHSU = 15,  // Multiplication High Signed×Unsigned (mulhsu)
  DIV = 16,     // Division Signed (div)
  DIVU = 17,    // Division Unsigned (divu)
  REM = 18,     // Remainder Signed (rem)
  REMU = 19,    // Remainder Unsigned (remu)
}

interface ALUNodeData {
  label: string;
  operation?: ALUOperation;
  a?: number;
  b?: number;
  result?: number;
  zero?: number;
  onDelete?: () => void;
}

export function ALUNode({ data, id, selected }: { data: ALUNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = useRef({
    a: data.a ?? 0,
    b: data.b ?? 0,
    operation: data.operation ?? ALUOperation.ADD
  });

  const calculateResult = (a: number, b: number, operation: ALUOperation): {
    result: number;
    zero: number;
  } => {
    // Ensure inputs are 32-bit integers
    a = a | 0;
    b = b | 0;

    let result = 0;

    switch (operation) {
      // Arithmetic and logical operations
      case ALUOperation.ADD:
        result = (a + b) | 0;
        break;
      case ALUOperation.SUB:
        result = (a - b) | 0;
        break;
      case ALUOperation.AND:
        result = a & b;
        break;
      case ALUOperation.OR:
        result = a | b;
        break;
      case ALUOperation.XOR:
        result = a ^ b;
        break;

      // Shift operations
      case ALUOperation.SLL:
        result = (a << (b & 0x1F)) | 0; // Shift amount is lower 5 bits only
        break;
      case ALUOperation.SRL:
        result = (a >>> (b & 0x1F)); // Logical right shift (unsigned)
        break;
      case ALUOperation.SRA:
        result = (a >> (b & 0x1F)); // Arithmetic right shift (signed)
        break;

      // Comparison operations
      case ALUOperation.SLT:
        result = ((a | 0) < (b | 0)) ? 1 : 0; // Signed comparison
        break;
      case ALUOperation.SLTU:
        result = ((a >>> 0) < (b >>> 0)) ? 1 : 0; // Unsigned comparison
        break;

      // M extension operations - Multiplication
      case ALUOperation.MUL:
        // Multiply and return lower 32 bits
        result = ((a | 0) * (b | 0)) | 0;
        break;
      case ALUOperation.MULH: {
        // Multiply signed×signed and return upper 32 bits
        // Use BigInt for full 64-bit multiplication
        const aBig = BigInt(a | 0); // Force signed interpretation
        const bBig = BigInt(b | 0); // Force signed interpretation
        const resBig = aBig * bBig;
        // Extract upper 32 bits and convert back to number
        result = Number((resBig >> 32n) & 0xFFFFFFFFn);
        break;
      }
      case ALUOperation.MULHU: {
        // Multiply unsigned×unsigned and return upper 32 bits
        const aBig = BigInt(a >>> 0); // Force unsigned interpretation
        const bBig = BigInt(b >>> 0); // Force unsigned interpretation
        const resBig = aBig * bBig;
        // Extract upper 32 bits and convert back to number
        result = Number((resBig >> 32n) & 0xFFFFFFFFn);
        break;
      }
      case ALUOperation.MULHSU: {
        // Multiply signed×unsigned and return upper 32 bits
        const aBig = BigInt(a | 0);    // Force signed interpretation
        const bBig = BigInt(b >>> 0);  // Force unsigned interpretation
        const resBig = aBig * bBig;
        // Extract upper 32 bits and convert back to number
        result = Number((resBig >> 32n) & 0xFFFFFFFFn);
        break;
      }

      // M extension operations - Division
      case ALUOperation.DIV:
        // Signed division, rounding towards zero
        // Handle division by zero and overflow cases
        if (b === 0) {
          result = -1; // All bits set to 1
        } else if (a === -2147483648 && b === -1) {
          result = -2147483648; // Overflow case
        } else {
          result = Math.trunc((a | 0) / (b | 0));
        }
        break;
      case ALUOperation.DIVU:
        // Unsigned division
        if (b === 0) {
          result = 0xFFFFFFFF; // All bits set to 1
        } else {
          result = Math.trunc((a >>> 0) / (b >>> 0));
        }
        break;
      case ALUOperation.REM:
        // Signed remainder
        if (b === 0) {
          result = a; // Remainder is dividend when divisor is zero
        } else if (a === -2147483648 && b === -1) {
          result = 0; // Overflow case
        } else {
          result = ((a | 0) % (b | 0));
        }
        break;
      case ALUOperation.REMU:
        // Unsigned remainder
        if (b === 0) {
          result = a >>> 0; // Remainder is dividend when divisor is zero
        } else {
          result = ((a >>> 0) % (b >>> 0));
        }
        break;

      default:
        result = 0;
        break;
    }

    const zero = result === 0 ? 1 : 0;

    return { result, zero };
  };

  // 获取输入端口的值
  const getInputValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // 首先尝试根据输入端口ID查找对应字段
      const portId = edge.sourceHandle;
      let sourceValue: number | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        // 如果存在对应端口ID的字段，使用该字段值
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' ? value : undefined;
      } else if ('value' in sourceNode.data) {
        // 否则使用默认的value字段
        const value = (sourceNode.data as { value?: number }).value;
        sourceValue = typeof value === 'number' ? value : undefined;
      }

      return sourceValue ?? null;
    }
    return null;
  };

  // 更新节点数据
  const updateInputConnections = () => {
    const inputAEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'a');
    const inputBEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'b');
    const controlEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'control');

    const newA = getInputValue(inputAEdge);
    const newB = getInputValue(inputBEdge);
    const newControl = getInputValue(controlEdge);

    // 检查值是否发生变化
    const hasChanges =
      (newA !== null && newA !== inputsRef.current.a) ||
      (newB !== null && newB !== inputsRef.current.b) ||
      (newControl !== null && newControl !== inputsRef.current.operation);

    if (hasChanges) {
      const finalA = newA ?? inputsRef.current.a;
      const finalB = newB ?? inputsRef.current.b;
      const finalOperation = (newControl ?? inputsRef.current.operation) as ALUOperation;

      // 更新ref中的值
      inputsRef.current = {
        a: finalA,
        b: finalB,
        operation: finalOperation
      };

      const { result, zero } = calculateResult(finalA, finalB, finalOperation);

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        a: finalA,
        b: finalB,
        operation: finalOperation,
        result,
        zero
      });
    }
  };

  // 监听输入连接的变化
  useEffect(() => {
    updateInputConnections();
  }, [edges]);

  // Get operation name for display
  const getOperationName = (op: ALUOperation): string => {
    const opNames = {
      [ALUOperation.ADD]: "ADD",
      [ALUOperation.SUB]: "SUB",
      [ALUOperation.AND]: "AND",
      [ALUOperation.OR]: "OR",
      [ALUOperation.XOR]: "XOR",
      [ALUOperation.SLL]: "SLL",
      [ALUOperation.SRL]: "SRL",
      [ALUOperation.SRA]: "SRA",
      [ALUOperation.SLT]: "SLT",
      [ALUOperation.SLTU]: "SLTU",
      [ALUOperation.MUL]: "MUL",
      [ALUOperation.MULH]: "MULH",
      [ALUOperation.MULHU]: "MULHU",
      [ALUOperation.MULHSU]: "MULHSU",
      [ALUOperation.DIV]: "DIV",
      [ALUOperation.DIVU]: "DIVU",
      [ALUOperation.REM]: "REM",
      [ALUOperation.REMU]: "REMU"
    };
    return opNames[op] || `UNKNOWN(${op})`;
  };

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
        title="Input Operand A"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '60%' }}
        title="Input Operand B"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="control"
        className="w-3 h-3 bg-yellow-400"
        title="ALU Control Signal"
      />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">ALU</div>
          {!disableUIUpdates && (
            <>
              <div className="text-gray-500">Control: {getOperationName(data.operation ?? ALUOperation.ADD)} </div>
              <div className="text-gray-500">A: {data.a ?? 0}</div>
              <div className="text-gray-500">B: {data.b ?? 0}</div>
              <div className="text-gray-500">Result: {data.result ?? 0}</div>
              <div className="text-gray-500">Zero: {data.zero ?? 0}</div>
            </>
          )}
          {/* Add placeholder div when UI updates are disabled to maintain height */}
          {disableUIUpdates && (
            <div style={{ height: '100px' }}></div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="result"
        className="w-3 h-3 bg-green-400"
        style={{ top: '30%' }}
        title="Result"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="zero"
        className="w-3 h-3 bg-green-400"
        style={{ top: '60%' }}
        title="Zero Flag"
      />
    </div>
  );
}
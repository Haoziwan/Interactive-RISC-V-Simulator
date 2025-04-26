import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

/**
 * 转发单元数据接口
 * 负责检测数据冒险并生成转发控制信号
 */
interface ForwardingUnitNodeData {
  label: string;
  rs1?: number;       // ID/EX阶段的rs1寄存器号
  rs2?: number;       // ID/EX阶段的rs2寄存器号
  exMemRd?: number;   // EX/MEM阶段的目标寄存器号
  memWbRd?: number;   // MEM/WB阶段的目标寄存器号
  exMemRegWrite?: number; // EX/MEM阶段的RegWrite控制信号
  memWbRegWrite?: number; // MEM/WB阶段的RegWrite控制信号
  forwardA?: number;  // 操作数A的转发控制信号
  forwardB?: number;  // 操作数B的转发控制信号
}

export function ForwardingUnitNode({ data, id, selected }: {
  data: ForwardingUnitNodeData;
  id: string;
  selected?: boolean
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();

  // 使用ref来缓存输入值，避免不必要的更新
  const inputsRef = React.useRef({
    rs1: 0,
    rs2: 0,
    exMemRd: 0,
    memWbRd: 0,
    exMemRegWrite: 0,
    memWbRegWrite: 0
  });

  const updateInputConnections = () => {
    const rs1Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'rs1');
    const rs2Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'rs2');
    const exMemRdEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'exMemRd');
    const memWbRdEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memWbRd');
    const exMemRegWriteEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'exMemRegWrite');
    const memWbRegWriteEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memWbRegWrite');

    let rs1Value = 0, rs2Value = 0, exMemRdValue = 0, memWbRdValue = 0, exMemRegWriteValue = 0, memWbRegWriteValue = 0;

    // 获取输入值
    if (rs1Edge) {
      const sourceNode = nodes.find(node => node.id === rs1Edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = rs1Edge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        rs1Value = sourceValue ?? 0;
      }
    }

    if (rs2Edge) {
      const sourceNode = nodes.find(node => node.id === rs2Edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = rs2Edge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        rs2Value = sourceValue ?? 0;
      }
    }

    if (exMemRdEdge) {
      const sourceNode = nodes.find(node => node.id === exMemRdEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = exMemRdEdge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        exMemRdValue = sourceValue ?? 0;
      }
    }

    if (memWbRdEdge) {
      const sourceNode = nodes.find(node => node.id === memWbRdEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = memWbRdEdge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        memWbRdValue = sourceValue ?? 0;
      }
    }

    if (exMemRegWriteEdge) {
      const sourceNode = nodes.find(node => node.id === exMemRegWriteEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = exMemRegWriteEdge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        exMemRegWriteValue = sourceValue ?? 0;
      }
    }

    if (memWbRegWriteEdge) {
      const sourceNode = nodes.find(node => node.id === memWbRegWriteEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = memWbRegWriteEdge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        memWbRegWriteValue = sourceValue ?? 0;
      }
    }

    // 转发逻辑
    let forwardA = 0;
    let forwardB = 0;

    // 转发控制信号值的含义：
    // 0: 不转发，使用ID/EX阶段寄存器读取的值
    // 1: 从MEM/WB阶段转发（较旧的指令结果）
    // 2: 从EX/MEM阶段转发（较新的指令结果）

    // 检查rs1的转发条件
    if (exMemRdValue !== 0 && exMemRdValue === rs1Value && exMemRegWriteValue === 1) {
      // EX冒险：当前指令的rs1与上一条指令的目标寄存器相同，且上一条指令会写回寄存器
      forwardA = 2; // 从EX/MEM转发（优先级高）
    } else if (memWbRdValue !== 0 && memWbRdValue === rs1Value && memWbRegWriteValue === 1) {
      // MEM冒险：当前指令的rs1与前两条指令的目标寄存器相同，且前两条指令会写回寄存器
      forwardA = 1; // 从MEM/WB转发
    }

    // 检查rs2的转发条件
    if (exMemRdValue !== 0 && exMemRdValue === rs2Value && exMemRegWriteValue === 1) {
      // EX冒险：当前指令的rs2与上一条指令的目标寄存器相同，且上一条指令会写回寄存器
      forwardB = 2; // 从EX/MEM转发（优先级高）
    } else if (memWbRdValue !== 0 && memWbRdValue === rs2Value && memWbRegWriteValue === 1) {
      // MEM冒险：当前指令的rs2与前两条指令的目标寄存器相同，且前两条指令会写回寄存器
      forwardB = 1; // 从MEM/WB转发
    }

    // 检查输入值是否发生变化
    const hasChanges = rs1Value !== inputsRef.current.rs1 ||
                      rs2Value !== inputsRef.current.rs2 ||
                      exMemRdValue !== inputsRef.current.exMemRd ||
                      memWbRdValue !== inputsRef.current.memWbRd ||
                      exMemRegWriteValue !== inputsRef.current.exMemRegWrite ||
                      memWbRegWriteValue !== inputsRef.current.memWbRegWrite;

    if (hasChanges) {
      // 更新缓存的输入值
      inputsRef.current = {
        rs1: rs1Value,
        rs2: rs2Value,
        exMemRd: exMemRdValue,
        memWbRd: memWbRdValue,
        exMemRegWrite: exMemRegWriteValue,
        memWbRegWrite: memWbRegWriteValue
      };

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        rs1: rs1Value,
        rs2: rs2Value,
        exMemRd: exMemRdValue,
        memWbRd: memWbRdValue,
        exMemRegWrite: exMemRegWriteValue,
        memWbRegWrite: memWbRegWriteValue,
        forwardA,
        forwardB
      });
    }
  };

  // 使用deps数组来跟踪依赖项的变化
  const deps = React.useMemo(() => {
    return edges
      .filter(edge => edge.target === id)
      .map(edge => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        if (sourceNode?.data && typeof sourceNode.data === 'object') {
          return sourceNode.data[edge.sourceHandle as keyof typeof sourceNode.data];
        }
        return null;
      });
  }, [nodes, edges, id]);

  React.useEffect(() => {
    updateInputConnections();
  }, [deps]); // 只在依赖项真正变化时更新

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="text-sm font-bold mb-2">Forwarding Unit</div>

      {/* 输入端口 */}
      <Handle
        type="target"
        position={Position.Left}
        id="rs1"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '35%' }}
        title="ID/EX.Rs1 - Current instruction's rs1 register number"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="rs2"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '65%' }}
        title="ID/EX.Rs2 - Current instruction's rs2 register number"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="exMemRd"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '25%' }}
        title="EX/MEM.Rd - Previous instruction's destination register"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="exMemRegWrite"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '40%' }}
        title="EX/MEM.RegWrite - Previous instruction's register write control signal"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="memWbRd"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '60%' }}
        title="MEM/WB.Rd - Two instructions ago's destination register"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="memWbRegWrite"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '75%' }}
        title="MEM/WB.RegWrite - Two instructions ago's register write control signal"
      />

      {/* 显示当前状态和输入值 - only when UI updates are not disabled */}
      {!disableUIUpdates && (
        <div className="text-xs text-gray-600 mt-2 border-t pt-1 border-gray-100">
          <div className="font-semibold">Inputs:</div>
          <div className="flex justify-between">
            <span>ID/EX.Rs1:</span>
            <span>{data.rs1 || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>ID/EX.Rs2:</span>
            <span>{data.rs2 || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>EX/MEM.Rd:</span>
            <span>{data.exMemRd || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>MEM/WB.Rd:</span>
            <span>{data.memWbRd || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>EX/MEM.RegWrite:</span>
            <span>{data.exMemRegWrite || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>MEM/WB.RegWrite:</span>
            <span>{data.memWbRegWrite || 0}</span>
          </div>
        </div>
      )}

      {/* 显示输出状态 - only when UI updates are not disabled */}
      {!disableUIUpdates && (
        <div className="text-xs text-gray-600 mt-2 border-t pt-1 border-gray-100">
          <div className="font-semibold">Outputs:</div>
          <div className="flex justify-between">
            <span>Forward A:</span>
            <span>{data.forwardA || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Forward B:</span>
            <span>{data.forwardB || 0}</span>
          </div>
        </div>
      )}

      {/* Add placeholder div when UI updates are disabled to maintain height */}
      {disableUIUpdates && (
        <div style={{ height: '150px' }}></div>
      )}

      {/* 输出端口 */}
      <Handle
        type="source"
        position={Position.Top}
        id="forwardA"
        className="w-3 h-3 bg-green-400"
        style={{ left: '35%' }}
        title="Forward A - ALU operand A selection signal"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="forwardB"
        className="w-3 h-3 bg-green-400"
        style={{ left: '65%' }}
        title="Forward B - ALU operand B selection signal"
      />
    </div>
  );
}
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface ForwardingUnitNodeData {
  label: string;
  rs1?: number;
  rs2?: number;
  exMemRd?: number;
  memWbRd?: number;
  forwardA?: number;
  forwardB?: number;
}

export function ForwardingUnitNode({ data, id, selected }: { 
  data: ForwardingUnitNodeData; 
  id: string; 
  selected?: boolean 
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  
  // 使用ref来缓存输入值，避免不必要的更新
  const inputsRef = React.useRef({
    rs1: 0,
    rs2: 0,
    exMemRd: 0,
    memWbRd: 0
  });

  const updateInputConnections = () => {
    const rs1Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'rs1');
    const rs2Edge = edges.find(edge => edge.target === id && edge.targetHandle === 'rs2');
    const exMemRdEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'exMemRd');
    const memWbRdEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memWbRd');

    let rs1Value = 0, rs2Value = 0, exMemRdValue = 0, memWbRdValue = 0;

    // 获取输入值
    if (rs1Edge) {
      const sourceNode = nodes.find(node => node.id === rs1Edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        rs1Value = sourceNode.data[rs1Edge.sourceHandle as keyof typeof sourceNode.data] || 0;
      }
    }

    if (rs2Edge) {
      const sourceNode = nodes.find(node => node.id === rs2Edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        rs2Value = sourceNode.data[rs2Edge.sourceHandle as keyof typeof sourceNode.data] || 0;
      }
    }

    if (exMemRdEdge) {
      const sourceNode = nodes.find(node => node.id === exMemRdEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        exMemRdValue = sourceNode.data[exMemRdEdge.sourceHandle as keyof typeof sourceNode.data] || 0;
      }
    }

    if (memWbRdEdge) {
      const sourceNode = nodes.find(node => node.id === memWbRdEdge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        memWbRdValue = sourceNode.data[memWbRdEdge.sourceHandle as keyof typeof sourceNode.data] || 0;
      }
    }

    // 转发逻辑
    let forwardA = 0;
    let forwardB = 0;

    // 检查rs1的转发条件
    if (exMemRdValue !== 0 && exMemRdValue === rs1Value) {
      forwardA = 2; // 从EX/MEM转发
    } else if (memWbRdValue !== 0 && memWbRdValue === rs1Value) {
      forwardA = 1; // 从MEM/WB转发
    }

    // 检查rs2的转发条件
    if (exMemRdValue !== 0 && exMemRdValue === rs2Value) {
      forwardB = 2; // 从EX/MEM转发
    } else if (memWbRdValue !== 0 && memWbRdValue === rs2Value) {
      forwardB = 1; // 从MEM/WB转发
    }

    // 检查输入值是否发生变化
    const hasChanges = rs1Value !== inputsRef.current.rs1 ||
                      rs2Value !== inputsRef.current.rs2 ||
                      exMemRdValue !== inputsRef.current.exMemRd ||
                      memWbRdValue !== inputsRef.current.memWbRd;

    if (hasChanges) {
      // 更新缓存的输入值
      inputsRef.current = {
        rs1: rs1Value,
        rs2: rs2Value,
        exMemRd: exMemRdValue,
        memWbRd: memWbRdValue
      };

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        rs1: rs1Value,
        rs2: rs2Value,
        exMemRd: exMemRdValue,
        memWbRd: memWbRdValue,
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
        title="RS1"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="rs2"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '65%' }}
        title="RS2"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="exMemRd"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '35%' }}
        title="EX/MEM Rd"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="memWbRd"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '65%' }}
        title="MEM/WB Rd"
      />

      {/* 显示当前状态 */}
      <div className="text-xs text-gray-600 mt-2">
        <div>Forward A: {data.forwardA || 0}</div>
        <div>Forward B: {data.forwardB || 0}</div>
      </div>

      {/* 输出端口 */}
      <Handle
        type="source"
        position={Position.Top}
        id="forwardA"
        className="w-3 h-3 bg-green-400"
        style={{ left: '35%' }}
        title="Forward A"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="forwardB"
        className="w-3 h-3 bg-green-400"
        style={{ left: '65%' }}
        title="Forward B"
      />
    </div>
  );
}
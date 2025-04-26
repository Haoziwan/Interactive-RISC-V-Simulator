import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface BranchHazardUnitNodeData {
  label: string;
  branchTaken?: number;  // 分支是否被采纳的信号
  ifIdFlush?: number;    // 输出：IF/ID寄存器清除信号
  idExFlush?: number;    // 输出：ID/EX寄存器清除信号
  hazardDetected?: boolean; // 是否检测到控制冒险
}

export function BranchHazardUnitNode({ data, id, selected }: { data: BranchHazardUnitNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();

  // 使用ref保存输入值，避免不必要的重渲染
  const inputsRef = React.useRef({
    branchTaken: 0
  });

  // 获取源节点的值
  const getSourceNodeValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      const portId = edge.sourceHandle;
      let sourceValue: number | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' ? value : undefined;
      } else if ('value' in sourceNode.data) { // Fallback if portId doesn't match
        const value = (sourceNode.data as { value?: number }).value;
        sourceValue = typeof value === 'number' ? value : undefined;
      }

      return sourceValue ?? null;
    }
    return null;
  };

  // 更新节点状态
  const updateNodeState = () => {
    // 获取各个输入边
    const branchTakenEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'branchTaken');

    // 获取输入值
    const branchTakenValue = getSourceNodeValue(branchTakenEdge) ?? 0;

    // 控制冒险检测逻辑
    let ifIdFlush = 0;
    let idExFlush = 0;
    let hazardDetected = false;

    // 当分支指令被采纳时，需要清除流水线中的指令
    if (branchTakenValue === 1) {
      ifIdFlush = 1;    // 清除IF/ID寄存器
      idExFlush = 1;    // 清除ID/EX寄存器
      hazardDetected = true; // 标记检测到控制冒险
    }

    // 检查输入值是否发生变化
    const hasChanges = branchTakenValue !== inputsRef.current.branchTaken;

    // 更新输入值引用
    inputsRef.current.branchTaken = branchTakenValue;

    // 如果有变化，更新节点数据
    if (hasChanges) {
      updateNodeData(id, {
        ...data,
        branchTaken: branchTakenValue,
        ifIdFlush,
        idExFlush,
        hazardDetected
      });
    }
  };

  // 监听输入连接的变化
  React.useEffect(() => {
    updateNodeState();
  }, [nodes, edges, id]);

  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="text-lg font-bold mb-2">Branch Hazard Unit</div>

      <Handle
        type="target"
        position={Position.Left}
        id="branchTaken"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '50%' }}
        title="Branch Taken Signal"
      />

      {/* 显示当前状态 - only when UI updates are not disabled */}
      {!disableUIUpdates && (
        <div className={`text-xs mt-2 pt-1 border-t ${data.hazardDetected ? 'text-red-600 border-red-200' : 'text-gray-600 border-gray-100'}`}>
          <div className="font-semibold">Inputs:</div>
          <div className="flex justify-between">
            <span>Branch Taken:</span>
            <span>{data.branchTaken !== undefined ? data.branchTaken : 0}</span>
          </div>

          <div className="font-semibold mt-2">Outputs:</div>
          <div className="flex justify-between">
            <span>IF/ID Flush:</span>
            <span>{data.ifIdFlush !== undefined ? data.ifIdFlush : 0}</span>
          </div>
          <div className="flex justify-between">
            <span>ID/EX Flush:</span>
            <span>{data.idExFlush !== undefined ? data.idExFlush : 0}</span>
          </div>
          <div className="mt-1 text-center">
            {data.hazardDetected ?
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Control Hazard Detected!</span> :
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">No Control Hazard</span>
            }
          </div>
        </div>
      )}

      {/* Add placeholder div when UI updates are disabled to maintain height */}
      {disableUIUpdates && (
        <div style={{ height: '120px' }}></div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="ifIdFlush"
        className="w-3 h-3 bg-red-400"
        style={{ top: '40%' }}
        title="IF/ID Flush Signal"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="idExFlush"
        className="w-3 h-3 bg-red-400"
        style={{ top: '60%' }}
        title="ID/EX Flush Signal"
      />
    </div>
  );
}

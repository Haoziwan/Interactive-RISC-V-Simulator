import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface HazardDetectionUnitNodeData {
  label: string;
  idExMemRead?: number;  // ID/EX阶段的MemRead控制信号
  idExRt?: number;       // ID/EX阶段的Rt寄存器
  ifIdRs?: number;       // IF/ID阶段的Rs寄存器
  ifIdRt?: number;       // IF/ID阶段的Rt寄存器
  pcWrite?: number;      // 输出：PC写使能
  ifIdWrite?: number;    // 输出：IF/ID寄存器写使能
  controlMux?: number;   // 输出：控制信号多路复用器控制信号
  hazardDetected?: boolean; // 是否检测到冒险
}

export function HazardDetectionUnitNode({ data, id, selected }: {
  data: HazardDetectionUnitNodeData;
  id: string;
  selected?: boolean
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const nodes = useNodes();
  const edges = useEdges();

  // 使用ref来缓存输入值，避免不必要的更新
  const inputsRef = React.useRef({
    idExMemRead: 0,
    idExRt: 0,
    ifIdRs: 0,
    ifIdRt: 0
  });

  const updateInputConnections = () => {
    // 获取源节点值的辅助函数
    const getSourceNodeValue = (edge: any) => {
      if (!edge) return null;
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = edge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number }).value;
          sourceValue = typeof value === 'number' ? value : undefined;
        }

        return sourceValue ?? null;
      }
      return null;
    };

    // 获取各个输入边
    const idExMemReadEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'idExMemRead');
    const idExRtEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'idExRt');
    const ifIdRsEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'ifIdRs');
    const ifIdRtEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'ifIdRt');

    // 获取输入值
    const idExMemReadValue = getSourceNodeValue(idExMemReadEdge) ?? 0;
    const idExRtValue = getSourceNodeValue(idExRtEdge) ?? 0;
    const ifIdRsValue = getSourceNodeValue(ifIdRsEdge) ?? 0;
    const ifIdRtValue = getSourceNodeValue(ifIdRtEdge) ?? 0;

    // 冒险检测逻辑
    let pcWrite = 1;
    let ifIdWrite = 1;
    let controlMux = 0;
    let hazardDetected = false;

    // 加载使用冒险检测
    // 当ID/EX阶段的MemRead=1，且ID/EX阶段的Rt与IF/ID阶段的Rs或Rt相等时，需要插入停顿
    if (idExMemReadValue === 1 &&
        (idExRtValue === ifIdRsValue || idExRtValue === ifIdRtValue) &&
        idExRtValue !== 0) {
      pcWrite = 0;    // 暂停PC更新
      ifIdWrite = 0;  // 暂停IF/ID寄存器更新
      controlMux = 1; // 将控制信号置为0（生成NOP）
      hazardDetected = true; // 标记检测到冒险
    }

    // 检查输入值是否发生变化
    const hasChanges = idExMemReadValue !== inputsRef.current.idExMemRead ||
                      idExRtValue !== inputsRef.current.idExRt ||
                      ifIdRsValue !== inputsRef.current.ifIdRs ||
                      ifIdRtValue !== inputsRef.current.ifIdRt;

    if (hasChanges) {
      // 更新缓存的输入值
      inputsRef.current = {
        idExMemRead: idExMemReadValue,
        idExRt: idExRtValue,
        ifIdRs: ifIdRsValue,
        ifIdRt: ifIdRtValue
      };

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        idExMemRead: idExMemReadValue,
        idExRt: idExRtValue,
        ifIdRs: ifIdRsValue,
        ifIdRt: ifIdRtValue,
        pcWrite,
        ifIdWrite,
        controlMux,
        hazardDetected
      });
    }
  };

  // 使用deps数组来跟踪依赖项的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [nodes, edges]); // 直接监听nodes和edges的变化

  // 是否检测到冒险
  const hazardDetected = data.hazardDetected || false;

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : hazardDetected ? 'border-red-500' : 'border-gray-200'
    }`}>
      <div className="text-sm font-bold mb-2 flex items-center justify-between">
        <span>Hazard Detection</span>
        {!disableUIUpdates && hazardDetected && (
          <span className="ml-2 px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">Hazard!</span>
        )}
      </div>

      {/* 输入端口 */}
      <Handle
        type="target"
        position={Position.Left}
        id="idExMemRead"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '20%' }}
        title="ID/EX.MemRead"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="idExRt"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '40%' }}
        title="ID/EX.Rt"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="ifIdRs"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '60%' }}
        title="IF/ID.Rs"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="ifIdRt"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '80%' }}
        title="IF/ID.Rt"
      />

      {/* 显示输入值 - only when UI updates are not disabled */}
      {!disableUIUpdates && (
        <>
          <div className="text-xs text-gray-600 mt-2 border-t pt-1 border-gray-100">
            <div className="font-semibold">Inputs:</div>
            <div className="flex justify-between">
              <span>ID/EX.MemRead:</span>
              <span>{data.idExMemRead || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>ID/EX.Rt:</span>
              <span>{data.idExRt || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>IF/ID.Rs:</span>
              <span>{data.ifIdRs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>IF/ID.Rt:</span>
              <span>{data.ifIdRt || 0}</span>
            </div>
          </div>

          {/* 显示当前状态 */}
          <div className={`text-xs mt-2 pt-1 border-t ${hazardDetected ? 'text-red-600 border-red-200' : 'text-gray-600 border-gray-100'}`}>
            <div className="font-semibold">Outputs:</div>
            <div className="flex justify-between">
              <span>PC Write:</span>
              <span>{data.pcWrite !== undefined ? data.pcWrite : 1}</span>
            </div>
            <div className="flex justify-between">
              <span>IF/ID Write:</span>
              <span>{data.ifIdWrite !== undefined ? data.ifIdWrite : 1}</span>
            </div>
            <div className="flex justify-between">
              <span>Control Mux:</span>
              <span>{data.controlMux !== undefined ? data.controlMux : 0}</span>
            </div>
            <div className="mt-1 text-center">
              {hazardDetected ?
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Load-Use Hazard Detected!</span> :
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">No Hazard</span>
              }
            </div>
          </div>
        </>
      )}

      {/* Add placeholder div when UI updates are disabled to maintain height */}
      {disableUIUpdates && (
        <div style={{ height: '180px' }}></div>
      )}

      {/* 输出端口 */}
      <Handle
        type="source"
        position={Position.Right}
        id="pcWrite"
        className="w-3 h-3 bg-green-400"
        style={{ top: '25%' }}
        title="PC Write"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="ifIdWrite"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%' }}
        title="IF/ID Write"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="controlMux"
        className="w-3 h-3 bg-green-400"
        style={{ top: '75%' }}
        title="Control Mux"
      />
    </div>
  );
}
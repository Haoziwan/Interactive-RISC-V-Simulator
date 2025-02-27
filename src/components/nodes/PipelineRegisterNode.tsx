import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React, { useState } from 'react';

interface PipelineRegisterNodeData {
  label: string;
  name?: 'IF/ID' | 'ID/EX' | 'EX/MEM' | 'MEM/WB';
  reset?: boolean;
  portCount?: number;
  values?: number[];
}

export function PipelineRegisterNode({ data, id, selected }: { data: PipelineRegisterNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const name = data.name || 'IF/ID';
  const reset = data.reset ?? false;
  const portCount = data.portCount ?? 1;
  const values = data.values ?? Array(portCount).fill(0);
  const [inputValues, setInputValues] = React.useState<number[]>(Array(portCount).fill(0));
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<{ name?: string; portCount?: number }>({ name, portCount });
  const nodes = useNodes();
  const edges = useEdges();

  const handleValueChange = (newValues: number[]) => {
    updateNodeData(id, {
      ...data,
      values: newValues
    });
  };

  // 监听复位信号
  React.useEffect(() => {
    if (reset) {
      const zeroValues = Array(portCount).fill(0);
      handleValueChange(zeroValues);
      setInputValues(zeroValues);
      // 重置reset标志
      updateNodeData(id, {
        ...data,
        values: zeroValues,  // 确保values也被设置为0
        reset: false
      });
    }
  }, [reset, portCount]);

  // 监听输入连接的变化
  const updateInputConnections = () => {
    const newInputValues = [...inputValues];
    let hasChanges = false;

    // 处理每个输入端口
    for (let i = 0; i < portCount; i++) {
      const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === `input-${i}`);
      if (inputEdge) {
        const sourceNode = nodes.find(node => node.id === inputEdge.source);
        if (sourceNode?.data && typeof sourceNode.data === 'object') {
          const portId = inputEdge.sourceHandle;
          let sourceValue: number | undefined;

          if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
            const value = sourceNode.data[portId as keyof typeof sourceNode.data];
            sourceValue = typeof value === 'number' ? value : undefined;
          } else if ('value' in sourceNode.data) {
            const value = (sourceNode.data as { value?: number }).value;
            sourceValue = typeof value === 'number' ? value : undefined;
          }

          if (sourceValue !== undefined && sourceValue !== newInputValues[i]) {
            newInputValues[i] = sourceValue;
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      setInputValues(newInputValues);
    }
  };

  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [nodes, edges, id, portCount]);

  // 监听时钟信号(stepCount)
  React.useEffect(() => {
    if (!reset) {
      // 在时钟上升沿更新寄存器值和输出端口的值
      const newValues = [...inputValues];
      handleValueChange(newValues);
      
      // 更新节点数据，包括输出端口的值
      const outputValues = newValues.reduce((acc, value, index) => {
        acc[`output-${index}`] = value;
        return acc;
      }, {} as { [key: string]: number });

      updateNodeData(id, {
        ...data,
        values: newValues,
        ...outputValues  // 将输出端口的值添加到节点数据中
      });

      // 更新输入值
      const newInputValues = [...inputValues];
      let hasChanges = false;

      // 处理每个输入端口
      for (let i = 0; i < portCount; i++) {
        const inputEdges = edges.filter(edge => edge.target === id && edge.targetHandle === `input-${i}`);
        
        if (inputEdges.length > 0) {
          const inputEdge = inputEdges[0];
          const sourceNode = nodes.find(node => node.id === inputEdge.source);
          if (sourceNode?.data && typeof sourceNode.data === 'object') {
            const portId = inputEdge.sourceHandle;
            let sourceValue: number | undefined;

            if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
              const value = sourceNode.data[portId as keyof typeof sourceNode.data];
              sourceValue = typeof value === 'number' ? value : undefined;
            } else if ('value' in sourceNode.data) {
              const value = (sourceNode.data as { value?: number }).value;
              sourceValue = typeof value === 'number' ? value : undefined;
            }

            if (sourceValue !== undefined && sourceValue !== newInputValues[i]) {
              newInputValues[i] = sourceValue;
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges) {
        setInputValues(newInputValues);
      }
    }
  }, [stepCount]);

  // 添加输出端口的数据映射
  const outputValues = values.reduce((acc, value, index) => {
    acc[`output-${index}`] = value;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 h-auto min-h-[200px] ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center h-full">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 rounded-md hover:bg-gray-100"
            title="配置"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {showConfig && (
          <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">寄存器类型</label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={name}
                onChange={(e) => {
                  const newName = e.target.value as 'IF/ID' | 'ID/EX' | 'EX/MEM' | 'MEM/WB';
                  setTempConfig(prev => ({ ...prev, name: newName }));
                }}
              >
                <option value="IF/ID">IF/ID</option>
                <option value="ID/EX">ID/EX</option>
                <option value="EX/MEM">EX/MEM</option>
                <option value="MEM/WB">MEM/WB</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">端口数量</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTempConfig(prev => ({
                    ...prev,
                    portCount: Math.max(1, (prev.portCount ?? portCount) - 1)
                  }))}
                  className="px-2 py-1 border rounded-md hover:bg-gray-100"
                  title="减少端口数量"
                >
                  -
                </button>
                <span className="flex-1 text-center">{tempConfig.portCount ?? portCount}</span>
                <button
                  onClick={() => setTempConfig(prev => ({
                    ...prev,
                    portCount: Math.min(10, (prev.portCount ?? portCount) + 1)
                  }))}
                  className="px-2 py-1 border rounded-md hover:bg-gray-100"
                  title="增加端口数量"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowConfig(false);
                  setTempConfig({ name, portCount });
                }}
                className="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const newPortCount = tempConfig.portCount ?? portCount;
                  updateNodeData(id, {
                    ...data,
                    name: tempConfig.name ?? name,
                    portCount: newPortCount,
                    values: Array(newPortCount).fill(0)
                  });
                  setInputValues(Array(newPortCount).fill(0));
                  setShowConfig(false);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                确定
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-2 mt-4 flex-grow justify-center">
          {values.map((value, index) => (
            <div key={index} className="text-sm text-gray-700">
              Port {index}: {value}
            </div>
          ))}
        </div>
      </div>
      
      {/* 输入端口 */}
      {Array.from({ length: portCount }).map((_, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={`input-${index}`}
          className="w-2 h-2 bg-blue-400"
          style={{ top: `${20 + (index * 60 / (portCount > 1 ? portCount - 1 : 1))}%` }}
          title={`输入端口 ${index}`}
        />
      ))}

      {/* 输出端口 */}
      {Array.from({ length: portCount }).map((_, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={`output-${index}`}
          className="w-2 h-2 bg-green-400"
          style={{ top: `${20 + (index * 60 / (portCount > 1 ? portCount - 1 : 1))}%` }}
          title={`输出端口 ${index}`}
        />
      ))}
    </div>
  );
}
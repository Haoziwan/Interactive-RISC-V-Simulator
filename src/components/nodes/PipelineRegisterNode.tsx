import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React, { useState } from 'react';

interface PipelineRegisterNodeData {
  label: string;
  name?: 'IF/ID' | 'ID/EX' | 'EX/MEM' | 'MEM/WB';
  reset?: boolean;
  portCount?: number;
  values?: (number | string)[];
  writeEnable?: number;
  flush?: number;
}

export function PipelineRegisterNode({ data, id, selected }: { data: PipelineRegisterNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const name = data.name || 'IF/ID';
  const reset = data.reset ?? false;
  const portCount = data.portCount ?? 1;
  const values = data.values ?? Array(portCount).fill(0);
  const writeEnable = data.writeEnable ?? 1;
  const flush = data.flush ?? 0;
  const [inputValues, setInputValues] = React.useState<(number | string)[]>(Array(portCount).fill(0));
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<{ name?: string; portCount?: number }>({ name, portCount });
  const nodes = useNodes();
  const edges = useEdges();

  const handleValueChange = (newValues: (number | string)[]) => {
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

      // 创建所有输出端口的零值映射
      const zeroOutputValues = zeroValues.reduce((acc, _, index) => {
        acc[`output-${index}`] = 0;
        return acc;
      }, {} as { [key: string]: number | string });

      // 重置reset标志，同时更新所有状态和输出端口的值
      updateNodeData(id, {
        ...data,
        values: zeroValues,  // 确保values被设置为0
        reset: false,
        ...zeroOutputValues  // 确保所有输出端口的值被设置为0
      });
    }
  }, [reset, portCount]);

  // 监听输入连接的变化
  const updateInputConnections = () => {
    const newInputValues = [...inputValues];
    let hasChanges = false;

    // 检查writeEnable信号（仅对IF/ID寄存器有效）
    if (name === 'IF/ID') {
      const writeEnableEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'writeEnable');
      let writeEnableValue = 1; // 默认可写入

      if (writeEnableEdge) {
        const sourceNode = nodes.find(node => node.id === writeEnableEdge.source);
        if (sourceNode?.data && typeof sourceNode.data === 'object') {
          const sourceValue = sourceNode.data[writeEnableEdge.sourceHandle as keyof typeof sourceNode.data];
          writeEnableValue = typeof sourceValue === 'number' ? sourceValue : 1;
        }
      }

      // 更新writeEnable状态
      if (writeEnableValue !== data.writeEnable) {
        updateNodeData(id, {
          ...data,
          writeEnable: writeEnableValue
        });
      }
    }

    // 检查flush信号（对IF/ID和ID/EX寄存器有效）
    if (name === 'IF/ID' || name === 'ID/EX') {
      const flushEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'flush');
      let flushValue = 0; // 默认不清除

      if (flushEdge) {
        const sourceNode = nodes.find(node => node.id === flushEdge.source);
        if (sourceNode?.data && typeof sourceNode.data === 'object') {
          const sourceValue = sourceNode.data[flushEdge.sourceHandle as keyof typeof sourceNode.data];
          flushValue = typeof sourceValue === 'number' ? sourceValue : 0;
        }
      }

      // 更新flush状态
      if (flushValue !== data.flush) {
        updateNodeData(id, {
          ...data,
          flush: flushValue
        });
      }
    }

    // 处理每个输入端口
    for (let i = 0; i < portCount; i++) {
      const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === `input-${i}`);
      if (inputEdge) {
        const sourceNode = nodes.find(node => node.id === inputEdge.source);
        if (sourceNode?.data && typeof sourceNode.data === 'object') {
          const portId = inputEdge.sourceHandle;
          let sourceValue: number | string | undefined;

          if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
            const value = sourceNode.data[portId as keyof typeof sourceNode.data];
            sourceValue = (typeof value === 'number' || typeof value === 'string') ? value : undefined;
          } else if ('value' in sourceNode.data) {
            const value = (sourceNode.data as { value?: number | string }).value;
            sourceValue = (typeof value === 'number' || typeof value === 'string') ? value : undefined;
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
      // 检查是否需要清除寄存器（flush信号）
      if (flush === 1) {
        // 清除寄存器内容（设置为0）
        const zeroValues = Array(portCount).fill(0);
        handleValueChange(zeroValues);

        // 创建所有输出端口的零值映射
        const zeroOutputValues = zeroValues.reduce((acc, _, index) => {
          acc[`output-${index}`] = 0;
          return acc;
        }, {} as { [key: string]: number | string });

        // 更新节点数据，包括输出端口的值
        updateNodeData(id, {
          ...data,
          values: zeroValues,
          ...zeroOutputValues,
          flush: 0  // 重置flush信号
        });

        // 更新输入值
        setInputValues(zeroValues);
        return; // 不执行后续的正常更新逻辑
      }

      // 仅当writeEnable=1或非IF/ID寄存器时，在时钟上升沿更新寄存器值
      if (name !== 'IF/ID' || writeEnable === 1) {
        // 在时钟上升沿更新寄存器值和输出端口的值
        const newValues = [...inputValues];
        handleValueChange(newValues);

        // 更新节点数据，包括输出端口的值
        const outputValues = newValues.reduce((acc, value, index) => {
          acc[`output-${index}`] = value;
          return acc;
        }, {} as { [key: string]: number | string });

        updateNodeData(id, {
          ...data,
          values: newValues,
          ...outputValues  // 将输出端口的值添加到节点数据中
        });
      }

    }
  }, [stepCount]);

  // 添加输出端口的数据映射
  const outputValues = values.reduce((acc, value, index) => {
    acc[`output-${index}`] = value;
    return acc;
  }, {} as { [key: string]: number | string });

  // 计算一个合适的高度，基于端口数量，设置最小高度为160px
  const registerHeight = Math.max(160, portCount * 60);

  return (
    <div className={`relative py-4 shadow-md rounded-md bg-white border-2 w-[120px] ${selected ? 'border-blue-500' : 'border-gray-200'}`}
         style={{ height: registerHeight }}>
      <div className="flex flex-col items-center h-full">
        <div className="flex items-center justify-between w-full px-2 mb-4">
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 rounded-md hover:bg-gray-100"
            title="Configure"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 控制信号输入端口 */}
        <div className="flex justify-center w-full">
          {/* 仅对IF/ID寄存器显示写使能输入端口 */}
          {name === 'IF/ID' && (
            <Handle
              type="target"
              position={Position.Top}
              id="writeEnable"
              className="w-3 h-3 bg-blue-400"
              style={{ left: '30%', top: -6 }}
              title="Write Enable"
            />
          )}

          {/* 对IF/ID和ID/EX寄存器显示flush输入端口 */}
          {(name === 'IF/ID' || name === 'ID/EX') && (
            <Handle
              type="target"
              position={Position.Top}
              id="flush"
              className="w-3 h-3 bg-red-400"
              style={{ left: '70%', top: -6 }}
              title="Flush"
            />
          )}

          {/* 如果没有任何控制信号，显示空白占位符 */}
          {name !== 'IF/ID' && name !== 'ID/EX' && (
            <div style={{ height: '15px' }} /> /* 空白占位符，保持端口位置一致 */
          )}
        </div>

        {/* 状态显示 - only when UI updates are not disabled */}
        {!disableUIUpdates && (
          <div className="w-full mb-4 px-2">
            {name === 'IF/ID' && (
              <div className="text-xs text-gray-600">Write: {writeEnable}</div>
            )}
            {(name === 'IF/ID' || name === 'ID/EX') && (
              <div className="text-xs text-gray-600">Flush: {flush}</div>
            )}
          </div>
        )}

        {showConfig && (
          <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Register Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Port Count</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTempConfig(prev => ({
                    ...prev,
                    portCount: Math.max(1, (prev.portCount ?? portCount) - 1)
                  }))}
                  className="px-2 py-1 border rounded-md hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-sm">{tempConfig.portCount}</span>
                <button
                  onClick={() => setTempConfig(prev => ({
                    ...prev,
                    portCount: Math.min(20, (prev.portCount ?? portCount) + 1)
                  }))}
                  className="px-2 py-1 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempConfig.name !== name || tempConfig.portCount !== portCount) {
                    const newPortCount = tempConfig.portCount ?? portCount;
                    const newValues = Array(newPortCount).fill(0);

                    // 从旧值复制尽可能多的值
                    for (let i = 0; i < Math.min(portCount, newPortCount); i++) {
                      newValues[i] = values[i];
                    }

                    // 更新节点数据
                    updateNodeData(id, {
                      ...data,
                      name: tempConfig.name,
                      portCount: newPortCount,
                      values: newValues
                    });

                    // 更新输入值
                    setInputValues(newValues);
                  }
                  setShowConfig(false);
                }}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* 使用静态定位计算每个端口的位置 */}
        <div className="flex-1 w-full relative">
          {Array.from({ length: portCount }).map((_, index) => {
            const yPosition = (index * (100 / portCount)) + (100 / (2 * portCount));
            return (
              <div
                key={index}
                className="flex w-full items-center justify-between absolute left-0 right-0 px-2"
                style={{ top: `${yPosition}%` }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`input-${index}`}
                  className="w-3 h-3 bg-blue-400"
                  style={{ left: -6 }}
                  title={`Input ${index}`}
                />
                {!disableUIUpdates && (
                  <>
                    <div className="text-xs text-gray-500 mx-2">
                      In: {inputValues[index]}
                    </div>
                    <div className="text-xs font-medium text-gray-700 mx-2">
                      {values[index]}
                    </div>
                  </>
                )}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`output-${index}`}
                  className="w-3 h-3 bg-green-400"
                  style={{ right: -6 }}
                  title={`Output ${index}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
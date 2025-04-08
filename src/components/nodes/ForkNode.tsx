import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface NodeData {
  [key: string]: number | string | undefined;
}

interface ForkNodeData extends NodeData {
  label: string;
  value?: number | string;
  portCount?: number;
}

export function ForkNode({ data, id, selected }: { data: ForkNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = React.useRef<{ value: number | string }>({ value: 0 });
  const [showConfig, setShowConfig] = React.useState(false);
  const [tempPortCount, setTempPortCount] = React.useState(data.portCount || 2);
  const portCount = data.portCount || 2;

  // 获取源节点的值
  const getSourceNodeValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // 首先尝试根据输入端口ID查找对应字段
      const portId = edge.sourceHandle;
      let sourceValue: number | string | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        // 如果存在对应端口ID的字段，使用该字段值
        sourceValue = sourceNode.data[portId as keyof typeof sourceNode.data] as number | string;
      } else if ('value' in sourceNode.data) {
        // 否则使用默认的value字段
        sourceValue = (sourceNode.data as { value?: number | string }).value;
      }

      // 确保值为string或number类型，如果无效则使用默认值0
      if (typeof sourceValue !== 'string' && typeof sourceValue !== 'number') {
        sourceValue = 0;
      }

      return sourceValue ?? null;
    }
    return null;
  };
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'input');
    const newValue = getSourceNodeValue(inputEdge);

    // 只有当输入值发生实际变化时才更新
    if (newValue !== null && newValue !== inputsRef.current.value) {
      // 更新ref中的值
      inputsRef.current.value = newValue;

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        value: newValue
      });
    }
  };
  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes, data]);
  return (
    <div className={`relative w-8 shadow-md rounded-full bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'}`} style={{ height: `${Math.max(32, portCount * 16)}px` }}>
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 z-10"
        title="Configure"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

      {showConfig && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Count</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTempPortCount(Math.max(2, tempPortCount - 1))}
                className="px-2 py-1 border rounded-md hover:bg-gray-100"
                title="Decrease Branches"
              >
                -
              </button>
              <span className="flex-1 text-center">{tempPortCount}</span>
              <button
                onClick={() => setTempPortCount(Math.min(8, tempPortCount + 1))}
                className="px-2 py-1 border rounded-md hover:bg-gray-100"
                title="Increase Branches"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowConfig(false);
                setTempPortCount(data.portCount || 2);
              }}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                updateNodeData(id, {
                  ...data,
                  portCount: tempPortCount
                });
                setShowConfig(false);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-2 h-2 bg-blue-400"
        style={{ top: '50%' }}
        title="Input"
      />
      {Array.from({ length: portCount }).map((_, i) => (
        <Handle
          key={`output-${i + 1}`}
          type="source"
          position={Position.Right}
          id={`output-${i + 1}`}
          className="w-2 h-2 bg-green-400"
          style={{ top: `${(i + 1) * (100 / (portCount + 1))}%` }}
          title={`Output ${i + 1}`}
        />
      ))}
    </div>
  );
}
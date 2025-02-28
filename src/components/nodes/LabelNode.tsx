import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useEffect } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface NodeData {
  [key: string]: number | string | undefined;
}

interface LabelNodeData extends NodeData {
  label: string;
  value?: number | string;
  outputValue?: number | string;
}

export function LabelNode({ data, id, selected }: { data: LabelNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const value = data.value ?? 0;
  const nodes = useNodes();
  const edges = useEdges();

  const handleValueChange = (newValue: number | string) => {
    // 避免重复更新相同的值
    if (value === newValue) return;

    // 更新节点自身的值和输出端口的值
    updateNodeData(id, {
      ...data,
      value: newValue,
      outputValue: newValue  // 同步更新输出值
    });
  };

  useEffect(() => {
    if (data.value !== value) {
      handleValueChange(data.value ?? 0);
    }
  }, [data.value]); // 移除value依赖，避免循环更新

  // 监听输入连接的变化
  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const inputEdge = edges.find(edge => edge.target === id);

    if (!inputEdge) {
      // 如果没有输入连接，设置默认值0
      handleValueChange(0);
      return;
    }
    // 找到源节点
    const sourceNode = nodes.find(node => node.id === inputEdge.source);
    
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // 首先尝试根据输入端口ID查找对应字段
      const portId = inputEdge.sourceHandle;
      let sourceValue: number | string | undefined;
      
      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        // 如果存在对应端口ID的字段，使用该字段值
        sourceValue = sourceNode.data[portId as keyof typeof sourceNode.data] as number | string;
      } else if ('value' in sourceNode.data) {
        // 否则使用默认的value字段
        sourceValue = (sourceNode.data as { value?: number | string }).value;
      }

      // 确保值为string或number类型，如果无效则使用默认值0
      if (typeof sourceValue === 'string' || typeof sourceValue === 'number') {
        handleValueChange(sourceValue);
      } else {
        handleValueChange(0);
      }
    } else {
      handleValueChange(0);
    }
  };

  // 监听输入连接的变化
  useEffect(() => {
    updateInputConnections();
  }, [nodes, edges, id]); // 移除value依赖，避免循环更新

  return (
    <div className={`px-2 py-1 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="input" 
        className="w-2 h-2 bg-blue-400" 
        style={{ top: '50%' }}
        title="Input Value"
      />
      
      <div className="flex items-center justify-center">
        <div className="text-base font-medium">{typeof value === 'number' ? value : String(value)}</div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="output" 
        className="w-2 h-2 bg-green-400" 
        style={{ top: '50%' }}
        title="Output Value"
      />
    </div>
  );
}
import { Handle, Position } from 'reactflow';
import React, { useState } from 'react';
import { useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';

interface MuxNodeData {
  label: string;
  select?: string;
  value?: number;
  portCount?: number;
  onDelete?: () => void;
}

export function MuxNode({ data, id, selected }: {
  data: MuxNodeData;
  id: string;
  selected?: boolean
}) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const [inputs, setInputs] = React.useState<number[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [tempPortCount, setTempPortCount] = useState(data.portCount || 2);
  const nodes = useNodes();
  const edges = useEdges();
  const inputsRef = React.useRef<{[key: string]: number}>({});
  const portCount = data.portCount || 2;

  // Monitor input connection changes and update output value
  const updateInputConnections = () => {
    const newInputs: {[key: string]: number} = {};
    let hasChanges = false;

    // Get source node value
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

    // Process all input ports
    for (let i = 0; i < portCount; i++) {
      const inputEdge = edges.find(edge => edge.target === id && edge.targetHandle === `in${i}`);
      const newValue = getSourceNodeValue(inputEdge);
      if (newValue !== null) {
        newInputs[`in${i}`] = newValue;
        if (newValue !== inputsRef.current[`in${i}`]) {
          hasChanges = true;
        }
      } else {
        newInputs[`in${i}`] = inputsRef.current[`in${i}`] || 0;
      }
    }

    // Process select signal
      const selectEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'select');
      const selectValue = getSourceNodeValue(selectEdge);
      const currentSelect = selectValue !== null ? String(selectValue) : (data.select || '0');

      if (hasChanges || currentSelect !== data.select) {
        // Update values in ref
        inputsRef.current = newInputs;

        // Calculate selected input port index
        const selectIndex = parseInt(currentSelect) % portCount;
        const outputValue = newInputs[`in${selectIndex}`] || 0;

        // Update node data
        updateNodeData(id, {
          ...data,
          value: outputValue,
          select: currentSelect
        });

        // Update state
        setInputs(Object.values(newInputs));
      }
  };
  // Monitor input connection changes
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes, data, portCount]);

  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold">MUX</div>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="p-1 rounded-md hover:bg-gray-100"
          title="Configure"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {showConfig && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Input Ports</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTempPortCount(Math.max(2, tempPortCount - 1))}
                className="px-2 py-1 border rounded-md hover:bg-gray-100"
                title="Decrease port count"
              >
                -
              </button>
              <span className="flex-1 text-center">{tempPortCount}</span>
              <button
                type="button"
                onClick={() => setTempPortCount(Math.min(8, tempPortCount + 1))}
                className="px-2 py-1 border rounded-md hover:bg-gray-100"
                title="Increase port count"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowConfig(false);
                setTempPortCount(data.portCount || 2);
              }}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
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

      {!disableUIUpdates && (
        <div className="text-sm text-gray-500 space-y-1">
          {Array.from({ length: portCount }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <span>Input {i}: </span>
              <span>{inputs[i] || 0}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Select: </span>
            <span>{data.select || '0'}</span>
          </div>
        </div>
      )}

      {/* Add placeholder div when UI updates are disabled to maintain height */}
      {disableUIUpdates && (
        <div style={{ height: `${Math.max(60, portCount * 20)}px` }}></div>
      )}

      {/* Input ports */}
      {Array.from({ length: portCount }).map((_, i) => (
        <Handle
          key={`in${i}`}
          type="target"
          position={Position.Left}
          id={`in${i}`}
          className="w-3 h-3 bg-blue-400"
          style={{ top: `${20 + (i * 60 / (portCount - 1))}%` }}
          title={`Input ${i}`}
        />
      ))}

      {/* Output port */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%' }}
        title="Output"
      />

      {/* Select signal port */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="select"
        className="w-3 h-3 bg-yellow-400"
        style={{ left: '50%' }}
        title="Select Signal"
      />
    </div>
  );
}
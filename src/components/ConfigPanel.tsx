import React from 'react';
import { useCircuitStore } from '../store/circuitStore';

export function ConfigPanel() {
  const selectedNode = useCircuitStore((state) => state.selectedNode);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);

  if (!selectedNode) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Select a component to configure</p>
      </div>
    );
  }

  const renderConfig = () => {
    switch (selectedNode.type) {
      case 'alu':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU Configuration</h3>
            <select
              className="w-full p-2 border rounded"
              value={selectedNode.data.operation || 'add'}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { operation: e.target.value })
              }
            >
              <option value="add">Add</option>
              <option value="sub">Subtract</option>
              <option value="and">AND</option>
              <option value="or">OR</option>
              <option value="slt">Set Less Than</option>
            </select>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Register Configuration</h3>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Register Name"
              value={selectedNode.data.name || ''}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { name: e.target.value })
              }
            />
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Initial Value"
              value={selectedNode.data.value || 0}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  value: parseInt(e.target.value, 10),
                })
              }
            />
          </div>
        );

      case 'instruction-memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Instruction Memory</h3>
            <textarea
              className="w-full p-2 border rounded font-mono text-sm"
              placeholder="Enter instructions (one per line)"
              value={selectedNode.data.instructions?.join('\n') || ''}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  instructions: e.target.value.split('\n').filter(Boolean),
                })
              }
              rows={8}
            />
          </div>
        );

      case 'memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Memory Configuration</h3>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Memory Size (bytes)"
              value={selectedNode.data.size || 1024}
              onChange={(e) =>
                updateNodeData(selectedNode.id, {
                  size: parseInt(e.target.value, 10),
                })
              }
            />
            <div className="border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Memory Contents</h4>
              <div className="space-y-2">
                {Object.entries(selectedNode.data.contents || {}).map(([addr, value]) => (
                  <div key={addr} className="flex space-x-2">
                    <input
                      type="number"
                      className="w-24 p-1 border rounded"
                      placeholder="Address"
                      value={addr}
                      readOnly
                    />
                    <input
                      type="number"
                      className="w-24 p-1 border rounded"
                      placeholder="Value"
                      value={value}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          contents: {
                            ...selectedNode.data.contents,
                            [addr]: parseInt(e.target.value, 10),
                          },
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  className="w-full p-1 bg-gray-100 rounded hover:bg-gray-200"
                  onClick={() =>
                    updateNodeData(selectedNode.id, {
                      contents: {
                        ...selectedNode.data.contents,
                        [Object.keys(selectedNode.data.contents || {}).length * 4]: 0,
                      },
                    })
                  }
                >
                  Add Memory Location
                </button>
              </div>
            </div>
          </div>
        );

      case 'control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Control Unit Configuration</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedNode.data.regWrite || false}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { regWrite: e.target.checked })
                  }
                />
                <span>RegWrite</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedNode.data.memRead || false}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { memRead: e.target.checked })
                  }
                />
                <span>MemRead</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedNode.data.memWrite || false}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { memWrite: e.target.checked })
                  }
                />
                <span>MemWrite</span>
              </label>
              <div>
                <label className="block text-sm">ALUOp</label>
                <select
                  className="w-full p-1 border rounded"
                  value={selectedNode.data.aluOp || '00'}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { aluOp: e.target.value })
                  }
                >
                  <option value="00">00 (Add/Load/Store)</option>
                  <option value="01">01 (Branch)</option>
                  <option value="10">10 (R-type)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'imm-gen':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Immediate Generator Configuration</h3>
            <select
              className="w-full p-2 border rounded"
              value={selectedNode.data.format || 'I'}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { format: e.target.value })
              }
            >
              <option value="I">I-type</option>
              <option value="S">S-type</option>
              <option value="B">B-type</option>
              <option value="U">U-type</option>
              <option value="J">J-type</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Component Configuration</h2>
      {renderConfig()}
    </div>
  );
}
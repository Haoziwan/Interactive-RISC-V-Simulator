import { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function ConfigPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedNode = useCircuitStore((state) => state.selectedNode);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);

  if (!selectedNode) {
    return null;
  }
  const renderConfig = () => {
    switch (selectedNode.type) {
      case 'constant':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Constant Configuration</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pc-mux':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">PC Multiplexer Configuration</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Signal
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.select || '0'}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { select: e.target.value })
                  }
                >
                  <option value="0">PC + 4</option>
                  <option value="1">Branch Target</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PC + 4 Input
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.pc4 || 0}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { pc4: parseInt(e.target.value, 10) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Target Input
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.branchTarget || 0}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { branchTarget: parseInt(e.target.value, 10) })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 'alu':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU Configuration</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operation
                </label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input A
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.inputA || 0}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { inputA: parseInt(e.target.value, 10) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input B
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.inputB || 0}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { inputB: parseInt(e.target.value, 10) })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Register Configuration</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.name || 'R'}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Value
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.value || 0}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      value: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
            </div>
          </div>
        );
      case 'instruction-memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Instruction Memory</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  className="w-full p-2 border rounded font-mono text-sm"
                  value={selectedNode.data.instructions?.join('\n') || ''}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      instructions: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  rows={8}
                />
              </div>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Memory Configuration</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Size (bytes)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.size || 1024}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      size: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Contents
                </label>
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
                        value={Number(value)}
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
          </div>
        );

      case 'control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Control Unit Configuration</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RegWrite
                </label>
                <input
                  type="checkbox"
                  checked={selectedNode.data.regWrite || false}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { regWrite: e.target.checked })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MemRead
                </label>
                <input
                  type="checkbox"
                  checked={selectedNode.data.memRead || false}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { memRead: e.target.checked })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MemWrite
                </label>
                <input
                  type="checkbox"
                  checked={selectedNode.data.memWrite || false}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { memWrite: e.target.checked })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ALUOp
                </label>
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
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
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
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">{selectedNode.type} Configuration</h3>
            <p className="text-sm text-gray-500">No configuration options available</p>
          </div>
        );
    }
  };

  return (
    <div 
      className="absolute bottom-0 bg-white border-l border-t border-gray-200 shadow-lg transition-transform duration-200"
      style={{ 
        width: '18rem',
        right: '16rem', 
        maxHeight: 'calc(100vh - 5rem)',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 2.5rem))'
      }}
    >
      <div className="p-2 border-b border-gray-200 bg-white">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium">Component Configuration</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
      <div 
        className="overflow-y-auto bg-white"
        style={{
          maxHeight: isExpanded ? 'calc(100vh - 8rem)' : 0,
          transition: 'max-height 200ms ease-in-out'
        }}
      >
        <div className="p-4">
          {renderConfig()}
        </div>
      </div>
    </div>
  );
}
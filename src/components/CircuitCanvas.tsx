import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  Panel,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  ConnectionMode,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ALUNode } from './nodes/ALUNode';
import { RegisterFileNode } from './nodes/RegisterFileNode';
import { MuxNode } from './nodes/MuxNode';
import { ImmGenNode } from './nodes/ImmGenNode';
import { ControlNode } from './nodes/ControlNode';
import { DataMemoryNode } from './nodes/DataMemoryNode';
import { InstructionMemoryNode } from './nodes/InstructionMemoryNode';
import { ALUControlNode } from './nodes/ALUControlNode';
import { PCNode } from './nodes/PCNode';
import { ConstantNode } from './nodes/ConstantNode';
import { SingleRegisterNode } from './nodes/SingleRegisterNode';
import { LabelNode } from './nodes/LabelNode';
import { AddNode } from './nodes/AddNode';
import { ForkNode } from './nodes/ForkNode';
import { InstrDistributerNode } from './nodes/InstrDistributerNode';
import { JumpControlNode } from './nodes/JumpControlNode';
import { PipelineRegisterNode } from './nodes/PipelineRegisterNode';
import { useCircuitStore } from '../store/circuitStore';
import { Play, Pause, RotateCcw, StepForward, CheckCircle, Trash2 } from 'lucide-react';
import { ForwardingUnitNode } from './nodes/ForwardingUnitNode';
import { HazardDetectionUnitNode } from './nodes/HazardDetectionUnitNode';
import { BranchHazardUnitNode } from './nodes/BranchHazardUnitNode';
import EditableEdge from './edges/EditableEdge';

const nodeTypes = {
  alu: ALUNode,
  register: RegisterFileNode,
  mux: MuxNode,
  'imm-gen': ImmGenNode,
  control: ControlNode,
  memory: DataMemoryNode,
  'instruction-memory': InstructionMemoryNode,
  'alu-control': ALUControlNode,
  pc: PCNode,
  constant: ConstantNode,
  'single-register': SingleRegisterNode,
  'pipeline-register': PipelineRegisterNode,
  label: LabelNode,
  add: AddNode,
  fork: ForkNode,
  'instr-distributer': InstrDistributerNode,
  'jump-control': JumpControlNode,
  'forwarding-unit': ForwardingUnitNode,
  'hazard-detection-unit': HazardDetectionUnitNode,
  'branch-hazard-unit': BranchHazardUnitNode,
};

// Define edge types
const edgeTypes = {
  editableEdge: EditableEdge,
};

// 定义必需的组件和它们允许的数量
const requiredComponents = {
  pc: { min: 1, max: 1 },
  alu: { min: 1, max: 1 },
  register: { min: 1, max: 1 },
  'instruction-memory': { min: 1, max: 1 },
  memory: { min: 1, max: 1 },
  control: { min: 1, max: 1 },
  'alu-control': { min: 1, max: 1 },
};

export function CircuitCanvas() {
  const {
    nodes,
    edges,
    addNode,
    addEdge,
    setSelectedNode,
    setSelectedEdge,
    selectedNode,
    selectedEdge,
    removeNode,
    removeEdge,
    isSimulating,
    toggleSimulation,
    resetSimulation,
    stepSimulation,
    updateNodes,
    disableUIUpdates,
    toggleUIUpdates
  } = useCircuitStore();
  const [edgeType, setEdgeType] = useState('smoothstep');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(ConnectionMode.Loose);
  const [edgeAnimated, setEdgeAnimated] = useState(false);
  const [edgeColor, setEdgeColor] = useState('#999');
  const [edgeWidth, setEdgeWidth] = useState(3);
  const [showEdgeSettings, setShowEdgeSettings] = useState(false);
  const [editableLineType, setEditableLineType] = useState<'straight' | 'step'>('step');

  React.useEffect(() => {
    // Load basic datapath when component mounts
    fetch('/datapath/basic-datapath.json')
      .then(response => response.json())
      .then(data => {
        useCircuitStore.getState().loadCircuit(JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error loading basic datapath:', error);
      });
  }, []);

  const validateCircuit = useCallback(() => {
    const errors: string[] = [];
    const componentCounts: { [key: string]: number } = {};

    // 统计各类组件数量
    nodes.forEach(node => {
      if (node.type) {
        componentCounts[node.type] = (componentCounts[node.type] || 0) + 1;
      }
    });

    // 检查必需组件
    Object.entries(requiredComponents).forEach(([type, { min, max }]) => {
      const count = componentCounts[type] || 0;
      if (count < min) {
        errors.push(`Missing required component: ${type}`);
      } else if (count > max) {
        errors.push(`Too many ${type} components, maximum allowed: ${max}`);
      }
    });

    // 检查连接
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    nodes.forEach(node => {
      if (!connectedNodes.has(node.id)) {
        errors.push(`Component ${node.type} (${node.id}) is not connected to any other component`);
      }
    });

    // 显示验证结果
    if (errors.length === 0) {
      alert('Datapath validation passed! All required components are properly configured.');
    } else {
      alert('Datapath validation failed:\n' + errors.join('\n'));
    }
  }, [nodes, edges]);

  // Handle clicking on empty space
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);

    // Clear the selected state and highlighting from all edges
    useCircuitStore.setState((state) => ({
      edges: state.edges.map(e => ({
        ...e,
        selected: false,
        data: {
          ...e.data,
          isHighlighted: false
        },
        style: {
          ...e.style,
          stroke: edgeColor,
          strokeWidth: edgeWidth,
        },
        markerEnd: {
          type: 'arrow' as MarkerType,
          width: 20,
          height: 20,
          color: edgeColor,
        },
      }))
    }));
  }, [setSelectedNode, setSelectedEdge, edgeColor, edgeWidth]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      updateNodes(nextNodes);
    },
    [nodes, updateNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const nextEdges = applyEdgeChanges(changes, edges);
      useCircuitStore.setState((state) => ({ edges: nextEdges }));
    },
    [edges]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();

      // Select the edge
      setSelectedEdge(edge);

      // Update the edges to mark this one as selected and reset any highlighting
      useCircuitStore.setState((state) => ({
        edges: state.edges.map(e => ({
          ...e,
          selected: e.id === edge.id,
          data: {
            ...e.data,
            isHighlighted: false // Reset highlighting when selecting an edge
          },
          style: {
            ...e.style,
            stroke: e.id === edge.id ? '#3b82f6' : edgeColor,
            strokeWidth: e.id === edge.id ? edgeWidth + 1 : edgeWidth,
            // Add dashed style if it's an editable edge and selected to indicate edit mode
            strokeDasharray: (e.type === 'editableEdge' && e.id === edge.id) ? '5,5' : undefined,
          },
          markerEnd: {
            type: 'arrow' as MarkerType,
            width: 20,
            height: 20,
            color: e.id === edge.id ? '#3b82f6' : edgeColor,
          },
        }))
      }));
    },
    [setSelectedEdge, edgeColor, edgeWidth]
  );
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);

      // 同步节点数据
      if (sourceNode && targetNode) {
        if (sourceNode.type === 'constant' && targetNode.type === 'label') {
          const sourceValue = sourceNode.data.value ?? 0;
          useCircuitStore.getState().updateNodeData(targetNode.id, {
            ...targetNode.data,
            value: sourceValue
          });
        }
      }

      const newEdge = {
        ...params,
        type: edgeType,
        animated: edgeAnimated,
        style: {
          stroke: edgeColor,
          strokeWidth: edgeWidth,
        },
        markerEnd: {
          type: 'arrow' as MarkerType,
          width: 20,
          height: 20,
          color: edgeColor,
        },
        // Initialize data with empty intermediatePoints array and lineType if it's an editable edge
        data: edgeType === 'editableEdge' ? {
          intermediatePoints: [],
          lineType: editableLineType
        } : undefined,
        // Ensure editable edges are selectable and interactive
        selectable: true,
        focusable: true,
        updatable: true,
      };
      addEdge(newEdge);
    },
    [addEdge, edgeType, edgeAnimated, edgeColor, edgeWidth, nodes, editableLineType]
  );
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.toUpperCase() },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);

      // Find all edges connected to this node (both input and output)
      const connectedEdges = edges.filter(
        edge => edge.source === node.id || edge.target === node.id
      );

      // Update all edges to highlight those connected to the selected node
      useCircuitStore.setState((state) => ({
        edges: state.edges.map(e => ({
          ...e,
          // Store the highlighted state in the data object
          data: {
            ...e.data,
            isHighlighted: connectedEdges.some(ce => ce.id === e.id)
          },
          style: {
            ...e.style,
            // Keep the selected edge blue, highlight connected edges, others remain default
            stroke: e.selected ? '#3b82f6' :
                   connectedEdges.some(ce => ce.id === e.id) ? '#ff6b00' : edgeColor,
            // Increase width for highlighted edges
            strokeWidth: e.selected ? edgeWidth + 1 :
                        connectedEdges.some(ce => ce.id === e.id) ? edgeWidth + 1 : edgeWidth,
          },
          markerEnd: {
            type: 'arrow' as MarkerType,
            width: 20,
            height: 20,
            color: e.selected ? '#3b82f6' :
                   connectedEdges.some(ce => ce.id === e.id) ? '#ff6b00' : edgeColor,
          },
        }))
      }));
    },
    [setSelectedNode, edges, edgeColor, edgeWidth]
  );
  const edgeOptions = [
    { value: 'default', label: 'default' },
    { value: 'step', label: 'step' },
    { value: 'smoothstep', label: 'smoothstep' },
    { value: 'editableEdge', label: 'editable' },
  ];
  const defaultEdgeOptions = {
    type: edgeType,
    animated: edgeAnimated,
    style: {
      stroke: edgeColor,
      strokeWidth: edgeWidth,
    },
    markerEnd: {
      type: 'arrow' as MarkerType,
      width: 20,
      height: 20,
      color: edgeColor,
    },
  };
  const connectionModeOptions = [
    { value: ConnectionMode.Strict, label: 'Strict' },
    { value: ConnectionMode.Loose, label: 'Loose' },
  ];
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          style: {
            ...defaultEdgeOptions.style,
            // Priority: selected > highlighted > default
            stroke: edge.selected ? '#3b82f6' :
                   edge.data?.isHighlighted ? '#ff6b00' :
                   edgeColor,
            strokeWidth: edge.selected || edge.data?.isHighlighted ? edgeWidth + 1 : edgeWidth,
            // Add dashed style if it's an editable edge and selected to indicate edit mode
            strokeDasharray: (edge.type === 'editableEdge' && edge.selected) ? '5,5' : undefined,
          },
          markerEnd: {
            type: 'arrow' as MarkerType,
            width: 20,
            height: 20,
            // Match the stroke color
            color: edge.selected ? '#3b82f6' :
                  edge.data?.isHighlighted ? '#ff6b00' :
                  edgeColor,
          },
          // Preserve any existing data, including intermediatePoints and lineType
          data: {
            ...edge.data,
            // Ensure intermediatePoints and lineType exist for editable edges
            ...(edge.type === 'editableEdge' && {
              intermediatePoints: edge.data?.intermediatePoints || [],
              lineType: edge.data?.lineType || 'step',
            }),
          },
          // Enhanced interaction properties
          selectable: true,
          focusable: true,
          updatable: true,
          interactionWidth: 20,
        }))}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesConnectable={true}
        nodesDraggable={true}
        edgesUpdatable={true}
        edgesFocusable={true}
        selectNodesOnDrag={false}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={connectionMode}
        minZoom={0.2}
        maxZoom={3}
        panOnScroll={true}
        // Only allow panning when no edge is selected
        panOnDrag={!selectedEdge}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#bbb" />
        <Controls />

        {/* Help panel for editable edges */}
        {selectedEdge && selectedEdge.type === 'editableEdge' && (
          <Panel position="bottom-center" className="bg-white p-2 rounded-lg shadow-lg mb-4">
            <div className="text-xs text-gray-600">
              <strong>Editable Edge:</strong> Click on edge to add points • Drag points to reposition • Right-click points to delete
            </div>
          </Panel>
        )}

        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-lg mr-4 mt-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={() => setShowEdgeSettings(!showEdgeSettings)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                Setting {showEdgeSettings ? '▼' : '▶'}
              </button>
            </div>
            {showEdgeSettings && (
              <div className="space-y-2 p-2 bg-gray-50 rounded">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-600">Edge Type</label>
                  <select
                    value={edgeType}
                    onChange={(e) => {
                      const newEdgeType = e.target.value;
                      setEdgeType(newEdgeType);

                      // Update all edges to the new type and initialize intermediatePoints if needed
                      useCircuitStore.getState().updateEdgeType(newEdgeType);

                      // If switching to editable edge, initialize intermediatePoints and lineType for all edges
                      if (newEdgeType === 'editableEdge') {
                        useCircuitStore.setState((state) => ({
                          edges: state.edges.map(edge => ({
                            ...edge,
                            data: {
                              ...edge.data,
                              intermediatePoints: edge.data?.intermediatePoints || [],
                              lineType: edge.data?.lineType || 'step'
                            }
                          }))
                        }));
                      }
                    }}
                    className="px-2 py-1 rounded border border-gray-200 text-sm"
                  >
                    {edgeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add line type selector for editable edges */}
                {edgeType === 'editableEdge' && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-gray-600">Line Type</label>
                    <select
                      value={editableLineType}
                      onChange={(e) => {
                        const newLineType = e.target.value as 'straight' | 'step';
                        setEditableLineType(newLineType);

                        // Update all editable edges to use the new line type
                        useCircuitStore.setState((state) => ({
                          edges: state.edges.map(edge => ({
                            ...edge,
                            data: {
                              ...edge.data,
                              ...(edge.type === 'editableEdge' && {
                                lineType: newLineType
                              })
                            }
                          }))
                        }));
                      }}
                      className="px-2 py-1 rounded border border-gray-200 text-sm"
                    >
                      <option value="step">Step Line</option>
                      <option value="straight">Straight Line</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-600">Connection Mode</label>
                  <select
                    value={connectionMode}
                    onChange={(e) => {
                      setConnectionMode(e.target.value as ConnectionMode);
                      useCircuitStore.getState().updateConnectionMode(e.target.value as ConnectionMode);
                    }}
                    className="px-2 py-1 rounded border border-gray-200 text-sm"
                  >
                    {connectionModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-600">Edge Color</label>
                  <input
                    type="color"
                    value={edgeColor}
                    onChange={(e) => setEdgeColor(e.target.value)}
                    className="w-full h-6 rounded border border-gray-200"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-600">Edge Width</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={edgeWidth}
                    onChange={(e) => setEdgeWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={edgeAnimated}
                    onChange={(e) => {
                      setEdgeAnimated(e.target.checked);
                      useCircuitStore.getState().updateEdgeAnimated(e.target.checked);
                    }}
                    className="rounded border-gray-300"
                    id="edge-animation"
                    title="Toggle edge animation"
                  />
                  <label htmlFor="edge-animation" className="text-xs text-gray-600">Animation</label>
                </div>

                {/* UI Updates Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={disableUIUpdates}
                    onChange={() => toggleUIUpdates()}
                    className="rounded border-gray-300"
                    id="disable-ui-updates"
                    title="Disable UI updates for better performance"
                  />
                  <label htmlFor="disable-ui-updates" className="text-xs text-gray-600">Disable UI Updates</label>
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={validateCircuit}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Validate Datapath"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (selectedEdge) {
                    removeEdge(selectedEdge.id);
                    setSelectedEdge(null);
                  } else if (selectedNode) {
                    removeNode(selectedNode.id);
                    setSelectedNode(null);
                  }
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Delete selected component or edge"
                disabled={!selectedEdge && !selectedNode}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
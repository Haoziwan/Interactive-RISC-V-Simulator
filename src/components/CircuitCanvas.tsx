import React, { useCallback } from 'react';
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
  applyEdgeChanges
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
import { BranchAdderNode } from './nodes/BranchAdderNode';
import { PCMuxNode } from './nodes/PCMuxNode';
import { useCircuitStore } from '../store/circuitStore';
import { Play, Pause, RotateCcw, StepForward, CheckCircle, Trash2 } from 'lucide-react';

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
  'branch-adder': BranchAdderNode,
  'pc-mux': PCMuxNode,
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
    updateNodes
  } = useCircuitStore();

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
        errors.push(`缺少必需组件: ${type}`);
      } else if (count > max) {
        errors.push(`${type} 组件数量过多，最多允许 ${max} 个`);
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
        errors.push(`组件 ${node.type} (${node.id}) 未连接到任何其他组件`);
      }
    });

    // 显示验证结果
    if (errors.length === 0) {
      alert('数据通路验证通过！所有必需组件都已正确配置。');
    } else {
      alert('数据通路验证失败：\n' + errors.join('\n'));
    }
  }, [nodes, edges]);

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
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      addEdge(params);
    },
    [addEdge]
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
    },
    [setSelectedNode]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesConnectable={true}
        nodesDraggable={true}
        edgesUpdatable={true}
        edgesFocusable={true}
        selectNodesOnDrag={false}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-lg mr-4 mt-4">
          <div className="flex space-x-2">
            <button
              onClick={toggleSimulation}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title={isSimulating ? 'Pause Simulation' : 'Start Simulation'}
            >
              {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={stepSimulation}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Step Forward"
              disabled={isSimulating}
            >
              <StepForward className="w-5 h-5" />
            </button>
            <button
              onClick={resetSimulation}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={validateCircuit}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="验证数据通路"
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
              title="删除选中的组件或连线"
              disabled={!selectedEdge && !selectedNode}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
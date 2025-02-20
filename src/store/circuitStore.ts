import { create } from 'zustand';
import { Connection, Edge, Node } from 'reactflow';
import { Circuit, Component } from '../types/Circuit';

interface CircuitState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  circuit: Circuit;
  isSimulating: boolean;
  updateNodeData: (nodeId: string, data: any) => void;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  addNode: (node: Node) => void;
  addEdge: (connection: Connection) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  saveCircuit: () => string;
  loadCircuit: (jsonData: string) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  updateNodes: (changes: Node[]) => void;
}

const initialCircuit: Circuit = {
  id: 'main',
  name: 'Main Circuit',
  components: [],
  wires: [],
};

export const useCircuitStore = create<CircuitState>()((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  circuit: initialCircuit,
  isSimulating: false,

  updateNodeData: (nodeId: string, newData: any) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    })),

  setSelectedNode: (node: Node | null) => set({ selectedNode: node }),

  setSelectedEdge: (edge: Edge | null) => set({ selectedEdge: edge }),

  addNode: (node: Node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  addEdge: (connection: Connection) =>
    set((state) => ({
      edges: [
        ...state.edges,
        {
          id: `e${connection.source}-${connection.target}`,
          source: connection.source || '',
          target: connection.target || '',
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: 'default',
        },
      ],
    })),

  saveCircuit: () => {
    const { nodes, edges, isSimulating } = get();
    const circuitState = {
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          instructions: node.type === 'instruction-memory' ? node.data.instructions : undefined,
          contents: node.type === 'memory' ? node.data.contents : undefined,
          value: node.data.value,
          operation: node.data.operation,
          format: node.data.format,
          regWrite: node.data.regWrite,
          memRead: node.data.memRead,
          memWrite: node.data.memWrite,
          aluOp: node.data.aluOp,
          pc: node.data.pc
        }
      })),
      edges,
      isSimulating
    };
    return JSON.stringify(circuitState, null, 2);
  },

  loadCircuit: (jsonData: string) => {
    try {
      const circuitState = JSON.parse(jsonData);
      const nodes = circuitState.nodes.map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
          instructions: node.type === 'instruction-memory' ? node.data.instructions : undefined,
          contents: node.type === 'memory' ? node.data.contents : undefined,
          value: node.data.value || 0,
          operation: node.data.operation,
          format: node.data.format,
          regWrite: node.data.regWrite || false,
          memRead: node.data.memRead || false,
          memWrite: node.data.memWrite || false,
          aluOp: node.data.aluOp || '00',
          pc: node.data.pc || 0
        }
      }));
      set({
        nodes,
        edges: circuitState.edges,
        isSimulating: circuitState.isSimulating || false
      });
    } catch (error) {
      console.error('加载电路数据失败:', error);
      throw new Error('无效的电路数据文件');
    }
  },

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  resetSimulation: () => {
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          value: 0,
          pc: 0,
          regWrite: false,
          memRead: false,
          memWrite: false,
          aluOp: '00',
        },
      })),
      isSimulating: false,
    }));
  },

  stepSimulation: () => {
    const state = get();
    if (state.isSimulating) return;

    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.type === 'instruction-memory') {
          return {
            ...node,
            data: {
              ...node.data,
              pc: (node.data.pc || 0) + 1,
            },
          };
        }
        return node;
      }),
    }));
  },
  updateNodes: (changes) => set((state) => {
    const nextNodes = state.nodes.map(node => {
      const change = changes.find(change => change.id === node.id);
      if (change) {
        return { ...node, ...change };
      }
      return node;
    });
    return { nodes: nextNodes };
  }),

  removeNode: (nodeId: string) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
    edges: state.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ),
  })),

  removeEdge: (edgeId: string) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
  })),
}));
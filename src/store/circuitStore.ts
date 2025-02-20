import { create } from 'zustand';
import { Connection, Edge, Node } from 'reactflow';
import { Circuit } from '../types/Circuit';

interface CircuitState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  circuit: Circuit;
  isSimulating: boolean;
  assembledInstructions: Array<{hex: string; binary: string; assembly?: string}>;
  editorCode: string;
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
  setAssembledInstructions: (instructions: Array<{hex: string; binary: string; assembly?: string}>) => void;
  setEditorCode: (code: string) => void;
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
  assembledInstructions: [],
  editorCode: '',

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
    const state = get();
    const circuitState = {
      nodes: state.nodes.map(node => ({
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
      edges: state.edges,
      isSimulating: state.isSimulating,
      editorCode: state.editorCode,
      assembledInstructions: state.assembledInstructions
    };
    return JSON.stringify(circuitState, null, 2);
  },

  loadCircuit: (jsonData: string) => {
    try {
      const circuitState = JSON.parse(jsonData);
      set((state) => ({
        ...state,
        nodes: circuitState.nodes || [],
        edges: circuitState.edges || [],
        isSimulating: circuitState.isSimulating || false,
        editorCode: circuitState.editorCode || '',
        assembledInstructions: circuitState.assembledInstructions || [],
        selectedNode: null,
        selectedEdge: null
      }));
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
          const currentPc = node.data.pc || 0;
          const instructions = node.data.instructions || [];
          
          // 检查是否到达指令末尾
          if (currentPc >= instructions.length) {
            return node; // 不再增加PC
          }

          // 获取当前指令
          const currentInstruction = instructions[currentPc];
          
          return {
            ...node,
            data: {
              ...node.data,
              pc: currentPc + 1,
              currentInstruction,
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

  setAssembledInstructions: (instructions) => set({ assembledInstructions: instructions }),

  setEditorCode: (code) => set({ editorCode: code }),

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
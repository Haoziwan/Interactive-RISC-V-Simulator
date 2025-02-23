import { create } from 'zustand';
import { Connection, Edge, Node, ConnectionMode } from 'reactflow';
import { Circuit } from '../types/Circuit';

interface CircuitState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  circuit: Circuit;
  isSimulating: boolean;
  stepCount: number;
  assembledInstructions: Array<{hex: string; binary: string; assembly?: string}>;
  editorCode: string;
  simulationInterval: number;
  simulationTimer: number | null;
  registers: { [key: number]: number };
  updateRegisters: (registers: { [key: number]: number }) => void;
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
  updateEdgeType: (type: string) => void;
  updateEdgeAnimated: (animated: boolean) => void;
  updateConnectionMode: (mode: ConnectionMode) => void;
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
  stepCount: 0,
  assembledInstructions: [],
  editorCode: '',
  simulationInterval: 1000,
  simulationTimer: null,
  registers: {},
  updateRegisters: (registers) => set((state) => ({
    registers: {
      ...state.registers,
      ...registers
    }
  })),
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

  addEdge: (connection: any) =>
    set((state) => ({
      edges: [
        ...state.edges,
        {
          ...connection,
          id: `e${connection.source}-${connection.target}`,
          source: connection.source || '',
          target: connection.target || '',
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: connection.type || 'smoothstep',
          animated: connection.animated || false,
          style: connection.style || {
            stroke: '#999',
            strokeWidth: 2
          },
          markerEnd: connection.markerEnd || {
            type: 'arrow',
            width: 20,
            height: 20,
            color: '#999'
          }
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

  toggleSimulation: () => {
    const state = get();
    const newIsSimulating = !state.isSimulating;
    
    // 清除现有的定时器（如果存在）
    if (state.simulationTimer !== null) {
      window.clearInterval(state.simulationTimer);
    }
    
    if (newIsSimulating) {
      // 启动新的定时器
      const timer = window.setInterval(() => {
        get().stepSimulation();
      }, state.simulationInterval);
      
      set({
        isSimulating: true,
        simulationTimer: timer
      });
    } else {
      // 暂停模拟
      set({
        isSimulating: false,
        simulationTimer: null
      });
    }
  },

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
      stepCount: 0,
    }));
  },

  stepSimulation: () => {
    set((state) => ({
      stepCount: state.stepCount + 1
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

  updateEdgeType: (type: string) => set((state) => ({
    edges: state.edges.map((edge) => ({
      ...edge,
      type
    }))
  })),

  updateEdgeAnimated: (animated: boolean) => set((state) => ({
    edges: state.edges.map((edge) => ({
      ...edge,
      animated
    }))
  })),

  updateConnectionMode: (mode: ConnectionMode) => set((state) => ({
    edges: state.edges.map((edge) => ({
      ...edge,
      connectionMode: mode
    }))
  })),
}));
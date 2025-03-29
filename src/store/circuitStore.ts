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
  isProcessing: boolean;
  stepCount: number;
  assembledInstructions: Array<{hex: string; binary: string; assembly?: string; source?: string; segment?: 'text' | 'data', address?: number, data?: number[]}>;
  editorCode: string;
  simulationInterval: number;
  simulationTimer: number | null;
  registers: { [key: number]: number };
  memory: { [key: string]: number };
  pcValue: number;
  currentInstructionIndex: number;
  simulationHistory: Array<{
    nodes: Node[];
    registers: { [key: number]: number };
    memory: { [key: string]: number };
    pcValue: number;
    currentInstructionIndex: number;
    stepCount: number;
  }>;
  outputMessages: string[];
  updatePcValue: (value: number) => void;
  updateMemory: (memory: { [key: string]: number }) => void;
  clearMemory: () => void;
  updateRegisters: (registers: { [key: number]: number }) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  updateAllNodesInputs: () => void;
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
  stepBackSimulation: () => void;
  updateNodes: (changes: Node[]) => void;
  updateEdgeType: (type: string) => void;
  updateEdgeAnimated: (animated: boolean) => void;
  updateConnectionMode: (mode: ConnectionMode) => void;
  setAssembledInstructions: (instructions: Array<{hex: string; binary: string; assembly?: string; source?: string; segment?: 'text' | 'data', address?: number, data?: number[]}>) => void;
  setEditorCode: (code: string) => void;
  addOutputMessage: (message: string) => void;
  clearOutputMessages: () => void;
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
  isProcessing: false,
  stepCount: 0,
  assembledInstructions: [],
  editorCode: '',
  simulationInterval: 1000,
  simulationTimer: null,
  registers: {},
  memory: {},
  pcValue: 0,
  currentInstructionIndex: 0,
  simulationHistory: [],
  outputMessages: [],
  updatePcValue: (value: number) => set({ 
    pcValue: value,
    currentInstructionIndex: value / 4
  }),
  updateMemory: (memory) => set((state) => ({
    memory: {
      ...state.memory,
      ...memory
    }
  })),
  clearMemory: () => set({ memory: {} }),
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
  updateAllNodesInputs: () => {
    const state = get();
    state.nodes.forEach(node => {
      if (node.data && typeof node.data.updateInputConnections === 'function') {
        node.data.updateInputConnections();
      }
    });
  },
  setSelectedNode: (node: Node | null) => set({ selectedNode: node }),
  setSelectedEdge: (edge: Edge | null) => set((state) => ({
    selectedEdge: edge,
    edges: state.edges.map(e => ({
      ...e,
      selected: e.id === edge?.id,
      style: {
        ...e.style,
        stroke: e.id === edge?.id ? '#3182ce' : '#999',
        strokeWidth: e.id === edge?.id ? 3 : 1,
      }
    }))
  })),
  addNode: (node: Node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  addEdge: (connection: any) =>
    set((state) => {
      // 计算相同source和target之间的边的数量，用于生成序号
      const existingEdgesCount = state.edges.filter(
        edge => edge.source === connection.source && edge.target === connection.target
      ).length;

      // 生成带序号的唯一ID
      const edgeId = `e${connection.source}-${connection.target}-${existingEdgesCount + 1}`;

      return {
        edges: [
          ...state.edges,
          {
            ...connection,
            id: edgeId,
            source: connection.source || '',
            target: connection.target || '',
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: connection.type || 'smoothstep',
            animated: connection.animated || false,
            selected: false,
            style: connection.style || {
              stroke: '#999',
              strokeWidth: 1
            },
            markerEnd: connection.markerEnd || {
              type: 'arrow',
              width: 20,
              height: 20,
              color: '#999'
            }
          },
        ],
      };
    }),
  saveCircuit: (filename?: string) => {
    const state = get();
    const circuitState = {
      name: filename || `circuit-${new Date().toISOString().replace(/[:.]/g, '-')}`,
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
      assembledInstructions: state.assembledInstructions,
      savedAt: new Date().toISOString()
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
      // 延迟到下一个更新周期重置模拟状态
      setTimeout(() => {
        get().resetSimulation();
      }, 0);
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
    const state = get();
    // 如果正在运行，先停止模拟
    if (state.simulationTimer !== null) {
      window.clearInterval(state.simulationTimer);
    }

    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.type === 'pc') {
          return {
            ...node,
            data: {
              ...node.data,
              value: 0,
              reset: true
            }
          };
        }
        if (node.type === 'instruction-memory') {
          return {
            ...node,
            data: {
              ...node.data,
              pc: 0,
              value: node.data.instructions?.[0] || null
            }
          };
        }
        if (node.type === 'single-register' || node.type === 'pipeline-register') {
          return {
            ...node,
            data: {
              ...node.data,
              value: 0,
              reset: true,
              values: node.type === 'pipeline-register' ? Array(node.data.portCount || 1).fill(0) : undefined,
              label: '',
              outputValue: 0
            }
          };
        }
        
        return node;
      }),
      isSimulating: false,
      isProcessing: false,
      stepCount: 0,
      simulationTimer: null,
      pcValue: 0,
      currentInstructionIndex: 0,
      simulationHistory: [],
      outputMessages: [], // Clear output messages when simulation is reset
      registers: {}, // Clear registers
      memory: state.memory // Preserve memory to keep data segment loaded by the assembler
    }));
    
    // 延迟到下一个事件循环设置寄存器默认值，但保留内存中的数据段
    setTimeout(() => {
      set((state) => ({
        registers: {
          2: 0x7ffffff0,  // sp
          3: 0x10000000   // gp
        }
      }));

      get().updateAllNodesInputs();
    }, 0);
  },
  stepSimulation: () => {
    set((state) => {
      // 如果正在处理中，则不执行任何操作
      if (state.isProcessing) {
        return {};
      }

      // 检查当前指令是否执行完毕
      const currentPc = state.pcValue;
      const maxPc = (state.assembledInstructions.length * 4) - 4;
      
      // 检查是否为ecall指令且为退出程序请求
      const currentInstruction = state.assembledInstructions[currentPc / 4];
      if (currentInstruction && currentInstruction.hex === '0x00000073') {
        // ECALL instruction
        const syscallNumber = state.registers[17]; // a7 register holds the system call number
        
        // Handle various ECALL operations
        switch (syscallNumber) {
          case 1: // Print integer
            const a0Value = state.registers[10] || 0; // a0 register holds the integer to print
            get().addOutputMessage(`${a0Value}`);
            break;
          
          case 4: // Print string
            // a0 should contain the address of the string
            const stringAddr = state.registers[10] || 0;
            let outputString = '';
            let currentAddr = stringAddr;
            let currentByte;
            
            // Read string from memory byte by byte until null terminator
            do {
              const byteAddrHex = '0x' + currentAddr.toString(16);
              currentByte = state.memory[byteAddrHex];
              if (currentByte !== undefined && currentByte !== 0) {
                // Check for newline character (ASCII 10)
                if (currentByte === 10) {
                  outputString += '\n';
                } else {
                  outputString += String.fromCharCode(currentByte);
                }
              }
              currentAddr++;
            } while (currentByte !== undefined && currentByte !== 0);
            
            // Replace literal '\n' with actual newline
            get().addOutputMessage(outputString);
            break;
            
          case 10: // Exit program
            get().addOutputMessage("\nProgram exited with code: 0");
            break;
            
          case 11: // Print character
            const charCode = state.registers[10] || 0; // a0 register holds the character code
            // Check for newline character (ASCII 10)
            if (charCode === 10) {
              get().addOutputMessage('\n');
            } else {
              get().addOutputMessage(String.fromCharCode(charCode));
            }
            break;
            
          case 93: // Exit (Linux compatible)
            if (state.simulationTimer !== null) {
              window.clearInterval(state.simulationTimer);
            }
            get().addOutputMessage("\nProgram exited with code: 0");
            return {
              isSimulating: false,
              simulationTimer: null
            };
            
          default:
            get().addOutputMessage(`Unsupported ECALL operation: ${syscallNumber}`);
        }
      }
      
      // 如果已经执行到最后一条指令，自动暂停模拟，pipeline还需要多执行几句
      if (currentPc > maxPc + 2*4 || currentPc < 0) {
        if (state.simulationTimer !== null) {
          window.clearInterval(state.simulationTimer);
        }
        return {
          isSimulating: false,
          simulationTimer: null
        };
      }

      // 保存当前状态到历史记录
      const currentState = {
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        registers: { ...state.registers },
        memory: { ...state.memory },
        pcValue: state.pcValue,
        currentInstructionIndex: state.currentInstructionIndex,
        stepCount: state.stepCount
      };

      // 设置处理中标志
      const newState = {
        stepCount: state.stepCount + 1,
        isProcessing: true,
        simulationHistory: [...state.simulationHistory, currentState]
      };

      // 更新所有组件状态
      setTimeout(() => {
        get().updateAllNodesInputs();
        // get().updateAllNodesInputs();
        set({ isProcessing: false });
      }, 0);

      return newState;
    });
  },
  
  stepBackSimulation: () => {
    // 获取当前状态
    const state = get();
    
    // 如果正在处理中或历史记录为空，则不执行任何操作
    if (state.isProcessing || state.simulationHistory.length === 0) {
      return;
    }
    
    // 获取上一个状态
    const prevState = state.simulationHistory[state.simulationHistory.length - 1];
    const newHistory = state.simulationHistory.slice(0, -1);
    
    // 先单独更新stepCount，确保它在单独的更新周期中执行
    set({ stepCount: prevState.stepCount, isProcessing: true });
    
    // 在下一个事件循环中更新其他状态
    setTimeout(() => {
      set({
        nodes: prevState.nodes,
        registers: prevState.registers,
        memory: prevState.memory,
        pcValue: prevState.pcValue,
        currentInstructionIndex: prevState.currentInstructionIndex,
        simulationHistory: newHistory
      });
      
      // 更新所有组件状态，确保在恢复历史状态后更新节点输入
      setTimeout(() => {
        get().updateAllNodesInputs();
        set({ isProcessing: false });
      }, 0);
    }, 0);
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
  removeEdge: (edgeId: string) => set((state) => {
    // 只删除指定ID的边
    const newEdges = state.edges.filter((edge) => edge.id !== edgeId);
    
    // 如果删除的是当前选中的边，清除选中状态
    const newState: Partial<CircuitState> = {
      edges: newEdges
    };
    
    if (state.selectedEdge?.id === edgeId) {
      newState.selectedEdge = null;
    }
    
    return newState;
  }),
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
  addOutputMessage: (message: string) => set((state) => ({
    outputMessages: [...state.outputMessages, message.replace(/\\n/g, '\n')]
  })),
  clearOutputMessages: () => set({ outputMessages: [] }),
}));
import { create } from 'zustand';
import { Connection, Edge, Node, ConnectionMode } from 'reactflow';
import { Circuit } from '../types/Circuit';

interface CacheEntry {
  tag: number;
  valid: boolean;
  dirty: boolean;
  data: number[];
  lastAccess: number;
}

interface CacheSet {
  entries: CacheEntry[];
  lru: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  missRate: number;
  writebacks: number;
}

interface PerformanceStats {
  // Configuration
  enablePipelineStats: boolean;

  // Instruction counts by type
  rTypeCount: number;
  iTypeCount: number;
  sTypeCount: number;
  bTypeCount: number;
  uTypeCount: number;
  jTypeCount: number;
  totalInstructions: number;

  // Cycle and time metrics
  cycleCount: number;
  instructionsExecuted: number;
  cpi: number; // Cycles per instruction
  ipc: number; // Instructions per cycle
  clockRate: number; // Clock rate in Hz (cycles per second)

  // Branch statistics
  branchCount: number;
  branchTakenCount: number;
  branchNotTakenCount: number;
  branchMispredictionCount: number;
  branchMispredictionRate: number;

  // Memory access statistics
  memoryReadCount: number;
  memoryWriteCount: number;

  // Stall statistics
  dataHazardStalls: number;
  controlHazardStalls: number;
  memoryStalls: number;
  totalStalls: number;

  // Execution time (simulated)
  startTime: number | null;
  endTime: number | null;
  executionTimeMs: number;
}

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
  performanceStats: PerformanceStats;
  disableUIUpdates: boolean;
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
  assembleCode: () => void;
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
  updatePerformanceStats: (instruction: string) => void;
  resetPerformanceStats: () => void;
  togglePipelineStats: () => void;
  toggleUIUpdates: () => void;
  cache: {
    config: {
      size: number;      // Total cache size in bytes
      blockSize: number; // Block size in bytes
      ways: number;      // Number of ways (associativity)
      sets: number;      // Number of sets
      linesExp: number;  // Exponent for number of lines (2^n)
      waysExp: number;   // Exponent for number of ways (2^n)
    };
    sets: CacheSet[];
    stats: CacheStats;
  };
  initializeCache: () => void;
  clearCache: () => void;
  updateCacheStats: (hit: boolean, writeback: boolean) => void;
  updateCacheConfig: (config: {
    linesExp?: number;
    blockSize?: number;
    waysExp?: number;
  }) => void;
  reset: () => void;
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
  disableUIUpdates: false,
  performanceStats: {
    // Configuration
    enablePipelineStats: false,

    // Instruction counts by type
    rTypeCount: 0,
    iTypeCount: 0,
    sTypeCount: 0,
    bTypeCount: 0,
    uTypeCount: 0,
    jTypeCount: 0,
    totalInstructions: 0,

    // Cycle and time metrics
    cycleCount: 0,
    instructionsExecuted: 0,
    cpi: 0,
    ipc: 0,
    clockRate: 0,

    // Branch statistics
    branchCount: 0,
    branchTakenCount: 0,
    branchNotTakenCount: 0,
    branchMispredictionCount: 0,
    branchMispredictionRate: 0,

    // Memory access statistics
    memoryReadCount: 0,
    memoryWriteCount: 0,

    // Stall statistics
    dataHazardStalls: 0,
    controlHazardStalls: 0,
    memoryStalls: 0,
    totalStalls: 0,

    // Execution time (simulated)
    startTime: null,
    endTime: null,
    executionTimeMs: 0
  },
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
      edges: state.edges.map(edge => ({
        ...edge,
        // Ensure we save intermediatePoints data for editable edges
        data: edge.type === 'editableEdge' ? {
          ...edge.data,
          intermediatePoints: edge.data?.intermediatePoints || []
        } : edge.data
      })),
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
    const { clearCache, resetPerformanceStats } = state;

    // 如果正在运行，先停止模拟
    if (state.simulationTimer !== null) {
      window.clearInterval(state.simulationTimer);
    }

    // 清空缓存
    clearCache();

    // 重置性能统计
    resetPerformanceStats();

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
      registers: {}, // Clear registers
      memory: state.memory // Preserve memory to keep data segment loaded by the assembler
    }));

    // 延迟到下一个事件循环设置寄存器默认值，但保留内存中的数据段
    setTimeout(() => {
      set({
        registers: {
          2: 0x7ffffff0,  // sp
          3: 0x10000000   // gp
        }
      });

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

      // 检查是否为ecall指令或ebreak指令
      const currentInstruction = state.assembledInstructions[currentPc / 4];

      // Check for ebreak instruction (0x00100073)
      if (currentInstruction && currentInstruction.hex === '0x00100073') {
        // EBREAK instruction - pause execution like a breakpoint
        if (state.simulationTimer !== null) {
          window.clearInterval(state.simulationTimer);
        }
        return {
          stepCount: state.stepCount + 1,
          isSimulating: false,
          simulationTimer: null
        };
      }

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
            if (state.simulationTimer !== null) {
              window.clearInterval(state.simulationTimer);
            }
            get().addOutputMessage("\nProgram exited with code: 0\n");
            return {
              isSimulating: false,
              simulationTimer: null,
              pcValue: -1 // Set PC to negative value to ensure program stops execution
            };

          case 11: // Print character
            const charCode = state.registers[10] || 0; // a0 register holds the character code
            // Check for newline character (ASCII 10)
            if (charCode === 10) {
              get().addOutputMessage('\n');
            } else {
              get().addOutputMessage(String.fromCharCode(charCode));
            }
            break;
          case 5: // Read Integer
            const intInput = prompt("Enter an integer:");
            if (intInput !== null) {
              const intValue = parseInt(intInput, 10);
              if (!isNaN(intValue)) {
                state.registers[10] = intValue; // Store in a0
                // Echo the input to the output panel
                get().addOutputMessage(`${intValue}`);
              } else {
                get().addOutputMessage("Invalid integer input.\n");
                // Optionally halt or set an error flag
                // get().toggleSimulation();
              }
            } else {
               get().addOutputMessage("Input cancelled.\n");
               // Optionally halt or set an error flag
               // get().toggleSimulation();
            }
            break;
          case 8: // Read String
            const bufferAddr = state.registers[10]; // a0 = buffer address
            const maxLength = state.registers[11]; // a1 = max length
            const strInput = prompt(`Enter a string (max ${maxLength} chars):`);
            if (strInput !== null) {
              const len = Math.min(strInput.length, maxLength - 1); // Reserve space for null terminator
              const updatedMemory = { ...state.memory };
              for (let i = 0; i < len; i++) {
                updatedMemory['0x' + (bufferAddr + i).toString(16)] = strInput.charCodeAt(i);
              }
              updatedMemory['0x' + (bufferAddr + len).toString(16)] = 0; // Null terminate
              get().updateMemory(updatedMemory); // Trigger memory update
              // Echo the input to the output panel
              get().addOutputMessage(`${strInput}`);
            } else {
              get().addOutputMessage("Input cancelled.\n");
              // Optionally halt or set an error flag
              // get().toggleSimulation();
            }
            break;
          case 12: // Read Character
            const charInput = prompt("Enter a character:");
            if (charInput !== null && charInput.length > 0) {
              state.registers[10] = charInput.charCodeAt(0); // Store ASCII code in a0
              // Echo the input to the output panel
              get().addOutputMessage(`${charInput}`);
            } else {
              get().addOutputMessage("Invalid character input or cancelled.\n");
              // Optionally halt or set an error flag
              // get().toggleSimulation();
            }
            break;

          case 93: // Exit (Linux compatible)
            if (state.simulationTimer !== null) {
              window.clearInterval(state.simulationTimer);
            }
            get().addOutputMessage("\nProgram exited with code: 0\n");
            return {
              isSimulating: false,
              simulationTimer: null,
              pcValue: -1 // Set PC to negative value to ensure program stops execution
            };

          default:
            get().addOutputMessage(`Unsupported ECALL operation: ${syscallNumber}\n`);
            // Consider halting simulation for unsupported calls
            // get().toggleSimulation();
        }
      }

      // 如果已经执行到最后一条指令，自动暂停模拟，pipeline还需要多执行几句
      if (currentPc > maxPc + 4*4 || currentPc < 0) {
        if (state.simulationTimer !== null) {
          window.clearInterval(state.simulationTimer);
        }
        return {
          isSimulating: false,
          simulationTimer: null
        };
      }
      // 更新性能统计
      if (currentInstruction && currentInstruction.assembly) {
        get().updatePerformanceStats(currentInstruction.assembly);
      } else {
        get().updatePerformanceStats('');
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
      type,
      // Initialize intermediatePoints array when switching to editable edge
      data: {
        ...edge.data,
        ...(type === 'editableEdge' && {
          intermediatePoints: edge.data?.intermediatePoints || []
        })
      },
      // Ensure edges have correct interaction properties
      selectable: true,
      focusable: true,
      updatable: true,
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

  updatePerformanceStats: (instruction: string) => set((state) => {
    // Get the current performance stats
    const stats = { ...state.performanceStats };

    // Update cycle count
    stats.cycleCount++;

    // If this is the first instruction, set the start time
    if (stats.startTime === null) {
      stats.startTime = Date.now();
    }

    // Update end time
    stats.endTime = Date.now();

    // Calculate execution time
    if (stats.startTime !== null && stats.endTime !== null) {
      stats.executionTimeMs = stats.endTime - stats.startTime;

      // Calculate clock rate (cycles per second)
      if (stats.executionTimeMs > 0) {
        // Convert ms to seconds and calculate cycles/second
        stats.clockRate = (stats.cycleCount * 1000) / stats.executionTimeMs;
      }
    }

    // Skip if no instruction is provided
    if (!instruction) {
      // If pipeline statistics are disabled, return early without updating pipeline-specific stats
      if (stats.enablePipelineStats) {
            // Update CPI and IPC
      stats.cpi = stats.cycleCount / (stats.instructionsExecuted || 1);
      stats.ipc = stats.instructionsExecuted / (stats.cycleCount || 1);
        return { performanceStats: stats };
      }

      return { };
    }

    // Update instruction count
    stats.instructionsExecuted++;
    stats.totalInstructions++;

    // Update CPI and IPC
    stats.cpi = stats.cycleCount / (stats.instructionsExecuted || 1);
    stats.ipc = stats.instructionsExecuted / (stats.cycleCount || 1);


    // Determine instruction type and update counts
    const opcode = instruction.split(' ')[0];

    // R-type instructions (add, sub, and, or, xor, sll, srl, sra, slt, sltu)
    if (['add', 'sub', 'and', 'or', 'xor', 'sll', 'srl', 'sra', 'slt', 'sltu', 'mul', 'mulh', 'div', 'rem'].includes(opcode)) {
      stats.rTypeCount++;
    }
    // I-type instructions (addi, andi, ori, xori, slli, srli, srai, slti, sltiu, lb, lh, lw, lbu, lhu, jalr)
    else if (['addi', 'andi', 'ori', 'xori', 'slli', 'srli', 'srai', 'slti', 'sltiu', 'lb', 'lh', 'lw', 'lbu', 'lhu', 'jalr', 'ecall'].includes(opcode)) {
      stats.iTypeCount++;

      // Check for memory reads
      if (['lb', 'lh', 'lw', 'lbu', 'lhu'].includes(opcode)) {
        stats.memoryReadCount++;
      }
    }
    // S-type instructions (sb, sh, sw)
    else if (['sb', 'sh', 'sw'].includes(opcode)) {
      stats.sTypeCount++;
      stats.memoryWriteCount++;
    }
    // B-type instructions (beq, bne, blt, bge, bltu, bgeu)
    else if (['beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'].includes(opcode)) {
      stats.bTypeCount++;
      stats.branchCount++;

      // // Check for branch taken/not taken (simplified, actual logic would need to check ALU result)
      // const branchTaken = Math.random() < 0.5; // Simplified for demonstration
      // if (branchTaken) {
      //   stats.branchTakenCount++;
      // } else {
      //   stats.branchNotTakenCount++;
      // }
    }
    // U-type instructions (lui, auipc)
    else if (['lui', 'auipc'].includes(opcode)) {
      stats.uTypeCount++;
    }
    // J-type instructions (jal)
    else if (['jal'].includes(opcode)) {
      stats.jTypeCount++;
    }

    return { performanceStats: stats };
  }),

  resetPerformanceStats: () => set((state) => ({
    performanceStats: {
      // Keep the current enablePipelineStats setting
      enablePipelineStats: state.performanceStats.enablePipelineStats,

      rTypeCount: 0,
      iTypeCount: 0,
      sTypeCount: 0,
      bTypeCount: 0,
      uTypeCount: 0,
      jTypeCount: 0,
      totalInstructions: 0,

      cycleCount: 0,
      instructionsExecuted: 0,
      cpi: 0,
      ipc: 0,
      clockRate: 0, // Clock rate in Hz (cycles per second)

      branchCount: 0,
      branchTakenCount: 0,
      branchNotTakenCount: 0,
      branchMispredictionCount: 0,
      branchMispredictionRate: 0,

      memoryReadCount: 0,
      memoryWriteCount: 0,

      dataHazardStalls: 0,
      controlHazardStalls: 0,
      memoryStalls: 0,
      totalStalls: 0,

      startTime: null,
      endTime: null,
      executionTimeMs: 0
    }
  })),

  togglePipelineStats: () => set((state) => ({
    performanceStats: {
      ...state.performanceStats,
      enablePipelineStats: !state.performanceStats.enablePipelineStats
    }
  })),

  toggleUIUpdates: () => set((state) => ({
    disableUIUpdates: !state.disableUIUpdates
  })),
  cache: {
    config: {
      size: 256,       // Total cache size in bytes (16 lines * 1 way * 16 bytes)
      blockSize: 16,   // Block size in bytes (4 words)
      ways: 1,         // 1-way set associative (2^0)
      sets: 16,        // Number of sets (lines/ways = 16/1 = 16)
      linesExp: 4,     // 2^4 = 16 lines (default)
      waysExp: 0       // 2^0 = 1 way (default)
    },
    sets: [],
    stats: {
      hits: 0,
      misses: 0,
      hitRate: 0,
      missRate: 0,
      writebacks: 0
    }
  },
  updateCacheConfig: (config: {
    linesExp?: number;
    blockSize?: number;
    waysExp?: number;
  }) => {
    // Get current config
    const currentConfig = get().cache.config;

    // Update with new values
    const newLinesExp = config.linesExp !== undefined ? config.linesExp : currentConfig.linesExp;
    const newBlockSize = config.blockSize !== undefined ? config.blockSize : currentConfig.blockSize;
    const newWaysExp = config.waysExp !== undefined ? config.waysExp : currentConfig.waysExp;

    // Calculate actual values from exponents
    const newLines = Math.pow(2, newLinesExp);
    const newWays = Math.pow(2, newWaysExp);

    // Calculate sets based on lines and ways: sets = lines / ways
    const newSets = newLines / newWays;

    // Calculate total cache size in bytes
    const newSize = newSets * newWays * newBlockSize;

    // Update the config
    set(state => ({
      cache: {
        ...state.cache,
        config: {
          size: newSize,
          blockSize: newBlockSize,
          ways: newWays,
          sets: newSets,
          linesExp: newLinesExp,
          waysExp: newWaysExp
        },
        // Clear sets when config changes
        sets: []
      }
    }));

    // Reinitialize the cache with the new configuration
    get().initializeCache();
  },
  initializeCache: () => {
    const { config } = get().cache;
    const sets: CacheSet[] = Array(config.sets).fill(null).map(() => ({
      entries: Array(config.ways).fill(null).map(() => ({
        tag: 0,
        valid: false,
        dirty: false,
        data: Array(config.blockSize / 4).fill(0), // Assuming 32-bit words
        lastAccess: 0
      })),
      lru: 0
    }));

    set(state => ({
      cache: {
        ...state.cache,
        sets,
        stats: {
          hits: 0,
          misses: 0,
          hitRate: 0,
          missRate: 0,
          writebacks: 0
        }
      }
    }));
  },
  clearCache: () => {
    set(state => ({
      cache: {
        ...state.cache,
        sets: state.cache.sets.map(set => ({
          ...set,
          entries: set.entries.map(entry => ({
            ...entry,
            valid: false,
            dirty: false,
            data: Array(state.cache.config.blockSize / 4).fill(0),
            lastAccess: 0
          }))
        })),
        stats: {
          hits: 0,
          misses: 0,
          hitRate: 0,
          missRate: 0,
          writebacks: 0
        }
      }
    }));
  },
  updateCacheStats: (hit: boolean, writeback: boolean = false) => {
    set(state => {
      const stats = { ...state.cache.stats };
      if (hit) {
        stats.hits++;
      }
      if (writeback) {
        stats.writebacks++;
      }
      if(!hit && !writeback) {
        stats.misses++;
      }
      const total = stats.hits + stats.misses;
      stats.hitRate = total > 0 ? stats.hits / total : 0;
      stats.missRate = total > 0 ? stats.misses / total : 0;

      return {
        cache: {
          ...state.cache,
          stats
        }
      };
    });
  },
  reset: () => {
    set({
      memory: {},
      registers: Array(32).fill(0),
      pcValue: 0,
      stepCount: 0,
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null,
      cache: {
        ...get().cache,
        sets: [],
        stats: {
          hits: 0,
          misses: 0,
          hitRate: 0,
          missRate: 0,
          writebacks: 0
        }
      }
    });
  },

  // Function to assemble code - this will be called by the reset button
  assembleCode: () => {
    // Find the Assemble button in the DOM and click it
    const assembleButton = document.querySelector('button[class*="bg-blue-500"]:not([class*="bg-blue-100"])') as HTMLButtonElement;
    if (assembleButton && assembleButton.textContent?.includes('Assemble')) {
      assembleButton.click();
    } else {
      get().resetSimulation();
    }
  },
}));
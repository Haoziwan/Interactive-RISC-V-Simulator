# RISC-V Simulator

A web-based application for visualizing RISC-V processor register states and datapath. Users can write and execute RISC-V assembly code, observe register state changes during instruction execution, and track instruction flow through a visual datapath. The simulator supports the RV32I base instruction set and the RV32M extension.
![image](https://github.com/user-attachments/assets/2c6ed390-1d85-468f-aaf0-db3ac82667a2)

![image](https://github.com/user-attachments/assets/b0cdf5fd-1072-403c-a16a-2a970749e274)


## Features

- **RISC-V Assembly Editor**: Write and edit RISC-V assembly code with syntax highlighting
- **RV32I and RV32M Support**: Full implementation of base integer (I) and multiplication/division (M) extensions
- **Instruction Execution**: Step-by-step or continuous execution of RISC-V programs
- **Register State Visualization**: Real-time display of register values during program execution
- **Memory Visualization**: View and monitor memory contents during program execution
- **Output Console**: View program output from system calls
- **Predefined Example Programs**: Load example programs to learn RISC-V programming
- **Multiple Datapath Models**: Choose between basic datapath and pipelined datapath visualizations
- **Pipeline Hazard Handling**: Support for data forwarding and control hazard resolution
- **Performance Analysis**: Real-time statistics on CPI
- **Cache Simulation**: Cache with hit/miss statistics
- **Interactive Simulation**: Pause, step, and reset simulation at any point



## Tech Stack

- React: User interface construction
- Tailwind CSS: Rapid responsive interface development
- Vite: Modern build tool
- ReactFlow: Datapath visualization
- Zustand: State management

## Architecture
The project consists of the following main modules:

- **Assembly Editor**: Provides a Monaco-based editor for writing RISC-V assembly code
  - Syntax highlighting and error detection
  - Support for loading example programs
  - Real-time assembly to machine code conversion

- **Assembler**: Converts RISC-V assembly code to machine code
  - Supports R, I, S, B, U, J type instructions and pseudo-instructions
  - support for RV32M extension (mul, mulh, mulhu, mulhsu, div, divu, rem, remu)
  - Handles labels, data segments, and immediate values
  - Supports various directives (.text, .data, .word, .byte, .string, .space, etc.)
  - Provides detailed error messages with line numbers

- **Circuit Simulator**: Visualizes and simulates the RISC-V processor datapath
  - Supports both basic and pipelined datapath models
  - Interactive component connections using ReactFlow
  - Real-time signal propagation between components
  - Pipeline hazard detection 
  - Branch hazard and control hazard handling

- **Register File**: Displays all 32 RISC-V registers with real-time updates
  - Shows register values in different formats (hex, decimal, binary)
  - Highlights register changes during execution

- **Memory System**: Manages instruction and data memory
  - Displays memory contents in a structured view
  - Supports data segment initialization from assembly
  - Handles system calls for I/O operations via memory-mapped registers
  - cache with LRU replacement policy


## Quick Start

1. Clone the project and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Project Structure

```
src/
├── assembler/        # RISC-V assembler implementation
├── components/       # React components
│   └── nodes/        # Circuit component implementations
│   
├── store/           # State management
├── types/           # TypeScript type definitions
└── examples/        # Example code and configurations
public/
├── datapath/        # Predefined datapath configurations
└── test-programs/   # Example RISC-V programs
```


### Testing

Run tests using:
```bash
npm test
```

## Performance Analysis

The simulator includes a comprehensive performance analysis tool that provides real-time statistics about program execution:

- **Instruction Mix Analysis**: Tracks the distribution of instruction types (R, I, S, B, U, J) executed
- **Cycle Performance Metrics**: Calculates CPI (Cycles Per Instruction) and IPC (Instructions Per Cycle)
- **Branch Statistics**: Monitors branch prediction accuracy, taken vs. not-taken branches
- **Memory Access Patterns**: Tracks memory read/write operations and their frequency
- **Pipeline Stall Analysis**: Identifies data hazards and control hazards causing pipeline stalls
- **Cache Performance**: Displays cache hit/miss rates and replacement statistics

The performance analysis panel can be toggled on/off and includes options to enable/disable detailed pipeline statistics collection during simulation.

## Pipeline Implementation

The simulator features a detailed 5-stage pipeline implementation:

- **Instruction Fetch (IF)**: Fetches instructions from instruction memory
- **Instruction Decode (ID)**: Decodes instructions and reads register values
- **Execute (EX)**: Performs ALU operations and address calculations
- **Memory Access (MEM)**: Reads from or writes to data memory
- **Write Back (WB)**: Writes results back to the register file

The pipeline implementation includes:

- **Pipeline Registers**: IF/ID, ID/EX, EX/MEM, and MEM/WB registers to hold intermediate values
- **Hazard Detection**: Identifies data hazards and stalls the pipeline when necessary
- **Data Forwarding**: Forwards results from later pipeline stages to earlier stages to resolve data hazards
- **Branch Prediction**: Implements branch prediction to minimize control hazards
- **Branch Hazard Unit**: Flushes the pipeline when branch mispredictions occur

## Supported RISC-V Instructions

### Base Integer Instructions (RV32I)
- **R-Type**: add, sub, sll, slt, sltu, xor, srl, sra, or, and
- **I-Type**: addi, slti, sltiu, xori, ori, andi, slli, srli, srai, lb, lh, lw, lbu, lhu, jalr
- **S-Type**: sb, sh, sw
- **B-Type**: beq, bne, blt, bge, bltu, bgeu
- **U-Type**: lui, auipc
- **J-Type**: jal

### Integer Multiplication and Division (RV32M)
- **Multiplication**: mul, mulh, mulhu, mulhsu
- **Division**: div, divu, rem, remu

### System Instructions
- ecall (system calls for I/O and program termination)
- ebreak (breakpoint instruction)

### Pseudo-Instructions
- li, mv, j, jr, ret, call, tail, nop, and many others

## System Calls

The simulator supports the following system calls via the `ecall` instruction:

- **a7=1**: Print Integer (a0 = integer to print)
- **a7=4**: Print String (a0 = address of string)
- **a7=5**: Read Integer (result stored in a0)
- **a7=8**: Read String (a0 = buffer address, a1 = max length)
- **a7=12**: Read Character (result stored in a0)
- **a7=10**: Exit Program
- **a7=11**: Print Character (a0 = character code)
- **a7=93**: Exit Program (Linux compatible)

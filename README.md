# RISC-V Simulator

A web-based application for visualizing RISC-V processor register states and datapath. Users can write and execute RISC-V assembly code, observe register state changes during instruction execution, and track instruction flow through a visual datapath.
![image](https://github.com/user-attachments/assets/5b9bb32b-d216-4999-952f-53846fba6322)

## Features

- RISC-V Assembly Editor: Write and edit RISC-V assembly code with syntax highlighting
- Instruction Execution: Step-by-step or continuous execution of RISC-V programs
- Register State Visualization: Real-time display of register values during program execution
- Memory Visualization: View and monitor memory contents during program execution
- Output Console: View program output from system calls
- Predefined Example Programs: Load example programs to learn RISC-V programming
- Multiple Datapath Models: Choose between basic datapath and pipelined datapath visualizations
- Interactive Simulation: Pause, step, and reset simulation at any point
- Error Highlighting: Immediate feedback on assembly code errors


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
  - Handles labels, data segments, and immediate values
  - Provides detailed error messages with line numbers

- **Circuit Simulator**: Visualizes and simulates the RISC-V processor datapath
  - Supports both basic and pipelined datapath models
  - Interactive component connections using ReactFlow
  - Real-time signal propagation between components

- **Register File**: Displays all 32 RISC-V registers with real-time updates
  - Shows register values in different formats (hex, decimal, binary)
  - Highlights register changes during execution

- **Memory System**: Manages instruction and data memory
  - Displays memory contents in a structured view
  - Supports data segment initialization from assembly
  - Handles system calls for I/O operations via memory-mapped registers

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
├── store/           # State management
├── types/           # TypeScript type definitions
└── examples/        # Example code and configurations
```


### Testing

Run tests using:
```bash
npm test
```




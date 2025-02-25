# RISC-V Simulator

A web-based application for visualizing RISC-V processor register states and datapath. Users can write and execute RISC-V assembly code, observe register state changes during instruction execution, and track instruction flow through a visual datapath.

## Features

- Real-time display of 32 RISC-V registers
- Support for standard RISC-V register naming conventions
- Hexadecimal format register value display
- Responsive design for various screen sizes
- Visual datapath editor
- RISC-V assembly code editing and execution
- Real-time memory state visualization

## Tech Stack

- React: User interface construction
- TypeScript: Type-safe code development
- Tailwind CSS: Rapid responsive interface development
- Vite: Modern build tool
- ReactFlow: Datapath visualization
- Zustand: State management

## Architecture

The project consists of the following main modules:

- **Assembler Module**: Converts RISC-V assembly code to machine code
  - Supports parsing and generation of R, I, S, B, U, J type instructions
  - Provides comprehensive error checking and feedback

- **Datapath Simulator**: Visualizes RISC-V processor datapath
  - Supports custom datapath components
  - Real-time data flow visualization
  - Configurable component parameters

- **Register Panel**: Displays processor register states in real-time
  - Supports 32 general-purpose registers
  - Real-time register value updates

- **Memory View**: Shows system memory state
  - Memory content visualization
  - Supports memory read/write operations

## Quick Start

1. Clone the project and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Usage Guide

### Code Editor

In the code editor tab, you can:
- Write RISC-V assembly code
- Use supported instruction set (R, I, S, B, U, J type instructions)
- Add labels and comments
- Run code and observe execution results

### Datapath Editor

In the datapath tab, you can:
- Drag and drop components from the component library
- Connect components to create datapath
- Configure component parameters
- Observe data flow

### Memory View

In the memory view tab, you can:
- View memory contents
- Monitor memory changes
- Modify memory values

## Development Guide

### Project Structure

```
src/
├── assembler/        # RISC-V assembler implementation
├── components/       # React components
├── store/           # State management
├── types/           # TypeScript type definitions
└── examples/        # Example code and configurations
```

### Adding New Features

1. Adding new instruction support:
   - Implement instruction parsing in `assembler.ts`
   - Add corresponding test cases

2. Adding new datapath components:
   - Create new component in `components/nodes/`
   - Register component in `CircuitCanvas.tsx`
   - Add component to the component library

3. Extending memory functionality:
   - Modify memory store in `circuitStore.ts`
   - Update memory view component

### Testing

Run tests using:
```bash
npm test
```




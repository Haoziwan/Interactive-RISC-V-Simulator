import { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function ConfigPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedNode = useCircuitStore((state) => state.selectedNode);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);

  if (!selectedNode) {
    return null;
  }
  const renderConfig = () => {
    switch (selectedNode.type) {
      case 'constant':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Constant</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A constant value source that outputs a fixed, predetermined value to other components. These values are hardcoded and don't change during execution.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Output:</span> Provides the constant value (usually 32-bit) to connected components without requiring any inputs</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The constant component simply outputs its predetermined value at all times. It's commonly used for providing fixed values like '4' for PC incrementation, immediate values, or memory offsets. The output never changes regardless of clock cycles or other signals.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pc':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Program Counter</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Program Counter (PC) is a special register that holds the memory address of the current instruction being executed. It's a critical component for instruction sequencing in the processor.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Next instruction address (32-bit value) to be loaded on the next clock edge</li>
                  <li><span className="font-medium">Output:</span> Current instruction address (32-bit value) used to fetch the current instruction</li>
                  <li><span className="font-medium">Clock:</span> System clock signal that triggers the update of the PC value</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">On each positive clock edge, the PC updates its value to the address provided at its input. In normal sequential execution, this is PC+4 (next instruction), but for branches and jumps, it could be a calculated target address. The PC always starts at address 0x00000000 on system reset and is word-aligned (divisible by 4 in RISC-V).</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'fork':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Fork</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A signal distribution component that copies an input signal to multiple outputs without modification. Essential for fan-out when a single signal needs to be routed to multiple destinations.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Source signal (32-bit value) to be distributed</li>
                  <li><span className="font-medium">Outputs:</span> Multiple identical copies of the input signal, each maintaining the same bit-width and value as the input</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The fork component operates as a simple wire splitter with no logical processing. It continuously passes the input value to all outputs with no delay or transformation. Each output exactly mirrors the input at all times. This component is particularly important when a signal (like an instruction, register value, or control signal) needs to be used by multiple components simultaneously.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'add':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Add</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">An adder component that performs binary addition on two 32-bit input values and produces their sum. This is a fundamental arithmetic component used throughout the processor.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input A:</span> First 32-bit operand for addition</li>
                  <li><span className="font-medium">Input B:</span> Second 32-bit operand for addition</li>
                  <li><span className="font-medium">Output:</span> 32-bit sum result (A + B)</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The adder performs standard binary addition between inputs A and B, treating them as 32-bit two's complement integers. It operates combinationally (no clock required) and produces output immediately when inputs change. Common uses include incrementing the PC by 4, calculating memory addresses (base + offset), and computing branch target addresses (PC + immediate). Unlike the ALU, it only performs addition and doesn't handle other operations.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'mux':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Multiplexer</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A configurable N-to-1 multiplexer that selects and routes one input from multiple input values based on a control signal. Essential for implementing data path selection and conditional operations in the processor.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input 0-N:</span> Multiple 32-bit input values (configurable from 2 to 8 inputs)</li>
                  <li><span className="font-medium">Select:</span> Control signal determining which input to route to the output. For an N-input mux, this requires log₂(N) bits</li>
                  <li><span className="font-medium">Output:</span> The selected 32-bit input value that is passed through</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The multiplexer operates combinationally by evaluating the select signal and routing the corresponding input to the output. For example, with select=0, input0 is routed; with select=1, input1 is routed, and so on. The operation is immediate with no clock required. The select value is interpreted modulo the number of inputs (select % inputs.length). Multiplexers are critical for implementing choice points in the datapath, such as ALU input selection, register write data selection, and next PC determination.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Configuration</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Port Count:</span> Number of input ports (2-8)</li>
                  <li><span className="font-medium">Selection:</span> Input index is determined by select signal modulo port count</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'imm-gen':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Immediate Generator </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Immediate Generator extracts and processes immediate values embedded within RISC-V instructions. It performs proper sign extension and field arrangement based on the instruction format (I, S, B, U, J) to produce a 32-bit immediate value for use in the datapath.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Instruction:</span> Complete 32-bit instruction input containing immediate fields</li>
                  <li><span className="font-medium">Output:</span> Properly formatted and sign-extended 32-bit immediate value</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Immediate Generator operates combinationally by examining the instruction opcode to determine the format type, then extracting and processing the immediate bits accordingly:<br/>
                - I-type: imm[11:0] = inst[31:20], sign-extended to 32 bits<br/>
                - S-type: imm[11:0] = inst[31:25] + inst[11:7], sign-extended to 32 bits<br/>
                - B-type: imm[12:0] = inst[31] + inst[7] + inst[30:25] + inst[11:8] + 0, sign-extended to 32 bits<br/>
                - U-type: imm[31:12] = inst[31:12], lower 12 bits set to zero<br/>
                - J-type: imm[20:0] = inst[31] + inst[19:12] + inst[20] + inst[30:21] + 0, sign-extended to 32 bits</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pc-mux':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">PC Multiplexer </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The PC Multiplexer determines the next Program Counter value by selecting between sequential execution (PC+4) and branch/jump target addresses based on control signals. This component enables control flow changes in the processor.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input 0:</span> PC+4 value for sequential execution</li>
                  <li><span className="font-medium">Input 1:</span> Branch/jump target address calculated from PC and immediate</li>
                  <li><span className="font-medium">Select:</span> Control signal (typically from Branch-AND-Zero or Jump logic) that determines which address to use next</li>
                  <li><span className="font-medium">Output:</span> Selected next PC value that will be loaded into the PC register</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The PC Multiplexer operates combinationally:<br/>
                - When Select = 0: Output = Input 0 (PC+4), continuing sequential execution<br/>
                - When Select = 1: Output = Input 1 (branch/jump target), changing program flow<br/>
                The select signal is typically generated by branch/jump control logic based on instruction type and condition evaluation.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'alu':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Arithmetic Logic Unit (ALU) performs all computational operations in the processor including arithmetic (add, subtract), logical (AND, OR, XOR), comparison, and shifting operations on 32-bit operands based on the control signal.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input A:</span> First 32-bit operand from register file or PC</li>
                  <li><span className="font-medium">Input B:</span> Second 32-bit operand from register file or immediate generator</li>
                  <li><span className="font-medium">ALU Control:</span> 4-bit operation selection signal from ALU Control unit</li>
                  <li><span className="font-medium">Output:</span> 32-bit result of the selected operation</li>
                  <li><span className="font-medium">Zero Flag:</span> 1-bit flag set when result equals zero, used for branch decisions</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The ALU operates combinationally, performing one of these operations based on the ALU Control input:<br/>
                - Add (0000): Addition operation (A + B)<br/>
                - Subtract (0001): Subtraction operation (A - B)<br/>
                - AND (0010): Bitwise AND operation (A & B)<br/>
                - OR (0011): Bitwise OR operation (A | B)<br/>
                - XOR (0100): Bitwise XOR operation (A ^ B)<br/>
                - SLL (0101): Logical left shift operation<br/>
                - SRL (0110): Logical right shift operation<br/>
                - SRA (0111): Arithmetic right shift operation<br/>
                - SLT (1000): Set if less than, signed comparison<br/>
                - SLTU (1001): Set if less than, unsigned comparison<br/>
                The Zero flag is set when the output is exactly zero, primarily used for branch instructions.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'alu-control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU Control</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The ALU Control unit translates the high-level ALUOp signals from the main control unit and instruction function fields (funct3, funct7) into specific 4-bit control signals that determine the exact operation the ALU will perform.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">ALUOp:</span> 2-bit control signal from main Control Unit indicating operation class</li>
                  <li><span className="font-medium">Funct7:</span> 7-bit function code from instruction bits 31-25, used for R-type operation differentiation</li>
                  <li><span className="font-medium">Funct3:</span> 3-bit function code from instruction bits 14-12, specifies operation within type</li>
                  <li><span className="font-medium">Operation:</span> 4-bit output control signal specifying the exact ALU operation to perform</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The ALU Control uses combinational logic to decode the instruction:<br/>
                - When ALUOp = 00 (load/store): Always generates add operation (0000)<br/>
                - When ALUOp = 01 (branch): Generates subtract operation (0001) for comparison<br/>
                - When ALUOp = 10 (R-type): Decodes funct3 and funct7 for specific R-type operations<br/>
                &nbsp;&nbsp;• For example, ADD (funct3=000, funct7=0000000) → 0000<br/>
                &nbsp;&nbsp;• For example, SUB (funct3=000, funct7=0100000) → 0001<br/>
                - When ALUOp = 11 (I-type ALU): Decodes funct3 for specific I-type operations<br/>
                The mapping ensures that the ALU performs the correct operation for each instruction type.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Register File </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Register File contains 32 general-purpose 32-bit registers (x0-x31) that store data during program execution. Register x0 is hardwired to zero, while the remaining registers are readable and writable storage locations for instruction operands and results.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Read Register 1:</span> 5-bit address selecting the first register to read</li>
                  <li><span className="font-medium">Read Register 2:</span> 5-bit address selecting the second register to read</li>
                  <li><span className="font-medium">Write Register:</span> 5-bit address selecting the register to write to</li>
                  <li><span className="font-medium">Write Data:</span> 32-bit data to write to the selected register</li>
                  <li><span className="font-medium">RegWrite:</span> 1-bit control signal enabling register write when high</li>
                  <li><span className="font-medium">Clock:</span> System clock that synchronizes register writes</li>
                  <li><span className="font-medium">Read Data 1:</span> 32-bit data output from the first selected register</li>
                  <li><span className="font-medium">Read Data 2:</span> 32-bit data output from the second selected register</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Register File operates as follows:<br/>
                - Read operations occur combinationally (no clock required):<br/>
                &nbsp;&nbsp;• Read Data 1 = Registers[Read Register 1] (unless address is 0, then 0 is returned)<br/>
                &nbsp;&nbsp;• Read Data 2 = Registers[Read Register 2] (unless address is 0, then 0 is returned)<br/>
                - Write operations occur synchronously at the rising edge of the clock:<br/>
                &nbsp;&nbsp;• If RegWrite=1, then Registers[Write Register] = Write Data<br/>
                &nbsp;&nbsp;• If Write Register=0, the write is ignored (x0 cannot be modified)<br/>
                - The Register File supports simultaneous reads and writes<br/>
                - If a read address matches the write address during the same cycle, some implementations forward the new value being written</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'instruction-memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Instruction Memory </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Instruction Memory is a read-only memory unit that stores the program instructions to be executed. In the RISC-V architecture, it holds 32-bit instructions that are fetched sequentially unless a branch or jump occurs.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Address:</span> 32-bit input address from which to fetch an instruction. Only the lower bits are typically used depending on memory size</li>
                  <li><span className="font-medium">Instruction:</span> 32-bit output containing the instruction at the specified address</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Instruction Memory operates as a read-only lookup table:<br/>
                - It receives an address (typically from the Program Counter) and outputs the 32-bit instruction stored at that address.<br/>
                - The memory is addressed by byte, but instructions are aligned on word boundaries (multiples of 4 bytes).<br/>
                - Address bits [1:0] are ignored since instructions are word-aligned in memory.<br/>
                - The operation is combinational with no clock required - the instruction appears at the output as soon as a valid address is provided.<br/>
                - In a real processor, instruction memory would be initialized with the compiled program code before execution begins.<br/>
                - This component is read-only during normal execution; instructions are not modified by the running program.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Memory </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Data Memory is a read-write memory unit that stores program data. It handles all load (read) and store (write) operations, enabling programs to maintain state and manipulate data during execution.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Address:</span> 32-bit memory location to read from or write to. Only lower bits are used based on memory size</li>
                  <li><span className="font-medium">Write Data:</span> 32-bit data to be written to memory when MemWrite is active</li>
                  <li><span className="font-medium">MemWrite:</span> 1-bit control signal enabling memory write operations when high (1)</li>
                  <li><span className="font-medium">MemRead:</span> 1-bit control signal enabling memory read operations when high (1)</li>
                  <li><span className="font-medium">Clock:</span> System clock signal that synchronizes write operations</li>
                  <li><span className="font-medium">Read Data:</span> 32-bit data output from the specified address when MemRead is active</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Data Memory operates with the following behavior:<br/>
                - Read operations: When MemRead is high, the memory outputs the 32-bit data stored at the specified address through the Read Data port. Reads are typically combinational (available in the same clock cycle).<br/>
                - Write operations: When MemWrite is high, on the rising edge of the clock, the 32-bit data at Write Data input is stored at the specified address.<br/>
                - Byte addressing: Memory is byte-addressable, but most operations work with word (4-byte) alignments. The RISC-V architecture supports different load/store sizes (byte, half-word, word) with proper alignment.<br/>
                - Address alignment: For word operations, addresses should be multiples of 4. Some implementations handle unaligned accesses, but with performance penalties.<br/>
                - Data memory is completely separate from instruction memory in the Harvard architecture used by most RISC processors.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Control Unit </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Control Unit is the "brain" of the processor that decodes instructions and generates control signals to coordinate all other components. It determines the datapath configuration for each instruction type.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Opcode:</span> 7-bit instruction opcode field (bits 6-0) that identifies the instruction type</li>
                  <li><span className="font-medium">RegWrite:</span> Output control signal (1-bit) that enables writing to the register file</li>
                  <li><span className="font-medium">MemRead:</span> Output control signal (1-bit) that enables reading from data memory</li>
                  <li><span className="font-medium">MemWrite:</span> Output control signal (1-bit) that enables writing to data memory</li>
                  <li><span className="font-medium">ALUSrc:</span> Output control signal (1-bit) that selects between register and immediate value for ALU's second input</li>
                  <li><span className="font-medium">ALUOp:</span> Output control signal (2-bit) that indicates the general type of ALU operation</li>
                  <li><span className="font-medium">MemtoReg:</span> Output control signal (1-bit) that selects between ALU result and memory data for register write</li>
                  <li><span className="font-medium">Branch:</span> Output control signal (1-bit) that indicates a branch instruction</li>
                  <li><span className="font-medium">Jump:</span> Output control signal (1-bit) that indicates a jump instruction</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Control Unit decodes the 7-bit opcode to determine instruction type and sets control signals accordingly:<br/>
                - R-type (opcode=0110011): RegWrite=1, ALUSrc=0, MemtoReg=0, MemRead=0, MemWrite=0, Branch=0, Jump=0, ALUOp=10<br/>
                - I-type Load (opcode=0000011): RegWrite=1, ALUSrc=1, MemtoReg=1, MemRead=1, MemWrite=0, Branch=0, Jump=0, ALUOp=00<br/>
                - S-type Store (opcode=0100011): RegWrite=0, ALUSrc=1, MemtoReg=X, MemRead=0, MemWrite=1, Branch=0, Jump=0, ALUOp=00<br/>
                - B-type Branch (opcode=1100011): RegWrite=0, ALUSrc=0, MemtoReg=X, MemRead=0, MemWrite=0, Branch=1, Jump=0, ALUOp=01<br/>
                - I-type ALU (opcode=0010011): RegWrite=1, ALUSrc=1, MemtoReg=0, MemRead=0, MemWrite=0, Branch=0, Jump=0, ALUOp=11<br/>
                - J-type Jump (opcode=1101111): RegWrite=1, ALUSrc=X, MemtoReg=X, MemRead=0, MemWrite=0, Branch=0, Jump=1, ALUOp=XX<br/>
                The Control Unit operates combinationally with no clock required, generating signals immediately when the opcode changes.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'jump-control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Jump Control </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Jump Control unit determines whether to take a branch or jump by evaluating control signals and comparison results. It generates the final PC selection signal that controls instruction flow.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Branch:</span> 1-bit control signal from main control unit indicating a branch instruction</li>
                  <li><span className="font-medium">Zero:</span> 1-bit flag from ALU indicating if the comparison result is zero</li>
                  <li><span className="font-medium">Jump:</span> 1-bit control signal from main control unit indicating an unconditional jump instruction</li>
                  <li><span className="font-medium">PCSrc:</span> 1-bit output control signal for the PC multiplexer (0=PC+4, 1=branch/jump target)</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Jump Control uses simple combinational logic to determine the next PC value:<br/>
                - For branch instructions (Branch=1): PCSrc = Branch AND Zero<br/>
                &nbsp;&nbsp;• This means a branch is taken only when both Branch is active AND the comparison result is zero (equal)<br/>
                &nbsp;&nbsp;• For BEQ (branch if equal), this works directly<br/>
                &nbsp;&nbsp;• For BNE (branch if not equal), the ALU or this unit must invert the Zero flag<br/>
                - For jump instructions (Jump=1): PCSrc = Jump (always 1)<br/>
                &nbsp;&nbsp;• This means jumps are always taken unconditionally<br/>
                - For all other instructions: PCSrc = 0 (continue to next sequential instruction)<br/>
                This component is critical for implementing all control flow changes in the processor, determining when to deviate from sequential execution.</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'instr-distributer':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Instruction Distributer</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Instruction Distributer is a dedicated decoder that parses a 32-bit RISC-V instruction into its individual fields according to the instruction format. It extracts and routes fields like opcode, registers, and function codes to their respective destination components.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Instruction:</span> Complete 32-bit instruction input directly from instruction memory</li>
                  <li><span className="font-medium">Opcode:</span> 7-bit output (bits 6-0) identifying the instruction type, routed to Control Unit</li>
                  <li><span className="font-medium">rd:</span> 5-bit destination register address output (bits 11-7), routed to Register File</li>
                  <li><span className="font-medium">rs1:</span> 5-bit first source register address output (bits 19-15), routed to Register File</li>
                  <li><span className="font-medium">rs2:</span> 5-bit second source register address output (bits 24-20), routed to Register File</li>
                  <li><span className="font-medium">funct3:</span> 3-bit function code output (bits 14-12), routed to ALU Control and branch logic</li>
                  <li><span className="font-medium">funct7:</span> 7-bit function code output (bits 31-25), routed to ALU Control</li>
                  <li><span className="font-medium">imm:</span> 32-bit immediate field sent to the Immediate Generator for formatting</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Instruction Distributer operates purely combinationally:<br/>
                - The component performs bit-slicing operations that extract specific fields from the 32-bit instruction<br/>
                - Each instruction field is immediately available at the corresponding output port<br/>
                - No transformation or interpretation of the fields occurs - only extraction and routing<br/>
                - For the immediate field, the entire instruction is usually passed to the Immediate Generator, which then extracts the proper fields based on instruction type<br/>
                - This central decoding approach avoids redundant instruction parsing across multiple components</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pipeline-register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Pipeline Register </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Pipeline registers separate the different stages of a pipelined processor, storing all required data and control signals between pipeline stages. They enable overlapped execution of multiple instructions by providing stage isolation.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Inputs:</span> Multiple data and control signals from the previous pipeline stage (varies by stage, includes values like PC, instruction, register values, control signals)</li>
                  <li><span className="font-medium">Clock:</span> System clock signal that triggers the register update</li>
                  <li><span className="font-medium">Stall:</span> Control signal that prevents register update when high, effectively pausing that pipeline stage</li>
                  <li><span className="font-medium">Flush:</span> Control signal that clears register contents when high, effectively canceling instructions in that stage</li>
                  <li><span className="font-medium">Outputs:</span> Registered copies of all input signals, passed to the next pipeline stage</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">Pipeline registers operate synchronously on the rising edge of the clock:<br/>
                - Normal operation: On each clock edge, all input values are captured and appear at the outputs, allowing them to be used by the next stage.<br/>
                - Stall behavior: When the Stall signal is high, the register retains its current value regardless of input changes, effectively pausing that stage of the pipeline. This is used for handling hazards and stalls.<br/>
                - Flush behavior: When the Flush signal is high, all outputs are set to zero or NOP values, effectively canceling the instruction in that stage. This is used after branch mispredictions or exceptions.<br/>
                <br/>
                The four standard pipeline registers in a classic RISC-V pipeline are:<br/>
                - IF/ID: Between Instruction Fetch and Instruction Decode stages<br/>
                - ID/EX: Between Instruction Decode and Execute stages<br/>
                - EX/MEM: Between Execute and Memory Access stages<br/>
                - MEM/WB: Between Memory Access and Write Back stages<br/>
                <br/>
                Each register contains stage-specific signals. For example:<br/>
                - IF/ID stores the instruction and PC value<br/>
                - ID/EX stores register values, control signals, and immediate values<br/>
                - EX/MEM stores ALU results, memory data, and control signals<br/>
                - MEM/WB stores data for writeback and control signals</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'single-register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Single Register</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A sequential storage element that captures and holds a 32-bit data value on the clock edge when enabled. Used for temporary value storage, state preservation between cycles, and pipeline stage separation.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> 32-bit data value to be stored on the next clock edge when Write Enable is active</li>
                  <li><span className="font-medium">Clock:</span> System clock signal that triggers register state update</li>
                  <li><span className="font-medium">Write Enable:</span> 1-bit control signal that permits register update when high (1)</li>
                  <li><span className="font-medium">Output:</span> 32-bit stored data value that persists until a new value is written</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Single Register operates synchronously:<br/>
                - At the rising edge of the clock signal, if Write Enable is high (1):<br/>
                &nbsp;&nbsp;• The value at the input port is captured and stored internally<br/>
                &nbsp;&nbsp;• This value immediately appears at the output port<br/>
                - If Write Enable is low (0) at the clock edge:<br/>
                &nbsp;&nbsp;• The register maintains its current value regardless of input changes<br/>
                - The output continuously provides the last stored value with no additional delay<br/>
                - Used for inserting controlled delays, storing state between operations, and buffering values between pipeline stages</p>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'label':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Label </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A Label is a visual annotation component that displays text or signals in the datapath diagram. It doesn't affect circuit functionality but provides explanatory information or shows signal values during simulation.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Optional data input (32-bit value) that can be displayed alongside the label text</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-sm text-blue-700">The Label operates with minimal logic:<br/>
                - It displays the configured text string at all times.<br/>
                - If connected to an input signal, it can display the value of that signal (such as in decimal, hex, or binary format).<br/>
                - The component is passive and doesn't modify any signals passing through the circuit.<br/>
                - Labels are particularly useful for:<br/>
                &nbsp;&nbsp;• Indicating datapath sections (e.g., "Fetch Stage", "Execute Stage")<br/>
                &nbsp;&nbsp;• Annotating signal types (e.g., "Control Signals", "Address Bus")<br/>
                &nbsp;&nbsp;• Monitoring signal values during simulation (e.g., "Current PC", "ALU Result")<br/>
                &nbsp;&nbsp;• Adding explanatory notes to the circuit diagram</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label Text
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.label || ''}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { label: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">{selectedNode.type} Configuration</h3>
            <p className="text-sm text-gray-500">No configuration options available</p>
          </div>
        );
    }
  };

  return (
    <div 
      className="absolute bottom-0 bg-white border-l border-t border-gray-200 shadow-lg transition-all duration-300 rounded-t-lg overflow-hidden"
      style={{ 
        width: '20rem',
        right: '0rem', 
        maxHeight: 'calc(100vh - 5rem)',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 2.5rem))',
        opacity: isExpanded ? 1 : 0.95
      }}
    >
      <div className="p-2 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <button
          className="w-full flex items-center justify-between text-left focus:outline-none group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Component Description</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
      <div 
        className="overflow-y-auto bg-white"
        style={{
          maxHeight: isExpanded ? 'calc(100vh - 8rem)' : 0,
          transition: 'max-height 200ms ease-in-out'
        }}
      >
        <div className="p-4">
          {renderConfig()}
        </div>
      </div>
    </div>
  );
}
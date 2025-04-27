import { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function ConfigPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isWide, setIsWide] = useState(false);
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
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">A constant value source that outputs a fixed, predetermined value to other components. These values are hardcoded and don't change during execution.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">Output:</span> Provides the constant value (usually 32-bit) to connected components without requiring any inputs</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <p className="text-xs text-blue-700">The constant component simply outputs its predetermined value at all times. It's commonly used for providing fixed values like '4' for PC incrementation, immediate values, or memory offsets. The output never changes regardless of clock cycles or other signals.</p>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pc':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Program Counter</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Program Counter (PC) is a special register that holds the memory address of the current instruction being executed. It's a critical component for instruction sequencing in the processor.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">Input:</span> Next instruction address (32-bit value) to be loaded on the next clock edge</li>
                  <li><span className="font-medium">Output:</span> Current instruction address (32-bit value) used to fetch the current instruction</li>
                  <li><span className="font-medium">Clock:</span> System clock signal that triggers the update of the PC value</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Program Counter operates synchronously on the clock edge:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Event</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">System Reset</td>
                        <td className="border border-blue-200 px-1 py-0.5">PC = 0x00000000</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Rising Clock Edge</td>
                        <td className="border border-blue-200 px-1 py-0.5">PC = Input value (typically PC+4 or branch/jump target)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Between Clock Edges</td>
                        <td className="border border-blue-200 px-1 py-0.5">PC maintains its current value (stable output)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">The PC is always word-aligned (divisible by 4 in RISC-V) to ensure proper instruction alignment.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Immediate Generator operates combinationally by examining the instruction opcode to determine the format type, then extracting and processing the immediate bits accordingly:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Format</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Immediate Extraction</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Extension</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">I-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">imm[11:0] = inst[31:20]</td>
                        <td className="border border-blue-200 px-1 py-0.5">Sign-extended to 32 bits</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">S-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">imm[11:0] = inst[31:25] + inst[11:7]</td>
                        <td className="border border-blue-200 px-1 py-0.5">Sign-extended to 32 bits</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">B-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">imm[12:0] = inst[31] + inst[7] + inst[30:25] + inst[11:8] + 0</td>
                        <td className="border border-blue-200 px-1 py-0.5">Sign-extended to 32 bits</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">U-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">imm[31:12] = inst[31:12], lower 12 bits set to zero</td>
                        <td className="border border-blue-200 px-1 py-0.5">Zero-extended</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">J-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">imm[20:0] = inst[31] + inst[19:12] + inst[20] + inst[30:21] + 0</td>
                        <td className="border border-blue-200 px-1 py-0.5">Sign-extended to 32 bits</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The PC Multiplexer operates combinationally based on the select signal:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Select Value</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Output</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Program Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">Input 0 (PC+4)</td>
                        <td className="border border-blue-200 px-1 py-0.5">Sequential execution</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">Input 1 (Branch/Jump target)</td>
                        <td className="border border-blue-200 px-1 py-0.5">Control flow change</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">The select signal is typically generated by branch/jump control logic based on instruction type and condition evaluation.</p>
                </div>
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
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Arithmetic Logic Unit (ALU) performs all computational operations in the processor including arithmetic (add, subtract), logical (AND, OR, XOR), comparison, and shifting operations on 32-bit operands based on the control signal.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">Input A:</span> First 32-bit operand from register file or PC</li>
                  <li><span className="font-medium">Input B:</span> Second 32-bit operand from register file or immediate generator</li>
                  <li><span className="font-medium">ALU Control:</span> 4-bit operation selection signal from ALU Control unit</li>
                  <li><span className="font-medium">Output:</span> 32-bit result of the selected operation</li>
                  <li><span className="font-medium">Zero Flag:</span> 1-bit flag set when result equals zero, used for branch decisions</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The ALU operates combinationally based on the ALU Control input:</p>

                  <div className="mb-2">
                    <div className="font-medium mb-1">Basic Operations:</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="border border-blue-200 px-1 py-0.5 text-left">Control</th>
                            <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                            <th className="border border-blue-200 px-1 py-0.5 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-blue-200 px-1 py-0.5">0000</td><td className="border border-blue-200 px-1 py-0.5">AND</td><td className="border border-blue-200 px-1 py-0.5">Bitwise AND (A & B)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">0001</td><td className="border border-blue-200 px-1 py-0.5">OR</td><td className="border border-blue-200 px-1 py-0.5">Bitwise OR (A | B)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">0010</td><td className="border border-blue-200 px-1 py-0.5">ADD</td><td className="border border-blue-200 px-1 py-0.5">Addition (A + B)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">0011</td><td className="border border-blue-200 px-1 py-0.5">XOR</td><td className="border border-blue-200 px-1 py-0.5">Bitwise XOR (A ^ B)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">0110</td><td className="border border-blue-200 px-1 py-0.5">SUB</td><td className="border border-blue-200 px-1 py-0.5">Subtraction (A - B)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">0111</td><td className="border border-blue-200 px-1 py-0.5">SLT</td><td className="border border-blue-200 px-1 py-0.5">Set if less than (signed)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1000</td><td className="border border-blue-200 px-1 py-0.5">SRL</td><td className="border border-blue-200 px-1 py-0.5">Logical right shift</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1001</td><td className="border border-blue-200 px-1 py-0.5">SRA</td><td className="border border-blue-200 px-1 py-0.5">Arithmetic right shift</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1010</td><td className="border border-blue-200 px-1 py-0.5">SLTU</td><td className="border border-blue-200 px-1 py-0.5">Set if less than (unsigned)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1011</td><td className="border border-blue-200 px-1 py-0.5">SLL</td><td className="border border-blue-200 px-1 py-0.5">Logical left shift</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="font-medium mb-1">M-Extension Operations:</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="border border-blue-200 px-1 py-0.5 text-left">Control</th>
                            <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                            <th className="border border-blue-200 px-1 py-0.5 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1100</td><td className="border border-blue-200 px-1 py-0.5">MUL</td><td className="border border-blue-200 px-1 py-0.5">Multiplication (lower 32 bits)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1101</td><td className="border border-blue-200 px-1 py-0.5">MULH</td><td className="border border-blue-200 px-1 py-0.5">Multiplication high (signed×signed)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1110</td><td className="border border-blue-200 px-1 py-0.5">MULHU</td><td className="border border-blue-200 px-1 py-0.5">Multiplication high (unsigned×unsigned)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">1111</td><td className="border border-blue-200 px-1 py-0.5">MULHSU</td><td className="border border-blue-200 px-1 py-0.5">Multiplication high (signed×unsigned)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">10000</td><td className="border border-blue-200 px-1 py-0.5">DIV</td><td className="border border-blue-200 px-1 py-0.5">Division (signed)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">10001</td><td className="border border-blue-200 px-1 py-0.5">DIVU</td><td className="border border-blue-200 px-1 py-0.5">Division (unsigned)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">10010</td><td className="border border-blue-200 px-1 py-0.5">REM</td><td className="border border-blue-200 px-1 py-0.5">Remainder (signed)</td></tr>
                          <tr><td className="border border-blue-200 px-1 py-0.5">10011</td><td className="border border-blue-200 px-1 py-0.5">REMU</td><td className="border border-blue-200 px-1 py-0.5">Remainder (unsigned)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p>The Zero flag is set when the output is exactly zero, primarily used for branch instructions.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'alu-control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU Control</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The ALU Control unit translates the high-level ALUOp signals from the main control unit and instruction function fields (funct3, funct7) into specific 4-bit control signals that determine the exact operation the ALU will perform.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">ALUOp:</span> 2-bit control signal from main Control Unit indicating operation class</li>
                  <li><span className="font-medium">Funct7:</span> 7-bit function code from instruction bits 31-25, used for R-type operation differentiation</li>
                  <li><span className="font-medium">Funct3:</span> 3-bit function code from instruction bits 14-12, specifies operation within type</li>
                  <li><span className="font-medium">Operation:</span> 4-bit output control signal specifying the exact ALU operation to perform</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The ALU Control uses combinational logic to decode the instruction:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">ALUOp</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Instruction Type</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-blue-200 px-1 py-0.5">00</td><td className="border border-blue-200 px-1 py-0.5">Load/Store</td><td className="border border-blue-200 px-1 py-0.5">ADD (0010)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5" rowSpan={3}>01</td><td className="border border-blue-200 px-1 py-0.5" rowSpan={3}>Branch</td><td className="border border-blue-200 px-1 py-0.5">BEQ/BNE: funct3=000/001 → SUB (0110)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">BLT/BGE: funct3=100/101 → SLT (0111)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">BLTU/BGEU: funct3=110/111 → SLTU (1010)</td></tr>
                    </tbody>
                  </table>

                  <p className="mb-1">R-type instructions (ALUOp=10):</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">funct7</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">funct3</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-blue-200 px-1 py-0.5" rowSpan={8}>0000000</td><td className="border border-blue-200 px-1 py-0.5">000</td><td className="border border-blue-200 px-1 py-0.5">ADD (0010)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">001</td><td className="border border-blue-200 px-1 py-0.5">SLL (1011)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">010</td><td className="border border-blue-200 px-1 py-0.5">SLT (0111)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">011</td><td className="border border-blue-200 px-1 py-0.5">SLTU (1010)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">100</td><td className="border border-blue-200 px-1 py-0.5">XOR (0011)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">101</td><td className="border border-blue-200 px-1 py-0.5">SRL (1000)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">110</td><td className="border border-blue-200 px-1 py-0.5">OR (0001)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">111</td><td className="border border-blue-200 px-1 py-0.5">AND (0000)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5" rowSpan={2}>0100000</td><td className="border border-blue-200 px-1 py-0.5">000</td><td className="border border-blue-200 px-1 py-0.5">SUB (0110)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">101</td><td className="border border-blue-200 px-1 py-0.5">SRA (1001)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5" rowSpan={8}>0000001<br/>(M-extension)</td><td className="border border-blue-200 px-1 py-0.5">000</td><td className="border border-blue-200 px-1 py-0.5">MUL (1100)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">001</td><td className="border border-blue-200 px-1 py-0.5">MULH (1101)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">010</td><td className="border border-blue-200 px-1 py-0.5">MULHSU (1111)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">011</td><td className="border border-blue-200 px-1 py-0.5">MULHU (1110)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">100</td><td className="border border-blue-200 px-1 py-0.5">DIV (10000)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">101</td><td className="border border-blue-200 px-1 py-0.5">DIVU (10001)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">110</td><td className="border border-blue-200 px-1 py-0.5">REM (10010)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">111</td><td className="border border-blue-200 px-1 py-0.5">REMU (10011)</td></tr>
                    </tbody>
                  </table>

                  <p className="mb-1">I-type ALU instructions (ALUOp=11):</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">funct3</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-blue-200 px-1 py-0.5">000</td><td className="border border-blue-200 px-1 py-0.5">ADDI (0010)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">001</td><td className="border border-blue-200 px-1 py-0.5">SLLI (1011)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">010</td><td className="border border-blue-200 px-1 py-0.5">SLTI (0111)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">011</td><td className="border border-blue-200 px-1 py-0.5">SLTIU (1010)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">100</td><td className="border border-blue-200 px-1 py-0.5">XORI (0011)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">101</td><td className="border border-blue-200 px-1 py-0.5">SRLI/SRAI (1000/1001) based on funct7</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">110</td><td className="border border-blue-200 px-1 py-0.5">ORI (0001)</td></tr>
                      <tr><td className="border border-blue-200 px-1 py-0.5">111</td><td className="border border-blue-200 px-1 py-0.5">ANDI (0000)</td></tr>
                    </tbody>
                  </table>

                  <p className="mt-1">The mapping ensures that the ALU performs the correct operation for each instruction type, with full support for RV32I and RV32M instruction sets.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'forwarding-unit':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Forwarding Unit</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Forwarding Unit detects data hazards in pipelined execution by comparing register numbers between instructions. It generates forwarding control signals to bypass values from later pipeline stages when needed, eliminating pipeline stalls for data dependencies.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">ID/EX.Rs1:</span> Current instruction's first source register number</li>
                  <li><span className="font-medium">ID/EX.Rs2:</span> Current instruction's second source register number</li>
                  <li><span className="font-medium">EX/MEM.Rd:</span> Previous instruction's destination register number</li>
                  <li><span className="font-medium">EX/MEM.RegWrite:</span> Previous instruction's register write enable signal</li>
                  <li><span className="font-medium">MEM/WB.Rd:</span> Two instructions ago's destination register number</li>
                  <li><span className="font-medium">MEM/WB.RegWrite:</span> Two instructions ago's register write enable signal</li>
                  <li><span className="font-medium">ForwardA:</span> 2-bit control signal for ALU operand A forwarding (0=no forward, 1=MEM/WB, 2=EX/MEM)</li>
                  <li><span className="font-medium">ForwardB:</span> 2-bit control signal for ALU operand B forwarding (0=no forward, 1=MEM/WB, 2=EX/MEM)</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Forwarding Unit operates combinationally to detect and resolve data hazards:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Port</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Condition</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5" rowSpan={3}>ForwardA (Rs1)</td>
                        <td className="border border-blue-200 px-1 py-0.5">EX/MEM.RegWrite=1 and EX/MEM.Rd=Rs1 and EX/MEM.Rd≠0</td>
                        <td className="border border-blue-200 px-1 py-0.5">2 (Forward from EX/MEM)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">MEM/WB.RegWrite=1 and MEM/WB.Rd=Rs1 and MEM/WB.Rd≠0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (Forward from MEM/WB)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Otherwise</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (No forwarding)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5" rowSpan={3}>ForwardB (Rs2)</td>
                        <td className="border border-blue-200 px-1 py-0.5">EX/MEM.RegWrite=1 and EX/MEM.Rd=Rs2 and EX/MEM.Rd≠0</td>
                        <td className="border border-blue-200 px-1 py-0.5">2 (Forward from EX/MEM)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">MEM/WB.RegWrite=1 and MEM/WB.Rd=Rs2 and MEM/WB.Rd≠0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (Forward from MEM/WB)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Otherwise</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (No forwarding)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">This logic ensures correct values are forwarded to ALU inputs when data dependencies exist between instructions.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'hazard-detection-unit':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Hazard Detection Unit</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Hazard Detection Unit identifies load-use data hazards where a load instruction is followed by an instruction that uses the loaded data. It generates stall signals to pause the pipeline for one cycle when such hazards are detected.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">ID/EX.MemRead:</span> Previous instruction's memory read enable signal</li>
                  <li><span className="font-medium">ID/EX.Rt:</span> Previous instruction's target register number</li>
                  <li><span className="font-medium">IF/ID.Rs:</span> Current instruction's first source register number</li>
                  <li><span className="font-medium">IF/ID.Rt:</span> Current instruction's second source register number</li>
                  <li><span className="font-medium">PC Write:</span> Output signal to freeze PC (0=stall, 1=normal)</li>
                  <li><span className="font-medium">IF/ID Write:</span> Output signal to freeze IF/ID pipeline register (0=stall, 1=normal)</li>
                  <li><span className="font-medium">Control Mux:</span> Output signal to zero out control signals (1=insert NOP, 0=normal)</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Hazard Detection Unit operates combinationally:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Condition</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">PC Write</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">IF/ID Write</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Control Mux</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">ID/EX.MemRead=1 and (ID/EX.Rt=IF/ID.Rs or ID/EX.Rt=IF/ID.Rt) and ID/EX.Rt≠0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (freeze)</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (freeze)</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (insert NOP)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Otherwise</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (normal)</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (normal)</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (normal)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">This creates a one-cycle bubble in the pipeline to allow the load instruction to complete before the dependent instruction proceeds.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'branch-hazard-unit':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Branch Hazard Unit</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Branch Hazard Unit resolves control hazards that occur when branch instructions are taken. It flushes the pipeline stages containing incorrectly fetched instructions, effectively implementing the flush method of control hazard resolution.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">branchTaken:</span> Input signal indicating that a branch is taken (connect to Jump Control's jump output)</li>
                  <li><span className="font-medium">ifIdFlush:</span> Output signal to flush the IF/ID pipeline register (1=flush, 0=normal)</li>
                  <li><span className="font-medium">idExFlush:</span> Output signal to flush the ID/EX pipeline register (1=flush, 0=normal)</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Branch Hazard Unit operates combinationally:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">branchTaken</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">ifIdFlush</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">idExFlush</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">1 (branch taken)</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (flush)</td>
                        <td className="border border-blue-200 px-1 py-0.5">1 (flush)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">0 (branch not taken)</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (normal)</td>
                        <td className="border border-blue-200 px-1 py-0.5">0 (normal)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">This flushes the pipeline stages containing instructions that were incorrectly fetched after the branch, effectively inserting NOPs and preventing the execution of instructions that should be skipped due to the branch. This is a critical component for correct program flow in pipelined processors.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Register File operates with different timing for reads and writes:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Timing</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Read Data 1</td>
                        <td className="border border-blue-200 px-1 py-0.5">Combinational (no clock)</td>
                        <td className="border border-blue-200 px-1 py-0.5">Registers[Read Register 1] (0 if address is 0)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Read Data 2</td>
                        <td className="border border-blue-200 px-1 py-0.5">Combinational (no clock)</td>
                        <td className="border border-blue-200 px-1 py-0.5">Registers[Read Register 2] (0 if address is 0)</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Write</td>
                        <td className="border border-blue-200 px-1 py-0.5">Synchronous (rising clock edge)</td>
                        <td className="border border-blue-200 px-1 py-0.5">If RegWrite=1 and Write Register≠0, then Registers[Write Register] = Write Data</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Read-after-Write</td>
                        <td className="border border-blue-200 px-1 py-0.5">Same cycle</td>
                        <td className="border border-blue-200 px-1 py-0.5">Some implementations forward the new value if read address matches write address</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">The Register File supports simultaneous reads and writes, with register x0 hardwired to zero (writes to x0 are ignored).</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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

              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Memory</h3>
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
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Cache Configuration</h4>
                <p className="text-sm text-blue-700 mb-1">The cache is fully configurable through the Cache View panel. You can adjust:</p>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Cache Lines:</span> Number of cache lines as 2^n (default n=4)</li>
                  <li><span className="font-medium">Block Size:</span> Size of each cache block in words (1 word = 4 bytes)</li>
                  <li><span className="font-medium">Associativity:</span> Number of ways as 2^n (default n=0, direct-mapped)</li>
                  <li><span className="font-medium">Replacement Policy:</span> LRU (Least Recently Used)</li>
                  <li><span className="font-medium">Write Policy:</span> Write-back with dirty bit</li>
                </ul>
                <p className="text-sm text-blue-700 mt-1">The number of sets is automatically calculated based on the formula: sets = lines / ways.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Data Memory operates with different timing for reads and writes:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Operation</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Control Signal</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Read</td>
                        <td className="border border-blue-200 px-1 py-0.5">MemRead = 1</td>
                        <td className="border border-blue-200 px-1 py-0.5">First checks cache. If hit, returns data from cache. If miss, fetches from memory and stores in cache.</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Write</td>
                        <td className="border border-blue-200 px-1 py-0.5">MemWrite = 1</td>
                        <td className="border border-blue-200 px-1 py-0.5">On rising clock edge, writes 32-bit data to both cache and memory.</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mb-1">Cache operation details:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Aspect</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Cache Replacement</td>
                        <td className="border border-blue-200 px-1 py-0.5">On cache miss with no free way, LRU policy selects victim block. If dirty, writes back to memory first.</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Addressing</td>
                        <td className="border border-blue-200 px-1 py-0.5">Byte-addressable, but most operations work with word (4-byte) alignments.</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Alignment</td>
                        <td className="border border-blue-200 px-1 py-0.5">For word operations, addresses should be multiples of 4. Some implementations handle unaligned accesses with penalties.</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Architecture</td>
                        <td className="border border-blue-200 px-1 py-0.5">Data memory is completely separate from instruction memory.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Control Unit</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Control Unit decodes RISC-V instructions and generates control signals that coordinate the operation of various datapath components. It examines the opcode field of the instruction to determine the instruction type and required operations.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">Instruction[6:0]:</span> Opcode field of the instruction</li>
                  <li><span className="font-medium">ALUSrc1[1:0]:</span> 2-bit control signal selecting ALU's first input (0: Register, 1: PC for AUIPC, 2: Zero for LUI)</li>
                  <li><span className="font-medium">ALUSrc2:</span> Control signal selecting ALU's second input (0: Register, 1: Immediate)</li>
                  <li><span className="font-medium">MemtoReg:</span> Control signal selecting write-back data source (0: ALU Result, 1: Memory Data, 2: PC+4)</li>
                  <li><span className="font-medium">RegWrite:</span> Enable signal for register file writing</li>
                  <li><span className="font-medium">MemRead:</span> Enable signal for memory reading</li>
                  <li><span className="font-medium">MemWrite:</span> Enable signal for memory writing</li>
                  <li><span className="font-medium">Branch:</span> Control signal indicating branch instruction</li>
                  <li><span className="font-medium">ALUOp[1:0]:</span> Control signal for ALU operation type</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Control Unit operates combinationally based on the instruction opcode:</p>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Type</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">RegWrite</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">ALUSrc1</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">ALUSrc2</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">MemtoReg</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">MemRead</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">MemWrite</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Branch</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">ALUOp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">R-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">10</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">I-type (ALU)</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">11</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">I-type (Load)</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">00</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">S-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">-</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">00</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">B-type</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">-</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">01</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">AUIPC</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">00</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">LUI</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">2</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'jump-control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Jump Control </h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-xs text-blue-700">The Jump Control unit determines whether to take a branch or jump by evaluating control signals and comparison results. It generates the final PC selection signal that controls instruction flow.</p>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-xs text-blue-700 list-disc pl-4">
                  <li><span className="font-medium">Branch:</span> 1-bit control signal from main control unit indicating a branch instruction</li>
                  <li><span className="font-medium">Zero:</span> 1-bit flag from ALU indicating if the comparison result is zero</li>
                  <li><span className="font-medium">Jump:</span> 1-bit control signal from main control unit indicating an unconditional jump instruction</li>
                  <li><span className="font-medium">PCSrc:</span> 1-bit output control signal for the PC multiplexer (0=PC+4, 1=branch/jump target)</li>
                </ul>
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Jump Control uses simple combinational logic to determine the next PC value:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Instruction Type</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Condition</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">PCSrc</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Branch (BEQ)</td>
                        <td className="border border-blue-200 px-1 py-0.5">Branch=1 AND Zero=1</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">Take branch</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Branch (BEQ)</td>
                        <td className="border border-blue-200 px-1 py-0.5">Branch=1 AND Zero=0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">Continue to PC+4</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Jump</td>
                        <td className="border border-blue-200 px-1 py-0.5">Jump=1</td>
                        <td className="border border-blue-200 px-1 py-0.5">1</td>
                        <td className="border border-blue-200 px-1 py-0.5">Always take jump</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Other</td>
                        <td className="border border-blue-200 px-1 py-0.5">Branch=0 AND Jump=0</td>
                        <td className="border border-blue-200 px-1 py-0.5">0</td>
                        <td className="border border-blue-200 px-1 py-0.5">Continue to PC+4</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">This component is critical for implementing all control flow changes in the processor, determining when to deviate from sequential execution.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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

              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">Pipeline registers operate synchronously on the rising edge of the clock:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Mode</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Normal</td>
                        <td className="border border-blue-200 px-1 py-0.5">On each clock edge, all input values are captured and appear at the outputs, allowing them to be used by the next stage.</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Stall</td>
                        <td className="border border-blue-200 px-1 py-0.5">When the Stall signal is high, the register retains its current value regardless of input changes, effectively pausing that stage of the pipeline.</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Flush</td>
                        <td className="border border-blue-200 px-1 py-0.5">When the Flush signal is high, all outputs are set to zero or NOP values, effectively canceling the instruction in that stage.</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mb-1">The four standard pipeline registers in a classic RISC-V pipeline are:</p>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Register</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Location</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Stored Signals</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">IF/ID</td>
                        <td className="border border-blue-200 px-1 py-0.5">Between Instruction Fetch and Instruction Decode stages</td>
                        <td className="border border-blue-200 px-1 py-0.5">Instruction and PC value</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">ID/EX</td>
                        <td className="border border-blue-200 px-1 py-0.5">Between Instruction Decode and Execute stages</td>
                        <td className="border border-blue-200 px-1 py-0.5">Register values, control signals, and immediate values</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">EX/MEM</td>
                        <td className="border border-blue-200 px-1 py-0.5">Between Execute and Memory Access stages</td>
                        <td className="border border-blue-200 px-1 py-0.5">ALU results, memory data, and control signals</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">MEM/WB</td>
                        <td className="border border-blue-200 px-1 py-0.5">Between Memory Access and Write Back stages</td>
                        <td className="border border-blue-200 px-1 py-0.5">Data for writeback and control signals</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Single Register operates synchronously:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Condition</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Rising clock edge AND Write Enable = 1</td>
                        <td className="border border-blue-200 px-1 py-0.5">The value at the input port is captured and stored internally, immediately appearing at the output port</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Rising clock edge AND Write Enable = 0</td>
                        <td className="border border-blue-200 px-1 py-0.5">The register maintains its current value regardless of input changes</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Between clock edges</td>
                        <td className="border border-blue-200 px-1 py-0.5">The output continuously provides the last stored value with no additional delay</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-1">Used for inserting controlled delays, storing state between operations, and buffering values between pipeline stages.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">No configuration needed</p>
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
                <h4 className="text-xs font-medium text-blue-800 mt-2 mb-1">Execution Logic</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">The Label operates with minimal logic:</p>
                  <table className="w-full border-collapse text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Aspect</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Display</td>
                        <td className="border border-blue-200 px-1 py-0.5">Shows the configured text string at all times</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Signal Monitoring</td>
                        <td className="border border-blue-200 px-1 py-0.5">If connected to an input signal, can display the value in decimal, hex, or binary format</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Signal Interaction</td>
                        <td className="border border-blue-200 px-1 py-0.5">Passive component that doesn't modify any signals passing through the circuit</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mb-1">Common uses for labels:</p>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Purpose</th>
                        <th className="border border-blue-200 px-1 py-0.5 text-left">Examples</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Datapath Sections</td>
                        <td className="border border-blue-200 px-1 py-0.5">"Fetch Stage", "Execute Stage"</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Signal Types</td>
                        <td className="border border-blue-200 px-1 py-0.5">"Control Signals", "Address Bus"</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Value Monitoring</td>
                        <td className="border border-blue-200 px-1 py-0.5">"Current PC", "ALU Result"</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 px-1 py-0.5">Documentation</td>
                        <td className="border border-blue-200 px-1 py-0.5">Explanatory notes in the circuit diagram</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
            <p className="text-xs text-gray-500">No configuration options available</p>
          </div>
        );
    }
  };

  return (
    <div
      className="absolute bottom-0 bg-white border-l border-t border-gray-200 shadow-lg transition-all duration-300 rounded-t-lg overflow-hidden"
      style={{
        width: isWide ? '40rem' : '20rem',
        right: '0rem',
        maxHeight: 'calc(100vh - 5rem)',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 2.5rem))',
        opacity: isExpanded ? 1 : 0.95
      }}
    >
      <div className="p-2 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center">
        <button
          className="flex items-center text-left focus:outline-none group flex-grow"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Component Description</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 ml-2" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-2" />
          )}
        </button>

        {isExpanded && (
          <button
            className="flex items-center justify-center p-1 rounded hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsWide(!isWide)}
            title={isWide ? "Narrow panel" : "Widen panel"}
          >
            {isWide ? (
              <ChevronsLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronsRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
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
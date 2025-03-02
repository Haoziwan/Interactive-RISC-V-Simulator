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
            <h3 className="font-medium">Constant Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A constant value source that outputs a fixed value to other components.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Output:</span> Provides the constant value to connected components</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pc':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Program Counter Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Program Counter (PC) holds the address of the current instruction being executed. It is updated on each clock cycle to point to the next instruction.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Next instruction address</li>
                  <li><span className="font-medium">Output:</span> Current instruction address</li>
                  <li><span className="font-medium">Clock:</span> System clock signal</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'fork':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Fork Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A signal distribution component that copies an input signal to multiple outputs. Used to fan-out a single signal to multiple destinations.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Source signal to be distributed</li>
                  <li><span className="font-medium">Outputs:</span> Multiple copies of the input signal</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'add':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Add Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">An adder component that performs binary addition on two input values. Commonly used for incrementing the PC or calculating memory addresses.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input A:</span> First operand</li>
                  <li><span className="font-medium">Input B:</span> Second operand</li>
                  <li><span className="font-medium">Output:</span> Sum of inputs A and B</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'mux':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Multiplexer Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A configurable N-to-1 multiplexer that selects one input from multiple input values based on a control signal. Supports 2 to 8 input ports. Essential for data path control and flexible signal routing.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input 0-N:</span> Multiple input values (N configurable from 2 to 8)</li>
                  <li><span className="font-medium">Select:</span> Control signal to choose which input to route to output</li>
                  <li><span className="font-medium">Output:</span> Selected input value</li>
                </ul>
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
            <h3 className="font-medium">Immediate Generator Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Generates immediate values from instruction fields. Handles sign extension and proper formatting for different instruction types (I, S, B, U, J).</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Instruction:</span> Input instruction</li>
                  <li><span className="font-medium">Output:</span> Generated immediate value</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'pc-mux':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">PC Multiplexer Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Selects the next Program Counter value based on control signals. Determines whether to fetch the next sequential instruction (PC+4) or jump to a branch target address.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input 0:</span> PC+4 value (next sequential instruction)</li>
                  <li><span className="font-medium">Input 1:</span> Branch target address</li>
                  <li><span className="font-medium">Select:</span> Control signal that determines which input to select</li>
                  <li><span className="font-medium">Output:</span> Selected next PC value</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'alu':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Arithmetic Logic Unit performs arithmetic and logical operations on binary data. Core component for executing instructions that involve calculations.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input A:</span> First operand</li>
                  <li><span className="font-medium">Input B:</span> Second operand</li>
                  <li><span className="font-medium">ALU Control:</span> Operation selection signal</li>
                  <li><span className="font-medium">Output:</span> Result of the operation</li>
                  <li><span className="font-medium">Zero Flag:</span> Set when result equals zero</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'alu-control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">ALU Control Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The ALU Control unit generates specific control signals for the ALU based on the instruction type and function codes. It translates the high-level ALUOp control signal and instruction function fields into detailed ALU operation commands.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">ALUOp:</span> Main control signal from Control Unit</li>
                  <li><span className="font-medium">Funct7:</span> Function code from instruction bits 31-25</li>
                  <li><span className="font-medium">Funct3:</span> Function code from instruction bits 14-12</li>
                  <li><span className="font-medium">Operation:</span> Output control signal specifying ALU operation</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Register File Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Register File contains 32 general-purpose registers (x0-x31) that store data during program execution. Register x0 is hardwired to zero.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Read Register 1:</span> Address of first register to read</li>
                  <li><span className="font-medium">Read Register 2:</span> Address of second register to read</li>
                  <li><span className="font-medium">Write Register:</span> Address of register to write to</li>
                  <li><span className="font-medium">Write Data:</span> Data to write to register</li>
                  <li><span className="font-medium">RegWrite:</span> Control signal enabling register write</li>
                  <li><span className="font-medium">Read Data 1:</span> Data output from first read register</li>
                  <li><span className="font-medium">Read Data 2:</span> Data output from second read register</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );
      case 'instruction-memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Instruction Memory Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Stores the program instructions to be executed. Each address contains a 32-bit RISC-V instruction that is fetched during program execution.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Address:</span> Input address to fetch instruction from</li>
                  <li><span className="font-medium">Instruction:</span> Output 32-bit instruction at the specified address</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Memory Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Data Memory stores and retrieves data used by the program. It supports load (read) and store (write) operations at specified addresses.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Address:</span> Memory location to read from or write to</li>
                  <li><span className="font-medium">Write Data:</span> Data to be written to memory</li>
                  <li><span className="font-medium">MemWrite:</span> Control signal enabling memory write</li>
                  <li><span className="font-medium">MemRead:</span> Control signal enabling memory read</li>
                  <li><span className="font-medium">Read Data:</span> Data output from the specified address</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>

            </div>
          </div>
        );

      case 'control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Control Unit Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Control Unit decodes instructions and generates control signals that coordinate the operation of other datapath components.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Opcode:</span> Instruction opcode field input</li>
                  <li><span className="font-medium">RegWrite:</span> Control signal for register file write</li>
                  <li><span className="font-medium">MemRead:</span> Control signal for memory read</li>
                  <li><span className="font-medium">MemWrite:</span> Control signal for memory write</li>
                  <li><span className="font-medium">ALUOp:</span> Control signal for ALU operation type</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'jump-control':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Jump Control Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Jump Control unit determines whether to take a branch or jump based on comparison results and instruction type. It generates control signals for updating the program counter.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Branch:</span> Control signal indicating a branch instruction</li>
                  <li><span className="font-medium">Zero:</span> ALU zero flag input</li>
                  <li><span className="font-medium">Jump:</span> Control signal indicating a jump instruction</li>
                  <li><span className="font-medium">PCSrc:</span> Output control signal for PC multiplexer</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'instr-distributer':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Instruction Distributer Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">The Instruction Distributer extracts and distributes different fields from the 32-bit instruction to various components in the datapath.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Instruction:</span> 32-bit instruction input</li>
                  <li><span className="font-medium">Opcode:</span> Bits 6-0 of the instruction</li>
                  <li><span className="font-medium">rd:</span> Destination register (bits 11-7)</li>
                  <li><span className="font-medium">rs1:</span> First source register (bits 19-15)</li>
                  <li><span className="font-medium">rs2:</span> Second source register (bits 24-20)</li>
                  <li><span className="font-medium">funct3:</span> Function code (bits 14-12)</li>
                  <li><span className="font-medium">funct7:</span> Function code (bits 31-25)</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'pipeline-register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Pipeline Register Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">Pipeline registers separate pipeline stages and store intermediate values between clock cycles. They enable pipelined execution by isolating different stages of instruction processing.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Inputs:</span> Various data and control signals from previous stage</li>
                  <li><span className="font-medium">Outputs:</span> Registered signals passed to next stage</li>
                  <li><span className="font-medium">Stall:</span> Control signal to pause pipeline stage</li>
                  <li><span className="font-medium">Flush:</span> Control signal to clear pipeline stage</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage Name
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedNode.data.stage || 'IF/ID'}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { stage: e.target.value })
                  }
                >
                  <option value="IF/ID">IF/ID</option>
                  <option value="ID/EX">ID/EX</option>
                  <option value="EX/MEM">EX/MEM</option>
                  <option value="MEM/WB">MEM/WB</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'single-register':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Single Register Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A single 32-bit register that stores a value between clock cycles. Used for temporary storage of data in the datapath.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Data value to store</li>
                  <li><span className="font-medium">Output:</span> Stored data value</li>
                  <li><span className="font-medium">Write Enable:</span> Control signal to update register value</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">No configuration needed</p>
            </div>
          </div>
        );

      case 'label':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Label Configuration</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Component Description</h4>
                <p className="text-sm text-blue-700">A visual label component that displays text or values in the datapath diagram. Useful for annotating signals or showing intermediate values.</p>
                <h4 className="text-sm font-medium text-blue-800 mt-2 mb-1">Ports</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5">
                  <li><span className="font-medium">Input:</span> Optional input value to display</li>
                </ul>
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
        right: '16rem', 
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
          <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Component Configuration</span>
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
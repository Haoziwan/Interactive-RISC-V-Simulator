import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface ControlNodeData {
  label: string;
  opcode?: string;
  funct3?: string; // 指令的funct3字段，用于确定具体的指令类型
  regWrite?: number;
  memRead?: number;
  memWrite?: number;
  addressingControl?: number; // 3 bits: [signExtend, memWidth1, memWidth0]
  aluOp?: number;
  aluSrc1?: number;
  aluSrc2?: number;
  memToReg?: number;
  controlMux?: number; // 控制多路复用器信号，来自冒险检测单元
}

export function ControlNode({ data, id, selected }: { data: ControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  const [displayOpcode, setDisplayOpcode] = React.useState<string>('0000000');

  // 更新输入连接的函数
  const updateInputConnections = () => {
    const inputEdges = edges.filter(edge => edge.target === id);
    let hasChanges = false;
    let currentControlMux = data.controlMux ?? 0;
    let currentOpcode = data.opcode;
    let currentFunct3 = data.funct3;

    inputEdges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = edge.targetHandle;

        if (portId === 'controlMux') {
          const sourceValue = sourceNode.data[edge.sourceHandle as keyof typeof sourceNode.data];
          const muxValue = typeof sourceValue === 'number' ? sourceValue : 0;

          if (muxValue !== currentControlMux) {
            currentControlMux = muxValue;
            hasChanges = true;
          }
        } else if (portId === 'opcode') {
          let sourceValue: string | undefined;

          if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
            sourceValue = String(sourceNode.data[portId as keyof typeof sourceNode.data]);
          } else if ('value' in sourceNode.data) {
            sourceValue = String((sourceNode.data as { value?: number | string }).value);
          }

          if (sourceValue) {
            const binaryValue = parseInt(sourceValue).toString(2).padStart(7, '0');
            if (binaryValue !== currentOpcode) {
              currentOpcode = binaryValue;
              setDisplayOpcode(binaryValue);
              hasChanges = true;
            }
          }
        } else if (portId === 'funct3') {
          let sourceValue: string | undefined;

          if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
            sourceValue = String(sourceNode.data[portId as keyof typeof sourceNode.data]);
          } else if ('value' in sourceNode.data) {
            sourceValue = String((sourceNode.data as { value?: number | string }).value);
          }

          if (sourceValue) {
            // 将数字转换为3位二进制字符串
            const binaryValue = parseInt(sourceValue).toString(2).padStart(3, '0');
            if (binaryValue !== currentFunct3) {
              currentFunct3 = binaryValue;
              hasChanges = true;
            }
          }
        }
      }
    });

    if (hasChanges) {
      let controlSignals;
      // 如果controlMux为1（hazard检测器发出暂停信号），则所有控制信号为0
      if (currentControlMux === 1) {
        controlSignals = {
          regWrite: 0,
          memRead: 0,
          memWrite: 0,
          addressingControl: 0b110, // Default to word width with sign extension
          aluOp: 0,
          aluSrc1: 0,
          aluSrc2: 0,
          memToReg: 0
        };
      } else if (currentOpcode) {
        const op = currentOpcode.slice(0, 7);
        switch (op) {
          case '0110011': // R-type
            controlSignals = {
              regWrite: 1,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Word width with sign extension (not used for R-type)
              aluOp: parseInt('10', 2),
              aluSrc1: 0,
              aluSrc2: 0,
              memToReg: 0
            };
            break;
          case '0010011': // I-type ALU
            controlSignals = {
              regWrite: 1,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Word width with sign extension (not used for I-type ALU)
              aluOp: parseInt('11', 2),
              aluSrc1: 0,
              aluSrc2: 1,
              memToReg: 0
            };
            break;
          case '0000011': // I-type Load
            // 根据 funct3 确定内存访问宽度
            let loadWidth = 2; // Default to word (lw)
            let addressingControl = 0b110; // Default to word with sign extension
            if (currentFunct3) {
              // Determine sign extension based on funct3
              let signExtend = 1; // Default to sign extension
              switch (currentFunct3) {
                case '000': // lb
                  loadWidth = 0; // Byte
                  signExtend = 1; // Signed
                  break;
                case '100': // lbu
                  loadWidth = 0; // Byte
                  signExtend = 0; // Unsigned
                  break;
                case '001': // lh
                  loadWidth = 1; // Half-word
                  signExtend = 1; // Signed
                  break;
                case '101': // lhu
                  loadWidth = 1; // Half-word
                  signExtend = 0; // Unsigned
                  break;
                case '010': // lw
                default:
                  loadWidth = 2; // Word
                  signExtend = 1; // Signed
                  break;
              }
              // Combine sign extension and memory width into addressing control
              addressingControl = (signExtend << 2) | loadWidth;
            }
            controlSignals = {
              regWrite: 1,
              memRead: 1,
              memWrite: 0,
              addressingControl: addressingControl,
              aluOp: parseInt('00', 2),
              aluSrc1: 0,
              aluSrc2: 1,
              memToReg: 1
            };
            break;
          case '0100011': // S-type
            // 根据 funct3 确定内存访问宽度
            let storeWidth = 2; // Default to word (sw)
            let storeAddressingControl = 0b110; // Default to word with sign extension
            if (currentFunct3) {
              // For store instructions, we still need to determine the width
              // but sign extension bit is not used for stores
              switch (currentFunct3) {
                case '000': // sb
                  storeWidth = 0; // Byte
                  break;
                case '001': // sh
                  storeWidth = 1; // Half-word
                  break;
                case '010': // sw
                default:
                  storeWidth = 2; // Word
                  break;
              }
              // For stores, sign extension bit is not used, set to 1 by default
              storeAddressingControl = (1 << 2) | storeWidth;
            }
            controlSignals = {
              regWrite: 0,
              memRead: 0,
              memWrite: 1,
              addressingControl: storeAddressingControl,
              aluOp: parseInt('00', 2),
              aluSrc1: 0,
              aluSrc2: 1,
              memToReg: 0
            };
            break;
          case '1100011': // B-type
            controlSignals = {
              regWrite: 0,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Word width with sign extension (not used for B-type)
              aluOp: parseInt('01', 2),
              aluSrc1: 0,
              aluSrc2: 0,
              memToReg: 0
            };
            break;
          case '1101111': // J-type (jal)
          case '1100111': // I-type (jalr)
            controlSignals = {
              regWrite: 1,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Word width with sign extension (not used for J-type)
              aluOp: parseInt('00', 2),
              aluSrc1: 0,
              aluSrc2: 1,
              memToReg: 2
            };
            break;
          case '0110111': // U-type (lui)
            controlSignals = {
              regWrite: 1,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Word width with sign extension (not used for U-type)
              aluOp: parseInt('00', 2),
              aluSrc1: 2, // LUI指令时aluSrc1为2
              aluSrc2: 1,
              memToReg: 0
            };
            break;
          case '0010111': // U-type (auipc)
            controlSignals = {
              regWrite: 1,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Word width with sign extension (not used for U-type)
              aluOp: parseInt('00', 2),
              aluSrc1: 1, // AUIPC指令时aluSrc1为1
              aluSrc2: 1,
              memToReg: 0
            };
            break;
          default:
            controlSignals = {
              regWrite: 0,
              memRead: 0,
              memWrite: 0,
              addressingControl: 0b110, // Default to word width with sign extension
              aluOp: parseInt('00', 2),
              aluSrc1: 0,
              aluSrc2: 0,
              memToReg: 0
            };
        }
      }

      if (controlSignals) {
        updateNodeData(id, {
          ...data,
          ...controlSignals,
          opcode: currentOpcode,
          funct3: currentFunct3,
          controlMux: currentControlMux
        });
      }
    }
  };

  React.useEffect(() => {
    updateInputConnections();
  }, [edges, nodes, id]);

  return (
    <div className={`px-2 py-4 shadow-md rounded-md bg-white border-2 w-40 ${selected ? 'border-blue-500' : 'border-gray-200'
      }`}>
      <Handle
        type="target"
        position={Position.Left}
        id="opcode"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '10%' }}
        title="Instruction Opcode"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="funct3"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '25%' }}
        title="Instruction Funct3"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="controlMux"
        className="w-3 h-3 bg-yellow-400"
        style={{ left: '50%' }}
        title="Control Mux (0=Normal, 1=NOP)"
      />
      <div className="flex flex-col items-start">
        <div className="text-lg font-bold mb-2">Control Unit</div>
        <div className="text-xs text-gray-500 space-y-1 w-full">
          <div>{(() => {
            switch (displayOpcode.slice(0, 7)) {
              case '0110011': return 'R-type';
              case '0010011': return 'I-type ALU';
              case '0000011': return 'I-type Load';
              case '0100011': return 'S-type';
              case '1100011': return 'B-type';
              case '1101111': return 'J-type (jal)';
              case '1100111': return 'I-type (jalr)';
              case '0110111': return 'U-type (lui)';
              case '0010111': return 'U-type (auipc)';
              default: return 'Unknown';
            }
          })()}</div>
          <div className="mt-1 text-xs">MUX: {data.controlMux ?? 0}</div>
          <div className="mt-1 text-xs">Funct3: {data.funct3 ?? '000'}</div>
          <div className="flex flex-col gap-y-4">
            <div id="regWrite-row" className="flex justify-between items-center relative h-6">
              <span>RegWrite:</span>
              <span>{data.regWrite ?? 0}</span>
              <Handle type="source" position={Position.Right} id="regWrite" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="RegWrite" />
            </div>
            <div id="aluSrc1-row" className="flex justify-between items-center relative h-6">
              <span>ALUSrc1:</span>
              <span>{data.aluSrc1 ?? 0}</span>
              <Handle type="source" position={Position.Right} id="aluSrc1" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="ALUSrc1" />
            </div>
            <div id="aluSrc2-row" className="flex justify-between items-center relative h-6">
              <span>ALUSrc2:</span>
              <span>{data.aluSrc2 ?? 0}</span>
              <Handle type="source" position={Position.Right} id="aluSrc2" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="ALUSrc2" />
            </div>
            <div id="memRead-row" className="flex justify-between items-center relative h-6">
              <span>MemRead:</span>
              <span>{data.memRead ?? 0}</span>
              <Handle type="source" position={Position.Right} id="memRead" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="MemRead" />
            </div>
            <div id="memWrite-row" className="flex justify-between items-center relative h-6">
              <span>MemWrite:</span>
              <span>{data.memWrite ?? 0}</span>
              <Handle type="source" position={Position.Right} id="memWrite" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="MemWrite" />
            </div>
            <div id="addressingControl-row" className="flex justify-between items-center relative h-6">
              <span>AddressingControl:</span>
              <span>{data.addressingControl ?? 0b110}</span>
              <Handle type="source" position={Position.Right} id="addressingControl" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="AddressingControl" />
            </div>
            <div id="aluOp-row" className="flex justify-between items-center relative h-6">
              <span>ALUOp:</span>
              <span>{data.aluOp ?? 0}</span>
              <Handle type="source" position={Position.Right} id="aluOp" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="ALUOp" />
            </div>
            <div id="memToReg-row" className="flex justify-between items-center relative h-6">
              <span>MemToReg:</span>
              <span>{data.memToReg ?? 0}</span>
              <Handle type="source" position={Position.Right} id="memToReg" className="w-3 h-3 bg-green-400 absolute" style={{ right: '-10px', top: '50%', transform: 'translateY(-50%)' }} title="MemToReg" />
            </div>
          </div>
        </div>
      </div>
      {/* Output ports are now embedded within each row */}
    </div>
  );
}
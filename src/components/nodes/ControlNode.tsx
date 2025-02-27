import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface ControlNodeData {
  label: string;
  opcode?: string;
  regWrite?: number;
  memRead?: number;
  memWrite?: number;
  aluOp?: number;
  aluSrc?: number;
  memToReg?: number;
}

export function ControlNode({ data, id, selected }: { data: ControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  
  const [displayOpcode, setDisplayOpcode] = React.useState<string>('0000000');
  
  // 更新输入连接的函数
  const updateInputConnections = () => {
    const inputEdges = edges.filter(edge => edge.target === id);
    
    inputEdges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = edge.targetHandle;
        let sourceValue: string | undefined;
  
        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          sourceValue = String(sourceNode.data[portId as keyof typeof sourceNode.data]);
        } else if ('value' in sourceNode.data) {
          sourceValue = String((sourceNode.data as { value?: number | string }).value);
        }
  
        if (portId === 'opcode' && sourceValue) {
          const binaryValue = parseInt(sourceValue).toString(2).padStart(7, '0');
          
          // 只有当opcode真正改变时才更新状态
          if (binaryValue !== data.opcode) {
            setDisplayOpcode(binaryValue);
            
            // 根据opcode生成控制信号
            const op = binaryValue.slice(0, 7);
            let controlSignals;
            
            switch (op) {
              case '0110011': // R-type
                controlSignals = {
                  regWrite: 1,
                  memRead: 0,
                  memWrite: 0,
                  aluOp: parseInt('10', 2),
                  aluSrc: 0,
                  memToReg: 0
                };
                break;
              case '0010011': // I-type ALU
                controlSignals = {
                  regWrite: 1,
                  memRead: 0,
                  memWrite: 0,
                  aluOp: parseInt('11', 2),
                  aluSrc: 1,
                  memToReg: 0
                };
                break;
              case '0000011': // I-type Load
                controlSignals = {
                  regWrite: 1,
                  memRead: 1,
                  memWrite: 0,
                  aluOp: parseInt('00', 2),
                  aluSrc: 1,
                  memToReg: 1
                };
                break;
              case '0100011': // S-type
                controlSignals = {
                  regWrite: 0,
                  memRead: 0,
                  memWrite: 1,
                  aluOp: parseInt('00', 2),
                  aluSrc: 1,
                  memToReg: 0
                };
                break;
              case '1100011': // B-type
                controlSignals = {
                  regWrite: 0,
                  memRead: 0,
                  memWrite: 0,
                  aluOp: parseInt('01', 2),
                  aluSrc: 0,
                  memToReg: 0
                };
                break;
              case '1101111': // J-type (jal)
              case '1100111': // I-type (jalr)
                controlSignals = {
                  regWrite: 1,
                  memRead: 0,
                  memWrite: 0,
                  aluOp: parseInt('00', 2),
                  aluSrc: 1,
                  memToReg: 0
                };
                break;
              case '0110111': // U-type (lui)
              case '0010111': // U-type (auipc)
                controlSignals = {
                  regWrite: 1,
                  memRead: 0,
                  memWrite: 0,
                  aluOp: parseInt('00', 2),
                  aluSrc: 1,
                  memToReg: 0
                };
                break;
              default:
                controlSignals = {
                  regWrite: 0,
                  memRead: 0,
                  memWrite: 0,
                  aluOp: parseInt('00', 2),
                  aluSrc: 0,
                  memToReg: 0
                };
            }
            
            // 更新节点数据
            updateNodeData(id, {
              ...data,
              ...controlSignals,
              opcode: binaryValue
            });
          }
        }
      }
    });
  };
  
  // 监听输入连接的变化
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, nodes, id, data]);
  
  return (
    <div className={`px-2 py-4 shadow-md rounded-md bg-white border-2 w-40 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="opcode" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '10%' }}
        title="指令操作码"
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
          <div className="flex flex-col gap-y-4">
            <div className="flex justify-between items-center relative">
              <span>RegWrite:</span>
              <span>{data.regWrite ?? 0}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span>ALUSrc:</span>
              <span>{data.aluSrc ?? 0}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span>MemRead:</span>
              <span>{data.memRead ?? 0}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span>MemWrite:</span>
              <span>{data.memWrite ?? 0}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span>ALUOp:</span>
              <span>{data.aluOp ?? 0}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span>MemToReg:</span>
              <span>{data.memToReg ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="regWrite" className="w-3 h-3 bg-green-400" style={{ top: '30%' }} title="RegWrite" />
      <Handle type="source" position={Position.Right} id="aluSrc" className="w-3 h-3 bg-green-400" style={{ top: '42%' }} title="ALUSrc" />
      <Handle type="source" position={Position.Right} id="memRead" className="w-3 h-3 bg-green-400" style={{ top: '54%' }} title="MemRead" />
      <Handle type="source" position={Position.Right} id="memWrite" className="w-3 h-3 bg-green-400" style={{ top: '66%' }} title="MemWrite" />
      <Handle type="source" position={Position.Right} id="aluOp" className="w-3 h-3 bg-green-400" style={{ top: '78%' }} title="ALUOp" />
      <Handle type="source" position={Position.Right} id="memToReg" className="w-3 h-3 bg-green-400" style={{ top: '90%' }} title="MemToReg" />
    </div>
  );
}
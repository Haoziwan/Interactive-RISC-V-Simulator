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
  branch?: number;
  jump?: number;
  aluSrc?: number;
  memToReg?: number;
}

export function ControlNode({ data, id, selected }: { data: ControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  
  const [inputOpcode, setInputOpcode] = React.useState<string>('0000000');
  const [displayOpcode, setDisplayOpcode] = React.useState<string>('0000000');
  
  // 监听输入连接的变化
  React.useEffect(() => {
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
          setInputOpcode(binaryValue);
          setDisplayOpcode(binaryValue);
        }
      }
    });
  }, [nodes, edges, id]);
  
  // 根据opcode生成控制信号
  const generateControlSignals = (opcode: string) => {
    // 提取opcode的关键位
    const op = opcode.slice(0, 7);
    
    switch (op) {
      case '0110011': // R-type
        return {
          regWrite: 1,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('10', 2),
          branch: 0,
          jump: 0,
          aluSrc: 0,
          memToReg: 0
        };
      case '0010011': // I-type ALU
        return {
          regWrite: 1,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('11', 2),
          branch: 0,
          jump: 0,
          aluSrc: 1,
          memToReg: 0
        };
      case '0000011': // I-type Load
        return {
          regWrite: 1,
          memRead: 1,
          memWrite: 0,
          aluOp: parseInt('00', 2),
          branch: 0,
          jump: 0,
          aluSrc: 1,
          memToReg: 1
        };
      case '0100011': // S-type
        return {
          regWrite: 0,
          memRead: 0,
          memWrite: 1,
          aluOp: parseInt('00', 2),
          branch: 0,
          jump: 0,
          aluSrc: 1,
          memToReg: 0
        };
      case '1100011': // B-type
        return {
          regWrite: 0,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('01', 2),
          branch: 1,
          jump: 0,
          aluSrc: 0,
          memToReg: 0
        };
      case '1101111': // J-type (jal)
        return {
          regWrite: 1,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('00', 2),
          branch: 0,
          jump: 1,
          aluSrc: 0,
          memToReg: 0
        };
      case '1100111': // I-type (jalr)
        return {
          regWrite: 1,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('00', 2),
          branch: 0,
          jump: 1,
          aluSrc: 1,
          memToReg: 0
        };
      case '0110111': // U-type (lui)
      case '0010111': // U-type (auipc)
        return {
          regWrite: 1,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('00', 2),
          branch: 0,
          jump: 0,
          aluSrc: 1,
          memToReg: 0
        };
      default:
        return {
          regWrite: 0,
          memRead: 0,
          memWrite: 0,
          aluOp: parseInt('00', 2),
          branch: 0,
          jump: 0,
          aluSrc: 0,
          memToReg: 0
        };
    }
  };
  
  const controlSignals = generateControlSignals(inputOpcode);
  
  // 更新节点数据
  React.useEffect(() => {
    updateNodeData(id, {
      ...data,
      ...controlSignals,
      opcode: inputOpcode
    });
  }, [inputOpcode]);
  
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
        <div className="text-xs text-gray-500 space-y-2 w-full">
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
            <div className="flex flex-col gap-y-6">
              <div className="flex justify-between items-center relative" style={{ marginTop: '10px' }}>
                <span>RegWrite:</span>
                <span>{controlSignals.regWrite}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>ALUSrc:</span>
                <span>{controlSignals.aluSrc}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>MemRead:</span>
                <span>{controlSignals.memRead}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>MemWrite:</span>
                <span>{controlSignals.memWrite}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>Branch:</span>
                <span>{controlSignals.branch}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>Jump:</span>
                <span>{controlSignals.jump}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>ALUOp:</span>
                <span>{controlSignals.aluOp}</span>
              </div>
              <div className="flex justify-between items-center relative">
                <span>MemToReg:</span>
                <span>{controlSignals.memToReg}</span>
              </div>
            </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="regWrite" className="w-3 h-3 bg-green-400" style={{ top: '23%' }} title="RegWrite" />
      <Handle type="source" position={Position.Right} id="aluSrc" className="w-3 h-3 bg-green-400" style={{ top: '33%' }} title="ALUSrc" />
      <Handle type="source" position={Position.Right} id="memRead" className="w-3 h-3 bg-green-400" style={{ top: '43%' }} title="MemRead" />
      <Handle type="source" position={Position.Right} id="memWrite" className="w-3 h-3 bg-green-400" style={{ top: '53%' }} title="MemWrite" />
      <Handle type="source" position={Position.Right} id="branch" className="w-3 h-3 bg-green-400" style={{ top: '63%' }} title="Branch" />
      <Handle type="source" position={Position.Right} id="jump" className="w-3 h-3 bg-green-400" style={{ top: '73%' }} title="Jump" />
      <Handle type="source" position={Position.Right} id="aluOp" className="w-3 h-3 bg-green-400" style={{ top: '83%' }} title="ALUOp" />
      <Handle type="source" position={Position.Right} id="memToReg" className="w-3 h-3 bg-green-400" style={{ top: '93%' }} title="写回数据选择" />
    </div>
  );
}
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface ALUControlNodeData {
  label: string;
  aluOp?: number;
  funct3?: number;
  funct7?: number;
  aluControl?: number;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ALUControlNode({ data, id, selected }: { data: ALUControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  
  // 监听输入连接的变化
  const updateInputConnections = () => {
    const inputEdges = edges.filter(edge => edge.target === id);
    let inputAluOp = data.aluOp ?? 0;
    let inputFunct3 = data.funct3 ?? 0;
    let inputFunct7 = data.funct7 ?? 0;
    let hasChanges = false;
    
    const getSourceNodeValue = (edge: any) => {
      if (!edge) return null;
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode?.data && typeof sourceNode.data === 'object') {
        const portId = edge.sourceHandle;
        let sourceValue: number | undefined;

        if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
          const value = sourceNode.data[portId as keyof typeof sourceNode.data];
          sourceValue = typeof value === 'number' ? value : undefined;
        } else if ('value' in sourceNode.data) {
          const value = (sourceNode.data as { value?: number | string }).value;
          sourceValue = typeof value === 'number' ? Number(value) : undefined;
        }

        return sourceValue ?? null;
      }
      return null;
    };
    
    inputEdges.forEach(edge => {
      const sourceValue = getSourceNodeValue(edge);
      const portId = edge.targetHandle;

      if (sourceValue !== null && !isNaN(sourceValue)) {
        switch (portId) {
          case 'aluOp':
            if (sourceValue !== inputAluOp) {
              inputAluOp = sourceValue;
              hasChanges = true;
            }
            break;
          case 'funct3':
            if (sourceValue !== inputFunct3) {
              inputFunct3 = sourceValue;
              hasChanges = true;
            }
            break;
          case 'funct7':
            if (sourceValue !== inputFunct7) {
              inputFunct7 = sourceValue;
              hasChanges = true;
            }
            break;
        }
      }
    });

    if (hasChanges) {
      // 转换为二进制字符串
      const aluOp = inputAluOp.toString(2).padStart(2, '0');
      const funct3 = inputFunct3.toString(2).padStart(3, '0');
      const funct7 = inputFunct7.toString(2).padStart(7, '0');

      // 生成ALU控制信号
      const generateALUControl = (aluOp: string, funct3: string, funct7: string): string => {
        if (aluOp === '00') {
          // Load/Store指令：执行加法
          return '0010';
        } else if (aluOp === '01') {
          // Branch指令：根据funct3确定比较类型
          switch (funct3) {
            case '000': return '0110'; // beq: 减法判断是否为0
            case '001': return '0110'; // bne: 减法判断是否不为0
            case '100': return '0111'; // blt: 有符号比较小于
            case '101': return '0111'; // bge: 有符号比较大于等于
            case '110': return '1010'; // bltu: 无符号比较小于
            case '111': return '1010'; // bgeu: 无符号比较大于等于
            default: return '0110';
          }
        } else if (aluOp === '10') {
          // R-type/I-type指令：根据funct3和funct7确定
          switch (funct3) {
            case '000':
              return funct7 === '0000000' ? '0010' : '0110'; // add/sub
            case '001': return '0111'; // sll: 逻辑左移
            case '010': return '0111'; // slt: 有符号比较设置
            case '011': return '1010'; // sltu: 无符号比较设置
            case '100': return '0011'; // xor: 异或
            case '101':
              return funct7 === '0000000' ? '1000' : '1001'; // srl/sra: 逻辑/算术右移
            case '110': return '0001'; // or: 逻辑或
            case '111': return '0000'; // and: 逻辑与
            default: return '0000';
          }
        } else if (aluOp === '11') {
          // I-type特殊指令
          switch (funct3) {
            case '000': return '0010'; // addi
            case '010': return '0111'; // slti
            case '011': return '1010'; // sltiu
            case '100': return '0011'; // xori
            case '110': return '0001'; // ori
            case '111': return '0000'; // andi
            default: return '0010';
          }
        }
        return '0000';
      };

      const aluControl = generateALUControl(aluOp, funct3, funct7);
      const aluControlValue = parseInt(aluControl, 2);

      // 更新节点数据
      updateNodeData(id, {
        ...data,
        aluOp: inputAluOp,
        funct3: inputFunct3,
        funct7: inputFunct7,
        aluControl: aluControlValue
      });
    }
  };
  
  // 优化useEffect的依赖数组
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id]);
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      
      <Handle 
        type="target" 
        position={Position.Top} 
        id="aluOp" 
        className="w-3 h-3 bg-blue-400" 
        style={{ left: '50%' }} 
        title="ALU操作码" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="funct3" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '40%' }} 
        title="功能码3" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="funct7" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '60%' }} 
        title="功能码7" 
      />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">ALU Control</div>
          <div className="text-gray-500">ALUOp: {data.aluOp?.toString(2).padStart(2, '0') || '00'}</div>
          <div className="text-gray-500">Funct3: {data.funct3?.toString(2).padStart(3, '0') || '000'}</div>
          <div className="text-gray-500">Funct7: {data.funct7?.toString(2).padStart(7, '0') || '0000000'}</div>
          <div className="text-gray-500">ALU Control: {data.aluControl?.toString(2).padStart(4, '0') || '0000'}</div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="aluControl" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '50%' }} 
        title="ALU控制信号" 
      />
    </div>
  );
}
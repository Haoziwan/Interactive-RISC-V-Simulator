import { Handle, Position, useNodes, useEdges } from 'reactflow';
import React from 'react';
import { useCircuitStore } from '../../store/circuitStore';

interface JumpControlNodeData {
  label: string;
  funct3?: number;
  opcode?: number;
  zero?: number;
  jump?: number;
  jalr?: number;
}

export function JumpControlNode({ data, id, selected }: { data: JumpControlNodeData; id: string; selected?: boolean }) {
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();
  
  const [inputFunct3, setInputFunct3] = React.useState<number>(0);
  const [inputOpcode, setInputOpcode] = React.useState<number>(0);
  const [inputZero, setInputZero] = React.useState<number>(0);
  
  // 获取输入端口的值
  const getInputValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      const portId = edge.sourceHandle;
      let sourceValue: number | undefined;
  
      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' ? value : undefined;
      } else if ('value' in sourceNode.data) {
        const value = (sourceNode.data as { value?: number }).value;
        sourceValue = typeof value === 'number' ? value : undefined;
      }
  
      return sourceValue ?? null;
    }
    return null;
  };
  // 监听输入连接的变化
  React.useEffect(() => {
    const inputEdges = edges.filter(edge => edge.target === id);
    
    inputEdges.forEach(edge => {
      const sourceValue = getInputValue(edge);
      const portId = edge.targetHandle;
  
      if (sourceValue !== null && !isNaN(sourceValue)) {
        switch (portId) {
          case 'funct3':
            setInputFunct3(sourceValue);
            break;
          case 'opcode':
            setInputOpcode(sourceValue);
            break;
          case 'zero':
            setInputZero(sourceValue);
            break;
        }
      }
    });
  }, [nodes, edges, id]);
  // 根据输入信号生成跳转控制信号
  React.useEffect(() => {
    const funct3 = inputFunct3.toString(2).padStart(3, '0');
    const opcode = inputOpcode.toString(2).padStart(7, '0');
    const zero = inputZero;
  
    let shouldJump = 0;
    let isJalr = 0;
  
    // 根据opcode和funct3判断指令类型和跳转条件
    if (opcode === '1101111') { // JAL指令
      shouldJump = 1;
      isJalr = 0;
    } else if (opcode === '1100111') { // JALR指令
      shouldJump = 1;
      isJalr = 1;
    } else if (opcode === '1100011') { // B型指令
      switch (funct3) {
        case '000': // BEQ
          shouldJump = zero ? 1 : 0;
          break;
        case '001': // BNE
          shouldJump = zero ? 0 : 1;
          break;
        case '100': // BLT
        case '110': // BLTU
          shouldJump = zero ? 0 : 1;
          break;
        case '101': // BGE
        case '111': // BGEU
          shouldJump = zero ? 1 : 0;
          break;
      }
    }
  // 更新节点数据
    updateNodeData(id, {
      ...data,
      funct3: inputFunct3,
      opcode: inputOpcode,
      zero: zero,
      jump: shouldJump,
      jalr: isJalr
    });
  }, [inputFunct3, inputOpcode, inputZero]);
  return (
    <div className={`relative px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        id="funct3" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '30%' }} 
        title="功能码3" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="opcode" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '50%' }} 
        title="操作码" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="zero" 
        className="w-3 h-3 bg-blue-400" 
        style={{ top: '70%' }} 
        title="ALU零标志" 
      />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">Jump Control</div>
          <div className="text-gray-500">Funct3: {data.funct3?.toString(2).padStart(3, '0') || '000'}</div>
          <div className="text-gray-500">Opcode: {data.opcode?.toString(2).padStart(7, '0') || '0000000'}</div>
          <div className="text-gray-500">Zero: {data.zero || 0}</div>
          <div className="text-gray-500">Jump: {data.jump || 0}</div>
          <div className="text-gray-500">Jalr: {data.jalr || 0}</div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="jump" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '40%' }} 
        title="跳转控制信号" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="jalr" 
        className="w-3 h-3 bg-green-400" 
        style={{ top: '60%' }} 
        title="JALR控制信号" 
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../store/circuitStore';

type BaseType = 'dec' | 'hex';

export function RegPanel() {
  const [base, setBase] = useState<BaseType>('hex');
  const [highlightedReg, setHighlightedReg] = useState<number | null>(null);
  const registers = useCircuitStore((state) => state.registers);
  const updateRegisters = useCircuitStore((state) => state.updateRegisters);

  // 初始化sp和gp寄存器
  useEffect(() => {
    updateRegisters({
      2: 0x7ffffff0,  // sp
      3: 0x10000000   // gp
    });
  }, []);

  const formatValue = (value: number) => {
    switch (base) {
      case 'dec':
        return value === 0 ? '0' : value.toString();
      case 'hex':
        return `0x${(value >>> 0).toString(16).padStart(8, '0')}`;
      default:
        return value.toString();
    }
  };

  const parseValue = (value: string): number => {
    try {
      if (value.startsWith('0x')) {
        return parseInt(value.slice(2), 16);
      } else {
        return parseInt(value);
      }
    } catch {
      return 0;
    }
  };

  const handleRegisterChange = (regIndex: number, value: string) => {
    if (regIndex === 0) return; // x0 寄存器始终为0
    const numValue = parseValue(value);
    updateRegisters({ [regIndex]: numValue });
  };

  // 监听寄存器文件节点的写入操作
  useEffect(() => {
    const nodes = useCircuitStore.getState().nodes;
    const regFileNode = nodes.find(node => node.type === 'register');
    if (regFileNode && regFileNode.data.regWrite && regFileNode.data.writeReg !== undefined) {
      setHighlightedReg(regFileNode.data.writeReg);
      // 500ms后清除高亮
      const timer = setTimeout(() => {
        setHighlightedReg(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [useCircuitStore.getState().stepCount]);

  return (
    <div className="h-full w-full bg-white overflow-y-auto p-1">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-base font-bold">Register</h2>
        <select
          value={base}
          onChange={(e) => setBase(e.target.value as BaseType)}
          className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded outline-none"
        >
          <option value="dec">Decimal</option>
          <option value="hex">Hexadecimal</option>
        </select>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-[2fr_1fr_3fr] gap-1 mb-0.5 text-xs font-medium bg-gray-50 p-0.5 rounded">
          <div>Name</div>
          <div>Number</div>
          <div className="pl-2">Value</div>
        </div>
        <div className="space-y-0">
          {Array.from({ length: 32 }, (_, i) => (
            <div 
              key={i} 
              className={`grid grid-cols-[2fr_1fr_3fr] gap-1 py-0.5 text-xs rounded-sm transition-colors duration-150 ${highlightedReg === i ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-50'}`}
            >
              <div className="font-medium text-[11px]">
                {i === 0 ? 'zero' : 
                 i === 1 ? 'ra' : 
                 i === 2 ? 'sp' : 
                 i === 3 ? 'gp' : 
                 i === 4 ? 'tp' : 
                 i >= 5 && i <= 7 ? `t${i-5}` : 
                 i >= 8 && i <= 9 ? `s${i-8}` : 
                 i >= 10 && i <= 17 ? `a${i-10}` : 
                 i >= 18 && i <= 27 ? `s${i-16}` : 
                 i >= 28 && i <= 31 ? `t${i-25}` : 
                 `x${i}`}
              </div>
              <div className="text-gray-500 text-[11px]">{i}</div>
              <div className="font-mono text-gray-600 pl-2 text-[11px]">
                {i === 0 ? (
                  formatValue(0)
                ) : (
                  <input
                    type="text"
                    value={formatValue(registers[i] || 0)}
                    onChange={(e) => handleRegisterChange(i, e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none py-0"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
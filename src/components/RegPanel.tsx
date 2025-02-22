import React, { useState } from 'react';

interface RegPanelProps {
  registers: { [key: number]: number };
}

type BaseType = 'dec' | 'hex' | 'bin';

export function RegPanel({ registers }: RegPanelProps) {
  const [base, setBase] = useState<BaseType>('dec');

  const formatValue = (value: number) => {
    switch (base) {
      case 'dec':
        return value === 0 ? '0' : value.toString();
      case 'hex':
        return `0x${value.toString(16).padStart(8, '0')}`;
      case 'bin':
        return `0b${value.toString(2).padStart(32, '0')}`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="h-full w-full bg-white overflow-y-auto p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">寄存器状态</h2>
        <select
          value={base}
          onChange={(e) => setBase(e.target.value as BaseType)}
          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded outline-none"
        >
          <option value="dec">十进制</option>
          <option value="hex">十六进制</option>
          <option value="bin">二进制</option>
        </select>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-3 gap-2 mb-1 text-sm font-medium bg-gray-50 p-1 rounded">
          <div>Name</div>
          <div>Number</div>
          <div>Value</div>
        </div>
        <div className="space-y-0.5">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 py-0.5 text-xs hover:bg-gray-50 rounded">
              <div className="font-medium">
                {i === 0 ? 'zero' : i === 1 ? 'ra' : i === 2 || i === 3 ? 'sp' : i === 4 ? 'gp' : i <= 7 ? `t${i-5}` : i <= 9 ? `s${i-8}` : i <= 17 ? `a${i-10}` : i <= 27 ? `s${i-16}` : i <= 31 ? `t${i-25}` : `x${i}`}
              </div>
              <div className="text-gray-600">{i}</div>
              <div className="font-mono text-gray-600">
                {formatValue(registers[i] || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
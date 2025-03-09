import React, { useState } from 'react';
import { Save, FileInput, RefreshCw } from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

export function MemoryView() {
  const memory = useCircuitStore((state) => state.memory);
  const updateMemory = useCircuitStore((state) => state.updateMemory);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const registers = useCircuitStore((state) => state.registers);
  const [displayFormat, setDisplayFormat] = useState<'hex' | 'dec'>('dec');
  const [startAddress, setStartAddress] = useState(0);
  const [segment, setSegment] = useState<'data' | 'text' | 'gp' | 'sp'>('data');
  const rowCount = 16;
  const colCount = 16;
  const formatValue = (value: number) => {
    if (displayFormat === 'hex') {
      return (value & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    }
    return value.toString();
  };
  const formatAddress = (address: number) => {
    return `0x${address.toString(16).padStart(8, '0')}`;
  };
  const handleValueChange = (address: number, value: string) => {
    let numValue: number;
    if (value.startsWith('0x')) {
      numValue = parseInt(value.slice(2), 16);
    } else {
      numValue = parseInt(value, 10);
    }

    if (!isNaN(numValue)) {
      updateMemory({
        [formatAddress(address)]: numValue
      });
    }
  };
  const handleExport = () => {
    const data = JSON.stringify(memory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memory.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedMemory = JSON.parse(content);
            updateMemory(importedMemory);
          }
        } catch (error) {
          console.error('Failed to import memory data:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  // 获取GP和SP寄存器的值
  const gpValue = registers[3] || 0x10000000; // GP寄存器默认值
  const spValue = registers[2] || 0x7ffffff0; // SP寄存器默认值

  // 处理段切换
  const handleSegmentChange = (newSegment: 'data' | 'text' | 'gp' | 'sp') => {
    setSegment(newSegment);
    
    // 根据段类型设置起始地址
    if (newSegment === 'gp') {
      setStartAddress(gpValue & ~0xF); // 对齐到16字节边界
    } else if (newSegment === 'sp') {
      setStartAddress(spValue & ~0xF); // 对齐到16字节边界
    } else if (newSegment === 'data') {
      setStartAddress(0);
    } else if (newSegment === 'text') {
      setStartAddress(0);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => handleSegmentChange('data')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'data' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Data Segment
            </button>
            <button
              onClick={() => handleSegmentChange('text')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Text Segment
            </button>
            <button
              onClick={() => handleSegmentChange('gp')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'gp' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title={`GP (x3): ${gpValue.toString(16).padStart(8, '0')}`}
            >
              GP
            </button>
            <button
              onClick={() => handleSegmentChange('sp')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'sp' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title={`SP (x2): ${spValue.toString(16).padStart(8, '0')}`}
            >
              SP
            </button>
          </div>
          <select
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value as 'hex' | 'dec')}
            className={`px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${segment === 'text' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={segment === 'text' ? "Format selection disabled in Text Segment" : "Select display format"}
            aria-label="Select memory value display format"
            disabled={segment === 'text'}
          >
            <option value="hex">Hexadecimal</option>
            <option value="dec">Decimal</option>
          </select>
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md p-1">
            <button
              onClick={() => setStartAddress(Math.max(0, startAddress - rowCount * colCount))}
              className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent`}
              title={segment === 'text' ? "Navigation disabled in Text Segment" : "Previous Page"}
              disabled={startAddress === 0 || segment === 'text'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div className="px-2 text-sm text-gray-600 select-none">
              {formatAddress(startAddress)}
            </div>
            <button
              onClick={() => setStartAddress(startAddress + rowCount * colCount)}
              className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent`}
              title={segment === 'text' ? "Navigation disabled in Text Segment" : "Next Page"}
              disabled={segment === 'text'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Save className="w-4 h-4 mr-2" />
            Export Memory
          </button>
          <label className="flex items-center px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2">
            <FileInput className="w-4 h-4 mr-2" />
            Import Memory
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Address
                </th>
                {Array.from({ length: colCount }, (_, i) => (
                  <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                    +{i.toString(16).toUpperCase().padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rowCount }, (_, row) => {
                const baseAddress = (segment === 'text') ? row * colCount : startAddress + row * colCount;
                return (
                  <tr key={row} className={row % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="sticky left-0 z-10 whitespace-nowrap px-3 py-2 text-sm font-mono text-gray-900 border-r border-gray-200 bg-inherit w-32">
                      {formatAddress(baseAddress)}
                    </td>
                    {Array.from({ length: colCount }, (_, col) => {
                      if (segment === 'data' || segment === 'gp' || segment === 'sp') {
                        const address = baseAddress + col;
                        const value = memory[formatAddress(address)] || 0;
                        return (
                          <td key={col} className="whitespace-nowrap px-3 py-2 text-sm border-r border-gray-200 last:border-r-0">
                            <input
                              type="text"
                              value={formatValue(value)}
                              onChange={(e) => handleValueChange(address, e.target.value)}
                              className="w-full h-6 font-mono text-sm bg-transparent focus:bg-blue-50 focus:outline-none rounded text-center"
                              aria-label={`Memory address ${formatAddress(address)} value`}
                            />
                          </td>
                        );
                      } else {
                        const index = Math.floor((row * colCount + col) / 4);
                        const byteOffset = (row * colCount + col) % 4;
                        const instruction = assembledInstructions[index];
                        let byteValue = '';
                        if (instruction) {
                          const fullHex = instruction.hex.replace('0x', '');
                          byteValue = fullHex.slice(6 - byteOffset * 2, 8 - byteOffset * 2);
                        }
                        return (
                          <td key={col} className="whitespace-nowrap px-3 py-2 text-sm border-r border-gray-200 last:border-r-0">
                            <div className="w-full h-6 font-mono text-sm text-center">{byteValue}</div>
                          </td>
                        );
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
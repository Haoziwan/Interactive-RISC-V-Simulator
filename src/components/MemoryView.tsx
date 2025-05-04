import React, { useState, useEffect } from 'react';
import { Save, FileInput, RefreshCw } from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

export function MemoryView() {
  const memory = useCircuitStore((state) => state.memory);
  const updateMemory = useCircuitStore((state) => state.updateMemory);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const registers = useCircuitStore((state) => state.registers);
  const [displayFormat, setDisplayFormat] = useState<'hex' | 'dec'>('dec');
  const [startAddress, setStartAddress] = useState(0);
  const [segment, setSegment] = useState<'data' | 'text' | 'gp' | 'sp'>('gp');
  const [dataLabels, setDataLabels] = useState<Record<number, string>>({});

  const colCount = 16;
  // Default row count for data, gp, and sp segments
  const defaultRowCount = 16;

  // Calculate the number of rows needed for text segment based on instructions
  const textSegmentInstructions = assembledInstructions.filter(inst => inst.segment === 'text');
  const textSegmentRowCount = Math.ceil((textSegmentInstructions.length * 4) / colCount) || defaultRowCount;

  // 获取GP和SP寄存器的值
  const gpValue = registers[3] || 0x10000000; // GP寄存器默认值
  const spValue = registers[2] || 0x7ffffff0; // SP寄存器默认值

  // 提取数据段标签信息
  useEffect(() => {
    // 从汇编指令中提取数据段标签
    const labels: Record<number, string> = {};

    assembledInstructions
      .filter(inst => inst.segment === 'data' && inst.address !== undefined)
      .forEach(inst => {
        // 从源代码中提取标签名称
        const sourceLine = inst.source || '';
        const labelMatch = sourceLine.match(/^([a-zA-Z0-9_\.]+):/);
        if (labelMatch && inst.address !== undefined) {
          labels[inst.address] = labelMatch[1];
        }
      });

    setDataLabels(labels);
  }, [assembledInstructions]);

  // 初始化时设置GP段的起始地址
  useEffect(() => {
    // 当组件首次加载时，如果默认段是gp，则设置正确的起始地址
    if (segment === 'gp') {
      setStartAddress(gpValue & ~0xF); // 对齐到16字节边界
    }
  }, [gpValue, segment]);

  // 监听SP寄存器值的变化，自动更新SP段的显示范围
  useEffect(() => {
    // 当SP寄存器值变化且当前显示的是SP段时，自动更新显示范围
    if (segment === 'sp') {
      setStartAddress(spValue & ~0xF); // 对齐到16字节边界
    }
  }, [spValue, segment]);

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
      // Limit the value to 0-255 (one byte)
      numValue = numValue & 0xFF;

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

  // 处理段切换
  const handleSegmentChange = (newSegment: 'data' | 'text' | 'gp' | 'sp') => {
    setSegment(newSegment);

    // 根据段类型设置起始地址
    if (newSegment === 'gp') {
      setStartAddress(gpValue & ~0xF); // 对齐到16字节边界
    } else if (newSegment === 'sp') {
      setStartAddress(spValue & ~0xF); // 对齐到16字节边界
    } else {
      setStartAddress(0);
    }
  };

  // 检查地址是否有对应的数据标签
  const getLabelForAddress = (address: number): string | null => {
    return dataLabels[address] || null;
  };

  // 自动检测数据类型并格式化显示
  const formatCellValue = (address: number, value: number): string => {
    if (displayFormat === 'hex') {
      return (value & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    }

    // 尝试检测ASCII字符
    if (value >= 32 && value <= 126) { // 可打印ASCII字符
      return String.fromCharCode(value);
    }

    return value.toString();
  };

  // 获取单元格背景色，突出显示标签开始的单元格
  const getCellBackground = (address: number): string => {
    // 判断是否为数据标签起始位置
    if (dataLabels[address]) {
      return 'bg-blue-50';
    }

    // 判断是否是 .word 数据的起始位置（4字节对齐）
    if (address % 4 === 0) {
      // 查找前后的内存是否有值
      const hasData = memory[formatAddress(address)] !== undefined;
      if (hasData) {
        return 'bg-gray-50';
      }
    }

    return '';
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleSegmentChange('data')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'data' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Data Segment
            </button>
            <button
              type="button"
              onClick={() => handleSegmentChange('text')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Text Segment
            </button>
            <button
              type="button"
              onClick={() => handleSegmentChange('gp')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'gp' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title={`GP (x3): 0x${gpValue.toString(16).padStart(8, '0')}`}
            >
              GP
            </button>
            <button
              type="button"
              onClick={() => handleSegmentChange('sp')}
              className={`px-3 py-1.5 rounded-md transition-colors ${segment === 'sp' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title={`SP (x2): 0x${spValue.toString(16).padStart(8, '0')}`}
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
              type="button"
              onClick={() => setStartAddress(Math.max(0, startAddress - defaultRowCount * colCount))}
              className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent`}
              title="Previous Page"
              disabled={startAddress === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div className="px-2 text-sm text-gray-600 select-none">
              {formatAddress(startAddress)}
            </div>
            <button
              type="button"
              onClick={() => setStartAddress(startAddress + defaultRowCount * colCount)}
              className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent`}
              title="Next Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Save className="w-4 h-4 mr-2" />
            Export
          </button>
          <label className="flex items-center px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2">
            <FileInput className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the memory?')) {
                useCircuitStore.getState().clearMemory();
              }
            }}
            className="flex items-center px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Clear Memory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 数据标签面板 - 仅在GP段显示 */}
      {segment === 'gp' && Object.keys(dataLabels).length > 0 && (
        <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
          <h3 className="text-sm font-semibold mb-2">Data Labels</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dataLabels).map(([addr, label]) => (
              <button
                type="button"
                key={addr}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                onClick={() => setStartAddress(parseInt(addr) & ~0xF)} // 跳转到标签地址，对齐到16字节边界
                title={`Jump to ${label} at ${formatAddress(parseInt(addr))}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

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
              {Array.from({ length: segment === 'text' ? textSegmentRowCount : defaultRowCount }, (_, row) => {
                const baseAddress = (segment === 'text') ? row * colCount : startAddress + row * colCount;
                // 检查当前行是否有标签
                const rowLabel = Object.entries(dataLabels).find(([addr, _]) => {
                  const address = parseInt(addr);
                  return address >= baseAddress && address < baseAddress + colCount;
                });

                return (
                  <tr key={row} className={row % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="sticky left-0 z-10 whitespace-nowrap px-3 py-2 text-sm font-mono text-gray-900 border-r border-gray-200 bg-inherit w-32">
                      <div className="flex flex-col">
                        <span>{formatAddress(baseAddress)}</span>
                        {rowLabel && (
                          <span className="text-xs text-blue-600 font-bold mt-1">{rowLabel[1]}</span>
                        )}
                      </div>
                    </td>
                    {Array.from({ length: colCount }, (_, col) => {
                      if (segment === 'data' || segment === 'gp' || segment === 'sp') {
                        const address = baseAddress + col;
                        const value = memory[formatAddress(address)] || 0;
                        const label = getLabelForAddress(address);
                        const cellClass = `whitespace-nowrap px-3 py-2 text-sm border-r border-gray-200 last:border-r-0 ${getCellBackground(address)}`;

                        return (
                          <td key={col} className={cellClass}>
                            <div className="relative">
                              {label && (
                                <div className="absolute -top-2 -left-1 text-xs text-blue-500 font-bold">
                                  {label}
                                </div>
                              )}
                              <input
                                type="text"
                                value={formatValue(value)}
                                onChange={(e) => handleValueChange(address, e.target.value)}
                                className={`w-full h-6 font-mono text-sm bg-transparent focus:bg-blue-50 focus:outline-none rounded text-center ${label ? 'mt-2' : ''}`}
                                aria-label={`Memory address ${formatAddress(address)} value`}
                                title={label ? `${label}: ${formatAddress(address)}` : formatAddress(address)}
                              />
                              {value >= 32 && value <= 126 && (
                                <div className="absolute -bottom-2 left-0 text-xs text-gray-500 w-full text-center">
                                  {String.fromCharCode(value)}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      } else {
                        // Calculate the byte address and find the corresponding instruction
                        const byteAddress = baseAddress + col;
                        const wordAddress = Math.floor(byteAddress / 4) * 4; // Align to word boundary
                        const byteOffset = byteAddress % 4;

                        // Find the instruction at this word address
                        const instruction = assembledInstructions.find(inst =>
                          inst.segment === 'text' && inst.address === wordAddress
                        );

                        let byteValue = '';
                        if (instruction) {
                          // Extract the specific byte from the instruction hex
                          const fullHex = instruction.hex.replace('0x', '').padStart(8, '0');
                          // For little-endian, reverse the byte order for display
                          byteValue = fullHex.slice(6 - byteOffset * 2, 8 - byteOffset * 2);
                        }
                        return (
                          <td key={col} className="whitespace-nowrap px-3 py-2 text-sm border-r border-gray-200 last:border-r-0">
                            <div className="w-full h-6 font-mono text-sm text-center">
                              {byteValue}
                            </div>
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
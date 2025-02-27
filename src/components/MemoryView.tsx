import React, { useState } from 'react';
import { Save, FileInput, RefreshCw } from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';

export function MemoryView() {
  const memory = useCircuitStore((state) => state.memory);
  const updateMemory = useCircuitStore((state) => state.updateMemory);
  const [displayFormat, setDisplayFormat] = useState<'hex' | 'dec'>('dec');
  const [startAddress, setStartAddress] = useState(0);
  const rowCount = 16;
  const colCount = 16;
  const formatValue = (value: number) => {
    if (displayFormat === 'hex') {
      return `0x${value.toString(16).padStart(8, '0')}`;
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
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value as 'hex' | 'dec')}
            className="px-2 py-1 border rounded"
            title="Select display format"
            aria-label="Select memory value display format"
          >
            <option value="hex">Hexadecimal</option>
            <option value="dec">Decimal</option>
          </select>
          <button
            onClick={() => setStartAddress(Math.max(0, startAddress - rowCount * colCount))}
            className="p-1 rounded hover:bg-gray-100"
            title="Previous Page"
          >
            ↑
          </button>
          <button
            onClick={() => setStartAddress(startAddress + rowCount * colCount)}
            className="p-1 rounded hover:bg-gray-100"
            title="Next Page"
          >
            ↓
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4 mr-1" />
            Export
          </button>
          <label className="flex items-center px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors cursor-pointer">
            <FileInput className="w-4 h-4 mr-1" />
            Import
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
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50">Address</th>
              {Array.from({ length: colCount }, (_, i) => (
                <th key={i} className="border p-2 bg-gray-50">
                  +{i.toString(16).toUpperCase().padStart(2, '0')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, row) => {
              const baseAddress = startAddress + row * colCount;
              return (
                <tr key={row}>
                  <td className="border p-2 font-mono bg-gray-50">
                    {formatAddress(baseAddress)}
                  </td>
                  {Array.from({ length: colCount }, (_, col) => {
                    const address = baseAddress + col;
                    const value = memory[formatAddress(address)] || 0;
                    return (
                      <td key={col} className="border p-1">
                        <input
                          type="text"
                          value={formatValue(value)}
                          onChange={(e) => handleValueChange(address, e.target.value)}
                          className="w-full p-1 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          aria-label={`Memory address ${formatAddress(address)} value`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { RefreshCw, Save, ChevronDown, ChevronRight } from 'lucide-react';

interface CacheEntry {
  tag: number;
  valid: boolean;
  dirty: boolean;
  data: number[];
  lastAccess: number;
}

interface CacheSet {
  entries: CacheEntry[];
  lru: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  missRate: number;
  writebacks: number;
}

export function CacheView() {
  // Get actual cache data from the store
  const cache = useCircuitStore((state) => state.cache);
  const clearCache = useCircuitStore((state) => state.clearCache);
  const initializeCache = useCircuitStore((state) => state.initializeCache);
  const updateCacheConfig = useCircuitStore((state) => state.updateCacheConfig);

  // State for configuration form
  const [linesExp, setLinesExp] = useState(cache.config.linesExp); // 2^n lines
  const [blockSizeWords, setBlockSizeWords] = useState(cache.config.blockSize / 4); // words (4 bytes each)
  const [waysExp, setWaysExp] = useState(cache.config.waysExp); // 2^n ways
  const [configError, setConfigError] = useState<string | null>(null);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // Initialize cache if it's empty
  React.useEffect(() => {
    if (cache.sets.length === 0) {
      initializeCache();
    }
  }, [cache.sets.length, initializeCache]);

  const formatAddress = (addr: number) => {
    return `0x${addr.toString(16).padStart(8, '0')}`;
  };

  const formatValue = (value: number) => {
    return `0x${(value >>> 0).toString(16).padStart(8, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-2 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Cache Status</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the cache?')) {
                clearCache();
              }
            }}
            className="flex items-center px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Cache Statistics - Horizontal layout */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-blue-50 p-3 rounded flex justify-between items-center">
          <div className="text-base font-medium text-blue-600">Hits</div>
          <div className="text-base font-bold text-blue-700">{cache.stats.hits}</div>
        </div>
        <div className="bg-red-50 p-3 rounded flex justify-between items-center">
          <div className="text-base font-medium text-red-600">Misses</div>
          <div className="text-base font-bold text-red-700">{cache.stats.misses}</div>
        </div>
        <div className="bg-green-50 p-3 rounded flex justify-between items-center">
          <div className="text-base font-medium text-green-600">Hit Rate</div>
          <div className="text-base font-bold text-green-700">{(cache.stats.hitRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-purple-50 p-3 rounded flex justify-between items-center">
          <div className="text-base font-medium text-purple-600">Writebacks</div>
          <div className="text-base font-bold text-purple-700">{cache.stats.writebacks}</div>
        </div>
      </div>

      {/* Cache Configuration - Horizontal layout */}
      <div className="bg-gray-50 p-2 rounded mb-2">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className="flex items-center text-left focus:outline-none"
          >
            <h3 className="text-base font-semibold">Cache Configuration</h3>
            {isConfigExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 ml-2" />
            )}
          </button>

          {isConfigExpanded && (
            <button
              type="button"
              onClick={() => {
                // Validate inputs
                if (linesExp < 0 || linesExp > 10) {
                  setConfigError("Number of lines exponent must be between 0 and 10");
                  return;
                }
                if (blockSizeWords <= 0 || !Number.isInteger(blockSizeWords)) {
                  setConfigError("Block size must be a positive integer number of words");
                  return;
                }
                if (waysExp < 0 || waysExp > linesExp) {
                  setConfigError("Ways exponent must be between 0 and the lines exponent");
                  return;
                }

                // Convert block size from words to bytes (1 word = 4 bytes)
                const blockSizeBytes = blockSizeWords * 4;

                // Apply configuration
                updateCacheConfig({
                  linesExp: linesExp,
                  blockSize: blockSizeBytes,
                  waysExp: waysExp
                });

                setConfigError(null);
              }}
              className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
            >
              <Save className="w-4 h-4 mr-1" />
              Apply
            </button>
          )}
        </div>

        {/* Collapsible content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${isConfigExpanded ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
        >

          {configError && (
            <div className="mb-2 p-1 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
              {configError}
            </div>
          )}

          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Note: The cache is only simulated for statistics and visualization purposes. Actual memory operations directly access the memory.
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center mb-1">
                <div className="mr-2">
                  <label className="text-sm font-medium text-gray-700">Lines (2^n)</label>
                </div>
                <input
                  type="number"
                  value={linesExp}
                  onChange={(e) => setLinesExp(Number(e.target.value))}
                  min="0"
                  max="10"
                  step="1"
                  title="Exponent for number of cache lines (2^n)"
                  className="w-16 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1 px-2"
                />
              </div>
              <div className="text-sm text-gray-600">2^{cache.config.linesExp} = {Math.pow(2, cache.config.linesExp)}</div>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <div className="mr-2">
                  <label className="text-sm font-medium text-gray-700">Block Size (words)</label>
                </div>
                <input
                  type="number"
                  value={blockSizeWords}
                  onChange={(e) => setBlockSizeWords(Number(e.target.value))}
                  min="1"
                  step="1"
                  title="Block size in words (1 word = 4 bytes)"
                  className="w-16 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1 px-2"
                />
              </div>
              <div className="text-sm text-gray-600">{cache.config.blockSize / 4} words</div>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <div className="mr-2">
                  <label className="text-sm font-medium text-gray-700">Ways (2^n)</label>
                </div>
                <input
                  type="number"
                  value={waysExp}
                  onChange={(e) => setWaysExp(Number(e.target.value))}
                  min="0"
                  max={linesExp}
                  step="1"
                  title="Exponent for number of ways (2^n)"
                  className="w-16 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1 px-2"
                />
              </div>
              <div className="text-sm text-gray-600">2^{cache.config.waysExp} = {cache.config.ways}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Content - Compact version */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border rounded">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Set</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Way</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Tag</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">V</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">D</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase w-1/2">Data</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cache.sets.length > 0 ? (
                  cache.sets.map((set, setIndex) => (
                    set.entries.map((entry, wayIndex) => (
                      <tr key={`${setIndex}-${wayIndex}`} className="text-xs hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap">{setIndex}</td>
                        <td className="px-2 py-1 whitespace-nowrap">{wayIndex}</td>
                        <td className="px-2 py-1 whitespace-nowrap font-mono">{formatAddress(entry.tag)}</td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          <span className={`px-1 rounded text-xs ${entry.valid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {entry.valid ? 'Y' : 'N'}
                          </span>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          <span className={`px-1 rounded text-xs ${entry.dirty ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {entry.dirty ? 'Y' : 'N'}
                          </span>
                        </td>
                        <td className="px-2 py-1">
                          <div className="max-w-full overflow-x-auto">
                            {entry.data.map((value, i) => (
                              <span key={i} className="mr-2 font-mono text-xs">{formatValue(value)}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">{entry.lastAccess}</td>
                      </tr>
                    ))
                  ))
                ) : (
                  <tr className="text-xs text-gray-500">
                    <td colSpan={7} className="px-2 py-1 text-center">
                      No cache entries to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
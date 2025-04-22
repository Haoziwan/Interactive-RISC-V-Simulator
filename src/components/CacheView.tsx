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
  const [cacheSize, setCacheSize] = useState(cache.config.size / 1024); // KB
  const [blockSize, setBlockSize] = useState(cache.config.blockSize); // bytes
  const [associativity, setAssociativity] = useState(cache.config.ways); // ways
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
    <div className="h-full flex flex-col p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cache Status</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the cache?')) {
                clearCache();
              }
            }}
            className="flex items-center px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </button>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600">Cache Hits</div>
          <div className="text-2xl font-bold text-blue-700">{cache.stats.hits}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600">Cache Misses</div>
          <div className="text-2xl font-bold text-red-700">{cache.stats.misses}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600">Hit Rate</div>
          <div className="text-2xl font-bold text-green-700">{(cache.stats.hitRate * 100).toFixed(2)}%</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600">Writebacks</div>
          <div className="text-2xl font-bold text-purple-700">{cache.stats.writebacks}</div>
        </div>
      </div>

      {/* Cache Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          className="w-full flex justify-between items-center text-left focus:outline-none"
        >
          <h3 className="text-lg font-semibold">Cache Configuration</h3>
          {isConfigExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Collapsible content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${isConfigExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => {
                // Validate inputs
                if (cacheSize <= 0) {
                  setConfigError("Cache size must be greater than 0");
                  return;
                }
                // Set a maximum cache size of 32KB
                if (cacheSize > 32) {
                  setConfigError("Cache size cannot exceed 32 KB");
                  return;
                }
                if (blockSize <= 0 || blockSize % 4 !== 0) {
                  setConfigError("Block size must be greater than 0 and a multiple of 4");
                  return;
                }
                if (associativity <= 0) {
                  setConfigError("Associativity must be greater than 0");
                  return;
                }

                // Calculate total size in bytes
                const totalSize = cacheSize * 1024;

                // Apply configuration
                updateCacheConfig({
                  size: totalSize,
                  blockSize: blockSize,
                  ways: associativity
                });

                setConfigError(null);
              }}
              className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Apply Configuration
            </button>
          </div>

          {configError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {configError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cache Size (KB)</label>
              <input
                type="number"
                value={cacheSize}
                onChange={(e) => setCacheSize(Number(e.target.value))}
                min="1"
                step="1"
                title="Cache size in kilobytes"
                placeholder="Enter cache size in KB"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="mt-1 text-xs text-gray-500">Current: {cache.config.size / 1024} KB</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Block Size (bytes)</label>
              <input
                type="number"
                value={blockSize}
                onChange={(e) => setBlockSize(Number(e.target.value))}
                min="4"
                step="4"
                title="Block size in bytes"
                placeholder="Enter block size in bytes"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="mt-1 text-xs text-gray-500">Current: {cache.config.blockSize} bytes</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Associativity (ways)</label>
              <input
                type="number"
                value={associativity}
                onChange={(e) => setAssociativity(Number(e.target.value))}
                min="1"
                step="1"
                title="Cache associativity (number of ways)"
                placeholder="Enter number of ways"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="mt-1 text-xs text-gray-500">Current: {cache.config.ways}-way</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm text-blue-800 font-medium">Cache Organization</div>
            <div className="text-sm text-blue-700 mt-1">
              <div>Number of Sets: {cache.config.sets}</div>
              <div>Total Size: {cache.config.size / 1024} KB</div>
              <div>Replacement Policy: LRU (Least Recently Used)</div>
              <div>Write Policy: Write-back with dirty bit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Way</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Access</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cache.sets.length > 0 ? (
                  cache.sets.map((set, setIndex) => (
                    set.entries.map((entry, wayIndex) => (
                      <tr key={`${setIndex}-${wayIndex}`} className="text-sm">
                        <td className="px-6 py-4 whitespace-nowrap">{setIndex}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{wayIndex}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatAddress(entry.tag)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${entry.valid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {entry.valid ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${entry.dirty ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {entry.dirty ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-full overflow-x-auto">
                            {entry.data.map((value, i) => (
                              <span key={i} className="mr-4 font-mono">{formatValue(value)}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{entry.lastAccess}</td>
                      </tr>
                    ))
                  ))
                ) : (
                  <tr className="text-sm text-gray-500">
                    <td colSpan={7} className="px-6 py-4 text-center">
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
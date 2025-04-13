import React from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { RefreshCw } from 'lucide-react';

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
        <h3 className="text-lg font-semibold mb-2">Cache Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cache Size</label>
            <div className="mt-1 text-sm text-gray-900">{cache.config.size / 1024} KB</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Block Size</label>
            <div className="mt-1 text-sm text-gray-900">{cache.config.blockSize} bytes</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Associativity</label>
            <div className="mt-1 text-sm text-gray-900">{cache.config.ways}-way set associative</div>
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
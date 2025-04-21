import React from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { BarChart, Clock, Cpu, GitBranch, Database } from 'lucide-react';

export function PerformanceView() {
  const performanceStats = useCircuitStore((state) => state.performanceStats);

  return (
    <div className="h-full overflow-y-auto p-4">

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="text-sm font-medium text-blue-600">Cycles</div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{performanceStats.cycleCount}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-green-600" />
            <div className="text-sm font-medium text-green-600">Instructions</div>
          </div>
          <div className="text-2xl font-bold text-green-700">{performanceStats.instructionsExecuted}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-5 h-5 text-purple-600" />
            <div className="text-sm font-medium text-purple-600">CPI</div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{performanceStats.cpi.toFixed(2)}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-5 h-5 text-amber-600" />
            <div className="text-sm font-medium text-amber-600">IPC</div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{performanceStats.ipc.toFixed(2)}</div>
        </div>
      </div>

      {/* Instruction Type Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Instruction Type Distribution</h3>
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-red-50 p-3 rounded-md">
            <div className="text-sm font-medium text-red-600 mb-1">R-Type</div>
            <div className="text-xl font-bold text-red-700">{performanceStats.rTypeCount}</div>
            <div className="text-xs text-red-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.rTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-600 mb-1">I-Type</div>
            <div className="text-xl font-bold text-blue-700">{performanceStats.iTypeCount}</div>
            <div className="text-xs text-blue-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.iTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-sm font-medium text-green-600 mb-1">S-Type</div>
            <div className="text-xl font-bold text-green-700">{performanceStats.sTypeCount}</div>
            <div className="text-xs text-green-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.sTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="text-sm font-medium text-yellow-600 mb-1">B-Type</div>
            <div className="text-xl font-bold text-yellow-700">{performanceStats.bTypeCount}</div>
            <div className="text-xs text-yellow-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.bTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm font-medium text-purple-600 mb-1">U-Type</div>
            <div className="text-xl font-bold text-purple-700">{performanceStats.uTypeCount}</div>
            <div className="text-xs text-purple-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.uTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-md">
            <div className="text-sm font-medium text-indigo-600 mb-1">J-Type</div>
            <div className="text-xl font-bold text-indigo-700">{performanceStats.jTypeCount}</div>
            <div className="text-xs text-indigo-500 mt-1">
              {performanceStats.totalInstructions > 0
                ? ((performanceStats.jTypeCount / performanceStats.totalInstructions) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Branch and Memory Statistics */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Branch Statistics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Branches</span>
              <span className="font-medium">{performanceStats.branchCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branches Taken</span>
              <span className="font-medium">{performanceStats.branchTakenCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branches Not Taken</span>
              <span className="font-medium">{performanceStats.branchNotTakenCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Branch Mispredictions</span>
              <span className="font-medium">{performanceStats.branchMispredictionCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Misprediction Rate</span>
              <span className="font-medium">
                {performanceStats.branchCount > 0
                  ? ((performanceStats.branchMispredictionCount / performanceStats.branchCount) * 100).toFixed(2)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Memory Statistics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Reads</span>
              <span className="font-medium">{performanceStats.memoryReadCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Writes</span>
              <span className="font-medium">{performanceStats.memoryWriteCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Memory Operations</span>
              <span className="font-medium">{performanceStats.memoryReadCount + performanceStats.memoryWriteCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Operation Ratio</span>
              <span className="font-medium">
                {performanceStats.instructionsExecuted > 0
                  ? (
                      ((performanceStats.memoryReadCount + performanceStats.memoryWriteCount) /
                        performanceStats.instructionsExecuted) *
                      100
                    ).toFixed(2)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stall Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Stall Analysis</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 p-3 rounded-md">
            <div className="text-sm font-medium text-red-600 mb-1">Data Hazards</div>
            <div className="text-xl font-bold text-red-700">{performanceStats.dataHazardStalls}</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-md">
            <div className="text-sm font-medium text-amber-600 mb-1">Control Hazards</div>
            <div className="text-xl font-bold text-amber-700">{performanceStats.controlHazardStalls}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-600 mb-1">Memory Stalls</div>
            <div className="text-xl font-bold text-blue-700">{performanceStats.memoryStalls}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm font-medium text-purple-600 mb-1">Total Stalls</div>
            <div className="text-xl font-bold text-purple-700">{performanceStats.totalStalls}</div>
          </div>
        </div>
      </div>

      {/* Execution Time */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Execution Time</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Execution Time</span>
          <span className="font-medium">{(performanceStats.executionTimeMs / 1000).toFixed(3)} seconds</span>
        </div>
      </div>
    </div>
  );
}

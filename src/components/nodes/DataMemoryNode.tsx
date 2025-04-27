import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { useCircuitStore } from '../../store/circuitStore';
import React from 'react';

interface DataMemoryNodeData {
  label: string;
  address?: number;
  writeData?: number;
  memRead?: number;
  memWrite?: number;
  memWidth?: number; // 0=byte, 1=half-word, 2=word
  size?: number;
  readData?: number;
}

export function DataMemoryNode({ data, id, selected }: { data: DataMemoryNodeData; id: string; selected?: boolean }) {
  const memory = useCircuitStore((state) => state.memory);
  const updateMemory = useCircuitStore((state) => state.updateMemory);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const disableUIUpdates = useCircuitStore((state) => state.disableUIUpdates);
  const stepCount = useCircuitStore((state) => state.stepCount);
  const nodes = useNodes();
  const edges = useEdges();
  const cache = useCircuitStore((state) => state.cache);
  const updateCacheStats = useCircuitStore((state) => state.updateCacheStats);
  const initializeCache = useCircuitStore((state) => state.initializeCache);

  // 获取输入端口的值
  const getInputValue = (edge: any) => {
    if (!edge) return null;
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode?.data && typeof sourceNode.data === 'object') {
      // 首先尝试根据输入端口ID查找对应字段
      const portId = edge.sourceHandle;
      let sourceValue: number | boolean | undefined;

      if (portId && sourceNode.data[portId as keyof typeof sourceNode.data] !== undefined) {
        // 如果存在对应端口ID的字段，使用该字段值
        const value = sourceNode.data[portId as keyof typeof sourceNode.data];
        sourceValue = typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
      } else if ('value' in sourceNode.data) {
        // 否则使用默认的value字段
        const value = (sourceNode.data as { value?: number | boolean }).value;
        sourceValue = typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
      }

      return sourceValue ?? null;
    }
    return null;
  };

  // 从缓存中读取数据
  const readFromCache = (address: number): number | null => {
    const { config, sets } = cache;

    // If cache is not initialized, return null
    if (sets.length === 0) {
      return null;
    }

    const blockOffset = address % config.blockSize;
    const setIndex = Math.floor((address / config.blockSize) % config.sets);
    const tag = Math.floor(address / (config.blockSize * config.sets));

    const set = sets[setIndex];
    if (!set) return null;

    // 查找匹配的缓存行
    const entry = set.entries.find(e => e.valid && e.tag === tag);
    if (entry) {
      // 缓存命中
      entry.lastAccess = stepCount;
      updateCacheStats(true, false);
      return entry.data[Math.floor(blockOffset / 4)];
    }

    // 缓存未命中
    updateCacheStats(false, false);

    // 从内存加载数据到缓存
    const blockStartAddress = address - blockOffset;
    const blockData = Array(config.blockSize / 4).fill(0);

    // 加载整个缓存块的数据
    for (let i = 0; i < config.blockSize / 4; i++) {
      const memAddress = blockStartAddress + i * 4;
      const memKey = `0x${memAddress.toString(16).padStart(8, '0')}`;
      blockData[i] = memory[memKey] || 0;
    }

    // 查找无效的缓存行
    let newEntry = set.entries.find(e => !e.valid);
    if (newEntry) {
      // 有空闲行
      newEntry.valid = true;
      newEntry.tag = tag;
      newEntry.dirty = false;
      newEntry.data = blockData;
      newEntry.lastAccess = stepCount;
    } else {
      // 使用LRU策略选择替换行
      const lruEntry = set.entries[set.lru];
      if (lruEntry.valid && lruEntry.dirty) {
        // 写回
        // 这里只是模拟写回过程，实际上不需要执行写回操作
        // 因为我们使用的是write-back策略，只有在替换时才需要写回
        // const oldAddress = (lruEntry.tag * config.sets + setIndex) * config.blockSize;
        // for (let i = 0; i < config.blockSize / 4; i++) {
        //   const memAddress = oldAddress + i * 4;
        //   const memKey = `0x${memAddress.toString(16).padStart(8, '0')}`;
        //   updateMemory({
        //     [memKey]: lruEntry.data[i]
        //   });
        // }

        // 更新写回计数器
        updateCacheStats(false, true);
      }

      // 更新LRU指针
      set.lru = (set.lru + 1) % config.ways;

      // 写入新数据
      lruEntry.valid = true;
      lruEntry.tag = tag;
      lruEntry.dirty = false;
      lruEntry.data = blockData;
      lruEntry.lastAccess = stepCount;
      newEntry = lruEntry;
    }

    return newEntry.data[Math.floor(blockOffset / 4)];
  };

  // 写入缓存
  const writeToCache = (address: number, data: number) => {
    const { config, sets } = cache;

    // If cache is not initialized, return
    if (sets.length === 0) {
      return;
    }

    const blockOffset = address % config.blockSize;
    const setIndex = Math.floor((address / config.blockSize) % config.sets);
    const tag = Math.floor(address / (config.blockSize * config.sets));

    const set = sets[setIndex];
    if (!set) return;

    // 查找匹配的缓存行
    let entry = set.entries.find(e => e.valid && e.tag === tag);
    if (entry) {
      // 缓存命中，更新数据
      entry.data[Math.floor(blockOffset / 4)] = data;
      entry.dirty = true;
      entry.lastAccess = stepCount;
      updateCacheStats(true, false);
      return;
    }

    // 缓存未命中，需要替换
    updateCacheStats(false, false);

    // 查找无效的缓存行
    entry = set.entries.find(e => !e.valid);
    if (entry) {
      // 有空闲行
      entry.valid = true;
      entry.tag = tag;
      entry.dirty = true;
      entry.data[Math.floor(blockOffset / 4)] = data;
      entry.lastAccess = stepCount;
      return; // 找到空闲行，直接返回
    }

    // 没有空闲行，使用LRU策略选择替换行
    const lruEntry = set.entries[set.lru];

    // 如果要替换的行是脏的，需要写回
    if (lruEntry.valid && lruEntry.dirty) {
      // 写回
      const oldAddress = (lruEntry.tag * config.sets + setIndex) * config.blockSize;
      // 这里只是模拟写回过程，实际上不需要执行写回操作
      // 因为我们使用的是write-back策略，只有在替换时才需要写回
      // for (let i = 0; i < config.blockSize / 4; i++) {
      //   const memAddress = oldAddress + i * 4;
      //   const memKey = `0x${memAddress.toString(16).padStart(8, '0')}`;
      //   updateMemory({
      //     [memKey]: lruEntry.data[i]
      //   });
      // }
      // 更新写回计数器
      updateCacheStats(false, true);
    }

    // 更新LRU指针
    set.lru = (set.lru + 1) % config.ways;

    // 写入新数据
    lruEntry.valid = true;
    lruEntry.tag = tag;
    lruEntry.dirty = true;
    lruEntry.data[Math.floor(blockOffset / 4)] = data;
    lruEntry.lastAccess = stepCount;
  };

  // 记录读取位置和状态
  const [readAddress, setReadAddress] = React.useState<number>(0);
  const [shouldRead, setShouldRead] = React.useState<boolean>(false);

  // Initialize cache if it's empty
  React.useEffect(() => {
    if (cache.sets.length === 0) {
      initializeCache();
    }
  }, [cache.sets.length, initializeCache]);

  const updateInputConnections = () => {
    // 找到连接到此节点的边
    const addressEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'address');
    const memReadEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memRead');
    const writeDataEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'writeData');
    const memWriteEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memWrite');
    const memWidthEdge = edges.find(edge => edge.target === id && edge.targetHandle === 'memWidth');

    const newAddress = Number(getInputValue(addressEdge) ?? data.address ?? 0);
    const newMemRead = Number(getInputValue(memReadEdge) ?? data.memRead ?? 0);
    const newWriteData = Number(getInputValue(writeDataEdge) ?? data.writeData ?? 0);
    const newMemWrite = Number(getInputValue(memWriteEdge) ?? data.memWrite ?? 0);
    const newMemWidth = Number(getInputValue(memWidthEdge) ?? data.memWidth ?? 2); // Default to word (2)

    // 只有当输入值发生实际变化时才更新
    const hasChanges = newAddress !== (data.address || 0) ||
                      newMemRead !== (data.memRead || 0) ||
                      newWriteData !== (data.writeData || 0) ||
                      newMemWrite !== (data.memWrite || 0) ||
                      newMemWidth !== (data.memWidth ?? 2);

    if (hasChanges) {
      // 更新节点数据（更新所有输入端口状态）
      const addressHex = `0x${newAddress.toString(16).padStart(8, '0')}`;
      let readData = 0;

      if (newMemRead > 0) {
        // 根据内存宽度读取不同大小的数据
        switch (newMemWidth) {
          case 0: // 字节 (lb/lbu)
            readData = memory[addressHex] || 0;
            // 符号扩展 (lb) - 如果最高位为1，则扩展为负数
            if (readData & 0x80) {
              readData = readData | 0xFFFFFF00; // 符号扩展
            }
            break;
          case 1: // 半字 (lh/lhu)
            const byte0 = memory[addressHex] || 0;
            const byte1 = memory[`0x${(newAddress + 1).toString(16).padStart(8, '0')}`] || 0;
            readData = (byte1 << 8) | byte0;
            // 符号扩展 (lh) - 如果最高位为1，则扩展为负数
            if (readData & 0x8000) {
              readData = readData | 0xFFFF0000; // 符号扩展
            }
            break;
          case 2: // 字 (lw)
          default:
            const b0 = memory[addressHex] || 0;
            const b1 = memory[`0x${(newAddress + 1).toString(16).padStart(8, '0')}`] || 0;
            const b2 = memory[`0x${(newAddress + 2).toString(16).padStart(8, '0')}`] || 0;
            const b3 = memory[`0x${(newAddress + 3).toString(16).padStart(8, '0')}`] || 0;
            readData = (b3 << 24) | (b2 << 16) | (b1 << 8) | b0;
            break;
        }
      }
      // 记录读取位置和状态，用于cache
      setReadAddress(newAddress);
      setShouldRead(newMemRead > 0);

      updateNodeData(id, {
        ...data,
        address: newAddress,
        memRead: newMemRead,
        writeData: newWriteData,
        memWrite: newMemWrite,
        memWidth: newMemWidth,
        readData: readData
      });
    }
  };

  // 监听输入连接的变化（组合逻辑部分：所有输入端口更新）
  React.useEffect(() => {
    updateInputConnections();
  }, [edges, id, nodes, memory]);

  // 监听时钟信号执行缓存模拟读取和内存写入（时序逻辑部分）
  React.useEffect(() => {
    // 读取操作 - 模拟缓存读取（仅用于统计）
    if (shouldRead) {
      readFromCache(readAddress); // Just for cache stats tracking
    }

    // 写入操作 - 实际更新内存状态
    const address = data.address || 0;
    const writeData = data.writeData || 0;
    const memWrite = data.memWrite || 0;
    const memWidth = data.memWidth ?? 2; // Default to word (2)

    if (memWrite > 0) {
      // 首先写入缓存
      writeToCache(address, writeData);

      // 根据内存宽度写入不同大小的数据
      const addressHex = `0x${address.toString(16).padStart(8, '0')}`;

      switch (memWidth) {
        case 0: // 字节 (sb)
          // 只写入最低字节
          updateMemory({
            [addressHex]: writeData & 0xFF
          });
          break;
        case 1: // 半字 (sh)
          // 写入两个字节
          updateMemory({
            [addressHex]: writeData & 0xFF,
            [`0x${(address + 1).toString(16).padStart(8, '0')}`]: (writeData >> 8) & 0xFF
          });
          break;
        case 2: // 字 (sw)
        default:
          // 写入四个字节
          updateMemory({
            [addressHex]: writeData & 0xFF,
            [`0x${(address + 1).toString(16).padStart(8, '0')}`]: (writeData >> 8) & 0xFF,
            [`0x${(address + 2).toString(16).padStart(8, '0')}`]: (writeData >> 16) & 0xFF,
            [`0x${(address + 3).toString(16).padStart(8, '0')}`]: (writeData >> 24) & 0xFF
          });
          break;
      }
    }
  }, [stepCount]);

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Control ports on left */}
      <Handle
        type="target"
        position={Position.Top}
        id="memWrite"
        className="w-3 h-3 bg-yellow-400"
        style={{ left: '20%' }}
        title="Write Enable Signal"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="memRead"
        className="w-3 h-3 bg-yellow-400"
        style={{ left: '50%' }}
        title="Read Enable Signal"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="memWidth"
        className="w-3 h-3 bg-yellow-400"
        style={{ left: '80%' }}
        title="Memory Width (0=byte, 1=half, 2=word)"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="address"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '30%' }}
        title="Memory Address"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="writeData"
        className="w-3 h-3 bg-blue-400"
        style={{ top: '70%' }}
        title="Write Data"
      />

      {/* Output port on right */}
      <Handle
        type="source"
        position={Position.Right}
        id="readData"
        className="w-3 h-3 bg-green-400"
        style={{ top: '50%' }}
        title="Read Data"
      />

      <div className="ml-2">
        <div className="text-lg font-bold">Data Memory</div>
        {!disableUIUpdates && (
          <>
            <div className="text-gray-500">Address: 0x{(data.address || 0).toString(16).padStart(8, '0')}</div>
            <div className="text-gray-500">Write Data: {data.writeData || 0}</div>
            <div className="text-gray-500">Read Data: {data.readData || 0}</div>
            <div className="text-gray-500">MemRead: {data.memRead || 0}</div>
            <div className="text-gray-500">MemWrite: {data.memWrite || 0}</div>
            <div className="text-gray-500">MemWidth: {data.memWidth ?? 2} ({data.memWidth === 0 ? 'byte' : data.memWidth === 1 ? 'half' : 'word'})</div>
          </>
        )}
        {/* Add placeholder div when UI updates are disabled to maintain height */}
        {disableUIUpdates && (
          <div style={{ height: '120px' }}></div>
        )}
      </div>
    </div>
  );
}
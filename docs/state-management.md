# Zustand 状态管理指南

## 1. Zustand 简介

Zustand 是一个轻量级的状态管理库，具有以下特点：
- 简单易用，API 简洁
- 支持 TypeScript
- 支持中间件
- 性能优秀
- 支持 React DevTools

## 2. 基本用法

### 2.1 创建 Store

```typescript
import create from 'zustand'

interface BearState {
  bears: number
  increase: () => void
}

const useStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))
```

### 2.2 在组件中使用

```typescript
import { useStore } from './store'

function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increase = useStore((state) => state.increase)
  return <button onClick={increase}>增加</button>
}
```

## 3. 在 RISC-V 模拟器中的应用

### 3.1 数据通路状态管理

```typescript
// src/store/circuitStore.ts
import create from 'zustand'
import { Node, Edge } from 'reactflow'

interface CircuitState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: string | null
  updateNode: (id: string, data: any) => void
  addNode: (node: Node) => void
  removeNode: (id: string) => void
  setSelectedNode: (id: string | null) => void
}

export const useCircuitStore = create<CircuitState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data } : node
      ),
    })),
    
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
    
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    })),
    
  setSelectedNode: (id) =>
    set({
      selectedNode: id,
    }),
}))
```

### 3.2 指令执行状态管理

```typescript
// src/store/executionStore.ts
import create from 'zustand'

interface ExecutionState {
  isRunning: boolean
  currentInstruction: number
  executionSpeed: number
  setRunning: (running: boolean) => void
  setCurrentInstruction: (index: number) => void
  setExecutionSpeed: (speed: number) => void
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isRunning: false,
  currentInstruction: 0,
  executionSpeed: 1,
  
  setRunning: (running) =>
    set({
      isRunning: running,
    }),
    
  setCurrentInstruction: (index) =>
    set({
      currentInstruction: index,
    }),
    
  setExecutionSpeed: (speed) =>
    set({
      executionSpeed: speed,
    }),
}))
```

### 3.3 在组件中使用状态

```typescript
// src/components/CircuitCanvas.tsx
import { useCircuitStore } from '../store/circuitStore'

const CircuitCanvas: React.FC = () => {
  const nodes = useCircuitStore((state) => state.nodes)
  const edges = useCircuitStore((state) => state.edges)
  const updateNode = useCircuitStore((state) => state.updateNode)
  
  // 使用状态和操作
  const handleNodeUpdate = (nodeId: string, newData: any) => {
    updateNode(nodeId, newData)
  }
  
  return (
    <div className="circuit-canvas">
      {/* 渲染节点和边 */}
    </div>
  )
}
```

## 4. 最佳实践

### 4.1 状态分割

将状态按功能模块分割成多个 store：
- circuitStore：管理数据通路状态
- executionStore：管理指令执行状态
- memoryStore：管理内存状态
- registerStore：管理寄存器状态

### 4.2 状态选择器

使用选择器来优化性能：

```typescript
const nodes = useCircuitStore((state) => state.nodes)
```

而不是：

```typescript
const state = useCircuitStore()
const nodes = state.nodes
```

### 4.3 中间件使用

使用中间件进行日志记录和持久化：

```typescript
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      // 状态和操作
    }),
    {
      name: 'circuit-storage',
    }
  )
)
```

### 4.4 TypeScript 支持

充分利用 TypeScript 类型系统：

```typescript
interface State {
  nodes: Node[]
  edges: Edge[]
}

interface Actions {
  addNode: (node: Node) => void
  removeNode: (id: string) => void
}

const useStore = create<State & Actions>((set) => ({
  // 实现状态和操作
}))
```

## 5. 调试技巧

### 5.1 使用 Redux DevTools

```typescript
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      // 状态和操作
    })
  )
)
```

### 5.2 状态快照

```typescript
const state = useStore.getState()
console.log('Current state:', state)
```

## 6. 注意事项

1. 避免过度使用全局状态
2. 合理划分状态粒度
3. 注意性能优化
4. 保持状态更新的不可变性
5. 使用 TypeScript 确保类型安全

## 7. 常见问题解决

### 7.1 状态更新不生效

确保正确使用 set 函数：

```typescript
// 正确
set((state) => ({ count: state.count + 1 }))

// 错误
state.count += 1
```

### 7.2 组件重复渲染

使用选择器来避免不必要的重渲染：

```typescript
// 推荐
const count = useStore((state) => state.count)

// 不推荐
const { count } = useStore()
```

## 8. 总结

Zustand 在 RISC-V 模拟器项目中发挥了重要作用：
1. 管理复杂的数据通路状态
2. 控制指令执行流程
3. 维护内存和寄存器状态
4. 提供良好的开发体验

通过合理使用 Zustand，我们实现了清晰的状态管理，提高了代码的可维护性和开发效率。
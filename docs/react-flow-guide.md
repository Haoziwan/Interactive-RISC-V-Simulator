# React Flow 使用指南

## 1. React Flow 简介

React Flow 是一个用于构建节点式编辑器和交互式流程图的强大 React 组件库。在我们的 RISC-V 模拟器项目中，React Flow 主要用于实现数据通路的可视化和交互功能。

## 2. 基础概念

### 2.1 核心组件

- **ReactFlow**: 主容器组件，用于渲染整个流程图
- **Node**: 节点组件，代表数据通路中的各个处理器组件
- **Edge**: 边组件，表示组件之间的连接关系
- **Controls**: 控制面板，提供缩放和适配等功能
- **Background**: 背景组件，可自定义网格样式

### 2.2 基本用法

```typescript
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

const CircuitCanvas = () => {
  const nodes = [];
  const edges = [];

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  );
};
```

## 3. 在 RISC-V 模拟器中的应用

### 3.1 自定义节点

在我们的项目中，每个处理器组件都被实现为一个自定义节点：

```typescript
// src/components/nodes/ALUNode.tsx
import { Handle, Position } from 'reactflow';

const ALUNode = ({ data }) => {
  return (
    <div className="alu-node">
      <Handle type="target" position={Position.Left} id="input-a" />
      <Handle type="target" position={Position.Left} id="input-b" />
      <div className="node-content">
        <h3>ALU</h3>
        <select onChange={data.onOperationChange}>
          <option value="add">ADD</option>
          <option value="sub">SUB</option>
          {/* 其他操作 */}
        </select>
      </div>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};
```

### 3.2 节点注册

```typescript
const nodeTypes = {
  alu: ALUNode,
  register: RegisterNode,
  memory: MemoryNode,
  // 其他节点类型
};

<ReactFlow nodeTypes={nodeTypes} {...otherProps} />
```

### 3.3 数据流管理

使用 Zustand 管理节点状态和数据流：

```typescript
// src/store/circuitStore.ts
import create from 'zustand';

export const useCircuitStore = create((set) => ({
  nodes: [],
  edges: [],
  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },
  // 其他状态管理方法
}));
```

## 4. 交互功能实现

### 4.1 拖拽功能

```typescript
const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const onDrop = (event) => {
  event.preventDefault();

  const type = event.dataTransfer.getData('application/reactflow');
  const position = reactFlowInstance.project({
    x: event.clientX,
    y: event.clientY,
  });

  const newNode = {
    id: `${type}-${Date.now()}`,
    type,
    position,
    data: { label: `${type} node` },
  };

  setNodes((nds) => nds.concat(newNode));
};
```

### 4.2 连线处理

```typescript
const onConnect = useCallback(
  (params) => {
    const newEdge = {
      ...params,
      type: 'smoothstep',
      animated: true,
    };
    setEdges((eds) => addEdge(newEdge, eds));
  },
  [setEdges]
);
```

### 4.3 数据流动动画

```typescript
const edges = [
  {
    id: 'e1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true,
    style: { stroke: '#ff0000' },
  },
];
```

## 5. 性能优化

### 5.1 节点渲染优化

```typescript
const MemoizedNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      {/* 节点内容 */}
    </div>
  );
});
```

### 5.2 更新策略

```typescript
const nodeColor = (node) => {
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#ff0072';
  }
};

<ReactFlow
  nodes={nodes}
  edges={edges}
  nodesDraggable={false}
  nodesConnectable={false}
  elementsSelectable={false}
/>
```

## 6. 调试技巧

### 6.1 开发工具

- React Developer Tools 查看节点树
- 控制台日志记录状态变化
- 性能分析工具监控渲染

### 6.2 常见问题解决

1. 节点无法拖动
   - 检查 nodesDraggable 属性
   - 确认节点样式未禁用拖动

2. 连线不显示
   - 验证 source 和 target 节点 ID
   - 检查 Handle 组件配置

3. 性能问题
   - 使用 memo 优化节点渲染
   - 避免不必要的状态更新
   - 优化大量节点的渲染策略

## 7. 最佳实践

1. 组件设计
   - 保持节点组件的纯函数特性
   - 合理使用 memo 优化渲染
   - 统一的样式管理

2. 状态管理
   - 使用 Zustand 管理全局状态
   - 避免深层组件树
   - 及时清理无用连接

3. 交互优化
   - 添加适当的用户反馈
   - 实现撤销/重做功能
   - 保存/加载布局配置

## 8. 项目实例

### 8.1 数据通路实现

```typescript
// src/components/CircuitCanvas.tsx
import ReactFlow, { Background, Controls } from 'reactflow';
import { useCircuitStore } from '../store/circuitStore';

const CircuitCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCircuitStore();

  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
```

### 8.2 组件库集成

```typescript
// src/components/ComponentLibrary.tsx
const ComponentLibrary = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="component-library">
      <div
        className="component-item"
        onDragStart={(e) => onDragStart(e, 'alu')}
        draggable
      >
        ALU
      </div>
      {/* 其他组件 */}
    </div>
  );
};
```

## 9. 总结

React Flow 在我们的 RISC-V 模拟器项目中发挥了关键作用，它不仅提供了强大的可视化能力，还具有良好的可扩展性和性能表现。通过合理的组件设计、状态管理和交互优化，我们成功实现了一个流畅、直观的数据通路可视化系统。在实际开发中，建议遵循本文提到的最佳实践，并根据具体需求进行适当的定制和优化。
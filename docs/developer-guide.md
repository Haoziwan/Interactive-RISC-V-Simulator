# RISC-V 模拟器开发者指南

## 1. 技术架构

### 1.1 前端架构

项目采用现代化的前端技术栈：

- **React + TypeScript**：提供类型安全和组件化开发
- **Zustand**：轻量级状态管理
- **React Flow**：实现可视化数据通路
- **Tailwind CSS**：原子化 CSS 框架

### 1.2 核心模块设计

#### 1.2.1 汇编器模块

```typescript
// 汇编器接口
interface Assembler {
  assemble(code: string): {
    hex: string;
    binary: string;
    assembly?: string;
  }[];
  validate(code: string): boolean;
}
```

#### 1.2.2 数据通路组件

每个组件都继承自 React Flow 的 Node 类型：

```typescript
interface ComponentNode extends Node {
  type: string;          // 组件类型
  data: {
    label: string;       // 显示标签
    value?: number;      // 当前值
    operation?: string;  // 操作类型
    // ... 其他特定属性
  };
}
```

## 2. 状态管理详解

### 2.1 Circuit Store

```typescript
interface CircuitState {
  nodes: Node[];            // 电路节点
  edges: Edge[];            // 连接线
  selectedNode: Node | null; // 选中的节点
  selectedEdge: Edge | null; // 选中的连线
  isSimulating: boolean;     // 模拟状态
  // ... 其他状态
}
```

### 2.2 状态更新流程

1. **组件状态更新**
   ```typescript
   updateNodeData: (nodeId: string, newData: any) => void;
   ```

2. **模拟控制**
   ```typescript
   toggleSimulation: () => void;
   stepSimulation: () => void;
   resetSimulation: () => void;
   ```

## 3. 组件开发指南

### 3.1 新组件创建

1. 在 `src/components/nodes` 创建组件文件
2. 实现必要的接口和属性
3. 注册到 `nodeTypes` 映射

示例：
```typescript
export function CustomNode({ data, id, selected }: NodeProps) {
  const updateNodeData = useCircuitStore(state => state.updateNodeData);
  
  return (
    <div className={`node ${selected ? 'selected' : ''}`}>
      {/* 组件内容 */}
    </div>
  );
}
```

### 3.2 连接点（Handle）配置

```typescript
<Handle
  type="target"          // 输入端口
  position={Position.Left}
  id="input"
  className="handle"
/>
```

## 4. 数据通路实现

### 4.1 指令执行流程

1. **取指阶段**
   - PC 更新
   - 指令内存读取

2. **译码阶段**
   - 指令解析
   - 控制信号生成

3. **执行阶段**
   - ALU 运算
   - 分支判断

4. **访存阶段**
   - 数据内存访问

5. **写回阶段**
   - 寄存器写入

### 4.2 关键实现细节

#### 4.2.1 PC 更新逻辑

```typescript
const updatePC = (state: CircuitState) => {
  const pcNode = state.nodes.find(n => n.type === 'pc');
  if (pcNode) {
    const nextPC = pcNode.data.value + 4;
    updateNodeData(pcNode.id, { value: nextPC });
  }
};
```

#### 4.2.2 指令解码

```typescript
const decodeInstruction = (instruction: string) => {
  const opcode = instruction.slice(25, 32);
  const funct3 = instruction.slice(12, 15);
  // ... 解析其他字段
  return { opcode, funct3, ... };
};
```

## 5. 测试指南

### 5.1 单元测试

使用 Vitest 进行测试：

```typescript
describe('Assembler', () => {
  it('should correctly assemble R-type instructions', () => {
    const code = 'add x1, x2, x3';
    const result = assembler.assemble(code);
    expect(result[0].hex).toBe('0x00318133');
  });
});
```

### 5.2 组件测试

```typescript
describe('ALUNode', () => {
  it('should perform correct operation', () => {
    render(<ALUNode data={{ operation: 'ADD' }} />);
    // ... 测试逻辑
  });
});
```

## 6. 性能优化

### 6.1 渲染优化

1. **使用 React.memo**
   ```typescript
   export const OptimizedNode = React.memo(({ data }: NodeProps) => {
     // ... 组件实现
   });
   ```

2. **状态分割**
   ```typescript
   const useNodeStore = create<NodeState>()((set) => ({
     // 独立的节点状态管理
   }));
   ```

### 6.2 计算优化

1. **缓存计算结果**
   ```typescript
   const memoizedValue = useMemo(() => {
     return heavyComputation(props.value);
   }, [props.value]);
   ```

2. **批量更新**
   ```typescript
   const batchUpdate = (changes: NodeChange[]) => {
     useCircuitStore.setState(state => ({
       nodes: applyChanges(changes, state.nodes)
     }));
   };
   ```

## 7. 调试指南

### 7.1 开发工具

1. **React DevTools**
   - 组件树检查
   - 性能分析

2. **状态调试**
   ```typescript
   useEffect(() => {
     console.log('State updated:', useCircuitStore.getState());
   }, []);
   ```

### 7.2 常见问题解决

1. **状态更新问题**
   - 检查 store 订阅
   - 验证更新函数调用

2. **组件渲染问题**
   - 使用 React.memo
   - 检查依赖项数组

## 8. 发布流程

### 8.1 构建检查

1. **类型检查**
   ```bash
   npm run type-check
   ```

2. **代码规范**
   ```bash
   npm run lint
   ```

### 8.2 发布步骤

1. 版本更新
2. 构建生产版本
3. 运行测试套件
4. 生成文档
5. 发布包

## 9. API 文档

### 9.1 Circuit Store API

```typescript
interface CircuitStore {
  // 状态查询
  getNodes(): Node[];
  getEdges(): Edge[];
  
  // 状态修改
  updateNode(id: string, data: any): void;
  addEdge(connection: Connection): void;
  
  // 模拟控制
  startSimulation(): void;
  stopSimulation(): void;
  step(): void;
}
```

### 9.2 组件 Props

```typescript
interface NodeProps {
  id: string;
  type: string;
  data: {
    label: string;
    [key: string]: any;
  };
  selected?: boolean;
}
```

## 10. 贡献指南

### 10.1 开发流程

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 发起 Pull Request

### 10.2 代码规范

1. **命名规范**
   - 组件使用 PascalCase
   - 函数使用 camelCase
   - 常量使用 UPPER_CASE

2. **文件组织**
   - 相关组件放在同一目录
   - 共享代码提取到 utils
   - 类型定义放在 types 目录

### 10.3 提交规范

```bash
feat: 添加新特性
fix: 修复问题
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```
# API 文档

## 汇编器 API

```typescript
class Assembler {
  // 将RISC-V汇编代码转换为机器码
  compile(code: string): { machineCode: number[], errors: Error[] }
  
  // 解析单条指令
  parseInstruction(instruction: string): { type: InstructionType, fields: Fields }
}
```

## 数据通路组件 API

```typescript
interface CircuitNode {
  id: string;
  type: string;          // 组件类型
  position: Position;    // 位置信息
  data: {
    label: string;      // 组件标签
    params: any;        // 组件参数
  };
}

interface CircuitEdge {
  id: string;
  source: string;       // 源节点ID
  target: string;       // 目标节点ID
  sourceHandle: string; // 源连接点
  targetHandle: string; // 目标连接点
}
```

## 组件使用说明

### 寄存器面板组件

```typescript
// 使用示例
import { RegPanel } from './components/RegPanel';

function App() {
  return (
    <RegPanel 
      registers={registers}        // 寄存器状态
      onRegisterChange={handler}  // 寄存器值变化回调
      highlightRegs={['x1','x2']} // 高亮显示的寄存器
    />
  );
}
```

### 数据通路编辑器组件

```typescript
// 使用示例
import { CircuitCanvas } from './components/CircuitCanvas';

function App() {
  return (
    <CircuitCanvas
      nodes={nodes}               // 节点数据
      edges={edges}               // 连接数据
      onNodesChange={handler}     // 节点变化回调
      onEdgesChange={handler}     // 连接变化回调
      onConnect={handler}         // 新建连接回调
    />
  );
}
```
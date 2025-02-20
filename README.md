# RISC-V 寄存器可视化工具

这是一个用于可视化展示 RISC-V 处理器寄存器状态和数据通路的 Web 应用程序。通过直观的界面，用户可以编写和运行 RISC-V 汇编代码，观察指令执行过程中寄存器状态的变化，以及在可视化的数据通路上跟踪指令的执行流程。

## 功能特性

- 实时显示 32 个 RISC-V 寄存器的状态
- 支持标准 RISC-V 寄存器命名约定
- 以十六进制格式显示寄存器值
- 响应式设计，支持各种屏幕尺寸
- 可视化的数据通路编辑器
- 支持 RISC-V 汇编代码编辑和执行
- 内存状态实时可视化

## 技术栈

- React：用于构建用户界面
- TypeScript：提供类型安全的代码开发
- Tailwind CSS：用于快速构建响应式界面
- Vite：现代化的构建工具
- ReactFlow：实现数据通路的可视化
- Zustand：状态管理

## 项目架构

项目主要由以下模块组成：

- **汇编器模块**：负责将 RISC-V 汇编代码转换为机器码
  - 支持 R、I、S、B、U、J 型指令的解析和生成
  - 提供完整的错误检查和提示

- **数据通路模拟器**：可视化展示 RISC-V 处理器的数据通路
  - 支持自定义数据通路组件
  - 实时展示数据流动
  - 可配置的组件参数

- **寄存器面板**：展示处理器寄存器的实时状态
  - 支持 32 个通用寄存器
  - 实时更新寄存器值

- **内存视图**：展示系统内存的状态
  - 可视化内存内容
  - 支持内存读写操作

## 快速开始

1. 克隆项目并安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

## 使用指南

### 代码编辑器

在代码编辑器标签页中，你可以：
- 编写 RISC-V 汇编代码
- 使用支持的指令集（R、I、S、B、U、J 型指令）
- 添加标签和注释
- 运行代码并观察执行结果

### 数据通路编辑器

在数据通路标签页中，你可以：
- 从组件库中拖拽组件到画布
- 连接组件创建数据通路
- 配置组件参数
- 观察数据流动

### 内存视图

在内存视图标签页中，你可以：
- 查看内存内容
- 监控内存变化
- 修改内存值

## 开发指南

### 项目结构

```
src/
├── assembler/        # RISC-V 汇编器实现
├── components/       # React 组件
├── store/           # 状态管理
├── types/           # TypeScript 类型定义
└── examples/        # 示例代码和配置
```

### 添加新功能

1. 添加新的指令支持：
   - 在 `assembler.ts` 中实现指令解析
   - 添加相应的测试用例

2. 扩展数据通路组件：
   - 在 `components/nodes` 中添加新组件
   - 在组件库中注册新组件

3. 添加新的可视化功能：
   - 创建新的 React 组件
   - 更新状态管理逻辑

## 测试

运行测试套件：
```bash
npm test
```




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

## 代码示例

### 基础的 RISC-V 程序示例

```assembly
# 计算斐波那契数列
.text
main:
    addi x1, x0, 1      # 初始化 f(0) = 1
    addi x2, x0, 1      # 初始化 f(1) = 1
    addi x3, x0, 10     # 计算前10个数

loop:
    add x4, x1, x2      # 计算下一个数
    mv x1, x2           # 更新f(n-2)
    mv x2, x4           # 更新f(n-1)
    addi x3, x3, -1     # 计数器减1
    bnez x3, loop       # 如果计数器不为0，继续循环
```

### 数据通路配置示例

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "register",
      "position": { "x": 100, "y": 100 },
      "data": { "label": "PC", "width": 32 }
    },
    {
      "id": "2",
      "type": "alu",
      "position": { "x": 250, "y": 100 },
      "data": { "operation": "add" }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "sourceHandle": "out",
      "targetHandle": "in1"
    }
  ]
}
```

## 部署指南

### 开发环境部署

1. 确保系统已安装 Node.js 16+ 和 npm 8+
2. 克隆项目并安装依赖：
   ```bash
   git clone <repository-url>
   cd project
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```



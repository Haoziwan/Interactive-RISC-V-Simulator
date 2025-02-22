# RISC-V 模拟器项目结构说明

## 1. 项目概述

本项目是一个基于 Web 的 RISC-V 指令集模拟器，采用 React + TypeScript 技术栈开发。项目实现了 RISC-V 处理器的指令执行、数据通路可视化以及内存/寄存器状态展示等功能。

## 2. 目录结构

```
├── docs/                 # 项目文档
├── src/                  # 源代码目录
│   ├── assembler/        # 汇编器模块
│   ├── components/       # React 组件
│   ├── store/           # 状态管理
│   ├── types/           # TypeScript 类型定义
│   └── utils/           # 工具函数
├── public/              # 静态资源
└── package.json         # 项目配置文件
```

## 3. 核心模块说明

### 3.1 汇编器模块 (src/assembler/)

- **assembler.ts**
  - 功能：RISC-V 汇编代码解析和编译
  - 支持 R、I、S、B、U、J 型指令
  - 实现指令编码和错误检查

- **assembler.test.ts**
  - 汇编器模块的单元测试文件
  - 测试各类指令的编码正确性

### 3.2 组件模块 (src/components/)

- **AssemblyEditor.tsx**
  - 汇编代码编辑器组件
  - 支持语法高亮和错误提示

- **CircuitCanvas.tsx**
  - 数据通路可视化画布
  - 实现组件拖拽和连线功能

- **ComponentLibrary.tsx**
  - 数据通路组件库
  - 提供各种处理器组件模板

- **ConfigPanel.tsx**
  - 配置面板组件
  - 用于调整模拟器参数

- **MemoryView.tsx**
  - 内存状态显示组件
  - 可视化内存数据

- **RegPanel.tsx**
  - 寄存器面板组件
  - 显示寄存器状态

### 3.3 状态管理 (src/store/)

- **circuitStore.ts**
  - 使用 Zustand 管理全局状态
  - 维护数据通路状态
  - 处理指令执行和数据更新

### 3.4 类型定义 (src/types/)

- **Circuit.ts**
  - 定义数据通路相关类型
  - 包含组件、连线等接口定义

## 4. 主要文件说明

### 4.1 入口文件

- **src/main.tsx**
  - 应用程序入口
  - 初始化 React 应用
  - 配置全局样式

- **src/App.tsx**
  - 根组件
  - 实现整体布局
  - 管理路由

### 4.2 配置文件

- **vite.config.ts**
  - Vite 构建工具配置
  - 定义开发服务器设置
  - 配置项目别名

- **tsconfig.json**
  - TypeScript 配置
  - 设置编译选项

## 5. 数据流向

1. **汇编代码编译流程**
   - AssemblyEditor 接收用户输入
   - assembler 模块编译代码
   - 生成的机器码存入内存

2. **指令执行流程**
   - CircuitCanvas 展示数据通路
   - store 管理执行状态
   - 组件状态实时更新

3. **状态更新流程**
   - store 统一管理状态
   - 组件订阅相关状态
   - 界面实时响应更新

## 6. 开发指南

### 6.1 添加新组件

1. 在 `src/components/` 下创建组件文件
2. 在 `ComponentLibrary.tsx` 中注册组件
3. 更新 `Circuit.ts` 中的类型定义

### 6.2 扩展指令集

1. 在 `assembler.ts` 中添加新指令定义
2. 实现指令编码逻辑
3. 在 `assembler.test.ts` 中添加测试用例

## 7. 示例代码

### 7.1 组件示例

```typescript
// src/components/nodes/ALUNode.tsx
import React from 'react';
import { NodeProps } from 'reactflow';

const ALUNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="alu-node">
      <div className="title">ALU</div>
      <div className="ports">
        <div className="input-ports">
          <div className="port">A</div>
          <div className="port">B</div>
        </div>
        <div className="output-ports">
          <div className="port">Result</div>
        </div>
      </div>
    </div>
  );
};

export default ALUNode;
```

### 7.2 状态管理示例

```typescript
// src/store/circuitStore.ts
import create from 'zustand';

interface CircuitState {
  nodes: Node[];
  edges: Edge[];
  updateNode: (id: string, data: any) => void;
}

export const useCircuitStore = create<CircuitState>((set) => ({
  nodes: [],
  edges: [],
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data } : node
      ),
    })),
}));
```

## 8. 调试工具

### 8.1 内置工具

- 控制台日志
- React Developer Tools
- 状态检查器

### 8.2 调试技巧

1. 使用 React Developer Tools 检查组件树
2. 通过状态检查器监控数据流
3. 利用控制台日志跟踪执行过程

## 9. 部署说明

### 9.1 开发环境

```bash
npm install    # 安装依赖
npm run dev    # 启动开发服务器
```

### 9.2 生产环境

```bash
npm run build  # 构建生产版本
npm run serve  # 预览生产版本
```

## 10. 注意事项

1. 遵循 TypeScript 类型定义
2. 保持组件的可复用性
3. 及时更新文档
4. 编写单元测试
5. 遵循代码规范
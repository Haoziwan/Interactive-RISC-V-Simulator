import { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { Assembler } from '../assembler/assembler';
import { InstructionFormatPanel } from './InstructionFormatPanel';
import Editor from '@monaco-editor/react';

export function AssemblyEditor() {
  const [error, setError] = useState<string | null>(null);
  
  // 使用store中的状态
  const editorCode = useCircuitStore((state) => state.editorCode);
  const setEditorCode = useCircuitStore((state) => state.setEditorCode);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const setAssembledInstructions = useCircuitStore((state) => state.setAssembledInstructions);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useCircuitStore((state) => state.nodes);

  const assembleCode = () => {
    setError(null);
    try {
      const assemblerInstance = new Assembler();
      const instructions = assemblerInstance.assemble(editorCode);
      
      // 将代码按行分割并过滤掉注释和空行
      const assemblyLines = editorCode
        .split('\n')
        .map(line => line.split('#')[0].trim())
        .filter(line => line && !line.endsWith(':'));
      
      // 将汇编指令与机器码对应
      const instructionsWithAssembly = instructions.map((inst, i) => ({
        ...inst,
        assembly: assemblyLines[i]
      }));
      
      setAssembledInstructions(instructionsWithAssembly);

      // 找到指令内存节点并更新其数据
      const instructionMemoryNode = nodes.find(node => node.type === 'instruction-memory');
      if (instructionMemoryNode) {
        updateNodeData(instructionMemoryNode.id, {
          instructions: instructionsWithAssembly.map((inst: { hex: string }) => inst.hex),
          pc: 0
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('汇编过程中发生未知错误');
      }
    }
  };

  const loadTestProgram = (programType: 'sort' | 'fibonacci' | 'gcd') => {
    const programs = {
      sort: `# 冒泡排序程序
# 对内存中的5个数字进行排序
# 初始数据在内存0-16中

# 外层循环 i 从 4 到 1
addi x1, x0, 4     # i = 4

loop_i:
beq x1, x0, end    # if i == 0, 结束排序
addi x2, x0, 0     # j = 0

# 内层循环 j 从 0 到 i-1
loop_j:
beq x2, x1, next_i # if j == i, 进入下一轮外层循环

# 加载相邻元素
slli x3, x2, 2     # x3 = j * 4
lw x4, 0(x3)       # 加载 arr[j]
lw x5, 4(x3)       # 加载 arr[j+1]

# 比较并交换
bge x4, x5, skip   # if arr[j] >= arr[j+1], 跳过交换
add x6, x0, x4     # temp = arr[j]
add x4, x0, x5     # arr[j] = arr[j+1]
add x5, x0, x6     # arr[j+1] = temp
sw x4, 0(x3)       # 保存 arr[j]
sw x5, 4(x3)       # 保存 arr[j+1]

skip:
addi x2, x2, 1     # j++
jal x0, loop_j     # 继续内层循环

next_i:
addi x1, x1, -1    # i--
jal x0, loop_i     # 继续外层循环

end:`,
      fibonacci: `# 斐波那契数列程序
# 计算斐波那契数列的前n个数
# n存储在x1中，结果存储在内存中

# 初始化
addi x1, x0, 10    # n = 10 (计算前10个数)
addi x2, x0, 0     # 地址索引
addi x3, x0, 0     # f(n-2)
addi x4, x0, 1     # f(n-1)
addi x5, x0, 0     # 当前计算的f(n)

# 存储前两个数
sw x3, 0(x2)       # 存储f(0)
addi x2, x2, 4     # 地址+4
sw x4, 0(x2)       # 存储f(1)
addi x2, x2, 4     # 地址+4
addi x6, x0, 2     # i = 2

loop:
beq x6, x1, end    # if i == n, 结束

# 计算f(n) = f(n-1) + f(n-2)
add x5, x3, x4     # f(n) = f(n-2) + f(n-1)
sw x5, 0(x2)       # 存储f(n)

# 更新变量
add x3, x0, x4     # f(n-2) = f(n-1)
add x4, x0, x5     # f(n-1) = f(n)
addi x2, x2, 4     # 地址+4
addi x6, x6, 1     # i++
jal x0, loop       # 继续循环

end:`,
      gcd: `# GCD程序
# 计算两个数的最大公约数
# 输入：x1 = 48, x2 = 36
# 使用辗转相除法

# 初始化输入
addi x1, x0, 48    # a = 48
addi x2, x0, 36    # b = 36

loop:
beq x2, x0, end    # if b == 0, 结束

# 计算 a % b
add x3, x0, x1     # x3 = a
add x4, x0, x2     # x4 = b (除数)

divide:
blt x3, x4, next   # if a < b, 结束除法
sub x3, x3, x4     # a = a - b
jal x0, divide     # 继续除法

next:
add x1, x0, x2     # a = b
add x2, x0, x3     # b = a % b
jal x0, loop       # 继续循环

end:`
    };
    setEditorCode(programs[programType]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full">
        {/* 左侧编辑器部分 */}
        <div className="w-1/2 p-4 border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">汇编代码编辑器</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.txt,.s';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const content = e.target?.result as string;
                        setEditorCode(content);
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                title="导入.txt或.s格式的汇编代码文件"
              >
                导入程序
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([editorCode], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'assembly_code.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                title="将当前编辑器中的代码保存为文本文件"
              >
                导出程序
              </button>
              <select
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                onChange={(e) => loadTestProgram(e.target.value as 'sort' | 'fibonacci' | 'gcd')}
                defaultValue=""
              >
                <option value="" disabled>加载示例程序</option>
                <option value="sort">排序程序</option>
                <option value="fibonacci">斐波那契程序</option>
                <option value="gcd">GCD程序</option>
              </select>
              <button
                onClick={assembleCode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                汇编代码
              </button>
            </div>
          </div>
          
          <Editor
            height="calc(100vh - 200px)"
            defaultLanguage="plaintext"
            value={editorCode}
            onChange={(value) => setEditorCode(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              renderWhitespace: 'all',
            }}
          />

          <InstructionFormatPanel />
        </div>

        {/* 右侧结果部分 */}
        <div className="w-1/2 p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-red-600 font-semibold mb-2">错误信息</h3>
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">汇编结果</h3>
              {assembledInstructions.length > 0 && (
                <button
                  onClick={() => {
                    const machineCode = assembledInstructions.map(inst => inst.hex).join('\n');
                    const blob = new Blob([machineCode], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'machine_code.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  导出机器码
                </button>
              )}
            </div>

            <div className="overflow-auto h-[calc(100vh-200px)]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium">地址</th>
                    <th className="text-left py-2 px-4 font-medium">机器码</th>
                    <th className="text-left py-2 px-4 font-medium">汇编指令</th>
                  </tr>
                </thead>
                <tbody>
                  {assembledInstructions.length > 0 ? (
                    assembledInstructions.map((inst, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2 px-4 font-mono text-gray-600">
                          {`0x${(i * 4).toString(16).padStart(8, '0')}`}
                        </td>
                        <td className="py-2 px-4 font-mono text-blue-600">{inst.hex}</td>
                        <td className="py-2 px-4 font-mono">{inst.assembly}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        暂无汇编结果，请编写代码并点击"汇编代码"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
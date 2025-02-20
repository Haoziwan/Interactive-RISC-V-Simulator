import { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { Assembler } from '../assembler/assembler';

export function AssemblyEditor() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useCircuitStore((state) => state.nodes);
  const [assembledInstructions, setAssembledInstructions] = useState<Array<{hex: string; binary: string; assembly?: string}>>([]);
  const [labels, setLabels] = useState<Record<string, number>>({});

  const assembleCode = () => {
    setError(null);
    setAssembledInstructions([]);
    setLabels({});
    try {
      const assemblerInstance = new Assembler();
      const instructions = assemblerInstance.assemble(code);
      // 将代码按行分割并过滤掉注释和空行
      const assemblyLines = code
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
# 初始数据在内存地址0-16中

# 外层循环 i 从 4 到 1
addi x1, x0, 4      # i = 4

loop_i:
beq x1, x0, end     # if i == 0, 结束排序
addi x2, x0, 0      # j = 0

# 内层循环 j 从 0 到 i-1
loop_j:
beq x2, x1, next_i  # if j == i, 进入下一轮外层循环

# 加载相邻元素
slli x3, x2, 2      # x3 = j * 4
lw x4, 0(x3)        # 加载 arr[j]
lw x5, 4(x3)        # 加载 arr[j+1]

# 比较并交换
bge x4, x5, swap    # if arr[j] > arr[j+1], 交换
beq x0, x0, next_j  # 否则继续循环

swap:
sw x5, 0(x3)        # arr[j] = arr[j+1]
sw x4, 4(x3)        # arr[j+1] = arr[j]

next_j:
addi x2, x2, 1      # j++
beq x0, x0, loop_j

next_i:
addi x1, x1, -1     # i--
beq x0, x0, loop_i

end:`,
      fibonacci: `# 斐波那契数列程序
# 计算第n个斐波那契数
# n存储在x1中，结果存储在x2中

addi x1, x0, 10     # 计算第10个斐波那契数
addi x2, x0, 1      # f(1) = 1
addi x3, x0, 1      # f(2) = 1
addi x4, x0, 2      # i = 2

fib_loop:
beq x4, x1, fib_end # if i == n, 结束计算
add x5, x2, x3      # next = f(i-1) + f(i-2)
add x2, x3, x0      # f(i-1) = f(i)
add x3, x5, x0      # f(i) = next
addi x4, x4, 1      # i++
beq x0, x0, fib_loop

fib_end:`,
      gcd: `# GCD程序
# 计算两个数的最大公约数
# 输入：x1 = a, x2 = b
# 输出：x1 = gcd(a,b)

addi x1, x0, 48     # a = 48
addi x2, x0, 36     # b = 36

gcd_loop:
beq x2, x0, gcd_end # if b == 0, 结束计算
add x3, x2, x0      # temp = b
# 使用减法实现除法运算
sub_loop:
blt x1, x2, sub_end # if a < b, 结束减法
sub x1, x1, x2      # a = a - b
beq x0, x0, sub_loop # 继续减法

sub_end:
add x2, x1, x0      # b = a (余数)
add x1, x3, x0      # a = temp
beq x0, x0, gcd_loop # 继续GCD循环

gcd_end:`,
      test: `# RV32I指令集完整性测试程序
# 测试所有指令类型的功能

# 1. 算术运算指令测试
start_arithmetic:
addi x1, x0, 10      # x1 = 10
addi x2, x0, 5       # x2 = 5
add x3, x1, x2       # x3 = x1 + x2 = 15
sub x4, x1, x2       # x4 = x1 - x2 = 5

# 2. 逻辑运算指令测试
start_logical:
ori x5, x0, 0xff     # x5 = 0xff
andi x6, x5, 0x0f    # x6 = 0x0f
xori x7, x5, 0xff    # x7 = 0

# 3. 移位指令测试
start_shift:
addi x8, x0, 8       # x8 = 8
slli x9, x8, 2       # x9 = x8 << 2 = 32
srli x10, x9, 1      # x10 = x9 >> 1 = 16
srai x11, x9, 2      # x11 = x9 >> 2 (算术) = 8

# 4. 比较指令测试
start_compare:
slti x12, x1, 20     # x12 = (x1 < 20) ? 1 : 0
slt x13, x2, x1      # x13 = (x2 < x1) ? 1 : 0

# 5. 内存访问指令测试
start_memory:
addi x14, x0, 100    # 基址 = 100
sw x1, 0(x14)        # 存储 x1
sw x2, 4(x14)        # 存储 x2
lw x15, 0(x14)       # 加载到 x15
lw x16, 4(x14)       # 加载到 x16

# 6. 分支指令测试
start_branch:
beq x1, x1, branch1  # 应该跳转
beq x0, x1, fail     # 不应该执行

branch1:
bne x1, x2, branch2  # 应该跳转
beq x0, x1, fail     # 不应该执行

branch2:
blt x2, x1, branch3  # 应该跳转
beq x0, x1, fail     # 不应该执行

branch3:
bge x1, x2, branch4  # 应该跳转
beq x0, x1, fail     # 不应该执行

branch4:

# 7. 跳转指令测试
start_jump:
jal x17, jump1       # 跳转并链接
beq x0, x1, fail     # 不应该执行

jump1:
jalr x18, x17, 8     # 间接跳转

# 8. U型指令测试
start_utype:
lui x19, 0x12345     # 加载高位立即数
auipc x20, 0x1000    # PC相对地址

# 9. 综合测试
start_complex:
addi x21, x0, 1      # x21 = 1
addi x22, x0, 2      # x22 = 2
add x23, x21, x22    # x23 = 3
sw x23, 8(x14)       # 存储结果
lw x24, 8(x14)       # 加载结果
beq x23, x24, pass   # 如果相等则通过

fail:
addi x31, x0, -1     # 测试失败标记
beq x0, x0, end

pass:
addi x31, x0, 1      # 测试通过标记

end:`
    };
    setCode(programs[programType]);
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">RISC-V 汇编代码</h2>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            onChange={(e) => loadTestProgram(e.target.value as 'sort' | 'fibonacci' | 'gcd')}
            defaultValue=""
            title="选择示例程序"
            aria-label="选择要加载的示例程序"
          >
            <option value="" disabled>加载示例程序</option>
            <option value="sort">排序程序</option>
            <option value="fibonacci">斐波那契程序</option>
            <option value="gcd">GCD程序</option>
          </select>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={assembleCode}
          >
            汇编并加载
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <textarea
              className="w-full h-[calc(100vh-400px)] p-2 font-mono text-sm border rounded mb-4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="# 在此输入RISC-V汇编代码"
            />
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <h4 className="font-semibold">支持的指令格式：</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium">R型指令</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>add rd, rs1, rs2</li>
                    <li>sub rd, rs1, rs2</li>
                    <li>and/or/xor rd, rs1, rs2</li>
                    <li>sll/srl/sra rd, rs1, rs2</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">I型指令</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>addi rd, rs1, imm</li>
                    <li>andi/ori/xori rd, rs1, imm</li>
                    <li>lw rd, offset(rs1)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">S型指令</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>sw rs2, offset(rs1)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">B型指令</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>beq/bne rs1, rs2, offset</li>
                    <li>blt/bge rs1, rs2, offset</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">U型指令</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>lui rd, imm</li>
                    <li>auipc rd, imm</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">J型指令</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>jal rd, offset</li>
                    <li>jalr rd, rs1, offset</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                提示：每行一条指令，使用逗号分隔操作数
              </div>
            </div>
          </div>
        </div>
        <div className="w-[500px] space-y-4">
          {error && (
            <div className="p-4 text-red-500 bg-red-50 rounded border border-red-200">
              <h4 className="font-semibold mb-2">错误信息</h4>
              {error}
            </div>
          )}
          {assembledInstructions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col h-[calc(100vh-200px)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">汇编结果</h3>
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
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="py-2 px-4 w-1/5 sticky top-0 bg-gray-50">地址</th>
                      <th className="py-2 px-4 w-1/4 sticky top-0 bg-gray-50">机器码</th>
                      <th className="py-2 px-4 sticky top-0 bg-gray-50">汇编指令</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {assembledInstructions.map((inst, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-4 text-gray-600">{`0x${(i * 4).toString(16).padStart(8, '0')}`}</td>
                        <td className="py-2 px-4 text-blue-600">{inst.hex}</td>
                        <td className="py-2 px-4 text-gray-800">{inst.assembly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
# 斐波那契数列程序（纯寄存器版本）
# 计算斐波那契数列的前10个数
# 结果存储在寄存器x10-x19中

# 初始化
addi x1, x0, 10    # n = 10 (计算前10个数)
addi x2, x0, 0     # f(n-2)
addi x3, x0, 1     # f(n-1)
addi x4, x0, 0     # 当前计算的f(n)
addi x5, x0, 2     # i = 2

# 存储前两个数到结果寄存器
add x10, x0, x2    # 存储f(0)
add x11, x0, x3    # 存储f(1)

loop:
beq x5, x1, end    # if i == n, 结束

# 计算f(n) = f(n-1) + f(n-2)
add x4, x2, x3     # f(n) = f(n-2) + f(n-1)

# 存储结果到对应的寄存器
add x6, x5, x10    # 计算目标寄存器的偏移
add x4, x4, x0     # 将结果存入对应寄存器

# 更新变量
add x2, x0, x3     # f(n-2) = f(n-1)
add x3, x0, x4     # f(n-1) = f(n)
addi x5, x5, 1     # i++
jal x0, loop       # 继续循环

end:
# 最终结果存储在x10-x19中，每个寄存器对应一个斐波那契数
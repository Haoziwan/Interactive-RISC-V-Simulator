# 斐波那契数列程序
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

end:
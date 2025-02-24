# B型指令测试程序
# 测试所有B型指令的基本功能和边界条件

# 初始化测试数据
addi x1, x0, 10      # x1 = 10
addi x2, x0, 20      # x2 = 20
addi x3, x0, -5      # x3 = -5
addi x4, x0, 10      # x4 = 10 (与x1相等)

# 测试相等/不等跳转
beq x1, x4, equal     # 应该跳转，因为x1 = x4
add x5, x0, x0        # 如果没跳转，x5 = 0
equal:
addi x5, x0, 1        # x5 = 1

bne x1, x2, not_equal # 应该跳转，因为x1 ≠ x2
add x6, x0, x0        # 如果没跳转，x6 = 0
not_equal:
addi x6, x0, 1        # x6 = 1

# 测试小于/大于等于跳转
blt x1, x2, less_than  # 应该跳转，因为10 < 20
add x7, x0, x0        # 如果没跳转，x7 = 0
less_than:
addi x7, x0, 1        # x7 = 1

bge x2, x1, greater_eq # 应该跳转，因为20 ≥ 10
add x8, x0, x0        # 如果没跳转，x8 = 0
greater_eq:
addi x8, x0, 1        # x8 = 1

# 测试无符号比较跳转
bltu x1, x2, u_less    # 应该跳转，因为10 < 20 (无符号)
add x9, x0, x0        # 如果没跳转，x9 = 0
u_less:
addi x9, x0, 1        # x9 = 1

bgeu x2, x1, u_greater # 应该跳转，因为20 ≥ 10 (无符号)
add x10, x0, x0       # 如果没跳转，x10 = 0
u_greater:
addi x10, x0, 1       # x10 = 1

# 测试负数比较
blt x3, x1, neg_less   # 应该跳转，因为-5 < 10
add x11, x0, x0       # 如果没跳转，x11 = 0
neg_less:
addi x11, x0, 1       # x11 = 1

# 测试不跳转的情况
beq x1, x2, no_jump    # 不应该跳转，因为x1 ≠ x2
addi x12, x0, 1       # x12 = 1
no_jump:
add x0, x0, x0        # NOP

# 测试向后跳转
addi x13, x0, 3       # x13 = 3 (计数器)
loop_back:
addi x13, x13, -1     # x13 = x13 - 1
bne x13, x0, loop_back # 如果x13 ≠ 0，向后跳转

# 完成测试
add x0, x0, x0        # NOP指令，标记测试结束
# GCD程序
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

end:
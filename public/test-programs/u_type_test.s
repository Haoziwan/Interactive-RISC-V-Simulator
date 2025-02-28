# U型指令测试程序
# 测试所有U型指令的基本功能和边界条件

# 测试加载高位立即数指令(lui)
lui x1, 0x12345      # x1 = 0x12345000
lui x2, 0xFFFFF      # x2 = 0xFFFFF000 (最大20位立即数)
lui x3, 0           # x3 = 0 (最小值)

# 测试PC相对加载高位立即数指令(auipc)
auipc x4, 0x12345   # x4 = PC + 0x12345000
auipc x5, 0         # x5 = PC
auipc x6, 0xFFFFF   # x6 = PC + 0xFFFFF000

# 测试与其他指令组合使用
lui x7, 0x12345     # 设置高20位
addi x7, x7, 0x678  # 设置低12位，x7 = 0x12345678

lui x8, 0xFFFFF     # 设置高20位为负数
addi x8, x8, -1     # 设置低12位，x8 = 0xFFFFFFFF (-1)

# 测试auipc与跳转指令组合
auipc x9, 0         # 获取当前PC
addi x10, x9, 16    # 计算目标地址（当前PC+16）
jalr x0, x10, 0     # 跳转到计算的地址

# 完成测试
add x0, x0, x0      # NOP指令，标记测试结束
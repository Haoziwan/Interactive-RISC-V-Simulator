# RISC-V指令类型全面测试程序

# 初始化一些寄存器
start:
    addi x1, x0, 10      # x1 = 10
    addi x2, x0, 20      # x2 = 20
    addi x3, x0, 30      # x3 = 30

# 1. R型指令测试（寄存器-寄存器操作）
    add x4, x1, x2       # x4 = x1 + x2 = 30
    sub x5, x3, x1       # x5 = x3 - x1 = 20
    and x6, x2, x3       # x6 = x2 & x3
    or  x7, x1, x2       # x7 = x1 | x2
    xor x8, x2, x3       # x8 = x2 ^ x3
    slt x9, x1, x2       # x9 = (x1 < x2) ? 1 : 0
    sltu x10, x2, x3     # x10 = (x2 < x3) ? 1 : 0

# 2. I型指令测试（立即数操作）
    addi x11, x1, 5      # x11 = x1 + 5 = 15
    andi x12, x2, 0xf    # x12 = x2 & 0xf
    ori  x13, x3, 0x7    # x13 = x3 | 0x7
    xori x14, x1, 0x3    # x14 = x1 ^ 0x3
    slti x15, x2, 25     # x15 = (x2 < 25) ? 1 : 0
    sltiu x16, x3, 35    # x16 = (x3 < 35) ? 1 : 0

# 3. S型指令测试（存储指令）
    sw x1, 0(x2)         # 将x1的值存储到x2+0的内存位置
    sw x2, 4(x3)         # 将x2的值存储到x3+4的内存位置

# 4. I型加载指令测试
    lw x17, 0(x2)        # 从x2+0的内存位置加载到x17
    lw x18, 4(x3)        # 从x3+4的内存位置加载到x18

# 5. B型指令测试（条件分支）
test_branch:
    beq x1, x11, skip1   # 如果x1 == x11，跳转到skip1
    addi x19, x0, 1      # 不相等时执行
skip1:
    bne x2, x3, skip2    # 如果x2 != x3，跳转到skip2
    addi x20, x0, 2      # 相等时执行
skip2:
    blt x1, x2, skip3    # 如果x1 < x2，跳转到skip3
    addi x21, x0, 3      # x1不小于x2时执行
skip3:
    bge x3, x2, skip4    # 如果x3 >= x2，跳转到skip4
    addi x22, x0, 4      # x3小于x2时执行
skip4:

# 6. U型指令测试（高位立即数）
    lui x23, 0x12345     # x23 = 0x12345000
    auipc x24, 0x1000    # x24 = PC + 0x1000000

# 7. J型指令测试（跳转）
    jal x25, jump_target # 跳转到jump_target，并将返回地址保存在x25
    addi x26, x0, 5      # 这条指令会被跳过

jump_target:
    jalr x27, x25, 0     # 使用保存的返回地址跳回

# 程序结束
end:
    addi x31, x0, -1     # 设置结束标记
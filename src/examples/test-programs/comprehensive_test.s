# 全面的RISC-V汇编测试程序

# 1. R型指令测试
start:
    add x1, x2, x3      # 基本算术运算
    sub x4, x5, x6
    and x7, x8, x9      # 逻辑运算
    or  x10, x11, x12
    xor x13, x14, x15
    sll x16, x17, x18   # 移位运算
    srl x19, x20, x21
    sra x22, x23, x24
    slt x25, x26, x27   # 比较运算
    sltu x28, x29, x30

# 2. I型指令测试
    addi x1, x2, 100    # 立即数算术运算
    andi x3, x4, 0xff   # 立即数逻辑运算
    ori  x5, x6, 0x0f
    xori x7, x8, 0xf0
    slti x9, x10, -10   # 立即数比较
    sltiu x11, x12, 20
    slli x13, x14, 4    # 立即数移位
    srli x15, x16, 4
    srai x17, x18, 4

# 3. S型指令测试
    sw x1, 12(x2)       # 存储字
    sw x3, -8(x4)

# 4. 加载指令测试
    lw x5, 16(x6)       # 加载字
    lw x7, -4(x8)

# 5. B型指令测试
loop_start:
    beq x1, x2, loop_end    # 相等跳转
    bne x3, x4, loop_start  # 不等跳转
    blt x5, x6, loop_mid    # 小于跳转
    bge x7, x8, loop_end    # 大于等于跳转

# 6. U型指令测试
loop_mid:
    lui x1, 0xfffff     # 加载高位立即数
    auipc x2, 0x12345   # PC相对地址加载

# 7. J型指令测试
    jal x1, jump_target # 跳转并链接

# 8. 伪指令测试
    li t0, 1234         # 加载立即数
    li t1, -5678
    mv t2, t3           # 寄存器移动
    j loop_end          # 无条件跳转
    nop                 # 空操作

# 9. 寄存器别名测试
jump_target:
    add zero, ra, sp    # 使用ABI名称
    add gp, tp, t0
    add t1, t2, s0
    add s1, a0, a1
    add a2, a3, a4
    add a5, a6, a7
    add s2, s3, s4
    add s5, s6, s7
    add s8, s9, s10
    add s11, t3, t4
    add t5, t6, zero

# 10. 混合测试
loop_end:
    add x0, ra, x2      # 混合使用数字和ABI名称
    addi t0, x6, 100    # 混合格式的立即数运算
    sw t1, 8(s0)        # 混合格式的内存操作

# 程序结束
    ret                 # 返回
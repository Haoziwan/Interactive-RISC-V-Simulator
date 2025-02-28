# 测试所有寄存器的识别
# 使用数字格式 (x0-x31)
add x0, x1, x2  # 测试x0-x2
add x3, x4, x5  # 测试x3-x5
add x6, x7, x8  # 测试x6-x8
add x9, x10, x11  # 测试x9-x11
add x12, x13, x14  # 测试x12-x14
add x15, x16, x17  # 测试x15-x17
add x18, x19, x20  # 测试x18-x20
add x21, x22, x23  # 测试x21-x23
add x24, x25, x26  # 测试x24-x26
add x27, x28, x29  # 测试x27-x29
add x30, x31, x0  # 测试x30-x31

# 使用ABI名称
add zero, ra, sp    # 测试zero, ra, sp
add gp, tp, t0      # 测试gp, tp, t0
add t1, t2, s0      # 测试t1, t2, s0/fp
add s1, a0, a1      # 测试s1, a0, a1
add a2, a3, a4      # 测试a2, a3, a4
add a5, a6, a7      # 测试a5, a6, a7
add s2, s3, s4      # 测试s2, s3, s4
add s5, s6, s7      # 测试s5, s6, s7
add s8, s9, s10     # 测试s8, s9, s10
add s11, t3, t4     # 测试s11, t3, t4
add t5, t6, zero    # 测试t5, t6

# 混合使用数字格式和ABI名称
add x0, ra, x2      # 混合使用示例1
add t0, x6, s1      # 混合使用示例2
add a0, x11, t3     # 混合使用示例3
add s5, x21, zero   # 混合使用示例4
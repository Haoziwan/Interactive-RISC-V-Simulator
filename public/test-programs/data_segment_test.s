# RISC-V 数据段测试程序

.data
# 定义各种类型的数据
var1: .word 10, 20, 30, 40      # 定义4个字（32位）
var2: .half 1, 2, 3, 4, 5       # 定义5个半字（16位）
var3: .byte 65, 66, 67, 68, 0   # 定义5个字节（8位），ASCII码"ABCD"和结束符
str1: .ascii "Hello"            # 定义ASCII字符串，不带结束符
str2: .asciz "World"            # 定义ASCII字符串，带结束符

.text
# 代码段开始
main:
    # 加载数据到寄存器
    lui x1, 0x10000     # 假设数据段基址为0x10000000
    
    # 加载word数据
    lw x2, 0(x1)        # 加载var1的第一个字
    lw x3, 4(x1)        # 加载var1的第二个字
    
    # 加载half数据
    lh x4, 16(x1)       # 加载var2的第一个半字
    lh x5, 18(x1)       # 加载var2的第二个半字
    
    # 加载byte数据
    lb x6, 26(x1)       # 加载var3的第一个字节 (A)
    lb x7, 27(x1)       # 加载var3的第二个字节 (B)
    
    # 字符串处理示例
    addi x8, x1, 31     # str1的起始地址
    addi x9, x1, 36     # str2的起始地址
    
    # 计算字符串长度示例
    addi x10, x0, 0     # 初始化计数器
    
str_len_loop:
    lb x11, 0(x9)       # 加载str2的当前字符
    beq x11, x0, end    # 如果是结束符，跳转到结束
    addi x9, x9, 1      # 指针移动到下一个字符
    addi x10, x10, 1    # 计数器加1
    j str_len_loop      # 继续循环
    
end:
    # 此时x10包含str2的长度
    ret                 # 返回
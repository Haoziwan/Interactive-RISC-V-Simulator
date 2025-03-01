# 冒泡排序程序
# 对5个寄存器（x10-x14）中的数字进行排序

# 初始化测试数据
addi x10, x0, 5     # x10 = 5
addi x11, x0, 3     # x11 = 3
addi x12, x0, 4     # x12 = 4
addi x13, x0, 1     # x13 = 1
addi x14, x0, 2     # x14 = 2

# 外层循环 i 从 4 到 1
addi x1, x0, 4      # i = 4

loop_i:
beq x1, x0, end     # if i == 0, 结束排序
addi x2, x0, 0      # j = 0

# 内层循环 j 从 0 到 i-1
loop_j:
beq x2, x1, next_i  # if j == i, 进入下一轮外层循环

# 加载相邻元素到临时寄存器
addi x3, x2, 10     # x3 = j + 10（基址）
addi x4, x3, 1      # x4 = (j + 1) + 10

# 使用临时寄存器x5, x6获取要比较的值
add x5, x0, x3      # 获取第一个值的寄存器编号
add x6, x0, x4      # 获取第二个值的寄存器编号

# 比较并交换（使用x7和x8作为临时存储）
bge x5, x6, skip    # if arr[j] >= arr[j+1], 跳过交换
add x7, x0, x5      # temp = arr[j]
add x5, x0, x6      # arr[j] = arr[j+1]
add x6, x0, x7      # arr[j+1] = temp

skip:
addi x2, x2, 1     # j++
jal x0, loop_j      # 继续内层循环

next_i:
addi x1, x1, -1    # i--
jal x0, loop_i      # 继续外层循环

end:
# 排序结果存储在x10-x14中，从小到大排序
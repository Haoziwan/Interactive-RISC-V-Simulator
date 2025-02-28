# 冒泡排序程序
# 对内存中的5个数字进行排序
# 初始数据在内存0-16中

# 外层循环 i 从 4 到 1
addi x1, x0, 4     # i = 4

loop_i:
beq x1, x0, end    # if i == 0, 结束排序
addi x2, x0, 0     # j = 0

# 内层循环 j 从 0 到 i-1
loop_j:
beq x2, x1, next_i # if j == i, 进入下一轮外层循环

# 加载相邻元素
slli x3, x2, 2     # x3 = j * 4
lw x4, 0(x3)       # 加载 arr[j]
lw x5, 4(x3)       # 加载 arr[j+1]

# 比较并交换
bge x4, x5, skip   # if arr[j] >= arr[j+1], 跳过交换
add x6, x0, x4     # temp = arr[j]
add x4, x0, x5     # arr[j] = arr[j+1]
add x5, x0, x6     # arr[j+1] = temp
sw x4, 0(x3)       # 保存 arr[j]
sw x5, 4(x3)       # 保存 arr[j+1]

skip:
addi x2, x2, 1     # j++
jal x0, loop_j     # 继续内层循环

next_i:
addi x1, x1, -1    # i--
jal x0, loop_i     # 继续外层循环

end:
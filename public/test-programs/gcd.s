# GCD Program
# Calculate the Greatest Common Divisor of two numbers
# Input: x1 = 48, x2 = 36
# Using the Euclidean algorithm

# Initialize input
addi x1, x0, 48    # a = 48
addi x2, x0, 36    # b = 36

loop:
beq x2, x0, end    # if b == 0, end

# Calculate a % b
add x3, x0, x1     # x3 = a
add x4, x0, x2     # x4 = b (divisor)

divide:
blt x3, x4, next   # if a < b, end division
sub x3, x3, x4     # a = a - b
jal x0, divide     # continue division

next:
add x1, x0, x2     # a = b
add x2, x0, x3     # b = a % b
jal x0, loop       # continue loop

end:
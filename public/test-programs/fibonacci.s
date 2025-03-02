# Fibonacci Sequence Program
# Calculate the first n numbers in the Fibonacci sequence
# n is stored in x1, results are stored in memory

# Initialization
addi x1, x0, 10    # n = 10 (calculate first 10 numbers)
addi x2, x0, 0     # address index
addi x3, x0, 0     # f(n-2)
addi x4, x0, 1     # f(n-1)
addi x5, x0, 0     # current f(n)

# Store first two numbers
sw x3, 0(x2)       # store f(0)
addi x2, x2, 4     # address + 4
sw x4, 0(x2)       # store f(1)
addi x2, x2, 4     # address + 4
addi x6, x0, 2     # i = 2

loop:
beq x6, x1, end    # if i == n, end

# Calculate f(n) = f(n-1) + f(n-2)
add x5, x3, x4     # f(n) = f(n-2) + f(n-1)
sw x5, 0(x2)       # store f(n)

# Update variables
add x3, x0, x4     # f(n-2) = f(n-1)
add x4, x0, x5     # f(n-1) = f(n)
addi x2, x2, 4     # address + 4
addi x6, x6, 1     # i++
jal x0, loop       # continue loop

end:
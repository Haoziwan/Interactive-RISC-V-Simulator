# Fibonacci Sequence Program
# Calculate the first n numbers in the Fibonacci sequence
# ecall is not supported in pipeline datapath
.data
n:          .word 10              # Number of Fibonacci terms
fib_array:  .space 400            # Space for 100 integers (4 * 100 bytes)

.text
.globl main
main:
    # Load the value of n from memory
    la x5, n                      # x5 = address of n
    lw x6, 0(x5)                  # x6 = n

    # Initialize Fibonacci values: F(0) = 0, F(1) = 1
    li x7, 0                      # x7 = F(0)
    li x8, 1                      # x8 = F(1)

    # x9 holds base address of fib_array
    la x9, fib_array

    # Store F(0) to fib_array[0]
    sw x7, 0(x9)

    # If n >= 2, store F(1)
    li x10, 1
    bge x6, x10, store_f1
    j print_all

store_f1:
    sw x8, 4(x9)                  # fib_array[1] = 1

    li x11, 2                     # x11 = loop index i = 2

fib_loop:
    bge x11, x6, print_all        # if i >= n, jump to print

    # Compute F(i) = F(i-1) + F(i-2)
    add x12, x7, x8              # x12 = x7 + x8

    # Store F(i) at fib_array[i]
    slli x13, x11, 2             # x13 = i * 4
    add x14, x9, x13             # x14 = fib_array + i * 4
    sw x12, 0(x14)               # fib_array[i] = x12

    # Update previous values
    mv x7, x8                    # x7 = F(i-1)
    mv x8, x12                   # x8 = F(i)

    addi x11, x11, 1             # i++

    j fib_loop

# Print all results
print_all:
    li x11, 0                    # x11 = i = 0

print_loop:
    bge x11, x6, exit            # if i >= n, exit

    slli x13, x11, 2             # x13 = i * 4
    add x14, x9, x13             # x14 = &fib_array[i]
    lw x10, 0(x14)               # x10 = fib_array[i]

    # Print integer
    mv x10, x10                  # move to syscall argument (no alias)
    mv x17, x0                   # clear x17 (not used here)
    mv x10, x10                  # x10 = value to print
    li x17, 1                    # syscall code 1 = print_int
    ecall

    # Print newline
    li x10, 10                   # ASCII '\n'
    li x17, 11                   # syscall code 11 = print_char
    ecall

    addi x11, x11, 1
    j print_loop

# Exit program
exit:
    li x17, 10                   # syscall code 10 = exit
    ecall

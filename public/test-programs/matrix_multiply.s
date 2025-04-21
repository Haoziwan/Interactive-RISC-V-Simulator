# Matrix Multiplication Program
# This program multiplies two 3x3 matrices
# It demonstrates nested loops and 2D array manipulation

.data
# First 3x3 matrix (row-major order)
matrix_a:  .word 1, 2, 3
           .word 4, 5, 6
           .word 7, 8, 9

# Second 3x3 matrix (row-major order)
matrix_b:  .word 9, 8, 7
           .word 6, 5, 4
           .word 3, 2, 1

# Result 3x3 matrix (initially all zeros)
matrix_c:  .word 0, 0, 0
           .word 0, 0, 0
           .word 0, 0, 0

matrix_size: .word 3              # Size of the matrices (3x3)
row_msg:    .asciz "\nRow "
col_msg:    .asciz ", Col "
val_msg:    .asciz ": "

.text
.globl main
main:
    # Load matrix addresses and size
    la s0, matrix_a               # s0 = address of matrix A
    la s1, matrix_b               # s1 = address of matrix B
    la s2, matrix_c               # s2 = address of matrix C
    la t0, matrix_size
    lw s3, 0(t0)                  # s3 = matrix size (3)
    
    # Initialize loop counters
    li s4, 0                      # s4 = i = 0 (row index for A and C)
    
row_loop:
    bge s4, s3, multiply_done     # if i >= size, exit
    
    li s5, 0                      # s5 = j = 0 (column index for B and C)
    
col_loop:
    bge s5, s3, col_loop_end      # if j >= size, exit column loop
    
    li t0, 0                      # t0 = sum = 0 (for dot product)
    li s6, 0                      # s6 = k = 0 (inner loop index)
    
dot_product_loop:
    bge s6, s3, dot_product_done  # if k >= size, exit dot product loop
    
    # Calculate address of A[i][k]
    mul t1, s4, s3                # t1 = i * size
    add t1, t1, s6                # t1 = i * size + k
    slli t1, t1, 2                # t1 = (i * size + k) * 4
    add t1, s0, t1                # t1 = &A[i][k]
    lw t2, 0(t1)                  # t2 = A[i][k]
    
    # Calculate address of B[k][j]
    mul t1, s6, s3                # t1 = k * size
    add t1, t1, s5                # t1 = k * size + j
    slli t1, t1, 2                # t1 = (k * size + j) * 4
    add t1, s1, t1                # t1 = &B[k][j]
    lw t3, 0(t1)                  # t3 = B[k][j]
    
    # Multiply and add to sum
    mul t4, t2, t3                # t4 = A[i][k] * B[k][j]
    add t0, t0, t4                # sum += A[i][k] * B[k][j]
    
    addi s6, s6, 1                # k++
    j dot_product_loop
    
dot_product_done:
    # Store result in C[i][j]
    mul t1, s4, s3                # t1 = i * size
    add t1, t1, s5                # t1 = i * size + j
    slli t1, t1, 2                # t1 = (i * size + j) * 4
    add t1, s2, t1                # t1 = &C[i][j]
    sw t0, 0(t1)                  # C[i][j] = sum
    
    # Print result for this cell
    la a0, row_msg
    li a7, 4                      # Print string
    ecall
    
    mv a0, s4
    li a7, 1                      # Print integer (row)
    ecall
    
    la a0, col_msg
    li a7, 4                      # Print string
    ecall
    
    mv a0, s5
    li a7, 1                      # Print integer (column)
    ecall
    
    la a0, val_msg
    li a7, 4                      # Print string
    ecall
    
    mv a0, t0
    li a7, 1                      # Print integer (value)
    ecall
    
    addi s5, s5, 1                # j++
    j col_loop
    
col_loop_end:
    addi s4, s4, 1                # i++
    j row_loop
    
multiply_done:
    # Exit program
    li a7, 10                     # Exit
    ecall

# Matrix Multiplication Program 
# This program multiplies two 3x3 matrices and prints the result in a matrix layout

.data
# First 3x3 matrix (row-major order)
matrix_a:  .word 1, 2, 3
           .word 4, 5, 6
           .word 7, 8, 9

# Second 3x3 matrix (row-major order)
matrix_b:  .word 9, 8, 7
           .word 6, 5, 4
           .word 3, 2, 1

# Result 3x3 matrix (initialized to zeros)
matrix_c:  .word 0, 0, 0
           .word 0, 0, 0
           .word 0, 0, 0

matrix_size: .word 3             # Dimension of the matrices
space:       .asciz " "         # Space between printed elements
newline:     .asciz "\n"       # Newline at end of each row

.text
.globl main
main:
    # Load base addresses of matrices and size
    la   s0, matrix_a      # s0 = address of A
    la   s1, matrix_b      # s1 = address of B
    la   s2, matrix_c      # s2 = address of C
    la   t0, matrix_size
    lw   s3, 0(t0)         # s3 = matrix dimension (3)

    # Initialize row index i = 0
    li   s4, 0             # s4 = current row

row_loop:
    bge  s4, s3, finish    # if i >= size, done

    # Initialize column index j = 0
    li   s5, 0             # s5 = current column

col_loop:
    bge  s5, s3, end_row   # if j >= size, go to end of row

    # Compute dot product for C[i][j]
    li   t0, 0             # t0 = sum accumulator
    li   s6, 0             # s6 = inner index k

dot_product_loop:
    bge  s6, s3, dot_done  # if k >= size, dot product complete

    # Load A[i][k]
    mul  t1, s4, s3        # t1 = i * size
    add  t1, t1, s6        # t1 = i*size + k
    slli t1, t1, 2         # byte offset = (i*size+k)*4
    add  t1, s0, t1        # address of A[i][k]
    lw   t2, 0(t1)         # t2 = A[i][k]

    # Load B[k][j]
    mul  t1, s6, s3        # t1 = k * size
    add  t1, t1, s5        # t1 = k*size + j
    slli t1, t1, 2         # byte offset = (k*size+j)*4
    add  t1, s1, t1        # address of B[k][j]
    lw   t3, 0(t1)         # t3 = B[k][j]

    # Multiply and add
    mul  t4, t2, t3        # t4 = A[i][k] * B[k][j]
    add  t0, t0, t4        # sum += t4

    addi s6, s6, 1         # k++
    j    dot_product_loop

dot_done:
    # Store sum into C[i][j]
    mul  t1, s4, s3        # t1 = i * size
    add  t1, t1, s5        # t1 = i*size + j
    slli t1, t1, 2         # byte offset = (i*size+j)*4
    add  t1, s2, t1        # address of C[i][j]
    sw   t0, 0(t1)         # C[i][j] = sum

    # Print element value followed by a space
    mv   a0, t0            # move sum into a0
    li   a7, 1             # syscall: print integer
    ecall

    la   a0, space         # load address of space
    li   a7, 4             # syscall: print string
    ecall

    addi s5, s5, 1         # j++
    j    col_loop

end_row:
    # End of row: print newline
    la   a0, newline
    li   a7, 4             # syscall: print string
    ecall

    addi s4, s4, 1         # i++
    j    row_loop

finish:
    # Exit program
    li   a7, 10            # syscall: exit
    ecall

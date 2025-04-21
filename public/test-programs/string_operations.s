# String Operations Program
# This program demonstrates various string operations
# Including string length, copy, and reverse

.data
source_str:  .asciz "Hello, RISC-V World!"   # Source string
dest_str:    .space 50                       # Destination buffer for string operations
length_msg:  .asciz "String length: "
copy_msg:    .asciz "\nCopied string: "
reverse_msg: .asciz "\nReversed string: "

.text
.globl main
main:

    # Calculate string length
    la s0, source_str             # s0 = source string address
    li s1, 0                      # s1 = length counter
    
length_loop:
    lb t0, 0(s0)                  # t0 = current character
    beqz t0, length_done          # if null terminator, exit loop
    
    addi s1, s1, 1                # length++
    addi s0, s0, 1                # move to next character
    j length_loop
    
length_done:
    # Print length message
    la a0, length_msg
    li a7, 4                      # Print string
    ecall
    
    # Print string length
    mv a0, s1
    li a7, 1                      # Print integer
    ecall
    
    # Copy string
    la s0, source_str             # s0 = source string address
    la s2, dest_str               # s2 = destination string address
    
copy_loop:
    lb t0, 0(s0)                  # t0 = current character
    sb t0, 0(s2)                  # store character in destination
    
    beqz t0, copy_done            # if null terminator, exit loop
    
    addi s0, s0, 1                # move to next source character
    addi s2, s2, 1                # move to next destination character
    j copy_loop
    
copy_done:
    # Print copy message
    la a0, copy_msg
    li a7, 4                      # Print string
    ecall
    
    # Print copied string
    la a0, dest_str
    li a7, 4                      # Print string
    ecall
    
    # Reverse string
    la s0, source_str             # s0 = source string address
    la s2, dest_str               # s2 = destination string address
    
    # First, find the end of the string (excluding null terminator)
    addi s3, s1, -1               # s3 = length - 1 (last character index)
    
    # Copy characters in reverse order
    li t1, 0                      # t1 = i = 0 (destination index)
    
reverse_loop:
    blt s3, zero, reverse_done    # if index < 0, exit loop
    
    # Calculate address of source[length-1-i]
    add t2, s0, s3                # t2 = &source[length-1-i]
    lb t0, 0(t2)                  # t0 = source[length-1-i]
    
    # Store in destination
    add t3, s2, t1                # t3 = &dest[i]
    sb t0, 0(t3)                  # dest[i] = source[length-1-i]
    
    addi s3, s3, -1               # decrement source index
    addi t1, t1, 1                # i++
    j reverse_loop
    
reverse_done:
    # Add null terminator
    add t3, s2, t1                # t3 = &dest[length]
    sb zero, 0(t3)                # dest[length] = '\0'
    
    # Print reverse message
    la a0, reverse_msg
    li a7, 4                      # Print string
    ecall
    
    # Print reversed string
    la a0, dest_str
    li a7, 4                      # Print string
    ecall
    
    # Exit program
    li a7, 10                     # Exit
    ecall

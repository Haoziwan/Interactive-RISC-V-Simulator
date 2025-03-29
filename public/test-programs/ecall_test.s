# ECALL Test Program
# This program demonstrates different ECALL operations

.data
message: .asciz "Hello from RISC-V simulator!\n"
newline: .asciz "\n"

.text
main:
    # Print integer (ECALL code 1)
    li a0, 42              # Value to print
    li a7, 1               # System call code for print integer
    ecall
    
    # Print string (ECALL code 4)
    la a0, message         # Load address of message
    li a7, 4               # System call code for print string
    ecall
    
    # Print character (ECALL code 11)
    li a0, 65              # ASCII code for 'A'
    li a7, 11              # System call code for print character
    ecall
    
    # Print newline
    la a0, newline
    li a7, 4
    ecall
    
    # Print character (ECALL code 11)
    li a0, 66              # ASCII code for 'B'
    li a7, 11              # System call code for print character
    ecall
    
    # Print character (ECALL code 11)
    li a0, 67              # ASCII code for 'C'
    li a7, 11              # System call code for print character
    ecall
    
    # Calculate and print result
    li t0, 10
    li t1, 5
    add t2, t0, t1
    
    # Print result
    mv a0, t2              # Move result to a0 for printing
    li a7, 1               # Print integer
    ecall
    
    # Exit program (ECALL code 10)
    li a7, 10
    ecall 
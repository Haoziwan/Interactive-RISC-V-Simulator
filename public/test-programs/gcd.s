# GCD Program 
# ecall is not supported in pipeline datapath

.data
num1: .word 48              # First number for GCD calculation
num2: .word 36              # Second number for GCD calculation
prompt1: .asciz "Calculating GCD of "
prompt2: .asciz " and "
step_msg: .asciz "\nStep: a = "
and_msg: .asciz ", b = "
result_msg: .asciz "\nGCD result: "

.text
main:
    # Load parameters from data section
    la t0, num1
    lw t1, 0(t0)            # t1 = first number
    la t0, num2
    lw t2, 0(t0)            # t2 = second number
    
    # Print initial message
    la a0, prompt1
    li a7, 4                # System call code for print string
    ecall
    
    mv a0, t1
    li a7, 1                # System call code for print integer
    ecall
    
    la a0, prompt2
    li a7, 4                # System call code for print string
    ecall
    
    mv a0, t2
    li a7, 1                # System call code for print integer
    ecall
    
loop:
    # Check if we're done (b == 0)
    beq t2, zero, done
    
    # Print current values
    la a0, step_msg
    li a7, 4                # System call code for print string
    ecall
    
    mv a0, t1
    li a7, 1                # System call code for print integer
    ecall
    
    la a0, and_msg
    li a7, 4                # System call code for print string
    ecall
    
    mv a0, t2
    li a7, 1                # System call code for print integer
    ecall
    
    # Calculate a % b
    mv t3, t1               # t3 = a
    mv t4, t2               # t4 = b (divisor)
    
divide:
    blt t3, t4, next        # if a < b, end division
    sub t3, t3, t4          # a = a - b
    j divide                # continue division
    
next:
    mv t1, t2               # a = b
    mv t2, t3               # b = a % b
    j loop                  # continue loop
    
done:
    # Print result
    la a0, result_msg
    li a7, 4                # System call code for print string
    ecall
    
    mv a0, t1               # GCD result is in t1
    li a7, 1                # System call code for print integer
    ecall
    
    # Exit program
    li a7, 10               # System call code for exit
    ecall

# Prime Number Checker
# This program checks if a number is prime
# It demonstrates conditional branching and arithmetic operations

.data
number:   .word 29                     # Number to check for primality
is_prime_msg: .asciz " is prime"
not_prime_msg: .asciz " is not prime"

.text
.globl main
main:
    # Load number to check
    la t0, number
    lw s0, 0(t0)                  # s0 = number to check
    
    # Print the number
    mv a0, s0
    li a7, 1                      # Print integer
    ecall
    
    # Check if number <= 1 (not prime)
    li t0, 1
    ble s0, t0, not_prime
    
    # Check if number == 2 (prime)
    li t0, 2
    beq s0, t0, is_prime
    
    # Check if number is even (not prime, except 2)
    andi t0, s0, 1                # t0 = number & 1
    beq t0, zero, not_prime       # if even, not prime
    
    # Initialize loop to check divisibility
    li s1, 3                      # s1 = i = 3 (start checking from 3)
    
check_loop:
    # Calculate i*i
    mul t0, s1, s1                # t0 = i*i
    
    # If i*i > number, then number is prime
    bgt t0, s0, is_prime          # if i*i > number, is prime
    
    # Check if i divides number
    rem t0, s0, s1                # t0 = number % i
    beq t0, zero, not_prime       # if divisible, not prime
    
    # Increment i by 2 (skip even numbers)
    addi s1, s1, 2                # i += 2
    j check_loop
    
is_prime:
    # Print is prime message
    la a0, is_prime_msg
    li a7, 4                      # Print string
    ecall
    j exit
    
not_prime:
    # Print not prime message
    la a0, not_prime_msg
    li a7, 4                      # Print string
    ecall
    
exit:
    # Exit program
    li a7, 10                     # Exit
    ecall

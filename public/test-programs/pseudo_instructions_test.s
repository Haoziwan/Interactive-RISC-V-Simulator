# Pseudo-Instructions Test Program
# This program demonstrates all RISC-V pseudo-instructions

.data
message: .asciz "Hello, World!"
.text
main:
    # li - Load Immediate
    li t0, 42              # Small immediate (expands to addi)
    li t1, 0x12345         # Large immediate (expands to lui+addi)
    
    # la - Load Address
    la t2, message         # Load address of message
    
    # mv - Move
    mv t3, t0              # Copy value from t0 to t3
    # Initialize a counter
    li t0, 0               # Set t0 to 0
    
    # First call to the subroutine
    call increment         # Call the increment subroutine
    
    # Second call to the subroutine
    call increment         # Call the increment subroutine
    
    # Third call to the subroutine
    call increment         # Call the increment subroutine
    
    # End program
    j end                  # Jump to end

# Subroutine to increment counter
increment:
    addi t0, t0, 1         # Increment counter by 1
    ret                    # Return to caller

end:
    # Final value of t0 should be 3
    addi a0, t0, 0         # Move result to a0 (return value register) 
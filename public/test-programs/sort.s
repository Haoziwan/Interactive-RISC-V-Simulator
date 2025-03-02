# Bubble Sort Program
# Memory-based bubble sort implementation for 5 numbers

# Initialize memory base address
addi x1, x0, 0      # Memory base address

# Initialize test data and store in memory
addi x2, x0, 5     # First data = 5
sw x2, 0(x1)       # Store at memory location 0

addi x2, x0, 3     # Second data = 3
sw x2, 4(x1)       # Store at memory location 4

addi x2, x0, 4     # Third data = 4
sw x2, 8(x1)       # Store at memory location 8

addi x2, x0, 1     # Fourth data = 1
sw x2, 12(x1)      # Store at memory location 12

addi x2, x0, 2     # Fifth data = 2
sw x2, 16(x1)      # Store at memory location 16

# Bubble sort implementation
addi x5, x0, 4      # Outer loop counter, need n-1 rounds

outer_loop:
    beq x5, x0, end_sort  # If outer loop is complete, end sorting
    addi x6, x0, 0      # Initialize inner loop index to 0
    addi x7, x0, 4      # Inner loop limit is n-1
    sub x7, x7, x5      # Reduce comparison count each round

inner_loop:
    beq x6, x7, end_inner  # If inner loop is complete, jump to outer loop
    
    # Calculate memory addresses of current and next elements
    slli x8, x6, 2     # x8 = x6 * 4 (byte offset)
    add x8, x8, x1     # x8 = current element address
    addi x9, x8, 4     # x9 = next element address
    
    # Load two adjacent elements
    lw x10, 0(x8)      # Load current element
    lw x11, 0(x9)      # Load next element
    
    # Compare values
    bge x10, x11, no_swap  # If current element >= next element, no swap needed
    
    # Swap values
    sw x11, 0(x8)      # Store next element at current position
    sw x10, 0(x9)      # Store current element at next position

no_swap:
    addi x6, x6, 1      # Increment inner loop index
    jal x0, inner_loop  # Continue inner loop

end_inner:
    addi x5, x5, -1     # Decrement outer loop counter
    jal x0, outer_loop  # Continue outer loop

end_sort:
    # Sorting complete, load results back to registers
    lw x10, 0(x1)       # x10 = first sorted number
    lw x11, 4(x1)       # x11 = second sorted number
    lw x12, 8(x1)       # x12 = third sorted number
    lw x13, 12(x1)      # x13 = fourth sorted number
    lw x14, 16(x1)      # x14 = fifth sorted number
    
    # Program end
    add x0, x0, x0      # NOP instruction, marks end of sorting


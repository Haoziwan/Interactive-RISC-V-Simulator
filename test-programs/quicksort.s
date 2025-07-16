# Quicksort Algorithm Implementation
# This program demonstrates the quicksort algorithm on an array of integers

.data
array:    .word 64, 34, 25, 12, 22, 11, 90, 45   # Array to be sorted
length:   .word 8                                # Length of the array
msg1:     .asciz "Original array: "
msg2:     .asciz "\nSorted array: "
space:    .asciz " "

.text
.globl main
main:
    # Print original array message
    la a0, msg1
    li a7, 4                      # Print string
    ecall
    
    # Print original array
    la s0, array                  # s0 = array address
    la s1, length                 # s1 = length address
    lw s1, 0(s1)                  # s1 = length value
    jal ra, print_array
    
    # Call quicksort
    la a0, array                  # a0 = array address
    li a1, 0                      # a1 = start index (0)
    addi a2, s1, -1               # a2 = end index (length-1)
    jal ra, quicksort
    
    # Print sorted array message
    la a0, msg2
    li a7, 4                      # Print string
    ecall
    
    # Print sorted array
    la s0, array                  # s0 = array address
    jal ra, print_array
    
    # Exit program
    li a7, 10                     # Exit
    ecall

# Function to print array
# s0 = array address, s1 = length
print_array:
    li t0, 0                      # t0 = loop counter
    
print_loop:
    beq t0, s1, print_done        # Exit if counter == length
    
    # Calculate address of array[i]
    slli t1, t0, 2                # t1 = i * 4
    add t1, s0, t1                # t1 = &array[i]
    lw a0, 0(t1)                  # a0 = array[i]
    
    # Print integer
    li a7, 1                      # Print integer
    ecall
    
    # Print space
    la a0, space
    li a7, 4                      # Print string
    ecall
    
    addi t0, t0, 1                # Increment counter
    j print_loop
    
print_done:
    jalr zero, ra, 0              # Return

# Quicksort function
# a0 = array address, a1 = start index, a2 = end index
quicksort:
    # Check if start < end
    bge a1, a2, quicksort_done    # If start >= end, return
    
    # Save registers to stack
    addi sp, sp, -20
    sw ra, 16(sp)
    sw s0, 12(sp)
    sw s1, 8(sp)
    sw s2, 4(sp)
    sw s3, 0(sp)
    
    # Save parameters
    mv s0, a0                     # s0 = array address
    mv s1, a1                     # s1 = start index
    mv s2, a2                     # s2 = end index
    
    # Call partition function
    jal ra, partition
    mv s3, a0                     # s3 = pivot index
    
    # Quicksort left part: quicksort(arr, start, pivot-1)
    mv a0, s0                     # a0 = array address
    mv a1, s1                     # a1 = start index
    addi a2, s3, -1               # a2 = pivot index - 1
    jal ra, quicksort
    
    # Quicksort right part: quicksort(arr, pivot+1, end)
    mv a0, s0                     # a0 = array address
    addi a1, s3, 1                # a1 = pivot index + 1
    mv a2, s2                     # a2 = end index
    jal ra, quicksort
    
    # Restore registers
    lw s3, 0(sp)
    lw s2, 4(sp)
    lw s1, 8(sp)
    lw s0, 12(sp)
    lw ra, 16(sp)
    addi sp, sp, 20
    
quicksort_done:
    jalr zero, ra, 0              # Return

# Partition function for quicksort
# a0 = array address, a1 = start index, a2 = end index
# Returns pivot index in a0
partition:
    # Save registers
    addi sp, sp, -16
    sw ra, 12(sp)
    sw s0, 8(sp)
    sw s1, 4(sp)
    sw s2, 0(sp)
    
    # Save parameters
    mv s0, a0                     # s0 = array address
    mv s1, a1                     # s1 = start index
    mv s2, a2                     # s2 = end index
    
    # Get pivot value (using last element as pivot)
    slli t0, s2, 2                # t0 = end * 4
    add t0, s0, t0                # t0 = &array[end]
    lw t0, 0(t0)                  # t0 = array[end] (pivot value)
    
    # Initialize i (will be the final pivot position)
    addi t1, s1, -1               # t1 = i = start - 1
    
    # Loop through array[start...end-1]
    mv t2, s1                     # t2 = j = start
    
partition_loop:
    bge t2, s2, partition_done    # If j >= end, exit loop
    
    # Get array[j]
    slli t3, t2, 2                # t3 = j * 4
    add t3, s0, t3                # t3 = &array[j]
    lw t4, 0(t3)                  # t4 = array[j]
    
    # Compare array[j] with pivot
    bgt t4, t0, skip_swap         # If array[j] > pivot, skip swap
    
    # Increment i
    addi t1, t1, 1                # i++
    
    # Swap array[i] and array[j]
    slli t5, t1, 2                # t5 = i * 4
    add t5, s0, t5                # t5 = &array[i]
    lw t6, 0(t5)                  # t6 = array[i]
    
    # Perform swap
    sw t4, 0(t5)                  # array[i] = array[j]
    sw t6, 0(t3)                  # array[j] = old array[i]
    
skip_swap:
    addi t2, t2, 1                # j++
    j partition_loop
    
partition_done:
    # Swap array[i+1] and array[end] to put pivot in its final position
    addi t1, t1, 1                # t1 = i + 1
    
    # Get array[i+1]
    slli t3, t1, 2                # t3 = (i+1) * 4
    add t3, s0, t3                # t3 = &array[i+1]
    lw t4, 0(t3)                  # t4 = array[i+1]
    
    # Get array[end]
    slli t5, s2, 2                # t5 = end * 4
    add t5, s0, t5                # t5 = &array[end]
    lw t6, 0(t5)                  # t6 = array[end]
    
    # Perform swap
    sw t6, 0(t3)                  # array[i+1] = array[end]
    sw t4, 0(t5)                  # array[end] = array[i+1]
    
    # Return pivot index (i+1)
    mv a0, t1
    
    # Restore registers
    lw s2, 0(sp)
    lw s1, 4(sp)
    lw s0, 8(sp)
    lw ra, 12(sp)
    addi sp, sp, 16
    
    jalr zero, ra, 0              # Return

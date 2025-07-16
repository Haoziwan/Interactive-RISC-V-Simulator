# Bubble Sort Program 
# This program sorts an array of integers using the bubble sort algorithm


.data
array:    .word 64, 34, 25, 12, 22, 11, 90   # Array to be sorted
length:   .word 7                            # Length of the array

.text
main:
    # Load array address and length
    la t0, array                  # t0 = address of array
    la t1, length                 # t1 = address of length
    lw t1, 0(t1)                  # t1 = length value
    
    # Initialize outer loop counter
    li t2, 0                      # t2 = i = 0
    
outer_loop:
    # Check if outer loop is done
    beq t2, t1, done              # if i == length, exit
    
    # Initialize inner loop counter and swap flag
    li t3, 0                      # t3 = j = 0
    li t4, 0                      # t4 = swap flag = 0 (no swaps yet)
    sub t5, t1, t2                # t5 = length - i (inner loop bound)
    addi t5, t5, -1               # t5 = length - i - 1
    
inner_loop:
    # Check if inner loop is done
    beq t3, t5, inner_done        # if j == length - i - 1, exit inner loop
    
    # Calculate address of array[j] and array[j+1]
    slli t6, t3, 2                # t6 = j * 4
    add s1, t0, t6                # s1 = &array[j]
    lw s2, 0(s1)                  # s2 = array[j]
    lw s3, 4(s1)                  # s3 = array[j+1]
    
    # Compare and swap if needed
    ble s2, s3, no_swap           # if array[j] <= array[j+1], skip swap
    
    # Swap array[j] and array[j+1]
    sw s3, 0(s1)                  # array[j] = array[j+1]
    sw s2, 4(s1)                  # array[j+1] = array[j]
    li t4, 1                      # Set swap flag to 1 (swap occurred)
    
no_swap:
    addi t3, t3, 1                # j++
    j inner_loop
    
inner_done:
    # Check if no swaps occurred (array is sorted)
    beq t4, zero, done            # if no swaps, array is sorted
    
    addi t2, t2, 1                # i++
    j outer_loop
    
done:
    # Program is complete, sorted array is in memory


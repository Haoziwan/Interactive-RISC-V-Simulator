# Binary Search Program 
# This program performs a binary search on a sorted array


.data
array:    .word 2, 5, 8, 12, 16, 23, 38, 56, 72, 91  # Sorted array
length:   .word 10                                   # Length of the array
target:   .word 23                                   # Value to search for
result:   .word 0                                    # Will store the index of target or -1 if not found

.text
main:
    # Load array address, length, and target
    la t0, array                  # t0 = address of array
    la t1, length                 # t1 = address of length
    lw t1, 0(t1)                  # t1 = length value
    la t2, target                 # t2 = address of target
    lw t2, 0(t2)                  # t2 = target value
    
    # Initialize binary search variables
    li t3, 0                      # t3 = left = 0
    addi t4, t1, -1               # t4 = right = length - 1
    li t5, -1                     # t5 = result = -1 (not found)
    
search_loop:
    # Check if search is complete
    bgt t3, t4, search_done       # if left > right, exit
    
    # Calculate middle index
    add t6, t3, t4                # t6 = left + right
    srai t6, t6, 1                # t6 = (left + right) / 2
    
    # Get middle element
    slli s1, t6, 2                # s1 = mid * 4
    add s1, t0, s1                # s1 = &array[mid]
    lw s2, 0(s1)                  # s2 = array[mid]
    
    # Compare with target
    beq s2, t2, found             # if array[mid] == target, found
    blt s2, t2, search_right      # if array[mid] < target, search right half
    
    # Search left half
    addi t4, t6, -1               # right = mid - 1
    j search_loop
    
search_right:
    addi t3, t6, 1                # left = mid + 1
    j search_loop
    
found:
    mv t5, t6                     # result = mid
    
search_done:
    # Store result in memory
    la s3, result                 # s3 = address of result
    sw t5, 0(s3)                  # result = t5 (index or -1)
    
    # Program is complete, result is stored in memory


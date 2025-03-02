# R-Type Instructions Test Program
# Test all R-type instructions for basic functionality and edge cases

# Initialize test data
addi x1, x0, 10      # x1 = 10
addi x2, x0, 5       # x2 = 5
addi x3, x0, -8      # x3 = -8
addi x4, x0, 0x7FF   # x4 = 2047 (maximum 12-bit immediate)

# Test arithmetic instructions
add x5, x1, x2       # x5 = 15 (10 + 5)
sub x6, x1, x2       # x6 = 5 (10 - 5)
add x7, x1, x3       # x7 = 2 (10 + (-8))
sub x8, x3, x1       # x8 = -18 ((-8) - 10)

# Test logical instructions
and x9, x1, x2       # x9 = 0 (10 & 5)
or x10, x1, x2       # x10 = 15 (10 | 5)
xor x11, x1, x2      # x11 = 15 (10 ^ 5)

# Test shift instructions
addi x20, x0, 2      # x20 = 2 (shift amount)
sll x12, x1, x20     # x12 = 40 (10 << 2)
srl x13, x1, x20     # x13 = 2 (10 >> 2)
sra x14, x3, x20     # x14 = -2 ((-8) >> 2, arithmetic right shift)

# Test comparison instructions
slt x15, x2, x1      # x15 = 1 (5 < 10)
slt x16, x1, x2      # x16 = 0 (10 < 5)
sltu x17, x3, x1     # x17 = 1 ((-8) < 10, unsigned comparison)

# Test edge cases
addi x21, x0, -1     # x21 = -1
addi x22, x0, 1      # x22 = 1
add x23, x21, x22    # x23 = 0 (-1 + 1)
sub x24, x21, x21    # x24 = 0 (-1 - (-1))
and x25, x21, x22    # x25 = 1 (-1 & 1)
or x26, x0, x21      # x26 = -1 (0 | -1)
xor x27, x21, x21    # x27 = 0 (-1 ^ -1)

# Test complete
add x0, x0, x0       # NOP instruction, marks end of test
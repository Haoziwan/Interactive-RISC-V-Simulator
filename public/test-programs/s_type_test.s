# S-type Instructions Test Program
# Test basic functionality and boundary conditions for all S-type instructions

# Initialize test data
addi x1, x0, 1234     # x1 = 1234 (0x4D2)
addi x2, x0, -56      # x2 = -56
addi x3, x0, 0x7FF    # x3 = 2047
addi x4, x0, 0x123    # x4 = 291

# Test word store instructions
sw x1, 0(x0)         # mem[0] = 1234
sw x2, 4(x0)         # mem[4] = -56
sw x3, 8(x0)         # mem[8] = 2047
sw x4, 12(x0)        # mem[12] = 0x123

# Test half-word store instructions
sh x1, 16(x0)        # mem[16] = 1234 (lower 16 bits)
sh x2, 18(x0)        # mem[18] = -56 (lower 16 bits)
sh x3, 20(x0)        # mem[20] = 2047 (lower 16 bits)
sh x4, 22(x0)        # mem[22] = 0x123 (lower 16 bits)

# Test byte store instructions
sb x1, 24(x0)        # mem[24] = 210 (lower 8 bits of 0x4D2)
sb x2, 25(x0)        # mem[25] = -56 (lower 8 bits)
sb x3, 26(x0)        # mem[26] = 255 (lower 8 bits of 0x7FF)
sb x4, 27(x0)        # mem[27] = 0x23

# Test store with different base addresses
addi x5, x0, 100     # x5 = 100 (base address)
sw x1, 0(x5)         # mem[100] = 1234
sh x2, 4(x5)         # mem[104] = -56 (half-word)
sb x3, 8(x5)         # mem[108] = 255 (byte)

# Test boundary offsets
sw x1, -2048(x5)     # Test minimum offset
sw x2, 2047(x5)      # Test maximum offset

# Test consecutive stores
addi x6, x0, 1       # x6 = 1
addi x7, x0, 2       # x7 = 2
addi x8, x0, 3       # x8 = 3
addi x9, x0, 4       # x9 = 4
sw x6, 0(x0)         # Store four consecutive words
sw x7, 4(x0)
sw x8, 8(x0)
sw x9, 12(x0)

# Test complete
add x0, x0, x0       # NOP指令，标记测试结束
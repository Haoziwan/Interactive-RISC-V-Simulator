# I-Type Instructions Test Program
# Test all I-type instructions for basic functionality and edge cases

# Initialize memory data (using S-type instructions, will be tested in detail in S-type test)
addi x1, x0, 1234    # Test data
sw x1, 0(x0)        # mem[0] = 1234
addi x1, x0, -56     # Test data
sw x1, 4(x0)        # mem[4] = -56
addi x1, x0, 0x7FF   # Test data
sw x1, 8(x0)        # mem[8] = 2047

# Test immediate arithmetic instructions
addi x1, x0, 42      # x1 = 42
addi x2, x1, 10      # x2 = 52
addi x3, x1, -20     # x3 = 22
addi x4, x0, 0x7FF   # x4 = 2047 (maximum 12-bit immediate)
addi x5, x0, -2048   # x5 = -2048 (minimum 12-bit immediate)

# Test immediate logical instructions
andi x6, x1, 0x0F    # x6 = 10 (42 & 15)
ori x7, x1, 0x0F     # x7 = 47 (42 | 15)
xori x8, x1, 0xFF    # x8 = 213 (42 ^ 255)

# Test immediate shift instructions
slli x9, x1, 2       # x9 = 168 (42 << 2)
srli x10, x1, 2      # x10 = 10 (42 >> 2)
srai x11, x5, 2      # x11 = -512 (-2048 >> 2, arithmetic right shift)

# Test load instructions
lw x12, 0(x0)       # x12 = 1234 (load word)
lh x13, 4(x0)       # x13 = -56 (load half-word, sign-extended)
lb x14, 8(x0)       # x14 = 127 (load byte, sign-extended)
lhu x15, 4(x0)      # x15 = 65480 (load half-word, unsigned)
lbu x16, 8(x0)      # x16 = 255 (load byte, unsigned)

# Test edge cases
addi x20, x0, -1     # x20 = -1
andi x21, x20, 1     # x21 = 1 (-1 & 1)
ori x22, x0, -1      # x22 = -1 (0 | -1)
xori x23, x20, -1    # x23 = 0 (-1 ^ -1)

# Test different load offsets
lw x24, -2048(x0)    # Test minimum offset
lw x25, 2047(x0)     # Test maximum offset

# Test complete
add x0, x0, x0       # NOP instruction, marks end of test
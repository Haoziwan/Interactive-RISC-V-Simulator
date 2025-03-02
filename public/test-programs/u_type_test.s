# U-type Instructions Test Program
# Test basic functionality and boundary conditions for all U-type instructions

# Test Load Upper Immediate instruction (lui)
lui x1, 0x12345      # x1 = 0x12345000
lui x2, 0xFFFFF      # x2 = 0xFFFFF000 (maximum 20-bit immediate)
lui x3, 0           # x3 = 0 (minimum value)

# Test Add Upper Immediate to PC instruction (auipc)
auipc x4, 0x12345   # x4 = PC + 0x12345000
auipc x5, 0         # x5 = PC
auipc x6, 0xFFFFF   # x6 = PC + 0xFFFFF000

# Test combination with other instructions
lui x7, 0x12345     # Set upper 20 bits
addi x7, x7, 0x678  # Set lower 12 bits, x7 = 0x12345678

lui x8, 0xFFFFF     # Set upper 20 bits to negative value
addi x8, x8, -1     # Set lower 12 bits, x8 = 0xFFFFFFFF (-1)

# Test auipc with jump instruction
auipc x9, 0         # Get current PC
addi x10, x9, 16    # Calculate target address (current PC + 16)
jalr x0, x10, 0     # Jump to calculated address

# Test complete
add x0, x0, x0      # NOP instruction, marks end of test
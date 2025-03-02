# Comprehensive RISC-V Assembly Test Program

# 1. R-type Instructions Test
start:
    add x1, x2, x3      # Basic arithmetic operations
    sub x4, x5, x6
    and x7, x8, x9      # Logical operations
    or  x10, x11, x12
    xor x13, x14, x15
    sll x16, x17, x18   # Shift operations
    srl x19, x20, x21
    sra x22, x23, x24
    slt x25, x26, x27   # Comparison operations
    sltu x28, x29, x30

# 2. I-type Instructions Test
    addi x1, x2, 100    # Immediate arithmetic operations
    andi x3, x4, 0xff   # Immediate logical operations
    ori  x5, x6, 0x0f
    xori x7, x8, 0xf0
    slti x9, x10, -10   # Immediate comparison
    sltiu x11, x12, 20
    slli x13, x14, 4    # Immediate shift operations
    srli x15, x16, 4
    srai x17, x18, 4

# 3. S-type Instructions Test
    sw x1, 12(x2)       # Store word
    sw x3, -8(x4)

# 4. Load Instructions Test
    lw x5, 16(x6)       # Load word
    lw x7, -4(x8)

# 5. B-type Instructions Test
loop_start:
    beq x1, x2, loop_end    # Branch if equal
    bne x3, x4, loop_start  # Branch if not equal
    blt x5, x6, loop_mid    # Branch if less than
    bge x7, x8, loop_end    # Branch if greater or equal

# 6. U-type Instructions Test
loop_mid:
    lui x1, 0xfffff     # Load upper immediate
    auipc x2, 0x12345   # Add upper immediate to PC

# 7. J-type Instructions Test
    jal x1, jump_target # Jump and link

# 8. Pseudo-instructions Test
    li t0, 1234         # Load immediate
    li t1, -5678
    mv t2, t3           # Move register
    j loop_end          # Unconditional jump
    nop                 # No operation

# 9. Register ABI Names Test
jump_target:
    add zero, ra, sp    # Using ABI names
    add gp, tp, t0
    add t1, t2, s0
    add s1, a0, a1
    add a2, a3, a4
    add a5, a6, a7
    add s2, s3, s4
    add s5, s6, s7
    add s8, s9, s10
    add s11, t3, t4
    add t5, t6, zero

# 10. Mixed Test
loop_end:
    add x0, ra, x2      # Mixed use of numeric and ABI names
    addi t0, x6, 100    # Mixed format immediate operations
    sw t1, 8(s0)        # Mixed format memory operations

# Program End
    ret                 # Return
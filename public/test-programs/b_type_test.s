# B-Type Instructions Test Program
# Test all B-type instructions for basic functionality and edge cases

# Initialize test data
addi x1, x0, 10      # x1 = 10
addi x2, x0, 20      # x2 = 20
addi x3, x0, -5      # x3 = -5
addi x4, x0, 10      # x4 = 10 (equal to x1)

# Test equal/not equal branches
beq x1, x4, equal     # Should branch, because x1 = x4
add x5, x0, x0        # If no branch, x5 = 0
equal:
addi x5, x0, 1        # x5 = 1

bne x1, x2, not_equal # Should branch, because x1 ≠ x2
add x6, x0, x0        # If no branch, x6 = 0
not_equal:
addi x6, x0, 1        # x6 = 1

# Test less than/greater equal branches
blt x1, x2, less_than  # Should branch, because 10 < 20
add x7, x0, x0        # If no branch, x7 = 0
less_than:
addi x7, x0, 1        # x7 = 1

bge x2, x1, greater_eq # Should branch, because 20 ≥ 10
add x8, x0, x0        # If no branch, x8 = 0
greater_eq:
addi x8, x0, 1        # x8 = 1

# Test unsigned comparison branches
bltu x1, x2, u_less    # Should branch, because 10 < 20 (unsigned)
add x9, x0, x0        # If no branch, x9 = 0
u_less:
addi x9, x0, 1        # x9 = 1

bgeu x2, x1, u_greater # Should branch, because 20 ≥ 10 (unsigned)
add x10, x0, x0       # If no branch, x10 = 0
u_greater:
addi x10, x0, 1       # x10 = 1

# Test negative number comparison
blt x3, x1, neg_less   # Should branch, because -5 < 10
add x11, x0, x0       # If no branch, x11 = 0
neg_less:
addi x11, x0, 1       # x11 = 1

# Test no-branch case
beq x1, x2, no_jump    # Should not branch, because x1 ≠ x2
addi x12, x0, 1       # x12 = 1
no_jump:
add x0, x0, x0        # NOP

# Test backward branch
addi x13, x0, 3       # x13 = 3 (counter)
loop_back:
addi x13, x13, -1     # x13 = x13 - 1
bne x13, x0, loop_back # Branch back if x13 ≠ 0

# Test complete
add x0, x0, x0        # NOP instruction, marks end of test
# J-Type Instructions Test Program


main:
    # Test jal (Jump and Link)
    jal x1, jump_target1    # Jump to jump_target1 and save return address in x1
    addi x5, x0, 1         # This should be skipped

jump_target1:
    addi x2, x0, 10        # Set x2 = 10
    
    # Test jalr (Jump and Link Register)
    addi x3, x0, 0x20      # Set x3 = 32
    jalr x4, x3, 0         # Jump to address in x3 and save return address in x4
    addi x5, x0, 2         # This should be skipped

    # Return point (at address 0x20)
    addi x6, x0, 20        # Set x6 = 20
    
    # Test jal with backward jump
    jal x7, backward_jump   # Jump backward
    addi x8, x0, 3         # This should be executed after backward_jump
    
    # End program
    addi x9, x0, 100       # Set x9 = 100 to indicate end of program
    j end                   # Jump to end

backward_jump:
    addi x10, x0, 30       # Set x10 = 30
    jalr x0, x7, 0         # Return to caller using x7

end:
    addi x11, x0, 200      # Set x11 = 200 to mark end of program
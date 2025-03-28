
.data
var1: .word 42             
var2: .half 100, 200      
var3: .byte 65, 66, 67     # ASCII 'A', 'B', 'C'
str1: .ascii "Hello"      
str2: .asciz "World"      


.text
main:

    la a0, var1         
    la a1, var2         
    la a2, var3         
    la a3, str1          
    la a4, str2          
    
 
    lw t0, 0(a0)         
    lh t1, 0(a1)         
    lh t2, 2(a1)         
    lb t3, 0(a2)         
    lb t4, 1(a2)         
  
    li t5, 99
    sw t5, 0(a0)        
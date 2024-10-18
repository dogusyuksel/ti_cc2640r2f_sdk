//******************************************************************************
//* HWDIV16.S - 16 BIT STATE -  v#####                                         *
//* Copyright (c) 2021@%%%% Texas Instruments Incorporated                     *
//******************************************************************************
        .global __aeabi_uidivmod_hw
        .global __aeabi_idivmod_hw
        .section .text:divmod_hw, "ax", %progbits
        .p2align    2
        .thumb_func
__aeabi_uidivmod_hw: .asmfunc stack_usage(8)
        movs    r3, #4        // Unsigned division control: (4)
        b entry
__aeabi_idivmod_hw: .asmfunc stack_usage(8)
        movs    r3, #36       // Signed division control: (4 | (1 << 5))
entry:
        cmp     r1, #0        // Div-by-0 check
        beq divby0
        ldr r2, .LCPI0_1      // Load mathacl base register address
        @APP
        cpsid i               // Disable interrupts
        @NO_APP
        str r3, [r2]          // Set mathacl control (signed or unsigned)
        str r1, [r2, #20]     // Set mathacl divisor
        str r0, [r2, #16]     // Set mathacl dividend
        ldr r0, [r2, #32]     // Get mathacl quotient
        ldr r1, [r2, #36]     // Get mathacl remainder
        @APP
        cpsie i               // Enable interrupts
        @NO_APP
        bx  lr
       	.endasmfunc
divby0:                       // Handle div-by-0:
        movs r1, r0           // - Return numerator as remainder (r1)
        movs r0, #0           // - Return zero as quotient (r0)
        push {r7, lr}         // - Call __aeabi_idiv0() trap function
        bl __aeabi_idiv0
        pop  {r7, pc}
        .p2align    2
.LCPI0_1:
        .long   1078006016                      @ 0x40411100

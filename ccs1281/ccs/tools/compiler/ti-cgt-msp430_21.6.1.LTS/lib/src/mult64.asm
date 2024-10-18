;******************************************************************************
;* MULT64.ASM -                                                               *
;*                                                                            *
;* Copyright (c) 2011 Texas Instruments Incorporated                          *
;* http://www.ti.com/                                                         *
;*                                                                            *
;*  Redistribution and  use in source  and binary forms, with  or without     *
;*  modification,  are permitted provided  that the  following conditions     *
;*  are met:                                                                  *
;*                                                                            *
;*     Redistributions  of source  code must  retain the  above copyright     *
;*     notice, this list of conditions and the following disclaimer.          *
;*                                                                            *
;*     Redistributions in binary form  must reproduce the above copyright     *
;*     notice, this  list of conditions  and the following  disclaimer in     *
;*     the  documentation  and/or   other  materials  provided  with  the     *
;*     distribution.                                                          *
;*                                                                            *
;*     Neither the  name of Texas Instruments Incorporated  nor the names     *
;*     of its  contributors may  be used to  endorse or  promote products     *
;*     derived  from   this  software  without   specific  prior  written     *
;*     permission.                                                            *
;*                                                                            *
;*  THIS SOFTWARE  IS PROVIDED BY THE COPYRIGHT  HOLDERS AND CONTRIBUTORS     *
;*  "AS IS"  AND ANY  EXPRESS OR IMPLIED  WARRANTIES, INCLUDING,  BUT NOT     *
;*  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR     *
;*  A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT     *
;*  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,     *
;*  SPECIAL,  EXEMPLARY,  OR CONSEQUENTIAL  DAMAGES  (INCLUDING, BUT  NOT     *
;*  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,     *
;*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY     *
;*  THEORY OF  LIABILITY, WHETHER IN CONTRACT, STRICT  LIABILITY, OR TORT     *
;*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE     *
;*  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.      *
;*                                                                            *
;******************************************************************************
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg  RETA,RET
	.asg  BRA,BR
	.asg  CALLA,CALL
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
        .asg  POPM.A,POP
	.asg  PUSHM.A,PUSH
	.asg  4, REGSZ
     .else
	.asg  2, REGSZ
     .endif
;****************************************************************************
;* __mpyll   (int64 = int64 * int64)
;*  
;*   - Operand 1 is in R8/R9/R10/R11
;*   - Operand 2 is in R12/R13/R14/R15
;*   - Result is in R12/R13/R14/R15
;*
;*   Registers used:  R4,R5,R6,R7,R8,R9,R10,R11,R12,R13,R14,R15
;****************************************************************************
     .if __TI_EABI__
        .asg __mspabi_mpyl, __mpyl
        .asg __mspabi_mpyul, __mpyul
        .asg __mspabi_mpyll, __mpyll
        .asg __mspabi_mpyl_sw, __mpyl_sw
        .asg __mspabi_mpyul_sw, __mpyul_sw
        .asg __mspabi_mpyll_sw, __mpyll_sw
	.asg __mspabi_func_epilog_7, func_epilog_7
     .endif
	.global __mpyul, __mpyl, func_epilog_7
	.global __mpyul_sw, __mpyl_sw

	.global __mpyll
	.global __mpyll_sw
	.sect	".text:__mpyll"
	.clink
	.align 2
__mpyll_sw:
__mpyll:  .asmfunc stack_usage(7 * REGSZ + 12 + RETADDRSZ)
     .if $DEFINED(.MSP430X)
        PUSH      #7, r10
     .else
        PUSH      r10
        PUSH      r9
        PUSH      r8
        PUSH      r7
        PUSH      r6
        PUSH      r5
        PUSH      r4
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__)
        SUBA      #12,SP
     .else
        SUB.W     #12,SP
     .endif
        MOV.W     r15,r6
        MOV.W     r12,8(SP)
        MOV.W     r13,2(SP)
        MOV.W     r14,r7
        MOV.W     r8,6(SP)
        MOV.W     r9,0(SP)
        MOV.W     r10,4(SP)
        MOV.W     r11,r14
        MOV.W     #0,r13
        MOV.W     #0,r15
        CALL      #__mpyl_sw

        MOV.W     r12,r10
        MOV.W     #0,r13
        MOV.W     r8,r14
        MOV.W     #0,r15
        MOV.W     r6,r12
        CALL      #__mpyl_sw

        MOV.W     r12,r9
        MOV.W     r13,r4
        MOV.W     #0,r5
        MOV.W     #0,r6
        MOV.W     r7,r12
        MOV.W     0(SP),r13
        CALL      #__mpyul_sw

        ADD.W     r12,r9
        ADDC.W    r13,r4
        ADDC.W    #0,r5
        ADDC.W    #0,r6
        MOV.W     2(SP),r12
        MOV.W     4(SP),r13
        CALL      #__mpyul_sw

        ADD.W     r12,r9
        ADDC.W    r13,r4
        ADDC.W    #0,r5
        ADDC.W    #0,r6
        ADD.W     r10,r9
        MOV.W     8(SP),r12
        MOV.W     r8,r13
        CALL      #__mpyul_sw

        MOV.W     r12,r10
        ADD.W     #0,r10
        MOV.W     r13,r4
        MOV.W     #0,r5
        MOV.W     #0,r6
        ADDC.W    #0,r4
        ADDC.W    #0,r5
        ADDC.W    r9,r6
        MOV.W     2(SP),r12
        MOV.W     0(SP),r13
        CALL      #__mpyul_sw

        MOV.W     r12,r8
        MOV.W     r13,r9
        MOV.W     6(SP),r13
        MOV.W     r7,r12
        CALL      #__mpyul_sw

        MOV.W     r13,r7
        ADD.W     r8,r12
        MOV.W     r12,10(SP)
        ADDC.W    r9,r7
        MOV.W     #0,r8
        ADDC.W    #0,r8
        MOV.W     #0,r9
        ADDC.W    #0,r9
        MOV.W     8(SP),r12
        MOV.W     4(SP),r13
        CALL      #__mpyul_sw

        ADD.W     r12,10(SP)
        MOV.W     10(SP),r15
        ADDC.W    r13,r7
        ADDC.W    #0,r8
        ADDC.W    #0,r9
        ADD.W     #0,r10
        ADDC.W    #0,r4
        ADDC.W    r15,r5
        ADDC.W    r7,r6
        MOV.W     8(SP),r12
        MOV.W     0(SP),r13
        CALL      #__mpyul_sw

        MOV.W     r12,r7
        MOV.W     r13,r9
        MOV.W     6(SP),r13
        MOV.W     2(SP),r12
        CALL      #__mpyul_sw

        ADD.W     r7,r12
        ADDC.W    r9,r13
        MOV.W     #0,r15
        ADDC.W    #0,r15
        MOV.W     #0,r14
        ADDC.W    #0,r14
        ADD.W     #0,r10
        ADDC.W    r12,r4
        ADDC.W    r13,r5
        ADDC.W    r15,r6
        MOV.W     r10,r12
        MOV.W     r4,r13
        MOV.W     r5,r14
        MOV.W     r6,r15
     .if $DEFINED(__LARGE_CODE_MODEL__)
        ADDA      #12,SP
     .else
        ADD.W     #12,SP
     .endif
     .if $DEFINED(.MSP430X)
        POP       #7, r10
	RET
     .else
        BR        #func_epilog_7+0
     .endif

        .endasmfunc

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)

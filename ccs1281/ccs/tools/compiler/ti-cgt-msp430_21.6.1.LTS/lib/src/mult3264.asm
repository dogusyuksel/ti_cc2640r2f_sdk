;******************************************************************************
;* MULT3264.ASM -                                                             *
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
     .if __TI_EABI__
        .asg __mspabi_mpyll, __mpyll
        .asg __mspabi_mpysll, __mpysll
        .asg __mspabi_mpyull, __mpyull
        .asg __mspabi_mpyll_sw, __mpyll_sw
        .asg __mspabi_mpysll_sw, __mpysll_sw
        .asg __mspabi_mpyull_sw, __mpyull_sw
	.asg __mspabi_func_epilog_3, func_epilog_3
     .endif
;****************************************************************************
;* __mpysll   (int64 = (int64)int32 * (int64)int32)
;****************************************************************************
	.global __mpyll, func_epilog_3
	.global __mpyll_sw

	.global __mpysll
	.global __mpysll_sw
	.sect	".text:__mpysll"
	.clink
	.align 2
__mpysll_sw:
__mpysll:  .asmfunc stack_usage(3 * REGSZ + RETADDRSZ)
     .if $DEFINED(.MSP430X)
        PUSH      #3, r10
     .else
        PUSH      r10
        PUSH      r9
        PUSH      r8
     .endif

	MOV.W	  r12,r8
	MOV.W     r13,r9
        BIT.W     #8000h,r9
        SUBC.W    r10,r10
        INV.W     r10
	MOV.W	  r10,r11

	MOV.W	  r14,r12
	MOV.W     r15,r13
        BIT.W     #8000h,r13
        SUBC.W    r14,r14
        INV.W     r14
	MOV.W	  r14,r15

	CALL	  #__mpyll_sw

    .if $DEFINED(.MSP430X)
        POP       #3, r10
	RET
    .else
        BR        #func_epilog_3
    .endif
        .endasmfunc

;****************************************************************************
;* __mpyull   (int64 = (int64)uint32 * (int64)uint32)
;****************************************************************************
	.global __mpyull
	.global __mpyull_sw
	.sect	".text:__mpyull"
	.clink
	.align 2
__mpyull_sw:
__mpyull:  .asmfunc stack_usage(3 * REGSZ + RETADDRSZ)
     .if $DEFINED(.MSP430X)
        PUSH      #3, r10
     .else
        PUSH      r10
        PUSH      r9
        PUSH      r8
     .endif

	MOV.W	  r12,r8
	MOV.W     r13,r9
	CLR.W     r10
	CLR.W     r11

	MOV.W	  r14,r12
	MOV.W     r15,r13
	CLR.W     r14
	CLR.W     r15

	CALL	  #__mpyll_sw

    .if $DEFINED(.MSP430X)
        POP       #3, r10
	RET
    .else
        BR        #func_epilog_3
    .endif
        .endasmfunc

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)

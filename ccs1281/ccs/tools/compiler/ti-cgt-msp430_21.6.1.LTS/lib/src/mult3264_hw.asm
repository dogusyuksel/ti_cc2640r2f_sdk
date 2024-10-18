;******************************************************************************
;* MULT3264_HW.ASM -                                                          *
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
	.asg  4, REGSZ
     .else
	.asg  2, REGSZ
     .endif
     .if __TI_EABI__
        .asg __mspabi_mpyll_hw, __mpyll_hw
        .asg __mspabi_mpysll_hw, __mpysll_hw
        .asg __mspabi_mpyull_hw, __mpyull_hw
	.asg __mspabi_func_epilog_3, func_epilog_3
     .endif

;****************************************************************************
;* __mpysll_hw   (int64 = (int64)int32 * (int64)int32)
;****************************************************************************
	.global __mpyll_hw, func_epilog_3

	.global __mpysll_hw
	.sect	".text:__mpysll"
	.clink
	.align 2
__mpysll_hw:  .asmfunc stack_usage(3 * REGSZ + RETADDRSZ)
     .if $DEFINED(.MSP430X)
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
	PUSHM.A   #3, r10
     .else
	PUSHM	  #3, r10
     .endif
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

	CALL	  #__mpyll_hw

     .if $DEFINED(.MSP430X)
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
	POPM.A	  #3, r10
     .else
        POPM      #3, r10
     .endif
	RET
     .else
        BR        #func_epilog_3
     .endif
        .endasmfunc

;****************************************************************************
;* __mpyull_hw   (int64 = (int64)uint32 * (int64)uint32)
;****************************************************************************
MPY		.equ    0x0130
MAC		.equ    0x0134
MACS		.equ    0x0136
OP2		.equ    0x0138
RESLO		.equ    0x013A
RESHI		.equ    0x013C
SUMEXT		.equ    0x013E

	.asg      R12, X0
	.asg      R13, X1

	.asg      R14, Y0
	.asg      R15, Y1

	.global __mpyull_hw
	.sect	".text:__mpyull"
	.clink
	.align 2
__mpyull_hw:  .asmfunc stack_usage(2 + RETADDRSZ)

	PUSH.W	  SR

	DINT
	NOP

	MOV.W	  X0, &MPY
	MOV.W	  Y0, &OP2

	MOV.W	  X0, &MAC ; use X0 before r12 is clobbered

	MOV.W	  &RESLO, r12
	MOV.W	  &RESHI, &RESLO
	MOV.W	  #0, &RESHI

	MOV.W	  Y1, &OP2

	MOV.W	  X1, &MAC
	MOV.W	  Y0, &OP2

;	MOV.W	  X1, &MAC ; use X1 before r13 is clobbered; X1 already in MAC

	MOV.W	  &RESLO, r13
	MOV.W	  &RESHI, &RESLO
	MOV.W	  &SUMEXT, &RESHI

	MOV.W	  Y1, &OP2

	MOV.W	  &RESLO, r14
	MOV.W	  &RESHI, r15

     .if $DEFINED(__LARGE_CODE_MODEL__)
	POP.W     SR
        NOP                             ; CPU19 Compatibility
	RETA
     .else
	RETI
     .endif
        .endasmfunc

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)

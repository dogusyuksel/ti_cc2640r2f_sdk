;******************************************************************************
;* MULT64_HW.ASM -                                                            *
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
;****************************************************************************
;* __mpyll_hw   (int64 = int64 * int64)
;*  
;*   - Operand 1 is in R8/R9/R10/R11
;*   - Operand 2 is in R12/R13/R14/R15
;*   - Result is in R12/R13/R14/R15
;*
;*   Registers used:  R8,R9,R10,R11,R12,R13,R14,R15
;****************************************************************************
MPY		.equ    0x0130
MAC		.equ    0x0134
OP2		.equ    0x0138
RESLO		.equ    0x013A
RESHI		.equ    0x013C
SUMEXT		.equ    0x013E

     .if __TI_EABI__
        .asg __mspabi_mpyll_hw, __mpyll_hw
     .endif

	.global __mpyll_hw
	.sect	".text:__mpyll"
	.clink
	.align 2
__mpyll_hw:  .asmfunc stack_usage(10 + RETADDRSZ)
	PUSH	  SR

     .if $DEFINED(.MSP430X)
        PUSH      #4, r15
     .else
        PUSH      r15
        PUSH      r14
        PUSH      r13
        PUSH      r12
     .endif

	.asg      0(SP), Y0
	.asg      2(SP), Y1
	.asg      4(SP), Y2
	.asg      6(SP), Y3

	.asg      R8, X0
	.asg      R9, X1
	.asg      R10, X2
	.asg      R11, X3

	DINT
	NOP

	MOV.W	  Y0, &MPY
	MOV.W	  X0, &OP2

	MOV.W	  &RESLO, r12
	MOV.W	  &RESHI, &RESLO
	MOV.W	  #0, &RESHI

	MOV.W	  Y0, &MAC
	MOV.W	  X1, &OP2

	MOV.W	  Y1, &MAC
	MOV.W	  X0, &OP2

	MOV.W	  &RESLO, r13
	MOV.W	  &RESHI, &RESLO
	MOV.W	  &SUMEXT, &RESHI

;	MOV.W	  Y1, &MAC	; Y1 is already in MAC
	MOV.W	  X1, &OP2

	MOV.W	  Y2, &MAC
	MOV.W	  X0, &OP2

	MOV.W	  Y0, &MAC
	MOV.W	  X2, &OP2

	MOV.W	  &RESLO, r14
	MOV.W	  &RESHI, &RESLO
	MOV.W	  &SUMEXT, &RESHI
	
;	MOV.W	  Y0, &MAC	; Y0 is already in MAC
	MOV.W	  X3, &OP2

	MOV.W	  Y1, &MAC
	MOV.W	  X2, &OP2

	MOV.W	  Y2, &MAC
	MOV.W	  X1, &OP2

	MOV.W	  Y3, &MAC
	MOV.W	  X0, &OP2

	MOV.W	  &RESLO, r15

     .if $DEFINED(__LARGE_CODE_MODEL__)
        ADDA      #8, SP
	POP.W     SR
        NOP                             ; CPU19 Compatibility
	RETA
     .else
	ADD.W     #8, SP
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

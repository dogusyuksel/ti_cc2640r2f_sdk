;******************************************************************************
;* MULT64_F5HW.ASM -                                                          *
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

;****************************************************************************
;* __mpyll_f5hw   (int64 = int64 * int64)
;*  
;*   - Operand 1 is in R8/R9/R10/R11
;*   - Operand 2 is in R12/R13/R14/R15
;*   - Result is in R12/R13/R14/R15
;*
;*   Registers used:  R8,R9,R10,R11,R12,R13,R14,R15
;****************************************************************************

;****************************************************************************
; The algorithm used here is patterned off the implementation of __mpyl_hw.
; See the comments for that function in mult32_hw.asm for an explanation.
;****************************************************************************

MPY32L          .equ    0x04D0
MPY32H          .equ    0x04D2
MPYS32L         .equ    0x04D4
MPYS32H         .equ    0x04D6
MAC32L		.equ    0x04D8
MAC32H		.equ    0x04DA
OP2L            .equ    0x04E0
OP2H            .equ    0x04E2
RES0            .equ    0x04E4
RES1            .equ    0x04E6
RES2            .equ    0x04E8
RES3            .equ    0x04EA

     .if __TI_EABI__
        .asg __mspabi_mpyll_f5hw, __mpyll_f5hw
     .endif
	
     .if $DEFINED(__LARGE_CODE_MODEL__)
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif

	.global __mpyll_f5hw

	.sect	".text:__mpyll"
	.clink
	.align 2

__mpyll_f5hw:  .asmfunc stack_usage(6 + RETADDRSZ)

	PUSH.W SR
	DINT
	NOP
    .if $DEFINED(.MSP430X)
	PUSH.W    #2, R13
    .else
	PUSH.W    R13	; In the incredibly unlikely event any
	PUSH.W    R12   ; non-MSP430X hardware has MPY32
    .endif

	MOV.W	  R8, &MPY32L
	MOV.W	  R9, &MPY32H ; Load A low into MPY OP1

	MOV.W     R12, &OP2L
	MOV.W     R13, &OP2H ; Load B low into OP2, trigger MPY

	MOV.W     &RES0, R12
	MOV.W     &RES1, R13 ; Lower 32 bits of A * B ready for return
	
	MOV.W     &RES2, &RES0
	MOV.W     &RES3, &RES1 ; 32-bit right shift A low * B low

	POP.W     &MAC32L
	POP.W     &MAC32H ; Load B low into MAC OP1

	MOV.W     R10, &OP2L
	MOV.W     R11, &OP2H ; Load A high into OP2, trigger MAC

    .if $DEFINED(.MSP430X)
	BRA	  PC ; 3 cycle NOP
    .else
	NOP
	NOP
	NOP
    .endif

	; RES0/1 ready - discard RES2/3

	MOV.W     R14, &MAC32L
	MOV.W     R15, &MAC32H ; Load B high into MAC OP1

	MOV.W     R8, &OP2L
	MOV.W     R9, &OP2H ; Load A low into OP2, trigger MAC

	MOV.W	  &RES0, R14
	MOV.W	  &RES1, R15 ; Upper 32 bits of A * B ready for return

    .if $DEFINED(__LARGE_CODE_MODEL__)
	POP.W  SR                       ; For MSPX, restore interrupt state
                                        ; before 20-bit return.
        NOP                             ; CPU19 Compatibility
        RETA                            ;
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

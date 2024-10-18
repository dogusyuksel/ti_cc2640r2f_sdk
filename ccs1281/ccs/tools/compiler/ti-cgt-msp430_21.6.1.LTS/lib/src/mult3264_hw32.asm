;******************************************************************************
;* MULT3264_HW32.ASM -                                                        *
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
;* __mpysll_hw32   (int64 = (int64)int32 * (int64)int32)
;*  
;*   - Operand 1 is in R12,R13
;*   - Operand 2 is in R14,R15
;*   - Result is in R12,R13,R14,R15
;*
;* To ensure that the multiply is performed atomically, interrupts are disabled
;* upon routine entry. Interrupt state is restored upon exit.
;;
;*   Registers used:  R12,R13,R14,R15
;****************************************************************************

OP1LO		.equ	R12
OP1HI		.equ	R13
OP2LO		.equ	R14
OP2HI		.equ	R15
MPY32L          .equ    0x0140
MPY32H          .equ    0x0142
MPYS32L         .equ    0x0144
MPYS32H         .equ    0x0146
OP2L            .equ    0x0150
OP2H            .equ    0x0152
RES0            .equ    0x0154
RES1            .equ    0x0156
RES2            .equ    0x0158
RES3            .equ    0x015A
	
     .if __TI_EABI__
        .asg __mspabi_mpysll_hw32, __mpysll_hw32
        .asg __mspabi_mpyull_hw32, __mpyull_hw32
     .endif

     .if $DEFINED(__LARGE_CODE_MODEL__)
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif

        .global __mpysll_hw32

	.sect	".text:__mpysll"
	.clink
	.align 2

__mpysll_hw32:	.asmfunc stack_usage(2 + RETADDRSZ)
	PUSH.W	SR			; Save current interrupt state
	DINT				; Disable interrupts
	NOP				; Account for latency
	MOV.W	OP1LO,&MPYS32L		; Load operand 1 Low into multiplier
	MOV.W	OP1HI,&MPYS32H		; Load operand 1 High into multiplier
	MOV.W	OP2LO,&OP2L		; Load operand 2 Low into multiplier
	MOV.W	OP2HI,&OP2H		; Load operand 2 High, trigger MPY
	MOV.W	&RES0,R12		; Ready low 16-bits for return
	MOV.W   &RES1,R13		; 
	MOV.W	&RES2,R14		; 
	MOV.W   &RES3,R15		; Ready high 16-bits for return
    .if $DEFINED(__LARGE_CODE_MODEL__)
	POP.W  SR                       ; For MSPX, restore interrupt state
                                        ; before 20-bit return.
        NOP                             ; CPU19 Compatibility
        RETA                            ;
    .else
	RETI                           
    .endif
	.endasmfunc

;****************************************************************************
;* __mpyull_hw32   (int64 = (int64)uint32 * (int64)uint32)
;*  
;*   - Operand 1 is in R12,R13
;*   - Operand 2 is in R14,R15
;*   - Result is in R12,R13,R14,R15
;*
;* To ensure that the multiply is performed atomically, interrupts are disabled
;* upon routine entry. Interrupt state is restored upon exit.
;;
;*   Registers used:  R12,R13,R14,R15
;****************************************************************************
        .global __mpyull_hw32

	.sect	".text:__mpyull"
	.clink
	.align 2

__mpyull_hw32:	.asmfunc stack_usage(2 + RETADDRSZ)
	PUSH.W	SR			; Save current interrupt state
	DINT				; Disable interrupts
	NOP				; Account for latency
	MOV.W	OP1LO,&MPY32L		; Load operand 1 Low into multiplier
	MOV.W	OP1HI,&MPY32H		; Load operand 1 High into multiplier
	MOV.W	OP2LO,&OP2L		; Load operand 2 Low into multiplier
	MOV.W	OP2HI,&OP2H		; Load operand 2 High, trigger MPY
	MOV.W	&RES0,R12		; Ready low 16-bits for return
	MOV.W   &RES1,R13		; 
	MOV.W	&RES2,R14		; 
	MOV.W   &RES3,R15		; Ready high 16-bits for return
    .if $DEFINED(__LARGE_CODE_MODEL__)
	POP.W  SR                       ; For MSPX, restore interrupt state
                                        ; before 20 bit return.
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

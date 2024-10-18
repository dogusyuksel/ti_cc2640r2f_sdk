;******************************************************************************
;* MULT16_F5HW.ASM -                                                          *
;*                                                                            *
;* Copyright (c) 2007 Texas Instruments Incorporated                          *
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
;* __mpyi_f5hw   (int16 = int16 * int16)
;*  
;*   - Operand 1 is in R12
;*   - Operand 2 is in R13
;*   - Result is in R12
;*
;* To ensure that the multiply is performed atomically, interrupts are disabled
;* upon routine entry. Interrupt state is restored upon exit.
;;
;*   Registers used:  R12,R13
;****************************************************************************
OP1		.equ    R12
OP2		.equ	R13
MPY_OP1		.equ	0x04C0
MPY_OP2		.equ	0x04C8
RESULT		.equ	0x04CA

     .if __TI_EABI__
        .asg __mspabi_mpyi_f5hw, __mpyi_f5hw
     .endif

     .if $DEFINED(__LARGE_CODE_MODEL__)
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif

        .global __mpyi_f5hw

	.text
        .clink
	.align 2

__mpyi_f5hw:  .asmfunc  stack_usage(2 + RETADDRSZ)
	PUSH.W	SR			; Save current interrupt state
	DINT				; Disable interrupts
	NOP				; Account for latency
	MOV.W	OP1,&MPY_OP1		; Load operand 1 into multiplier
	MOV.W	OP2,&MPY_OP2		; Load operand 2 which triggers MPY
	MOV.W	&RESULT, R12		; Move result into return register
    .if $DEFINED(__LARGE_CODE_MODEL__)
	POP.W  SR
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

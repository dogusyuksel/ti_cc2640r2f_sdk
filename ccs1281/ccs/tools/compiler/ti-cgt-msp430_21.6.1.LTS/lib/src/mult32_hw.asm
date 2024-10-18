;******************************************************************************
;* MULT32_HW.ASM -                                                            *
;*                                                                            *
;* Copyright (c) 2003 Texas Instruments Incorporated                          *
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
;* __mpyl_hw   (int32 = int32 * int32)
;*  
;*   - Operand 1 is in R12,R13
;*   - Operand 2 is in R14,R15
;*   - Result is in R12,R13
;*
;* To ensure that the multiply is performed atomically, interrupts are disabled
;* upon routine entry. Interrupt state is restored upon exit.
;;
;*   Registers used:  R12,R13,R14,R15
;****************************************************************************
* A 32X32 multiply with a 64-bit result would be calculated:
*
*                        OP1HI OP1LO
*                     X  OP2HI OP2LO
*            -----------------------------
*                        OP1LO * OP2LO
*     +          OP2LO * OP1HI
*     +          OP1LO * OP2HI
*     +  OP1HI * OP2HI
*   --------------------------------------------------------------        
*        64-bit result
* 
*
* But we need only the lower 32-bits of this calculation.  Therefore the
* OP1HI * OP2HI calculation isn't done at all and the upper half of the 
* OP1LO * OP2HI and OP2LO * OP1HI calculations are thrown away.  Also, the 
* OP1LO * OP2LO must be unsigned, but the signness of the other multiplies
* doesn't matter since the difference always appears in the upper 16-bits.
******************************************************************************

OP1LO		.equ	R12
OP1HI		.equ	R13
OP2LO		.equ	R14
OP2HI		.equ	R15
MPY_OP1		.equ	0x0130
MAC_OP1		.equ	0x0134
MPY_OP2		.equ	0x0138
MAC_OP2		.equ	0x0138
RESULT_LO	.equ	0x013A
RESULT_HI	.equ	0x013C

     .if __TI_EABI__
        .asg __mspabi_mpyl_hw, __mpyl_hw
     .endif

     .if $DEFINED(__LARGE_CODE_MODEL__)
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif

        .global __mpyl_hw

	.text
        .clink
	.align 2

__mpyl_hw:	.asmfunc stack_usage(2 + RETADDRSZ)
	PUSH.W	SR			; Save current interrupt state
	DINT				; Disable interrupts
	NOP				; Account for latency
	MOV.W	OP1LO,&MPY_OP1		; Load operand 1 Low into multiplier
	MOV.W	OP2LO,&MPY_OP2		; Load operand 2 Low which triggers MPY
	MOV.W	OP1LO,&MAC_OP1		; Load operand 1 Low into mac
	MOV.W   &RESULT_LO,R12		; Low 16-bits of result ready for return
	MOV.W   &RESULT_HI,&RESULT_LO  	; MOV intermediate mpy high into low
	MOV.W	OP2HI,&MAC_OP2		; Load operand 2 High, trigger MAC
	MOV.W	OP1HI,&MAC_OP1		; Load operand 1 High
	MOV.W	OP2LO,&MAC_OP2		; Load operand 2 Lo, trigger MAC
	MOV.W	&RESULT_LO, R13         ; Upper 16-bits result ready for return
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

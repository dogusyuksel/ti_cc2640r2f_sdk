;******************************************************************************
;* DIV32S.ASM  -                                                              *
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
     .if __TI_EABI__
	.asg __mspabi_divli, __divli
	.asg __mspabi_remli, __remli
	.asg __mspabi_remul, __remul
	.asg __mspabi_divul, __divul
     .endif
	.global __divli
	.global __remli
	.global __remul
	.global __divul

;****************************************************************************
;* __divli/__remli - DIVIDE TWO SIGNED 32 BIT NUMBERS. RETURNS BOTH QUOTIENT
;*                 AND REMAINDER. 
;****************************************************************************
;*
;*   - Dividend is in R12/R13
;*   - Divisor is in R14/R15
;*   - Quotient is placed in R12/R13
;*   - Remainder is placed in R14/R15
;*
;*   - Divide by zero returns zero
;*
;*   Registers used:  R10,R12,R13,R14,R15
;*
;****************************************************************************
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg RETA,  RET
	.asg CALLA, CALL
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
        .asg PUSHM.A,PUSH
        .asg POPM.A, POP
STACK_USED .set 4
     .else
STACK_USED .set 2
     .endif

	.text
	.align 2

__divli: .asmfunc stack_usage(STACK_USED + RETADDRSZ)
__remli:
	PUSH	R10
	CLR.w	R10
	TST.W	R15		; Determine divisor sign
	JGE	dvd_sign	; If positive, jump to get dividend sign
	INV.W	R14		; Otherwise, negate value
	INV.W	R15
	INC.W	R14
	ADC.W	R15
	BIS.W	#1,R10		; Remember divisor was negative
dvd_sign:
	TST.W	R13		; Test sign of dividend
	JGE	perform_divide	; If positive, ready to do divide
	INV.W	R12		; If negative, negate value
	INV.W	R13
	INC.W	R12
	ADC.W	R13
	INV.W	R10	    	; Establish sign of quotient and remainder
perform_divide:
	CALL	#__divul	; Perform unsigned divide
	BIT.W	#1,R10		; Get sign of quotient
	JEQ	rem_sign	; If positive, quotient is ready
	INV.W	R12		; Otherwise, negate quotient
	INV.W	R13
	INC.W	R12
	ADC.W	R13
rem_sign:
	BIT.W	#2,R10		; Get sign of remainder
	JEQ	div_exit	; If remainder is positive, done
	INV.W	R14		; Otherwise, negate remainder
	INV.W	R15
	INC.W	R14
	ADC.W	R15
div_exit:
	POP	R10
	RET
	.endasmfunc

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)
	.end

;******************************************************************************
;* DIV16S.ASM  -                                                              *
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
	.asg __mspabi_divi, __divi
	.asg __mspabi_remi, __remi
	.asg __mspabi_remu, __remu
	.asg __mspabi_divu, __divu
     .endif
	.global __divi
	.global __remi
	.global __remu
	.global __divu

;****************************************************************************
;* __divi/__remi - DIVIDE TWO SIGNED 16 BIT NUMBERS. RETURNS BOTH QUOTIENT
;*               AND REMAINDER. 
;****************************************************************************
;*
;*   - Dividend is in R12
;*   - Divisor is in R13
;*   - Quotient is placed in R12
;*   - Remainder is placed in R14
;*
;*   - Divide by zero returns zero
;*
;*   Registers used:  R11,R12,R13,R14,R15
;*
;*   NOTE: __divi assumes that: __divu does not use R11
;*                              __divu returns quotient in R12
;*                              __divu returns remainder in R14
;****************************************************************************
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg RETA, RET
	.asg CALLA,CALL
        .asg 4,    RETADDRSZ
     .else
        .asg 2,    RETADDRSZ
     .endif

	.text
	.align 2

__divi:	.asmfunc stack_usage(RETADDRSZ)
__remi:
	CLR	R11
	TST	R13		; Determine divisor sign
	JGE	dvd_sign	; If positive, jump to get dividend sign
	INV	R13		; If negative, negate value and...
	INC	R13
	BIS	#1,R11		; Remember divisor was negative
dvd_sign:
	TST	R12		; Test sign of divisor
	JGE	perform_divide	; If positive, ready to do divide
	INV	R12		; If negative, negate value
	INC	R12		
	INV	R11	    	; Establish sign of quotient and remainder
perform_divide:
	CALL	#__divu		; Perform unsigned divide
	BIT	#1,R11		; Get sign of quotient
	JEQ	rem_sign	; If positive, quotient is ready
	INV	R12		; If negative, negate quotient
	INC	R12
rem_sign:
	BIT	#2,R11		; Get sign of remainder
	JEQ	div_exit	; If remainder is positive, done
	INV	R14		; If negative, negate remainder
	INC	R14
div_exit:
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

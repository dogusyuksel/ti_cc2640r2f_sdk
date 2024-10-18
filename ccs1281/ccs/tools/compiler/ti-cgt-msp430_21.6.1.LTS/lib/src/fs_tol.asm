;******************************************************************************
;*                                                                            *
;*  FS_TOL -                                                                  *
;*  Convert a single precision floating point number to a long integer.       *
;*                                                                            *
;* Copyright (c) 1992 Texas Instruments Incorporated                          *
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
;*                                                                            *
;******************************************************************************
*                                                                             *
* CALLER SETUPS: R12/R13 contains operand                                     *
*                Result returned in R12/R13                                   *
*                                                                             *
* SAVES CONTEXT: None                                                         *
*                                                                             *
*******************************************************************************
*                                                                             *
*   IEEE floating point numbers representation (32 bits) :                    *
*                                                                             *
*   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+         *
*   |31 |30 |29 |28 |27 |26 |25 |24 |23 |22 |21 |20 |19 |18 |17 |16 |         *
*   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+         *
*   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |         *
*   | S |E7 |E6 |E5 |E4 |E3 |E2 |E1 |E0 |M22|M21|M20|M19|M18|M17|M16|         *
*   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |         *
*   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+         *
*                                                                             *
*   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+         *
*   |15 |14 |13 |12 |11 |10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |         *
*   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+         *
*   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |         *
*   |M15|M14|M13|M12|M11|M10|M9 |M8 |M7 |M6 |M5 |M4 |M3 |M2 |M1 |M0 |         *
*   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |         *
*   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+         *
*                                                                             *
*                                                                             *
*   Single precision floating point format is a 32 bit format                 *
*   consisting of a 1 bit sign field, an 8 bit exponent field, and a          *
*   23 bit mantissa field.  The fields are defined as follows.                *
*                                                                             *
*   Sign <S>          : 0 = positive values ; 1 = negative values             *
*                                                                             *
*   Exponent <E7-E0>  : offset binary format                                  *
*                       00 = special cases (i.e. zero)                        *
*                       01 = exponent value + 127 = -126                      *
*                       FE = exponent value + 127 = +127                      *
*                       FF = special cases (not implemented)                  *
*                                                                             *
*   Mantissa <M22-M0> : fractional magnitude format with implied 1            *
*                       1.M22M21...M1M0                                       *
*                                                                             *
*   Range             : -1.9999998 e+127 to -1.0000000 e-126                  *
*                       +1.0000000 e-126 to +1.9999998 e+127                  *
*                       (where e represents 2 to the power of)                *
*                       -3.4028236 e+38  to -1.1754944 e-38                   *
*                       +1.1754944 e-38  to +3.4028236 e+38                   *
*                       (where e represents 10 to the power of)               *
*                                                                             *
*******************************************************************************
*      IMPLEMENTATION :                                                       *
*                                                                             *
*  A is unpacked into sign, exponent, and two words of mantissa. If the       *
*  exponent exceeds a value of 157 then an overflow has occurred and a        *
*  saturated value will be returned. For all exponents less than 127 the      *
*  value of zero is returned. Within the exponent range of 127 through        *
*  157, the denormalized result is truncated to thirty-two bits and the       *
*  properly signed result is stored into its destination.                     *
*                                                                             *
*******************************************************************************
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg RETA,RET
        .asg 4,    RETADDRSZ
     .else
        .asg 2,    RETADDRSZ
     .endif

*******************************************************************************
*      DEFINE REGISTER NAMES                                                  *
*******************************************************************************
AHI	    .set	R13
ALO	    .set	R12
AMANHI	    .set	R14	; A mantissa, high word
AMANLO      .set	R12	; A mantissa, low word/result
AEXP	    .set	R11	; A exponent
RESULT_LO   .set	R12	; destination of result low 16 bits
RESULT_HI   .set	R13	; destination of result hi  16 bits

     .if __TI_EABI__
        .asg __mspabi_fixfli, __fs_tol
     .endif
	
	.global __fs_tol

	.text
	.align 2

*******************************************************************************
*      CONVERSION OF FLOATING POINT FORMAT - UNPACK                           *
*   Test A for special case treatment of zero.                                *
*   Split the MSW of A into exponent and high word of mantissa.               *
*     Keep the exponent into its register [0000 0000 EEEE EEEE].              *
*     Add the implied one to the mantissa value.                              *
*     Keep the mantissa into its register [0000 0000 1MMM MMMM].              *
*   Load the low word of mantissa into its register.                          *
*******************************************************************************
__fs_tol:	.asmfunc stack_usage(RETADDRSZ)

	MOV	AHI,AEXP	; load A exponent
	MOV	AEXP,AMANHI	; load A mantissa
	AND	#0x7F80,AEXP	; keep exponent only [0EEE EEEE E000 0000]
	JEQ	A_ZERO		; special case process if A is zero

	RLA	AEXP
	SWPB	AEXP	        ; right-align exponent [0000 0000 EEEE EEEE]
	BIS.B   #0x80,AMANHI	; add the implied bit [0000 0000 1MMM MMMM]

*******************************************************************************
*      EXPONENT EVALUATION                                                    *
*   Test the exponent to determine into which of the three cases it belongs.  *
*     Case 1 : exponent < 127 ; 127 is the exponent for integer value 1.      *
*              Result returned is 0 since the absolute value is less than 1.  *
*     Case 2 : exponent > 158 ; 158 is the exponent for integer values        *
*              in the absolute range from 8000 0000h to FFFF FFFFh.           *
*              Result returned is 7FFF FFFFh or 8000 0000h (the largest       *
*              32-bit value).                                                 *
*     Case 3 : exponent in the range of 127 to 157 inclusive will result      *
*              in 32-bit signed integer values from -2147483647 to +2147483647*
*     Case 4 : exponent = 158 ; if the value is -2147483648, it is normally   *
*              returned ; else an overflow is generated.                      *
*******************************************************************************

	SUB	#127,AEXP	; unbias exponent
	JN	UNDERFLOW	; underflow if exponent < 0
	CMP	#31,AEXP
	JEQ	EXP_IS_31
	JGE	OVERFLOW	; overflow if exponent > 31

*******************************************************************************
*      NORMAL REPRESENTABLE 32-BIT RESULTS                                    *
*   Prescale mantissa [01MM MMMM MMMM MMMM] [MMMM MMMM M000 0000].            *
*   Convert to integer by shifting mantissa right 30-exponent bits.           *
*   Restore sign bit (in AHI [Sxxx xxxx xxxx xxxx]).                          *
*******************************************************************************

	SUB	#23,AEXP	; Adjust exponent to reflect current mantissa
	JN	SHIFT_MAN_RIGHT

CONVERT:
	SUB	#1,AEXP		; shift mantissa left by value in exponent
	JN	ADD_SIGN
	RLA	AMANLO
	RLC	AMANHI
	JMP 	CONVERT

SHIFT_MAN_RIGHT
	RRA	AMANHI		; shift mantissa right by value in exponent
	RRC	AMANLO
	ADD	#1,AEXP	
	JEQ	ADD_SIGN
	JMP	SHIFT_MAN_RIGHT

ADD_SIGN
	TST	AHI		; negate, if necessary
	JGE	DONE

	INV	AMANHI
	INV	AMANLO
	ADD	#1,AMANLO
	ADC	AMANHI

*******************************************************************************
*   Write result into return register                                         *
*   Return								      *
*******************************************************************************

DONE	MOV	AMANHI,RESULT_HI
 	RET


*******************************************************************************
*      SPECIAL CASES PROCESSING                                               *
*   The result registers are AMANHI:AMANLO.                                   *
*   Exponent is 31 :                                                          *
*     Compare the value to -2147483648 ; return it if equal ; generate an     *
*     overflow otherwise.                                                     *
*   Overflow :                                                                *
*     Call _fp_error function with error code 0.                              *
*     Load 7FFF FFFFh/8000 0000h into AMANHI:AMANLO and continue result       *
*     storage.                                                                *
*   Underflow / Zero :                                                        *
*     Load 0 into AMANHI:AMANLO and continue with result storage.             *
*******************************************************************************

EXP_IS_31
	BIS	#0x100,AMANHI
ALIGN	RLA	AMANLO
	RLC	AMANHI
	JC	ALIGN

	RRA	AMANHI
	RRC	AMANLO

	CMP	#0x4000,AMANHI 	; overflow if absolute value > 80000000h
	JEQ	CHECK_NEG
	JMP	OVERFLOW

CHECK_NEG:
	TST	AHI
	JGE	OVERFLOW	; overflow if value is not -32768

RETURN_MAX_NEG			; return -2147483648
	MOV	#0x8000,RESULT_HI
	MOV	#0,RESULT_LO
	RET


OVERFLOW
;	MOV	#0,R12
;	CALL	#_fp_error	; call error routine

	TST	AHI
	JN	RETURN_MAX_NEG	; return 8000h if negative

	MOV	#0x7FFF,RESULT_HI	; return 7FFFh if positive
	MOV	#-1,RESULT_LO
       	RET

A_ZERO
UNDERFLOW
	MOV	#0,RESULT_HI
	MOV	#0,RESULT_LO
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

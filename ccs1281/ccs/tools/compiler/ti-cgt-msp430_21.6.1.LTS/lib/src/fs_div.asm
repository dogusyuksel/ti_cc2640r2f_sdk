;******************************************************************************
;*                                                                            *
;*  FS_DIV -                                                                  *
;*  Divide two floating point numbers, single precision.                      *
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
;*                                                                            *
;******************************************************************************
*                                                                             *
* CALLER SETUPS: R12/R13 contains operand A (dividend)                        *
*                R14/R15 contains operand B (divisor)                         *
*                Result returned in R12                                       *
*                                                                             *
* SAVES CONTEXT: R7,R8,R9,R10                                                 *
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
*   A and B are each unpacked into sign, exponent, and two words of mantissa. *
*   If either exponent is zero, special case processing is initiated. The     *
*   exponents are summed. If the result is less than zero, underflow has      *
*   occurred. If the result is zero, underflow may have occurred. If the      *
*   result is equal to 254, overflow may have occurred.  If the result is     * 
*   greater than 254, overflow has occurred. Underflow processing returns a   *
*   value of zero. Overflow processing returns the largest magnitude value    *
*   along with the appropriate sign. If no special cases are detected, a      *
*   24x24-bit divide is executed. The result of the eXclusive OR of the       *
*   sign bits, the sum of the exponents and the 24 bit truncated mantissa are *
*   packed and returned.                                                      *
*                                                                             *
*******************************************************************************

*******************************************************************************
*      DEFINE REGISTER NAMES                                                  *
*******************************************************************************
COUNTER	.set	R10	; loop counter

AMANLO	.set	R12	; A mantissa, low word
AMANHI	.set	R13	; A mantissa, high word
AHI	.set	R13

BMANLO	.set	R14	; B mantissa, low word
BMANHI	.set	R15	; B mantissa, high word
BHI	.set	R15

AEXP	.set	R11
REXP	.set	R11
BEXP	.set	R10
RMANLO	.set	R8
RMANHI	.set	R9
SIGN	.set	R7

     .if $DEFINED(__LARGE_CODE_MODEL__)
        .asg 4, RETADDRSZ
     .else
        .asg 2, RETADDRSZ
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
STACK_USED  .set  16
        .else
STACK_USED  .set  8
     .endif

     .if __TI_EABI__
        .asg __mspabi_divf, __fs_div
     .endif
	
	.global	__fs_div

	.text
	.align 2

*******************************************************************************
*      FLOATING-POINT FUNCTION PROLOG                                         *
*   FS_DIV                                                                    *
*   Save used registers.                                                      *
*******************************************************************************
__fs_div: .asmfunc stack_usage(STACK_USED + RETADDRSZ)

     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
	PUSHM.A #4,R10
     .else
	PUSH	R10
	PUSH	R9
	PUSH	R8
	PUSH	R7
     .endif

*******************************************************************************
*      SIGN EVALUATION                                                        *
*   Exclusive OR sign bits of A and B to determine sign of result.            *
*******************************************************************************

	MOV	BHI,SIGN
	XOR	AHI,SIGN	; sign bit of result in bit 15 of SIGN

*******************************************************************************
*      CONVERSION OF FLOATING POINT FORMAT - UNPACK                           *
*   Process B first to detect "divide by zero" condition.                     *
*   Load the low word of mantissa into its register.                          *
*   Test B for special case treatment of zero.                                *
*   Split the MSW of B into exponent and high word of mantissa.               *
*     Keep the exponent into its register [0000 0000 EEEE EEEE].              *
*     Add the implied one to the mantissa value.                              *
*     Keep the mantissa into its register [0000 0000 1MMM MMMM].              *
*******************************************************************************

	MOV	BHI,BEXP	; extract B exponent and mantissa
	RLA	BEXP		; move B exponent into low byte
	SWPB	BEXP
	MOV.B	BEXP,BEXP
	TST	BEXP		; test for B == 0
	JEQ	B_ZERO

	BIS.B   #0x80,BHI	; add implied 1

*******************************************************************************
*      CONVERSION OF FLOATING POINT FORMAT - UNPACK                           *
*   Load the low word of mantissa into its register.                          *
*   Test A for special case treatment of zero.                                *
*   Split the MSW of A into exponent and high word of mantissa.               *
*     Move the exponent into its register [0000 0000 EEEE EEEE].              *
*     Add the implied one to the mantissa value.                              *
*     Keep the mantissa into its register [0000 0000 1MMM MMMM].              *
*******************************************************************************

	MOV	AHI,AEXP	; copy hi A to extract exponent
	RLA	AEXP		; move A exponent into low byte
	SWPB	AEXP
	MOV.B	AEXP,AEXP
	TST	AEXP		; test for A == 0
	JEQ	A_ZERO

	BIS.B   #0x80,AHI	; add implied 1

*******************************************************************************
*      EXPONENT DIFFERENCE                                                    *
*   Sum the exponents of A and B to determine the result exponent. Since the  *
*   exponents are biased (excess 127), the bias must be restored as the       *
*   difference nullified it.                                                  *
*   The division will be processed even if an overflow or an underflow occurs *
*   at this step. These conditions will be checked later.                     *
*******************************************************************************

	SUB	BEXP,AEXP	; result in REXP (same as AEXP)
	ADD	#127,REXP	; restore bias

*******************************************************************************
*        DIVISION LOOP FOR MANTISSA                                           *
*******************************************************************************

	MOV	#24,COUNTER	      	; Mantissa length to COUNTER
	CLR	RMANLO
	CLR	RMANHI

FD4	SUB	BMANLO,AMANLO     	; ARG1 - ARG2
	SUBC	BMANHI,AMANHI     	
	JC	FD3		      	; ARG1 >= ARG2
	ADD	BMANLO,AMANLO     	; ARG1 < ARG2: restore ARG1
	ADDC	BMANHI,AMANHI     	
	CLRC			      	
FD3	RLC	RMANLO		      	; Carry to result
	RLC	RMANHI
	RLA	AMANLO		      
	RLC	AMANHI		      
	DEC	COUNTER 	      	; If division is not finished:
	JNZ	FD4		      	; continue loop

	TST.B	RMANHI		      	; Hidden bit set (normalized)?
	JN	FD5		      	; Yes
	INC	COUNTER 	      	; No, go through loop once more
	DEC	REXP		      	; Correct exponent
	JMP	FD4		      	

*******************************************************************************
* Result in RESULT: 80 0000 to FF FFFE
* Rounding is made with LSB-1
*******************************************************************************
FD5	SUBC	BMANLO,AMANLO     	; Calculate LSB-1, carry is set
	SUBC	BMANHI,AMANHI     	; Rounding info in Carry

	ADC	RMANLO      		; Round mantissa with LSB-1
	ADC.B	RMANHI
	ADC	REXP		      	; Round exponent with Carry

*******************************************************************************
* CHECK FOR EXPONENT UNDERFLOW/OVERFLOW
*******************************************************************************

CHECK_EXP
	CMP	#1,REXP
	JL	UNDERFLOW		; check for underflow (exp <= 0)
	CMP	#255,REXP
	JGE	OVERFLOW		; check for overflow (exp >= 255)


*******************************************************************************
*      CONVERSION OF FLOATING POINT FORMAT - PACK                             
*  Entry :                                                                    
*     Mantissa in RMANHI,RMANLO  [0000 0000 0MMM MMMM] [MMMM MMMM MMMM MMMM]  
*     Exponent in REXP        [0000 0000 EEEE EEEE]                           
*     Sign of mantissa in SIGN [Sxxx xxxx xxxx xxxx]                          
*  Exit :                                                                    
*   Packed number in RMANHI,RMANLO [SEEE EEEE EMMM MMMM] [MMMM MMMM MMMM MMMM]
*******************************************************************************
	RLA.B	RMANHI       		; clear hidden Bit (and higher byte)

	SWPB	REXP			; mov exp to upper bit
	BIS	REXP,RMANHI		; pack sign and exponent
	RLA	SIGN
	RRC	RMANHI			; shift in sign

*******************************************************************************
*      STORE RESULT INTO DESTINATION                                          *
*   Write result.                                                             *
*   Return                                                                    *
*******************************************************************************

STORE_R
	MOV	RMANHI,R13		; move result into return registers
	MOV	RMANLO,R12		
EPILOG
A_ZERO:				; 0.0 already in the result area
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
	POPM.A  #4,R10
     .else
	POP	R7
	POP	R8
	POP	R9
	POP	R10
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__)
	RETA
     .else
	RET
     .endif

*******************************************************************************
*      UNDERFLOW PROCESSING                                                   *
*   Call _fp_error function with error code 0.                                *
*   Store null result into destination registers.                             *
*   Continue with return process.                                             *
*******************************************************************************

UNDERFLOW
;	CLR	R12		; pass 0
;	CALL	#_fp_error	; call error routine

	CLR	R12		; return 0.0
	CLR	R13
	JMP	EPILOG

*******************************************************************************
*      OVERFLOW PROCESSING                                                    *
*   Entry : sign of mantissa in SIGN [Sxxx xxxx xxxx xxxx]                    *
*   Call _fp_error function with error code 0.                                *
*   Store infinity result into destination registers.                         *
*   Continue with mantissa sign update and store result process.              *
*******************************************************************************

OVERFLOW
B_ZERO
;	R12			; pass 0
;	CALL	#_fp_error	; call error routine

	MOV	#0xFEFF,R12	; destination registers are REXP:RMANLO
	MOV	#0xFFFF,R13
	RLA	SIGN
	RRC	R13   		; shift in sign
	JMP	EPILOG

        NOP                     ; CPU40 Compatibility NOP

	.endasmfunc


;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)
	.end

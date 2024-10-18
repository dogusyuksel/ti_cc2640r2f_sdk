;******************************************************************************
;*                                                                            *
;*  FS_CMP -                                                                  *
;*  Compare two floating point numbers, single precision.                     *
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
* CALLER SETUPS: R12/R13 contains operand A                                   *
*                R14/R15 contains operand B                                   *
*                Result returned in R12                                       *
* 		 A == B return 0                                              *
*	         A >  B return 1                                              *
* 	         A <  B return -1                                             *
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
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg  RETA,RET
        .asg 4,    RETADDRSZ
     .else
        .asg 2,    RETADDRSZ
     .endif

*******************************************************************************
*      DEFINE REGISTER NAMES                                                  *
*******************************************************************************

TMP	.set	R11	; for temporaries
AHI_REG	.set	R13	; A high word
ALO_REG	.set	R12
BHI_REG	.set	R15	; B high word
BLO_REG	.set	R14

     .if __TI_EABI__
        .asg __mspabi_cmpf, __fs_cmp
     .endif
	
	.global		__fs_cmp

	.text
	.align 2

*******************************************************************************
* SINGLE-PRECISION FLOATING-POINT COMPARE                                     *
*                                                                             *
* For the purposes of comparison, view floating point representation as one   *
* bit for sign and the remaining bits for magnitude.  This is very different  *
* from 2's complement representation that the compare/branch instructions     *
* depend on.  What this routine does is examine the sign bits and then        *
* performs a comparison of the magnitude of the numbers.  Since the numbers   *
* are compared only in magnitude, THIS ROUTINE MUST BE FOLLOWED BY AN         *
* *UNSIGNED* BRANCH.                                                          *
*******************************************************************************

*******************************************************************************
* DETERMINE IF THE SIGN BITS ARE DIFFERENT                  
*******************************************************************************
__fs_cmp:	.asmfunc stack_usage(RETADDRSZ)

	MOV	AHI_REG,TMP	; load a into tmp
	XOR	BHI_REG,TMP	; xor b into tmp

	JN	CHECK_NEG_ZERO_CMP	; if MSB(tmp) == 1, signs are different

*******************************************************************************
* SIGNS ARE THE SAME, SEE IF THE OPERANDS ARE NEGATIVE
*******************************************************************************
	TST	AHI_REG		
	JN	BOTH_NEG	

*******************************************************************************
* BOTH OPERAND ARE POSITIVE, COMPARE MAGNITUDE BY COMPARING IN THE USUAL ORDER
*******************************************************************************
	CMP	BHI_REG,AHI_REG
	JEQ	CMP_LO
	JGE	RET_A_GT_B
	JMP	RET_B_GT_A

CMP_LO
	CMP	BLO_REG,ALO_REG
	JEQ	RET_A_EQ_B
	JLO	RET_B_GT_A
	JMP	RET_A_GT_B

*******************************************************************************
* SIGNS ARE DIFFERENT, THE STATUS DETERMINED ENTIRELY BY THE SIGN BITS.
* COMPARE IN REVERSE ORDER SO 1 (NEGATIVE) WILL APPEAR LESS THAN 0 (POSITIVE)
*******************************************************************************
CHECK_NEG_ZERO_CMP
	BIT	#0x7F80,AHI_REG 	; Examine exponent, treat denorm as 0
	JNZ	DIFF_SIGNS		
	BIT	#0x7F80,BHI_REG
	JNZ	DIFF_SIGNS
	JEQ	RET_A_EQ_B

DIFF_SIGNS
	CMP	BHI_REG,AHI_REG
	JGE	RET_A_GT_B
	JMP	RET_B_GT_A


*******************************************************************************
* BOTH OPERANDS ARE NEGATIVE, COMPARE MAGNITUDE BY COMPARING IN REVERSE ORDER
*******************************************************************************
BOTH_NEG
	CMP	AHI_REG,BHI_REG
	JEQ	NEG_CMP_LO
	JGE	RET_A_GT_B
	JMP	RET_B_GT_A

NEG_CMP_LO
	CMP	ALO_REG,BLO_REG
	JEQ	CMP_LO
	JLO	RET_B_GT_A
	JMP	RET_A_GT_B

*******************************************************************************
* Set up return values         
*******************************************************************************
RET_B_GT_A
	MOV 	#-1,R12
	RET
RET_A_GT_B	
	MOV 	#1,R12
	RET
RET_A_EQ_B
	MOV	#0,R12
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

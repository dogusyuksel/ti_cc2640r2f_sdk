;******************************************************************************
;* FS_ADD.ASM  -                                                              *
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
*                                                                             *
*   FS_ADD                                                                    *
*   Add two floating point numbers, IEEE single precision.                    *
*                                                                             *
*******************************************************************************
*                                                                             *
* CALLER SETUPS: R12/R13 contains operand A                                   *
*                R14/R15 contains operand B                                   *
*                R12/R13 contains result                                      *
*                                                                             *
* SAVES CONTEXT: Saves/Restores R7-R10                                        *
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
	   .asg RETA,  RET
           .asg 4,     RETADDRSZ
     .else
           .asg 2,     RETADDRSZ
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
	   .asg PUSHM.A, PUSH
	   .asg POPM.A,  POP
STACK_USED .set 18
     .else
STACK_USED .set 10
     .endif

     .if __TI_EABI__
        .asg __mspabi_addf, __fs_add
        .asg __mspabi_subf, __fs_sub
     .endif
	
	.global __fs_add, __fs_sub

*******************************************************************************
*      DEFINE REGISTER NAMES                                                  *
*******************************************************************************

AMANLO	.set	R12
AMANHI	.equ	R13
BMANLO	.equ	R14
BMANHI	.equ	R15
REXP	.equ	R7
TEMP	.equ	R8
RMANLO	.equ	R9
RMANHI	.equ	R10
OPTYPE	.equ	R11


	.text
	.align 2

*******************************************************************************
*  Floating point addition
*******************************************************************************
__fs_sub:	.asmfunc stack_usage(STACK_USED + RETADDRSZ)

	MOV	#0x80,OPTYPE	; Set Subtraction Bit (OPTYPE.7)
	JMP	START	

*******************************************************************************
*  Floating point addition
*******************************************************************************
__fs_add: 
	CLR	OPTYPE	; Clear Subtraction Bit (OPTYPE.7)

*******************************************************************************
*  Set up frame
*******************************************************************************
START
	PUSH	R10
	PUSH	R9
	PUSH	R8
	PUSH	R7      	; Save SOE registers
     .if $DEFINED(__LARGE_DATA_MODEL__)
	SUBA	#2,SP
     .else
	SUB	#2,SP
     .endif

*******************************************************************************
* Special treatment if one of the arguments is 0.
*******************************************************************************
	BIT	#0x7F80,BMANHI  ; If B = 0: (treat denormalized nums as 0)
	JZ	FLT_END		; Result is A (already in the return registers)
	BIT	#0x7F80,AMANHI
	JNZ	REPACK		; If both arguments are non-zero, jump to next

*******************************************************************************
* if A is zero and B is non-zero, return B if adding, and -B if subtracting
*******************************************************************************
	MOV	BMANLO,AMANLO	; A = 0:
	MOV	BMANHI,AMANHI	 
	SWPB	OPTYPE		; change sign if subtraction
	XOR	OPTYPE,AMANHI 	
	JMP	FLT_END         ; Result is return register     

*******************************************************************************
* Initialize the registers with the values of the input arguments.
*******************************************************************************
REPACK
	RLA	AMANHI		; Repack A so that exponent is in upper byte
	MOV	AMANHI,TEMP	; save off exponent << 1
	RRC.B	AMANHI
	AND	#0xFF00,TEMP
	BIS	TEMP,AMANHI

	RLA	BMANHI		; Repack A so that exponent is in upper byte
	MOV	BMANHI,TEMP	; save off exponent << 1
	RRC.B	BMANHI
	AND	#0xFF00,TEMP
	BIS	TEMP,BMANHI

	MOV	AMANLO,RMANLO	; Copy A 1 to RESULT
	MOV	AMANHI,RMANHI
	AND	#0x80,AMANHI	; Copy sign of A to stack
	MOV.B	AMANHI,0(SP)	

*******************************************************************************
* Create the operation bit (OPTYPE.7) with the following operation:
* (subtraction bit) .XOR. (sign A) .XOR. (sign B)
* Operation bit = 0:   addition is needed
* Operation bit = 1:   subtraction is needed
*******************************************************************************
	XOR	RMANHI,OPTYPE 
	XOR	BMANHI,OPTYPE	
	BIC	#0xFF7F,OPTYPE	

*******************************************************************************
* Prepare for ADD/SUB
*   Add implied 1's to operands
*   It is assumed that |A| > |B| !
*   If this is not true the arguments are exchanged and the sign is
*   modified so that the result is correct.
*   The sign of the |greater argument| is the result's sign.
*******************************************************************************
	BIS	#0x80,RMANHI 	; Set hidden bits to one
	BIS	#0x80,BMANHI	

	CMP	BMANHI,RMANHI	; Compare the MSBs
	JNE	TEST_HI
	CMP	BMANLO,RMANLO   ; Compare the LSBs
	JEQ	A_EQ_B	        ; |A| = |B|
TEST_HI	JHS	A_GT_B	        ; |A| > |B|

*******************************************************************************
; |A| < |B|
; B is written to RESULT.
; A is copied to B.
; If the operation is subtraction (operation bit = 1, OPTYPE.7)
; the sign of the result is the inverted sign of A.
*******************************************************************************
	MOV	BMANHI,AMANHI     ; Exchange MSBs
	MOV	RMANHI,BMANHI
	MOV	AMANHI,RMANHI
	MOV	BMANLO,AMANLO     ; Exchange LSBs
	MOV	RMANLO,BMANLO
	MOV	AMANLO,RMANLO
	XOR	OPTYPE,0(SP)	  ; Correct sign of result
	JMP	A_GT_B

*******************************************************************************
* |A| = |B| Result is zero if subtraction
*******************************************************************************
A_EQ_B
	TST	OPTYPE		; Check operation: 0 = ADD
	JNZ	RES0		; If subtraction: result = 0

*******************************************************************************
* Build exponent: Aexp - Bexp = TEMP.  Result Rexp = Aexp
*******************************************************************************
A_GT_B
	CLR	AMANLO	      	; Clear AMANLO, will be used to hold rounding
	MOV	RMANHI,TEMP    	; Store the difference of the
	SWPB	TEMP 	      	; Exponents in TEMP
	MOV.B	TEMP,REXP	; Save result exponent
	SWPB	BMANHI	      	; Swap Bexp
	SUB.B	BMANHI,TEMP     ; To lower byte, build difference
	SWPB	BMANHI	      	; and back again to higher byte
	JZ	DO_ADD_SUB	; If exponents are equal then start operation

*******************************************************************************
* If the difference of the exponents of the arguments (stored in TEMP)
* is greater than the number of bits in the mantissa - it is the same as an
* addition or subtraction with zero. No operation is made in this case.
*
* Otherwise the mantissa of the smaller argument (B) is shifted right
* until the exponent of the smaller argument equals the exponent of
* the greater argument (RESULT).
* AMANLO.15 is used to store the LSB-1 for rounding
*******************************************************************************
	CMP	#24+1,TEMP	; If difference of the exponents > mlength
	JHS	PACK_RESULT	; then result is the value in A

ALIGN	
	CLRC			
	RRC.B	BMANHI		; Rotate right B until B is aligned with A
	RRC	BMANLO
	RRC	AMANLO
	BIT	#0x1000, AMANLO ;  If sticky bit was set
	JZ	SKIP_STICKY_SET
	BIS	#0x2000, AMANLO ;  set it again
SKIP_STICKY_SET		
	DEC	TEMP 		
	JNZ	ALIGN

*******************************************************************************
* Exponents are equal: Ready for the addition or subtraction
*******************************************************************************
DO_ADD_SUB
	TST	OPTYPE		; OPTYPE contains operation bit
	JZ	DO_ADD		; Jump if addition (bit = 0)

*******************************************************************************
* Subtraction with rounding.
*******************************************************************************
	SUB	AMANLO,TEMP	; Subtract guard, round and sticky bits.
	SUBC	BMANLO,RMANLO   ; Subtraction A - B
	SUBC.B	BMANHI,RMANHI
	MOV	TEMP,AMANLO

SUB_NORM
	TST.B	RMANHI		; If hidden bit is set: finished
	JN	ROUND		; else shift left result until MSB = 1
	RLA	AMANLO		; Stored LSB-1 of BMANLO to Carry
	RLC	RMANLO		; corrects 1st rounding by 1 bit
	RLC.B	RMANHI
	DEC	REXP		; Decrement exponent of result:
	JEQ	UNDERFLOW	; Exponent = 0 Underflow
	JMP	SUB_NORM	; Exponent > 0 Loop

*******************************************************************************
* Addition with rounding
*******************************************************************************
DO_ADD	ADD	BMANLO,RMANLO   ; Addition  A + B
	ADDC.B	BMANHI,RMANHI

	JNC	ROUND		; Jump if no mantissa overflow
	RRC.B	RMANHI	      	; Shift right mantissa one bit
	RRC	RMANLO
	RRC	AMANLO	      	; Save the LSB-1
	BIT	#0x1000, AMANLO ;  Reset sticky bit after shift if necessary
	JZ	SKIP_PRESERVE_STICKY
	BIS	#0x2000, AMANLO
SKIP_PRESERVE_STICKY	
	INC	REXP		; Increment exponent of result

ROUND
	BIT	#0x8000, AMANLO
	JZ	ROUND_DONE	; If guard bit is 0, do not round
	ADC	RMANLO	      	; Round mantissa up with 1 (C set by BIT test)
	ADC.B	RMANHI
	ADC	REXP		; Round exponent with Carry
	BIT	#0x6000, AMANLO
	JNZ	ROUND_DONE
	BIC	#0x0001, RMANLO
	
ROUND_DONE	
	CMP	#1,REXP
	JL	UNDERFLOW
	CMP	#0xFF,REXP	; Exponent = 255, overflow
	JGE	OVERFLOW

*******************************************************************************
* Assemble the result value
*******************************************************************************
PACK_RESULT
	BIC.B	#0x80,RMANHI     ; Clear hidden Bit (and higher byte)
	SWPB	REXP		 ; Position sign and exponent
	RLA.B	0(SP)
	RRC	REXP
	BIS	REXP,RMANHI      ; Insert exponent and sign bit

*******************************************************************************
* Place result in R12/R13 return registers
*******************************************************************************
EXIT	
	MOV	RMANLO,R12  
	MOV	RMANHI,R13

     .if $DEFINED(__LARGE_DATA_MODEL__)
FLT_END	ADDA	#2,SP
     .else
FLT_END ADD	#2,SP
     .endif
	POP	R7
	POP	R8
	POP	R9
	POP	R10	     	; Restore SOE Registers
	RET

*******************************************************************************
* Handle underflow and A + B = 0.0 
*******************************************************************************
UNDERFLOW			; Underflow: Result = 0
;	CLR	R12
;	CALL	#__fp_error
RES0
        CLR     R13	    
        CLR     R12
        JMP    	FLT_END         ; To normal completion

*******************************************************************************
* Handle overflow
*******************************************************************************
OVERFLOW			; Overflow: Insert largest signed number
;	CLR	R12
;	CALL	#__fp_error	
	MOV	#0xFEFF,R13
	RLC.B	0(SP)
	RRC	R13	      	; Insert sign
	MOV	#0xFFFF,R12    	
	JMP	FLT_END	     

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

;******************************************************************************
;*                                                                            *
;*  FS_UTOF -                                                                 *
;*  Convert an unsigned integer to a single precision floating point number.  *
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
*******************************************************************************
*                                                                             *
* CALLER SETUPS: R12  contains operand A                                      *
*                Result returned in R12/R13                                   *
*                                                                             *
* SAVES CONTEXT: None                                                         *
*                                                                             *
*******************************************************************************
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
*  The special case 0 is detected and processed properly.                     *
*  The absolute value of the integer is normalized through left shifts.       *
*  The exponent is determined by decrementing from the assumed maximum        *
*  value. The sign, exponent, and normalized mantissa (implied one bit        *
*  removed) are packed and stored in the result area.                         *
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

SOURCE	.set 	R12
RMANHI	.set	R13	; Result mantissa, high word
RMANLO	.set	R12	; Result mantissa, low word
REXP	.set	R11	; Result exponent
COUNTER	.set	R14

     .if __TI_EABI__
        .asg __mspabi_fltuf, __fs_utof
     .endif
	
	.global __fs_utof

	.text
	.align 2

*******************************************************************************
*      INTEGER EVALUATION                                                     *
*   Test the integer to determine into which of the two cases it belongs.     *
*     Case 1 : value is 0 ; requires special processing.                      *
*     Case 2 : all other values.                                              *
*******************************************************************************

__fs_utof: 	.asmfunc stack_usage(RETADDRSZ)
	MOV	SOURCE,RMANHI

	TST	RMANHI		
	JEQ	RETURN_0	; special processing for value 0

*******************************************************************************
*      NORMALIZATION                                                          *
*   Load exponent value - using bias (127) and assuming maximum value (16).   *
*   Normalize the mantissa by shifting the integer left until a 1 comes out.  *
*******************************************************************************

	MOV	#127+16,REXP	; preset exponent to maximum assumed value

LOOP_NOR			; normalization loop
	SUB	#1,REXP		; decrement exponent
	RLA	RMANHI		; shift left by 1 bit
	JNC	LOOP_NOR	; loop if a zero was shifted out

*******************************************************************************
*      POST-NORMALIZATION                                                     *
*   Entry :                                                                   *
*     Mantissa in RMANHI, left-aligned on bit 15, implied bit reemoved.       *
*   Exit  :                                                                   *
*     Mantissa in RMANHI:RMANLO [0000 0000 MMMM MMMM] [MMMM MMMM 0000 0000]   *
*******************************************************************************
        MOV.B  	RMANHI,RMANLO   ; do a fast 32-bit shift by 8
        SWPB    RMANLO
        SWPB    RMANHI
        MOV.B  	RMANHI,RMANHI   

*******************************************************************************
*      CONVERSION OF FLOATING POINT FORMAT - PACK                             *
*   Entry :                                                                   *
*     Mantissa in RMANHI:RMANLO  [0000 0000 0MMM MMMM] [MMMM MMMM MMMM MMMM]  *
*     Exponent in REXP           [0000 0000 EEEE EEEE]                        *
*   Exit :                                                                    *
*     FP number in RMANHI:RMANLO [0EEE EEEE EMMM MMMM] [MMMM MMMM MMMM MMMM]  *
*******************************************************************************

        SWPB    REXP            ; OR in the exponent
        OR      REXP,RMANHI

        CLRC  			; add in the sign bit (always zero)
        RRC     RMANHI          
        RRC     RMANLO

*******************************************************************************
*   Return
*******************************************************************************
*******************************************************************************
*      SPECIAL CASES PROCESSING                                               *
*   The result registers are RMANHI:RMANLO.                                   *
*                                                                             *
*   Value 0.0 :                                                               *
*     Load 0 into result registers (note : RMANHI,RMANLO already set to 0).   *
*******************************************************************************
DONE
RETURN_0
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

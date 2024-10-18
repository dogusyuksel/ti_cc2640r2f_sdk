;******************************************************************************
;* DIV32U.ASM  -                                                              *
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
        .asg __mspabi_divul, __divul
        .asg __mspabi_remul, __remul
     .endif
	.global __divul
	.global __remul

;****************************************************************************
;* __divul/__remul - DIVIDE TWO UNSIGNED 32 BIT NUMBERS. RETURNS BOTH QUOTIENT
;*                   AND REMAINDER
;****************************************************************************
;*
;*   - Dividend is in R12/R13
;*   - Divisor is in R14/R15
;*   - Quotient is returned in R12/R13
;*   - Remainder is returned in R14/R15
;*
;*   - R9/R10 are used to hold the remainder results after each subtraction
;*
;*   Registers used:  R9,R10,R11,R12,R13,R14,R15
;*
;*   The shift/subtract loop is broken into 2 16 bit loops to take advantage
;*   of the fact that during the 1st 16 iterations there are no bits in the
;*   upper half of the remainder.  
;****************************************************************************
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg RETA, RET
        .asg 4, RETADDRSZ
     .else
        .asg 2, RETADDRSZ
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
        .asg PUSHM.A,PUSH
        .asg POPM.A, POP
STACK_USED .set 8
     .else
STACK_USED .set 4
     .endif

	.text
	.align 2

__divul: .asmfunc stack_usage(STACK_USED + RETADDRSZ)
__remul:
	PUSH	R10
	PUSH	R9		; Save SOE registers
	CLR.W	R9		; Initialize the hi remainder
	CLR.W	R10		; Initialize the lo remainder

	MOV.W	#1,R11		; Init loop bit, walk across for 16 iterations
	TST.W	R15             ; If upper word of divisor is 0
	JEQ	div_loop_lo	; then we need to shift/subtract on lower 16

	MOV.W	R13,R9		; If upper word of divisor is != 0
	MOV.W	R12,R13		; then we can skip first 16 iterations of 
	MOV.W	#0,R12		; loop and proceed to shift/subtract upper 16
	JMP	div_loop_hi

div_loop_lo:
	RLA.W	R12		; Assign nth quotient bit and
	RLC.W	R13		; Copy nth dividend bit into lo remainder
	RLC.W	R9	
	SUB.W	R14,R9		; Subtract lo divisor from current lo remainder
	JNC	undo_sub	; If divisor > current remainder, undo subtract
	BIS.W	#1,R12		; Set quotient bit
	RLA	R11		; Walk loop bit
	JNC	div_loop_lo	; Loop or ready for ready for upper 16	
	JMP	process_hi
undo_sub:
	ADD.W	R14,R9		; Undo subtract, quotient bit remains clear
	RLA	R11		; Walk loop bit
	JNC	div_loop_lo	; Loop or ready for ready for upper 16	


process_hi:
	MOV.W	#1,R11          ; Reset loop bit
div_loop_hi:
	RLA.W	R12		; Assign nth quotient bit
	RLC.W	R13		; Copy nth dividend bit into remainder
	RLC.W	R9	
	RLC.W	R10		; Now there's interesting bits in hi remainder
	SUB.W	R14,R9		; Subtract divisor from current remainder
	SUBC.W	R15,R10
	JNC	undo_sub_hi	; If divisor > current remainder, undo subtract
	BIS.W	#1,R12		; Set quotient bit
	RLA	R11		; Walk loop bit
	JNC	div_loop_hi	; Loop or done
	JMP	div_end
undo_sub_hi
	ADD.W	R14,R9		; Undo subtract, quotient bit remains clear
	ADDC.W	R15,R10
	RLA	R11		; Walk loop bit
	JNC	div_loop_hi	; Loop or done
div_end:
	MOV.W	R9,R14		; Move remainder to return registers
	MOV.W	R10,R15
	POP	R9
	POP	R10		; Restore SOE registers
	RET			; Done. If divisor == 0, quotient will be 0
	.endasmfunc


;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)
	.end

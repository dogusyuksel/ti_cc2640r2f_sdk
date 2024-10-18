;******************************************************************************
;* DIV16U.ASM  -                                                              *
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
	.asg __mspabi_divu, __divu
	.asg __mspabi_remu, __remu
     .endif
	.global __divu
	.global __remu

;****************************************************************************
;* __divu/__remu - DIVIDE TWO UNSIGNED 16 BIT NUMBERS. RETURNS BOTH QUOTIENT
;*               AND REMAINDER
;****************************************************************************
;*
;*   - Dividend is in R12
;*   - Divisor is in R13
;*   - Quotient is placed in R12
;*   - Remainder is placed in R14
;*
;*   - R11 is used as a loop counter
;*   - R15 holds copy of dividend, which is shifted into remainder
;*   - Divide by zero returns 0xFFFF quotient and 0xFFFF remainder
;*
;*   Registers used:  R12,R13,R14,R15
;*
;****************************************************************************
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg RETA, RET
        .asg 4,    RETADDRSZ
     .else
        .asg 2,    RETADDRSZ
     .endif

	.text
	.align 2

__divu:	.asmfunc stack_usage(RETADDRSZ)
__remu:
	CLR.W	R14		; Initialize the remainder
	MOV.W	R12,R15		; Copy dividend for shifting
	MOV.W	#1,R12		; Walk 1 across for looping, also hold quotient
div_loop:
	RLA.W	R15		; Shift dividend into remainder
	RLC.W	R14		
	CMP.W	R13,R14		; If current remainder > divisor, subtract
	JNC	set_quotient_bit
	SUB.W	R13,R14
set_quotient_bit:	
	RLC.W   R12		; Set quotient bit (in carry),adv loop bit
	JNC	div_loop
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

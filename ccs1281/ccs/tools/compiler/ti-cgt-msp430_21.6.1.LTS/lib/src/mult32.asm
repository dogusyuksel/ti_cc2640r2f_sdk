;******************************************************************************
;* MPY32.ASM -                                                                *
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
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg  RETA,RET
	.asg  BRA,BR
	.asg  CALLA,CALL
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif
     .if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
        .asg  POPM.A,POP
	.asg  PUSHM.A,PUSH
	.asg  4, REGSZ
     .else
	.asg  2, REGSZ
     .endif
     .if __TI_EABI__
        .asg __mspabi_mpyl, __mpyl
        .asg __mspabi_mpyl_sw, __mpyl_sw
     .endif
;****************************************************************************
;* __mpyl  (int32 = int32 * int32)
;*  
;*   - Operand 1 is in R12/R13
;*   - Operand 2 is in R14/R15
;*   - Result is in R12/R13
;*
;*   Registers used:  R10,R11,R12,R13,R14,R15
;****************************************************************************
	.global __mpyl
	.global __mpyl_sw

	.text
        .clink
	.align 2

__mpyl_sw;
__mpyl:	.asmfunc stack_usage(1 * REGSZ + RETADDRSZ)
	PUSH	R10
	CLR.W	R10
	CLR.W	R11
mpyl_add_loop:
	CLRC			
	RRC.W	R13
	RRC.W	R12		; Get LSB of OP1, rotate in 0 to cap MSB
	JNC	shift_test_mpyl ; If LSB of OP1 is 0, no add into product
	ADD.W	R14,R10		; If LSB of OP1 is 1, add OP2 into product
	ADDC.W	R15,R11
shift_test_mpyl:
	RLA.W	R14		; Prepare OP2 for next iteration, if needed
	RLC.W	R15
	TST.W	R13		; Test if OP1 is 0, if 0 then done
	JNE	mpyl_add_loop	
	TST.W	R12
	JNE	mpyl_add_loop   ; Otherwise, continue shift/add loop
	MOV.W	R10,R12		; Move product into result registers
	MOV.W	R11,R13
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

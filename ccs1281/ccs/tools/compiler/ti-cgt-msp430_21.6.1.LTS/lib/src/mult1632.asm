;******************************************************************************
;* MULT1632.ASM -                                                             *
;*                                                                            *
;* Copyright (c) 2011 Texas Instruments Incorporated                          *
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
        .asg __mspabi_mpysl, __mpysl
        .asg __mspabi_mpyul, __mpyul
        .asg __mspabi_mpyl_sw, __mpyl_sw
        .asg __mspabi_mpysl_sw, __mpysl_sw
        .asg __mspabi_mpyul_sw, __mpyul_sw
     .endif
;****************************************************************************
;* __mpysl   (int32 = (int32)int16 * (int32)int16)
;****************************************************************************
	.global __mpyl
	.global __mpyl_sw

	.global __mpysl
	.global __mpysl_sw
	.sect	".text:__mpysl"
	.clink
	.align 2
__mpysl_sw:
__mpysl:  .asmfunc stack_usage(0)
	MOV.W	  r13,r14
        BIT.W     #8000h,r12
        SUBC.W    r13,r13
        INV.W     r13
        BIT.W     #8000h,r14
        SUBC.W    r15,r15
        INV.W     r15
	BR	  #__mpyl_sw
        .endasmfunc

;****************************************************************************
;* __mpyul   (uint32 = (uint32)uint16 * (uint32)uint16)
;****************************************************************************
	.global __mpyul
	.global __mpyul_sw
	.sect	".text:__mpyul"
	.clink
	.align 2
__mpyul_sw:
__mpyul:  .asmfunc stack_usage(RETADDRSZ)
	MOV.W	  r12,r11
	MOV.W	  r13,r14
	CLR.W     r15
	
	CLR.W	R12
	CLR.W	R13
	CLRC			
	RRC.W	R11		 ; Get LSB of OP1, rotate in the first 0 to cap MSB
	JMP	mpyul_add_loop1  ; Start with first decision
mpyul_add_loop:
	RRA.W	R11		 ; Get LSB of OP1, rotate in 0 to cap MSB
mpyul_add_loop1:
	JNC	shift_test_mpyul ; If LSB of OP1 is 0, no add into product
	ADD.W	R14,R12		 ; If LSB of OP1 is 1, add OP2 into product
	ADDC.W	R15,R13
shift_test_mpyul:
	RLA.W	R14		 ; Prepare OP2 for next iteration, if needed
	RLC.W	R15
	TST.W	R11		 ; Test if OP1 is 0, if 0 then done
	JNE	mpyul_add_loop   ; Otherwise, continue shift/add loop
	RET
	
        .endasmfunc

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)

;******************************************************************************
;* SETJMP - MSP430 -                                                          *
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

;****************************************************************************
;*   setjmp
;*
;*     C syntax  : int setjmp(jmp_buf env)
;*
;*     Function  : Save callers current environment for a subsequent
;*                 call to longjmp.  Return 0.
;*
;*     The context save area is organized as follows:
;*
;*       env -->  .int   R4
;*                .int   R5
;*                .int   R6
;*                .int   R7
;*                .int   R8
;*                .int   R9
;*                .int   R10
;*                .int   SP
;*                .int   PC
;*
;****************************************************************************
;*
;*  NOTE : ANSI specifies that "setjmp.h" declare "setjmp" as a macro. 
;*         In our implementation, the setjmp macro calls a function "_setjmp".
;*         However, since the user may not include "setjmp.h", we provide
;*         two entry-points to this function.
;*
;****************************************************************************
     	.global	setjmp,_setjmp

	.text
	.align 2

     .if $DEFINED(__LARGE_CODE_MODEL__)
        .asg  4, RETADDRSZ
     .else
        .asg  2, RETADDRSZ
     .endif

	.if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
setjmp: .asmfunc stack_usage(RETADDRSZ)
_setjmp:
          MOVA   R4,0(R12)
          MOVA   R5,4(R12)
          MOVA   R6,8(R12)
          MOVA   R7,12(R12)
          MOVA   R8,16(R12)
          MOVA   R9,20(R12)
          MOVA   R10,24(R12)
          MOVA   SP,28(R12)
	.if $DEFINED(__LARGE_CODE_MODEL__)
          MOVX.A @SP,32(R12)
          ADDX.A #4,28(R12)        ; Increment saved SP by four ("pop" PC)
          MOV.W  #0,R12
          RETA
	.else
	  MOV.W  @SP,32(R12)
	  ADDX.A #2,28(R12)
	  MOV.W	 #0,R12
	  RET
	.endif
	.else
setjmp: .asmfunc stack_usage(RETADDRSZ)
_setjmp:
          MOV.W   R4,0(R12)
          MOV.W   R5,2(R12)
          MOV.W   R6,4(R12)
          MOV.W   R7,6(R12)
          MOV.W   R8,8(R12)
          MOV.W   R9,10(R12)
          MOV.W   R10,12(R12)
          MOV.W   SP,14(R12)
          MOV.W   @SP,16(R12)
          ADD.W   #2,14(R12)        ; Increment saved SP by two ("pop" PC)
          MOV.W   #0,R12
          RET
	.endif

          .endasmfunc

;****************************************************************************
;*   longjmp
;*
;*     C syntax  : void longjmp(jmp_buf env, int val)
;*
;*     Function  : Restore the context contained in the jump buffer.
;*                 This causes an apparent "2nd return" from the
;*                 setjmp invocation which built the "env" buffer.
;*                 This return appears to return "returnvalue".
;*                 NOTE: This function may not return 0.
;****************************************************************************
          .global	longjmp

	.if $DEFINED(__LARGE_CODE_MODEL__) | $DEFINED(__LARGE_DATA_MODEL__)
longjmp: .asmfunc stack_usage(RETADDRSZ)
          MOVA   0(R12),R4
          MOVA   4(R12),R5
          MOVA   8(R12),R6
          MOVA   12(R12),R7
          MOVA   16(R12),R8
          MOVA   20(R12),R9
          MOVA   24(R12),R10
          MOVA   28(R12),SP
	.if $DEFINED(__LARGE_CODE_MODEL__)
          MOVA   32(R12),R14
	.else
	  MOV.W  32(R12),R14
	.endif
          MOV.W  R13,R12

          CMP.W   #0,R12            ; make sure we're not returning 0
          JNZ     end
          MOV.W   #1,R12
	.if $DEFINED(__LARGE_CODE_MODEL__)
end:      BRA     R14
	.else
end:      BR      R14
	.endif
	.else
longjmp: .asmfunc stack_usage(RETADDRSZ)
          MOV.W   0(R12),R4
          MOV.W   2(R12),R5
          MOV.W   4(R12),R6
          MOV.W   6(R12),R7
          MOV.W   8(R12),R8
          MOV.W   10(R12),R9
          MOV.W   12(R12),R10
          MOV.W   14(R12),SP
          MOV.W   16(R12),R14
          MOV.W   R13,R12

          CMP.W   #0,R12            ; make sure we're not returning 0
          JNZ     end
          MOV.W   #1,R12

end:      BR      R14
	.endif

          .endasmfunc


;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)
        .end

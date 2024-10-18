;******************************************************************************
;* ROTL16.ASM -                                                               *
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
;---------------------------------------------------------------------------
;-- 16-bit rotate left  
;---------------------------------------------------------------------------
     .if $DEFINED(__LARGE_CODE_MODEL__)
	.asg  RETA,RET
        .asg 4,    RETADDRSZ
     .else
        .asg 2,    RETADDRSZ
     .endif

     .if __TI_EABI__
        .asg __mspabi_rlli, I_ROTL
        .asg __mspabi_rlli_15, I_ROTL_15
        .asg __mspabi_rlli_14, I_ROTL_14
        .asg __mspabi_rlli_13, I_ROTL_13
        .asg __mspabi_rlli_12, I_ROTL_12
        .asg __mspabi_rlli_11, I_ROTL_11
        .asg __mspabi_rlli_10, I_ROTL_10
        .asg __mspabi_rlli_9, I_ROTL_9
        .asg __mspabi_rlli_8, I_ROTL_8
        .asg __mspabi_rlli_7, I_ROTL_7
        .asg __mspabi_rlli_6, I_ROTL_6
        .asg __mspabi_rlli_5, I_ROTL_5
        .asg __mspabi_rlli_4, I_ROTL_4
        .asg __mspabi_rlli_3, I_ROTL_3
        .asg __mspabi_rlli_2, I_ROTL_2
        .asg __mspabi_rlli_1, I_ROTL_1
     .endif
	
            .text
	    .align 2

            .global I_ROTL
            .global I_ROTL_15, I_ROTL_14, I_ROTL_13, I_ROTL_12, I_ROTL_11
            .global I_ROTL_10, I_ROTL_9,  I_ROTL_8,  I_ROTL_7,  I_ROTL_6
            .global I_ROTL_5,  I_ROTL_4,  I_ROTL_3,  I_ROTL_2,  I_ROTL_1 

I_ROTL:     .asmfunc stack_usage(RETADDRSZ)
            AND    #15,R13        ; constain range of shift
            XOR    #15,R13        ; invert the shift count
            ADD    R13,R13        ; scale it
            ADD    R13,R13        ; scale it
     .if $DEFINED(__LARGE_CODE_MODEL__)
            ADD.A  R13,PC         ; branch to the appropriate instruct
     .else
            ADD    R13,PC         ; branch to the appropriate instruct
     .endif

I_ROTL_15:  RLA    R12
            ADC    R12
I_ROTL_14:  RLA    R12
            ADC    R12
I_ROTL_13:  RLA    R12
            ADC    R12
I_ROTL_12:  RLA    R12
            ADC    R12
I_ROTL_11:  RLA    R12
            ADC    R12
I_ROTL_10:  RLA    R12
            ADC    R12
I_ROTL_9:   RLA    R12
            ADC    R12
I_ROTL_8:   RLA    R12
            ADC    R12
I_ROTL_7:   RLA    R12
            ADC    R12
I_ROTL_6:   RLA    R12
            ADC    R12
I_ROTL_5:   RLA    R12
            ADC    R12
I_ROTL_4:   RLA    R12
            ADC    R12
I_ROTL_3:   RLA    R12
            ADC    R12
I_ROTL_2:   RLA    R12
            ADC    R12
I_ROTL_1:   RLA    R12
            ADC    R12
            RET
            .endasmfunc
            

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)

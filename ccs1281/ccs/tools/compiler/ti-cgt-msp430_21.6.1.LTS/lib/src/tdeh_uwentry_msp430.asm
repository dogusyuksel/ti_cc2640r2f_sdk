;******************************************************************************
;* tdeh_uwentry_msp430.asm                                                    *
;*                                                                            *
;* Copyright (c) 2010 Texas Instruments Incorporated                          *
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

        .cdecls CPP, LIST, "tdeh_msp430.h"

	;
	; These macros and assignments abstract the large code/data
	; models out of the code so that the code can be written once
	; to handle all code/data models.
	;

	;
	; ADD and MV are only ever used on registers.  On MSPX, for
	; register-only instructions, it is always safe to use the
	; A-size instruction, even in large code or large data model.
	;

	.if $defined(.MSP430X)
	    .asg ADDA, ADD
	    .asg MOVA, MV
	.else
	    .asg MOV, MV
	.endif

	;
	; Certain instructions dealing with code addresses must have
	; exactly the right size.  For instance, CALL/RET push/pop a
	; different number of words to store RETA than CALLA/RETA do.
	;

    	.if $defined(__LARGE_CODE_MODEL__)
    	    .asg CALLA, CALL	; size of all four must be exactly right!
    	    .asg RETA, RET
    	    .asg CMPX, CMP
    	    .asg BRA, BR
            .asg  4, RETADDRSZ
        .else
            .asg  2, RETADDRSZ
    	.endif

	;
	; When storing/loading code addresses (RETA) to/from the
	; stack, the size must be exactly right.  We keep these moves
	; distinct from the moves which can be A-sized even in small
	; data and code models.
	;
	; We can't use MOVRETA for moving data addresses between
	; registers, because in small code model MOVRETA must be MOV.W,
	; but in large data model a data address move must be MOVA.
	;

    	.if $defined(__LARGE_CODE_MODEL__)
    	    .asg MOVA, MOVRETA
	.else
    	    .asg MOV.W, MOVRETA
    	.endif

	;
	; SOE save/restore must be exactly the right size.
	;

PUSHM   .macro n, start
    	    .if $defined(.MSP430X)
    	        .if $defined(__LARGE_CODE_MODEL__) | $defined(__LARGE_DATA_MODEL__)
    	            PUSHM.A #n, R:start:
    	        .else
    	            PUSHM.W #n, R:start:
    	        .endif
    	    .else
    	        .loop n
    	            PUSH.W R:start:
		    .eval start-1, start
    	        .endloop
    	    .endif
        .endm

POPM    .macro n, start
            .if $defined(.MSP430X)
                .if $defined(__LARGE_CODE_MODEL__) | $defined(__LARGE_DATA_MODEL__)
                    POPM.A #n, R:start:
                .else
                    POPM.W #n, R:start:
                .endif
            .else
                .eval start-n+1, start
                .loop n
                    POP.W R:start:
                    .eval start+1, start
                .endloop
            .endif
        .endm

	;
	; REG_SZ is the size of a saved SOE register
	;

    	.if $defined(__LARGE_CODE_MODEL__) | $defined(__LARGE_DATA_MODEL__)
    	    .asg 4, REG_SZ
    	.else
    	    .asg 2, REG_SZ
    	.endif

	;
	; FRM_SZ is how big the frame needs to be (not including the
	; RETA of that function) to save all the context registers
	;

	.asg (_Unwind_Reg_Id._UR_REG_LAST + 1) * REG_SZ, FRM_SZ

;------------------------------------------------------------------------------
; _Unwind_RaiseException - wrapper for C function __TI_Unwind_RaiseException
;
; _Unwind_Reason_Code _Unwind_RaiseException(_Unwind_Exception *);
;
; _Unwind_Reason_Code __TI_Unwind_RaiseException(_Unwind_Exception *uexcep,
;                                                _Unwind_Context   *context);
;------------------------------------------------------------------------------
; This function is the language-independent starting point for
; propagating an exception.  It is called by __cxa_throw.
;
; This function needs to capture the state of the caller, which means
; all of the SOE registers (including DP and SP) as well as the return
; address.  (The stack unwinder finds the data for the caller by
; looking up the return address in the EXIDX table to find the
; "apparently throwing call site.")
;
; The state is saved in an array allocated on the stack, which is
; passed as the second argument to __TI_Unwind_RaiseException.
;------------------------------------------------------------------------------

        .def _Unwind_RaiseException
        .ref __TI_Unwind_RaiseException
_Unwind_RaiseException: .asmfunc stack_usage(FRM_SZ + RETADDRSZ)

	;
        ; This function must:
        ; 1. Save all of the SOE registers in stack-allocated "context,"
        ;    including RETA as "PC".
        ; 2. Call __TI_Unwind_RaiseException(uexcep, context)
        ;    If things go well, this call never returns.
        ; 3. If __TI_Unwind_RaiseException returns an error, return
        ;    its return value to the original caller (stored in "PC")
	;

	MV  #__TI_Unwind_RaiseException, R15

_Unwind_Resume_ENTRY:

	;
	; 1. Save all of the SOE registers
	;

	MOVRETA	0(SP), R13	; fetch RETA (CPU7 workaround)
				; this will be stored in the PC
				; virtual register

	MV	SP, R14		; fetch SP as it is now...
	ADD	#REG_SZ, R14	; and compute what it was in the caller

	PUSHM	11, 14		; push regs R14 through R4
				; R14 populates SP
				; R13 populates PC (with RETA)
				; R12-R11 create holes for ARG1 and RETA
				; R10-R4 are the true SOE registers

	;
	; 2. Call __TI_Unwind_RaiseException (or maybe __TI_Unwind_Resume)
	;

	MV	SP, R13		; set ARG2 for the call

	CALL	R15		; takes two args, R12 and R13
				; returns a value in R12

        ;
        ; 3. If __TI_Unwind_RaiseException returns (it can only return

        ;    with an error), return to the original caller
        ;    (__cxa_throw), but do not restore any of the other
        ;    registers.  (If __TI_Unwind_RaiseException returns, it's
        ;    a normal return, so it would have saved/restored the
        ;    SOEs).  Anyway, __cxa_throw is about to call
        ;    __cxa_call_terminate, so it's moot.
        ;

	; The RETA on the stack will still have the value it should,
        ; so just use that.

	ADD	#FRM_SZ, SP
	RET

        .endasmfunc

;------------------------------------------------------------------------------
; _Unwind_Resume - wrapper for C function __TI_Unwind_Resume
;
; void _Unwind_Resume(_Unwind_Exception *);
;
; void __TI_Unwind_Resume(_Unwind_Exception *uexcep, _Unwind_Context *context);
;------------------------------------------------------------------------------
; This function is the language-independent "resume" function.  After
; each frame gets a chance to perform cleanup, this function is called
; to resume propagating the exception to the next call frame.  It is
; called by __cxa_end_cleanup, below.
;
; Creates a register buffer just as _Unwind_RaiseException does, but
; calls a different function afterward.  __TI_Unwind_Resume never returns.
;------------------------------------------------------------------------------

        .def _Unwind_Resume
        .ref __TI_Unwind_Resume
_Unwind_Resume: .asmfunc stack_usage(FRM_SZ + RETADDRSZ)

        ;
        ; This function must:
        ; 1. Save all of the SOE registers in stack-allocated "context."
        ;    It need not save RETA, which will be clobbered by
        ;    __TI_Unwind_Resume.
        ; 2. Call __TI_Unwind_Resume(uexcept, context)
        ;    This call never returns.
        ;
        ; The code for _Unwind_RaiseException does all of what we
        ; want, so just tail call it.  Since __TI_Unwind_Resume never
        ; returns, this path will never reach the epilog of
        ; _Unwind_RaiseException.
        ;

	MV	#__TI_Unwind_Resume, R15	; takes two args, R12 and R13

	JMP	_Unwind_Resume_ENTRY

        .endasmfunc

;------------------------------------------------------------------------------
; __TI_Install_CoreRegs - Set machine state to effect return, branch, or call
;
; void __TI_Install_CoreRegs(void *core_regs);
;------------------------------------------------------------------------------
; __TI_Install_CoreRegs is where the unwinder finally writes to the
; actual registers.  It is called when the actual registers need to be
; modified, such as when unwinding is completely done, or when handler
; code needs to be executed.  It called by __TI_targ_regbuf_install,
; which is just a wrapper for this function.  This function performs
; either a simulated return or a call to a cleanup/catch handler or
; __cxa_call_unexpected.
;
; __TI_targ_regbuf_install is eventually called from two places,
; __TI_Unwind_RaiseException and __TI_Unwind_Resume.
;
; __TI_Unwind_RaiseException calls __TI_unwind_frame to begin phase 2
; unwinding if a handler was found for the current exception.  (Phase
; 2 unwinding actually unwinds the stack and calls cleanup/catch
; handlers).  __TI_unwind_frame unwinds the frame until a
; cleanup/catch handler which needs to be run is found, at which point
; it calls __TI_targ_regbuf_install.  The pseudo-PC in the register
; buffer will have been set by the personality routine to the landing
; pad for the handler, so instead of performing a simulated return, we
; call the catch handler landing pad.  The very first thing the catch
; handler landing pad does is call __cxa_begin_catch, which takes one
; argument, the _Unwind_Exception pointer.  For this reason, this
; function needs to install A4 from the register buffer.
;
; During phase 2 unwinding, __cxa_end_cleanup calls _Unwind_Resume,
; which calls __TI_Unwind_Resume.  __TI_Unwind_Resume calls
; __TI_unwind_frame when the personality routine returns
; _URC_CONTINUE_UNWIND, and things proceed as when
; __TI_Unwind_RaiseException calls __TI_unwind_frame.
;
; __TI_Unwind_Resume will also call __TI_targ_regbuf_install if the
; personality routine returns _URC_INSTALL_CONTEXT.  This happens when
; a cleanup/catch/fespec handler is found.  The personality routine
; sets PC to the handler landing pad and A4 to the _Unwind_Context
; pointer.
;
; Additionally, for FESPEC, the personality routine may set PC to
; "__cxa_call_unexpected" and A4 to the _Unwind_Context pointer, and
; return _URC_INSTALL_CONTEXT, which results in a call to
; __cxa_call_unexpected.
;
; Returns to the location in "PC."
;------------------------------------------------------------------------------

        .def __TI_Install_CoreRegs
__TI_Install_CoreRegs: .asmfunc stack_usage(RETADDRSZ)

	;
        ; This function must:
        ; 1. Restore all of the SOE registers from "context," which
        ;    lives in some ancestor call's frame.
        ; 2. Restore ARG1 (in case we are simulating a call).
        ; 3. Restore RETA from "PC" (in case we are simulating a call).
        ; 4. Branch to the address in "PC".
	;

	; The context is always the frame originally allocated by
	; _Unwind_RaiseException.  We are going to throw away higher
	; frames anyway, so we can go ahead and set the SP to the
	; address of the context for popping.

	MV	R12, SP		; set SP to the context

	; The frames representing the callees of _Unwind_RaiseException
	; (the bulk of the unwinder) are now gone.

	POPM	11, 14		; R14 contains the new SP
				; R13 contains the new PC
				; R12 contains the new ARG1
				; R11 contains the new RETA
				; R10-R4 are the true SOEs

	MV	R14, SP

	; The frames representing __cxa_throw and all of its calleees
	; are now gone, including the old context, so we can't refer to
	; it after this.  

        ; SP is now restored to what it was *before* the call to
        ; __cxa_throw; that is, not even the RETA for this call is
        ; still on the stack, so we can't perform a RET.

	; The SOEs and SP are what they were in the calling function
	; as if it had made no calls.  We now need to set the RETA and
	; PC to effect the return or call.

	; In most cases, this function performs an alternate return.
	; However, in one case (only for __cxa_call_unexpected) we use
	; this function to make a call.  We need to know whether to
	; simulate a CALL or RET here.  ARM and C6x don't have this
	; issue because a CALL doesn't push the RETA onto the stack.

	.global __cxa_call_unexpected
	CMP	#__cxa_call_unexpected, R13
	JNE	around

	PUSHM   1, 11			; __cxa_call_unexpected
		     			; normally doesn't return, but
		     			; we set RETA so that in case
		     			; an exception is thrown in
		     			; unexpected(), the apparent
		     			; call site will be what's now
		     			; in the virtual RETA (the call
		     			; site to the function whose
		     			; FESPEC was violated).

around:

	BR R13                          ; Don't use a CALL or RET here!
					; Never returns.  Either
					; normal control flow is
					; resuming, or the unwinder
					; will be re-entered
					; elsewhere.

        .endasmfunc

;------------------------------------------------------------------------------
; __cxa_end_cleanup - generic C++ helper function
;
; void __cxa_end_cleanup(void)
;
; _Unwind_Exception *__TI_cxa_end_cleanup(void);
;
; void _Unwind_Resume(_Unwind_Exception *);
;------------------------------------------------------------------------------
; __cxa_end_cleanup is a C++-specific function, called directly in
; compiler-generated code.  It calls __TI_cxa_end_cleanup to perform
; bookkeeping for foreign exceptions and exceptions thrown during
; cleanup.  It calls _Unwind_Resume to continue unwinding the stack.
;
; Saves/restores state to preserve changes made during destructors
; from changes made in the course of executing __TI_cxa_end_cleanup.
;------------------------------------------------------------------------------
        .def __cxa_end_cleanup
        .ref __TI_cxa_end_cleanup
__cxa_end_cleanup: .asmfunc stack_usage(FRM_SZ + 7 * REG_SZ + RETADDRSZ)

        ; Doesn't need to store PC or SP

        ; There is some amount of confusion in this function.  I don't
        ; think we should need to save the SOE registers around the
        ; call to __TI_cxa_end_cleanup.

	PUSHM	7, 10			; save the SOEs

	CALL	#__TI_cxa_end_cleanup	; returns a value in R12

	POPM	7, 10			; restore the SOEs

	JMP	_Unwind_Resume		; Don't use CALL here, because
					; we want to find the context of the 
					; function which calls 
					; __cxa_end_cleanup.
					; The value from __TI_cxa_end_cleanup
					; is passed to this function.

        NOP                             ; CPU40 Compatibility NOP

        .endasmfunc

;******************************************************************************
;* BUILD ATTRIBUTES                                                           *
;*    HW_MPY_INLINE_INFO=1:  file does not have any inlined hw mpy            *
;*    HW_MPY_ISR_INFO   =1:  file does not have ISR's with mpy or func calls  *
;******************************************************************************
	.battr "TI", Tag_File, 1, Tag_HW_MPY_INLINE_INFO(1)
	.battr "TI", Tag_File, 1, Tag_HW_MPY_ISR_INFO(1)

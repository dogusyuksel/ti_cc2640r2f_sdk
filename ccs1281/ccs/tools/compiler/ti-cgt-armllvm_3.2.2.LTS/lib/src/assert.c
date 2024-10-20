/****************************************************************************/
/*  assert                                                                  */
/*                                                                          */
/* Copyright (c) 1993 Texas Instruments Incorporated                        */
/* http://www.ti.com/                                                       */
/*                                                                          */
/*  Redistribution and  use in source  and binary forms, with  or without   */
/*  modification,  are permitted provided  that the  following conditions   */
/*  are met:                                                                */
/*                                                                          */
/*     Redistributions  of source  code must  retain the  above copyright   */
/*     notice, this list of conditions and the following disclaimer.        */
/*                                                                          */
/*     Redistributions in binary form  must reproduce the above copyright   */
/*     notice, this  list of conditions  and the following  disclaimer in   */
/*     the  documentation  and/or   other  materials  provided  with  the   */
/*     distribution.                                                        */
/*                                                                          */
/*     Neither the  name of Texas Instruments Incorporated  nor the names   */
/*     of its  contributors may  be used to  endorse or  promote products   */
/*     derived  from   this  software  without   specific  prior  written   */
/*     permission.                                                          */
/*                                                                          */
/*  THIS SOFTWARE  IS PROVIDED BY THE COPYRIGHT  HOLDERS AND CONTRIBUTORS   */
/*  "AS IS"  AND ANY  EXPRESS OR IMPLIED  WARRANTIES, INCLUDING,  BUT NOT   */
/*  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR   */
/*  A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT   */
/*  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,   */
/*  SPECIAL,  EXEMPLARY,  OR CONSEQUENTIAL  DAMAGES  (INCLUDING, BUT  NOT   */
/*  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,   */
/*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY   */
/*  THEORY OF  LIABILITY, WHETHER IN CONTRACT, STRICT  LIABILITY, OR TORT   */
/*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE   */
/*  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.    */
/*                                                                          */
/****************************************************************************/
#include <stdio.h>
#include <assert.h>
#include <stdlib.h>

/****************************************************************************/
/* _ABORT_MSG() - Implement standard C macro assert().  Write out a string  */
/*                and never return.  Abort function for false assertions.   */
/****************************************************************************/
#if defined(__TMS320C6X__) && defined(__TI_EABI__)
_TI_PROPRIETARY_PRAGMA("FUNC_EXT_CALLED(__c6xabi_abort_msg)")
_CODE_ACCESS void __c6xabi_abort_msg(const char *string)
#elif defined(__C7000__)
_TI_PROPRIETARY_PRAGMA("FUNC_EXT_CALLED(__c7xabi_abort_msg)")
_CODE_ACCESS void __c7xabi_abort_msg(const char *string)
#elif defined(__ARP32__)
_TI_PROPRIETARY_PRAGMA("FUNC_EXT_CALLED(__arp32abi_abort_msg)")
_CODE_ACCESS void __arp32abi_abort_msg(const char *string)
#else
_TI_PROPRIETARY_PRAGMA("FUNC_EXT_CALLED(_abort_msg)")
_CODE_ACCESS void _abort_msg(const char *string)
#endif
{
    fputs(string, stderr);
    fflush(stderr); /* Always a good idea to flush */
    abort();
}

#ifdef __clang__
/****************************************************************************/
/* __ASSERT_FAIL - LLVM-libc-like implementation of assert fail.            */
/****************************************************************************/
_TI_NORETURN void __assert_fail(const char *expr, const char *file,
                                const char *line, const char *function) {
    /* <file>:<line>: Assertion failed: '<expr>' in function: '<function>'\n" */
    fputs(file, stderr);
    fputs(":", stderr);
    fputs(line, stderr);
    fputs(": Assertion failed: '", stderr);
    fputs(expr, stderr);
    fputs("' in function: '", stderr);
    fputs(function, stderr);
    fputs("'\n", stderr);
    abort();

}
#endif

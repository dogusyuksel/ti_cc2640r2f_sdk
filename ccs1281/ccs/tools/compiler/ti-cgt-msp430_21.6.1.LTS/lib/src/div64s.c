/*****************************************************************************/
/*  div64s.c       							     */
/*                                                               */
/* Copyright (c) 2011 Texas Instruments Incorporated             */
/* http://www.ti.com/                                            */
/*                                                               */
/*  Redistribution and  use in source  and binary forms, with  or without */
/*  modification,  are permitted provided  that the  following conditions */
/*  are met:                                                     */
/*                                                               */
/*     Redistributions  of source  code must  retain the  above copyright */
/*     notice, this list of conditions and the following disclaimer. */
/*                                                               */
/*     Redistributions in binary form  must reproduce the above copyright */
/*     notice, this  list of conditions  and the following  disclaimer in */
/*     the  documentation  and/or   other  materials  provided  with  the */
/*     distribution.                                             */
/*                                                               */
/*     Neither the  name of Texas Instruments Incorporated  nor the names */
/*     of its  contributors may  be used to  endorse or  promote products */
/*     derived  from   this  software  without   specific  prior  written */
/*     permission.                                               */
/*                                                               */
/*  THIS SOFTWARE  IS PROVIDED BY THE COPYRIGHT  HOLDERS AND CONTRIBUTORS */
/*  "AS IS"  AND ANY  EXPRESS OR IMPLIED  WARRANTIES, INCLUDING,  BUT NOT */
/*  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR */
/*  A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT */
/*  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, */
/*  SPECIAL,  EXEMPLARY,  OR CONSEQUENTIAL  DAMAGES  (INCLUDING, BUT  NOT */
/*  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, */
/*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY */
/*  THEORY OF  LIABILITY, WHETHER IN CONTRACT, STRICT  LIABILITY, OR TORT */
/*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE */
/*  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
/*                                                               */
/*****************************************************************************/

#include <limits.h>

/*****************************************************************************/
/*                                                                           */
/* Multipliation helper function names                                       */
/*                                                                           */
/*****************************************************************************/
/*
                 SW        16           32             F5 
    X16xX16->X16 __mpyi    __mpyi_hw                   __mpyi_f5hw
    S16xS16->X32 __mpysl   __mpysl_hw                  __mpysl_f5hw
    U16xU16->X32 __mpyul   __mpyul_hw                  __mpyul_f5hw
    X32xX32->X32 __mpyl    __mpyl_hw    __mpyl_hw32    __mpyl_f5hw
    S32xS32->X64 __mpysll  __mpysll_hw  __mpysll_hw32  __mpysll_f5hw
    U32xU32->X64 __mpyull  __mpyull_hw  __mpyull_hw32  __mpyull_f5hw
    X64xX64->X64 __mpyll   __mpyll_hw   __mpyll_hw32   __mpyll_f5hw
*/

#if defined(__TI_EABI__)
#define __divlli __mspabi_divlli
#define __divull __mspabi_divull
#endif

unsigned long long __divull(unsigned long long a, unsigned long long b);

/*****************************************************************************/
/*                                                                           */
/* __divlli() - signed long long division                                    */
/*                                                                           */
/*****************************************************************************/
long long __divlli(long long a, long long b)
{
   /*-----------------------------------------------------------------------*/
   /* CHECK SIGNS, TAKE ABSOLUTE VALUE, AND USED UNSIGNED DIVIDE.           */
   /*-----------------------------------------------------------------------*/
   long long sign        = (a ^ b) >> 63;
   unsigned long long ua = (a == LLONG_MIN ? a : llabs(a));
   unsigned long long ub = (b == LLONG_MIN ? b : llabs(b));
   unsigned long long q  = __divull(ua, ub);

   if (b == 0) return a ? (((unsigned long long)-1) >> 1) ^ sign : 0;
			/* saturation value or 0 */

   return sign ? -q : q;
}

/*****************************************************************************/
/* stdarg.h                                                                  */
/*                                                                           */
/* Copyright (c) 1996 Texas Instruments Incorporated                         */
/* http://www.ti.com/                                                        */
/*                                                                           */
/*  Redistribution and  use in source  and binary forms, with  or without    */
/*  modification,  are permitted provided  that the  following conditions    */
/*  are met:                                                                 */
/*                                                                           */
/*     Redistributions  of source  code must  retain the  above copyright    */
/*     notice, this list of conditions and the following disclaimer.         */
/*                                                                           */
/*     Redistributions in binary form  must reproduce the above copyright    */
/*     notice, this  list of conditions  and the following  disclaimer in    */
/*     the  documentation  and/or   other  materials  provided  with  the    */
/*     distribution.                                                         */
/*                                                                           */
/*     Neither the  name of Texas Instruments Incorporated  nor the names    */
/*     of its  contributors may  be used to  endorse or  promote products    */
/*     derived  from   this  software  without   specific  prior  written    */
/*     permission.                                                           */
/*                                                                           */
/*  THIS SOFTWARE  IS PROVIDED BY THE COPYRIGHT  HOLDERS AND CONTRIBUTORS    */
/*  "AS IS"  AND ANY  EXPRESS OR IMPLIED  WARRANTIES, INCLUDING,  BUT NOT    */
/*  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR    */
/*  A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT    */
/*  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,    */
/*  SPECIAL,  EXEMPLARY,  OR CONSEQUENTIAL  DAMAGES  (INCLUDING, BUT  NOT    */
/*  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,    */
/*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY    */
/*  THEORY OF  LIABILITY, WHETHER IN CONTRACT, STRICT  LIABILITY, OR TORT    */
/*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE    */
/*  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.     */
/*                                                                           */
/*****************************************************************************/

#ifndef _STDARG
#define _STDARG

#pragma diag_push
#pragma CHECK_MISRA("-20.1") /* standard headers must define standard names */
#pragma CHECK_MISRA("-20.2") /* standard headers must define standard names */
#pragma CHECK_MISRA("-19.7") /* function-like macros are OK */
#pragma CHECK_MISRA("-19.10") /* need types as macro arguments */

#include <sys/_types.h>

#ifndef _VA_LIST_DECLARED
#define _VA_LIST_DECLARED
typedef __va_list va_list;
#endif

#define _VA_RNDUP(sz) 	(((sz) + 1) & ~1)

/*****************************************************************************/
/* On the MSP430, the stack grows down (towards 0x0), and arguments are      */
/* pushed in reverse order, so later arguments are at higher addresses.      */
/*****************************************************************************/

/*****************************************************************************/
/* VA_START(va_list ap, parmN)                                               */
/*                                                                           */
/*   Set "ap" to point to the address of the next argument past parmN.       */
/*   So add the size of parmN to the address of parmN.                       */
/*                                                                           */
/*   NOTES -must use the address of the level 1 symbol (via va_parmadr).     */
/*         -must account for "chars", which are widened to "ints".           */
/*                                                                           */
/*****************************************************************************/
#if defined(__LARGE_DATA_MODEL__)
#define va_start(ap, parmN)                                                   \
((ap) = (va_list)((long)__va_parmadr(parmN) +                      \
			     (__va_argref(parmN) ?                            \
			      sizeof(__builtin_addressof(parmN)) :            \
			      (sizeof(parmN) < sizeof(int) ? sizeof(int) :    \
			                                     sizeof(parmN)))))
#else
#define va_start(ap, parmN)						      \
   ((ap) = (__va_argref(parmN) || (sizeof(parmN) < sizeof(int)) 	      \
              ? (va_list)((int)__va_parmadr(parmN) + 2 )	      \
	      : (va_list)((int)__va_parmadr(parmN) + sizeof(parmN))))
#endif
/*****************************************************************************/
/* VA_ARG(va_list, type)                                                     */
/*                                                                           */
/*   Return next argument (currently pointed to by "va_list", and set the    */
/*   argument pointer to point to the next argument after current one.       */
/*                                                                           */
/*   Notes -must handle variables passed by reference (_va_argref())         */
/*         -must round up chars.                                             */
/*                                                                           */
/*****************************************************************************/
#define va_arg(_ap, _type)                                       	      \
        (__va_argref(_type)                         		              \
	 ? ((_ap += sizeof(_type*)), (**(_type**)(_ap - sizeof(_type *))))    \
	 : ((_ap += _VA_RNDUP(sizeof(_type))),				      \
	     (*(_type*)(_ap - _VA_RNDUP(sizeof(_type))))))

#define va_end(ap) ((void)0)
#define va_copy(dst, src) ((dst)=(src))


#pragma diag_pop

#endif /* _STDARG */


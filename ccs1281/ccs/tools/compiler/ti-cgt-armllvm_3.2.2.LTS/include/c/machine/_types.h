/*-
 * SPDX-License-Identifier: BSD-4-Clause
 *
 * Copyright (c) 2002 Mike Barcroft <mike@FreeBSD.org>
 * Copyright (c) 1990, 1993
 *	The Regents of the University of California.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *	This product includes software developed by the University of
 *	California, Berkeley and its contributors.
 * 4. Neither the name of the University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 *	From: @(#)ansi.h	8.2 (Berkeley) 1/4/94
 *	From: @(#)types.h	8.3 (Berkeley) 1/5/94
 * $FreeBSD$
 */

#ifndef _MACHINE__TYPES_H_
#define	_MACHINE__TYPES_H_

#ifndef _SYS_CDEFS_H_
#error this file needs sys/cdefs.h as a prerequisite
#endif

#include <_ti_config.h>

#ifdef __TI_COMPILER_VERSION__
_TI_PROPRIETARY_PRAGMA("diag_push")
/* This file is required to use base types */
_TI_PROPRIETARY_PRAGMA("CHECK_MISRA(\"-6.3\")")
#endif

#ifdef __clang__

/* Always use POSIX epoch for time_t */
#define __TI_TIME32_USES_POSIX_EPOCH

/* Unless AEABI portability mode or user indicates __TI_TIME_USES_64 = 0, */
/* use 64bit time_t and redirect all time routines to 64bit variants.     */
#if !defined(_TIME_IMPLEMENTATION) && \
    !(defined(__TI_TIME_USES_64) && __TI_TIME_USES_64 == 0) && \
    !(defined(_AEABI_PORTABILITY_LEVEL) && _AEABI_PORTABILITY_LEVEL != 0)
#define __TI_TIME_USES_64 1
#endif

#endif

/*
 * Basic types upon which most other types are built.
 */
typedef	signed char		__int8_t;
typedef	unsigned char		__uint8_t;
typedef	short			__int16_t;
typedef	unsigned short		__uint16_t;
typedef	int			__int32_t;
typedef	unsigned int		__uint32_t;
#ifndef lint
__extension__
#endif
/* LONGLONG */
typedef	long long		__int64_t;
#ifndef lint
__extension__
#endif
/* LONGLONG */
typedef	unsigned long long	__uint64_t;

/*
 * Standard type definitions.
 */
typedef	__uint32_t	__clock_t;		/* clock()... */
typedef	__int32_t	__critical_t;
typedef	double		__double_t;
typedef	float		__float_t;
typedef	__int32_t	__intfptr_t;
typedef	__int64_t	__intmax_t;
typedef	__int32_t	__intptr_t;
typedef	__int32_t	__int_fast8_t;
typedef	__int32_t	__int_fast16_t;
typedef	__int32_t	__int_fast32_t;
typedef	__int64_t	__int_fast64_t;
typedef	__int8_t	__int_least8_t;
typedef	__int16_t	__int_least16_t;
typedef	__int32_t	__int_least32_t;
typedef	__int64_t	__int_least64_t;
typedef	__int32_t	__ptrdiff_t;		/* ptr1 - ptr2 */
typedef	__int32_t	__register_t;
typedef	__int32_t	__segsz_t;		/* segment size (in pages) */
typedef	__uint32_t	__size_t;		/* sizeof() */
typedef	__int32_t	__ssize_t;		/* byte count or error */
#if defined(_TARGET_DEFAULTS_TO_TIME64) || \
    (defined(__TI_TIME_USES_64) && __TI_TIME_USES_64)
typedef	__int64_t	__time_t;		/* time()... */
#else
typedef __uint32_t      __time_t;
#endif
typedef	__uint32_t	__uintfptr_t;
typedef	__uint64_t	__uintmax_t;
typedef	__uint32_t	__uintptr_t;
typedef	__uint32_t	__uint_fast8_t;
typedef	__uint32_t	__uint_fast16_t;
typedef	__uint32_t	__uint_fast32_t;
typedef	__uint64_t	__uint_fast64_t;
typedef	__uint8_t	__uint_least8_t;
typedef	__uint16_t	__uint_least16_t;
typedef	__uint32_t	__uint_least32_t;
typedef	__uint64_t	__uint_least64_t;
typedef	__uint32_t	__u_register_t;
typedef	__uint32_t	__vm_offset_t;
typedef	__uint32_t	__vm_paddr_t;
typedef	__uint32_t	__vm_size_t;

# ifdef __clang__
typedef __WCHAR_TYPE__ __WCHAR_T_TYPE__;
# endif
typedef	__WCHAR_T_TYPE__ ___wchar_t;

#define	__WCHAR_MIN	0		/* min value for a wchar_t */

#ifdef __TI_COMPILER_VERSION__
#if !defined(__TI_WCHAR_T_BITS__) || __TI_WCHAR_T_BITS__ == 16
#    define __WCHAR_MAX 0xffffu
#else
#    define __WCHAR_MAX 0xffffffffu
#endif
#else
#include <machine/_limits.h>            /* get a definition of __UINT_MAX */
#define	__WCHAR_MAX	__UINT_MAX	/* max value for a wchar_t */
#endif

/*
 * POSIX target specific _off_t type definition
 */
typedef long _off_t;

/*
 * Unusual type definitions.
 */
#ifdef __TI_COMPILER_VERSION__
typedef struct __va_list_t {
    void * __ap;
} __va_list;
#elif defined(__GNUCLIKE_BUILTIN_VARARGS)
typedef __builtin_va_list	__va_list;	/* internally known to gcc */
#else
typedef	char *			__va_list;
#endif /* __GNUCLIKE_BUILTIN_VARARGS */
#if defined(__GNUCLIKE_BUILTIN_VAALIST) \
    && !defined(__NO_GNUC_VA_LIST) && !defined(__GNUC_VA_LIST)
#define __GNUC_VA_LIST	1
typedef __va_list		__gnuc_va_list;	/* compatibility w/GNU headers*/
#endif

#if defined(__TI_COMPILER_VERSION__)
_TI_PROPRIETARY_PRAGMA("diag_pop")
#endif

#endif /* !_MACHINE__TYPES_H_ */

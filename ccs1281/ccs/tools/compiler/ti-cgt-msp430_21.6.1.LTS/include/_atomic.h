/******************************************************************************/
/*                                                                            */
/* _ATOMIC.H                                                                  */
/* Copyright (c) 2018 Texas Instruments Incorporated                          */
/* http://www.ti.com/                                                         */
/*                                                                            */
/*  Redistribution and  use in source  and binary forms, with  or without     */
/*  modification,  are permitted provided  that the  following conditions     */
/*  are met:                                                                  */
/*                                                                            */
/*     Redistributions  of source  code must  retain the  above copyright     */
/*     notice, this list of conditions and the following disclaimer.          */
/*                                                                            */
/*     Redistributions in binary form  must reproduce the above copyright     */
/*     notice, this  list of conditions  and the following  disclaimer in     */
/*     the  documentation  and/or   other  materials  provided  with  the     */
/*     distribution.                                                          */
/*                                                                            */
/*     Neither the  name of Texas Instruments Incorporated  nor the names     */
/*     of its  contributors may  be used to  endorse or  promote products     */
/*     derived  from   this  software  without   specific  prior  written     */
/*     permission.                                                            */
/*                                                                            */
/*  THIS SOFTWARE  IS PROVIDED BY THE COPYRIGHT  HOLDERS AND CONTRIBUTORS     */
/*  "AS IS"  AND ANY  EXPRESS OR IMPLIED  WARRANTIES, INCLUDING,  BUT NOT     */
/*  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR     */
/*  A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT     */
/*  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,     */
/*  SPECIAL,  EXEMPLARY,  OR CONSEQUENTIAL  DAMAGES  (INCLUDING, BUT  NOT     */
/*  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,     */
/*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY     */
/*  THEORY OF  LIABILITY, WHETHER IN CONTRACT, STRICT  LIABILITY, OR TORT     */
/*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE     */
/*  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.      */
/*                                                                            */
/*                                                                            */
/******************************************************************************/
#ifndef __ATOMICHDR
#define __ATOMICHDR
#ifndef __cplusplus
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#else
#include <cstdlib>
#include <cstdint>
#include <cstdbool>
#endif

/* Implement the GCC Atomic builtins required to implement C++1x */

#define __ATOMIC_RELAXED 0
#define __ATOMIC_CONSUME 1
#define __ATOMIC_ACQUIRE 2
#define __ATOMIC_RELEASE 3
#define __ATOMIC_ACQ_REL 4
#define __ATOMIC_SEQ_CST 5

/* Using disable/restore interrupts */
#define __ATOMIC_ALWAYS_LOCK_FREE(n) \
    ((n) == 1 || \
     (n) == 2 || \
     (n) == 4 || \
     (n) == 8 )

#define __GCC_ATOMIC_BOOL_LOCK_FREE       __ATOMIC_ALWAYS_LOCK_FREE(1)
#define __GCC_ATOMIC_CHAR_LOCK_FREE       __ATOMIC_ALWAYS_LOCK_FREE(1)
#define __GCC_ATOMIC_CHAR16_T_LOCK_FREE   __ATOMIC_ALWAYS_LOCK_FREE(2)
#define __GCC_ATOMIC_CHAR32_T_LOCK_FREE   __ATOMIC_ALWAYS_LOCK_FREE(4)
#define __GCC_ATOMIC_WCHAR_T_LOCK_FREE    \
   __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_WCHAR_T__)
#define __GCC_ATOMIC_SHORT_LOCK_FREE      \
   __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_SHORT__)
#define __GCC_ATOMIC_INT_LOCK_FREE        \
   __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_INT__)
#define __GCC_ATOMIC_LONG_LOCK_FREE       \
   __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_LONG__)
#define __GCC_ATOMIC_LLONG_LOCK_FREE      \
   __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_LONG_LONG__)
#ifdef __SIZEOF_POINTER__
#define __GCC_ATOMIC_POINTER_LOCK_FREE    \
      __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_POINTER__)
#else
#define __GCC_ATOMIC_POINTER_LOCK_FREE    \
      __ATOMIC_ALWAYS_LOCK_FREE(__SIZEOF_PTRDIFF_T__)
#endif

static inline bool __atomic_always_lock_free(size_t n, const void *ptr)
{
  return __ATOMIC_ALWAYS_LOCK_FREE(n);
}

static inline bool __atomic_is_lock_free(size_t n, const void *ptr)
{
  return __ATOMIC_ALWAYS_LOCK_FREE(n);
}

#define __TI_ATOMIC_FUNC(type, name) \
__attribute__((always_inline)) static inline type name

#define __atomic_thread_fence(order) 
#define __atomic_signal_fence(order) 

/* Disable/restore interrupts */

#define __GIE_BIT  0x8    /* GIE bit position in Status Register (SR) */

#define _disable_interrupts() \
__get_SR_register(); __disable_interrupt()

#define _restore_interrupts(state) \
   if (state & __GIE_BIT) __enable_interrupt()

/* __atomic_load_[1,2,4,8]() builtins */

#define __TI_ATOMIC_LOAD_N(n, type) \
__TI_ATOMIC_FUNC(type, __atomic_load_##n) \
(const void *ptr, int memorder) \
{ \
  uint32_t tmp = _disable_interrupts(); \
  type t0 = *(const volatile type*)ptr; \
  _restore_interrupts(tmp); \
  return t0; \
}

/* __atomic_store_[1,2,4,8]() builtins */

#define __TI_ATOMIC_STORE_N(n, type) \
__TI_ATOMIC_FUNC(void, __atomic_store_##n) \
(void *ptr, type val, int memorder) \
{ \
  uint32_t tmp = _disable_interrupts(); \
  *(volatile type*)ptr = val; \
  _restore_interrupts(tmp); \
  return; \
}

/* __atomic_exchange_[1,2,4,8]() builtins */

#define __TI_ATOMIC_EXCHANGE_N(n, type) \
__TI_ATOMIC_FUNC(type, __atomic_exchange_##n) \
(void *ptr, type val, int memorder) \
{ \
  uint32_t tmp = _disable_interrupts(); \
  type t0 = *(volatile type*)ptr; \
  *(volatile type*)ptr = val; \
  _restore_interrupts(tmp); \
  return t0; \
}

/* __atomic_compare_exchange_[1,2,4,8] builtins */
/* Match libatomic - drop the (4th parameter) strong/weak flag */

#define __TI_ATOMIC_COMPARE_EXCHANGE_N(n, type) \
__TI_ATOMIC_FUNC(bool, __atomic_compare_exchange_##n) \
(void *ptr, void *expected, type desired, /* bool weak,*/ \
 int success_memorder, int failure_memorder) \
{ \
  type t1 = *(type*)expected; \
  uint32_t tmp = _disable_interrupts(); \
  type t0 = *(volatile type*)ptr; \
  if (t0 == t1) {\
    *(volatile type*)ptr = desired; \
    _restore_interrupts(tmp); \
    return 1;\
  } else { \
    *(type*)expected = t0; \
    _restore_interrupts(tmp); \
    return 0; \
  }\
}

/* __atomic_fetch_[add,sub,add,xor,or][1,2,4,8] builtins */

#define __TI_ATOMIC_RMW(n, type, opname, op) \
__TI_ATOMIC_FUNC(type, __atomic_##opname##_##n) \
(void *ptr, type val, int memorder) \
{ \
  type t0, t1; \
  uint32_t tmp = _disable_interrupts(); \
  t0 = *(volatile type*)ptr; \
  t1 = t0 op val; \
  *(volatile type*)ptr = t1; \
  _restore_interrupts(tmp); \
  return t0;\
}

/* Define lock free atomic builtins */

#define __TI_ATOMIC_N(n, type) \
__TI_ATOMIC_EXCHANGE_N(n, type) \
__TI_ATOMIC_COMPARE_EXCHANGE_N(n, type) \
__TI_ATOMIC_RMW(n, type, fetch_add, +) \
__TI_ATOMIC_RMW(n, type, fetch_sub, -) \
__TI_ATOMIC_RMW(n, type, fetch_and, &) \
__TI_ATOMIC_RMW(n, type, fetch_xor, ^) \
__TI_ATOMIC_RMW(n, type, fetch_or,  |)

#if __ATOMIC_ALWAYS_LOCK_FREE(1)
__TI_ATOMIC_LOAD_N(1, uint8_t)
__TI_ATOMIC_STORE_N(1, uint8_t)
__TI_ATOMIC_N(1, uint8_t)
#endif
#if __ATOMIC_ALWAYS_LOCK_FREE(2)
__TI_ATOMIC_LOAD_N(2, uint16_t) 
__TI_ATOMIC_STORE_N(2, uint16_t)
__TI_ATOMIC_N(2, uint16_t)
#endif
#if __ATOMIC_ALWAYS_LOCK_FREE(4)
__TI_ATOMIC_LOAD_N(4, uint32_t)
__TI_ATOMIC_STORE_N(4, uint32_t)
__TI_ATOMIC_N(4, uint32_t)
#endif
#if __ATOMIC_ALWAYS_LOCK_FREE(8)
__TI_ATOMIC_LOAD_N(8, uint64_t)
__TI_ATOMIC_STORE_N(8, uint64_t)
__TI_ATOMIC_N(8, uint64_t)
#endif

/* Match libatomic - drop the (4th parameter) strong/weak flag */
#define __atomic_compare_exchange(ptr, expected, desired, weak, suc, fail)\
   __atomic_compare_exchange(ptr, expected, desired, suc, fail)

#define __atomic_compare_exchange_n(ptr, expected, desired, weak, suc, fail)\
   __atomic_compare_exchange_n(ptr, expected, desired, suc, fail)

#undef _disable_interrupts
#undef _restore_interrupts
#undef __GIE_BIT
#undef __TI_ATOMIC_LOAD_N
#undef __TI_ATOMIC_LOAD_8
#undef __TI_ATOMIC_STORE_N
#undef __TI_ATOMIC_STORE_8
#undef __TI_ATOMIC_N
#undef __TI_ATOMIC_EXCHANGE_N
#undef __TI_ATOMIC_COMPARE_EXCHANGE_N
#undef __TI_ATOMIC_RMW

#endif /* __ATOMICHDR */

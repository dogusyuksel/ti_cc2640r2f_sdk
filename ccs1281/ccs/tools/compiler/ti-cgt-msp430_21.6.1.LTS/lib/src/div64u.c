/*****************************************************************************/
/*  div64u.c       							     */
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
#define __divull __mspabi_divull
#endif

/*****************************************************************************/
/*                                                                           */
/* _lmbd() - left-most bit detect.  Returns a value from 0 to 32 indicating  */
/*           where the first significant sign bit is.  Used to quickly       */
/*           determine the magnitude of the value.  Returns the same         */
/*           value as the C6000 intrinsic _lmbd (q.v.)                       */
/*                                                                           */
/*****************************************************************************/
static __inline unsigned _lmbd(int val, unsigned long src)
{
    int i;

    if (!val) src = ~src;

    for (i = 0; i < 32; i++)
        if ((1ul << (31 - i)) & src) return i;
    
    return 32;
}

/*****************************************************************************/
/*                                                                           */
/* _lmbdull() - Like _lmbd(int, int), but takes (int, ulong long) and        */
/*              returns a value from 0 to 64.                                */
/*                                                                           */
/*****************************************************************************/
static __inline unsigned _lmbdull(int val, unsigned long long src)
{
    unsigned long p1 = src >> 32; 
    unsigned long p2 = src;
    unsigned int pos;

    if ((pos = _lmbd(val, p1)) == 32)
        return _lmbd(val, p2) + 32;
    else return pos;
}

/*****************************************************************************/
/*                                                                           */
/* _subcull() - conditional subtract for "unsigned long long."  This is used */
/*              to compute one bit of the quotient.                          */
/*                                                                           */
/*****************************************************************************/
static __inline unsigned long long _subcull(unsigned long long src1, 
					    unsigned long long src2)
{
    unsigned long long res1 = ((src1-src2) << 1) | 0x1;
    unsigned long long res2 = src1 << 1;
    if (src1 >= src2)
        return res1;
    else
        return res2;
}

/*****************************************************************************/
/*                                                                           */
/* __divull() - unsigned long long division                                  */
/*                                                                           */
/*****************************************************************************/
unsigned long long __divull(unsigned long long x1, unsigned long long x2)
{
    register int i;
    register unsigned long long num;
    register unsigned long long den;
    register int shift;
    unsigned long long first_div = 0;
    unsigned long long num64;

    shift = _lmbdull(1, x2) - _lmbdull(1, x1);

    if (x1 < x2) return 0;
    if (x1 == 0) return 0;
    if (x2 == 0) return (unsigned long long) -1;      

    num = x1;
    den = x2 << shift;

    num64 = (_lmbdull(1, x1) == 0);

    first_div = num64 << shift;

    if (den > num) first_div >>= 1; 

    if (num64)
    {
	if(den > num) { den >>= 1; num -= den; }
	else          { num -= den; den >>= 1; }
    }
    else
	shift++;

    for (i = 0; i < shift; i++)
    {
        num = _subcull(num, den);
    }

    if (shift)
        return num << (64-shift) >> (64-shift) | first_div;
    else
	return first_div;
}

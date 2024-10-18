/*****************************************************************************/
/* cpy_tbl.c                                                                 */
/*                                                                           */
/* Copyright (c) 2003 Texas Instruments Incorporated                         */
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
/*                                                                           */
/* General purpose copy routine.  Given the address of a linker-generated    */
/* COPY_TABLE data structure, effect the copy of all object components       */
/* that are designated for copy via the corresponding LCF table() operator.  */
/*                                                                           */
/*****************************************************************************/
#include <cpy_tbl.h>
#include <string.h>
#include "autoinit.h"

/*************************************************************************/
/* MSP copy tables can handle moving functions even in small data model  */
/* + large code model, where data pointers are not big enough to         */
/* represent function pointers.  This requires the EABI decompression    */
/* functions (SHARED/copy_*.c) to be changed to accept "far" pointers.   */
/* For this memory model combination, the decompression functions are    */
/* changed to use "unsigned long" to represent function pointers, so     */
/* function pointers through which we call these functions also needs to */
/* have a prototype accepting "unsigned long" instead of pointer types.  */
/* All other memory model combinations use the same prototype that all   */
/* the other targets use: two data pointer arguments.  Ultimately we use */
/* MSP peek/poke intrinsics to read/write the "far" memory.              */
/*************************************************************************/

#if __LARGE_CODE_MODEL__ && !__LARGE_DATA_MODEL__
void __memcpy_far(unsigned long dst, unsigned long src, unsigned long sz);
#endif

/*****************************************************************************/
/* COPY_IN()                                                                 */
/*****************************************************************************/
void copy_in(COPY_TABLE *tp)
{
   unsigned short i;

   for (i = 0; i < tp->num_recs; i++)
   {
      COPY_RECORD crp = tp->recs[i];

#if __LARGE_CODE_MODEL__ && !__LARGE_DATA_MODEL__
      unsigned long load_addr = crp.load_addr;
      unsigned long run_addr = crp.run_addr;
#else
      char *load_addr = (char *)crp.load_addr;
      char *run_addr = (char *)crp.run_addr;
#endif

      if (crp.size)
      {
         /*------------------------------------------------------------------*/
         /* Copy record has a non-zero size so the data is not compressed.   */
         /* Just copy the data.                                              */
         /*------------------------------------------------------------------*/
#if __LARGE_CODE_MODEL__ && !__LARGE_DATA_MODEL__
         if (load_addr >> 16 || run_addr >> 16)
            __memcpy_far(run_addr, load_addr, crp.size);
         else
            memcpy((void*)(unsigned int)run_addr, 
                   (void*)(unsigned int)load_addr, crp.size);
#else
         memcpy(run_addr, load_addr, crp.size);
#endif
      }
#ifdef __TI_EABI__
      else if (__TI_Handler_Table_Base != __TI_Handler_Table_Limit)
      {
         /*------------------------------------------------------------------*/
         /* Copy record has size zero so the data is compressed. The first   */
         /* byte of the load data has the handler index. Use this index with */
         /* the handler table to get the handler for this data. Then call    */
         /* the handler by passing the load and run address.                 */
         /*------------------------------------------------------------------*/
  #if __LARGE_CODE_MODEL__ && !__LARGE_DATA_MODEL__
         char handler_idx = __data20_read_char(load_addr++);
  #else
         char handler_idx = *load_addr++;
  #endif

         handler_fn_t handler = __TI_Handler_Table_Base[handler_idx];
         handler(load_addr, run_addr);
      }
#endif
   }
}


/*****************************************************************************/
/*  TRGMSG.C                                                                 */
/*                                                                           */
/* Copyright (c) 1995 Texas Instruments Incorporated                         */
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

/*****************************************************************************/
/* Bottom level data transfer routines for host communication with the       */
/* target.                                                                   */
/*                                                                           */
/* Functions:                                                                */
/*  __TI_writemsg()  -  Sends the passed data and parameters on to the host. */
/*  __TI_readmsg()   -  Reads the data and parameters passed from the host.  */
/*                                                                           */
/* IMPORTANT!                                                                */
/*                                                                           */
/*  For multi-threaded applications, calls to __TI_writemsg() and            */
/*  __TI_readmsg() should be enclosed in a __TI_LOCK_HOST_CIO critical       */
/*  region. While the parm argument in both functions points to a shared     */
/*  resource (parmbuf[] in lowlev.c), it makes more sense to synchronize it  */
/*  in the function that calls __TI_writemsg() or __TI_readmsg(). With       */
/*  regards to _CIOBUF_ (another shared resource), it is only accessed in    */
/*  this file, so it makes more sense to synchronize it here even though the */
/*  critical region that protects access to it is defined around the call    */
/*  site.                                                                    */
/*                                                                           */
/*****************************************************************************/
#include <_ti_config.h>
#include <_data_synch.h>
#include "trgcio.h"

__asm("\t.global C$$IO$$");

#if defined(__ARM_ARCH) && defined(__clang__)
/*****************************************************************************/
/* Ensure both _CIOBUF_ and __CIOBUF_ symbols are defined as a workaround to */
/* a defect in CCS 11.0 that inhibits CIO functionality with TI Arm Clang.   */
/*****************************************************************************/
extern unsigned volatile char *_CIOBUF_ __attribute__((alias("__CIOBUF_")));
#endif

#if (defined(__TI_EABI__) && !defined(__MSP430__)) || defined(__ARM_ARCH)
#define _CIOBUF_ __CIOBUF_
#endif

/*****************************************************************************/
/* BIOS requesed that we maintain compatibility with their existing linker   */
/* command files. Therefore, do not place _CIOBUF_ in .cio for ARM. We do    */
/* the same for PRU to maintain the convention before trgmsg.c was unified   */
/* across targets. We always put _CIOBUF_ in a subsection to prevent it from */
/* being common. The CCS loader does not recognize the buffer if it is       */
/* common.                                                                   */
/*****************************************************************************/
#if defined(__ARM_ARCH) || defined(__PRU__) || \
    (defined(__TMS320C2000__) && defined(__TI_EABI__))
_DATA_ACCESS volatile unsigned char _CIOBUF_[CIOBUFSIZ] __attribute__((aligned(sizeof(unsigned int)), section(".bss:_CIOBUF_")));
#else
_DATA_ACCESS volatile unsigned char _CIOBUF_[CIOBUFSIZ] __attribute__((aligned(sizeof(unsigned int)), section(".cio")));
#endif

/***************************************************************************/
/*                                                                         */
/* __TI_writemsg() - Sends the passed data and parameters on to the host.  */
/*                                                                         */
/***************************************************************************/
#if defined(__clang__)
__attribute__((noinline))
#endif
_CODE_ACCESS void __TI_writemsg(               unsigned char  command,
                                register const unsigned char *parm,
                                register const          char *data,
                                               unsigned int   length)
{
    const int PARM_LEN = 8; /* Number of bytes in parm */
    register unsigned volatile char * p = (volatile unsigned char *) _CIOBUF_;

    register unsigned int i;

    /***********************************************************************/
    /* THE LENGTH IS WRITTEN AS A TARGET INT                               */
    /***********************************************************************/
    *(unsigned int *)p = length;
    p += sizeof(unsigned int);

    /***********************************************************************/
    /* THE COMMAND IS WRITTEN AS A TARGET BYTE                             */
    /***********************************************************************/
    *p++ = command;

    /***********************************************************************/
    /* PACK THE PARAMETERS AND DATA SO THE HOST READS IT AS BYTE STREAM    */
    /***********************************************************************/
    for (i = 0; i < PARM_LEN; i++) PACKCHAR(*parm++, p, i);
    for (i = 0; i < length; i++)   PACKCHAR(*data++, p, i+PARM_LEN);

    /***********************************************************************/
    /* SINCE _CIOBUF_ IS A SHARED RESOURCE, THE CURRENT THREAD IN A        */
    /* MULTI-THREADED APPLICATION MUST SYNCH ITS LOCAL COPY OF _CIOBUF_    */
    /* WITH SHARED MEMORY SINCE WE EXPECT THE HOST TO READ FROM SHARED     */
    /* MEMORY WHEN IT REACHES THE C$$IO$$ BREAKPOINT.                      */
    /***********************************************************************/
    /* See file header comments for more details.                          */
    /***********************************************************************/
    __TI_data_synch_WBINV(&_CIOBUF_, CIOBUFSIZ);

    _TI_PROPRIETARY_PRAGMA("diag_suppress 1119")
#ifndef __VIRTUAL_ENCODING__
  #if defined(__ARM_ARCH) && defined(EMBED_CIO_BP)
     __asm("         .global C$$IOE$$");
    #if !defined(__thumb__)
       __asm("C$$IOE$$:.word 0xDEFED0FE");
    #else
       __asm("	 .align  4");
    #if __BIG_ENDIAN__
         __asm("C$$IOE$$:.half 0xDEFE");
      #else
         __asm("C$$IOE$$:.half 0xD0FE");
      #endif /* __ARM_BIG_ENDIAN__ */
    #endif /* !(__thumb__)      */
  #else /* EMBED_CIO_BP */
    /***********************************************************************/
    /* THE BREAKPOINT THAT SIGNALS THE HOST TO DO DATA TRANSFER            */
    /***********************************************************************/
    /*---------------------------------------------------------------------*/
    /* The LLVM-based ARM compiler should identify C$$IO$$ as a function   */
    /* label so that its value will reflect whether it is a Thumb or ARM   */
    /* code label (LS bit of symbol value is set if Thumb).                */
    /*---------------------------------------------------------------------*/
    #if defined(__ARM_ARCH) && defined(__clang__)
    __asm("	    .type   C$$IO$$, %function");
    #endif
    __asm("	    .global C$$IO$$");
    #if defined(__TMS320C6X__)
    __asm("	    nop");
    #elif defined(__TMS320C2000__)
    /***********************************************************************/ 
    /* THE EMULATOR BREAKPOINTS IN DECODE PHASE, SO HAVE TO ADD IN SOME    */
    /* NOPS TO MAKE SURE LAST REAL INSTRUCTION COMPLETES BEFORE BREAKPOINT */
    /***********************************************************************/ 
    __asm("	    nop");
    __asm("	    nop");
    __asm("	    nop");
    #elif defined (__C7000__)
    /*---------------------------------------------------------------------*/
    /* Read last byte written and store to local volatile to ensure memory */
    /* system has had a chance to write all values to L3 before C$$IO$$    */
    /* label is reached.                                                   */
    /*---------------------------------------------------------------------*/
    volatile unsigned char force_mem_ordering_value;
    force_mem_ordering_value = *(p+PARM_LEN+length-1);
    #endif
    __asm("C$$IO$$:"); 
    #if defined(__C29__)
    __asm("         nop #1");
    #else
    __asm("         nop");
    #endif
  #endif /* EMBED_CIO_BP */
#else
    /*---------------------------------------------------------------------*/
    /* GENERATE THE C$$IO INSTRUCTION                                      */
    /*---------------------------------------------------------------------*/
  #if defined(__TMS320C6X__)
    __asm("       .vinstr   C$$IO");
    __asm("C$$IO: .encode \"C$$IO\", $ENC_OPNDS, 0");
  #elif defined(__ARP32__)
    __asm("C$$IO$$: .vinstr   C$$IO_INTERNAL");
    __asm("C$$IO_INTERNAL: .encode \"C$$IO\",$ENC_DISASM,\"C$$IO\", $ENC_OPNDS, 0");
  #endif
#endif
    _TI_PROPRIETARY_PRAGMA("diag_default 1119")
}


/***************************************************************************/
/*                                                                         */
/* __TI_readmsg() - Reads the data and parameters passed from the host.    */
/*                                                                         */
/***************************************************************************/
_CODE_ACCESS void __TI_readmsg(register unsigned char *parm,
                               register char          *data)
{
    register unsigned volatile char * p = (volatile unsigned char *) _CIOBUF_;

    register unsigned int i;
    unsigned int length;

    /***********************************************************************/
    /* THE LENGTH IS READ AS A TARGET INT                                  */
    /***********************************************************************/
    length = *(unsigned int *)p;
    p += sizeof(unsigned int);
    
    /***********************************************************************/
    /* UNPACK THE PARAMETERS AND DATA                                      */
    /***********************************************************************/
    for (i = 0; i < 8; i++) *parm++ = UNPACKCHAR(p, i);
    if (data != NULL) 
       for (i = 0; i < length; i++) *data++ = UNPACKCHAR(p, i+8);

    /***********************************************************************/ 
    /* THE CURRENT THREAD IN A MULTI-THREADED APPLICATION MUST SYNCH ITS   */
    /* LOCAL COPY OF _CIOBUF_ WITH SHARED MEMORY SINCE _CIOBUF_ IS A       */
    /* SHARED RESOURCE.                                                    */
    /***********************************************************************/ 
    /* See file header comments for more details.                          */
    /***********************************************************************/ 
    __TI_data_synch_WBINV(&_CIOBUF_, CIOBUFSIZ);
}

/****************************************************************************/
/*  EXIT.C v#####                                                           */
/*  Copyright (c) 1995@%%%% Texas Instruments Incorporated                  */
/****************************************************************************/
#include <stdlib.h>
#include <_lock.h>

#ifdef __TI_RTS_BUILD
/*---------------------------------------------------------------------------*/
/* __TI_default_exit indicates that the default TI exit routine is being     */
/* used.  The linker makes assumptions about what exit does when this symbol */
/* is seen. This symbols should NOT be defined if a customized exit routine  */
/* is used.                                                                  */
/*---------------------------------------------------------------------------*/
__asm(".set __TI_default_exit, 1");
#endif

void _DATA_ACCESS  *__dso_handle            = NULL;
void              (*__TI_cleanup_ptr)(void) = NULL;
void _DATA_ACCESS (*__TI_dtors_ptr)(int)    = NULL;

int __TI_enable_exit_profile_output = 1;

extern void abort(void);

/****************************************************************************/
/* EXIT() - NORMAL PROGRAM TERMINATION.                                     */
/****************************************************************************/
void exit(int status)
{
   /*-------------------------------------------------------------------*/
   /* MUST LOCK WHEN ACCESSING GLOBALS, like __TI_dtors_ptr,            */
   /* __TI_cleanup_ptr                                                  */
   /*-------------------------------------------------------------------*/
   _lock();

   /*-------------------------------------------------------------------*/
   /* BOTH ATEXIT FUNCTIONS AND STATIC OBJECT DESTRUCTORS ARE           */
   /* REGISTERED IN A LINK LIST TO BE PROCESSED BY THE FUNCTION POINTED */
   /* TO BY __TI_dtors_ptr.  PROCESS THEM NOW.                          */
   /*-------------------------------------------------------------------*/
   if (__TI_dtors_ptr)  (*__TI_dtors_ptr)(status);


   /*-------------------------------------------------------------------*/
   /* IF FILES ARE POSSIBLY OPEN, __TI_cleanup_ptr() WILL BE SETUP TO   */
   /* CLOSE THEM.                                                       */
   /*-------------------------------------------------------------------*/
   if (__TI_cleanup_ptr)  (*__TI_cleanup_ptr)();

   _unlock();
   abort();
}

/****************************************************************************/
/* ABORT - ABNORMAL PROGRAM TERMINATION.  CURRENTLY JUST HALTS EXECUTION.   */
/****************************************************************************/
__attribute__((noinline, section(".text:abort")))
void abort(void)
{
#if defined(EMBED_CIO_BP)

   __asm("         .global C$$EXITE");
#if defined(__ARM_ARCH_ISA_ARM)
   __asm("C$$EXITE:.word 0xDEFED0FE");
#else
   __asm("       .align  4");
#if defined(__ARM_BIG_ENDIAN)
   __asm("C$$EXITE:.half 0xDEFE");
#else
   __asm("C$$EXITE:.half 0xD0FE");
#endif /* __ARM_BIG_ENDIAN */
#endif /* __ARM_ARCH_ISA_ARM */

#else  /* !EMBED_CIO_BP */

   __asm("        .global C$$EXIT");
   __asm("C$$EXIT: nop");

#endif

   for (;;);   /* SPINS FOREVER */
}

/*****************************************************************************/
/* __MPU_INIT.C          - Perform application-specific mpu initializations  */
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
/*****************************************************************************/

/*****************************************************************************/
/* __MPU_INIT() - __mpu_init() is called in the C/C++ startup routine        */
/* (_c_int00() in boot.c) and provides a mechanism for tailoring mpu init    */
/* by device prior to calling main().                                        */
/*                                                                           */
/* The version of __mpu_init() below is for MSP430FR57xx devices.  For later */
/* devices (eg: MSP430FR58xx and MSP430FR59xx) replace this version,         */
/* rewrite the routine, and include it as part of the current project.       */
/* The linker will include the updated version if it is linked in prior to   */
/* linking with the C/C++ runtime library (rts430.lib).                      */ 
/*****************************************************************************/

extern volatile unsigned int  MPUCTL0;
extern volatile unsigned char MPUCTL0_H;
extern volatile unsigned int  MPUSEG;
extern volatile unsigned int  MPUSAM;

/*****************************************************************************/
/* To enable linker selection of mpu_init boot routines, linker cmd files    */
/* must either define below two symbols (backwards compatibility), or simply */
/* define below (only if supplying your own __mpu_init() routine):           */
/*   extern unsigned int __mpu_enable;                                       */
/*****************************************************************************/
extern unsigned int __mpuseg;
extern unsigned int __mpusam;


void __mpu_init(void)
{ 
   MPUCTL0 = 0xA500;                           /* Unlock MPU             */
   MPUSEG  = (unsigned int)_symval(&__mpuseg); /* Set segment boundaries */
   MPUSAM  = (unsigned int)_symval(&__mpusam); /* Set RWX permissions    */
   MPUCTL0 = 0xA501;                           /* Enable MPU             */
   MPUCTL0_H = 0x0;                            /* Lock MPU               */
}

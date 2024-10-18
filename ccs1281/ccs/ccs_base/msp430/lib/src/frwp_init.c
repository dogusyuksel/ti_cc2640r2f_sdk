/* ============================================================================ */
/* Copyright (c) 2017, Texas Instruments Incorporated                           */
/*  All rights reserved.                                                        */
/*                                                                              */
/*  Redistribution and use in source and binary forms, with or without          */
/*  modification, are permitted provided that the following conditions          */
/*  are met:                                                                    */
/*                                                                              */
/*  *  Redistributions of source code must retain the above copyright           */
/*     notice, this list of conditions and the following disclaimer.            */
/*                                                                              */
/*  *  Redistributions in binary form must reproduce the above copyright        */
/*     notice, this list of conditions and the following disclaimer in the      */
/*     documentation and/or other materials provided with the distribution.     */
/*                                                                              */
/*  *  Neither the name of Texas Instruments Incorporated nor the names of      */
/*     its contributors may be used to endorse or promote products derived      */
/*     from this software without specific prior written permission.            */
/*                                                                              */
/*  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" */
/*  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,       */
/*  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR      */
/*  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR            */
/*  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,       */
/*  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,         */
/*  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; */
/*  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,    */
/*  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR     */
/*  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,              */
/*  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.                          */
/* ============================================================================ */
/********************************************************************************/
/*------------------------------------------------------------------------------*/
/* These file will be executed by the boot_special.c to initialize the          */
/* SYSCFG0 register with the parameters to apply the FRAM Write Protection.     */
/*------------------------------------------------------------------------------*/

#include <stdint.h>

extern volatile unsigned int SYSCFG0;

// Control bits for the SYSCFG0
extern uint16_t start_protection_offset_address;
extern uint16_t info_fram_protection;
extern uint16_t program_fram_protection;

void __mpu_init(void)
{
	uint16_t check_start_protection_offset_address = ((uint16_t) _symval (&start_protection_offset_address)) & 0x3F;
	uint16_t check_info_fram_protection            = ((uint16_t) _symval (&info_fram_protection)) & 0x01;
	uint16_t check_program_fram_protection         = ((uint16_t) _symval (&program_fram_protection)) & 0x01;

	SYSCFG0 = 0xA500 |
			  (check_start_protection_offset_address << 2) |
			  (check_info_fram_protection << 1) |
			  check_program_fram_protection;
}

/* ============================================================================ */
/* Copyright (c) 2013, Texas Instruments Incorporated                           */
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
/* These file will add code segments to your output files to support IPE and    */
/* MPU configuration.                                                           */
/*------------------------------------------------------------------------------*/
extern unsigned int fram_ipe_border1;
extern unsigned int fram_ipe_border2;
extern unsigned int fram_ipe_checksum;
extern unsigned int fram_ipe_enable_value;
extern unsigned int fram_ipe_settings_struct_address;

typedef struct IPE_Init_Structure {
	unsigned int MPUIPC0 ;
	unsigned int MPUIPB2 ;
	unsigned int MPUIPB1 ;
	unsigned int MPUCHECK ;
} IPE_Init_Structure;

// Define borders of protected code
// this struct should be placed inside IPB1/IPB2
#pragma DATA_SECTION(Ipe_settingsStruct,".ipestruct");
#pragma RETAIN (Ipe_settingsStruct)
const IPE_Init_Structure Ipe_settingsStruct = {
	(unsigned int) &fram_ipe_enable_value,
	(unsigned int) &fram_ipe_border2,
	(unsigned int) &fram_ipe_border1,
	(unsigned int) &fram_ipe_checksum
};

// Set IPE Signature 1
#pragma DATA_SECTION(Ipe_enableSignature,".ipesignature");
#pragma RETAIN (Ipe_enableSignature)
const unsigned int Ipe_enableSignature = 0xAAAA;

// Set IPE Signature 2
#pragma DATA_SECTION(Ipe_structureAddress,".ipesignature");
#pragma RETAIN (Ipe_structureAddress)
const unsigned int Ipe_structureAddress = ((unsigned int) &fram_ipe_settings_struct_address);


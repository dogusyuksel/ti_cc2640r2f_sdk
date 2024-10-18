/******************************************************************************
*
* Copyright (C) 2012 - 2021 Texas Instruments Incorporated - http://www.ti.com/
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions
* are met:
*
*  Redistributions of source code must retain the above copyright
*  notice, this list of conditions and the following disclaimer.
*
*  Redistributions in binary form must reproduce the above copyright
*  notice, this list of conditions and the following disclaimer in the
*  documentation and/or other materials provided with the
*  distribution.
*
*  Neither the name of Texas Instruments Incorporated nor the names of
*  its contributors may be used to endorse or promote products derived
*  from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
/***************************************************************/
/*    msp430fr2000.cmd                                        */
/*    - Linker Command File for defintions in the header file  */
/*    Please do not change !                                   */
/*                                                             */
/***************************************************************/
/* 1.213 */
/***************************************************************/

/****************************************************************
* PERIPHERAL FILE MAP
****************************************************************/


/*****************************************************************************
 BKMEM
*****************************************************************************/
BAKMEM0            = 0x0660;
BAKMEM0_L          = 0x0660;
BAKMEM0_H          = 0x0661;
BAKMEM1            = 0x0662;
BAKMEM1_L          = 0x0662;
BAKMEM1_H          = 0x0663;
BAKMEM2            = 0x0664;
BAKMEM2_L          = 0x0664;
BAKMEM2_H          = 0x0665;
BAKMEM3            = 0x0666;
BAKMEM3_L          = 0x0666;
BAKMEM3_H          = 0x0667;
BAKMEM4            = 0x0668;
BAKMEM4_L          = 0x0668;
BAKMEM4_H          = 0x0669;
BAKMEM5            = 0x066A;
BAKMEM5_L          = 0x066A;
BAKMEM5_H          = 0x066B;
BAKMEM6            = 0x066C;
BAKMEM6_L          = 0x066C;
BAKMEM6_H          = 0x066D;
BAKMEM7            = 0x066E;
BAKMEM7_L          = 0x066E;
BAKMEM7_H          = 0x066F;
BAKMEM8            = 0x0670;
BAKMEM8_L          = 0x0670;
BAKMEM8_H          = 0x0671;
BAKMEM9            = 0x0672;
BAKMEM9_L          = 0x0672;
BAKMEM9_H          = 0x0673;
BAKMEM10           = 0x0674;
BAKMEM10_L         = 0x0674;
BAKMEM10_H         = 0x0675;
BAKMEM11           = 0x0676;
BAKMEM11_L         = 0x0676;
BAKMEM11_H         = 0x0677;
BAKMEM12           = 0x0678;
BAKMEM12_L         = 0x0678;
BAKMEM12_H         = 0x0679;
BAKMEM13           = 0x067A;
BAKMEM13_L         = 0x067A;
BAKMEM13_H         = 0x067B;
BAKMEM14           = 0x067C;
BAKMEM14_L         = 0x067C;
BAKMEM14_H         = 0x067D;
BAKMEM15           = 0x067E;
BAKMEM15_L         = 0x067E;
BAKMEM15_H         = 0x067F;


/*****************************************************************************
 CAPTIO
*****************************************************************************/
CAPTIOCTL          = 0x02EE;
CAPTIOCTL_L        = 0x02EE;
CAPTIOCTL_H        = 0x02EF;


/*****************************************************************************
 CRC
*****************************************************************************/
CRCDI              = 0x01C0;
CRCDI_L            = 0x01C0;
CRCDI_H            = 0x01C1;
CRCDIRB            = 0x01C2;
CRCDIRB_L          = 0x01C2;
CRCDIRB_H          = 0x01C3;
CRCINIRES          = 0x01C4;
CRCINIRES_L        = 0x01C4;
CRCINIRES_H        = 0x01C5;
CRCRESR            = 0x01C6;
CRCRESR_L          = 0x01C6;
CRCRESR_H          = 0x01C7;


/*****************************************************************************
 CS
*****************************************************************************/
CSCTL0             = 0x0180;
CSCTL0_L           = 0x0180;
CSCTL0_H           = 0x0181;
CSCTL1             = 0x0182;
CSCTL1_L           = 0x0182;
CSCTL1_H           = 0x0183;
CSCTL2             = 0x0184;
CSCTL2_L           = 0x0184;
CSCTL2_H           = 0x0185;
CSCTL3             = 0x0186;
CSCTL3_L           = 0x0186;
CSCTL3_H           = 0x0187;
CSCTL4             = 0x0188;
CSCTL4_L           = 0x0188;
CSCTL4_H           = 0x0189;
CSCTL5             = 0x018A;
CSCTL5_L           = 0x018A;
CSCTL5_H           = 0x018B;
CSCTL6             = 0x018C;
CSCTL6_L           = 0x018C;
CSCTL6_H           = 0x018D;
CSCTL7             = 0x018E;
CSCTL7_L           = 0x018E;
CSCTL7_H           = 0x018F;
CSCTL8             = 0x0190;
CSCTL8_L           = 0x0190;
CSCTL8_H           = 0x0191;


/*****************************************************************************
 DIO
*****************************************************************************/
PAIN               = 0x0200;
PAIN_L             = 0x0200;
PAIN_H             = 0x0201;
PAOUT              = 0x0202;
PAOUT_L            = 0x0202;
PAOUT_H            = 0x0203;
PADIR              = 0x0204;
PADIR_L            = 0x0204;
PADIR_H            = 0x0205;
PAREN              = 0x0206;
PAREN_L            = 0x0206;
PAREN_H            = 0x0207;
PASEL0             = 0x020A;
PASEL0_L           = 0x020A;
PASEL0_H           = 0x020B;
PASEL1             = 0x020C;
PASEL1_L           = 0x020C;
PASEL1_H           = 0x020D;
P1IV               = 0x020E;
P1IV_L             = 0x020E;
P1IV_H             = 0x020F;
PASELC             = 0x0216;
PASELC_L           = 0x0216;
PASELC_H           = 0x0217;
PAIES              = 0x0218;
PAIES_L            = 0x0218;
PAIES_H            = 0x0219;
PAIE               = 0x021A;
PAIE_L             = 0x021A;
PAIE_H             = 0x021B;
PAIFG              = 0x021C;
PAIFG_L            = 0x021C;
PAIFG_H            = 0x021D;
P2IV               = 0x021E;
P2IV_L             = 0x021E;
P2IV_H             = 0x021F;
PJIN               = 0x0320;
PJIN_L             = 0x0320;
PJIN_H             = 0x0321;
PJOUT              = 0x0322;
PJOUT_L            = 0x0322;
PJOUT_H            = 0x0323;
PJDIR              = 0x0324;
PJDIR_L            = 0x0324;
PJDIR_H            = 0x0325;
PJREN              = 0x0326;
PJREN_L            = 0x0326;
PJREN_H            = 0x0327;
PJSEL0             = 0x032A;
PJSEL0_L           = 0x032A;
PJSEL0_H           = 0x032B;
PJSEL1             = 0x032C;
PJSEL1_L           = 0x032C;
PJSEL1_H           = 0x032D;
PJSELC             = 0x0336;
PJSELC_L           = 0x0336;
PJSELC_H           = 0x0337;
P1IN               = 0x0200;

P2IN               = 0x0201;

P2OUT              = 0x0203;

P1OUT              = 0x0202;

P1DIR              = 0x0204;

P2DIR              = 0x0205;

P1REN              = 0x0206;

P2REN              = 0x0207;

P1SEL0             = 0x020A;

P2SEL0             = 0x020B;

P1SEL1             = 0x020C;

P2SEL1             = 0x020D;

P1SELC             = 0x0216;

P2SELC             = 0x0217;

P1IES              = 0x0218;

P2IES              = 0x0219;

P1IE               = 0x021A;

P2IE               = 0x021B;

P1IFG              = 0x021C;

P2IFG              = 0x021D;



/*****************************************************************************
 FRCTL
*****************************************************************************/
FRCTL0             = 0x01A0;
FRCTL0_L           = 0x01A0;
FRCTL0_H           = 0x01A1;
GCCTL0             = 0x01A4;
GCCTL0_L           = 0x01A4;
GCCTL0_H           = 0x01A5;
GCCTL1             = 0x01A6;
GCCTL1_L           = 0x01A6;
GCCTL1_H           = 0x01A7;


/*****************************************************************************
 PMM
*****************************************************************************/
PMMCTL0            = 0x0120;
PMMCTL0_L          = 0x0120;
PMMCTL0_H          = 0x0121;
PMMCTL2            = 0x0124;
PMMCTL2_L          = 0x0124;
PMMCTL2_H          = 0x0125;
PMMIFG             = 0x012A;
PMMIFG_L           = 0x012A;
PMMIFG_H           = 0x012B;
PM5CTL0            = 0x0130;
PM5CTL0_L          = 0x0130;
PM5CTL0_H          = 0x0131;


/*****************************************************************************
 RTC
*****************************************************************************/
RTCCTL             = 0x0300;
RTCCTL_L           = 0x0300;
RTCCTL_H           = 0x0301;
RTCIV              = 0x0304;
RTCIV_L            = 0x0304;
RTCIV_H            = 0x0305;
RTCMOD             = 0x0308;
RTCMOD_L           = 0x0308;
RTCMOD_H           = 0x0309;
RTCCNT             = 0x030C;
RTCCNT_L           = 0x030C;
RTCCNT_H           = 0x030D;


/*****************************************************************************
 SFR
*****************************************************************************/
SFRIE1             = 0x0100;
SFRIE1_L           = 0x0100;
SFRIE1_H           = 0x0101;
SFRIFG1            = 0x0102;
SFRIFG1_L          = 0x0102;
SFRIFG1_H          = 0x0103;
SFRRPCR            = 0x0104;
SFRRPCR_L          = 0x0104;
SFRRPCR_H          = 0x0105;


/*****************************************************************************
 SYS
*****************************************************************************/
SYSCTL             = 0x0140;
SYSCTL_L           = 0x0140;
SYSCTL_H           = 0x0141;
SYSBSLC            = 0x0142;
SYSBSLC_L          = 0x0142;
SYSBSLC_H          = 0x0143;
SYSJMBC            = 0x0146;
SYSJMBC_L          = 0x0146;
SYSJMBC_H          = 0x0147;
SYSJMBI0           = 0x0148;
SYSJMBI0_L         = 0x0148;
SYSJMBI0_H         = 0x0149;
SYSJMBI1           = 0x014A;
SYSJMBI1_L         = 0x014A;
SYSJMBI1_H         = 0x014B;
SYSJMBO0           = 0x014C;
SYSJMBO0_L         = 0x014C;
SYSJMBO0_H         = 0x014D;
SYSJMBO1           = 0x014E;
SYSJMBO1_L         = 0x014E;
SYSJMBO1_H         = 0x014F;
SYSUNIV            = 0x015A;
SYSUNIV_L          = 0x015A;
SYSUNIV_H          = 0x015B;
SYSSNIV            = 0x015C;
SYSSNIV_L          = 0x015C;
SYSSNIV_H          = 0x015D;
SYSRSTIV           = 0x015E;
SYSRSTIV_L         = 0x015E;
SYSRSTIV_H         = 0x015F;
SYSCFG0            = 0x0160;
SYSCFG0_L          = 0x0160;
SYSCFG0_H          = 0x0161;
SYSCFG1            = 0x0162;
SYSCFG1_L          = 0x0162;
SYSCFG1_H          = 0x0163;
SYSCFG2            = 0x0164;
SYSCFG2_L          = 0x0164;
SYSCFG2_H          = 0x0165;
SYSCFG3            = 0x0166;
SYSCFG3_L          = 0x0166;
SYSCFG3_H          = 0x0167;


/*****************************************************************************
 TB0
*****************************************************************************/
TB0CTL             = 0x0380;
TB0CTL_L           = 0x0380;
TB0CTL_H           = 0x0381;
TB0CCTL0           = 0x0382;
TB0CCTL0_L         = 0x0382;
TB0CCTL0_H         = 0x0383;
TB0CCTL1           = 0x0384;
TB0CCTL1_L         = 0x0384;
TB0CCTL1_H         = 0x0385;
TB0CCTL2           = 0x0386;
TB0CCTL2_L         = 0x0386;
TB0CCTL2_H         = 0x0387;
TB0R               = 0x0390;
TB0R_L             = 0x0390;
TB0R_H             = 0x0391;
TB0CCR0            = 0x0392;
TB0CCR0_L          = 0x0392;
TB0CCR0_H          = 0x0393;
TB0CCR1            = 0x0394;
TB0CCR1_L          = 0x0394;
TB0CCR1_H          = 0x0395;
TB0CCR2            = 0x0396;
TB0CCR2_L          = 0x0396;
TB0CCR2_H          = 0x0397;
TB0EX0             = 0x03A0;
TB0EX0_L           = 0x03A0;
TB0EX0_H           = 0x03A1;
TB0IV              = 0x03AE;
TB0IV_L            = 0x03AE;
TB0IV_H            = 0x03AF;


/*****************************************************************************
 WDT_A
*****************************************************************************/
WDTCTL             = 0x01CC;
WDTCTL_L           = 0x01CC;
WDTCTL_H           = 0x01CD;


/*****************************************************************************
 eCOMP0
*****************************************************************************/
CPCTL0             = 0x08E0;
CPCTL0_L           = 0x08E0;
CPCTL0_H           = 0x08E1;
CPCTL1             = 0x08E2;
CPCTL1_L           = 0x08E2;
CPCTL1_H           = 0x08E3;
CPINT              = 0x08E6;
CPINT_L            = 0x08E6;
CPINT_H            = 0x08E7;
CPIV               = 0x08E8;
CPIV_L             = 0x08E8;
CPIV_H             = 0x08E9;
CPDACCTL           = 0x08F0;
CPDACCTL_L         = 0x08F0;
CPDACCTL_H         = 0x08F1;
CPDACDATA          = 0x08F2;
CPDACDATA_L        = 0x08F2;
CPDACDATA_H        = 0x08F3;


/*****************************************************************************
 eUSCI_A0
*****************************************************************************/
UCA0CTLW0          = 0x0500;
UCA0CTLW0_L        = 0x0500;
UCA0CTLW0_H        = 0x0501;
UCA0CTLW1          = 0x0502;
UCA0CTLW1_L        = 0x0502;
UCA0CTLW1_H        = 0x0503;
UCA0BRW            = 0x0506;
UCA0BRW_L          = 0x0506;
UCA0BRW_H          = 0x0507;
UCA0MCTLW          = 0x0508;
UCA0MCTLW_L        = 0x0508;
UCA0MCTLW_H        = 0x0509;
UCA0STATW          = 0x050A;
UCA0STATW_L        = 0x050A;
UCA0STATW_H        = 0x050B;
UCA0RXBUF          = 0x050C;
UCA0RXBUF_L        = 0x050C;
UCA0RXBUF_H        = 0x050D;
UCA0TXBUF          = 0x050E;
UCA0TXBUF_L        = 0x050E;
UCA0TXBUF_H        = 0x050F;
UCA0ABCTL          = 0x0510;
UCA0ABCTL_L        = 0x0510;
UCA0ABCTL_H        = 0x0511;
UCA0IRCTL          = 0x0512;
UCA0IRCTL_L        = 0x0512;
UCA0IRCTL_H        = 0x0513;
UCA0IE             = 0x051A;
UCA0IE_L           = 0x051A;
UCA0IE_H           = 0x051B;
UCA0IFG            = 0x051C;
UCA0IFG_L          = 0x051C;
UCA0IFG_H          = 0x051D;
UCA0IV             = 0x051E;
UCA0IV_L           = 0x051E;
UCA0IV_H           = 0x051F;


/****************************************************************
* End of Modules
****************************************************************/


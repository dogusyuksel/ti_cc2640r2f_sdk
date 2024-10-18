/* ============================================================================ */
/* Copyright (c) 2020, Texas Instruments Incorporated                           */
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

/******************************************************************************/
/* msp430fr4132.cmd                                                           */
/*    - Linker Command File for defintions in the header file                 */
/*    Please do not change !                                                  */
/*                                                                            */
/******************************************************************************/
/* Version: 1.213                                                             */
/******************************************************************************/


/************************************************************
* STANDARD BITS
************************************************************/
/************************************************************
* STATUS REGISTER BITS
************************************************************/
/************************************************************
* PERIPHERAL FILE MAP
************************************************************/
/************************************************************
* ADC
************************************************************/
ADCCTL0            = 0x0700;
ADCCTL0_L          = 0x0700;
ADCCTL0_H          = 0x0701;
ADCCTL1            = 0x0702;
ADCCTL1_L          = 0x0702;
ADCCTL1_H          = 0x0703;
ADCCTL2            = 0x0704;
ADCCTL2_L          = 0x0704;
ADCCTL2_H          = 0x0705;
ADCLO              = 0x0706;
ADCLO_L            = 0x0706;
ADCLO_H            = 0x0707;
ADCHI              = 0x0708;
ADCHI_L            = 0x0708;
ADCHI_H            = 0x0709;
ADCMCTL0           = 0x070A;
ADCMCTL0_L         = 0x070A;
ADCMCTL0_H         = 0x070B;
ADCMEM0            = 0x0712;
ADCMEM0_L          = 0x0712;
ADCMEM0_H          = 0x0713;
ADCIE              = 0x071A;
ADCIE_L            = 0x071A;
ADCIE_H            = 0x071B;
ADCIFG             = 0x071C;
ADCIFG_L           = 0x071C;
ADCIFG_H           = 0x071D;
ADCIV              = 0x071E;
ADCIV_L            = 0x071E;
ADCIV_H            = 0x071F;
/*************************************************************
* Backup Memory Module
*************************************************************/
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
/************************************************************
* Capacitive_Touch_IO 0
************************************************************/
CAPTIO0CTL         = 0x02EE;
CAPTIO0CTL_L       = 0x02EE;
CAPTIO0CTL_H       = 0x02EF;
/*************************************************************
* CRC Module
*************************************************************/
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
/************************************************************
* CLOCK SYSTEM CONTROL
************************************************************/
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
/*************************************************************
* FRAM Memory
*************************************************************/
FRCTL0             = 0x01A0;
FRCTL0_L           = 0x01A0;
FRCTL0_H           = 0x01A1;
GCCTL0             = 0x01A4;
GCCTL0_L           = 0x01A4;
GCCTL0_H           = 0x01A5;
GCCTL1             = 0x01A6;
GCCTL1_L           = 0x01A6;
GCCTL1_H           = 0x01A7;
/************************************************************
* LCD_E
************************************************************/
LCDCTL0            = 0x0600;
LCDCTL0_L          = 0x0600;
LCDCTL0_H          = 0x0601;
LCDCTL1            = 0x0602;
LCDCTL1_L          = 0x0602;
LCDCTL1_H          = 0x0603;
LCDBLKCTL          = 0x0604;
LCDBLKCTL_L        = 0x0604;
LCDBLKCTL_H        = 0x0605;
LCDMEMCTL          = 0x0606;
LCDMEMCTL_L        = 0x0606;
LCDMEMCTL_H        = 0x0607;
LCDVCTL            = 0x0608;
LCDVCTL_L          = 0x0608;
LCDVCTL_H          = 0x0609;
LCDPCTL0           = 0x060A;
LCDPCTL0_L         = 0x060A;
LCDPCTL0_H         = 0x060B;
LCDPCTL1           = 0x060C;
LCDPCTL1_L         = 0x060C;
LCDPCTL1_H         = 0x060D;
LCDPCTL2           = 0x060E;
LCDPCTL2_L         = 0x060E;
LCDPCTL2_H         = 0x060F;
LCDCSSEL0          = 0x0614;
LCDCSSEL0_L        = 0x0614;
LCDCSSEL0_H        = 0x0615;
LCDCSSEL1          = 0x0616;
LCDCSSEL1_L        = 0x0616;
LCDCSSEL1_H        = 0x0617;
LCDCSSEL2          = 0x0618;
LCDCSSEL2_L        = 0x0618;
LCDCSSEL2_H        = 0x0619;
LCDIV              = 0x061E;
LCDM0W             = 0x0620;
LCDM0W_L           = 0x0620;
LCDM0W_H           = 0x0621;
LCDM2W             = 0x0622;
LCDM2W_L           = 0x0622;
LCDM2W_H           = 0x0623;
LCDM4W             = 0x0624;
LCDM4W_L           = 0x0624;
LCDM4W_H           = 0x0625;
LCDM6W             = 0x0626;
LCDM6W_L           = 0x0626;
LCDM6W_H           = 0x0627;
LCDM8W             = 0x0628;
LCDM8W_L           = 0x0628;
LCDM8W_H           = 0x0629;
LCDM10W            = 0x062A;
LCDM10W_L          = 0x062A;
LCDM10W_H          = 0x062B;
LCDM12W            = 0x062C;
LCDM12W_L          = 0x062C;
LCDM12W_H          = 0x062D;
LCDM14W            = 0x062E;
LCDM14W_L          = 0x062E;
LCDM14W_H          = 0x062F;
LCDM16W            = 0x0630;
LCDM16W_L          = 0x0630;
LCDM16W_H          = 0x0631;
LCDM18W            = 0x0632;
LCDM18W_L          = 0x0632;
LCDM18W_H          = 0x0633;
LCDM20W            = 0x0634;
LCDM20W_L          = 0x0634;
LCDM20W_H          = 0x0635;
LCDM22W            = 0x0636;
LCDM22W_L          = 0x0636;
LCDM22W_H          = 0x0637;
LCDM24W            = 0x0638;
LCDM24W_L          = 0x0638;
LCDM24W_H          = 0x0639;
LCDM26W            = 0x063A;
LCDM26W_L          = 0x063A;
LCDM26W_H          = 0x063B;
LCDM28W            = 0x063C;
LCDM28W_L          = 0x063C;
LCDM28W_H          = 0x063D;
LCDM30W            = 0x063E;
LCDM30W_L          = 0x063E;
LCDM30W_H          = 0x063F;
LCDM32W            = 0x0640;
LCDM32W_L          = 0x0640;
LCDM32W_H          = 0x0641;
LCDM34W            = 0x0642;
LCDM34W_L          = 0x0642;
LCDM34W_H          = 0x0643;
LCDM36W            = 0x0644;
LCDM36W_L          = 0x0644;
LCDM36W_H          = 0x0645;
LCDM38W            = 0x0646;
LCDM38W_L          = 0x0646;
LCDM38W_H          = 0x0647;
LCDBM0W            = 0x0640;
LCDBM0W_L          = 0x0640;
LCDBM0W_H          = 0x0641;
LCDBM2W            = 0x0642;
LCDBM2W_L          = 0x0642;
LCDBM2W_H          = 0x0643;
LCDBM4W            = 0x0644;
LCDBM4W_L          = 0x0644;
LCDBM4W_H          = 0x0645;
LCDBM6W            = 0x0646;
LCDBM6W_L          = 0x0646;
LCDBM6W_H          = 0x0647;
LCDBM8W            = 0x0648;
LCDBM8W_L          = 0x0648;
LCDBM8W_H          = 0x0649;
LCDBM10W           = 0x064A;
LCDBM10W_L         = 0x064A;
LCDBM10W_H         = 0x064B;
LCDBM12W           = 0x064C;
LCDBM12W_L         = 0x064C;
LCDBM12W_H         = 0x064D;
LCDBM14W           = 0x064E;
LCDBM14W_L         = 0x064E;
LCDBM14W_H         = 0x064F;
LCDBM16W           = 0x0650;
LCDBM16W_L         = 0x0650;
LCDBM16W_H         = 0x0651;
LCDBM18W           = 0x0652;
LCDBM18W_L         = 0x0652;
LCDBM18W_H         = 0x0653;
/************************************************************
* PMM - Power Management System for FR2xx/FR4xx
************************************************************/
PMMCTL0            = 0x0120;
PMMCTL0_L          = 0x0120;
PMMCTL0_H          = 0x0121;
PMMCTL1            = 0x0122;
PMMCTL1_L          = 0x0122;
PMMCTL1_H          = 0x0123;
PMMCTL2            = 0x0124;
PMMCTL2_L          = 0x0124;
PMMCTL2_H          = 0x0125;
PMMIFG             = 0x012A;
PMMIFG_L           = 0x012A;
PMMIFG_H           = 0x012B;
PMMIE              = 0x012E;
PMMIE_L            = 0x012E;
PMMIE_H            = 0x012F;
PM5CTL0            = 0x0130;
PM5CTL0_L          = 0x0130;
PM5CTL0_H          = 0x0131;
/************************************************************
* DIGITAL I/O Port1/2 Pull up / Pull down Resistors
************************************************************/
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
PAIES              = 0x0218;
PAIES_L            = 0x0218;
PAIES_H            = 0x0219;
PAIE               = 0x021A;
PAIE_L             = 0x021A;
PAIE_H             = 0x021B;
PAIFG              = 0x021C;
PAIFG_L            = 0x021C;
PAIFG_H            = 0x021D;
P1IV               = 0x020E;
P2IV               = 0x021E;
/************************************************************
* DIGITAL I/O Port3/4 Pull up / Pull down Resistors
************************************************************/
PBIN               = 0x0220;
PBIN_L             = 0x0220;
PBIN_H             = 0x0221;
PBOUT              = 0x0222;
PBOUT_L            = 0x0222;
PBOUT_H            = 0x0223;
PBDIR              = 0x0224;
PBDIR_L            = 0x0224;
PBDIR_H            = 0x0225;
PBREN              = 0x0226;
PBREN_L            = 0x0226;
PBREN_H            = 0x0227;
PBSEL0             = 0x022A;
PBSEL0_L           = 0x022A;
PBSEL0_H           = 0x022B;
/************************************************************
* DIGITAL I/O Port5/6 Pull up / Pull down Resistors
************************************************************/
PCIN               = 0x0240;
PCIN_L             = 0x0240;
PCIN_H             = 0x0241;
PCOUT              = 0x0242;
PCOUT_L            = 0x0242;
PCOUT_H            = 0x0243;
PCDIR              = 0x0244;
PCDIR_L            = 0x0244;
PCDIR_H            = 0x0245;
PCREN              = 0x0246;
PCREN_L            = 0x0246;
PCREN_H            = 0x0247;
PCSEL0             = 0x024A;
PCSEL0_L           = 0x024A;
PCSEL0_H           = 0x024B;
/************************************************************
* DIGITAL I/O Port7/8 Pull up / Pull down Resistors
************************************************************/
PDIN               = 0x0260;
PDIN_L             = 0x0260;
PDIN_H             = 0x0261;
PDOUT              = 0x0262;
PDOUT_L            = 0x0262;
PDOUT_H            = 0x0263;
PDDIR              = 0x0264;
PDDIR_L            = 0x0264;
PDDIR_H            = 0x0265;
PDREN              = 0x0266;
PDREN_L            = 0x0266;
PDREN_H            = 0x0267;
PDSEL0             = 0x026A;
PDSEL0_L           = 0x026A;
PDSEL0_H           = 0x026B;
/************************************************************
* Real-Time Clock (RTC) Counter
************************************************************/
RTCCTL             = 0x03C0;
RTCCTL_L           = 0x03C0;
RTCCTL_H           = 0x03C1;
RTCIV              = 0x03C4;
RTCIV_L            = 0x03C4;
RTCIV_H            = 0x03C5;
RTCMOD             = 0x03C8;
RTCMOD_L           = 0x03C8;
RTCMOD_H           = 0x03C9;
RTCCNT             = 0x03CC;
RTCCNT_L           = 0x03CC;
RTCCNT_H           = 0x03CD;
/************************************************************
* SFR - Special Function Register Module
************************************************************/
SFRIE1             = 0x0100;
SFRIE1_L           = 0x0100;
SFRIE1_H           = 0x0101;
SFRIFG1            = 0x0102;
SFRIFG1_L          = 0x0102;
SFRIFG1_H          = 0x0103;
SFRRPCR            = 0x0104;
SFRRPCR_L          = 0x0104;
SFRRPCR_H          = 0x0105;
/************************************************************
* SYS - System Module
************************************************************/
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
SYSBERRIV          = 0x0158;
SYSBERRIV_L        = 0x0158;
SYSBERRIV_H        = 0x0159;
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
/************************************************************
* Timer0_A3
************************************************************/
TA0CTL             = 0x0300;
TA0CCTL0           = 0x0302;
TA0CCTL1           = 0x0304;
TA0CCTL2           = 0x0306;
TA0R               = 0x0310;
TA0CCR0            = 0x0312;
TA0CCR1            = 0x0314;
TA0CCR2            = 0x0316;
TA0IV              = 0x032E;
TA0EX0             = 0x0320;
/************************************************************
* Timer1_A3
************************************************************/
TA1CTL             = 0x0340;
TA1CCTL0           = 0x0342;
TA1CCTL1           = 0x0344;
TA1CCTL2           = 0x0346;
TA1R               = 0x0350;
TA1CCR0            = 0x0352;
TA1CCR1            = 0x0354;
TA1CCR2            = 0x0356;
TA1IV              = 0x036E;
TA1EX0             = 0x0360;
/************************************************************
* USCI A0
************************************************************/
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
UCA0RXBUF          = 0x050C;
UCA0RXBUF_L        = 0x050C;
UCA0RXBUF_H        = 0x050D;
UCA0TXBUF          = 0x050E;
UCA0TXBUF_L        = 0x050E;
UCA0TXBUF_H        = 0x050F;
UCA0ABCTL          = 0x0510;
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
/************************************************************
* USCI B0
************************************************************/
UCB0CTLW0          = 0x0540;
UCB0CTLW0_L        = 0x0540;
UCB0CTLW0_H        = 0x0541;
UCB0CTLW1          = 0x0542;
UCB0CTLW1_L        = 0x0542;
UCB0CTLW1_H        = 0x0543;
UCB0BRW            = 0x0546;
UCB0BRW_L          = 0x0546;
UCB0BRW_H          = 0x0547;
UCB0STATW          = 0x0548;
UCB0STATW_L        = 0x0548;
UCB0STATW_H        = 0x0549;
UCB0TBCNT          = 0x054A;
UCB0TBCNT_L        = 0x054A;
UCB0TBCNT_H        = 0x054B;
UCB0RXBUF          = 0x054C;
UCB0RXBUF_L        = 0x054C;
UCB0RXBUF_H        = 0x054D;
UCB0TXBUF          = 0x054E;
UCB0TXBUF_L        = 0x054E;
UCB0TXBUF_H        = 0x054F;
UCB0I2COA0         = 0x0554;
UCB0I2COA0_L       = 0x0554;
UCB0I2COA0_H       = 0x0555;
UCB0I2COA1         = 0x0556;
UCB0I2COA1_L       = 0x0556;
UCB0I2COA1_H       = 0x0557;
UCB0I2COA2         = 0x0558;
UCB0I2COA2_L       = 0x0558;
UCB0I2COA2_H       = 0x0559;
UCB0I2COA3         = 0x055A;
UCB0I2COA3_L       = 0x055A;
UCB0I2COA3_H       = 0x055B;
UCB0ADDRX          = 0x055C;
UCB0ADDRX_L        = 0x055C;
UCB0ADDRX_H        = 0x055D;
UCB0ADDMASK        = 0x055E;
UCB0ADDMASK_L      = 0x055E;
UCB0ADDMASK_H      = 0x055F;
UCB0I2CSA          = 0x0560;
UCB0I2CSA_L        = 0x0560;
UCB0I2CSA_H        = 0x0561;
UCB0IE             = 0x056A;
UCB0IE_L           = 0x056A;
UCB0IE_H           = 0x056B;
UCB0IFG            = 0x056C;
UCB0IFG_L          = 0x056C;
UCB0IFG_H          = 0x056D;
UCB0IV             = 0x056E;
/************************************************************
* WATCHDOG TIMER A
************************************************************/
WDTCTL             = 0x01CC;
WDTCTL_L           = 0x01CC;
WDTCTL_H           = 0x01CD;
/************************************************************
* TLV Descriptors
************************************************************/
/************************************************************
* Interrupt Vectors (offset from 0xFF80 + 0x10 for Password)
************************************************************/
/************************************************************
* End of Modules
************************************************************/

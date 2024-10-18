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
/*    msp430fr2675.cmd                                        */
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
 ADC
*****************************************************************************/
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
 CAPTIVATE
*****************************************************************************/
CAPIE              = 0x0B20;
CAPIE_L            = 0x0B20;
CAPIE_H            = 0x0B21;
CAPIFG             = 0x0B22;
CAPIFG_L           = 0x0B22;
CAPIFG_H           = 0x0B23;
CAPIV              = 0x0B24;
CAPIV_L            = 0x0B24;
CAPIV_H            = 0x0B25;


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
PBSEL1             = 0x022C;
PBSEL1_L           = 0x022C;
PBSEL1_H           = 0x022D;
P3IV               = 0x022E;
P3IV_L             = 0x022E;
P3IV_H             = 0x022F;
PBSELC             = 0x0236;
PBSELC_L           = 0x0236;
PBSELC_H           = 0x0237;
PBIES              = 0x0238;
PBIES_L            = 0x0238;
PBIES_H            = 0x0239;
PBIE               = 0x023A;
PBIE_L             = 0x023A;
PBIE_H             = 0x023B;
PBIFG              = 0x023C;
PBIFG_L            = 0x023C;
PBIFG_H            = 0x023D;
P4IV               = 0x023E;
P4IV_L             = 0x023E;
P4IV_H             = 0x023F;
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
PCSEL1             = 0x024C;
PCSEL1_L           = 0x024C;
PCSEL1_H           = 0x024D;
P5IV               = 0x024E;
P5IV_L             = 0x024E;
P5IV_H             = 0x024F;
PCSELC             = 0x0256;
PCSELC_L           = 0x0256;
PCSELC_H           = 0x0257;
PCIES              = 0x0258;
PCIES_L            = 0x0258;
PCIES_H            = 0x0259;
PCIE               = 0x025A;
PCIE_L             = 0x025A;
PCIE_H             = 0x025B;
PCIFG              = 0x025C;
PCIFG_L            = 0x025C;
PCIFG_H            = 0x025D;
P6IV               = 0x025E;
P6IV_L             = 0x025E;
P6IV_H             = 0x025F;
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

P3IN               = 0x0220;

P4IN               = 0x0221;

P3OUT              = 0x0222;

P4OUT              = 0x0223;

P3DIR              = 0x0224;

P4DIR              = 0x0225;

P3REN              = 0x0226;

P4REN              = 0x0227;

P4SEL0             = 0x022B;

P3SEL0             = 0x022A;

P3SEL1             = 0x022C;

P4SEL1             = 0x022D;

P3SELC             = 0x0236;

P4SELC             = 0x0237;

P3IES              = 0x0238;

P4IES              = 0x0239;

P3IE               = 0x023A;

P4IE               = 0x023B;

P3IFG              = 0x023C;

P4IFG              = 0x023D;

P5IN               = 0x0240;

P6IN               = 0x0241;

P5OUT              = 0x0242;

P6OUT              = 0x0243;

P5DIR              = 0x0244;

P6DIR              = 0x0245;

P5REN              = 0x0246;

P6REN              = 0x0247;

P5SEL0             = 0x024A;

P6SEL0             = 0x024B;

P5SEL1             = 0x024C;

P6SEL1             = 0x024D;

P5SELC             = 0x0256;

P6SELC             = 0x0257;

P5IES              = 0x0258;

P6IES              = 0x0259;

P5IE               = 0x025A;

P6IE               = 0x025B;

P5IFG              = 0x025C;

P6IFG              = 0x025D;



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
 MPY32
*****************************************************************************/
MPY                = 0x04C0;
MPY_L              = 0x04C0;
MPY_H              = 0x04C1;
MPYS               = 0x04C2;
MPYS_L             = 0x04C2;
MPYS_H             = 0x04C3;
MAC                = 0x04C4;
MAC_L              = 0x04C4;
MAC_H              = 0x04C5;
MACS               = 0x04C6;
MACS_L             = 0x04C6;
MACS_H             = 0x04C7;
OP2                = 0x04C8;
OP2_L              = 0x04C8;
OP2_H              = 0x04C9;
RESLO              = 0x04CA;
RESLO_L            = 0x04CA;
RESLO_H            = 0x04CB;
RESHI              = 0x04CC;
RESHI_L            = 0x04CC;
RESHI_H            = 0x04CD;
SUMEXT             = 0x04CE;
SUMEXT_L           = 0x04CE;
SUMEXT_H           = 0x04CF;
MPY32L             = 0x04D0;
MPY32L_L           = 0x04D0;
MPY32L_H           = 0x04D1;
MPY32H             = 0x04D2;
MPY32H_L           = 0x04D2;
MPY32H_H           = 0x04D3;
MPYS32L            = 0x04D4;
MPYS32L_L          = 0x04D4;
MPYS32L_H          = 0x04D5;
MPYS32H            = 0x04D6;
MPYS32H_L          = 0x04D6;
MPYS32H_H          = 0x04D7;
MAC32L             = 0x04D8;
MAC32L_L           = 0x04D8;
MAC32L_H           = 0x04D9;
MAC32H             = 0x04DA;
MAC32H_L           = 0x04DA;
MAC32H_H           = 0x04DB;
MACS32L            = 0x04DC;
MACS32L_L          = 0x04DC;
MACS32L_H          = 0x04DD;
MACS32H            = 0x04DE;
MACS32H_L          = 0x04DE;
MACS32H_H          = 0x04DF;
OP2L               = 0x04E0;
OP2L_L             = 0x04E0;
OP2L_H             = 0x04E1;
OP2H               = 0x04E2;
OP2H_L             = 0x04E2;
OP2H_H             = 0x04E3;
RES0               = 0x04E4;
RES0_L             = 0x04E4;
RES0_H             = 0x04E5;
RES1               = 0x04E6;
RES1_L             = 0x04E6;
RES1_H             = 0x04E7;
RES2               = 0x04E8;
RES2_L             = 0x04E8;
RES2_H             = 0x04E9;
RES3               = 0x04EA;
RES3_L             = 0x04EA;
RES3_H             = 0x04EB;
MPY32CTL0          = 0x04EC;
MPY32CTL0_L        = 0x04EC;
MPY32CTL0_H        = 0x04ED;


/*****************************************************************************
 PMM
*****************************************************************************/
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
 TA0
*****************************************************************************/
TA0CTL             = 0x0380;
TA0CTL_L           = 0x0380;
TA0CTL_H           = 0x0381;
TA0CCTL0           = 0x0382;
TA0CCTL0_L         = 0x0382;
TA0CCTL0_H         = 0x0383;
TA0CCTL1           = 0x0384;
TA0CCTL1_L         = 0x0384;
TA0CCTL1_H         = 0x0385;
TA0CCTL2           = 0x0386;
TA0CCTL2_L         = 0x0386;
TA0CCTL2_H         = 0x0387;
TA0R               = 0x0390;
TA0R_L             = 0x0390;
TA0R_H             = 0x0391;
TA0CCR0            = 0x0392;
TA0CCR0_L          = 0x0392;
TA0CCR0_H          = 0x0393;
TA0CCR1            = 0x0394;
TA0CCR1_L          = 0x0394;
TA0CCR1_H          = 0x0395;
TA0CCR2            = 0x0396;
TA0CCR2_L          = 0x0396;
TA0CCR2_H          = 0x0397;
TA0EX0             = 0x03A0;
TA0EX0_L           = 0x03A0;
TA0EX0_H           = 0x03A1;
TA0IV              = 0x03AE;
TA0IV_L            = 0x03AE;
TA0IV_H            = 0x03AF;


/*****************************************************************************
 TA1
*****************************************************************************/
TA1CTL             = 0x03C0;
TA1CTL_L           = 0x03C0;
TA1CTL_H           = 0x03C1;
TA1CCTL0           = 0x03C2;
TA1CCTL0_L         = 0x03C2;
TA1CCTL0_H         = 0x03C3;
TA1CCTL1           = 0x03C4;
TA1CCTL1_L         = 0x03C4;
TA1CCTL1_H         = 0x03C5;
TA1CCTL2           = 0x03C6;
TA1CCTL2_L         = 0x03C6;
TA1CCTL2_H         = 0x03C7;
TA1R               = 0x03D0;
TA1R_L             = 0x03D0;
TA1R_H             = 0x03D1;
TA1CCR0            = 0x03D2;
TA1CCR0_L          = 0x03D2;
TA1CCR0_H          = 0x03D3;
TA1CCR1            = 0x03D4;
TA1CCR1_L          = 0x03D4;
TA1CCR1_H          = 0x03D5;
TA1CCR2            = 0x03D6;
TA1CCR2_L          = 0x03D6;
TA1CCR2_H          = 0x03D7;
TA1EX0             = 0x03E0;
TA1EX0_L           = 0x03E0;
TA1EX0_H           = 0x03E1;
TA1IV              = 0x03EE;
TA1IV_L            = 0x03EE;
TA1IV_H            = 0x03EF;


/*****************************************************************************
 TA2
*****************************************************************************/
TA2CTL             = 0x0400;
TA2CTL_L           = 0x0400;
TA2CTL_H           = 0x0401;
TA2CCTL0           = 0x0402;
TA2CCTL0_L         = 0x0402;
TA2CCTL0_H         = 0x0403;
TA2CCTL1           = 0x0404;
TA2CCTL1_L         = 0x0404;
TA2CCTL1_H         = 0x0405;
TA2CCTL2           = 0x0406;
TA2CCTL2_L         = 0x0406;
TA2CCTL2_H         = 0x0407;
TA2R               = 0x0410;
TA2R_L             = 0x0410;
TA2R_H             = 0x0411;
TA2CCR0            = 0x0412;
TA2CCR0_L          = 0x0412;
TA2CCR0_H          = 0x0413;
TA2CCR1            = 0x0414;
TA2CCR1_L          = 0x0414;
TA2CCR1_H          = 0x0415;
TA2CCR2            = 0x0416;
TA2CCR2_L          = 0x0416;
TA2CCR2_H          = 0x0417;
TA2EX0             = 0x0420;
TA2EX0_L           = 0x0420;
TA2EX0_H           = 0x0421;
TA2IV              = 0x042E;
TA2IV_L            = 0x042E;
TA2IV_H            = 0x042F;


/*****************************************************************************
 TA3
*****************************************************************************/
TA3CTL             = 0x0440;
TA3CTL_L           = 0x0440;
TA3CTL_H           = 0x0441;
TA3CCTL0           = 0x0442;
TA3CCTL0_L         = 0x0442;
TA3CCTL0_H         = 0x0443;
TA3CCTL1           = 0x0444;
TA3CCTL1_L         = 0x0444;
TA3CCTL1_H         = 0x0445;
TA3CCTL2           = 0x0446;
TA3CCTL2_L         = 0x0446;
TA3CCTL2_H         = 0x0447;
TA3R               = 0x0450;
TA3R_L             = 0x0450;
TA3R_H             = 0x0451;
TA3CCR0            = 0x0452;
TA3CCR0_L          = 0x0452;
TA3CCR0_H          = 0x0453;
TA3CCR1            = 0x0454;
TA3CCR1_L          = 0x0454;
TA3CCR1_H          = 0x0455;
TA3CCR2            = 0x0456;
TA3CCR2_L          = 0x0456;
TA3CCR2_H          = 0x0457;
TA3EX0             = 0x0460;
TA3EX0_L           = 0x0460;
TA3EX0_H           = 0x0461;
TA3IV              = 0x046E;
TA3IV_L            = 0x046E;
TA3IV_H            = 0x046F;


/*****************************************************************************
 TB0
*****************************************************************************/
TB0CTL             = 0x0480;
TB0CTL_L           = 0x0480;
TB0CTL_H           = 0x0481;
TB0CCTL0           = 0x0482;
TB0CCTL0_L         = 0x0482;
TB0CCTL0_H         = 0x0483;
TB0CCTL1           = 0x0484;
TB0CCTL1_L         = 0x0484;
TB0CCTL1_H         = 0x0485;
TB0CCTL2           = 0x0486;
TB0CCTL2_L         = 0x0486;
TB0CCTL2_H         = 0x0487;
TB0CCTL3           = 0x0488;
TB0CCTL3_L         = 0x0488;
TB0CCTL3_H         = 0x0489;
TB0CCTL4           = 0x048A;
TB0CCTL4_L         = 0x048A;
TB0CCTL4_H         = 0x048B;
TB0CCTL5           = 0x048C;
TB0CCTL5_L         = 0x048C;
TB0CCTL5_H         = 0x048D;
TB0CCTL6           = 0x048E;
TB0CCTL6_L         = 0x048E;
TB0CCTL6_H         = 0x048F;
TB0R               = 0x0490;
TB0R_L             = 0x0490;
TB0R_H             = 0x0491;
TB0CCR0            = 0x0492;
TB0CCR0_L          = 0x0492;
TB0CCR0_H          = 0x0493;
TB0CCR1            = 0x0494;
TB0CCR1_L          = 0x0494;
TB0CCR1_H          = 0x0495;
TB0CCR2            = 0x0496;
TB0CCR2_L          = 0x0496;
TB0CCR2_H          = 0x0497;
TB0CCR3            = 0x0498;
TB0CCR3_L          = 0x0498;
TB0CCR3_H          = 0x0499;
TB0CCR4            = 0x049A;
TB0CCR4_L          = 0x049A;
TB0CCR4_H          = 0x049B;
TB0CCR5            = 0x049C;
TB0CCR5_L          = 0x049C;
TB0CCR5_H          = 0x049D;
TB0CCR6            = 0x049E;
TB0CCR6_L          = 0x049E;
TB0CCR6_H          = 0x049F;
TB0EX0             = 0x04A0;
TB0EX0_L           = 0x04A0;
TB0EX0_H           = 0x04A1;
TB0IV              = 0x04AE;
TB0IV_L            = 0x04AE;
TB0IV_H            = 0x04AF;


/*****************************************************************************
 WDT_A
*****************************************************************************/
WDTCTL             = 0x01CC;
WDTCTL_L           = 0x01CC;
WDTCTL_H           = 0x01CD;


/*****************************************************************************
 eCOMP0
*****************************************************************************/
CP0CTL0            = 0x08E0;
CP0CTL0_L          = 0x08E0;
CP0CTL0_H          = 0x08E1;
CP0CTL1            = 0x08E2;
CP0CTL1_L          = 0x08E2;
CP0CTL1_H          = 0x08E3;
CP0INT             = 0x08E6;
CP0INT_L           = 0x08E6;
CP0INT_H           = 0x08E7;
CP0IV              = 0x08E8;
CP0IV_L            = 0x08E8;
CP0IV_H            = 0x08E9;
CP0DACCTL          = 0x08F0;
CP0DACCTL_L        = 0x08F0;
CP0DACCTL_H        = 0x08F1;
CP0DACDATA         = 0x08F2;
CP0DACDATA_L       = 0x08F2;
CP0DACDATA_H       = 0x08F3;


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


/*****************************************************************************
 eUSCI_A1
*****************************************************************************/
UCA1CTLW0          = 0x0520;
UCA1CTLW0_L        = 0x0520;
UCA1CTLW0_H        = 0x0521;
UCA1CTLW1          = 0x0522;
UCA1CTLW1_L        = 0x0522;
UCA1CTLW1_H        = 0x0523;
UCA1BRW            = 0x0526;
UCA1BRW_L          = 0x0526;
UCA1BRW_H          = 0x0527;
UCA1MCTLW          = 0x0528;
UCA1MCTLW_L        = 0x0528;
UCA1MCTLW_H        = 0x0529;
UCA1STATW          = 0x052A;
UCA1STATW_L        = 0x052A;
UCA1STATW_H        = 0x052B;
UCA1RXBUF          = 0x052C;
UCA1RXBUF_L        = 0x052C;
UCA1RXBUF_H        = 0x052D;
UCA1TXBUF          = 0x052E;
UCA1TXBUF_L        = 0x052E;
UCA1TXBUF_H        = 0x052F;
UCA1ABCTL          = 0x0530;
UCA1ABCTL_L        = 0x0530;
UCA1ABCTL_H        = 0x0531;
UCA1IRCTL          = 0x0532;
UCA1IRCTL_L        = 0x0532;
UCA1IRCTL_H        = 0x0533;
UCA1IE             = 0x053A;
UCA1IE_L           = 0x053A;
UCA1IE_H           = 0x053B;
UCA1IFG            = 0x053C;
UCA1IFG_L          = 0x053C;
UCA1IFG_H          = 0x053D;
UCA1IV             = 0x053E;
UCA1IV_L           = 0x053E;
UCA1IV_H           = 0x053F;


/*****************************************************************************
 eUSCI_B0
*****************************************************************************/
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
UCB0IV_L           = 0x056E;
UCB0IV_H           = 0x056F;


/*****************************************************************************
 eUSCI_B1
*****************************************************************************/
UCB1CTLW0          = 0x0580;
UCB1CTLW0_L        = 0x0580;
UCB1CTLW0_H        = 0x0581;
UCB1CTLW1          = 0x0582;
UCB1CTLW1_L        = 0x0582;
UCB1CTLW1_H        = 0x0583;
UCB1BRW            = 0x0586;
UCB1BRW_L          = 0x0586;
UCB1BRW_H          = 0x0587;
UCB1STATW          = 0x0588;
UCB1STATW_L        = 0x0588;
UCB1STATW_H        = 0x0589;
UCB1TBCNT          = 0x058A;
UCB1TBCNT_L        = 0x058A;
UCB1TBCNT_H        = 0x058B;
UCB1RXBUF          = 0x058C;
UCB1RXBUF_L        = 0x058C;
UCB1RXBUF_H        = 0x058D;
UCB1TXBUF          = 0x058E;
UCB1TXBUF_L        = 0x058E;
UCB1TXBUF_H        = 0x058F;
UCB1I2COA0         = 0x0594;
UCB1I2COA0_L       = 0x0594;
UCB1I2COA0_H       = 0x0595;
UCB1I2COA1         = 0x0596;
UCB1I2COA1_L       = 0x0596;
UCB1I2COA1_H       = 0x0597;
UCB1I2COA2         = 0x0598;
UCB1I2COA2_L       = 0x0598;
UCB1I2COA2_H       = 0x0599;
UCB1I2COA3         = 0x059A;
UCB1I2COA3_L       = 0x059A;
UCB1I2COA3_H       = 0x059B;
UCB1ADDRX          = 0x059C;
UCB1ADDRX_L        = 0x059C;
UCB1ADDRX_H        = 0x059D;
UCB1ADDMASK        = 0x059E;
UCB1ADDMASK_L      = 0x059E;
UCB1ADDMASK_H      = 0x059F;
UCB1I2CSA          = 0x05A0;
UCB1I2CSA_L        = 0x05A0;
UCB1I2CSA_H        = 0x05A1;
UCB1IE             = 0x05AA;
UCB1IE_L           = 0x05AA;
UCB1IE_H           = 0x05AB;
UCB1IFG            = 0x05AC;
UCB1IFG_L          = 0x05AC;
UCB1IFG_H          = 0x05AD;
UCB1IV             = 0x05AE;
UCB1IV_L           = 0x05AE;
UCB1IV_H           = 0x05AF;


/****************************************************************
* End of Modules
****************************************************************/


//******************************************************************************
//   MSP430L092 Demo - BlinkLED
//
//   Description: BlinkLED For L092 Target board using the Boost Converter LEDs
//
//*******************************************************************************
//
//                MSP430L092
//                -----------------
//            /|\|                 |
//             --|RST              |
//               |                 |
//   Boost    -->|P1.2             |
//               |                 |
//                -----------------
//
//   Texas Instruments Inc.
//   May 2010
//******************************************************************************
#include <msp430.h>

int main(void)
{
  WDTCTL = WDTPW + WDTHOLD;                 // Stop WDT
  CCSCTL0 = CCSKEY;                         // open CCS
  CCSCTL4 = SELA__HFCLK+SELS__HFCLK;
  CCSCTL5 = DIVA__4;
  CCSCTL8 = 0;
  do
  {
    SFRIFG1 = 0;
    CCSCTL7 = 0;
  }
  while( SFRIFG1 & OFIFG );

  P1DIR = 0x04;                             // P1.2 as output

  TA1CCR0 = 12000;
  TA1CCTL0 = CCIE;
  TA1CTL = TASSEL_1+ID_3+TACLR+MC_1;
  __bis_SR_register(GIE);                   // Enable interrupts
  while(1);

}

// Timer A1 interrupt service routine
#pragma vector=TIMER1_A0_VECTOR
__interrupt void Timer_A1 (void)
{
   P1SEL1 ^= 0x04;
   P1SEL0 ^= 0x04;                          // Toggle ACLK at P1.2
}

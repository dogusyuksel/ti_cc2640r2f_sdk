//***************************************************************************************
//  MSP430 Blink the LED Demo - Software Toggle P1.4
//
//  Description; Toggle P1.4 by xor'ing P1.4 inside of a software loop.
//  ACLK = n/a, MCLK = SMCLK = default DCO
//
//                MSP430i20xx
//             -----------------
//         /|\|              XIN|-
//          | |                 |
//          --|RST          XOUT|-
//            |                 |
//            |             P1.4|-->LED
//
//  Texas Instruments, Inc
//  July 2011
//***************************************************************************************

#include <msp430.h>				

void main(void) {
	WDTCTL = WDTPW | WDTHOLD;		// Stop watchdog timer
	P1DIR |= BIT4;					// Set P1.4 to output direction

	for(;;) {
		volatile unsigned long i;	// volatile to prevent optimization

		P1OUT ^= BIT4;				// Toggle P1.4 using exclusive-OR

		i = 100000;					// SW Delay
		do i--;
		while(i != 0);
	}
}

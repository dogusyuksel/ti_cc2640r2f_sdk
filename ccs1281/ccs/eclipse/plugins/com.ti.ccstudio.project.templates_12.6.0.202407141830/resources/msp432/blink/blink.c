#include "msp.h"


/**
 * blink.c
 */
void main(void)
{
	WDTCTL = WDTPW | WDTHOLD;		// stop watchdog timer
	P1DIR |= BIT0;					// configure P1.0 as output

	volatile uint32_t i;			// volatile to prevent optimization

	while(1)
	{
		P1OUT ^= BIT0;				// toggle P1.0
		for(i=10000; i>0; i--);		// delay
	}
}

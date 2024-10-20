/******************************************************************************

 @file  hal_trng_wrapper.c

 @brief This file contains an API for returning a True Random
        Number Generator until one is provided elsewhere.

 Group: WCS, LPC, BTS
 $Target Device: DEVICES $

 ******************************************************************************
 $License: BSD3 2011 $
 ******************************************************************************
 $Release Name: PACKAGE NAME $
 $Release Date: PACKAGE RELEASE DATE $
 *****************************************************************************/

/*******************************************************************************
 * INCLUDES
 */

#include <inc/hw_types.h>
#include <inc/hw_sysctl.h>
#include "hal_trng_wrapper.h"

#ifdef USE_DMM
#include "trng_api.h"
#endif

/*******************************************************************************
 * MACROS
 */

/*******************************************************************************
 * CONSTANTS
 */

/*******************************************************************************
 * TYPEDEFS
 */

/*******************************************************************************
 * LOCAL VARIABLES
 */

/*******************************************************************************
 * GLOBAL VARIABLES
 */
#if !defined(USE_FPGA) && !defined(USE_DMM)
static uint32 lastTrngVal;
#endif // ! USE_FPGA && ! USE_DMM

/*
** Software FIFO Application Programming Interface
*/

/*******************************************************************************
 * @fn          HalTRNG_InitTRNG
 *
 * @brief       This routine initializes the TRNG hardware.
 *
 * input parameters
 *
 * @param       None.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
void HalTRNG_InitTRNG( void )
{
#ifdef USE_DMM
    // init an open the TRNG driver
    TRNG_init();
    TRNG_open(0);
#else

    #ifndef USE_FPGA
  // configure TRNG
  // Note: Min=4x64, Max=1x256, ClkDiv=1+1 gives the same startup and refill
  //       time, and takes about 11us (~14us with overhead).
  TRNGConfigure( 256, 256, 0x01 );

  // enable TRNG
  TRNGEnable();

  // init variable to hold the last value read
  lastTrngVal = 0;
#endif // ! USE_FPGA

#endif
  return;
}


/*******************************************************************************
 * @fn          HalTRNG_WaitForReady
 *
 * @brief       This routine waits until the TRNG hardware is ready to be used.
 *
 * input parameters
 *
 * @param       None.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
void HalTRNG_WaitForReady( void )
{
#if !defined(USE_FPGA) && !defined(USE_DMM)
  // poll status
  while(!(TRNGStatusGet() & TRNG_NUMBER_READY));
#endif // ! USE_FPGA

  return;
}


/*******************************************************************************
 * @fn          HalTRNG_GetTRNG
 *
 * @brief       This routine returns a 32 bit TRNG number.
 *
 * input parameters
 *
 * @param       None.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      A 32 bit TRNG number.
 */
uint32 HalTRNG_GetTRNG( void )
{
#ifdef USE_DMM
    return TRNG_getNumber(NULL, NULL, NULL);
#else
#ifdef USE_FPGA
  return( 0xDEADBEEF );
#else
  uint32 trngVal;

  // initialize and enable TRNG if TRNG is not enabled
  if (0 == (HWREG(TRNG_BASE + TRNG_O_CTL) & TRNG_CTL_TRNG_EN))
  {
    HalTRNG_InitTRNG();
  }

  // check that a valid value is ready
  while(!(TRNGStatusGet() & TRNG_NUMBER_READY));

  // check to be sure we're not getting the same value repeatedly
  if ( (trngVal = TRNGNumberGet(TRNG_LOW_WORD)) == lastTrngVal )
  {
    return( 0xDEADBEEF );
  }
  else // value changed!
  {
    // so save last TRNG value
    lastTrngVal = trngVal;

    return( trngVal );
  }
#endif // USE_FPGA
#endif //USE_DMM
}


/*******************************************************************************
 */



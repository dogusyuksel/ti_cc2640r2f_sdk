/******************************************************************************

 @file  bsp_spi.c

 @brief Common API for SPI access. Driverlib implementation.

 Group: WCS, BTS
 Target Device: cc2640r2

 ******************************************************************************
 
 Copyright (c) 2014-2019, Texas Instruments Incorporated
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 *  Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

 *  Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

 *  Neither the name of Texas Instruments Incorporated nor the names of
    its contributors may be used to endorse or promote products derived
    from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 ******************************************************************************
 
 
 *****************************************************************************/
#include <driverlib/ssi.h>
#include <driverlib/gpio.h>
#include <driverlib/prcm.h>
#include <driverlib/ioc.h>
#include <driverlib/rom.h>
#include <driverlib/ssi.h>
#include "bsp.h"
#include "bsp_spi.h"

/* Board specific settings for CC26xx SensorTag, PCB version 1.01
 *
 * Note that since this module is an experimental implementation,
 * board specific settings are directly hard coded here.
 */
#define BLS_SPI_BASE      SSI0_BASE
#define BLS_CPU_FREQ      48000000ul

/**
 * Write a command to SPI
 */
int bspSpiWrite(const uint8_t *buf, size_t len)
{
  while (len > 0)
  {
    uint32_t ul;

    SSIDataPut(BLS_SPI_BASE, *buf);
    SSIDataGet(BLS_SPI_BASE, &ul);
    len--;
    buf++;
  }

  return (0);
}

/**
 * Read from SPI
 */
int bspSpiRead(uint8_t *buf, size_t len)
{
  while (len > 0)
  {
    uint32_t ul;

    if (!SSIDataPutNonBlocking(BLS_SPI_BASE, 0))
    {
      /* Error */
      return (-1);
    }

    SSIDataGet(BLS_SPI_BASE, &ul);
    *buf = (uint8_t) ul;
    len--;
    buf++;
  }

  return (0);
}


/* See bsp_spi.h file for description */
void bspSpiFlush(void)
{
  uint32_t ul;

  while (SSIDataGetNonBlocking(BLS_SPI_BASE, &ul));
}


/* See bsp_spi.h file for description */
void bspSpiOpen(uint32_t bitRate, uint32_t clkPin)
{
  /* GPIO power && SPI power domain */
  PRCMPowerDomainOn(PRCM_DOMAIN_PERIPH | PRCM_DOMAIN_SERIAL);
  while (PRCMPowerDomainStatus(PRCM_DOMAIN_PERIPH | PRCM_DOMAIN_SERIAL)
         != PRCM_DOMAIN_POWER_ON);

  /* GPIO power */
  PRCMPeripheralRunEnable(PRCM_PERIPH_GPIO);
  PRCMLoadSet();
  while (!PRCMLoadGet());

  /* SPI power */
  PRCMPeripheralRunEnable(PRCM_PERIPH_SSI0);
  PRCMLoadSet();
  while (!PRCMLoadGet());

  /* SPI configuration */
  SSIIntDisable(BLS_SPI_BASE, SSI_RXOR | SSI_RXFF | SSI_RXTO | SSI_TXFF);
  SSIIntClear(BLS_SPI_BASE, SSI_RXOR | SSI_RXTO);
  SSIConfigSetExpClk(BLS_SPI_BASE,
                     BLS_CPU_FREQ, /* CPU rate */
                     SSI_FRF_MOTO_MODE_0, /* frame format */
                     SSI_MODE_MASTER, /* mode */
                     bitRate, /* bit rate */
                     8); /* data size */
  IOCPinTypeSsiMaster(BLS_SPI_BASE, BSP_SPI_MISO, BSP_SPI_MOSI,
                          IOID_UNUSED /* csn */, clkPin);
  SSIEnable(BLS_SPI_BASE);

  {
    /* Get read of residual data from SSI port */
    uint32_t buf;

    while (SSIDataGetNonBlocking(BLS_SPI_BASE, &buf));
  }

}

/* See bsp_spi.h file for description */
void bspSpiClose(void)
{
  // Power down SSI0
  PRCMPeripheralRunDisable(PRCM_PERIPH_SSI0);
  PRCMLoadSet();
  while (!PRCMLoadGet());

  PRCMPeripheralRunDisable(PRCM_PERIPH_GPIO);
  PRCMLoadSet();
  while (!PRCMLoadGet());

  PRCMPowerDomainOff(PRCM_DOMAIN_SERIAL | PRCM_DOMAIN_PERIPH);
  while (PRCMPowerDomainStatus(PRCM_DOMAIN_SERIAL | PRCM_DOMAIN_PERIPH)
         != PRCM_DOMAIN_POWER_OFF);

}

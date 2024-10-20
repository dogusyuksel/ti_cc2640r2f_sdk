/******************************************************************************
*  Filename:       rfc.c
*  Revised:        $Date$
*  Revision:       $Revision$
*
*  Description:    Driver for the RF Core.
*
*  Copyright (c) 2015 - 2017, Texas Instruments Incorporated
*  All rights reserved.
*
*  Redistribution and use in source and binary forms, with or without
*  modification, are permitted provided that the following conditions are met:
*
*  1) Redistributions of source code must retain the above copyright notice,
*     this list of conditions and the following disclaimer.
*
*  2) Redistributions in binary form must reproduce the above copyright notice,
*     this list of conditions and the following disclaimer in the documentation
*     and/or other materials provided with the distribution.
*
*  3) Neither the name of the ORGANIZATION nor the names of its contributors may
*     be used to endorse or promote products derived from this software without
*     specific prior written permission.
*
*  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
*  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
*  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
*  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
*  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
*  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
*  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
*  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
*  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
*  POSSIBILITY OF SUCH DAMAGE.
*
******************************************************************************/

#include "rfc.h"
#include "rf_mailbox.h"
#include <string.h>

//*****************************************************************************
//
// Handle support for DriverLib in ROM:
// This section will undo prototype renaming made in the header file
//
//*****************************************************************************
#if !defined(DOXYGEN)
    #undef  RFCCpeIntGetAndClear
    #define RFCCpeIntGetAndClear            NOROM_RFCCpeIntGetAndClear
    #undef  RFCDoorbellSendTo
    #define RFCDoorbellSendTo               NOROM_RFCDoorbellSendTo
    #undef  RFCSynthPowerDown
    #define RFCSynthPowerDown               NOROM_RFCSynthPowerDown
    #undef  RFCCpePatchReset
    #define RFCCpePatchReset                NOROM_RFCCpePatchReset
    #undef  RFCOverrideSearch
    #define RFCOverrideSearch               NOROM_RFCOverrideSearch
    #undef  RFCOverrideUpdate
    #define RFCOverrideUpdate               NOROM_RFCOverrideUpdate
    #undef  RFCHwIntGetAndClear
    #define RFCHwIntGetAndClear             NOROM_RFCHwIntGetAndClear
    #undef  RFCRfTrimRead
    #define RFCRfTrimRead                   NOROM_RFCRfTrimRead
    #undef  RFCRfTrimSet
    #define RFCRfTrimSet                    NOROM_RFCRfTrimSet
    #undef  RFCRTrim
    #define RFCRTrim                        NOROM_RFCRTrim
    #undef  RFCAdi3VcoLdoVoltageMode
    #define RFCAdi3VcoLdoVoltageMode        NOROM_RFCAdi3VcoLdoVoltageMode
#endif

// Definition of addresses and offsets
#define _CPERAM_START             0x21000000
#define _PARSER_PATCH_TAB_OFFSET  0x0350
#define _PATCH_TAB_OFFSET         0x0358
#define _IRQPATCH_OFFSET          0x03E8
#define _PATCH_VEC_OFFSET         0x0448

#define RFC_RTRIM_PATTERN           0x4038
#define RFC_RTRIM_MASK              0xFFFF

// Default interrupt table
static const uint16_t rfc_defaultIrqAddr[] =
{
   0x3f17,
   0x3de1,
   0x3e03,
   0x3e17,
   0x0b0d,
   0x3e35,
   0x3e53,
   0x09fb,
   0x655d,
   0x0af3,
   0x3e73,
   0x3ed7,
};

// Definition of BLE5 constants
#define RFC_BLE5_OVERRIDE_PATTERN 0x44F80002
#define RFC_BLE5_OVERRIDE_M       0xFFF0FFFF
#define RFC_BLE5_OVERRIDE_S       16

//*****************************************************************************
//
// Get and clear CPE interrupt flags which match the provided bitmask
//
//*****************************************************************************
uint32_t
RFCCpeIntGetAndClear(uint32_t ui32Mask)
{
    // Read the CPE interrupt flags which match the provided bitmask
    uint32_t ui32Ifg = HWREG(RFC_DBELL_BASE + RFC_DBELL_O_RFCPEIFG) & ui32Mask;

    // Clear the interrupt flags
    RFCCpeIntClear(ui32Ifg);

    // Return with the interrupt flags
    return (ui32Ifg);
}


//*****************************************************************************
//
// Send a radio operation to the doorbell and wait for an acknowledgement
//
//*****************************************************************************
uint32_t
RFCDoorbellSendTo(uint32_t pOp)
{
    // Wait until the doorbell becomes available
    while(HWREG(RFC_DBELL_BASE + RFC_DBELL_O_CMDR) != 0);
    RFCAckIntClear();

    // Submit the command to the CM0 through the doorbell
    HWREG(RFC_DBELL_BASE + RFC_DBELL_O_CMDR) = pOp;

    // Wait until the CM0 starts to parse the command
    while(!HWREG(RFC_DBELL_BASE + RFC_DBELL_O_RFACKIFG));
    RFCAckIntClear();

    // Return with the content of status register
    return(HWREG(RFC_DBELL_BASE + RFC_DBELL_O_CMDSTA));
}


//*****************************************************************************
//
// Turn off the RF synthesizer. The radio will no longer respond to commands!
//
//*****************************************************************************
void
RFCSynthPowerDown(void)
{
    // Definition of reserved words
    const uint32_t RFC_RESERVED0 = 0x40044108;
    const uint32_t RFC_RESERVED1 = 0x40044114;
    const uint32_t RFC_RESERVED2 = 0x4004410C;
    const uint32_t RFC_RESERVED3 = 0x40044100;

    // Disable CPE clock, enable FSCA clock.
    HWREG(RFC_PWR_NONBUF_BASE + RFC_PWR_O_PWMCLKEN) = (HWREG(RFC_PWR_NONBUF_BASE + RFC_PWR_O_PWMCLKEN)
                                                    & ~RFC_PWR_PWMCLKEN_CPE_M) | RFC_PWR_PWMCLKEN_FSCA_M;

    HWREG(RFC_RESERVED0) = 3;
    HWREG(RFC_RESERVED1) = 0x1030;
    HWREG(RFC_RESERVED2) = 1;
    HWREG(RFC_RESERVED1) = 0x50;
    HWREG(RFC_RESERVED2) = 1;
    HWREG(RFC_RESERVED1) = 0x650;
    HWREG(RFC_RESERVED2) = 1;
    HWREG(RFC_RESERVED3) = 1;

}


//*****************************************************************************
//
// Reset previously patched CPE RAM to a state where it can be patched again
//
//*****************************************************************************
void
RFCCpePatchReset(void)
{
    uint8_t *pPatchTab  = (uint8_t *) (_CPERAM_START + _PARSER_PATCH_TAB_OFFSET);
    uint32_t *pIrqPatch = (uint32_t *)(_CPERAM_START + _IRQPATCH_OFFSET);

    memset(pPatchTab, 0xFF, _IRQPATCH_OFFSET - _PARSER_PATCH_TAB_OFFSET);

    int i;
    for (i = 0; i < sizeof(rfc_defaultIrqAddr)/sizeof(rfc_defaultIrqAddr[0]); i++)
    {
        pIrqPatch[i * 2 + 1] = rfc_defaultIrqAddr[i];
    }

}


//*****************************************************************************
//
// Function to search an override list for the provided pattern within the search depth.
//
//*****************************************************************************
uint8_t
RFCOverrideSearch(const uint32_t *pOverride, const uint32_t pattern, const uint32_t mask, const uint8_t searchDepth)
{
    // Search from start of the override list, to look for first override entry that matches search pattern
    uint8_t override_index;
    for(override_index = 0; (override_index < searchDepth) && (pOverride[override_index] != END_OVERRIDE); override_index++)
    {
        // Compare the value to the given pattern
        if((pOverride[override_index] & mask) == pattern)
        {
            // Return with the index of override in case of match
            return override_index;
        }
    }

    // Return with an invalid index
    return 0xFF;
}

//*****************************************************************************
//
// Update the override list based on values stored in FCFG1
//
//*****************************************************************************
uint8_t
RFCOverrideUpdate(rfc_radioOp_t *pOpSetup, uint32_t *pParams)
{
    uint32_t* overrideLists[3]; //  [0] pRegOverrideCommon;
                                //  [1] pRegOverride1Mbps;
                                //  [2] pRegOverride2Mbps;
    uint32_t fcfg1_value;       //  Value pulled from FCFG1
    uint8_t override_index;     //  Index in Override list to edit
    uint8_t i;			//  Index used in loop

    // Based on the type of setup command, decode the override list
    switch (pOpSetup->commandNo)
    {
      case CMD_BLE5_RADIO_SETUP:
                                    overrideLists[0] = ((rfc_CMD_BLE5_RADIO_SETUP_t *)pOpSetup)->pRegOverrideCommon;
                                    overrideLists[1] = ((rfc_CMD_BLE5_RADIO_SETUP_t *)pOpSetup)->pRegOverride1Mbps;
                                    overrideLists[2] = ((rfc_CMD_BLE5_RADIO_SETUP_t *)pOpSetup)->pRegOverride2Mbps;
                                    break;
      case CMD_RADIO_SETUP:
      case CMD_PROP_RADIO_SETUP:
      case CMD_PROP_RADIO_DIV_SETUP:
      default:
                                    return 1;
    }

    // Read FCFG1 value
    fcfg1_value = (HWREG(FCFG1_BASE + FCFG1_O_CONFIG_RF_FRONTEND)
                   & FCFG1_CONFIG_RF_FRONTEND_LNA_IB_M) >> FCFG1_CONFIG_RF_FRONTEND_LNA_IB_S;

    // Search for a specific entry within three override lists
    for (i = 0; i < 3; i++)
    {
        // If list is missing simply skip it
        if (overrideLists[i] != NULL)
        {
            override_index = RFCOverrideSearch(overrideLists[i], RFC_BLE5_OVERRIDE_PATTERN, 0xFFFFFFFF, RFC_MAX_SEARCH_DEPTH);

            // Skip if the specific override is not present in the list
            if (override_index < RFC_MAX_SEARCH_DEPTH)
            {
                // Update override entry to FCFG1 limit value
                (overrideLists[i])[override_index] = ((overrideLists[i])[override_index] & RFC_BLE5_OVERRIDE_M) | (fcfg1_value << RFC_BLE5_OVERRIDE_S);
            }
        }
    }

    // Success
    return 0;
}


//*****************************************************************************
//
// Get and clear HW interrupt flags
//
//*****************************************************************************
uint32_t
RFCHwIntGetAndClear(uint32_t ui32Mask)
{
    // Read the CPE interrupt flags which match the provided bitmask
    uint32_t ui32Ifg = HWREG(RFC_DBELL_BASE + RFC_DBELL_O_RFHWIFG) & ui32Mask;

    // Clear the interupt flags
    RFCHwIntClear(ui32Ifg);

    // Return with the interrupt flags
    return (ui32Ifg);
}


//*****************************************************************************
//
// Read RF trim values from FCFG1
//
//*****************************************************************************
void
RFCRfTrimRead(rfc_radioOp_t *pOpSetup, rfTrim_t* pRfTrim)
{
    // Definition of position and bitmask of divider value
    const uint32_t CONFIG_MISC_ADC_DIVIDER    = 27;
    const uint32_t CONFIG_MISC_ADC_DIVIDER_BM = 0xF8000000U;

    // Read trim values from FCFG1
    pRfTrim->configIfAdc      =  HWREG(FCFG1_BASE + FCFG1_O_CONFIG_IF_ADC);
    pRfTrim->configRfFrontend =  HWREG(FCFG1_BASE + FCFG1_O_CONFIG_RF_FRONTEND);
    pRfTrim->configSynth      =  HWREG(FCFG1_BASE + FCFG1_O_CONFIG_SYNTH);
    // Make sure configMiscAdc is not 0 by setting an unused bit to 1
    pRfTrim->configMiscAdc    = (HWREG(FCFG1_BASE + FCFG1_O_CONFIG_MISC_ADC)
                              & ~CONFIG_MISC_ADC_DIVIDER_BM) | (2U << CONFIG_MISC_ADC_DIVIDER);
}


//*****************************************************************************
//
// Write preloaded RF trim values to the CM0
//
//*****************************************************************************
void
RFCRfTrimSet(rfTrim_t* pRfTrim)
{
    memcpy((void*)&HWREG(0x21000018), (void*)pRfTrim, sizeof(rfTrim_t));
}


//*****************************************************************************
//
// Check Override RTrim vs FCFG RTrim
//
//*****************************************************************************
uint8_t
RFCRTrim(rfc_radioOp_t *pOpSetup)
{
    // Function is left blank for compatibility reasons.
    return 0;
}


//*****************************************************************************
//
// Function to set VCOLDO reference to voltage mode
//
//*****************************************************************************
void
RFCAdi3VcoLdoVoltageMode(bool bEnable)
{
    // Function is left blank for compatibility reasons.
}

//*****************************************************************************
//
// Handle support for DriverLib in ROM:
// This section will undo prototype renaming made in the header file
//
//*****************************************************************************
#if !defined(DOXYGEN)
    #undef  RFCCpeIntGetAndClear
    #define RFCCpeIntGetAndClear            NOROM_RFCCpeIntGetAndClear
    #undef  RFCDoorbellSendTo
    #define RFCDoorbellSendTo               NOROM_RFCDoorbellSendTo
    #undef  RFCSynthPowerDown
    #define RFCSynthPowerDown               NOROM_RFCSynthPowerDown
    #undef  RFCCpePatchReset
    #define RFCCpePatchReset                NOROM_RFCCpePatchReset
    #undef  RFCOverrideSearch
    #define RFCOverrideSearch               NOROM_RFCOverrideSearch
    #undef  RFCOverrideUpdate
    #define RFCOverrideUpdate               NOROM_RFCOverrideUpdate
    #undef  RFCHwIntGetAndClear
    #define RFCHwIntGetAndClear             NOROM_RFCHwIntGetAndClear
    #undef  RFCRfTrimRead
    #define RFCRfTrimRead                   NOROM_RFCRfTrimRead
    #undef  RFCRfTrimSet
    #define RFCRfTrimSet                    NOROM_RFCRfTrimSet
    #undef  RFCRTrim
    #define RFCRTrim                        NOROM_RFCRTrim
    #undef  RFCAdi3VcoLdoVoltageMode
    #define RFCAdi3VcoLdoVoltageMode        NOROM_RFCAdi3VcoLdoVoltageMode
#endif

// See rfc.h for implementation

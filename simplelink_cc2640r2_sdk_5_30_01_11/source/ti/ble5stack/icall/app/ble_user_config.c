/******************************************************************************

 @file  ble_user_config.c

 @brief This file contains user configurable variables for the BLE
        Application.

 Group: WCS, BTS
 Target Device: cc2640r2

 ******************************************************************************
 
 Copyright (c) 2016-2024, Texas Instruments Incorporated
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

/*******************************************************************************
 * INCLUDES
 */

#include "hal_types.h"
#include "ble_user_config.h"

#ifndef USE_DMM
#include <ti/drivers/rf/RF.h>
#else
#include <dmm/dmm_rfmap.h>
#endif //USE_DMM

#if defined(BLE_V42_FEATURES) && (BLE_V42_FEATURES & SECURE_CONNS_CFG)
#include "ecc/ECCROMCC26XX.h"
#endif //BLE_V42_FEATURES & SECURE_CONNS_CFG

#include <ti/drivers/crypto/CryptoCC26XX.h>
#include <ti/sysbios/knl/Swi.h>

#include "TRNGCC26XX.h"

/*******************************************************************************
 * MACROS
 */

/*******************************************************************************
 * CONSTANTS
 */

// Tx Power
#define NUM_TX_POWER_VALUES (sizeof( TxPowerTable ) / sizeof( txPwrVal_t ))

// Default Tx Power Index
#define DEFAULT_TX_POWER               7

// Override NOP
#define OVERRIDE_NOP                   0xC0000001

/*******************************************************************************
 * TYPEDEFS
 */

/*******************************************************************************
 * LOCAL VARIABLES
 */

/*********************************************************************
 * LOCAL FUNCTIONS
 */

void driverTable_fnSpinlock( void );

/*******************************************************************************
 * GLOBAL VARIABLES
 */

// RF Override Registers
// Note: Used with CMD_RADIO_SETUP; called at boot time and after wake.
// Note: Must be in RAM as these overrides may need to be modified at runtime
//       based on temperature compensation, although it is possible this may
//       be automated in CM0 in PG2.0.
#if defined( USE_FPGA )
  regOverride_t rfRegTbl[] = {
#if defined( CC26XX_R2 )
    0x05F86084,
    0xFFFFFFFF };
#else // !R2
    // CC26x0
    0x00015164,
    0x00041110,
    0x00000083,
    0x016302A3,
    0x00800403,
    0x80000303,
    0xFFFFFFFF };
#endif // R2/CC26xx

#elif defined( CC26XX_R2 )

  regOverride_t rfRegTbl[] = {
    // override_ble5_setup_override_common.xml
    // Rx: Set LNA IB trim value based on the selected defaultPhy.mainMode setting. (NOTE: The value 0x8 is a placeholder. The value to use should be set during run-time by radio driver function.)
    ADI_HALFREG_OVERRIDE(0,4,0xF,0x8),
    // Rx: Set LNA IB offset used for automatic software compensation to 0
    0x00008883,
    // Synth: Use 24 MHz crystal, enable extra PLL filtering
    0x02010403,
    // Synth: Set fine top and bottom code to 127 and 0
    HW_REG_OVERRIDE(0x4020, 0x7F00),
    // Synth: Configure faster calibration
    HW32_ARRAY_OVERRIDE(0x4004, 1),
    // Synth: Configure faster calibration
    0x1C0C0618,
    // Synth: Configure faster calibration
    0xC00401A1,
    // Synth: Configure faster calibration
    0x21010101,
    // Synth: Configure faster calibration
    0xC0040141,
    // Synth: Configure faster calibration
    0x00214AD3,
    // Synth: Decrease synth programming time-out by 64 us (0x0300 RAT ticks = 192 us)
    0x03000243,
    // Bluetooth 5: Set correct total clock accuracy for received AuxPtr assuming local sleep clock of 50 ppm
    0x0E490823,
#ifdef DONT_TRANSMIT_NEW_RPA
    0x001C8B73,
#else
    0x001E8B73,
#endif
    0xC00402F1,   // Pointer to RPA configuration structure in next entry
    0x00000000,   // Pointer to RPA configuration structure
#ifdef CACHE_AS_RAM
    // Turn off pointer check to allow radio commands in flash cache RAM
    0x00018063,
#endif //CACHE_AS_RAM
    0xFFFFFFFF };

  regOverride_t rfRegTbl1M[] = {
    // override_ble5_setup_override_1mbps.xml
    // Rx: Set LNA IB trim to normal trim value. (NOTE: The value 0x8 is a placeholder. The value to use should be set during run-time by radio driver function.)
    ADI_HALFREG_OVERRIDE(0,4,0xF,0x8),
    // Rx: Configure AGC to use gain table for improved performance
    HW_REG_OVERRIDE(0x6084, 0x05F8),
    0xFFFFFFFF };

#if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
  regOverride_t rfRegTbl2M[] = {
    // override_ble5_setup_override_2mbps.xml
    // Rx: Set LNA IB trim to normal trim value. (NOTE: The value 0x8 is a placeholder. The value to use should be set during run-time by radio driver function.)
    ADI_HALFREG_OVERRIDE(0,4,0xF,0x8),
    0xFFFFFFFF };

  regOverride_t rfRegTblCoded[] = {
    // override_ble5_setup_override_coded.xml
    // Rx: Set LNA IB trim to 0xF (maximum)
    ADI_HALFREG_OVERRIDE(0,4,0xF,0xF),
    // Rx: Override AGC target gain to improve performance
    HW_REG_OVERRIDE(0x6088, 0x0018),
    0xFFFFFFFF };
#endif // PHY_2MBPS_CFG | PHY_LR_CFG

#elif defined( CC26XX )

  // CC26xx Normal Package with Flash Settings for 48 MHz device
  #if defined( CC2650EM_7ID )
  regOverride_t rfRegTbl[] = {
    // Recommended overrides for Bluetooth Low Energy, differential mode internal bias
    0x00001007,
    0x00354038,
    0x4001402D,
    0x00608402,
    0x4001405D,
    0x1801F800,
    0x000784A3,
    0xA47E0583,
    0xEAE00603,
    0x00010623,
    0x02010403,
    0x40014035,
    0x177F0408,
    0x38000463,
    0x00456088,
    0x013800C3,
    0x036052AC,
    0x01AD02A3,
    0x01680263,
#ifdef CACHE_AS_RAM
    0x00018063,
#endif //CACHE_AS_RAM
    0xFFFFFFFF };

  #elif defined( CC2650EM_5XD ) || defined( CC2650M5A )
  regOverride_t rfRegTbl[] = {
    // Recommended overrides for Bluetooth Low Energy, differential mode external bias
    0x00001007,
    0x00354038,
    0x4001402D,
    0x00608402,
    0x4001405D,
    0x1801F800,
    0x000784A3,
    0xA47E0583,
    0xEAE00603,
    0x00010623,
    0x02010403,
    0x40014035,
    0x177F0408,
    0x38000463,
    0x00456088,
    0x013800C3,
    0x036052AC,
    0x01AD02A3,
    0x01680263,
#ifdef CACHE_AS_RAM
    0x00018063,
#endif //CACHE_AS_RAM
    0xFFFFFFFF };

  #elif defined( CC2650EM_4XS )
  regOverride_t rfRegTbl[] = {
    // Recommended overrides for Bluetooth Low Energy, single-ended mode external bias
    0x00001007,
    0x00354038,
    0x4001402D,
    0x00608402,
    0x4001405D,
    0x1801F800,
    0x000784A3,
    0xA47E0583,
    0xEAE00603,
    0x00010623,
    0x02010403,
    0x40014035,
    0x177F0408,
    0x38000463,
    0x000288A3,
    0x00456088,
    0x013800C3,
    0x036052AC,
    0x01AD02A3,
    0x01680263,
#ifdef CACHE_AS_RAM
    0x00018063,
#endif //CACHE_AS_RAM
    0xFFFFFFFF };

  #elif defined( CC2650EM_4IS )
  regOverride_t rfRegTbl[] = {
    // Recommended overrides for Bluetooth Low Energy, single-ended mode internal bias
    0x00001007,
    0x00354038,
    0x4001402D,
    0x00608402,
    0x4001405D,
    0x1801F800,
    0x000784A3,
    0xA47E0583,
    0xEAE00603,
    0x00010623,
    0x02010403,
    0x40014035,
    0x177F0408,
    0x38000463,
    0x000288A3,
    0x00456088,
    0x013800C3,
    0x036052AC,
    0x01AD02A3,
    0x01680263,
#ifdef CACHE_AS_RAM
    0x00018063,
#endif //CACHE_AS_RAM
    0xFFFFFFFF };

  #else // unknown device package

  #error "***BLE USER CONFIG BUILD ERROR*** Unknown package type!"

  #endif // <board>

    regOverride_t rfRegTbl1M[] = {
      0x05F86084,                    // RFC_RFE:SPARE0. Select R1-style gain table
      0xFFFFFFFF };
#if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))

    regOverride_t rfRegTbl2M[] = {
      0xFFFFFFFF };

    regOverride_t rfRegTblCoded[] = {
      0xFFFFFFFF };
#endif // PHY_2MBPS_CFG | PHY_LR_CFG

#elif defined( CC13XX )

  #if defined( CC1350LP_7XD ) || defined( CC2650EM_7ID )
  regOverride_t rfRegTbl[] = {
    // Recommended overrides for Bluetooth Low Energy CC1350 Launchpad
    // (differential mode external bias) and for CC1350EM, which uses the
    // "CC2650EM_7ID" symbol define.
    0x00001007,
    0x849f0002,
    0xc7440002,
    0x00344038,
    0x00456088,
    0x05fd6084,
    0x7f004020,
    0x00404064,
    0x4001405d,
    0x18000000,
    0x013800c3,
    0x000784a3,
    0xb1070503,
    0x05330523,
    0xa47e0583,
    0xeae00603,
    0x00010623,
    0x00038883,
    0x00f388a3,
    0x04b00243,
#ifdef CACHE_AS_RAM
    0x00018063,
#endif //CACHE_AS_RAM
    0xffffffff };

  #elif defined( CC1350STK_7XS )

  // NB! Preliminary values copied from apps RF example,
  //     may change after characterization.

  regOverride_t rfRegTbl[] = {
    // override_use_patch_ble_1mbps.xml
    // PHY: Use MCE ROM, RFE RAM patch
    MCE_RFE_OVERRIDE(0,0,0,1,0,0),
    // override_synth_ble_1mbps.xml
    // Synth: Set recommended RTRIM to 4
    HW_REG_OVERRIDE(0x4038,0x0034),
    // Synth: Set Fref to 3.43 MHz
    0x000784A3,
    // Synth: Configure fine calibration setting
    HW_REG_OVERRIDE(0x4020,0x7F00),
    // Synth: Configure fine calibration setting
    HW_REG_OVERRIDE(0x4064,0x0040),
    // Synth: Configure fine calibration setting
    0xB1070503,
    // Synth: Configure fine calibration setting
    0x05330523,
    // Synth: Set loop bandwidth after lock to 80 kHz
    0xA47E0583,
    // Synth: Set loop bandwidth after lock to 80 kHz
    0xEAE00603,
    // Synth: Set loop bandwidth after lock to 80 kHz
    0x00010623,
    // Synth: Configure PLL bias
    HW32_ARRAY_OVERRIDE(0x405C,1),
    // Synth: Configure PLL bias
    0x18000000,
    // Synth: Configure VCO LDO (in ADI1, set VCOLDOCFG=0x9F to use voltage input reference)
    ADI_REG_OVERRIDE(1,4,0x9F),
    // Synth: Configure synth LDO (in ADI1, set SLDOCTL0.COMP_CAP=1)
    ADI_HALFREG_OVERRIDE(1,7,0x4,0x4),
    // override_phy_ble_1mbps.xml
    // Tx: Configure symbol shape for BLE frequency deviation requirements
    0x013800C3,
    // Rx: Configure AGC reference level
    HW_REG_OVERRIDE(0x6088, 0x0045),
    // Rx: Configure AGC gain level
    HW_REG_OVERRIDE(0x6084, 0x05FD),
    // Rx: Configure LNA bias current trim offset
    0x00038883,
    // override_frontend_xd.xml
    // Rx: Set RSSI offset to adjust reported RSSI by +13 dB
    0x00F388A3,
    ADI_HALFREG_OVERRIDE(0, 16, 0x7, 1),
    0xFFFFFFFF };

  #else // unknown board package

  #error "***BLE USER CONFIG BUILD ERROR*** Unknown board type!"

  #endif // <board>

#else // unknown platform

  #error "ERROR: Unknown platform!"

#endif // <board>

//
// Tx Power Table Used Depends on Device Package
//

#if defined( USE_FPGA )

  // Differential Output (same as CC2650EM_7ID for now)

  // Tx Power Values (Pout, IB, GC, TC)
  const txPwrVal_t TxPowerTable[] =
  { { TX_POWER_MINUS_21_DBM, GEN_TX_POWER_VAL( 0x07, 3, 0x0C ) },
    { TX_POWER_MINUS_18_DBM, GEN_TX_POWER_VAL( 0x09, 3, 0x0C ) },
    { TX_POWER_MINUS_15_DBM, GEN_TX_POWER_VAL( 0x0B, 3, 0x0C ) },
    { TX_POWER_MINUS_12_DBM, GEN_TX_POWER_VAL( 0x0B, 1, 0x14 ) },
    { TX_POWER_MINUS_9_DBM,  GEN_TX_POWER_VAL( 0x0E, 1, 0x19 ) },
    { TX_POWER_MINUS_6_DBM,  GEN_TX_POWER_VAL( 0x12, 1, 0x1D ) },
    { TX_POWER_MINUS_3_DBM,  GEN_TX_POWER_VAL( 0x18, 1, 0x25 ) },
    { TX_POWER_0_DBM,        GEN_TX_POWER_VAL( 0x21, 1, 0x31 ) },
    { TX_POWER_1_DBM,        GEN_TX_POWER_VAL( 0x14, 0, 0x42 ) },
    { TX_POWER_2_DBM,        GEN_TX_POWER_VAL( 0x18, 0, 0x4E ) },
    { TX_POWER_3_DBM,        GEN_TX_POWER_VAL( 0x1C, 0, 0x5A ) },
    { TX_POWER_4_DBM,        GEN_TX_POWER_VAL( 0x24, 0, 0x93 ) },
    { TX_POWER_5_DBM,        GEN_TX_POWER_VAL( 0x30, 0, 0x93 ) } };

#elif defined( CC26XX )

  #if defined( CC2650EM_7ID ) || defined( CC2650EM_5XD ) || defined( CC2650M5A )

  // Differential Output

  // Tx Power Values (Pout, IB, GC, TC)
  const txPwrVal_t TxPowerTable[] =
  { { TX_POWER_MINUS_21_DBM, GEN_TX_POWER_VAL( 0x07, 3, 0x0C ) },
    { TX_POWER_MINUS_18_DBM, GEN_TX_POWER_VAL( 0x09, 3, 0x0C ) },
    { TX_POWER_MINUS_15_DBM, GEN_TX_POWER_VAL( 0x0B, 3, 0x0C ) },
    { TX_POWER_MINUS_12_DBM, GEN_TX_POWER_VAL( 0x0B, 1, 0x14 ) },
    { TX_POWER_MINUS_9_DBM,  GEN_TX_POWER_VAL( 0x0E, 1, 0x19 ) },
    { TX_POWER_MINUS_6_DBM,  GEN_TX_POWER_VAL( 0x12, 1, 0x1D ) },
    { TX_POWER_MINUS_3_DBM,  GEN_TX_POWER_VAL( 0x18, 1, 0x25 ) },
    { TX_POWER_0_DBM,        GEN_TX_POWER_VAL( 0x21, 1, 0x31 ) },
    { TX_POWER_1_DBM,        GEN_TX_POWER_VAL( 0x14, 0, 0x42 ) },
    { TX_POWER_2_DBM,        GEN_TX_POWER_VAL( 0x18, 0, 0x4E ) },
    { TX_POWER_3_DBM,        GEN_TX_POWER_VAL( 0x1C, 0, 0x5A ) },
    { TX_POWER_4_DBM,        GEN_TX_POWER_VAL( 0x24, 0, 0x93 ) },
    { TX_POWER_5_DBM,        GEN_TX_POWER_VAL( 0x30, 0, 0x93 ) } };

  #elif defined( CC2650EM_4XS ) || defined( CC2650EM_4IS )

  // Single-Ended Output

  // Tx Power Values (Pout, IB, GC, TC)
  const txPwrVal_t TxPowerTable[] =
  { { TX_POWER_MINUS_21_DBM, GEN_TX_POWER_VAL( 0x07, 3, 0x0C ) },
    { TX_POWER_MINUS_18_DBM, GEN_TX_POWER_VAL( 0x09, 3, 0x10 ) },
    { TX_POWER_MINUS_15_DBM, GEN_TX_POWER_VAL( 0x0B, 3, 0x14 ) },
    { TX_POWER_MINUS_12_DBM, GEN_TX_POWER_VAL( 0x0E, 3, 0x14 ) },
    { TX_POWER_MINUS_9_DBM,  GEN_TX_POWER_VAL( 0x0F, 1, 0x21 ) },
    { TX_POWER_MINUS_6_DBM,  GEN_TX_POWER_VAL( 0x14, 1, 0x29 ) },
    { TX_POWER_MINUS_3_DBM,  GEN_TX_POWER_VAL( 0x1C, 1, 0x35 ) },
    { TX_POWER_0_DBM,        GEN_TX_POWER_VAL( 0x2C, 1, 0x56 ) },
    { TX_POWER_1_DBM,        GEN_TX_POWER_VAL( 0x1F, 0, 0x6A ) },
    { TX_POWER_2_DBM,        GEN_TX_POWER_VAL( 0x29, 0, 0x9C ) } };

  #elif defined( CC2640R2EM_CXS )

  // Single-Ended Output (WCSP)

  // Tx Power Values (Pout, IB, GC, TC)
  const txPwrVal_t TxPowerTable[] =
  { { TX_POWER_MINUS_21_DBM, GEN_TX_POWER_VAL( 0xC3, 3, 0x0C ) },
    { TX_POWER_MINUS_18_DBM, GEN_TX_POWER_VAL( 0xC5, 3, 0x10 ) },
    { TX_POWER_MINUS_15_DBM, GEN_TX_POWER_VAL( 0xC7, 3, 0x10 ) },
    { TX_POWER_MINUS_12_DBM, GEN_TX_POWER_VAL( 0xC9, 3, 0x10 ) },
    { TX_POWER_MINUS_9_DBM,  GEN_TX_POWER_VAL( 0xCC, 3, 0x19 ) },
    { TX_POWER_MINUS_6_DBM,  GEN_TX_POWER_VAL( 0x4E, 1, 0x25 ) },
    { TX_POWER_MINUS_3_DBM,  GEN_TX_POWER_VAL( 0x54, 1, 0x2D ) },
    { TX_POWER_0_DBM,        GEN_TX_POWER_VAL( 0x10, 0, 0x46 ) },
    { TX_POWER_1_DBM,        GEN_TX_POWER_VAL( 0x16, 0, 0x62 ) },
    { TX_POWER_2_DBM,        GEN_TX_POWER_VAL( 0x25, 0, 0xBC ) } };


  #else // unknown board package

  #error "***BLE USER CONFIG BUILD ERROR*** Unknown CC2650 board type!"

  #endif // <board>

#elif defined( CC13XX )

#if defined( CC1350LP_7XD ) || defined( CC2650EM_7ID ) || defined (CC13X2)
  // Tx Power Values (Pout, IB, GC, TC)
  const txPwrVal_t TxPowerTable[] =
  { { TX_POWER_MINUS_21_DBM, 0x0DC8 },
    { TX_POWER_MINUS_18_DBM, 0x0DCB },
    { TX_POWER_MINUS_15_DBM, 0x15CE },
    { TX_POWER_MINUS_12_DBM, 0x19D4 },
    { TX_POWER_MINUS_9_DBM,  0x1DDA },
    { TX_POWER_MINUS_6_DBM,  0x25E3 },
    { TX_POWER_MINUS_3_DBM,  0x2DEF },
    { TX_POWER_0_DBM,        0x5B29 },
    { TX_POWER_1_DBM,        0x6321 },
    { TX_POWER_2_DBM,        0x6F26 },
    { TX_POWER_3_DBM,        0x7F2C },
    { TX_POWER_4_DBM,        0x7734 },
    { TX_POWER_5_DBM,        0x5F3C } };

#elif defined ( CC1350STK_7XS)

  // Single-Ended Output. NB! Copied from CC1350LP_7XD, may change

  // Tx Power Values (Pout, IB, GC, TC)
  const txPwrVal_t TxPowerTable[] =
  { { TX_POWER_MINUS_21_DBM, 0x0DC8 },
    { TX_POWER_MINUS_18_DBM, 0x0DCB },
    { TX_POWER_MINUS_15_DBM, 0x15CE },
    { TX_POWER_MINUS_12_DBM, 0x19D4 },
    { TX_POWER_MINUS_9_DBM,  0x1DDA },
    { TX_POWER_MINUS_6_DBM,  0x25E3 },
    { TX_POWER_MINUS_3_DBM,  0x2DEF },
    { TX_POWER_0_DBM,        0x5B29 },
    { TX_POWER_1_DBM,        0x6321 },
    { TX_POWER_2_DBM,        0x6F26 },
    { TX_POWER_3_DBM,        0x7F2C },
    { TX_POWER_4_DBM,        0x7734 },
    { TX_POWER_5_DBM,        0x5F3C } };
  
  #else // unknown board package

  #error "***BLE USER CONFIG BUILD ERROR*** Unknown CC1350 board type!"

  #endif // <board>

#else // unknown platform

  #error "ERROR: Unknown platform!"

#endif // <board>

// Tx Power Table
txPwrTbl_t appTxPwrTbl = { TxPowerTable,
                           NUM_TX_POWER_VALUES,  // max
                           DEFAULT_TX_POWER };   // default


#ifdef ICALL_JT
#include <icall.h>

// RF Driver API Table
rfDrvTblPtr_t rfDriverTableBLE[] =
  { (uint32)RF_open,
    (uint32)driverTable_fnSpinlock, // RF_close
#ifdef RF_SINGLEMODE
    (uint32)RF_postCmd,
#else // !RF_SINGLEMODE
    (uint32)driverTable_fnSpinlock, // RF_postCmd
#endif // RF_SINGLEMODE
    (uint32)driverTable_fnSpinlock, // RF_pendCmd
#ifdef RF_SINGLEMODE
    (uint32)RF_runCmd,
#else // !RF_SINGLEMODE
    (uint32)driverTable_fnSpinlock, // RF_runCmd
#endif // RF_SINGLEMODE
    (uint32)RF_cancelCmd,
    (uint32)RF_flushCmd,
    (uint32)driverTable_fnSpinlock, // RF_yield
    (uint32)RF_Params_init,
    (uint32)RF_runImmediateCmd,
    (uint32)RF_runDirectCmd,
    (uint32)RF_ratCompare,
    (uint32)driverTable_fnSpinlock, // RF_ratCapture
    (uint32)driverTable_fnSpinlock, // RF_ratHwOutput
    (uint32)RF_ratDisableChannel,
    (uint32)RF_getCurrentTime,
    (uint32)RF_getRssi,
    (uint32)RF_getInfo,
    (uint32)RF_getCmdOp,
    (uint32)RF_control,
#ifndef RF_SINGLEMODE
    (uint32)RF_scheduleCmd,
    (uint32)RF_runScheduleCmd,
    (uint32)driverTable_fnSpinlock, // RF_requestAccess
#else // !RF_SINGLEMODE
    (uint32)driverTable_fnSpinlock, // RF_scheduleCmd
    (uint32)driverTable_fnSpinlock, // RF_runScheduleCmd
    (uint32)driverTable_fnSpinlock, // RF_requestAccess
#endif // !RF_SINGLEMODE
    (uint32)driverTable_fnSpinlock, // RF_getTxPower
    (uint32)driverTable_fnSpinlock, // RF_setTxPower
    (uint32)driverTable_fnSpinlock, // RF_TxPowerTable_findPowerLevel
    (uint32)driverTable_fnSpinlock, // RF_TxPowerTable_findValue
  };

cryptoDrvTblPtr_t cryptoDriverTableBLE[] =
  { (uint32)driverTable_fnSpinlock,          // CryptoCC26XX_close
    (uint32)CryptoCC26XX_init,
    (uint32)CryptoCC26XX_open,
    (uint32)CryptoCC26XX_Params_init,
    (uint32)driverTable_fnSpinlock,          // CryptoCC26XX_Transac_init
    (uint32)CryptoCC26XX_allocateKey,
    (uint32)driverTable_fnSpinlock,          // CryptoCC26XX_releaseKey
    (uint32)CryptoCC26XX_transact,
    (uint32)CryptoCC26XX_transactPolling,
    (uint32)driverTable_fnSpinlock,          // CryptoCC26XX_transactCallback
    (uint32)CryptoCC26XX_loadKey };

// Swi APIs needed by BLE controller
rtosApiTblPtr_t rtosApiTable[] =
{
  (uint32_t) Swi_disable,
  (uint32_t) Swi_restore,
};

// BLE Stack Configuration Structure
const stackSpecific_t bleStackConfig =
{
  .maxNumConns                          = MAX_NUM_BLE_CONNS,
  .maxNumPDUs                           = MAX_NUM_PDU,
  .maxPduSize                           = MAX_PDU_SIZE,
  .maxNumPSM                            = L2CAP_NUM_PSM,
  .maxNumCoChannels                     = L2CAP_NUM_CO_CHANNELS,
  .pfnBMAlloc                           = &pfnBMAlloc,
  .pfnBMFree                            = &pfnBMFree,
  .rfDriverParams.powerUpDurationMargin = RF_POWER_UP_DURATION_MARGIN,
  .rfDriverParams.inactivityTimeout     = RF_INACTIVITY_TIMEOUT,
  .rfDriverParams.powerUpDuration       = RF_POWER_UP_DURATION,
  .rfDriverParams.pErrCb                = &(RF_ERR_CB)
};

#ifdef OSAL_SNV_EXTFLASH
const extflashDrvTblPtr_t extflashDriverTable[] =
{
  (uint32) ExtFlash_open,
  (uint32) ExtFlash_close,
  (uint32) ExtFlash_read,
  (uint32) ExtFlash_write,
  (uint32) ExtFlash_erase
};
#endif // OSAL_SNV_EXTFLASH

// Table for Driver can be found in icall_user_config.c
// if a driver is not to be used, then the pointer shoul dbe set to NULL,
// for this example, this is done in ble_user_config.h
const drvTblPtr_t driverTable =
{
  .rfDrvTbl       = rfDriverTableBLE,
  .eccDrvTbl      = eccDriverTable,
  .cryptoDrvTbl   = cryptoDriverTableBLE,
  .trngDrvTbl     = trngDriverTable,
  .rtosApiTbl     = rtosApiTable,
#ifdef OSAL_SNV_EXTFLASH
  .extflashDrvTbl = extflashDriverTable,
#endif // OSAL_SNV_EXTFLASH
};

const boardConfig_t boardConfig =
{
  .rfFeModeBias = RF_FE_MODE_AND_BIAS,
  .rfRegTbl      = rfRegTbl,
  .rfRegTbl1M    = rfRegTbl1M,
#if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
  // Currently, no overrides for 2M and Coded, so exclude from build.
  .rfRegTbl2M    = rfRegTbl2M,
  .rfRegTblCoded = rfRegTblCoded,
#endif // PHY_2MBPS_CFG | PHY_LR_CFG
  .txPwrTbl      = &appTxPwrTbl
};

#else /* !(ICALL_JT) */

// RF Driver API Table
rfDrvTblPtr_t rfDriverTable[] =
{
  (uint32) RF_open,
  (uint32) driverTable_fnSpinlock, // RF_close
#ifdef RF_SINGLEMODE
  (uint32) RF_postCmd,
#else // !RF_SINGLEMODE
  (uint32) driverTable_fnSpinlock, // RF_postCmd
#endif// RF_SINGLEMODE
  (uint32) driverTable_fnSpinlock, // RF_pendCmd
#ifdef RF_SINGLEMODE
  (uint32) RF_runCmd,
#else // !RF_SINGLEMODE
  (uint32) driverTable_fnSpinlock, // RF_runCmd
#endif// RF_SINGLEMODE
  (uint32) RF_cancelCmd,
  (uint32) RF_flushCmd,
  (uint32) driverTable_fnSpinlock, // RF_yield
  (uint32) RF_Params_init,
  (uint32) RF_runImmediateCmd,
  (uint32) RF_runDirectCmd,
  (uint32) RF_ratCompare
  (uint32) driverTable_fnSpinlock, // RF_ratCapture
  (uint32)driverTable_fnSpinlock, // RF_ratHwOutput
  (uint32) driverTable_fnSpinlock, // RF_ratDisableChannel
  (uint32) RF_getCurrentTime,
  (uint32) RF_getRssi,
  (uint32) RF_getInfo,
  (uint32) RF_getCmdOp,
  (uint32) RF_control,
#ifndef RF_SINGLEMODE
  (uint32)RF_scheduleCmd,
  (uint32)RF_runScheduleCmd,
  (uint32)driverTable_fnSpinlock, // RF_requestAccess
#else // !RF_SINGLEMODE
  (uint32)driverTable_fnSpinlock, // RF_scheduleCmd
  (uint32)driverTable_fnSpinlock, // RF_runScheduleCmd
  (uint32)driverTable_fnSpinlock, // RF_requestAccess
#endif // !RF_SINGLEMODE
  (uint32)driverTable_fnSpinlock, // RF_getTxPower
  (uint32)driverTable_fnSpinlock, // RF_setTxPower
  (uint32)driverTable_fnSpinlock, // RF_TxPowerTable_findPowerLevel
  (uint32)driverTable_fnSpinlock, // RF_TxPowerTable_findValue
};


#if defined(BLE_V42_FEATURES) && (BLE_V42_FEATURES & SECURE_CONNS_CFG)
// ECC Driver API Table
eccDrvTblPtr_t eccDriverTable[] =
{
  (uint32) ECCROMCC26XX_init,
  (uint32) ECCROMCC26XX_Params_init,
  (uint32) ECCROMCC26XX_genKeys,
  (uint32) ECCROMCC26XX_genDHKey
};
#endif //BLE_V42_FEATURES & SECURE_CONNS_CFG

// Crypto Driver API Table
cryptoDrvTblPtr_t cryptoDriverTable[] =
{
  (uint32) driverTable_fnSpinlock,          // CryptoCC26XX_close
  (uint32) CryptoCC26XX_init,
  (uint32) CryptoCC26XX_open,
  (uint32) CryptoCC26XX_Params_init,
  (uint32) driverTable_fnSpinlock,          // CryptoCC26XX_Transac_init
  (uint32) CryptoCC26XX_allocateKey,
  (uint32) driverTable_fnSpinlock,          // CryptoCC26XX_releaseKey
  (uint32) CryptoCC26XX_transact,
  (uint32) CryptoCC26XX_transactPolling,
  (uint32) driverTable_fnSpinlock,          // CryptoCC26XX_transactCallback
  (uint32) CryptoCC26XX_loadKey
};

trngDrvTblPtr_t trngDriverTable[] =
{
  (uint32) TRNGCC26XX_init,
  (uint32) TRNGCC26XX_open,
  (uint32) TRNGCC26XX_getNumber
};


#endif /* ICALL_JT */

/*******************************************************************************
 * @fn          RegisterAssertCback
 *
 * @brief       This routine registers the Application's assert handler.
 *
 * input parameters
 *
 * @param       appAssertHandler - Application's assert handler.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
void RegisterAssertCback( assertCback_t appAssertHandler )
{
  appAssertCback = appAssertHandler;

#ifdef EXT_HAL_ASSERT
  // also set the Assert callback pointer used by halAssertHandlerExt
  // Note: Normally, this pointer will be intialized by the stack, but in the
  //       event HAL_ASSERT is used by the Application, we initialize it
  //       directly here.
  halAssertCback = appAssertHandler;
#endif // EXT_HAL_ASSERT

  return;
}

/*******************************************************************************
 * @fn          driverTable_fnSpinLock
 *
 * @brief       This routine is used to trap calls to unpopulated indexes of
 *              driver function pointer tables.
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
void driverTable_fnSpinlock( void )
{
  volatile uint8 i = 1;

  while(i);
}

/*******************************************************************************
 * @fn          DefaultAssertCback
 *
 * @brief       This is the Application default assert callback, in the event
 *              none is registered.
 *
 * input parameters
 *
 * @param       assertCause    - Assert cause as defined in hal_assert.h.
 * @param       assertSubcause - Optional assert subcause (see hal_assert.h).
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
void DefaultAssertCback( uint8 assertCause, uint8 assertSubcause )
{
#ifdef HAL_ASSERT_SPIN
  driverTable_fnSpinlock();
#endif // HAL_ASSERT_SPIN

  return;
}

// Application Assert Callback Function Pointer
assertCback_t appAssertCback = DefaultAssertCback;

/*******************************************************************************
 */

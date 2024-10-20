/******************************************************************************

 Group: WCS, BTS
 Target Device: cc2640r2

 ******************************************************************************
 
 Copyright (c) 2009-2024, Texas Instruments Incorporated
 All rights reserved.

 IMPORTANT: Your use of this Software is limited to those specific rights
 granted under the terms of a software license agreement between the user
 who downloaded the software, his/her employer (which must be your employer)
 and Texas Instruments Incorporated (the "License"). You may not use this
 Software unless you agree to abide by the terms of the License. The License
 limits your use, and you acknowledge, that the Software may not be modified,
 copied or distributed unless embedded on a Texas Instruments microcontroller
 or used solely and exclusively in conjunction with a Texas Instruments radio
 frequency transceiver, which is integrated into your product. Other than for
 the foregoing purpose, you may not use, reproduce, copy, prepare derivative
 works of, modify, distribute, perform, display or sell this Software and/or
 its documentation for any purpose.

 YOU FURTHER ACKNOWLEDGE AND AGREE THAT THE SOFTWARE AND DOCUMENTATION ARE
 PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
 INCLUDING WITHOUT LIMITATION, ANY WARRANTY OF MERCHANTABILITY, TITLE,
 NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL
 TEXAS INSTRUMENTS OR ITS LICENSORS BE LIABLE OR OBLIGATED UNDER CONTRACT,
 NEGLIGENCE, STRICT LIABILITY, CONTRIBUTION, BREACH OF WARRANTY, OR OTHER
 LEGAL EQUITABLE THEORY ANY DIRECT OR INDIRECT DAMAGES OR EXPENSES
 INCLUDING BUT NOT LIMITED TO ANY INCIDENTAL, SPECIAL, INDIRECT, PUNITIVE
 OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOST DATA, COST OF PROCUREMENT
 OF SUBSTITUTE GOODS, TECHNOLOGY, SERVICES, OR ANY CLAIMS BY THIRD PARTIES
 (INCLUDING BUT NOT LIMITED TO ANY DEFENSE THEREOF), OR OTHER SIMILAR COSTS.

 Should you have any questions regarding your right to use this Software,
 contact Texas Instruments Incorporated at www.TI.com.

 ******************************************************************************
 
 
 *****************************************************************************/

/**
 *  @file  bcomdef.h
 *  @brief      Type definitions and macros for BLE stack.
 */

#ifndef BCOMDEF_H
#define BCOMDEF_H

#ifdef __cplusplus
extern "C"
{
#endif


/*********************************************************************
 * INCLUDES
 */

#include "comdef.h"

/*********************************************************************
 * CONSTANTS
 */

/// @cond NODOC
#if defined ( HOST_CONFIG )
  // Set the Controller Configuration
  #if ( HOST_CONFIG == ( CENTRAL_CFG | PERIPHERAL_CFG ) )
    #define CTRL_CONFIG   ( ADV_NCONN_CFG | ADV_CONN_CFG | SCAN_CFG | INIT_CFG )
  #elif ( HOST_CONFIG == ( CENTRAL_CFG | BROADCASTER_CFG ) )
    #define CTRL_CONFIG   ( ADV_NCONN_CFG | SCAN_CFG | INIT_CFG )
  #elif ( HOST_CONFIG == ( PERIPHERAL_CFG | OBSERVER_CFG ) )
    #define CTRL_CONFIG   ( ADV_NCONN_CFG | ADV_CONN_CFG | SCAN_CFG )
  #elif ( HOST_CONFIG == ( BROADCASTER_CFG | OBSERVER_CFG ) )
    #define CTRL_CONFIG   ( ADV_NCONN_CFG | SCAN_CFG )
  #elif ( HOST_CONFIG == CENTRAL_CFG )
    #define CTRL_CONFIG   ( SCAN_CFG | INIT_CFG )
  #elif ( HOST_CONFIG == PERIPHERAL_CFG )
    #define CTRL_CONFIG   ( ADV_NCONN_CFG | ADV_CONN_CFG )
  #elif ( HOST_CONFIG == OBSERVER_CFG )
    #define CTRL_CONFIG   SCAN_CFG
  #elif ( HOST_CONFIG == BROADCASTER_CFG )
    #define CTRL_CONFIG   ADV_NCONN_CFG
  #else
    #if defined ( FLASH_ONLY_BUILD ) || defined ( FLASH_ROM_BUILD )
      #error "Build Configuration Error: Invalid Host Role!"
    #endif
  #endif
#else
  // Controller Sanity Check: Stop build when no configuration is defined.
  #if !defined( CTRL_CONFIG ) || !( CTRL_CONFIG & ( ADV_NCONN_CFG | \
                                                    ADV_CONN_CFG  | \
                                                    SCAN_CFG      | \
                                                    INIT_CFG ) )
    #if defined ( FLASH_ONLY_BUILD ) || defined ( FLASH_ROM_BUILD )
      #error "Build Configuration Error: At least one Controller build component required!"
    #endif
  #endif // no Controller build components defined
#endif

// If BLE_V41_FEATURES is defined, map it to CTRL_V41_CONFIG
#if defined ( BLE_V41_FEATURES ) && !defined ( CTRL_V41_CONFIG )
  #define CTRL_V41_CONFIG       ( ( BLE_V41_FEATURES ) & CTRL_V41_MASK )
#elif defined ( BLE_V41_FEATURES ) && defined ( CTRL_V41_CONFIG )
  #error "Build Configuration Error: Cannot define both BLE_V41_FEATURES and CTRL_V41_CONFIG!"
#endif // BLE_V41_FEATURES

// If BLE_V42_FEATURES is defined, map it to CTRL_V42_CONFIG
#if defined ( BLE_V42_FEATURES ) && !defined ( CTRL_V42_CONFIG )
  #define CTRL_V42_CONFIG       BLE_V42_FEATURES
#elif defined ( BLE_V42_FEATURES ) && defined ( CTRL_V42_CONFIG )
  #error "Build Configuration Error: Cannot define both BLE_V42_FEATURES and CTRL_V42_CONFIG!"
#endif // BLE_V41_FEATURES

// If BLE_V50_FEATURES is defined, map it to CTRL_V50_CONFIG
#if defined ( BLE_V50_FEATURES ) && !defined ( CTRL_V50_CONFIG )
  #define CTRL_V50_CONFIG       BLE_V50_FEATURES
#elif defined ( BLE_V50_FEATURES ) && defined ( CTRL_V50_CONFIG )
  #error "Build Configuration Error: Cannot define both BLE_V50_FEATURES and CTRL_V50_CONFIG!"
#endif // BLE_V41_FEATURES

// If L2CAP Connection Oriented Channels are not configured and GATT_QUAL is not defined
// then do not configure GATT Service Changed characteristic
#if (!defined ( BLE_V41_FEATURES ) || !( BLE_V41_FEATURES & L2CAP_COC_CFG )) && !defined(GATT_QUAL)
  #define GATT_NO_SERVICE_CHANGED  //!<GATT No Service Changed
#endif // ! BLE_41_FEATURES || ! L2CAP_COC_CFG

#if defined(CC2540) || defined(CC2541) || defined(CC2541S)
  #if !defined ( MAX_NUM_BLE_CONNS )
    #if ( CTRL_CONFIG & INIT_CFG )
      #define MAX_NUM_BLE_CONNS                       3
    #elif ( !( CTRL_CONFIG & INIT_CFG ) && ( CTRL_CONFIG & ADV_CONN_CFG ) )
      #define MAX_NUM_BLE_CONNS                       1
    #else // no connection needed
      #define MAX_NUM_BLE_CONNS                       0
    #endif // CTRL_CONFIG=INIT_CFG
  #endif // !MAX_NUM_BLE_CONNS
#endif // CC2540 | CC2541 | CC2541S

/// @endcond // NODOC

//! Default Public and Random Address Length
#define B_ADDR_LEN                                6

//! Default key length
#define KEYLEN                                    16

//! Defines for decomposed Address
//! 2 BYTES LSB
#define LSB_2_BYTES                               2

//! 4 BYTES MSB
#define MSB_4_BYTES                               4

//! BLE Channel Map length
#define B_CHANNEL_MAP_LEN                         5

//! BLE Event mask length
#define B_EVENT_MASK_LEN                          8

//! BLE Local Name length
#define B_LOCAL_NAME_LEN                          248

//! BLE Maximum Advertising Packet Length
#define B_MAX_ADV_LEN                             31

//! BLE Random Number Size
#define B_RANDOM_NUM_SIZE                         8

//! BLE Feature Supported length
#define B_FEATURE_SUPPORT_LENGTH                  8

//! BLE Privacy Resolving List Size For Peer Keys
#define B_RESOLVING_LIST_SIZE                     3

//! BLE Default Passcode
#define B_APP_DEFAULT_PASSCODE                    123456

#define bleInvalidTaskID                INVALID_TASK  //!< Task ID isn't setup properly
#define bleNotReady                     0x10  //!< Not ready to perform task
#define bleAlreadyInRequestedMode       0x11  //!< Already performing that task
#define bleIncorrectMode                0x12  //!< Not setup properly to perform that task
#define bleMemAllocError                0x13  //!< Memory allocation error occurred
#define bleNotConnected                 0x14  //!< Can't perform function when not in a connection
#define bleNoResources                  0x15  //!< There are no resource available
#define blePending                      0x16  //!< Waiting
#define bleTimeout                      0x17  //!< Timed out performing function
#define bleInvalidRange                 0x18  //!< A parameter is out of range
#define bleLinkEncrypted                0x19  //!< The link is already encrypted
#define bleProcedureComplete            0x1A  //!< The Procedure is completed
#define bleInvalidMtuSize               0x1B  //!< MTU size is out of range
#define blePairingTimedOut              0x1C  //!< Previous pairing attempt timed out
#define bleMemFreeError                 0x1D  //!< Memory free error occurred
#define bleInternalError                0x1E  //!< Internal error not due to application

// GAP Status Return Values - returned as bStatus_t
#define bleGAPUserCanceled              0x30  //!< The user canceled the task
#define bleGAPConnNotAcceptable         0x31  //!< The connection was not accepted
#define bleGAPBondRejected              0x32  //!< The bound information was rejected.
#define bleGAPBufferInUse               0x33  //!< The buffer is in use elsewhere
#define bleGAPNotFound                  0x34  //!< No handle / buffer found
#define bleGAPFilteredOut               0x35  //!< The received PDU was filtered out.

// ATT Status Return Values - returned as bStatus_t
#define bleInvalidPDU                   0x40  //!< The attribute PDU is invalid
#define bleInsufficientAuthen           0x41  //!< The attribute has insufficient authentication
#define bleInsufficientEncrypt          0x42  //!< The attribute has insufficient encryption
#define bleInsufficientKeySize          0x43  //!< The attribute has insufficient encryption key size

// L2CAP Status Return Values - returned as bStatus_t

#define INVALID_TASK_ID                 0xFF  //!< Task ID isn't setup properly

// Device NV Items -    Range 0 - 0x1F
#define BLE_NVID_IRK                    0x02  //!< The Device's IRK
#define BLE_NVID_CSRK                   0x03  //!< The Device's CSRK
#define BLE_NVID_ADDR_MODE              0x04  //!< The Device's address type (@ref GAP_Addr_Modes_t)
#define BLE_LRU_BOND_LIST               0x05  //!< The Device's order of bond indexes in least recently used order
#define BLE_NVID_RANDOM_ADDR            0x06  //!< The Device's random address if set by the current @ref GAP_DeviceInit

// Bonding NV Items -   Range  0x20 - 0x5F    - This allows for 10 bondings
#define BLE_NVID_GAP_BOND_START         0x20  //!< Start of the GAP Bond Manager's NV IDs
#define BLE_NVID_GAP_BOND_END           0x5f  //!< End of the GAP Bond Manager's NV IDs Range

// GATT Configuration NV Items - Range  0x70 - 0x79 - This must match the number of Bonding entries
#define BLE_NVID_GATT_CFG_START         0x70  //!< Start of the GATT Configuration NV IDs
#define BLE_NVID_GATT_CFG_END           0x79  //!< End of the GATT Configuration NV IDs

// Customer NV Items - Range  0x80 - 0x8F - This must match the number of Bonding entries
#define BLE_NVID_CUST_START             0x80  //!< Start of the Customer's NV IDs
#define BLE_NVID_CUST_END               0x8F  //!< End of the Customer's NV IDs

/*********************************************************************
 * BLE OSAL GAP GLOBAL Events
 */
#define GAP_EVENT_SIGN_COUNTER_CHANGED  0x4000  //!< The device level sign counter changed

// GAP - Messages IDs (0xD0 - 0xDF)
#define GAP_MSG_EVENT                         0xD0 //!< Incoming GAP message

// SM - Messages IDs (0xC1 - 0xCF)
#define SM_NEW_RAND_KEY_EVENT                 0xC1 //!< New Rand Key Event message
#define SM_MSG_EVENT                          0xC2 //!< Incoming SM message

// GATT - Messages IDs (0xB0 - 0xBF)
#define GATT_MSG_EVENT                        0xB0 //!< Incoming GATT message
#define GATT_SERV_MSG_EVENT                   0xB1 //!< Incoming GATT Serv App message

// L2CAP - Messages IDs (0xA0 - 0xAF)
#define L2CAP_DATA_EVENT                      0xA0 //!< Incoming data on a channel
#define L2CAP_SIGNAL_EVENT                    0xA2 //!< Incoming Signaling message

// HCI - Messages IDs (0x90 - 0x9F)
#define HCI_DATA_EVENT                        0x90 //!< HCI Data Event message
#define HCI_GAP_EVENT_EVENT                   0x91 //!< GAP Event message
#define HCI_SMP_EVENT_EVENT                   0x92 //!< SMP Event message
#define HCI_EXT_CMD_EVENT                     0x93 //!< HCI Extended Command Event message
#define HCI_SMP_META_EVENT_EVENT              0x94 //!< SMP Meta Event message
#define HCI_GAP_META_EVENT_EVENT              0x95 //!< GAP Meta Event message

// ICall and Dispatch - Messages IDs (0x80 - 0x8F)
#define ICALL_EVENT_EVENT                     0x80 //!< ICall Event message
#define ICALL_CMD_EVENT                       0x81 //!< ICall Command Event message
#define DISPATCH_CMD_EVENT                    0x82 //!< Dispatch Command Event message

#ifdef __TI_COMPILER_VERSION__
#define PRAGMA_OPTIMIZE_NONE
#elif defined(__IAR_SYSTEMS_ICC__)
#define PRAGMA_OPTIMIZE_NONE _Pragma("optimize=none")
#endif

/*********************************************************************
 * TYPEDEFS
 */

  //! BLE Generic Status return
typedef Status_t bStatus_t;


/*********************************************************************
 * System Events
 */

/*********************************************************************
 * Global System Messages
 */

/*********************************************************************
 * MACROS
 */

/// @brief TI Base 128-bit UUID: F000XXXX-0451-4000-B000-000000000000
#define TI_BASE_UUID_128( uuid )  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB0, \
                                  0x00, 0x40, 0x51, 0x04, LO_UINT16( uuid ), HI_UINT16( uuid ), 0x00, 0xF0

/*********************************************************************
 * GLOBAL VARIABLES
 */

/*********************************************************************
 * FUNCTIONS
 */

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* BCOMDEF_H */

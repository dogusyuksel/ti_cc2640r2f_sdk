/******************************************************************************

 @file  hci_event.h

 @brief This file contains the HCI Event types, constants, external functions
        etc. for the BLE Controller.

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

#ifndef HCI_C_EVENT_H
#define HCI_C_EVENT_H

#ifdef __cplusplus
extern "C"
{
#endif

/*******************************************************************************
 * INCLUDES
 */
#include "hci_tl.h"

extern uint8 pBleEvtMask[];
extern uint8 pHciEvtMask[];
extern uint8 pHciEvtMask2[];

/*******************************************************************************
 * MACROS
 */

/*******************************************************************************
 * CONSTANTS
 */

/*
** Bluetooth Event Mask
** Core Specification, Vol. 2, Part E, Section 7.3.1
*/

// Byte 0
#define BT_EVT_MASK_INQUIRY_COMPLETE                                   0x01
#define BT_EVT_MASK_INQUIRY_RESULT                                     0x02
#define BT_EVT_MASK_CONNECTION_COMPLETE                                0x04
#define BT_EVT_MASK_CONNECTION_REQUEST                                 0x08
#define BT_EVT_MASK_DISCONNECTION_COMPLETE                             0x10
#define BT_EVT_MASK_AUTHENTICATION_COMPLETE                            0x20
#define BT_EVT_MASK_REMOTE_NAME_REQUEST_COMPLETE                       0x40
#define BT_EVT_MASK_ENCRYPTION_CHANGE                                  0x80
// Byte 1
#define BT_EVT_MASK_CHANGE_CONNECTION_LINK_KEY_COMPLETE                0x01
#define BT_EVT_MASK_MASTER_LINK_KEY_COMPLETE                           0x02
#define BT_EVT_MASK_READ_REMOTE_SUPPORTED_FEATURES_COMPLETE            0x04
#define BT_EVT_MASK_READ_REMOTE_VERSION_INFORMATION_COMPLETE           0x08
#define BT_EVT_MASK_QOS_SETUP_COMPLETE                                 0x10
#define BT_EVT_MASK_RESERVED01                                         0x20
#define BT_EVT_MASK_RESERVED02                                         0x40
#define BT_EVT_MASK_HARDWARE_ERROR                                     0x80
// Byte 2
#define BT_EVT_MASK_FLUSH_OCCURRED                                     0x01
#define BT_EVT_MASK_ROLE_CHANGE                                        0x02
#define BT_EVT_MASK_RESERVED03                                         0x04
#define BT_EVT_MASK_MODE_CHANGE                                        0x08
#define BT_EVT_MASK_RETURN_LINK_KEYS                                   0x10
#define BT_EVT_MASK_PIN_CODE_REQUEST                                   0x20
#define BT_EVT_MASK_LINK_KEY_REQUEST                                   0x40
#define BT_EVT_MASK_LINK_KEY_NOTIFICATION                              0x80
// Byte 3
#define BT_EVT_MASK_LOOPBACK_COMMAND                                   0x01
#define BT_EVT_MASK_DATA_BUFFER_OVERFLOW                               0x02
#define BT_EVT_MASK_MAX_SLOTS_CHANGE                                   0x04
#define BT_EVT_MASK_READ_CLOCK_OFFSET_COMPLETE                         0x08
#define BT_EVT_MASK_CONNECTION_PACKET_TYPE_CHANGED                     0x10
#define BT_EVT_MASK_QOS_VIOLATION                                      0x20
#define BT_EVT_MASK_PAGE_SCAN_MODE_CHANGE                              0x40 // deprecated
#define BT_EVT_MASK_PAGE_SCAN_REPETITION_MODE_CHANGE                   0x80
// Byte 4
#define BT_EVT_MASK_FLOW_SPECIFICATION_COMPLETE                        0x01
#define BT_EVT_MASK_INQUIRY_RESULT_WITH_RSSI                           0x02
#define BT_EVT_MASK_READ_REMOTE_EXTENDED_FEATURES_COMPLETE             0x04
#define BT_EVT_MASK_RESERVED04                                         0x08
#define BT_EVT_MASK_RESERVED05                                         0x10
#define BT_EVT_MASK_RESERVED06                                         0x20
#define BT_EVT_MASK_RESERVED07                                         0x40
#define BT_EVT_MASK_RESERVED08                                         0x80
// Byte 5
#define BT_EVT_MASK_RESERVED09                                         0x01
#define BT_EVT_MASK_RESERVED10                                         0x02
#define BT_EVT_MASK_RESERVED11                                         0x04
#define BT_EVT_MASK_SYNCHRONOUS_CONNECTION_COMPLETE                    0x08
#define BT_EVT_MASK_SYNCHRONOUS_CONNECTION_CHANGED                     0x10
#define BT_EVT_MASK_SNIFF_SUBRATING                                    0x20
#define BT_EVT_MASK_EXTENDED_INQUIRY_RESULT                            0x40
#define BT_EVT_MASK_ENCRYPTION_KEY_REFRESH_COMPLETE                    0x80
// Byte 6
#define BT_EVT_MASK_IO_CAPABILITY_REQUEST                              0x01
#define BT_EVT_MASK_IO_CAPABILITY_REQUEST_REPLY                        0x02
#define BT_EVT_MASK_USER_CONFIRMATION_REQUEST                          0x04
#define BT_EVT_MASK_USER_PASSKEY_REQUEST                               0x08
#define BT_EVT_MASK_REMOTE_OOB_DATA_REQUEST                            0x10
#define BT_EVT_MASK_SIMPLE_PAIRING_COMPLETE                            0x20
#define BT_EVT_MASK_RESERVED12                                         0x40
#define BT_EVT_MASK_LINK_SUPERVISION_TIMEOUT_CHANGED                   0x80
// Byte 7
#define BT_EVT_MASK_ENHANCED_FLUSH_COMPLETE                            0x01
#define BT_EVT_MASK_RESERVED13                                         0x02
#define BT_EVT_MASK_USER_PASSKEY_NOTIFICATION                          0x04
#define BT_EVT_MASK_KEYPRESS_NOTIFICATION                              0x08
#define BT_EVT_MASK_REMOTE_HOST_SUPPORTED_FEATURES_NOTIFICATION        0x10
#define BT_EVT_MASK_LE_META_EVENT                                      0x20
#define BT_EVT_MASK_RESERVED14                                         0x40
#define BT_EVT_MASK_RESERVED15                                         0x80

// No Bluetooth Event Mask in Byte
#define BT_EVT_MASK_NONE                                               0x00

// Bluetooth Event Mask Index
#define BT_EVT_INDEX_DISCONNECT_COMPLETE                               0
#define BT_EVT_INDEX_ENCRYPTION_CHANGE                                 0
#define BT_EVT_INDEX_READ_REMOTE_VERSION_INFO                          1
#define BT_EVT_INDEX_HARDWARE_ERROR                                    1
#define BT_EVT_INDEX_FLUSH_OCCURRED                                    2
#define BT_EVT_INDEX_BUFFER_OVERFLOW                                   3
#define BT_EVT_INDEX_KEY_REFRESH_COMPLETE                              5
#define BT_EVT_INDEX_LE_META_EVENT                                     7

// Event Mask Default Values
#define BT_EVT_MASK_BYTE0   (BT_EVT_MASK_ENCRYPTION_CHANGE | BT_EVT_MASK_DISCONNECTION_COMPLETE)
#define BT_EVT_MASK_BYTE1   (BT_EVT_MASK_HARDWARE_ERROR | BT_EVT_MASK_READ_REMOTE_VERSION_INFORMATION_COMPLETE)
#define BT_EVT_MASK_BYTE2   (BT_EVT_MASK_FLUSH_OCCURRED)
#define BT_EVT_MASK_BYTE3   (BT_EVT_MASK_DATA_BUFFER_OVERFLOW)
#define BT_EVT_MASK_BYTE4   (BT_EVT_MASK_NONE)
#define BT_EVT_MASK_BYTE5   (BT_EVT_MASK_ENCRYPTION_KEY_REFRESH_COMPLETE)
#define BT_EVT_MASK_BYTE6   (BT_EVT_MASK_NONE)
#define BT_EVT_MASK_BYTE7   (BT_EVT_MASK_LE_META_EVENT)

/*
** Bluetooth Event Mask 2
** Core Specification, Vol. 2, Part E, Section 7.3.69
*/

// Byte 0
#define BT_EVT_MASK2_PHYSICAL_LINK_COMPLETE                            0x01
#define BT_EVT_MASK2_CHANNEL_SELECTED                                  0x02
#define BT_EVT_MASK2_DISCONNECTION_PHYSICAL_LINK                       0x04
#define BT_EVT_MASK2_PHYSICAL_LINK_LOW_EARLY_WARNING                   0x08
#define BT_EVT_MASK2_PHYSICAL_LINK_RECOVERY                            0x10
#define BT_EVT_MASK2_LOGICAL_LINK_COMPLETE                             0x20
#define BT_EVT_MASK2_DISCONNECTION_LOGICAL_LINK_COMPLETE               0x40
#define BT_EVT_MASK2_FLOW_SPEC_MODIFY_COMPLETE                         0x80
// Byte 1
#define BT_EVT_MASK2_NUMBER_OF_COMPLETE_DATA_BLOCKS                    0x01
#define BT_EVT_MASK2_AMP_START_TEST                                    0x02
#define BT_EVT_MASK2_AMP_TEST_END                                      0x04
#define BT_EVT_MASK2_AMP_RECIEVER_REPORT                               0x08
#define BT_EVT_MASK2_SHORT_RANGE_MODE_CHANGE_COMPLETE                  0x10
#define BT_EVT_MASK2_AMP_STATUS_CHANGE                                 0x20
#define BT_EVT_MASK2_TRIGGERED_CLOCK_CAPTURE                           0x40
#define BT_EVT_MASK2_SYNCHRONIZATION_TRAIN_COMPLETE                    0x80
// Byte 2
#define BT_EVT_MASK2_SYNCHRONIZATION_TRAIN_RECEIVED                    0x01
#define BT_EVT_MASK2_CONNECTIONLESS_SLAVE_BROADCAST_RECEIVE            0x02
#define BT_EVT_MASK2_CONNECTIONLESS_SLAVE_BROADCAST_TIMEOUT            0x04
#define BT_EVT_MASK2_TRUNCATED_PAGE_COMPLETE                           0x08
#define BT_EVT_MASK2_SLAVE_PAGE_RESPONSE_TIMEOUT                       0x10
#define BT_EVT_MASK2_CONNECTIONLESS_SLAVE_BROADCAST_CHANNEL_MAP_CHANGE 0x20
#define BT_EVT_MASK2_INQUIRY_RESPONSE_NOTIFICATION                     0x40
#define BT_EVT_MASK2_AUTHENTICATED_PAYLOAD_TIMEOUT_EXPIRED             0x80
// Byte 3 - Byte 7
#define BT_EVT_MASK2_SAM_STATUS_CHANGE_EVENT                           0x01
#define BT_EVT_MASK2_RESERVED01                                        0x02
#define BT_EVT_MASK2_RESERVED02                                        0x04
#define BT_EVT_MASK2_RESERVED03                                        0x08
#define BT_EVT_MASK2_RESERVED04                                        0x10
#define BT_EVT_MASK2_RESERVED05                                        0x20
#define BT_EVT_MASK2_RESERVED06                                        0x40
#define BT_EVT_MASK2_RESERVED07                                        0x80

// No Bluetooth Event Mask 2 in Byte
#define BT_EVT_MASK2_NONE                                              0x00

// Bluetooth Event Mask Page 2 Index
#define BT_EVT_INDEX2_APTO_EXPIRED                                     2

// Event Mask 2 Default Values
#define BT_EVT_MASK2_BYTE0  (BT_EVT_MASK2_NONE)
#define BT_EVT_MASK2_BYTE1  (BT_EVT_MASK2_NONE)
#define BT_EVT_MASK2_BYTE2  (BT_EVT_MASK2_AUTHENTICATED_PAYLOAD_TIMEOUT_EXPIRED)
#define BT_EVT_MASK2_BYTE3  (BT_EVT_MASK2_NONE)
#define BT_EVT_MASK2_BYTE4  (BT_EVT_MASK2_NONE)
#define BT_EVT_MASK2_BYTE5  (BT_EVT_MASK2_NONE)
#define BT_EVT_MASK2_BYTE6  (BT_EVT_MASK2_NONE)
#define BT_EVT_MASK2_BYTE7  (BT_EVT_MASK2_NONE)

/*
** Bluetooth LE Event Mask
** Core Specification, Vol. 2, Part E, Section 7.8.1
*/

// Byte 0
#define LE_EVT_MASK_CONN_COMPLETE                                      0x01
#define LE_EVT_MASK_ADV_REPORT                                         0x02
#define LE_EVT_MASK_CONN_UPDATE_COMPLETE                               0x04
#define LE_EVT_MASK_READ_REMOTE_FEATURE                                0x08
#define LE_EVT_MASK_LTK_REQUEST                                        0x10
#define LE_EVT_MASK_REMOTE_CONN_PARAM_REQUEST                          0x20
#define LE_EVT_MASK_DATA_LENGTH_CHANGE                                 0x40
#define LE_EVT_MASK_READ_LOCAL_P256_PUBLIC_KEY_COMPLETE                0x80
// Byte 1
#define LE_EVT_MASK_GENERATE_DHKEY_COMPLETE                            0x01
#define LE_EVT_MASK_ENH_CONN_COMPLETE                                  0x02
#define LE_EVT_MASK_DIRECT_ADVERTISING_REPORT                          0x04
#define LE_EVT_MASK_PHY_UPDATE_COMPLETE                                0x08
#define LE_EVT_MASK_EXTENDED_ADV_REPORT                                0x10
#define LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED                      0x20
#define LE_EVT_MASK_PERIODIC_ADV_REPORT                                0x40
#define LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST                             0x80
// Byte 2
#define LE_EVT_MASK_EXTENDED_SCAN_TIMEOUT                              0x01
#define LE_EVT_MASK_EXTENDED_ADV_SET_TERIMINATED                       0x02
#define LE_EVT_MASK_SCAN_REQUEST_RECEIVED                              0x04
#define LE_EVT_MASK_CHANNEL_SELECTION_ALGORITHM                        0x08
#define LE_EVT_MASK_RESERVED01                                         0x10
#define LE_EVT_MASK_RESERVED02                                         0x20
#define LE_EVT_MASK_RESERVED03                                         0x40
#define LE_EVT_MASK_RESERVED04                                         0x80
// Byte 3 - Byte 7
#define LE_EVT_MASK_RESERVED05                                         0x01
#define LE_EVT_MASK_RESERVED06                                         0x02
#define LE_EVT_MASK_RESERVED07                                         0x04
#define LE_EVT_MASK_RESERVED08                                         0x08
#define LE_EVT_MASK_RESERVED09                                         0x10
#define LE_EVT_MASK_RESERVED10                                         0x20
#define LE_EVT_MASK_RESERVED11                                         0x40
#define LE_EVT_MASK_RESERVED12                                         0x80

// No Bluetooth LE Event Mask in Byte
#define LE_EVT_MASK_NONE                                               0x00

// Bluetooth LE Event Mask Index
#define LE_EVT_INDEX_CONN_COMPLETE                                     0
#define LE_EVT_INDEX_ADV_REPORT                                        0
#define LE_EVT_INDEX_CONN_UPDATE_COMPLETE                              0
#define LE_EVT_INDEX_READ_REMOTE_FEATURE                               0
#define LE_EVT_INDEX_LTK_REQUEST                                       0
#define LE_EVT_INDEX_REMOTE_CONN_PARAM_REQUEST                         0
#define LE_EVT_INDEX_DATA_LENGTH_CHANGE                                0
#define LE_EVT_INDEX_READ_LOCAL_P256_PUBLIC_KEY_COMPLETE               0
//
#define LE_EVT_INDEX_GENERATE_DHKEY_COMPLETE                           1
#define LE_EVT_INDEX_ENH_CONN_COMPLETE                                 1
#define LE_EVT_INDEX_DIRECT_ADVERTISING_REPORT                         1
#define LE_EVT_INDEX_PHY_UPDATE_COMPLETE                               1
#define LE_EVT_INDEX_EXTENDED_ADV_REPORT                               1
#define LE_EVT_INDEX_PERIODIC_ADV_SYNC_ESTABLISHED                     1
#define LE_EVT_INDEX_PERIODIC_ADV_REPORT                               1
#define LE_EVT_INDEX_PERIODIC_ADV_SYNC_LOST                            1
//
#define LE_EVT_INDEX_EXTENDED_SCAN_TIMEOUT                             2
#define LE_EVT_INDEX_EXTENDED_ADV_SET_TERIMINATED                      2
#define LE_EVT_INDEX_SCAN_REQUEST_RECEIVED                             2
#define LE_EVT_INDEX_CHANNEL_SELECTION_ALGORITHM                       2

// Bluetooth LE Event Mask Default Values
#if defined(CTRL_V42_CONFIG) && (CTRL_V42_CONFIG & EXT_DATA_LEN_CFG)
  #if defined(CTRL_V42_CONFIG) && (CTRL_V42_CONFIG & SECURE_CONNS_CFG)
    #define LE_EVT_MASK_BYTE0   (LE_EVT_MASK_CONN_COMPLETE             |     \
                                 LE_EVT_MASK_ADV_REPORT                |     \
                                 LE_EVT_MASK_CONN_UPDATE_COMPLETE      |     \
                                 LE_EVT_MASK_READ_REMOTE_FEATURE       |     \
                                 LE_EVT_MASK_LTK_REQUEST               |     \
                                 LE_EVT_MASK_REMOTE_CONN_PARAM_REQUEST |     \
                                 LE_EVT_MASK_DATA_LENGTH_CHANGE        |     \
                                 LE_EVT_MASK_READ_LOCAL_P256_PUBLIC_KEY_COMPLETE)
  #else // !SECURE_CONNS_CFG
    #define LE_EVT_MASK_BYTE0   (LE_EVT_MASK_CONN_COMPLETE             |     \
                                 LE_EVT_MASK_ADV_REPORT                |     \
                                 LE_EVT_MASK_CONN_UPDATE_COMPLETE      |     \
                                 LE_EVT_MASK_READ_REMOTE_FEATURE       |     \
                                 LE_EVT_MASK_LTK_REQUEST               |     \
                                 LE_EVT_MASK_REMOTE_CONN_PARAM_REQUEST |     \
                                 LE_EVT_MASK_DATA_LENGTH_CHANGE)
  #endif // SECURE_CONNS_CFG
#else // !EXT_DATA_LEN_CFG
  #if defined(CTRL_V42_CONFIG) && (CTRL_V42_CONFIG & SECURE_CONNS_CFG)
    #define LE_EVT_MASK_BYTE0   (LE_EVT_MASK_CONN_COMPLETE             |     \
                                 LE_EVT_MASK_ADV_REPORT                |     \
                                 LE_EVT_MASK_CONN_UPDATE_COMPLETE      |     \
                                 LE_EVT_MASK_READ_REMOTE_FEATURE       |     \
                                 LE_EVT_MASK_LTK_REQUEST               |     \
                                 LE_EVT_MASK_REMOTE_CONN_PARAM_REQUEST |     \
                                 LE_EVT_MASK_READ_LOCAL_P256_PUBLIC_KEY_COMPLETE)
  #else // !SECURE_CONNS_CFG
    #define LE_EVT_MASK_BYTE0   (LE_EVT_MASK_CONN_COMPLETE             |     \
                                 LE_EVT_MASK_ADV_REPORT                |     \
                                 LE_EVT_MASK_CONN_UPDATE_COMPLETE      |     \
                                 LE_EVT_MASK_READ_REMOTE_FEATURE       |     \
                                 LE_EVT_MASK_LTK_REQUEST               |     \
                                 LE_EVT_MASK_REMOTE_CONN_PARAM_REQUEST)
  #endif // SECURE_CONNS_CFG
#endif // EXT_DATA_LEN_CFG

#if defined(CTRL_V42_CONFIG) && (CTRL_V42_CONFIG & SECURE_CONNS_CFG)
  #if defined(CTRL_V42_CONFIG) && (CTRL_V42_CONFIG & PRIVACY_1_2_CFG)
    #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & (PHY_2MBPS_CFG | PHY_LR_CFG))
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT      |\
                                   LE_EVT_MASK_PHY_UPDATE_COMPLETE            |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT      |\
                                   LE_EVT_MASK_PHY_UPDATE_COMPLETE)
      #endif // AE_CFG
    #else // !(PHY_2MBPS_CFG | PHY_LR_CFG)
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT      |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT)
      #endif // AE_CFG
    #endif // PHY_2MBPS_CFG | PHY_LR_CFG
  #else // !PRIVACY_1_2_CFG
    #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & (PHY_2MBPS_CFG | PHY_LR_CFG))
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_PHY_UPDATE_COMPLETE            |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_PHY_UPDATE_COMPLETE)
      #endif // AE_CFG
    #else // !(PHY_2MBPS_CFG | PHY_LR_CFG)
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE        |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_GENERATE_DHKEY_COMPLETE)
      #endif // AE_CFG
    #endif // PHY_2MBPS_CFG | PHY_LR_CFG
  #endif // PRIVACY_1_2_CFG
#else // !SECURE_CONNS_CFG
  #if defined(CTRL_V42_CONFIG) && (CTRL_V42_CONFIG & PRIVACY_1_2_CFG)
    #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & (PHY_2MBPS_CFG | PHY_LR_CFG))
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT      |\
                                   LE_EVT_MASK_PHY_UPDATE_COMPLETE            |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT      |\
                                   LE_EVT_MASK_PHY_UPDATE_COMPLETE)
      #endif // AE_CFG
    #else // !(PHY_2MBPS_CFG | PHY_LR_CFG)
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT      |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_ENH_CONN_COMPLETE              |\
                                   LE_EVT_MASK_DIRECT_ADVERTISING_REPORT)
      #endif // AE_CFG
    #endif // PHY_2MBPS_CFG | PHY_LR_CFG
  #else // !PRIVACY_1_2_CFG
    #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & (PHY_2MBPS_CFG | PHY_LR_CFG))
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_PHY_UPDATE_COMPLETE            |\
                                   LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_PHY_UPDATE_COMPLETE)
      #endif // AE_CFG
    #else // !(PHY_2MBPS_CFG  | PHY_LR_CFG)
      #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_EXTENDED_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_ESTABLISHED  |\
                                   LE_EVT_MASK_PERIODIC_ADV_REPORT            |\
                                   LE_EVT_MASK_PERIODIC_ADV_SYNC_LOST)
      #else // !AE_CFG
        #define LE_EVT_MASK_BYTE1 (LE_EVT_MASK_NONE)
      #endif // AE_CFG
    #endif // PHY_2MBPS_CFG | PHY_LR_CFG
  #endif // PRIVACY_1_2_CFG
#endif // SECURE_CONNS_CFG

#if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
  #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & CHAN_ALGO2_CFG)
    #define LE_EVT_MASK_BYTE2 (LE_EVT_MASK_EXTENDED_SCAN_TIMEOUT              |\
                               LE_EVT_MASK_EXTENDED_ADV_SET_TERIMINATED       |\
                               LE_EVT_MASK_SCAN_REQUEST_RECEIVED              |\
                               LE_EVT_MASK_CHANNEL_SELECTION_ALGORITHM)
  #else // !CHAN_ALGO2_CFG
    #define LE_EVT_MASK_BYTE2 (LE_EVT_MASK_EXTENDED_SCAN_TIMEOUT              |\
                               LE_EVT_MASK_EXTENDED_ADV_SET_TERIMINATED       |\
                               LE_EVT_MASK_SCAN_REQUEST_RECEIVED)
  #endif // CHAN_ALGO2_CFG
#else // !AE_CFG
  #if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & CHAN_ALGO2_CFG)
    #define LE_EVT_MASK_BYTE2 (LE_EVT_MASK_CHANNEL_SELECTION_ALGORITHM)
  #else // !CHAN_ALGO2_CFG
    #define LE_EVT_MASK_BYTE2 (LE_EVT_MASK_NONE)
  #endif // CHAN_ALGO2_CFG
#endif // AE_CFG

// LE Event Lengths
#define HCI_CMD_COMPLETE_EVENT_LEN                                     3
#define HCI_CMD_VS_COMPLETE_EVENT_LEN                                  2
#define HCI_CMD_STATUS_EVENT_LEN                                       4
#define HCI_NUM_COMPLETED_PACKET_EVENT_LEN                             5
#define HCI_FLUSH_OCCURRED_EVENT_LEN                                   2
#define HCI_REMOTE_VERSION_INFO_EVENT_LEN                              8
#define HCI_CONNECTION_COMPLETE_EVENT_LEN                              19
#define HCI_ENH_CONNECTION_COMPLETE_EVENT_LEN                          31
#define HCI_DISCONNECTION_COMPLETE_LEN                                 4
#define HCI_CONN_UPDATE_COMPLETE_LEN                                   10
#define HCI_ADV_REPORT_EVENT_LEN                                       12
#define HCI_ADV_DIRECTED_REPORT_EVENT_LEN                              18
#define HCI_READ_REMOTE_FEATURE_COMPLETE_EVENT_LEN                     12
#define HCI_REMOTE_CONNECTION_PARAMETER_REQUEST_LEN                    11
#define HCI_NUM_COMPLETED_PACKET_EVENT_LEN                             5
#define HCI_APTO_EXPIRED_EVENT_LEN                                     2
#define HCI_LTK_REQUESTED_EVENT_LEN                                    13
#define HCI_DATA_BUF_OVERFLOW_EVENT_LEN                                1
#define HCI_ENCRYPTION_CHANGE_EVENT_LEN                                4
#define HCI_KEY_REFRESH_COMPLETE_EVENT_LEN                             3
#define HCI_BUFFER_OVERFLOW_EVENT_LEN                                  1
#define HCI_DATA_LENGTH_CHANGE_EVENT_LEN                               11
#define HCI_READ_LOCAL_P256_PUBLIC_KEY_COMPLETE_EVENT_LEN              66
#define HCI_GENERATE_DHKEY_COMPLETE_EVENT_LEN                          34
#define HCI_PHY_UPDATE_COMPLETE_EVENT_LEN                              6
#define HCI_CHANNEL_SELECTION_ALGORITHM_EVENT_LEN                      4
// Vendor Specific LE Events
#define HCI_SCAN_REQ_REPORT_EVENT_LEN                                  11

/*******************************************************************************
 * TYPEDEFS
 */

/*******************************************************************************
 * LOCAL VARIABLES
 */

/*******************************************************************************
 * GLOBAL VARIABLES
 */

/*
** Internal Functions
*/

extern void hciInitEventMasks( void );

/*
** HCI Controller Events
*/

/*******************************************************************************
 * @fn          HCI_DataBufferOverflowEvent
 *
 * @brief       This function sends the Data Buffer Overflow Event to the Host.
 *
 * input parameters
 *
 * @param       linkType - HCI_LINK_TYPE_SCO_BUFFER_OVERFLOW,
 *                         HCI_LINK_TYPE_ACL_BUFFER_OVERFLOW
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_DataBufferOverflowEvent( uint8 linkType );


/*******************************************************************************
 * @fn          HCI_NumOfCompletedPacketsEvent
 *
 * @brief       This function sends the Number of Completed Packets Event to
 *              the Host.
 *
 *              Note: Currently, the number of handles is always one.
 *
 * input parameters
 *
 * @param       numHandles       - Number of handles.
 * @param       handlers         - Array of connection handles.
 * @param       numCompletedPkts - Array of number of completed packets for
 *                                 each handle.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_NumOfCompletedPacketsEvent( uint8 numHandles,
                                            uint16 *handlers,
                                            uint16 *numCompletedPackets );


/*******************************************************************************
 * @fn          HCI_CommandCompleteEvent
 *
 * @brief       This function sends a Command Complete Event to the Host.
 *
 * input parameters
 *
 * @param       opcode   - The opcode of the command that generated this event.
 * @param       numParam - The number of parameters in the event.
 * @param       param    - The event parameters associated with the command.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_CommandCompleteEvent( uint16 opcode,
                                      uint8  numParam,
                                      uint8  *param );


/*******************************************************************************
 * @fn          HCI_VendorSpecifcCommandCompleteEvent
 *
 * @brief       This function sends a Vendor Specific Command Complete Event to
 *              the Host.
 *
 * input parameters
 *
 * @param       opcode   - The opcode of the command that generated this event.
 * @param       numParam - The number of parameters in the event.
 * @param       param    - The event parameters associated with the command.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_VendorSpecifcCommandCompleteEvent( uint16 opcode,
                                                   uint8 len,
                                                   uint8 *param );


/*******************************************************************************
 * @fn          HCI_CommandStatusEvent
 *
 * @brief       This function sends a Command Status Event to the Host.
 *
 * input parameters
 *
 * @param       status - The resulting status of the command.
 * @param       opcode - The opcode of the command that generated this event.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_CommandStatusEvent( uint8 status,
                                    uint16 opcode );


/*******************************************************************************
 * @fn          HCI_HardwareErrorEvent
 *
 * @brief       This function sends a Hardware Error Event to the Host.
 *
 * input parameters
 *
 * @param       hwErrorCode - The hardware error code.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_HardwareErrorEvent( uint8 hwErrorCode );


/*******************************************************************************
 * @fn          HCI_SendCommandStatusEvent
 *
 * @brief       This generic function sends a Command Status event to the Host.
 *              It is provided as a direct call so the Host can use it directly.
 *
 * input parameters
 *
 * @param       eventCode - The event code.
 * @param       status    - The resulting status of the command.
 * @param       opcode    - The opcode of the command that generated this event.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_SendCommandStatusEvent ( uint8  eventCode,
                                         uint16 status,
                                         uint16 opcode );


/*******************************************************************************
 * @fn          HCI_SendCommandCompleteEvent
 *
 * @brief       This generic function sends a Command Complete or a Vendor
 *              Specific Command Complete Event to the Host.
 *
 * input parameters
 *
 * @param       eventCode - The event code.
 * @param       opcode    - The opcode of the command that generated this event.
 * @param       numParam  - The number of parameters in the event.
 * @param       param     - The event parameters associated with the command.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_SendCommandCompleteEvent ( uint8  eventCode,
                                           uint16 opcode,
                                           uint8  numParam,
                                           uint8  *param );


/*******************************************************************************
 * @fn          HCI_SendControllerToHostEvent
 *
 * @brief       This generic function sends a Controller to Host Event.
 *
 * input parameters
 *
 * @param       eventCode - Bluetooth event code.
 * @param       dataLen   - Length of dataField.
 * @param       pData     - Pointer to data.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void HCI_SendControllerToHostEvent( uint8 eventCode,
                                           uint8 dataLen,
                                           uint8 *pData );

#ifdef __cplusplus
}
#endif

#endif /* HCI_C_EVENT_H */

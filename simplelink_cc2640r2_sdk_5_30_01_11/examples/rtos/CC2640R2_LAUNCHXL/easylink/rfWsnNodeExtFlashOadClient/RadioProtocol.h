/******************************************************************************

 @file RadioProtocol.h

 @brief Over the Air Download API

 Group: CMCU LPRF
 Target Device: cc2640r2

 ******************************************************************************
 
 Copyright (c) 2015-2020, Texas Instruments Incorporated
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

#ifndef RADIOPROTOCOL_H_
#define RADIOPROTOCOL_H_

#include "stdint.h"
#include "easylink/EasyLink.h"
#if (defined(DeviceFamily_CC13X2))
#include <oad/native_oad/oad_config.h>
#endif

#define RADIO_CONCENTRATOR_ADDRESS     0x00

/*
 * Uncomment to change the modulation away from the default found in the 
 * EASYLINK_PARAM_CONFIG macro in easylink_config.h
 *
 * Valid values can be found in the EasyLink_PhyType enum in EasyLink.h
 */
/*
 *#ifdef FEATURE_SLR_OAD
 *#define DEFINED_RADIO_EASYLINK_MODULATION     EasyLink_Phy_5kbpsSlLr
 *#else
 *#define DEFINED_RADIO_EASYLINK_MODULATION     EasyLink_Phy_Custom
 *#endif
*/

#define RADIO_PACKET_TYPE_ACK_PACKET             0
#define RADIO_PACKET_TYPE_ADC_SENSOR_PACKET      1
#define RADIO_PACKET_TYPE_DM_SENSOR_PACKET       2
#define RADIO_PACKET_TYPE_OAD_PACKET             3

#define RADIO_PACKET_SRCADDR_OFFSET              0
#define RADIO_PACKET_PKTTYPE_OFFSET              1
#define RADIO_PACKET_PAYLOAD_OFFSET              2

struct PacketHeader {
    uint8_t sourceAddress;
    uint8_t packetType;
};

struct AdcSensorPacket {
    struct PacketHeader header;
    uint16_t adcValue;
};

struct DualModeSensorPacket {
    struct PacketHeader header;
    uint16_t adcValue;
    uint32_t time100MiliSec;
    uint16_t batt;
    uint8_t button;
};

struct OadPacket {
    struct PacketHeader header;
    uint8_t oadPayload[OAD_BLOCK_SIZE + 2 + 2]; //buffer for mac oad packet side
};

struct AckPacket {
    struct PacketHeader header;
    uint8_t framePending;
};

#endif /* RADIOPROTOCOL_H_ */

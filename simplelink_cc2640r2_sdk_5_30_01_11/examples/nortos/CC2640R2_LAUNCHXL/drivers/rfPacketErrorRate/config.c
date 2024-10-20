/*
 * Copyright (c) 2016-2018, Texas Instruments Incorporated
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * *  Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * *  Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * *  Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/***** Includes *****/

/* Application specific Header files */
#include "config.h"

/*
The values have been generated
with RF studio and are used to overwrite the CMD_FS
from smartrf_settings.c
*/
FrequencyTableEntry config_frequencyTable_2_4[] =
{
    { "2405  ", 0x0965, 0x0000, 0x0 },
    { "2410  ", 0x096a, 0x0000, 0x0 },
    { "2415  ", 0x096f, 0x0000, 0x0 },
    { "2420  ", 0x0974, 0x0000, 0x0 },
    { "2425  ", 0x0979, 0x0000, 0x0 },
    { "2430  ", 0x097e, 0x0000, 0x0 },
    { "2435  ", 0x0983, 0x0000, 0x0 },
    { "2440  ", 0x0988, 0x0000, 0x0 },
    { "2445  ", 0x098d, 0x0000, 0x0 },
    { "2450  ", 0x0992, 0x0000, 0x0 },
    { "2455  ", 0x0997, 0x0000, 0x0 },
    { "2460  ", 0x099c, 0x0000, 0x0 },
    { "2465  ", 0x09a1, 0x0000, 0x0 },
    { "2470  ", 0x09a6, 0x0000, 0x0 },
    { "2475  ", 0x09ab, 0x0000, 0x0 },
    { "2480  ", 0x09b0, 0x0000, 0x0 },
    { "", 0xFFFF, 0, 0 }, // Freq of 0xFFFF indicates the end of the table
};

FrequencyTableEntry config_frequencyTable_ble[] =
{
    { "2402  ", 0x0962, 0x0000, 0x65 },
    { "2404  ", 0x0964, 0x0000, 0x40 },
    { "2406  ", 0x0966, 0x0000, 0x41 },
    { "2408  ", 0x0968, 0x0000, 0x42 },
    { "2410  ", 0x096a, 0x0000, 0x43 },
    { "2412  ", 0x096c, 0x0000, 0x44 },
    { "2414  ", 0x096e, 0x0000, 0x45 },
    { "2416  ", 0x0970, 0x0000, 0x46 },
    { "2418  ", 0x0972, 0x0000, 0x47 },
    { "2420  ", 0x0974, 0x0000, 0x48 },
    { "2422  ", 0x0976, 0x0000, 0x49 },
    { "2424  ", 0x0978, 0x0000, 0x4a },
    { "2426  ", 0x097a, 0x0000, 0x66 },
    { "2428  ", 0x097c, 0x0000, 0x4b },
    { "2430  ", 0x097e, 0x0000, 0x4c },
    { "2432  ", 0x0980, 0x0000, 0x4d },
    { "2434  ", 0x0982, 0x0000, 0x4e },
    { "2436  ", 0x0984, 0x0000, 0x4f },
    { "2438  ", 0x0986, 0x0000, 0x50 },
    { "2440  ", 0x0988, 0x0000, 0x51 },
    { "2442  ", 0x098a, 0x0000, 0x52 },
    { "2444  ", 0x098c, 0x0000, 0x53 },
    { "2446  ", 0x098e, 0x0000, 0x54 },
    { "2448  ", 0x0990, 0x0000, 0x55 },
    { "2480  ", 0x0992, 0x0000, 0x56 },
    { "2452  ", 0x0994, 0x0000, 0x57 },
    { "2454  ", 0x0996, 0x0000, 0x58 },
    { "2456  ", 0x0998, 0x0000, 0x59 },
    { "2458  ", 0x099a, 0x0000, 0x5a },
    { "2460  ", 0x099c, 0x0000, 0x5b },
    { "2462  ", 0x099e, 0x0000, 0x5c },
    { "2464  ", 0x09a0, 0x0000, 0x5d },
    { "2466  ", 0x09a2, 0x0000, 0x5e },
    { "2468  ", 0x09a4, 0x0000, 0x5f },
    { "2470  ", 0x09a6, 0x0000, 0x60 },
    { "2472  ", 0x09a8, 0x0000, 0x61 },
    { "2474  ", 0x09aa, 0x0000, 0x62 },
    { "2476  ", 0x09ac, 0x0000, 0x63 },
    { "2478  ", 0x09ae, 0x0000, 0x64 },
    { "2480  ", 0x09b0, 0x0000, 0x67 },
    { "", 0xFFFF, 0, 0 }, //Freq of 0xFFFF indicates the end of the table
};

#if (defined Board_CC1350_LAUNCHXL_433)
FrequencyTableEntry config_frequencyTable_sub1[] =
{
    { "433.92 ", 0x01B1, 0xEB9A, 0x0 },
    { "", 0xFFFF, 0, 0 }, // Freq of 0xFFFF indicates the end of the table
};
#elif (defined Board_CC1352P_4_LAUNCHXL)
FrequencyTableEntry config_frequencyTable_sub1[] =
{
    { "433.92 ", 0x01B1, 0xEB9A, 0x0 },
    { "490.0  ", 0x01EA, 0x0000, 0x0 },
    { "", 0xFFFF, 0, 0 }, // Freq of 0xFFFF indicates the end of the table
};
#else
FrequencyTableEntry config_frequencyTable_sub1[] =
{
    { "868.0  ", 0x0364, 0x0000, 0x0 },
    { "915.0  ", 0x0393, 0x0000, 0x0 },
    { "", 0xFFFF, 0, 0 }, // Freq of 0xFFFF indicates the end of the table
};
#endif


FrequencyTableEntry config_frequencyTable_custom[] =
{
    { "Custom  ", 1, 0x0000, 0x0 }, // Custom Phy mode only support freq defined in
                                    // smartrf_settings.c
    { "", 0xFFFF, 0, 0 }, // Freq of 0xFFFF indicates the end of the table
};

/*
Frequency and data rate table look up. Maps Frequency table and data rate table
to specific RF Mode
*/
#if (defined Board_CC2650DK_7ID) || (defined Board_CC2650_LAUNCHXL)
FrequencyTableEntry*  config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used.
    config_frequencyTable_2_4,    // RfSetup_Fsk
    config_frequencyTable_ble     // RfSetup_Ble
};

uint32_t config_dataRateTable_Lut[] =
{
    200000,   // RfSetup_Custom 200 Kbps
    200000,   // RfSetup_Fsk 200 Kbps
    1000000   // RfSetup_Ble 1 Mbps
};

#elif (defined Board_CC2640R2_LAUNCHXL)
FrequencyTableEntry*  config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used.
    config_frequencyTable_2_4,    // RfSetup_Fsk
    config_frequencyTable_2_4,    // RfSetup_Fsk_100
    config_frequencyTable_ble,    // RfSetup_Ble
    config_frequencyTable_ble     // RfSetup_Ble5
};

uint32_t config_dataRateTable_Lut[] =
{
    250000,   // RfSetup_Custom 250 Kbps
    250000,   // RfSetup_Fsk 250 Kbps
    100000,   // RfSetup_Fsk_100 100 Kbps
    1000000,  // RfSetup_Ble 1 Mbps
    1000000   // RfSetup_Ble5 1 Mbps
};
#elif (defined Board_CC26X2R1_LAUNCHXL)
FrequencyTableEntry*  config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used.
    config_frequencyTable_2_4,    // RfSetup_Fsk
    config_frequencyTable_ble,    // RfSetup_Ble
    config_frequencyTable_ble     // RfSetup_Ble5
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    200000,   // RfSetup_Fsk 200 Kbps
    1000000,  // RfSetup_Ble 1 Mbps
    1000000   // RfSetup_Ble5 1 Mbps
};
#elif (defined Board_CC1350_LAUNCHXL) || (defined Board_CC1350STK)
FrequencyTableEntry* config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used
    config_frequencyTable_sub1,   // RfSetup_Fsk
    config_frequencyTable_sub1,   // RfSetup_Lrm
    config_frequencyTable_sub1,   // RfSetup_Sl_lr
    config_frequencyTable_sub1,   // RfSetup_Ook
    config_frequencyTable_sub1,   // RfSetup_Hsm
    config_frequencyTable_ble     // RfSetup_Ble
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    50000,    // RfSetup_Fsk 50 Kbps
    625,      // RfSetup_Lrm 625 bps
    5000,     // RfSetup_Sl_lr 5 Kbps
    4800,     // RfSetup_Ook 4.8 Kbps
    4000000,  // RfSetup_Hsm 4 Mbps
    1000000   // RfSetup_Ble 1 Mbps
};
#elif ((defined Board_CC1352R1_LAUNCHXL)  || (defined Board_CC1352P1_LAUNCHXL) || \
       (defined Board_CC1352P_2_LAUNCHXL))
FrequencyTableEntry* config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used
    config_frequencyTable_sub1,   // RfSetup_Fsk
    config_frequencyTable_sub1,   // RfSetup_Fsk_200kbps
    config_frequencyTable_sub1,   // RfSetup_Sl_lr
    config_frequencyTable_ble,    // RfSetup_Ble
    config_frequencyTable_ble     // RfSetup_Ble5
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    50000,    // RfSetup_Fsk 50 Kbps
    200000,   // RfSetup_Fsk_200kbps 200 Kbps
    5000,     // RfSetup_Sl_lr 5 Kbps
    1000000,  // RfSetup_Ble 1 Mbps
    1000000   // RfSetup_Ble5 1 Mbps
};
#elif (defined Board_CC1352P_4_LAUNCHXL)
FrequencyTableEntry* config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used
    config_frequencyTable_sub1,   // RfSetup_Fsk
    config_frequencyTable_sub1,   // RfSetup_Sl_lr
    config_frequencyTable_ble,    // RfSetup_Ble
    config_frequencyTable_ble     // RfSetup_Ble5
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    50000,    // RfSetup_Fsk 50 Kbps
    5000,     // RfSetup_Sl_lr 5 Kbps
    1000000,  // RfSetup_Ble 1 Mbps
    1000000   // RfSetup_Ble5 1 Mbps
};
#elif (defined Board_CC1312R1_LAUNCHXL)
FrequencyTableEntry* config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used
    config_frequencyTable_sub1,   // RfSetup_Fsk
    config_frequencyTable_sub1,   // RfSetup_Fsk_200kbps
    config_frequencyTable_sub1,   // RfSetup_Sl_lr
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    50000,    // RfSetup_Fsk 50 Kbps
    200000,   // RfSetup_Fsk_200kbps 200 Kbps
    5000,     // RfSetup_Sl_lr 5 Kbps
};
#elif (defined Board_CC1350_LAUNCHXL_433)
FrequencyTableEntry* config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used
    config_frequencyTable_sub1,   // RfSetup_Fsk
    config_frequencyTable_sub1,   // RfSetup_Lrm
    config_frequencyTable_sub1,   // RfSetup_Sl_lr
    config_frequencyTable_ble     // RfSetup_Ble
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    50000,    // RfSetup_Fsk 50 Kbps
    625,      // RfSetup_Lrm 625 bps
    5000,     // RfSetup_Sl_lr 5 Kbps
    1000000   // RfSetup_Ble 1 Mbps
};
#else
FrequencyTableEntry* config_frequencyTable_Lut[] =
{
    config_frequencyTable_custom, // RfSetup_Custom - only frequency in custom command can be used
    config_frequencyTable_sub1,   // RfSetup_Fsk
    config_frequencyTable_sub1,   // RfSetup_Lrm
    config_frequencyTable_sub1,   // RfSetup_Sl_lr
    config_frequencyTable_sub1,   // RfSetup_Ook
    config_frequencyTable_sub1,   // RfSetup_Hsm
};

uint32_t config_dataRateTable_Lut[] =
{
    50000,    // RfSetup_Custom 50 Kbps
    50000,    // RfSetup_Fsk 50 Kbps
    625,      // RfSetup_Lrm 625 bps
    5000,     // RfSetup_Sl_lr 5 Kbps
    4800,     // RfSetup_Ook 4.8 Kbps
    4000000   // RfSetup_Hsm 4 Mbps
};
#endif

const char* const config_testmodeLabels[] =
{
    "Rx",
    "Tx"
};

const uint32_t config_packetCountTable[] =
{
    10,
    100,
    1000,
    10000
};

const uint32_t config_payloadLengthTable[] =
{
    30,
    60,
    100,
    254
};

#if (defined Board_CC2650DK_7ID) || (defined Board_CC2650_LAUNCHXL)
const char* const config_rfSetupLabels[] =
{
    "Custom  ",
    "2-GFSK  ",
    "BLE Mode"
};
#elif (defined Board_CC2640R2_LAUNCHXL)
const char* const config_rfSetupLabels[] =
{
    "Custom   ",
    "GFSK 250K",
    "GFSK 100K",
    "BLE Mode ",
    "BLE5 Mode"
};
#elif (defined Board_CC26X2R1_LAUNCHXL)
const char* const config_rfSetupLabels[] =
{
    "Custom   ",
    "2-GFSK   ",
    "BLE Mode ",
    "BLE5 Mode"
};
#elif (defined Board_CC1350_LAUNCHXL) || (defined Board_CC1350STK)
const char* const config_rfSetupLabels[] =
{
    "Custom  ",
    "2-GFSK  ",
    "LR Mode ",
    "SL LR   ",
    "OOK     ",
    "HS Mode ",
    "BLE Mode"
};
#elif (defined Board_CC1350_LAUNCHXL_433)
const char* const config_rfSetupLabels[] =
{
    "Custom  ",
    "2-GFSK  ",
    "LR Mode ",
    "SL LR   ",
    "BLE Mode"
};
#elif ((defined Board_CC1352R1_LAUNCHXL)  || (defined Board_CC1352P1_LAUNCHXL) || \
       (defined Board_CC1352P_2_LAUNCHXL))
const char* const config_rfSetupLabels[] =
{
    "Custom   ",
    "2-GFSK   ",
    "GFSK 200K",
    "SL LR    ",
    "BLE Mode ",
    "BLE5 Mode"
};
#elif (defined Board_CC1352P_4_LAUNCHXL)
const char* const config_rfSetupLabels[] =
{
    "Custom   ",
    "2-GFSK   ",
    "SL LR    ",
    "BLE Mode ",
    "BLE5 Mode"
};
#elif (defined Board_CC1312R1_LAUNCHXL)
const char* const config_rfSetupLabels[] =
{
    "Custom   ",
    "2-GFSK   ",
    "GFSK 200K",
    "SL LR    "
};
#else
const char* const config_rfSetupLabels[] =
{
    "Custom  ",
    "2-GFSK  ",
    "LR Mode ",
    "SL LR   ",
    "OOK     ",
    "HS Mode "
};
#endif

const char* const config_intervalLabels[] =
{
    "No ",
    "Yes"
};

#if (defined Board_CC1310_LAUNCHXL)
const char* const config_rangeExtenderLabels[] =
{
    "Disabled",
    "Enabled "
};
#elif ((defined Board_CC1352P1_LAUNCHXL)   || (defined Board_CC1352P_2_LAUNCHXL) || \
       (defined Board_CC1352P_4_LAUNCHXL))
const char* const config_highPaLabels[] =
{
    "Disabled",
    "Enabled "
};
#endif

const uint8_t config_NrOfPacketCounts = (sizeof(config_packetCountTable)/sizeof(uint32_t));
const uint8_t config_NrOfPayloadLengths = (sizeof(config_payloadLengthTable)/sizeof(uint32_t));

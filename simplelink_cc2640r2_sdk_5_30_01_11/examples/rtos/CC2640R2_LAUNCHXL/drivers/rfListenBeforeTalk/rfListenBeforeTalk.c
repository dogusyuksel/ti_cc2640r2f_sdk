/*
 * Copyright (c) 2019, Texas Instruments Incorporated
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
/* Standard C Libraries */
#include <stdlib.h>

/* TI Drivers */
#include <ti/drivers/rf/RF.h>
#include <ti/drivers/PIN.h>

/* Board Header files */
#include "Board.h"

/* Application Header files */
#include "smartrf_settings/smartrf_settings.h"
#include "application_settings.h"

/* Pin driver handle */
static PIN_Handle ledPinHandle;
static PIN_State ledPinState;

/* Application LED pin configuration table: */
PIN_Config ledPinTable[] =
{
    Board_PIN_LED1 | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
    PIN_TERMINATE
};

/***** Defines *****/
#define PAYLOAD_LENGTH          30
#define PACKET_INTERVAL_US      200000
/* Number of times the CS command should run when the channel is BUSY */
#define CS_RETRIES_WHEN_BUSY    10
/* The channel is reported BUSY is the RSSI is above this threshold */
#define RSSI_THRESHOLD_DBM      -80
#define IDLE_TIME_US            5000
/* Proprietary Radio Operation Status Codes Number: Operation ended normally */
#define PROP_DONE_OK            0x3400

/***** Prototypes *****/
static void callback(RF_Handle h, RF_CmdHandle ch, RF_EventMask e);

/***** Variable declarations *****/
static RF_Object rfObject;
static RF_Handle rfHandle;

static uint8_t packet[PAYLOAD_LENGTH];
static uint16_t seqNumber;

static uint32_t time;

/*
 *  ======== txTaskFunction ========
 */
void *mainThread(void *arg0)
{
    RF_Params rfParams;
    RF_Params_init(&rfParams);

    /* Open LED pins */
    ledPinHandle = PIN_open(&ledPinState, ledPinTable);
    if (ledPinHandle == NULL)
    {
        while(1);
    }

    /* Customize the CMD_PROP_TX command for this application */
    RF_cmdPropTx.pktLen = PAYLOAD_LENGTH;
    RF_cmdPropTx.pPkt = packet;
    RF_cmdNop.startTrigger.triggerType = TRIG_ABSTIME;
    RF_cmdNop.startTrigger.pastTrig = 1;

    /* Set up the next pointers for the command chain */
    RF_cmdNop.pNextOp = (rfc_radioOp_t*)&RF_cmdPropCs;
    RF_cmdPropCs.pNextOp = (rfc_radioOp_t*)&RF_cmdCountBranch;
    RF_cmdCountBranch.pNextOp = (rfc_radioOp_t*)&RF_cmdPropTx;
    RF_cmdCountBranch.pNextOpIfOk = (rfc_radioOp_t*)&RF_cmdPropCs;

    /* Customize the API commands with application specific defines */
    RF_cmdPropCs.rssiThr = RSSI_THRESHOLD_DBM;
    RF_cmdPropCs.csEndTime = (IDLE_TIME_US + 150) * 4; /* Add some margin */
    RF_cmdCountBranch.counter = CS_RETRIES_WHEN_BUSY;

    /* Request access to the radio */
#if defined(DeviceFamily_CC26X0R2)
    rfHandle = RF_open(&rfObject, &RF_prop, (RF_RadioSetup*)&RF_cmdPropRadioSetup, &rfParams);
#else
    rfHandle = RF_open(&rfObject, &RF_prop, (RF_RadioSetup*)&RF_cmdPropRadioDivSetup, &rfParams);
#endif// DeviceFamily_CC26X0R2

    /* Set the frequency */
    RF_postCmd(rfHandle, (RF_Op*)&RF_cmdFs, RF_PriorityNormal, NULL, 0);

    /* Get current time */
    time = RF_getCurrentTime();

    /* Run forever */
    while(true)
    {
        /* Create packet with incrementing sequence number & random payload */
        packet[0] = (uint8_t)(seqNumber >> 8);
        packet[1] = (uint8_t)(seqNumber);
        uint8_t i;
        for (i = 2; i < PAYLOAD_LENGTH; i++)
        {
            packet[i] = rand();
        }

        /* Set absolute TX time to utilize automatic power management */
        time += (PACKET_INTERVAL_US * 4);
        RF_cmdNop.startTime = time;

        /* Send packet */
        RF_runCmd(rfHandle, (RF_Op*)&RF_cmdNop, RF_PriorityNormal,
                  &callback, 0);

        RF_cmdNop.status = IDLE;
        RF_cmdPropCs.status = IDLE;
        RF_cmdCountBranch.status = IDLE;
        RF_cmdPropTx.status = IDLE;
        RF_cmdCountBranch.counter = CS_RETRIES_WHEN_BUSY;
    }
}

/*
 *  ======== callback ========
 */
void callback(RF_Handle h, RF_CmdHandle ch, RF_EventMask e)
{
    if ((e & RF_EventLastCmdDone) && (RF_cmdPropTx.status == PROP_DONE_OK))
    {
        seqNumber++;
        PIN_setOutputValue(ledPinHandle, Board_PIN_LED1,
                           !PIN_getOutputValue(Board_PIN_LED1));
    }
}

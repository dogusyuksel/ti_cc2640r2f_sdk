/*
 * Copyright (c) 2015-2017, Texas Instruments Incorporated
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

#ifndef TASKS_CONCENTRATORTASK_H_
#define TASKS_CONCENTRATORTASK_H_

/// ConcentratorTask OAD status codes
typedef enum {
    ConcentratorTask_NodeOadStatus_None = 0,      ///< No OAD in progress
    ConcentratorTask_NodeOadStatus_ResetComplete, ///< OAD ready
    ConcentratorTask_NodeOadStatus_InProgress,    ///< OAD in progress
    ConcentratorTask_NodeOadStatus_Completed,     ///< OAD complete
    ConcentratorTask_NodeOadStatus_Aborted,       ///< OAD abort
} ConcentratorTask_NodeOadStatus_t;

/* Create the ConcentratorRadioTask and creates all TI-RTOS objects */
void ConcentratorTask_init(void);

/* Update nodes current FW version for display */
void ConcentratorTask_updateNodeFWVer(uint8_t addr, char* fwVerStr);

/* Update available OAD status for display */
void ConcentratorTask_updateNodeOadStatus(ConcentratorTask_NodeOadStatus_t status);

/* Update available FW version for display */
void ConcentratorTask_updateAvailableFWVer(bool success);

/* Update nodes OAD block during OAD for display */
void ConcentratorTask_updateNodeOadBlock(uint8_t addr, uint16_t block);

/* Set node status and trigger OAD image transfer */
void ConcentratorTask_setNodeOadStatusReset(void);

#endif /* TASKS_CONCENTRATORTASK_H_ */

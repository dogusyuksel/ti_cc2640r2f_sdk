/******************************************************************************

 @file  displayservice.h

 @brief Display Service for SensorTag LCD DevPack

 Group: WCS, BTS
 Target Device: cc2640r2

 ******************************************************************************
 
 Copyright (c) 2015-2024, Texas Instruments Incorporated
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

#ifndef DISPLAYSERVICE_H
#define DISPLAYSERVICE_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */
#include "st_util.h"

/*********************************************************************
 * CONSTANTS
 */

// Service UUID
#define DISPLAY_SERV_UUID              0xAD00 // F000AD00-0451-4000-B000-00000000-0000
#define DISPLAY_DATA_UUID              0xAD01
#define DISPLAY_CONF_UUID              0xAD02

// Attribute Identifiers
#define DISPLAY_DATA                   0
#define DISPLAY_CONF                   1

// Attribute sizes
#define DISPLAY_DATA_LEN               16 // Display text
#define DISPLAY_BUFFER_LEN             (DISPLAY_DATA_LEN +1)  // Includes '\0'
#define DISPLAY_CONF_LEN               3  // Control sequence: cmd, line, col

// Offsets in command buffer
#define DISPLAY_CMD_OFFSET             0
#define DISPLAY_LINE_OFFSET            1
#define DISPLAY_COL_OFFSET             2

// Control commands
#define DISPLAY_CONF_NONE              0  // Do nothing
#define DISPLAY_CONF_OFF               1  // Turn off
#define DISPLAY_CONF_ON                2  // Turn on
#define DISPLAY_CONF_CLR               3  // Clear
#define DISPLAY_CONF_CLR_LINE          4  // Clear line (line)
#define DISPLAY_CONF_INV               5  // Invert
#define DISPLAY_CONF_MOV               6  // Set cursor position (line, column)

#define DISPLAY_CONF_MAX               6

// Display dimensions
#define DISPLAY_MAX_LINES             12
#define DISPLAY_MAX_COLUMNS           16

/*********************************************************************
 * TYPEDEFS
 */

/*********************************************************************
 * MACROS
 */


/*********************************************************************
 * API FUNCTIONS
 */


/*
 * Display_addService- Initializes the Sensor GATT Profile service by registering
 *          GATT attributes with the GATT server.
 */
extern bStatus_t Display_addService(void);

/*
 * Display_registerAppCBs - Displays the application callback function.
 *                    Only call this function once.
 *
 *    appCallbacks - pointer to application callbacks.
 */
extern bStatus_t Display_registerAppCBs(sensorCBs_t *appCallbacks);

/*
 * Display_setParameter - Set a Sensor GATT Profile parameter.
 *
 *    param - Profile parameter ID
 *    len   - length of data to write
 *    value - pointer to data to write.  This is dependent on
 *          the parameter ID and WILL be cast to the appropriate
 *          data type (example: data type of uint16_t will be cast to
 *          uint16_t pointer).
 */
extern bStatus_t Display_setParameter(uint8_t param, uint8_t len, void *value);

/*
 * Display_getParameter - Get a Sensor GATT Profile parameter.
 *
 *    param - Profile parameter ID
 *    value - pointer to data to read.  This is dependent on
 *          the parameter ID and WILL be cast to the appropriate
 *          data type (example: data type of uint16_t will be cast to
 *          uint16_t pointer).
 */
extern bStatus_t Display_getParameter(uint8_t param, void *value);


/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* DISPLAYSERVICE_H */

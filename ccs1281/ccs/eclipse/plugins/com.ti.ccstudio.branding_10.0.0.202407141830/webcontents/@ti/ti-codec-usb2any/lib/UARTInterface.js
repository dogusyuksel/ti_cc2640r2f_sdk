"use strict";
/* eslint-disable @typescript-eslint/camelcase */
/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:\
 *
 *  *   Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *  *   Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// import { USB2ANY, Command, parseNumberProperty, parseStringProperty, getPayload } from './Usb2anyCodec';
// import { AbstractDataDecoder, IDataEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { binaryDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
// const parityMap = { 'none': 0, 'even': 1, 'odd': 2 };
// const bitDirectionMap = { 'lsb': 0, 'msb': 1 };
// const UART_9600_bps   = 0;
// const UART_19200_bps  = 1;
// const UART_38400_bps  = 2;
// const UART_57600_bps  = 3;
// const UART_115200_bps = 4;
// const UART_230400_bps = 5;
// const UART_300_bps    = 6;
// const UART_320_bps    = 7;
// const UART_600_bps    = 8;
// const UART_1200_bps   = 9;
// const UART_2400_bps   = 10;
// const UART_4800_bps   = 11;
// const getResult = function(array: number[])  {
//     let result = 0;
//     for (let i = 0; i < array.length; i++) {
//         result = (result << 8) | (array[i] & 0xff);
//     }
//     return result;
// };
// export interface IU2aUartParams extends ICodecBaseParams {
//     baudRate: number;
//     parity: 'none' | 'even' | 'odd';
//     bitDirection: 'lsb' | 'msb';
//     characterLength: 7 | 8;
//     stopBits: 1 | 2;
// }
// /**
//  * UART sub-module implementation
//  *
//  * In v2, TMP144 case custom codec: u2a <--> UartInterface <--> appCustomCodec (based from gc.databind.IPollingPacketCodec)
//  * The appCustomCodec implements readValue/writeValue for read/write registers, and passes the read/write data
//  * as a payload to uartInterace, which propagates to u2a.sendCommandPacket(Cmd_UART_Write, readWritePayload)
//  * The appCustomCodec also sends some commands during connect() to initialize and calibrate the hw system.
//  *
//  * In v3, TMP144 code: u2a <--> appCustomCodec (based from UartInterface)
//  * The appCustomCodec can derive from UartInterface and implement IReadWriteValueEncoder<RegisterInfo>.
//  * It can use txUartData to achieve u2a.sendCommandPacket(Cmd_UART_Write, readWritePayload).
//  * The appCustomDecoder can extend configureFirmware() to initialize and calibrate the hw system.
//  */
// export class UARTInterface extends AbstractDataDecoder<Uint8Array, Uint8Array> {
//     private u2a: USB2ANY;
//     constructor(protected settings: IU2aUartParams) {
//         super(settings.id || 'uart', binaryDataType, binaryDataType);
//     }
//     deconfigure() {
//         // called by CodecRegistry before connect
//         super.deconfigure();
//         this.u2a = undefined;
//     }
//     setParentEncoder(parent: IDataEncoder<Uint8Array, Uint8Array>) {
//         super.setParentEncoder(parent);
//         if (parent instanceof USB2ANY) {
//             this.u2a = parent;
//             this.u2a.mapPayloadResponseToDecoder(Command.Cmd_UART_Read, this);
//         }
//     }
//     configureFirmware(settings: IU2aUartParams): Promise<void> {
//         let baudRate = UART_9600_bps;
//         switch (+settings.baudRate) {
//             case 19200:
//                 baudRate = UART_19200_bps;
//                 break;
//             case 38400:
//                 baudRate = UART_38400_bps;
//                 break;
//             case 57600:
//                 baudRate = UART_57600_bps;
//                 break;
//             case 115200:
//                 baudRate = UART_115200_bps;
//                 break;
//             case 230400:
//                 baudRate = UART_230400_bps;
//                 break;
//             case 300:
//                 baudRate = UART_300_bps;
//                 break;
//             case 320:
//                 baudRate = UART_320_bps;
//                 break;
//             case 600:
//                 baudRate = UART_600_bps;
//                 break;
//             case 1200:
//                 baudRate = UART_1200_bps;
//                 break;
//             case 2400:
//                 baudRate = UART_2400_bps;
//                 break;
//             case 4800:
//                 baudRate = UART_4800_bps;
//                 break;
//         }
//         const parity = parseStringProperty('parity', settings.parity, parityMap);
//         const bitDirection = parseStringProperty('bitDirection', settings.bitDirection, bitDirectionMap);
//         const characterLength = 8 - parseNumberProperty('characterLength', settings.characterLength || 8, 7, 8);
//         const stopBits = parseNumberProperty('stopBits', settings.stopBits || 1, 1, 2) === 1 ? 0 : 1;
//         this.u2a.sendCommandPacket(Command.Cmd_UART_Control,
//             Uint8Array.from([
//                 baudRate, parity, bitDirection, characterLength, stopBits
//             ]));
//         this.u2a.sendCommandPacket(Command.Cmd_UART_SetMode, Uint8Array.from([0]));
//         return Promise.resolve();
//     }
//     // Derived class implementing IReadWriteValueEncoder.readValue/writeValue can use txUartData
//     txUartData(payload: Uint8Array) {
//         this.u2a.sendCommandPacket(Command.Cmd_UART_Write, payload);
//     }
//     rxUartData(payload: Uint8Array): boolean | Error {
//         // Derived class should override this method to consume payload.
//         // For e.g., if the payload is the response of reading a register,
//         // convert the payload to register value, and use the deferred promise to resolve
//         // the converted register value
//         return true;
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return this.rxUartData(getPayload(data));
//     }
// }
//# sourceMappingURL=UARTInterface.js.map
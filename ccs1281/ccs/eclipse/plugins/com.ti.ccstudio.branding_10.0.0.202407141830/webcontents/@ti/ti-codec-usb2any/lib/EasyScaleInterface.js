"use strict";
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
// import { USB2ANY, Command, parseNumberProperty, setBytes, getResult } from './Usb2anyCodec';
// import { AbstractDataDecoder, IDataEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { binaryDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// export interface IU2aEasyScaleParams extends ICodecBaseParams {
//     speed: 50 | 100 | 200 | 400;
//     dataBits: number;
//     ack: 0 | 1;
//     lowerThreshold: number;
//     upperThreshold: number;
// }
// /**
//  * EasyScale Interface sub-module definition
//  */
// export class EasyScaleInterface extends AbstractDataDecoder<Uint8Array, Uint8Array>  {
//     speed: number;
//     numBytes: number;
//     numBits: number;
//     ack: number;
//     private u2a: USB2ANY;
//     constructor(protected settings: IU2aEasyScaleParams) {
//         super(settings.id || 'easyscale', binaryDataType, binaryDataType);
//         this.speed = 0;
//         switch (settings.speed) {
//             case 50:
//                 this.speed = 1;
//                 break;
//             case 100:
//                 this.speed = 2;
//                 break;
//             case 200:
//                 this.speed = 3;
//                 break;
//             case 400:
//                 this.speed = 4;
//                 break;
//         }
//         this.numBytes = Math.floor(settings.dataBits/8);
//         this.numBits = settings.dataBits - 8*this.numBytes;
//         this.ack = settings.ack ? 1 : 0;
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
//         }
//     }
//     configureFirmware(settings: IU2aEasyScaleParams): Promise<void> {
//         /* TODO
//         if (settings.hasOwnProperty('bindName')) {
//             this.registerModel.getRegisterInfo('u2a.easyscale.' + settings.bindName).comm = this;
//         }
//         */
//         const upperThreshold = parseNumberProperty('upperThreshold', settings.upperThreshold || 0, 0, 3.3);
//         const lowerThreshold = parseNumberProperty('lowerThreshold', settings.lowerThreshold || 0, 0, 3.3);
//         const upperHex = Math.round((upperThreshold / 3.3) * 255);
//         const lowerHex = Math.round((lowerThreshold / 3.3) * 255);
//         this.u2a.sendCommandPacket(Command.Cmd_EasyScale_Control, Uint8Array.from([upperHex, lowerHex]));
//         return Promise.resolve();
//     }
//     read(): Promise<bindValueType> {
//         return this.u2a.readResponse(
//             this.u2a.sendCommandPacket(Command.Cmd_EasyScale_Read, Uint8Array.from([this.speed, this.numBytes, this.numBits])))
//             .then(getResult);
//     }
//     write(value: number): Promise<void> {
//         const writeData: number[] = [];
//         const valueBytes: number[] = [];
//         const valueNumBytes = value.toString(16).length/2;
//         // Split the value into an array of bytes
//         setBytes(valueBytes, valueNumBytes, value, 0);
//         // Write data should contain the following:
//         // [numBytes, value[0:numBytes]..., numBits, value[numBytes:numBytes+numBits]..., speed, ack]
//         writeData.push(this.numBytes);
//         for (let i = 0; i < this.numBytes + this.numBits; i++) {
//             if (i === this.numBytes) {
//                 writeData.push(this.numBits);
//             }
//             writeData.push(valueBytes[i] ? valueBytes[i] : 0);
//         }
//         writeData.push(this.speed);
//         writeData.push(this.ack);
//         this.u2a.sendCommandPacket(Command.Cmd_EasyScale_Write, Uint8Array.from(writeData));
//         return Promise.resolve();
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return true;
//     }
// }
//# sourceMappingURL=EasyScaleInterface.js.map
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
// import { USB2ANY, Command, parseNumberProperty, parseStringProperty } from './Usb2anyCodec';
// import { AbstractDataDecoder, IDataEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { binaryDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
// const modeControlMap = {'stop': 0, 'up': 1, 'continuous': 2, 'up_down': 3};
// const outputMode1Map = {'bit_value': 0, 'set': 1, 'toggle_reset': 2, 'set_reset': 3, 'toggle': 4, 'reset': 5, 'toggle_set': 6, 'reset_set': 7};
// export interface IU2aPWMParams extends ICodecBaseParams {
//     modeControl: 'stop' | 'up' | 'continuous' | 'up_down';
//     whichPWM: 0 | 1 | 2 | 3;
//     inputDivider: number;
//     compareRegister0: number;
//     outputMode1: string;
//     compareRegister1: number;
//     inputDividerEX: number;
// }
// /**
//  * PWM sub-module implementation
//  */
// export class PWMInterface extends AbstractDataDecoder<Uint8Array, Uint8Array> {
//     private u2a: USB2ANY;
//     constructor(protected settings: IU2aPWMParams) {
//         super(settings.id || 'pwm', binaryDataType, binaryDataType);
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
//     configureFirmware(settings: IU2aPWMParams): Promise<void> {
//         // whichPWM is required to send the control command
//         // if it is not provided, no control is sent
//         if (settings.whichPWM === undefined) {
//             return Promise.resolve();
//         }
//         const modeControl = parseStringProperty('modeControl', settings.modeControl || 'up', modeControlMap);
//         const whichPWM = parseNumberProperty('whichPWM', settings.whichPWM, 0, 3);
//         const compareRegister0 = parseNumberProperty('compareRegister0', settings.compareRegister0 || 0, 0);
//         const outputMode1 = parseStringProperty('outputMode1', settings.outputMode1 || 'reset_set', outputMode1Map);
//         const compareRegister1 = parseNumberProperty('compareRegister1', settings.compareRegister1 || 0, 0);
//         const inputDividerEX = parseNumberProperty('inputDividerEX', settings.inputDividerEX || 1, 1, 8) - 1;
//         let inputDivider = parseNumberProperty('inputDivider', settings.inputDivider || 1);
//         switch (inputDivider) {
//             case 1:
//                 inputDivider = 0;
//                 break;
//             case 2:
//                 inputDivider = 1;
//                 break;
//             case 4:
//                 inputDivider = 2;
//                 break;
//             case 8:
//                 inputDivider = 3;
//                 break;
//             default:
//                 throw 'Invalid value for inputDivider. Value must be 1, 2, 4 or 8.';
//         }
//         this.u2a.sendCommandPacket(Command.Cmd_PWM_Write_Control,
//             Uint8Array.from([
//                 whichPWM, modeControl, inputDivider,
//                 (compareRegister0 >> 8) & 0xff, compareRegister0 & 0xff,
//                 outputMode1,
//                 (compareRegister1 >> 8) & 0xff, compareRegister1 & 0xff,
//                 inputDividerEX
//             ]));
//         return Promise.resolve();
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return true;
//     }
// }
//# sourceMappingURL=PWMInterface.js.map
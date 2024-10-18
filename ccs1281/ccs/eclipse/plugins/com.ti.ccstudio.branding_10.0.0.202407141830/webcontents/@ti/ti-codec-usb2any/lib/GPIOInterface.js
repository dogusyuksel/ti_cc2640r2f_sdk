"use strict";
/* eslint-disable no-prototype-builtins */
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
// import { USB2ANY, Command, parseNumberProperty, parseStringProperty, getResult, InRegDefs } from './Usb2anyCodec';
// import { AbstractDataDecoder, IDataEncoder, INoopDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { binaryDataType, IEncoderType, IDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { IPin, IPinEncoder } from '../../ti-model-pin/lib/PinModel';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// const modeMap = { 'output': 1, 'input': 2 };
// const resistorMap = { 'pullup': 1, 'pulldown': 2 };
// const pinStateMap = { 'high': 2, 'low': 1 };
// export interface IU2aGPIOParams extends ICodecBaseParams {
//     pin: number;
//     mode: 'output' | 'input';
//     state: 'high' | 'low';
//     resistor: 'pullup' | 'pulldown';
//     bindName: string;
// }
// /**
//  * GPIO sub-module implementation
//  */
// export class GPIOInterface extends AbstractDataDecoder<Uint8Array, Uint8Array> implements IPinEncoder {
//     encoderInputType: IEncoderType<IPinEncoder>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     private u2a: USB2ANY;
//     private pin = 0;
//     constructor(protected settings: IU2aGPIOParams) {
//         super(settings.id || 'gpio', binaryDataType, binaryDataType);
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
//     addChildDecoder(child: INoopDecoder): void {
//     }
//     configureFirmware(gpioPin: IU2aGPIOParams): Promise<void> {
//         // if (gpioPin.hasOwnProperty('bindName')) {
//         //     this.registerModel.getRegisterInfo('u2a.gpio.'+gpioPin.bindName).comm = this;
//         // }
//         if (gpioPin.hasOwnProperty('pin')) {
//             const pin = parseNumberProperty('pin, in the GPIO interface', gpioPin.pin, 0, 12);
//             this.pin = pin;
//             if (gpioPin.hasOwnProperty('mode')) {
//                 let pinFunction = parseStringProperty('mode', gpioPin.mode, modeMap);
//                 if (gpioPin.hasOwnProperty('resistor')) {
//                     if (pinFunction === modeMap.input) {
//                         pinFunction += parseStringProperty('resistor', gpioPin.resistor, resistorMap);
//                     } else {
//                         throw 'GPIO pin ' + pin + '  with "output" mode, ' + InRegDefs + ' cannot have a "resistor" field.';
//                     }
//                 }
//                 this.u2a.sendCommandPacket(Command.Cmd_GPIO_SetPort, Uint8Array.from([ pin, pinFunction ]));
//             }
//             if (gpioPin.hasOwnProperty('state')) {
//                 const state = parseStringProperty('state, in the GPIO interface', gpioPin.state, pinStateMap);
//                 this.u2a.sendCommandPacket(Command.Cmd_GPIO_WritePort, Uint8Array.from([ pin, state ]));
//             }
//         } else {
//             throw 'GPIO interface is missing a pin field to identify the specific gpio pin instance.';
//         }
//         return Promise.resolve();
//     }
//     read(pinInfo: IPin): Promise<bindValueType> {
//         return this.u2a.readResponse(this.u2a.sendCommandPacket(Command.Cmd_GPIO_ReadPort, Uint8Array.from([this.pin]))).then(getResult);
//     }
//     write(gpioInfo: IPin, value: number): Promise<void> {
//         this.u2a.sendCommandPacket(Command.Cmd_GPIO_WritePort, Uint8Array.from([this.pin, value ? 2 : 1]));
//         return Promise.resolve();
//     }
//     writePulse(gpioInfo: IPin, isPulseHigh: boolean, microSeconds: number) {
//         this.u2a.sendCommandPacket(Command.Cmd_GPIO_WritePulse, Uint8Array.from([this.pin, isPulseHigh ? 1 : 0, (microSeconds >> 8) & 0xff, microSeconds & 0xff]));
//         return Promise.resolve();
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return true;
//     }
//     // initSymbolsForDevice(settings: any, registerModel: RegisterModel): void {
//     //     if (settings.hasOwnProperty('bindName')) {
//     //         let registerInfo = {
//     //             comm: undefined,
//     //             uri: 'u2a.gpio.' + settings.bindName,
//     //         };
//     //         if (settings.mode && settings.mode === 'input') {
//     //             registerInfo.type = 'readonly';
//     //         } else if (settings.mode && settings.mode === 'output') {
//     //             registerInfo.type = 'nonvolatile';
//     //         }
//     //         registerModel.addPseudoRegister(registerInfo.uri, registerInfo);
//     //     }
//     // }
// }
//# sourceMappingURL=GPIOInterface.js.map
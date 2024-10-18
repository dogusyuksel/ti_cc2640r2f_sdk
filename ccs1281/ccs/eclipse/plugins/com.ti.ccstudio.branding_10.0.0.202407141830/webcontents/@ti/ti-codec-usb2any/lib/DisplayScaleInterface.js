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
// import { RegisterInfo } from '../../ti-model-register/lib/RegisterDataModel';
// import { USB2ANY, Command, parseNumberProperty, getResult } from './Usb2anyCodec';
// import { AbstractDataDecoder, INoopDecoder, IDataEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { IReadWriteValueEncoder } from '../../ti-core-databind/lib/IPollingDataModel';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { IEncoderType, IDecoderType, binaryDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// export interface IU2aDisplayScaleParams extends ICodecBaseParams {
//     speed: 15 | 50 | 100;
//     options: 0 | 1 | 2;
// }
// /**
//  * DisplayScale Interface sub-module definition
//  */
// export class DisplayScaleInterface extends AbstractDataDecoder<Uint8Array, Uint8Array> implements IReadWriteValueEncoder<RegisterInfo>  {
//     encoderInputType: IEncoderType<IReadWriteValueEncoder<RegisterInfo>>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     private u2a: USB2ANY;
//     constructor(protected settings: IU2aDisplayScaleParams) {
//         super(settings.id || 'displayscale', binaryDataType, binaryDataType);
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
//     configureFirmware(settings: IU2aDisplayScaleParams): Promise<void> {
//         const speed = parseNumberProperty('speed', settings.speed || 100);
//         const options = parseNumberProperty('options', settings.options || 0, 0, 2);
//         if (speed !== 15 && speed !== 50 && speed !== 100) {
//             throw 'Invalid value for speed. Value must be 15, 50 or 100.';
//         }
//         this.u2a.sendCommandPacket(Command.Cmd_DisplayScale_Set,
//             Uint8Array.from([
//                 (options >> 8) & 0xff,
//                 options & 0xff,
//                 (speed >> 8) & 0xff,
//                 speed & 0xff
//             ]));
//         return Promise.resolve();
//     }
//     readValue(registerInfo: RegisterInfo, coreIndex: number): Promise<bindValueType> {
//         return this.u2a.readResponse(
//             this.u2a.sendCommandPacket(Command.Cmd_DisplayScale_ReadReg, Uint8Array.from([registerInfo.addr & 0xff])))
//             .then(getResult);
//     }
//     writeValue(registerInfo: RegisterInfo, value: number, coreIndex: number): Promise<void> {
//         const writeData = [registerInfo.addr & 0xff, value & 0xff];
//         this.u2a.sendCommandPacket(Command.Cmd_DisplayScale_WriteReg, Uint8Array.from(writeData));
//         return Promise.resolve();
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return true;
//     }
// }
//# sourceMappingURL=DisplayScaleInterface.js.map
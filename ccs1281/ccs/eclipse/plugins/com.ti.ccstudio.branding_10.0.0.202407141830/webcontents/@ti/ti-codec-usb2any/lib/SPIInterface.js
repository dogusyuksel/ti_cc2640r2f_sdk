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
// import { RegisterInfo, RegisterModel } from '../../ti-model-register/lib/RegisterDataModel';
// import { USB2ANY, Command, parseNumberProperty, parseStringProperty, getResult, setBytes, computeParity } from './Usb2anyCodec';
// import { AbstractDataDecoder, INoopDecoder, IDataEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { IReadWriteValueEncoder } from '../../ti-core-databind/lib/IPollingDataModel';
// import { IEncoderType, IDecoderType, binaryDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// export interface IU2aSPIParams extends ICodecBaseParams {
//     // For configure firmware
//     clockPhase: 'following' | 'first';
//     clockPolarity: 'low' | 'high';
//     bitDirection: 'lsb' | 'msb';
//     characterLength: 7 | 8;
//     latchType: 'byte' | 'packet' | 'word' | 'no_cs' | 'pulse_after_packet';
//     latchPolarity: 'high' | 'low';
//     clockDivider: number;
//     // For read or write
//     readBitOffset: number; // exclusive with writeBitOffset
//     writeBitOffset: number; // exclusive with readBitOffset
//     addrsBits: number;
//     addrsBitsOffset: number;
//     dataBits: number;
//     dataBitsOffset: number;
//     parity: 'odd' | 'even';
//     parityBitsOffset: number;
// }
// /**
//  * SPI Interface sub-module definition
//  */
// export class SPIInterface extends AbstractDataDecoder<Uint8Array, Uint8Array> implements IReadWriteValueEncoder<RegisterInfo> {
//     encoderInputType: IEncoderType<IReadWriteValueEncoder<RegisterInfo>>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     private u2a: USB2ANY;
//     dataBitsMask: number;
//     dataBitsOffset: number;
//     addrsBitsMask: number;
//     addrsBitsOffset: number;
//     parity?: number | undefined;
//     parityBitsOffset: number;
//     writeFlag: number;
//     readFlag: number;
//     readWriteData: Uint8Array;
//     constructor(protected settings: IU2aSPIParams, registerModel: RegisterModel) {
//         super(settings.id || 'spi', binaryDataType, binaryDataType);
//         const dataBits = settings.dataBits !== undefined ? settings.dataBits : 8;
//         this.dataBitsMask = (1 << dataBits) -1;
//         this.dataBitsOffset = settings.dataBitsOffset || 0;
//         const addrsBits = settings.addrsBits !== undefined ? settings.addrsBits : 6;
//         this.addrsBitsMask = (1 << addrsBits) - 1;
//         this.addrsBitsOffset = settings.addrsBitsOffset || 8;
//         const parityMap = { 'even': 0, 'odd': 1 };
//         if (settings.parity) {
//             this.parity = parseStringProperty('parity', settings.parity || 'even', parityMap);
//         }
//         this.parityBitsOffset = settings.parityBitsOffset || 0;
//         let bitSize;
//         this.writeFlag = 0;
//         this.readFlag = 0;
//         if (settings.readBitOffset !== undefined) {
//             bitSize = settings.readBitOffset;
//             this.readFlag = 1 << bitSize;
//         } else if (settings.writeBitOffset !== undefined) {
//             bitSize = settings.writeBitOffset;
//             this.writeFlag = 1 << bitSize;
//         } else {
//             bitSize = 14;
//             this.writeFlag = 1 << bitSize;
//         }
//         bitSize = Math.max(bitSize,
//             addrsBits + this.addrsBitsOffset, dataBits + this.dataBitsOffset, this.parityBitsOffset);
//         const byteSize = (bitSize+7)>>3;
//         this.readWriteData = new Uint8Array(1 + byteSize);
//         this.readWriteData[0] = byteSize;
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
//     configureFirmware(settings: IU2aSPIParams): Promise<void> {
//         const clockPhaseMap = { 'following': 0, 'first': 1 };
//         const clockPolarityMap = { 'low': 0, 'high': 1 };
//         const bitDirectionMap = { 'lsb': 0, 'msb': 1 };
//         const latchTypeMap = { 'byte': 0, 'packet': 1, 'word': 2, 'no_cs': 3, 'pulse_after_packet': 255 };
//         const latchPolarityMap = { 'high': 0, 'low': 1 };
//         const clockPhase = parseStringProperty('clockPhase', settings.clockPhase || 'first', clockPhaseMap);
//         const clockPolarity = parseStringProperty('clockPolarity', settings.clockPolarity || 'low', clockPolarityMap);
//         const bitDirection = parseStringProperty('bitDirection', settings.bitDirection || 'MSB', bitDirectionMap);
//         const characterLength = 8 - parseNumberProperty('characterLength', settings.characterLength || 8, 7, 8);
//         const latchType = parseStringProperty('latchType', settings.latchType || 'packet', latchTypeMap);
//         const latchPolarity = parseStringProperty('latchPolarity', settings.latchPolarity || 'low', latchPolarityMap);
//         const divider = settings.clockDivider || 1;
//         const dividerHigh = (divider >>> 8 ) & 0xFF;
//         const dividerLow = divider & 0xFF;
//         this.u2a.sendCommandPacket(Command.Cmd_SPI_Control, Uint8Array.from([
//             clockPhase, clockPolarity, bitDirection, characterLength, latchType, latchPolarity, dividerHigh, dividerLow
//         ]));
//         return Promise.resolve();
//     }
//     private getDataResult(data: number[]) {
//         const command = getResult(data);
//         if (this.parity !== undefined && this.parity !== computeParity(command, this.readWriteData[0] * 8)) {
//             throw 'parity error on register data received';
//         }
//         return (command >>> this.dataBitsOffset) & this.dataBitsMask;
//     }
//     readValue(registerInfo: RegisterInfo, coreIndex: number): Promise<bindValueType> {
//         let command = this.readFlag | (((registerInfo.addr || 0) & this.addrsBitsMask) << this.addrsBitsOffset);
//         if (this.parity !== undefined) {
//             const parity = this.parity ^ computeParity(command, this.readWriteData[0] * 8);
//             command = command | (parity << this.parityBitsOffset);
//         }
//         setBytes(this.readWriteData, this.readWriteData[0], command, 1);
//         return this.u2a.readResponse(this.u2a.sendCommandPacket(Command.Cmd_SPI_WriteAndRead, this.readWriteData)).then(this.getDataResult);
//     }
//     writeValue(registerInfo: RegisterInfo, value: number, coreIndex: number): Promise<void> {
//         let command = this.writeFlag |
//                         (((registerInfo.addr || 0) & this.addrsBitsMask) << this.addrsBitsOffset) |
//                         ((value & this.dataBitsMask) << this.dataBitsOffset);
//         if (this.parity !== undefined) {
//             const parity = this.parity ^ computeParity(command,  this.readWriteData[0] * 8);
//             command = command | (parity << this.parityBitsOffset);
//         }
//         setBytes(this.readWriteData, this.readWriteData[0], command, 1);
//         this.u2a.sendCommandPacket(Command.Cmd_SPI_WriteAndRead, this.readWriteData);
//         return Promise.resolve();
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return true;
//     }
// }
//# sourceMappingURL=SPIInterface.js.map
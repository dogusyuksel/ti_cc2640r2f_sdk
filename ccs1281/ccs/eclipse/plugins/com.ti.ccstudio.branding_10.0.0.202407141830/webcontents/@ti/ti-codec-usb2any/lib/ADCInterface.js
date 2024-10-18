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
// import { USB2ANY, Command, parseNumberProperty, parseStringProperty, getPayload, PACKET_COMMAND, PACKET_PAYLOAD } from './Usb2anyCodec';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { IDataEncoder, IDataDecoder, AbstractDataCodec } from '../../ti-target-configuration/lib/AbstractCodec';
// import { binaryDataType, DecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// export interface IU2aADCParams extends ICodecBaseParams {
//     interval: number;
//     samples: number;
//     voltageReference: '1v5' | '2v5' | '3v3' | 'external';
// }
// export interface IChannelData {
//     [channel: string]: number[];
// }
// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface IADCDecoder extends IDataDecoder<IChannelData, Uint8Array> {
// }
// export interface IADCEncoder extends IDataEncoder<IChannelData, Uint8Array> {
//     read(): Promise<bindValueType>; // use Cmd_ADC_Acquire to acquire data
// }
// export const IChannelDataAsDecoderType = new DecoderType<IDataDecoder<IChannelData, Uint8Array>>('IChannelData');
// /**
//  * ADC Interface sub-module definition
//  *
//  * u2a <--> ADC Interface <--> decoder that can consume channel data
//  * ADC Interface decode the payload of u2a packet to IChannelData
//  * and propagate the channel data to the decoder.
//  */
// export class ADCInterface extends AbstractDataCodec<Uint8Array, Uint8Array, IChannelData, Uint8Array> implements IADCEncoder {
//     interval: number = 0;
//     samples: number = 0;
//     enabledChannels: number[] = [];
//     acquiredData: number[] = [];
//     private u2a: USB2ANY;
//     constructor(settings: IU2aADCParams) {
//         super(settings.id || 'adc', binaryDataType, binaryDataType, IChannelDataAsDecoderType, binaryDataType);
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
//             this.u2a.mapPayloadResponseToDecoder(Command.Cmd_ADC_GetData, this);
//             this.u2a.mapPayloadResponseToDecoder(Command.Cmd_ADC_GetStatus, this);
//         }
//     }
//     configureFirmware(settings: IU2aADCParams): Promise<void> {
//         this.interval = parseNumberProperty('interval', settings.interval || 1000, 5, 32767);
//         this.samples = parseNumberProperty('samples', settings.samples || 1, 1);
//         this.enabledChannels = [];
//         for (let i = 0; i < 4; i++) {
//             if (settings['adc' + i])
//                 this.enabledChannels.push(i);
//         }
//         const nChannel = (settings['adc0'] ? 1:0) | (settings['adc1'] ? 2:0) | (settings['adc2'] ? 4:0) | (settings['adc3'] ? 8:0);
//         const voltageReferenceMap = {'1v5': 0, '2v5': 1, '3v3': 2, 'external': 3};
//         const vref = parseStringProperty('voltageReference', settings.voltageReference || '2V5', voltageReferenceMap);
//         // Enable/disable specified ADC channels - ADC_Enable(nChannel, nMode)
//         // Set reference voltage used for ADC conversion - ADC_SetReference(vRef)
//         return this.u2a.readResponse(this.u2a.sendCommandPacket(Command.Cmd_ADC_Enable, Uint8Array.from([nChannel, 2]))).then(() => {
//             return this.u2a.readResponse(this.u2a.sendCommandPacket(Command.Cmd_ADC_SetReference, Uint8Array.from([vref])));
//         });
//     };
//     read(): Promise<bindValueType> {
//         this.acquiredData = [];
//         // Trigger ADC conversions on the enabled channels - ADC_Acquire(interval1, interval2, interval3, numSamples1, numSamples2)
//         this.u2a.sendCommandPacket(Command.Cmd_ADC_Acquire, Uint8Array.from[
//             (this.interval >> 16) & 0xff,
//             (this.interval >> 8) & 0xff,
//             this.interval & 0xff,
//             (this.samples >> 8) & 0xff,
//             this.samples & 0xff
//         ]);
//         return Promise.resolve();
//     }
//     convertToChannelData(data: Uint8Array): IChannelData | undefined {
//         if (!this.acquiredData)
//             return;
//         this.acquiredData = this.acquiredData.concat([...data]);
//         // Expected total payload length = 2 bytes/sample * numSamples * numChannels
//         if (this.acquiredData.length === 2 * this.samples * this.enabledChannels.length) {
//             let channel = 0;
//             const result: IChannelData = {};
//             for (let i = 0; i < this.acquiredData.length; i+=2) {
//                 const adcChannel = 'adc' + this.enabledChannels[channel];
//                 result[adcChannel] = result[adcChannel] ? result[adcChannel] : [];
//                 result[adcChannel].push((this.acquiredData[i+1] << 8) | this.acquiredData[i]);
//                 channel = (channel+1) >= this.enabledChannels.length ? 0 : channel+1;
//             }
//             return result;
//         }
//     }
//     rxADCData(data: IChannelData): boolean | Error {
//         return this.targetDecoder.decode(data);
//     }
//     decode(data: Uint8Array): boolean | Error {
//         const cmd = data[PACKET_COMMAND];
//         if (cmd === Command.Cmd_ADC_GetStatus) {
//             const param = data[PACKET_PAYLOAD + 3];
//             if (param !== 0) {
//                 // Received ADC_GetStatus packet indicating data is ready
//             }
//         } else if (cmd === Command.Cmd_ADC_GetData) {
//             const channelData = this.convertToChannelData(getPayload(data));
//             if (channelData !== undefined) {
//                 return this.rxADCData(channelData);
//             }
//         }
//         return true;
//     }
//     encode(data: Uint8Array): void {
//         this.targetEncoder.encode(data);
//     }
// }
//# sourceMappingURL=ADCInterface.js.map
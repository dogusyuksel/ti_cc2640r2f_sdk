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
// In GC v3, we should not provide this class as one of our built-in interface codec
// for aevm. We should provide an example showing how to implement a custom interface
// that can be used by aevm. Comment out this file.
// import { IDeferedPromise } from '../../ti-core-assets/lib/TiPromise';
// import { AevmPacket, AEVMCodec } from './AEVMCodec';
// import { OCFBase, PacketHandlerType } from './OCFBase';
// Reference ocf_common.h
// #define Custom_Interface       0x1A and any other values
// typedef enum
// {
//    ocCmd_Custom_Enable = 0x00,
//    ocCmd_Custom_Config,
//    ocCmd_Custom_Write,
//    ocCmd_Custom_Read,
// } Custom_CMD;
// Custom_Interface = undefined; // client define this by setting the value of interface_type in system.json
// const CUSTOM_CMD_ENABLE = 0x00;
// const CUSTOM_CMD_CONFIG = 0x01;
// const CUSTOM_CMD_WRITE = 0x02;
// const CUSTOM_CMD_READ = 0x03;
// class OCFCustom extends OCFBase {
//     constructor() {
//         super('someCustomInterfaceName');
//         this.packetHandlers.set(CUSTOM_CMD_ENABLE, this.replyCustomEnable);
//         this.packetHandlers.set(CUSTOM_CMD_CONFIG, this.replyCustomConfig);
//         this.packetHandlers.set(CUSTOM_CMD_WRITE, this.replyCustomWrite);
//         this.packetHandlers.set(CUSTOM_CMD_READ, this.replyCustomRead);
//     }
//     // window.OCFCustom = OCFCustom;
//     init(info: any): Promise<any> {
//         // eslint-disable-next-line @typescript-eslint/camelcase
//         this.info.interface_type = +this.info.interface_type;
//         return super.init(info);
//     }
//     getPacketHandler(packet: AevmPacket): PacketHandlerType | undefined {
//         return super.getPacketHandler(packet) || this.replyCustomCommand;
//     }
//     // Cannot wrap this pair of read/write because the protocol of constructing params and/or payload from info and data is an unknown to us.
//     // read(info) {
//     //    return this.Custom_Read(this.unit, info.params, info.payload);
//     // }
//     // write(info, data) {
//     //    return this.Custom_Write(this.unit, info.params, info.payload);
//     // }
//     configureFirmware(configSeq: any): Promise<any> {
//         const promises = [];
//         const seqLen = configSeq ? configSeq.length : 0;
//         for (let i=0; i<seqLen; i++) {
//             const config = configSeq[i];
//             switch (config.command) {
//                 case 'enable':
//                     promises.push(this.Custom_Enable(this.unit, config.params, config.payload));
//                     break;
//                 case 'config':
//                     promises.push(this.Custom_Config(this.unit, config.params, config.payload));
//                     break;
//                 case 'write':
//                     promises.push(this.Custom_Write(this.unit, config.params, config.payload));
//                     break;
//                 default:
//                     promises.push(this.Custom_Command(this.unit, config.command, config.params, config.payload));
//                     break;
//             }
//         }
//         return Promise.all(promises);
//     }
//     // Migration note old signature get_interface_type() : number { return this.interface_type; }
//     get interfaceType(): number {
//         return +this.info.interface_type;
//     }
//     /**
//      * Enable or Disable the inteface
//      * @param {Number} unit interface unit
//      * @param {Array} params parameters
//      * @param {Array} payload payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Custom_Enable(unit: number, params?: number[], payload?: number[] | Uint8Array): Promise<any> {
//         return this.Custom_Command(unit, CUSTOM_CMD_ENABLE, params, payload);
//     }
//     private replyCustomEnable(packet: AevmPacket, deferPromise?: IDeferedPromise<any>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Enable/Disable'));
//         }
//     }
//     /**
//      * Configure the inteface
//      * @param {Number} unit interface unit
//      * @param {Array} params parameters
//      * @param {Array} payload payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Custom_Config(unit: number, params?: number[], payload?: number[] | Uint8Array): Promise<any> {
//         return this.Custom_Command(unit, CUSTOM_CMD_CONFIG, params, payload);
//     }
//     private replyCustomConfig(packet: AevmPacket, deferPromise?: IDeferedPromise<any>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Config'));
//         }
//     }
//     /**
//      * Write data
//      * @param {Number} unit interface unit
//      * @param {Array} params parameters
//      * @param {Array} payload payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Custom_Write(unit: number, params?: number[], payload?: number[]): Promise<any> {
//         return this.Custom_Command(unit, CUSTOM_CMD_WRITE, params, payload);
//     }
//     private replyCustomWrite(packet: AevmPacket, deferPromise?: IDeferedPromise<any>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Write'));
//         }
//     }
//     /**
//      * Read data
//      * @param {Number} unit interface unit
//      * @param {Array} params parameters
//      * @param {Array} payload payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Custom_Read(unit: number, params?: number[], payload?: number[]): Promise<any> {
//         return this.Custom_Command(unit, CUSTOM_CMD_READ, params, payload);
//     }
//     private replyCustomRead(packet: AevmPacket, deferPromise?: IDeferedPromise<any>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Read'));
//         }
//     }
//     /**
//      * Configure the inteface
//      * @param {Number} unit interface unit
//      * @param {Number} command command
//      * @param {Array} params parameters
//      * @param {Array} payload payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Custom_Command(unit: number, command: number, params?: number[], payload?: number[] | Uint8Array): Promise<any> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = command;
//         if (params !== undefined && params !== null) {
//             pkt.hdr.params = params;
//         }
//         if (payload !== undefined && payload !== null) {
//             pkt.payload = payload;
//         }
//         return this.h2cCommand(pkt);
//     }
//     private replyCustomCommand(packet: AevmPacket, deferPromise?: IDeferedPromise<any>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Custom Command'));
//         }
//     }
// }
//# sourceMappingURL=OCFCustom.js.map
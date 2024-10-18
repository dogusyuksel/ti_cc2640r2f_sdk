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
// import { IDeferedPromise } from '../../ti-core-assets/lib/TiPromise';
// import { AevmPacket } from './AEVMCodec';
// import { OCFBase } from './OCFBase';
// const SYS_INTERFACE = 0x0;
// const SYS_CMD_INVOKE_BSL = 0x06;
// const SYS_CMD_GET_INFO = 0x09;
// const SYS_CMD_RESET_RESOURCE = 0x0e;
// export interface IFirmwareInfo {
//     version: string;
// }
// export class OCFSystem extends OCFBase {
//     constructor() {
//         super('system');
//         this.packetHandlers.set(SYS_CMD_INVOKE_BSL, this.replyHandler);
//         this.packetHandlers.set(SYS_CMD_GET_INFO, this.replyGetInfo);
//         this.packetHandlers.set(SYS_CMD_RESET_RESOURCE, this.replyHandler);
//     }
//     configureFirmware(): Promise<void> {
//         return this.resetResource();
//     }
//     get interfaceType(): number {
//         return SYS_INTERFACE;
//     }
//     getInfo(): Promise<IFirmwareInfo> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(0);
//         pkt.hdr.command = SYS_CMD_GET_INFO;
//         return this.h2cCommand(pkt);
//     }
//     private replyGetInfo(packet: AevmPacket, deferPromise?: IDeferedPromise<any>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             const boardSerialNum = packet.payload.slice(68, 108);
//             const boardName = packet.payload.slice(28, 68);
//             const boardRevStr =  packet.payload.slice(13, 28);
//             deferPromise.resolve({
//                 DLLVersion: 0,                          // 8 bytes
//                 FirmwareVersion: {                      // 4 bytes
//                     major: packet.payload[8],
//                     minor: packet.payload[9],
//                     reversion: packet.payload[10],
//                     build: packet.payload[11]
//                 },
//                 boardRev: packet.payload[12],           // 1 bytes
//                 boardRevStr: boardRevStr,               // 15 bytes
//                 boardName: boardName,                   // 40 bytes
//                 boardSerialNum: boardSerialNum,         // 40 bytes
//                 checksum: packet.payload.slice(108),    // 4 bytes
//                 _boardSerialNum: OCFBase.bytesToAscii(boardSerialNum),
//                 _boardRevStr: OCFBase.bytesToAscii(boardRevStr),
//                 _boardName: OCFBase.bytesToAscii(boardName),
//                 version: packet.payload[8]+'.'+packet.payload[9]+'.'+packet.payload[10]+'.'+packet.payload[11]
//             });
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in GetInfo'));
//         }
//     }
//     invokeBSL(): Promise<void> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(0);
//         pkt.hdr.command = SYS_CMD_INVOKE_BSL;
//         return this.h2cCommand(pkt);
//     }
//     resetResource(): Promise<void> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(0);
//         pkt.hdr.command = SYS_CMD_RESET_RESOURCE;
//         return this.h2cCommand(pkt);
//     }
//     private replyHandler(packet: AevmPacket, deferPromise?: IDeferedPromise<AevmPacket>) {
//         if (deferPromise === undefined) return;
//         deferPromise.resolve(packet);
//     }
//     /* exports the OCFSystem object */
//     // window.OCFSystem = OCFSystem;
// }
//# sourceMappingURL=OCFSystem.js.map
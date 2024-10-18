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
// import { OCFBase, IAevmChildInterfaceParams, IConfigureCommand, IEnableAevmChildInterface } from './OCFBase';
// import { INoopDecoder, IEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { IEncoderType, IDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// // Reference ocf_common.h
// // #define Uart_Interface       0x06
// // typedef enum
// // {
// //    ocCmd_Uart_Enable = 0x00,
// //    ocCmd_Uart_Config,
// //    ocCmd_Uart_Write,
// //    ocCmd_Uart_Read,
// //    ocCmd_Uart_DisableReceiver,
// // } Uart_CMD;
// const UART_INTERFACE = 0x06;
// const UART_CMD_ENABLE = 0x00;
// const UART_CMD_CONFIG = 0x01;
// const UART_CMD_WRITE = 0x02;
// const UART_CMD_READ = 0x03;
// const UART_CMD_DISABLE_RECEIVER = 0x04;
// export interface IConfigureUart extends IConfigureCommand {
//     unit: number;
//     baud_rate: number;
//     parity: number;
//     datawidth: number;
//     stop: number;
//     // command = 'config'
// }
// export interface IStreamingEncoder extends IEncoder<INoopDecoder, IStreamingEncoder> {
//     write(data: Uint8Array): Promise<void>;
//     read(numByte: number): Promise<Uint8Array>;
// }
// export class OCFUart extends OCFBase implements IStreamingEncoder {
//     encoderInputType: IEncoderType<IStreamingEncoder>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     constructor(protected info: IAevmChildInterfaceParams) {
//         super(info.id || 'uart');
//         this.packetHandlers.set(UART_CMD_ENABLE, this.replyUartEnable);
//         this.packetHandlers.set(UART_CMD_CONFIG, this.replyUartConfig);
//         this.packetHandlers.set(UART_CMD_WRITE, this.replyUartWrite);
//         this.packetHandlers.set(UART_CMD_READ, this.replyUartRead);
//         this.packetHandlers.set(UART_CMD_DISABLE_RECEIVER, this.replyUartDisableReceiver);
//         this.initializeSettings(info);
//     }
//     read(numBytes: number): Promise<Uint8Array> {
//         if (this.customCallback && this.customCallback.read) {
//             return this.customCallback.read(numBytes);
//         }
//         return this.Uart_Read(this.unit, numBytes);
//     }
//     write(data: Uint8Array): Promise<void> {
//         if (this.customCallback && this.customCallback.write) {
//             return this.customCallback.write(data);
//         }
//         return this.Uart_Write(this.unit, data);
//     }
//     addChildDecoder(child: INoopDecoder): void {
//         // don't care
//     }
//     /**
//      * Configure the inteface, and it should invoked by GC framework only.
//      */
//     configureFirmware(configSeq: IConfigureCommand[]): Promise<void> {
//         const promises = [];
//         const seqLen = configSeq ? configSeq.length : 0;
//         for (let i=0; i<seqLen; i++) {
//             const cfg = configSeq[i];
//             switch (cfg.command) {
//                 case 'enable': {
//                     const config = cfg as unknown as IEnableAevmChildInterface;
//                     promises.push(this.Uart_Enable(config.unit ?? this.unit, config.enable));
//                     break;
//                 }
//                 case 'config': {
//                     const config = cfg as IConfigureUart;
//                     promises.push(this.Uart_Config(this.unit, config.baud_rate, config.parity, config.datawidth, config.stop));
//                     break;
//                 }
//             }
//         }
//         return Promise.all(promises) as unknown as Promise<void>;
//     }
//     get interfaceType(): number {
//         return UART_INTERFACE;
//     }
//     /**
//      * Enable or Disable the inteface
//      * @param {Number} unit interface unit
//      * @param {Boolean} enable enable if true, disable if false
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Uart_Enable(unit: number, enable: boolean): Promise<boolean> {
//         // uint32_t unit, bool enable
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = UART_CMD_ENABLE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = enable ? 1 : 0;
//         return this.h2cCommand(pkt);
//     }
//     private replyUartEnable(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Enable/Disable'));
//         }
//     }
//     /**
//      * Configure the interface
//      * @param {Number} unit interface unit
//      * @param {Number} baudRate baud rate
//      * @param {Number} parity
//      * @param {Number} dataWidth number of data bits
//      * @param {Number} stopBits stop bits
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Uart_Config(unit: number, baudRate: number, parity: number, dataWidth: number, stopBits: number): Promise<boolean> {
//         // uint32_t unit, uint32_t baud_rate, uint32_t parity, uint32_t datawidth, uint32_t stop
//         // baud_rate: max baud rate 15000000
//         // parity: see UART_interface.c, uart.h
//         //  UART_PAR_NONE = 0 // no parity
//         //  UART_PAR_EVEN = 1 // parity bit is even
//         //  UART_PAR_ODD = 2  // parity bit is odd
//         //  UART_PAR_ZERO = 3 // parity bit is always zero
//         //  UART_PAR_ONE = 4  // parity bit is always one
//         // datawidth: number of data bits
//         //  UART_LEN_5 = 0, // 5 bit data
//         //  UART_LEN_6 = 1, // 6 bit data
//         //  UART_LEN_7 = 2, // 7 bit data
//         //  UART_LEN_8 = 3, // 8 bit data
//         // stop: stop bits
//         //  UART_STOP_ONE = 0 // one stop bit
//         //  UART_STOP_TWO = 1 // two stop bits
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = UART_CMD_CONFIG;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = baudRate;
//         pkt.hdr.params[2] = parity;
//         pkt.hdr.params[3] = dataWidth;
//         pkt.hdr.params[4] = stopBits;
//         return this.h2cCommand(pkt);
//     }
//     private replyUartConfig(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
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
//      * @param {Array} data, data to write as a payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Uart_Write(unit: number, data: Uint8Array): Promise<void> {
//         // uint8_t unit, uint16_t num_bytes
//         // data is uint8_t*, contains data to write
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = UART_CMD_WRITE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = data.length;
//         pkt.payload = data;
//         return this.h2cCommand(pkt);
//     }
//     private replyUartWrite(packet: AevmPacket, deferPromise?: IDeferedPromise<void>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve();
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Write'));
//         }
//     }
//     /**
//      * Read data
//      * @param {Number} unit interface unit
//      * @param {Number} numBytes number of bytes to read
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Uart_Read(unit: number, numBytes: number): Promise<Uint8Array> {
//         // uint8_t unit, uint16_t num_bytes
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = UART_CMD_READ;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = numBytes;
//         return this.h2cCommand(pkt);
//     }
//     private replyUartRead(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Read'));
//         }
//     }
//     /**
//      * Disable receiver
//      * @param {Number} unit interface unit
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     Uart_DisableReceiver(unit: number): Promise<void> {
//         // uint8_t unit
//         // once the rx is disbaled, need to use Uart_Config to re-enable rx
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = UART_CMD_DISABLE_RECEIVER;
//         pkt.hdr.params[0] = unit;
//         return this.h2cCommand(pkt);
//     }
//     private replyUartDisableReceiver(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in DisableReceiver'));
//         }
//     }
// }
//# sourceMappingURL=OCFUart.js.map
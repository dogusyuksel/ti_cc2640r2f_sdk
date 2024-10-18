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
// import { RegisterInfo, RegisterModel } from '../../ti-model-register/lib/RegisterDataModel';
// import { CRC } from './Crc';
// import { AbstractMessageBasedCodec } from '../../ti-target-configuration/lib/AbstractMessageBasedCodec';
// import { IReadWriteValueEncoder } from '../../ti-core-databind/lib/IPollingDataModel';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// import { IEncoderType, IDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { INoopDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
// // Reference ocf_common.h
// // #define I2C_Interface       0x03
// // typedef enum
// // {
// //    ocCmd_I2C_Enable = 0x00,
// //    ocCmd_I2C_Config,
// //    ocCmd_I2C_Write,
// //    ocCmd_I2C_Read,
// //    ocCmd_I2C_WriteRegister,
// //    ocCmd_I2C_ReadRegister,
// //    ocCmd_I2C_BlkWriteBlkRead,
// //    ocCmd_I2C_CaptureSample
// // } I2C_CMD;
// const I2C_INTERFACE = 0x03;
// const I2C_CMD_ENABLE = 0x00;
// const I2C_CMD_CONFIG = 0x01;
// const I2C_CMD_WRITE = 0x02;
// const I2C_CMD_READ = 0x03;
// const I2C_CMD_WRITE_REGISTER = 0x04;
// const I2C_CMD_READ_REGISTER = 0x05;
// const I2C_CMD_BLOCK_WRITE_BLOCK_READ = 0x06;
// const I2C_CMD_CAPTURE_SAMPLE = 0x07;
// const legacyCrcUser = {
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     embed_crc_data(crc: CRC, arg: any) {
//         let c = undefined;
//         if (arg.deviceAddr !== undefined) c = crc.checksum([arg.deviceAddr]);
//         if (arg.opcode !== undefined) c = crc.checksum([arg.opcode], c);
//         if (arg.payload !== undefined) c = crc.checksum(arg.payload, c);
//         arg.payload.push(c);
//         // eslint-disable-next-line @typescript-eslint/camelcase
//         return {payload: arg.payload, num_read_bytes: (arg.write===true) ? 0 : arg.num_read_bytes+1};
//     },
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     verify_crc_data(crc: CRC, arg: any) {
//         const d = arg.payload && arg.payload.slice(0, -1);
//         return {valid: d && crc.checksum(d) === arg.payload[arg.payload.length-1], payload: d};
//     }
// };
// export interface II2CProtocol {
//     opcode_addr_format: 'separated' | 'combined';
//     opcode?: string | number;
//     addr_bitshift?: number;
//     reply_payload_data_start?: number;
//     reply_payload_data_end?: number;
// }
// export interface IAevmI2CParams extends IAevmChildInterfaceParams {
//     addrsBits: number;
//     addrsEndian?: 'little' | 'big'; // default big (FW initial design)
//     dataEndian?: 'little' | 'big'; // default little (FW initial design)
//     deviceAddrs: string | number;
//     read_register_protocol: II2CProtocol;
//     write_register_protocol: II2CProtocol;
//     // mimr - use read_register_protocol and separated opcode_addr_format instead of mimr
//     // mdr - use write_register_protocol and separated opcode_addr_format instead of mdr
// }
// export interface IConfigureI2C extends IConfigureCommand {
//     unit?: number;
//     bitrate_enum: number;
//     pullup: boolean;
//     // command = 'config'
// }
// export class OCFI2C extends OCFBase implements IReadWriteValueEncoder<RegisterInfo> {
//     encoderInputType: IEncoderType<IReadWriteValueEncoder<RegisterInfo>>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     private registerModel: RegisterModel;
//     private captureDeferPromise?: IDeferedPromise<AevmPacket>;
//     private captureSampleCallback?: (packet: AevmPacket) => void;
//     constructor(protected info: IAevmI2CParams) {
//         super(info.id || 'i2c');
//         this.packetHandlers.set(I2C_CMD_ENABLE, this.replyI2CEnable);
//         this.packetHandlers.set(I2C_CMD_CONFIG, this.replyI2CConfig);
//         this.packetHandlers.set(I2C_CMD_WRITE, this.replyI2CWrite);
//         this.packetHandlers.set(I2C_CMD_READ, this.replyI2CRead);
//         this.packetHandlers.set(I2C_CMD_WRITE_REGISTER, this.replyI2CWriteRegister);
//         this.packetHandlers.set(I2C_CMD_READ_REGISTER, this.replyI2CReadRegister);
//         this.packetHandlers.set(I2C_CMD_BLOCK_WRITE_BLOCK_READ, this.replyI2CBlockWriteBlockRead);
//         this.packetHandlers.set(I2C_CMD_CAPTURE_SAMPLE, this.replyI2CCaptureSample);
//         this.initializeSettings(info);
//     }
//     /**
//      * Initialize the symbols for device, and it should invoked by GC framework only.
//      * See its base method for description
//      */
//     initPropertiesWithHelpFromRegisterModel(registerModel: RegisterModel) {
//         // Should use either deviceAddrs for single block or devcieAddrsMap for multiple blocks.
//         // if (settings.slave_addr !== undefined && settings.deviceAddrs === undefined && settings.deviceAddrsMap === undefined) {
//         //     settings.deviceAddrs = settings.slave_addr; // just backward compatible to ads7142 gc app
//         // }
//         OCFBase.readSettingPropMap('unit', 'unitMap', this.info, registerModel);
//         registerModel.readDeviceAddrsMap('I2C', this.info);
//     }
//     // system.json properties.
//     // {
//     //     "name": a string, "i2c" in this case
//     //   , "unit": a number, inteface unit
//     //   , "unitMap": (Optional unit map) {
//     //          "<block unit 1 id>": a number
//     //        , "<block unit 2 id>": a number
//     //        , ... (etc.)
//     //     }
//     //   , "deviceAddrs": hex string e.g. '0x40' or a number, device address
//     //   , "addrsBits": a number, bit size of register address
//     //   , "addrsEndian": 'big' (default), or 'little', address endianess
//     //   , "dataEndian": 'big', or 'little' (default), data endianess
//     //   ,  "read_register_protocol": {
//     //          "opcode_addr_format": "separated" or "combined"
//     //        , "opcode": (Optional) hex string e.g. '0x20' or a number
//     //        , "addr_bitshift": (Optional) a number, bit shift for register address in combined format
//     //      }
//     //   ,  "write_register_protocol": {
//     //          "opcode_addr_format": "separated" or "combined"
//     //        , "opcode": (Optional) hex string e.g. '0x40' or a number
//     //        , "addr_bitshift": (Optional) a number, bit shift for register address in combined format
//     //      }
//     //    , "config" : [
//     //        {
//     //          "command": "enable" or "config"
//     //          ,"unit": (Optional) unit number for the command
//     //
//     //          ,"enable": 'enable' command - true (enable) or false (disable)
//     //
//     //          ,"bitrate_enum" : 'config' command - bit rate enum
//     //          ,"pullup" : 'config' command - true or false for pull-up
//     //        }
//     //        , ... (etc.)
//     //      ]
//     // }
//     private static condParseInt(val: string | number | undefined): number | undefined {
//         // parseInt(undefined) returns NaN. This is not helpful.
//         if (typeof val === 'string') {
//             return parseInt(val);
//         }
//         return val; // leave it as either number or undefined
//     }
//     /**
//      * Initialize the interface instance, and it should invoked by GC framework only.
//      * See its base method for description
//      */
//     initializeSettings(info: IAevmI2CParams) {
//         info.addrsBits = OCFI2C.condParseInt(info.addrsBits);
//         info.addrsEndian = info.addrsEndian || 'big';
//         info.read_register_protocol.opcode = OCFI2C.condParseInt(info.read_register_protocol.opcode);
//         // eslint-disable-next-line @typescript-eslint/camelcase
//         info.read_register_protocol.addr_bitshift = OCFI2C.condParseInt(info.read_register_protocol.addr_bitshift);
//         info.write_register_protocol.opcode = OCFI2C.condParseInt(info.write_register_protocol.opcode);
//         // eslint-disable-next-line @typescript-eslint/camelcase
//         info.write_register_protocol.addr_bitshift = OCFI2C.condParseInt(info.write_register_protocol.addr_bitshift);
//         if (info.crc) {
//             if (AbstractMessageBasedCodec.getCrcUser(info.id) === undefined) {
//                 AbstractMessageBasedCodec.register_crc_user(legacyCrcUser, info.id);
//             }
//         }
//         return super.initializeSettings(info);
//     }
//     deconfigure() {
//         // called by CodecRegistry before connect
//         super.deconfigure();
//         this.registerModel = undefined;
//     }
//     addChildDecoder(child: INoopDecoder): void {
//         // check this is (I)RegisterModel?
//         if (child instanceof RegisterModel) {
//             this.registerModel = child as RegisterModel;
//             this.initPropertiesWithHelpFromRegisterModel(this.registerModel);
//         }
//     }
//     protected getPacketKey(packet: AevmPacket): string|number {
//         // for I2C_CMD_CAPTURE_SAMPLE, key is ifTypeUnit and command, exclude params.
//         const endIdx = packet.hdr.command === I2C_CMD_CAPTURE_SAMPLE ? AevmPacket.PARAM_START_INDEX : undefined;
//         return super.getPacketKey(packet, undefined, endIdx);
//     }
//     /** Deprecated - Internal function for initial prototype */
//     // OCFI2C.prototype.readDeviceId = function(regInfo) {
//     //     // for reading back the ads7142 identification -
//     //     // slave addr 0x51, reg addr 0x0, flags = 0x1 for 16 (10 underlying?) bit addr mode, length of 0x99 or more
//     //     var unit = parseInt(regInfo.unit);
//     //     var slaveaddr = parseInt(regInfo.slaveaddr);
//     //     var addr = parseInt(regInfo.addr);
//     //     var flags = parseInt(regInfo.flags);
//     //     var sz = parseInt(regInfo.bytes);
//     //     return this.I2C_ReadRegister(unit, slaveaddr, addr, flags, sz);
//     // };
//     private getDeviceAddress(regInfo: RegisterInfo) {
//         let ans;
//         if (regInfo.deviceAddrs && !isNaN((regInfo.deviceAddrs as number))) {
//             ans = +regInfo.deviceAddrs;
//         } else if (this.registerModel) {
//             ans = this.registerModel.getDeviceAddrsForRegister(regInfo);
//         }
//         return ans;
//     }
//     /** See its base method for description */
//     readValue(regInfo: RegisterInfo, core?: number): Promise<bindValueType> {
//         if (this.customCallback && this.customCallback.read) {
//             return this.customCallback.read(regInfo);
//         }
//         const protocol = (regInfo as any).read_register_protocol as II2CProtocol || this.info.read_register_protocol;
//         let writeContent = [];
//         if (protocol.opcode_addr_format === 'separated') {
//             if (protocol.opcode !== undefined) writeContent.push(+protocol.opcode);
//             if (regInfo.addr !== undefined) {
//                 OCFBase.valueToBytes(regInfo.addr, this.info.addrsBits, this.info.addrsEndian, writeContent);
//             }
//         } else {
//             let opCodeOrAddr = +protocol.opcode || 0;
//             if (regInfo.addr !== undefined) {
//                 opCodeOrAddr = opCodeOrAddr | (regInfo.addr << (protocol.addr_bitshift || 0));
//             }
//             writeContent = [opCodeOrAddr];
//         }
//         const deviceAddr = this.getDeviceAddress(regInfo);
//         const unit = OCFBase.getPropForRegister('unit', regInfo, this.registerModel);
//         let numReadBytes = regInfo.byteSize;
//         if (this.crcUser !== undefined) {
//             // eslint-disable-next-line @typescript-eslint/camelcase
//             const crcAns = this.crcUser.embed_crc_data(this.crc, {write: false, deviceAddr: deviceAddr, payload: writeContent, num_read_bytes: numReadBytes});
//             writeContent = crcAns.payload;
//             numReadBytes = crcAns.num_read_bytes;
//         }
//         return this.I2C_BlockWriteBlockRead(unit, deviceAddr, Uint8Array.from(writeContent), numReadBytes).then((payload) => {
//             if (this.crcUser !== undefined) {
//                 const crcAns = this.crcUser.verify_crc_data(this.crc, {payload: payload});
//                 if (crcAns.valid === false) {
//                     return Promise.reject('Invalid CRC');
//                 }
//                 payload = crcAns.payload;
//             }
//             if (payload && protocol) {
//                 payload = payload.slice(protocol.reply_payload_data_start, protocol.reply_payload_data_end);
//             }
//             return OCFBase.bytesToValue(payload, this.info.dataEndian);
//         });
//     }
//     /** See its base method for description */
//     writeValue(regInfo: RegisterInfo, data: bindValueType, core?: number): Promise<void> {
//         const regAddr = regInfo.writeAddr ?? regInfo.addr;
//         // this._send_analytics({action: 'write_register', reg_name: regInfo.name, reg_addr: reg_addr, reg_value: data});
//         if (this.customCallback && this.customCallback.write) {
//             return this.customCallback.write(regInfo, data);
//         }
//         const protocol = (regInfo as any).write_register_protocol as II2CProtocol || this.info.write_register_protocol;
//         let flags = (this.info.addrsBits+7)>>4;
//         let opCodeOrAddr: number;
//         const writeContent: number[] = [];
//         if (protocol.opcode_addr_format === 'separated') {
//             if (protocol.opcode !== undefined) {
//                 opCodeOrAddr = +protocol.opcode;
//                 flags = 0x0;
//                 if (regAddr !== undefined) {
//                     OCFBase.valueToBytes(regAddr, this.info.addrsBits, this.info.addrsEndian, writeContent);
//                 }
//             } else {
//                 opCodeOrAddr = regAddr;
//             }
//         } else {
//             opCodeOrAddr = +protocol.opcode || 0;
//             if (regAddr !== undefined) {
//                 opCodeOrAddr = opCodeOrAddr | (regAddr << (protocol.addr_bitshift || 0));
//             }
//         }
//         OCFBase.valueToBytes(data, +regInfo.size, this.info.dataEndian, writeContent);
//         const deviceAddr = this.getDeviceAddress(regInfo);
//         const unit = OCFBase.getPropForRegister('unit', regInfo, this.registerModel);
//         let payload = writeContent;
//         if (this.crcUser) {
//             payload = this.crcUser.embed_crc_data(this.crc, {write: true, deviceAddr: deviceAddr, opcode: opCodeOrAddr, payload: payload}).payload;
//         }
//         return this.I2C_WriteRegister(unit, deviceAddr, opCodeOrAddr, flags, Uint8Array.from(payload));
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
//                     promises.push(this.I2C_Enable(config.unit ?? this.unit, config.enable));
//                     break;
//                 }
//                 case 'config': {
//                     const config = cfg as IConfigureI2C;
//                     promises.push(this.I2C_Config(config.unit ?? this.unit, config.bitrate_enum, config.pullup));
//                     break;
//                 }
//             }
//         }
//         return Promise.all(promises) as unknown as Promise<void>;
//     }
//     get interfaceType(): number {
//         return I2C_INTERFACE;
//     }
//     /**
//      * Enable or Disable the inteface
//      * @param {Number} unit interface unit
//      * @param {Boolean} enable enable if true, disable if false
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_Enable(unit: number, enable: boolean): Promise<boolean> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_ENABLE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = enable ? 1 : 0;
//         return this.h2cCommand(pkt);
//     }
//     private replyI2CEnable(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
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
//      * @param {Number} bitRate bit rate enum
//      * @param {Boolean} pullUp pull-up (true) or not (false)
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_Config(unit: number, bitRate: number, pullUp: boolean): Promise<boolean> {
//         // bit rate Reference ocf_defs.h
//         // #define I2C_100_KBPS        0   // 100 kbps
//         // #define I2C_400_KBPS        1   // 400 kbps
//         // #define I2C_1000_KBPS       2   // 1.0 kbps
//         // #define I2C_3400_KBPS       3   // 3.4 kbps
//         // pull_ups: only some of i2c units for certain targets can be pulled up.
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_CONFIG;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = bitRate;
//         pkt.hdr.params[2] = pullUp ? 1 : 0;
//         return this.h2cCommand(pkt);
//     }
//     private replyI2CConfig(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
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
//      * @param {Number} deviceAddrs device address
//      * @param {Array} data, data to write as a payload
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_Write(unit: number, deviceAddrs: number, data: Uint8Array): Promise<void> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_WRITE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = deviceAddrs;
//         pkt.payload = data;
//         return this.h2cCommand(pkt);
//     }
//     private replyI2CWrite(packet: AevmPacket, deferPromise?: IDeferedPromise<void>) {
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
//      * @param {Number} slaveAddr device address
//      * @param {Number} numBytes number of bytes to read
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_Read(unit: number, deviceAddrs: number, numBytes: number): Promise<Uint8Array> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_READ;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = deviceAddrs;
//         pkt.hdr.params[2] = numBytes;
//         return this.h2cCommand(pkt);
//     }
//     replyI2CRead(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Read'));
//         }
//     }
//     /**
//      * Write a register value
//      * @param {Number} unit interface unit
//      * @param {Number} deviceAddrs device address
//      * @param {Number} registerAddress register address
//      * @param {Number} flags 8-bit regiser address (0) or 16-bit (1)
//      * @param {Array} data, register value to write
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_WriteRegister(unit: number, deviceAddrs: number, registerAddress: number, flags: number, data: Uint8Array): Promise<void> {
//         // flags: 0: 8-bit register address, 1: 16-bit register address.
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_WRITE_REGISTER;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = deviceAddrs;
//         pkt.hdr.params[2] = registerAddress;
//         pkt.hdr.params[3] = flags;
//         pkt.payload = data;
//         return this.h2cCommand(pkt);
//     }
//     replyI2CWriteRegister(packet: AevmPacket, deferPromise?: IDeferedPromise<void>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve();
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in WriteRegister'));
//         }
//     }
//     /**
//      * Read register (no repeated start)
//      * @param {Number} unit interface unit
//      * @param {Number} deviceAddrs device address
//      * @param {Number} registerAddress register address
//      * @param {Number} flags 8-bit regiser address (0) or 16-bit (1)
//      * @param {Number} numBytes number of bytes to read
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_ReadRegister(unit: number, deviceAddrs: number, registerAddress: number, flags: number, numBytes: number): Promise<Uint8Array> {
//         // flags: 0: 8-bit register address, 1: 16-bit register address;
//         //       Use Repeated START: 0: No repeated start (separate write and read), 2: Use repeated start
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_READ_REGISTER;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = deviceAddrs;
//         pkt.hdr.params[2] = registerAddress;
//         pkt.hdr.params[3] = flags;
//         pkt.hdr.params[4] = numBytes;
//         return this.h2cCommand(pkt);
//     }
//     replyI2CReadRegister(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in ReadRegister'));
//         }
//     }
//     /**
//      * Block write and block read (with repeated start after write)
//      * @param {Number} unit interface unit
//      * @param {Number} deviceAddrs device address
//      * @param [Array} data data to write, as packet payload
//      * @param {Number} numReadBytes number of bytes to read
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_BlockWriteBlockRead(unit: number, deviceAddrs: number, data: Uint8Array, numReadBytes: number): Promise<Uint8Array> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_BLOCK_WRITE_BLOCK_READ;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = deviceAddrs;
//         pkt.hdr.params[2] = numReadBytes;
//         pkt.payload = data;
//         return this.h2cCommand(pkt);
//     }
//     private replyI2CBlockWriteBlockRead(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in BlockWriteBlockRead'));
//         }
//     }
//     /**
//      * Capture sample (controller to host)
//      * @param {Number} unit interface unit
//      * @param {Number} deviceAddrs device address
//      * @param {Number} numReadBytes number of bytes to read
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     I2C_CaptureSample(unit: number, deviceAddrs: number, numReadBytes: number,
//         options: {[callback: string]: (packet: AevmPacket) => void}): Promise<void> {
//         // uint8_t unit, uint8_t slaveAddr, uint32_t numReadBytes
//         //
//         // options is {
//         //     callback: <is a callback function of signature function(replypkt) >
//         // }
//         // callback is invoked for each data packet received from firmware.
//         this.captureSampleCallback = options.callback;
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = I2C_CMD_CAPTURE_SAMPLE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = deviceAddrs;
//         pkt.hdr.params[2] = numReadBytes;
//         return this.h2cCommand(pkt);
//     }
//     private replyI2CCaptureSample(packet: AevmPacket, deferPromise?: IDeferedPromise<AevmPacket>) {
//         // I2C_interface.c, and ocf_common.h; status 1: capture in progress, 2: capture sample done
//         const status = packet.hdr.status;
//         const packetType = packet.hdr.type;
//         if (deferPromise !== undefined) {
//             this.captureDeferPromise = deferPromise;
//         }
//         if (status >= 1 && status <= 2) {
//             // packet type: DATA_PACKET=0x0002, STATUS_PACKET=0x0003
//             if (this.captureSampleCallback !== undefined) {
//                 this.captureSampleCallback(packet);
//             }
//             if (status === 2) {
//                 this.captureDeferPromise?.resolve(packet);
//                 this.captureDeferPromise = undefined;
//             }
//         } else if (status !== 0) {
//             this.captureDeferPromise?.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in CaptureSample'));
//             this.captureDeferPromise = undefined;
//         }
//     }
// }
//# sourceMappingURL=OCFI2C.js.map
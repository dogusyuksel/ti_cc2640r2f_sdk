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
// import { NamedDataRecord, NamedRecordFieldDescriptor, Uint8, Uint16, Uint32 } from '../../ti-target-configuration/lib/NamedDataRecord';
// import { RegisterInfo } from '../../ti-model-register/lib/RegisterDataModel';
// import { IReadWriteValueEncoder } from '../../ti-core-databind/lib/IPollingDataModel';
// import { IEncoderType, IDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { INoopDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// // Reference ocf_common.h
// // #define SPI_Interface       0x05
// // typedef enum
// // {
// //    ocCmd_SPI_Enable = 0x00,
// //    ocCmd_SPI_Config,
// //    ocCmd_SPI_WriteAndRead,
// //    ocCmd_SPI_CaptureSample,
// //    ocCmd_SPI_DownStream_BufWrite,
// //    ocCmd_SPI_Start_DownStream
// // } SPI_CMD;
// const SPI_INTERFACE = 0x05;
// const SPI_CMD_ENABLE = 0x00;
// const SPI_CMD_CONFIG = 0x01;
// const SPI_CMD_WRITE_AND_READ = 0x02;
// const SPI_CMD_CAPTURE_SAMPLE = 0x03;
// const SPI_CMD_DOWN_STREAM_BUF_WRITE = 0x4;
// const SPI_CMD_START_DOWN_STREAM = 0x5;
// const SYS_CMD_DEV_CTRL = 0xC;
// interface ICtrlPin {
//     gpioPin: number;
//     pinType: number;
//     controlLevel: number;
//     invertClk: number;
// }
// class CtrlPinRecord extends NamedDataRecord<ICtrlPin> {
//     static fieldDescriptors: NamedRecordFieldDescriptor<ICtrlPin>[] = [
//         ['gpioPin', Uint16],
//         ['pinType', Uint16],
//         ['controlLevel', Uint16],
//         ['invertClk', Uint16]
//     ];
//     littleEndian = true;
// }
// interface IDevCtrl { // dev_ctrl structure
//     activeMode: number;
//     inputTriggerGpioActive: number;
//     inputTriggerGpio: number;
//     ctrlPinArray: ICtrlPin[]; // CTRL_PIN[3], total size = (uint16[4])*3
//     sampleRate: number;
//     sampleBits: number;
//     dmaArbSize: number;
// }
// class DevCtrlRecord extends NamedDataRecord<IDevCtrl> {
//     static fieldDescriptors: NamedRecordFieldDescriptor<IDevCtrl>[] = [
//         ['activeMode', Uint8],
//         ['inputTriggerGpioActive', Uint8],
//         ['inputTriggerGpio', Uint16],
//         // ['ctrlPinArray', CtrlPinRecord, 3], // not supported by NamedRecordFieldDescriptor
//         ['ctrlPinArray', Uint16, 12], // workaround of above
//         ['sampleRate', Uint32],
//         ['sampleBits', Uint8],
//         ['dmaArbSize', Uint8]
//     ];
//     littleEndian = true;
// }
// export interface ISPIProtocol {
//     write_cmd: number | string;
//     read_cmd: number | string;
//     addr_bitshift: number;
//     data_bitshift: number;
//     parity: 'odd' | 'even';
//     parity_bitshift: number;
//     payload_endian: 'little' | 'big';
//     payload_bitsize: number;
//     reply_payload_data_start?: number;
//     reply_payload_data_end?: number;
//     dataEndian: 'little' | 'big';
// }
// export interface IAevmSPIParams extends IAevmChildInterfaceParams {
//     csGpio;
//     read_write_register_protocol: ISPIProtocol;
// }
// export interface IConfigureSPI extends IConfigureCommand {
//     unit?: number;
//     bitrate: number;
//     protocol: number;
//     datawidth: number;
//     cs_mode: number;
//     cs_change: number;
//     // command = 'config'
// }
// export class OCFSPI extends OCFBase implements IReadWriteValueEncoder<RegisterInfo>  {
//     encoderInputType: IEncoderType<IReadWriteValueEncoder<RegisterInfo>>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     // private registerModel: RegisterModel;
//     private captureDeferPromise?: IDeferedPromise<number[]>;
//     private capturePayload?: number[];
//     private captureSampleCallback?: (packet: AevmPacket) => void;
//     csGpio: string | number = 0;
//     constructor(protected info: IAevmSPIParams) {
//         super(info.id || 'spi');
//         this.packetHandlers.set(SPI_CMD_ENABLE, this.replySPIEnable);
//         this.packetHandlers.set(SPI_CMD_CONFIG, this.replySPIConfig);
//         this.packetHandlers.set(SPI_CMD_WRITE_AND_READ, this.replySPIWriteAndRead);
//         this.packetHandlers.set(SPI_CMD_CAPTURE_SAMPLE, this.replySPICaptureSample);
//         this.packetHandlers.set(SPI_CMD_DOWN_STREAM_BUF_WRITE, this.replySPIDownStreamBufWrite);
//         this.packetHandlers.set(SPI_CMD_START_DOWN_STREAM, this.replySPIStartDownStream);
//         this.initializeSettings(info);
//     }
//     // system.json properties.
//     // {
//     //     "name": a string, "spi" in this case
//     //   , "unit": a number, inteface unit
//     //   , "cs_gpio": a string, chip select gpio pin, e.g. 'PN2'; or a number as the pin mask of the gpio pin
//     //   , "dataEndian": 'big', or 'little' (default), data endianess
//     //   ,  "read_write_register_protocol": {
//     //          "write_cmd": hex string or number, write command
//     //        , "read_cmd": hex string or number, read command
//     //        , "addr_bitshift": a number, address bit shift
//     //        , "data_bitshift": a number, data bit shift
//     //        , "parity": "odd" or "even"
//     //        , "parity_bitshift": a number, parity bit shift
//     //        , "payload_endian": 'big' or 'little', payload endianess
//     //        , "payload_bitsize": a number, payload bit size
//     //        , "reply_payload_data_start": a number, payload start index for register data, see JS array slice for pos/neg number
//     //        , "reply_payload_data_end": a number, payload end index for register data, see JS array slice for pos/neg number
//     //        , "dataEndian": 'big', or 'little' (default), data endianess
//     //      }
//     //    , "config" : [
//     //        {
//     //          "command": "enable" or "config"
//     //          ,"unit": (Optional) unit number for the command
//     //
//     //          ,"enable": 'enable' command - true (enable) or false (disable)
//     //
//     //          ,"bitrate" : 'config' command - bit rate
//     //          ,"protocol" : 'config' command - a number indicating ssi protocol
//     //          ,"datawidth" : 'config' command - data width
//     //          ,"cs_mode" : 'config' command - SPI active mode, 1 active high; 0 active low
//     //          ,"cs_change" : 'config' command - cs_mode change between SPI word. 0: no change; 1: change
//     //        }
//     //        , ... (etc.)
//     //      ]
//     // }
//     /**
//      * Initialize the interface instance, and it should invoked by GC framework only.
//      * See its base method for description
//      */
//     initializeSettings(info: IAevmSPIParams) {
//         this.csGpio = info.csGpio;
//         if (info.read_write_register_protocol) {
//             // eslint-disable-next-line @typescript-eslint/camelcase
//             info.read_write_register_protocol.write_cmd = +info.read_write_register_protocol.write_cmd || 0;
//             // eslint-disable-next-line @typescript-eslint/camelcase
//             info.read_write_register_protocol.read_cmd = +info.read_write_register_protocol.read_cmd || 0;
//         }
//         // should not do this as a binding nor user preferece nor prop binding nor pseudo register
//         // if (info.cs_gpio_hdl === undefined) {
//         //    info.cs_gpio_hdl = function(oldValue, newValue) {
//         //        self.cs_gpio = newValue;
//         //    }
//         //    info._registerModel.getBinding('$cs_gpio').addChangedListener({onValueChanged: info.cs_gpio_hdl});
//         // }
//         return super.initializeSettings(info);
//     }
//     addChildDecoder(child: INoopDecoder): void {
//     }
//     /**
//      * Construct packet payload for write or read
//      * @param {Boolean} write write (true) or read (false)
//      * @param {Object} regInfo register info
//      * @param {Number} data data to write
//      * @return {Array} packet payload as an array of bytes
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     write_read_payload(write: boolean, regInfo: RegisterInfo, data: number): number[] {
//         const protocol = (regInfo as any).read_write_register_protocol as ISPIProtocol || this.info.read_write_register_protocol;
//         const cmd = (write === true) ? +protocol.write_cmd : +protocol.read_cmd;
//         const addrBitshift = protocol.addr_bitshift;
//         const dataBitshift = protocol.data_bitshift;
//         const parity = protocol.parity;
//         const parityShift = protocol.parity_bitshift;
//         const endian = protocol.payload_endian;
//         const bitsize = protocol.payload_bitsize;
//         const regAddr = regInfo.writeAddr ?? regInfo.addr;
//         let assembledCmd = cmd | (regAddr << addrBitshift) | (data << dataBitshift);
//         if (parity !== undefined) {
//             let ones = 0;
//             let x = assembledCmd;
//             while (x > 0) {
//                 if ((x & 0x1) === 1) ones++;
//                 x >>= 1;
//             }
//             if (parity === 'odd') {
//                 if ((ones & 0x1) === 0) assembledCmd |= (1 << parityShift);
//             } else {
//                 if ((ones & 0x1) === 1) assembledCmd |= (1 << parityShift);
//             }
//         }
//         return OCFBase.valueToBytes(assembledCmd, bitsize, endian);
//     }
//     readValue(regInfo: RegisterInfo, core?: number): Promise<bindValueType> {
//         if (this.customCallback && this.customCallback.read) {
//             return this.customCallback.read(regInfo);
//         }
//         const csGpio = regInfo.cs_gpio || this.csGpio;
//         const payload = this.write_read_payload(false, regInfo, 0);
//         const protocol = (regInfo as any).read_write_register_protocol as ISPIProtocol || this.info.read_write_register_protocol;
//         return this.SPI_WriteAndRead(this.unit, csGpio, Uint8Array.from(payload), payload.length).then((payload) => {
//             if (payload && protocol) {
//                 payload = payload.slice(protocol.reply_payload_data_start, protocol.reply_payload_data_end);
//             }
//             return OCFBase.bytesToValue(payload, protocol && protocol.dataEndian);
//         });
//     }
//     writeValue(regInfo: RegisterInfo, data: bindValueType, core?: number): Promise<void> {
//         if (this.customCallback && this.customCallback.write) {
//             return this.customCallback.write(regInfo, data);
//         }
//         const csGpio = regInfo.cs_gpio || this.csGpio;
//         const payload = this.write_read_payload(true, regInfo, data);
//         return this.SPI_WriteAndRead(this.unit, csGpio, Uint8Array.from(payload), payload.length) as unknown as Promise<void>;
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
//                     promises.push(this.SPI_Enable(config.unit ?? this.unit, config.enable));
//                     break;
//                 }
//                 case 'config': {
//                     const config = cfg as IConfigureSPI;
//                     promises.push(this.SPI_Config(config.unit ?? this.unit, config.bitrate, config.protocol, config.datawidth, config.cs_mode, config.cs_change));
//                     break;
//                 }
//             }
//         }
//         return Promise.all(promises) as unknown as Promise<void>;
//     }
//     get interfaceType(): number {
//         return SPI_INTERFACE;
//     }
//     /**
//      * Enable or Disable the inteface
//      * @param {Number} unit interface unit
//      * @param {Boolean} enable enable if true, disable if false
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_Enable(unit: number, enable: boolean): Promise<boolean> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SPI_CMD_ENABLE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = enable ? 1 : 0;
//         return this.h2cCommand(pkt);
//     }
//     private replySPIEnable(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
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
//      * @param {Number} bitrate bit rate, in units of 1kHz; max rate is 60000 kHz
//      * @param {Number} protocol spi mode
//      * @param {Number} dataWidth data width word width between 4 and 16 bits
//      * @param {Number} csMode chip select mode, SPI active mode: 1 active high; 0 active low
//      * @param {Number} csChange chip select change csMode change between SPI word. 0: no change; 1: change
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_Config(unit: number, bitrate: number, protocol: number,
//         dataWidth: number, csMode: number, csChange: number): Promise<boolean> {
//         // protocol: see ssi.h
//         //  #define SSI_FRF_MOTO_MODE_0  0x00000000 // Moto fmt, polarity 0, phase 0
//         //  #define SSI_FRF_MOTO_MODE_1  0x00000002 // Moto fmt, polarity 0, phase 1
//         //  #define SSI_FRF_MOTO_MODE_2  0x00000001 // Moto fmt, polarity 1, phase 0
//         //  #define SSI_FRF_MOTO_MODE_3  0x00000003 // Moto fmt, polarity 1, phase 1
//         //  #define SSI_FRF_TI           0x00000010 // TI frame format
//         //  #define SSI_FRF_NMW          0x00000020 // National microwire frame format
//         //  #define SSI_ADV_MODE_BI_READ   0x00000140
//         //  #define SSI_ADV_MODE_BI_WRITE  0x00000040
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SPI_CMD_CONFIG;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = bitrate;
//         pkt.hdr.params[2] = protocol;
//         pkt.hdr.params[3] = dataWidth;
//         pkt.hdr.params[4] = csMode;
//         pkt.hdr.params[5] = csChange;
//         return this.h2cCommand(pkt);
//     }
//     private replySPIConfig(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Config'));
//         }
//     }
//     /**
//      * Write and Read
//      * @param {Number} unit interface unit
//      * @param {String} csGpio chip select gpio pin as pin port name (string) or pin mask (a number)
//      * @param {Array} data data to write
//      * @param {Number} numBytes number of bytes to write and read.
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_WriteAndRead(unit: number, csGpio: string | number, data: Uint8Array, numBytes: number): Promise<Uint8Array>  {
//         // By SPI design, both write and read bounds have the same number of bytes.
//         // firmware 0.3.0.3, csGpio is port pin name e.g. 'PK1'
//         // firmware 0.9, may not have csGpio. Review code for any change.
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SPI_CMD_WRITE_AND_READ;
//         pkt.hdr.params[0] = unit;
//         if (typeof csGpio === 'string') {
//             // Use charCodeAt to convert each of the 4 characters to a number.
//             // If there is not enough characters, pad with number 0
//             // 'PK1' will be [80, 75, 49, 0]
//             const paramDataView = new DataView(pkt.hdr.asUint8Array.buffer,
//                 AevmPacket.PARAM_START_INDEX + AevmPacket.ONE_PARAM_BYTE_SIZE, // params[1] start index
//                 AevmPacket.ONE_PARAM_BYTE_SIZE); // params[1] byte size
//             for (let idx = 0; idx < paramDataView.byteLength; idx++) {
//                 paramDataView.setUint8(idx, idx < csGpio.length ? csGpio.charCodeAt(idx) : 0);
//             }
//         } else {
//             pkt.hdr.params[1] = csGpio;
//         }
//         pkt.hdr.params[2] = data && data.length || numBytes;
//         pkt.payload = data;
//         return this.h2cCommand(pkt);
//     }
//     private replySPIWriteAndRead(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in WriteAndRead'));
//         }
//     }
//     /**
//      * Capture sample
//      * @param {Number} unit interface unit
//      * @param {Number} bytesToWrite number of bytes per frame = number of bytes for one sample for one channel * number of channels
//      * @param {Number} sampleSize number of samples to capture for a channel
//      * @param {Array} payload the output data for getting a sample for each channel
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_CaptureSample(unit: number, bytesToWrite: number, sampleSize: number,
//         payload: Uint8Array, options: {[callback: string]: (packet: AevmPacket) => void}): Promise<number[]> {
//         // total output bytes after capture done = sampleSize * bytesToWrite
//         //
//         // The following is not part of DLL APIs
//         // options is {
//         //     callback: <is a callback function of signature function(replypkt) > for streaming approach; undefined for buffering approach
//         // }
//         // Streaming approach is to address potential performance problems on browser side. If total_output_bytes
//         // is 5K+ bytes, or if captue sample request is made at high rate regardless of the size of total_output_bytes,
//         // it is better to use streaming approach.
//         // Since some applications can do processing without waiting the entire capture, or may suffer performance
//         // issues from allocating a huge buffer to hold data, this option is provided to enable applications to
//         // make design decisioins.
//         // In streaming approach, callback is invoked for each data packet received from firmware.
//         // In buffering approach, application will get all the captured data through promise
//         // after capture done packect is received.
//         this.captureSampleCallback = options?.callback;
//         this.capturePayload = [];
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SPI_CMD_CAPTURE_SAMPLE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = bytesToWrite;
//         pkt.hdr.params[2] = sampleSize;
//         pkt.payload = payload;
//         return this.h2cCommand(pkt);
//     }
//     private replySPICaptureSample(packet: AevmPacket, deferPromise?: IDeferedPromise<number[]>) {
//         // SPI_interface.c, and ocf_common.h; status 1: capture in progress, 2: capture sample done
//         // firmware version 0.3.0.3 first reply is status packet;
//         // if capture is done without issues, firmware sends at least 1 data packet
//         // firmware 0.3.0.3 - unit for data packet is 0 for unknown reason
//         const status = packet.hdr.status;
//         const packetType = packet.hdr.type;
//         if (deferPromise !== undefined) {
//             this.captureDeferPromise = deferPromise;
//         }
//         if (status >= 1 && status <= 2) {
//             // packet type: DATA_PACKET=0x0002, STATUS_PACKET=0x0003
//             if (this.captureSampleCallback !== undefined) {
//                 this.captureSampleCallback(packet);
//             } else if (packet.payload) {
//                 if (packetType === 0x2) {
//                     if (packet.hdr.packetNum === 0x1) this.capturePayload = [];
//                     Array.prototype.push.apply(this.capturePayload, Array.from(packet.payload));
//                 }
//             }
//             if (status === 2) {
//                 this.captureDeferPromise?.resolve(this.capturePayload);
//                 this.captureDeferPromise = undefined;
//                 this.capturePayload = undefined;
//             }
//         } else if (status !== 0) {
//             this.captureDeferPromise?.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in CaptureSample'));
//             this.captureDeferPromise = undefined;
//             this.capturePayload = undefined;
//         }
//     }
//     /**
//      * Down stream (host to controller) write data to buffer
//      * @param {Number} unit interface unit
//      * @param {Array} data data to write
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_DownStream_BufWrite(unit: number, data: Uint8Array): Promise<Uint8Array> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SPI_CMD_DOWN_STREAM_BUF_WRITE;
//         pkt.hdr.params[0] = unit;
//         pkt.payload = data;
//         return this.h2cCommand(pkt);
//     }
//     private replySPIDownStreamBufWrite(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in DownStream_BufWrite'));
//         }
//     }
//     /**
//      * Start down stream (host to controller)
//      * @param {Number} unit interface unit
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_Start_DownStream(unit: number): Promise<Uint8Array> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SPI_CMD_START_DOWN_STREAM;
//         return this.h2cCommand(pkt);
//     }
//     replySPIStartDownStream(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Start_DownStream'));
//         }
//     }
//     /**
//      * Device control for capture sample or down stream
//      * @param {Number} unit interface unit
//      * @param {Number} active_mode
//      * @param {Number} input_trigger_gpio_active
//      * @param {Array} ctrl_pin_ary Array of max 3 object, each object is {gpio_pin, pin_type, control_level, invert_clk}
//      * @param {Number} sample_rate
//      * @param {Number} sample_bits
//      * @param {Number} dma_arb_size
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     SPI_DevCtrl(unit: number, activeMode: number, inputTriggerGpioActive: number,
//         inputTriggerGpio: number, ctrlPinArray: {}[],
//         sampleRate: number, sampleBits: number, dmaArbSize: number): Promise<Uint8Array> {
//         // params is unit, sizeof dev_ctrl; payload length is sizeof dev_ctrl, payload is dev_ctrl
//         // dev_ctrl is a struct of
//         //    uint8 active_mode, uint8 input_trigger_gpio_active, unit16 input_trigger_gpio,
//         //    CTRL_PIN ctrl_pin[3],
//         //    unit32 sample_rate, unit8 sample_bits, uint8 dma_arb_size
//         // each CTRL_PIN is a struct of
//         //    unit16 gpio_pin, uint16 pin_type, uint16 control_level, int16 invert_clk
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = SYS_CMD_DEV_CTRL;
//         const payload = DevCtrlRecord.create();
//         const littleEndian = true;
//         payload.activeMode = activeMode;
//         payload.inputTriggerGpioActive = inputTriggerGpioActive;
//         payload.inputTriggerGpio = inputTriggerGpio;
//         const ctrlPinArrayView = new DataView(payload.asUint8Array.buffer, 4, 24);
//         let offset = 0;
//         // eslint-disable-next-line @typescript-eslint/camelcase
//         const invalidCtrlPin = {gpio_pin: 0, pin_type: 3, control_level: 0, invert_clk: 0}; // pin type: INVALID_PIN=3
//         for (let idx=0; idx<3; idx++) {
//             const ctrlPin: any = idx < ctrlPinArray.length ? ctrlPinArray[idx] : invalidCtrlPin;
//             if (typeof ctrlPin.gpio_pin === 'string') { // firmware version 0.3.0.3 gpio pin is string, e.g. 'K1'
//                 ctrlPinArrayView.setUint8(offset, ctrlPin.gpio_pin.charCodeAt(0));
//                 ctrlPinArrayView.setUint8(offset+1, ctrlPin.gpio_pin.charCodeAt(1));
//             } else {
//                 ctrlPinArrayView.setUint16(offset, ctrlPin.gpio_pin, littleEndian);
//             }
//             offset += 2;
//             ctrlPinArrayView.setUint16(offset, ctrlPin.pin_type, littleEndian);
//             offset += 2;
//             ctrlPinArrayView.setUint16(offset, ctrlPin.control_level, littleEndian);
//             offset += 2;
//             ctrlPinArrayView.setUint16(offset, ctrlPin.invert_clk, littleEndian);
//             offset += 2;
//         }
//         payload.sampleRate = sampleRate;
//         payload.sampleBits = sampleBits;
//         payload.dmaArbSize = dmaArbSize;
//         pkt.payload = payload.asUint8Array;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = pkt.payload.length;
//         return this.h2cCommand(pkt);
//     }
//     private replySPIDevCtrl(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in DevCtrl'));
//         }
//     }
// }
//# sourceMappingURL=OCFSPI.js.map
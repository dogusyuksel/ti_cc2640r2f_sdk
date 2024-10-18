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
// import { OCFBase, PacketHandlerType, IAevmChildInterfaceParams, IConfigureCommand } from './OCFBase';
// import { IPin, IPinEncoder } from '../../ti-model-pin/lib/PinModel';
// import { bindValueType } from '../../ti-core-databind/lib/IBindValue';
// import { IEncoderType, IDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { INoopDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
// // Reference ocf_common.h
// // #define GPIO_Interface       0x04
// // typedef enum
// // {
// //    ocCmd_GPIO_Enable = 0x00,
// //    ocCmd_GPIO_Config,
// //    ocCmd_GPIO_Write,
// //    ocCmd_GPIO_Read,
// //    ocCmd_GPIO_RegisterInterrupt,
// // } GPIO_CMD;
// const GPIO_INTERFACE = 0x04;
// const GPIO_CMD_ENABLE = 0x00;
// const GPIO_CMD_CONFIG = 0x01;
// const GPIO_CMD_WRITE = 0x02;
// const GPIO_CMD_READ = 0x03;
// const GPIO_CMD_REGISTER_INTERRUPT = 0x04;
// const GPIO_CMD_NOTIFY_INTERRUPT = 0x5; // the command used by controller to notify us that an interrupt is occurred.
// export interface IAevmGPIOParams extends IAevmChildInterfaceParams, IPin {
// }
// export interface IEnableGPIO extends IConfigureCommand, IPin {
//     enable: boolean; // true to enable, false to disable
//     // command = 'enable'
// }
// export interface IConfigureGPIO extends IConfigureCommand, IPin {
//     mode: number;
//     // command = 'config'
// }
// export interface IWriteGPIO extends IConfigureCommand, IPin {
//     value: number;
//     value2: number;
//     // command = 'write'
// }
// export interface IGPIOInterrupt {
//     type: number;
//     enable: number;
// }
// export interface IRegisterInterruptGPIO extends IConfigureCommand, IPin {
//     options: IGPIOInterrupt[];
//     // command = 'registerInt'
// }
// export class OCFGPIO extends OCFBase implements IPinEncoder {
//     encoderInputType: IEncoderType<IPinEncoder>;
//     encoderOutputType: IDecoderType<INoopDecoder>;
//     constructor(protected info: IAevmGPIOParams) {
//         super(info.id || 'gpio');
//         this.packetHandlers.set(GPIO_CMD_ENABLE, this.replyGPIOEnable);
//         this.packetHandlers.set(GPIO_CMD_CONFIG, this.replyGPIOConfig);
//         this.packetHandlers.set(GPIO_CMD_WRITE, this.replyGPIOWrite);
//         this.packetHandlers.set(GPIO_CMD_READ, this.replyGPIORead);
//         this.packetHandlers.set(GPIO_CMD_REGISTER_INTERRUPT, this.replyGPIORegisterInterrupt);
//         this.initializeSettings(info);
//     }
//     /**
//      * Initialize the symbols for device, and it should invoked by GC framework only.
//      * See its base method for description
//      */
//     // initSymbolsForDevice(settings, registerModel) {
//     //     super.initSymbolsForDevice(settings, registerModel);
//     //     (settings.config || []).forEach(function(config) {
//     //         if (config.command == 'registerInt') {
//     //             var registerInfo = {comm: undefined, uri: 'aevm.'+settings.name+'.'+config.name,
//     //                 pseudo: true, pin_mask: config.pin_mask, pin_name: config.pin_name
//     //             };
//     //             registerModel.addPseudoRegister(registerInfo.uri, registerInfo, 'interrupt'); // because I need to bind name
//     //             settings._interrupt_info = registerInfo;
//     //         }
//     //     });
//     // };
//     /**
//      * Initialize the interface instance, and it should invoked by GC framework only.
//      * See its base method for description
//      */
//     initializeSettings(info: IAevmGPIOParams) {
//         // if (info._interrupt_info) info._interrupt_info.comm = this;
//         return super.initializeSettings(info);
//     }
//     addChildDecoder(child: INoopDecoder): void {
//     }
//     getPacketHandler(packet: AevmPacket): PacketHandlerType | undefined {
//         if (packet.hdr.command === GPIO_CMD_NOTIFY_INTERRUPT) {
//             // return this.info._interrupt_info && function(self, qdef, unit, status, pkt) {
//             //     self.info._registerModel.getBinding(self.info._interrupt_info.uri).updateValue(pkt.payload);
//             //     self.info._registerModel.getBinding(self.info._interrupt_info.uri).updateValue(false);
//             // };
//             // TODO notify client through event
//             return undefined;
//         }
//         return super.getPacketHandler(packet);
//     }
//     read(pinInfo: IPin): Promise<bindValueType> {
//         if (this.customCallback && this.customCallback.read) {
//             return this.customCallback.read(pinInfo);
//         }
//         return this.GPIO_Read(this.unit, pinInfo.pinMask || this.info.pinMask,
//             pinInfo.pinMask2 || this.info.pinMask2);
//     }
//     write(gpioInfo: IPin, data: number): Promise<void> {
//         if (this.customCallback && this.customCallback.write) {
//             return this.customCallback.write(gpioInfo, data);
//         }
//         return this.GPIO_Write(this.unit, gpioInfo.pinMask || this.info.pinMask, data,
//             gpioInfo.pinMask2 || this.info.pinMask2, data);
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
//                     const config = cfg as IEnableGPIO;
//                     promises.push(this.GPIO_Enable(this.unit, config.pinMask || this.info.pinMask,
//                         config.enable, config.pinMask2 || this.info.pinMask2));
//                     break;
//                 }
//                 case 'config': {
//                     const config = cfg as IConfigureGPIO;
//                     promises.push(this.GPIO_Config(this.unit, config.pinMask || this.info.pinMask,
//                         config.mode, config.pinMask2 || this.info.pinMask2));
//                     break;
//                 }
//                 case 'write': {
//                     const config = cfg as IWriteGPIO;
//                     promises.push(this.GPIO_Write(this.unit, config.pinMask || this.info.pinMask, config.value,
//                         config.pinMask2 || this.info.pinMask2, config.value2));
//                     break;
//                 }
//                 case 'registerInt': {
//                     const config  = cfg as IRegisterInterruptGPIO;
//                     promises.push(this.GPIO_RegisterInterrupt(this.unit, config.pinMask || this.info.pinMask,
//                         config.options, config.pinMask2 || this.info.pinMask2));
//                     break;
//                 }
//             }
//         }
//         return Promise.all(promises) as unknown as Promise<void>;
//     }
//     get interfaceType(): number {
//         return GPIO_INTERFACE;
//     }
//     /**
//      * Enable or Disable the inteface
//      * @param {Number} unit interface unit
//      * @param {Number} pinMask
//      * @param {Boolean} enable enable if true, disable if false
//      * @param {Number} pinMask2
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     GPIO_Enable(unit: number, pinMask: number, enable: boolean, pinMask2?: number): Promise<boolean> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = GPIO_CMD_ENABLE;
//         pkt.hdr.params[0] = pinMask;
//         pkt.hdr.params[1] = enable ? 1 : 0;
//         if (pinMask2 !== undefined) {
//             pkt.hdr.params[2] = pinMask2;
//         }
//         return this.h2cCommand(pkt);
//     }
//     private replyGPIOEnable(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
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
//      * @param {Number} pinMask
//      * @param {Number} mode
//      * @param {Number} pinMask2
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     GPIO_Config(unit: number, pinMask: number, mode: number, pinMask2?: number): Promise<boolean> {
//         // mode (ref ocf_defs.h): 1: GPIO_Output; 2: GPIO_InputNoResistor; 3: GPIO_InputPullup; 4: GPIO_InputPullDown; 5: GPIO_OutputOpenDrain
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = GPIO_CMD_CONFIG;
//         pkt.hdr.params[0] = pinMask;
//         pkt.hdr.params[1] = mode;
//         if (pinMask2 !== undefined) {
//             pkt.hdr.params[2] = pinMask2;
//         }
//         return this.h2cCommand(pkt);
//     }
//     private replyGPIOConfig(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Config'));
//         }
//     }
//     /**
//      * Write pin values
//      * @param {Number} unit interface unit
//      * @param {Number} pinMask
//      * @param {Number} pinValues
//      * @param {Number} pinMask2
//      * @param {Number} pinValues2
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     GPIO_Write(unit: number, pinMask: number, pinValues: number, pinMask2?: number, pinValues2?: number): Promise<void> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = GPIO_CMD_WRITE;
//         pkt.hdr.params[0] = pinMask;
//         pkt.hdr.params[1] = pinValues;
//         if (pinMask2 !== undefined && pinValues2 !== undefined) {
//             pkt.hdr.params[2] = pinMask2;
//             pkt.hdr.params[3] = pinValues2;
//         }
//         return this.h2cCommand(pkt);
//     }
//     private replyGPIOWrite(packet: AevmPacket, deferPromise?: IDeferedPromise<void>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve();
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Write'));
//         }
//     }
//     /**
//      * Read pin values
//      * @param {Number} unit interface unit
//      * @param {Number} pinMask
//      * @param {Number} pinMask2
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     GPIO_Read(unit: number, pinMask: number, pinMask2: number): Promise<Uint8Array> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = GPIO_CMD_READ;
//         pkt.hdr.params[0] = pinMask;
//         if (pinMask2 !== undefined) {
//             pkt.hdr.params[1] = pinMask2;
//         }
//         return this.h2cCommand(pkt);
//     };
//     private replyGPIORead(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Read'));
//         }
//     }
//     /**
//      * Register interrupt
//      * @param {Number} unit interface unit
//      * @param {Number} pinMask
//      * @param {Array} typeOptionArray array of 1 to 3 elements, each element is {type: type_value, enable: enable_value}
//      * @param {Number} pinMask2
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     GPIO_RegisterInterrupt(unit: number, pinMask: number, typeOptionArray: IGPIOInterrupt[], pinMask2: number): Promise<void> {
//         // The pins need to be configured as input mode beforehand - GPIO_InputNoResistor, GPIO_InputPullup, or GPIO_InputPullDown
//         // typeOptionArray: an array of size [1..3], each element is {type: type_value, enable: enable_value}
//         // type_value is one of the interrupt types, (ref gpio.h)
//         //  RISING_EDGE: 0
//         //  FALLING_EDGE: 1
//         //  BOTH_EDGE: 2
//         //  LEVEL_HIGH: 3
//         //  LEVEL_LOW: 4
//         // enable_value is one of the following operations (ref ofc_common.h CFG_GPIO_INT)
//         //  REGISTER_GPIO_INT: 0  // register
//         //  REGISTER_GPIO_INT_ENT: 1  // register and enable
//         //  ENABLE_GPIO_INT: 2  // enable, needs to register it before
//         //  DISABLE_GPIO_INT: 3  // disable
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = GPIO_CMD_REGISTER_INTERRUPT;
//         pkt.hdr.params[0] = pinMask;
//         for (let idx=0; idx<3; idx++) {
//             const typeOption = idx < typeOptionArray.length ? typeOptionArray[idx] : undefined;
//             pkt.hdr.params[idx+1] = typeOption?.type || 0;
//             pkt.hdr.params[idx+4] = typeOption?.enable || 0;
//         }
//         if (pinMask2 !== undefined) {
//             pkt.hdr.params[7] = pinMask2;
//         }
//         return this.h2cCommand(pkt);
//     }
//     private replyGPIORegisterInterrupt(packet: AevmPacket, deferPromise?: IDeferedPromise<Uint8Array>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(packet.payload);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in RegisterInterrupt'));
//         }
//     }
// }
//# sourceMappingURL=OCFGPIO.js.map
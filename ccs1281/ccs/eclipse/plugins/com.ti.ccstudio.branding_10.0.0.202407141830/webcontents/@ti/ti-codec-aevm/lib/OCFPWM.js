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
// // Reference ocf_common.h
// // #define PWM_Interface       0x0B
// // typedef enum
// // {
// //    ocCmd_PWM_Enable = 0x00,
// //    ocCmd_PWM_Config,
// //    ocCmd_PWM_Start,
// //    ocCmd_PWM_Stop
// // } PWM_CMD;
// const PWM_INTERFACE = 0x0B;
// const PWM_CMD_ENABLE = 0x00;
// const PWM_CMD_CONFIG = 0x01;
// const PWM_CMD_START = 0x02;
// const PWM_CMD_STOP = 0x03;
// export interface IConfigPWM extends IConfigureCommand {
//     unit?: number;
//     period_unit: number;
//     period_value: number;
//     duty_unit: number;
//     duty_value: number;
//     idle_level: number;
// }
// export class OCFPWM extends OCFBase {
//     constructor(protected info: IAevmChildInterfaceParams) {
//         super(info.id || 'pwm');
//         this.packetHandlers.set(PWM_CMD_ENABLE, this.replyPWMEnable);
//         this.packetHandlers.set(PWM_CMD_CONFIG, this.replyPWMConfig);
//         this.packetHandlers.set(PWM_CMD_START, this.replyPWMStart);
//         this.packetHandlers.set(PWM_CMD_STOP, this.replyPWMStop);
//         this.initializeSettings(info);
//     }
//     configureFirmware(configSeq: IConfigureCommand[]): Promise<void> {
//         const promises = [];
//         const seqLen = configSeq ? configSeq.length : 0;
//         for (let i=0; i<seqLen; i++) {
//             const cfg = configSeq[i];
//             switch (cfg.command) {
//                 case 'enable': {
//                     const config = cfg as unknown as IEnableAevmChildInterface;
//                     promises.push(this.PWM_Enable(config.unit ?? this.unit, config.enable));
//                     break;
//                 }
//                 case 'config': {
//                     const config = cfg as IConfigPWM;
//                     promises.push(this.PWM_Config(config.unit ?? this.unit, config.period_unit, config.period_value, config.duty_unit, config.duty_value, config.idle_level));
//                     break;
//                 }
//             }
//         }
//         return Promise.all(promises) as unknown as Promise<void>;
//     }
//     /** Get interface type */
//     // Migration note old signature get_interface_type() : number { return PWM_Interface; }
//     get interfaceType(): number {
//         return PWM_INTERFACE;
//     }
//     /**
//      * Enable or Disable the inteface
//      * Migration note old signature PWM_Enable = function(unit, enable)
//      * @param {Number} unit interface unit
//      * @param {Boolean} enable enable if true, disable if false
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     PWM_Enable(unit: number, enable: boolean): Promise<boolean> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = PWM_CMD_ENABLE;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = enable ? 1 : 0;
//         return this.h2cCommand(pkt);
//     }
//     private replyPWMEnable(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
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
//      * Migration note old signature PWM_Config
//      * @param {Number} unit interface unit
//      * @param {Number} periodUnit
//      * @param {Number} periodValue
//      * @param {Number} dutyUnit
//      * @param {Number} dutyValue
//      * @param {Number} idleLevel
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     PWM_Config(unit: number, periodUnit: number, periodValue: number,
//         dutyUnit: number, dutyValue: number, idleLevel: number): Promise<boolean> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = PWM_CMD_CONFIG;
//         pkt.hdr.params[0] = unit;
//         pkt.hdr.params[1] = periodUnit;
//         pkt.hdr.params[2] = periodValue;
//         pkt.hdr.params[3] = dutyUnit;
//         pkt.hdr.params[4] = dutyValue;
//         pkt.hdr.params[5] = idleLevel;
//         return this.h2cCommand(pkt);
//     }
//     private replyPWMConfig(packet: AevmPacket, deferPromise?: IDeferedPromise<boolean>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve(true);
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Config'));
//         }
//     }
//     /**
//      * Start PWM
//      * Migration note old signature PWM_Start
//      * @param {Number} unit interface unit
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     PWM_Start(unit: number): Promise<void> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = PWM_CMD_START;
//         pkt.hdr.params[0] = unit;
//         return this.h2cCommand(pkt);
//     }
//     private replyPWMStart(packet: AevmPacket, deferPromise?: IDeferedPromise<void>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve();
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Start'));
//         }
//     }
//     /**
//      * Stop PWM
//      * Migration note old signature PWM_Stop
//      * @param {Number} unit interface unit
//      * @return {Promise}
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     PWM_Stop(unit: number): Promise<void> {
//         const pkt = new AevmPacket();
//         pkt.hdr.ifTypeUnit = this.getInterfaceUnit(unit);
//         pkt.hdr.command = PWM_CMD_STOP;
//         pkt.hdr.params[0] = unit;
//         return this.h2cCommand(pkt);
//     }
//     private replyPWMStop(packet: AevmPacket, deferPromise?: IDeferedPromise<void>) {
//         if (deferPromise === undefined) return;
//         if (packet.hdr.status === 0) {
//             deferPromise.resolve();
//         } else {
//             deferPromise.reject(OCFBase.statusMsg(packet.hdr.status,
//                 packet.payload.length > 0 ? OCFBase.bytesToAscii(packet.payload) : 'Failed in Stop'));
//         }
//     }
// }
//# sourceMappingURL=OCFPWM.js.map
"use strict";
// import { RegisterInfo, RegisterModel } from '../../ti-model-register/lib/RegisterDataModel';
// import { USB2ANY } from './Usb2anyCodec';
// /**
//  *  Copyright (c) 2020, Texas Instruments Incorporated
//  *  All rights reserved.
//  *
//  *  Redistribution and use in source and binary forms, with or without
//  *  modification, are permitted provided that the following conditions
//  *  are met:\
//  *
//  *  *   Redistributions of source code must retain the above copyright
//  *  notice, this list of conditions and the following disclaimer.
//  *  notice, this list of conditions and the following disclaimer in the
//  *  documentation and/or other materials provided with the distribution.
//  *  *   Neither the name of Texas Instruments Incorporated nor the names of
//  *  its contributors may be used to endorse or promote products derived
//  *  from this software without specific prior written permission.
//  *
//  *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//  *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
//  *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
//  *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
//  *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
//  *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
//  *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
//  *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
//  *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//  */
// /**
//  * Interface for Sub-modules like I2C, Power, GPIO, and SPI
//  */
// export abstract class ICommInterface {
//     constructor(readonly u2a: USB2ANY, settings: any, registerModel: RegisterModel){
//     }
//     abstract control(settings: any): Promise<void>;
//     abstract read(registerInfo: RegisterInfo, registerModel: RegisterModel, coreIndex: number): Promise<any>;
//     abstract write(registerInfo: RegisterInfo, value: number, registerModel: RegisterModel, coreIndex: number): Promise<any>;
//     abstract initSymbolsForDevice(config: any, registerModel: RegisterModel): void;
// }
// /**
//  * Unknown sub-modules implementation that shows error meessages
//  */
// class UnknownCommInterface extends ICommInterface{
//     constructor(readonly u2a: USB2ANY, settings: any, registerModel: RegisterModel) {
//         super(u2a, settings, registerModel);
//     }
//     control(settings: any): Promise<void> {
//         return this.fallbackThrowError();
//     }
//     read(registerInfo: RegisterInfo, registerModel: RegisterModel, coreIndex: number): Promise<any> {
//         return this.fallbackThrowError(registerInfo);
//     }
//     write(registerInfo: RegisterInfo, value: number, registerModel: RegisterModel, coreIndex: number): Promise<any>{
//         return this.fallbackThrowError(registerInfo);
//     }
//     initSymbolsForDevice(config: any, registerModel: RegisterModel): void {
//         this.fallbackThrowError();
//     }
//     private fallbackThrowError(registerInfo?: RegisterInfo): Promise<any> {
//         if (registerInfo !== undefined)
//             throw 'Unknow usb2any i/f for device ' + registerInfo.deviceName;
//         throw 'Unknow usb2any i/f';
//     }
// }
//# sourceMappingURL=ICommInterface.js.map
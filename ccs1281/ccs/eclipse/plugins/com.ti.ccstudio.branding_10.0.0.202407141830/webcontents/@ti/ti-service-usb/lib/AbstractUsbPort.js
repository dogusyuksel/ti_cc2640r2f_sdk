/**
 *  Copyright (c) 2019-2020, Texas Instruments Incorporated
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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AbstractDevice, console } from './AbstractDevice';
export * from './AbstractDevice';
export class UsbPortType {
    asUsbPortType(port) {
        return port;
    }
}
/**
 * @hidden
 */
export class AbstractUsbPort extends AbstractDevice {
    constructor(type, usbModule, descriptor) {
        super(usbModule, descriptor);
        this.type = type;
        this.usbModule.addListener('serialOpen', this.onOpenedHandler.bind(this));
        this.usbModule.addListener('serialClose', this.onClosedHandler.bind(this));
        this.usbModule.addListener('serialout', this.onDataHandler.bind(this));
        this.usbModule.addListener('dataError', this.onErrorHandler.bind(this));
    }
    getHandle(descriptor) {
        return (descriptor.path /* hid */ || descriptor.comName /* serial */);
    }
    get comName() {
        return this.descriptor.comName;
    }
    getName() {
        return this.comName;
    }
    async open(options) {
        console.logAPI(`${AbstractUsbPort.name}::${this.open.name}`, ...arguments);
        await this.usbModule.open({ ...this.descriptor, ...options });
        // TODO: [GC-2278] Remove this call when serial.js/usbhid.js cloud agent is fixed
        this.onOpenedHandler({ descriptor: this.descriptor });
        // TODO: [GC-2233] Remove this hack when serial.js in cloud agent is fixed
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    async close() {
        console.logAPI(`${AbstractUsbPort.name}::${this.close.name}`, ...arguments);
        await this.usbModule.close(this.descriptor);
    }
    async write(data) {
        console.logAPI(`${AbstractUsbPort.name}::${this.write.name}`, ...arguments);
        await this.usbModule.write(this.descriptor, data);
    }
}
//# sourceMappingURL=AbstractUsbPort.js.map
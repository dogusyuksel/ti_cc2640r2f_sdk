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
/**
 * `USBService` handles communications with the low level USB-Serial/USB-HID/USB-Device modules.
 * For USB-Serial and USB-HID devices, use the `listPorts` API to get a list of ports and
 * use the `listDevices` API to get a list of devices. Device handles communication with
 * TI USB devices and USB hub using low-level USB APIs such as controlTransfer. Device also
 * supports USB-BULK data transfer.
 * ### Usage
 * ```javascript
 * const service = ServicesRegistry.getService<IUsbService>(usbServiceType);
 * const ports = await service.listPorts()
 * const devices = await service.listDevices();
 * ```
 * @packageDocumentation
 */
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { Events, EventType } from '../../ti-core-assets/lib/Events';
import { backplaneServiceType } from '../../ti-service-backplane/lib/BackplaneService';
import { ServicesRegistry, ServiceType } from '../../ti-core-services/lib/ServicesRegistry';
import { UsbSerialPort, usbSerialPortType } from './UsbSerialPort';
import { UsbHidPort, usbHidPortType } from './UsbHidPort';
import { UsbDevice } from './UsbDevice';
/**
 * Device attahced event type.
 */
export const deviceAttachedEventType = new EventType('deviceAttachedEvent');
/**
 * Device detached event type.
 */
export const deviceDetachedEventType = new EventType('deviceDetachedEvent');
;
/*
 * Global variables.
 */
const MODULE_NAME = 'ti-service-usb';
const console = new TiConsole(MODULE_NAME);
export const usbServiceType = new ServiceType(MODULE_NAME);
const mergeDeviceLists = (existingDevices, newDevices) => {
    /* remove non existing device from the new device list */
    const result = existingDevices.filter(existingDevice => newDevices.find(newDevice => existingDevice.isEqual(newDevice)));
    /* add new device into existing device list */
    const length = result.length;
    for (let i = 0; i < newDevices.length; ++i) {
        let exist = false;
        for (let j = length - 1; j >= 0; --j) {
            if (newDevices[i].isEqual(result[j])) {
                exist = true;
                break;
            }
        }
        if (!exist) {
            result.push(newDevices[i]);
        }
    }
    return result;
};
/**
 * @hidden
 */
class UsbService extends Events {
    constructor() {
        super();
        this.backplane = ServicesRegistry.getService(backplaneServiceType);
        this.ports = new Array();
        this.devices = new Array();
        this.deviceAttachedHdlr = this._deviceAttachedHdlr.bind(this);
        this.deviceDetachedHdlr = this._deviceDetachedHdlr.bind(this);
    }
    _deviceAttachedHdlr(key) {
        (async () => {
            const devices = await this.listDevices(); // get an update list of device
            // find device in the devices list and fire event
            const device = devices.find(device => device.key === key);
            if (device) {
                this.fireEvent(deviceAttachedEventType, { device: device });
            }
        })();
    }
    _deviceDetachedHdlr(key) {
        // find device in existing list and fire event
        const device = this.devices.find(device => device.key === key);
        if (device) {
            this.fireEvent(deviceDetachedEventType, { device: device });
        }
    }
    async init() {
        if (!this.usbModule) {
            this.usbModule = await this.backplane.getSubModule('USB');
        }
    }
    addEventListener(type, listener) {
        console.logAPI(`${UsbService.name}::${this.addEventListener.name}`, ...arguments);
        this.init().then(() => {
            switch (type) {
                case deviceAttachedEventType:
                    if (!this.hasAnyListeners(deviceAttachedEventType))
                        this.usbModule.addListener('attach', this.deviceAttachedHdlr);
                    break;
                case deviceDetachedEventType:
                    if (!this.hasAnyListeners(deviceDetachedEventType))
                        this.usbModule.addListener('detach', this.deviceDetachedHdlr);
                    break;
            }
        });
        super.addEventListener(type, listener);
    }
    ;
    removeEventListener(type, listener) {
        console.logAPI(`${UsbService.name}::${this.removeEventListener.name}`, ...arguments);
        super.removeEventListener(type, listener);
        this.init().then(() => {
            switch (type) {
                case deviceAttachedEventType:
                    if (!this.hasAnyListeners(deviceAttachedEventType))
                        this.usbModule.removeListener('attach', this.deviceAttachedHdlr);
                    break;
                case deviceDetachedEventType:
                    if (!this.hasAnyListeners(deviceDetachedEventType))
                        this.usbModule.removeListener('detach', this.deviceDetachedHdlr);
                    break;
            }
        });
    }
    async listPorts(filter) {
        console.logAPI(`${UsbService.name}::${this.listPorts.name}`, ...arguments);
        await this.init();
        const ports = Array();
        /* list serial ports */
        if (!this.serialModule) {
            this.serialModule = await this.backplane.getSubModule('Serial');
        }
        const mySerialPorts = (await this.serialModule.list()).ports;
        mySerialPorts && mySerialPorts.forEach((port) => {
            ports.push(new UsbSerialPort(this.serialModule, port));
        });
        /* list USB-HID ports */
        if (!this.usbHidModule) {
            this.usbHidModule = await this.backplane.getSubModule('USB-HID');
        }
        const myHidPorts = (await this.usbHidModule.list()).ports;
        myHidPorts && myHidPorts.forEach((port) => {
            ports.push(new UsbHidPort(this.usbHidModule, port));
        });
        /*
         * Merge new ports to the existing list of ports, by adding new ports to the existing list
         * and removing ports that are no longer exist in the new list. This is to ensure that
         * the same port object is returned to multiple clients and event will be fire to all
         * listeners with the same port object.
         */
        this.ports = mergeDeviceLists(this.ports, ports);
        return this.ports.filter((port) => !filter || ((!filter.vendorId || filter.vendorId === port.descriptor.vendorId) && (!filter.type || filter.type === port.type)));
    }
    async listDevices(vendorId) {
        console.logAPI(`${UsbService.name}::${this.listDevices.name}`, ...arguments);
        await this.init();
        if (!this.usbModule) {
            this.usbModule = await this.backplane.getSubModule('USB');
        }
        const devices = Array();
        const myDevices = (await this.usbModule.list(vendorId || '')).deviceInfoList;
        myDevices && myDevices.forEach((device) => {
            devices.push(new UsbDevice(this.usbModule, device));
        });
        this.devices = mergeDeviceLists(this.devices, devices);
        return this.devices;
    }
    async getDefaultPort(ports, deviceName) {
        console.logAPI(`${UsbService.name}::${this.getDefaultPort.name}`, ...arguments);
        await this.init();
        const serialPorts = ports.filter(port => port.type === usbSerialPortType).map(port => port.descriptor);
        const util = await this.backplane.getUtil();
        if (serialPorts.length > 0) {
            await util.selectDefaultPort({ ports: serialPorts, targetName: deviceName });
        }
        const baudRates = await util.getBaudRates();
        for (let i = 0; i < ports.length; ++i) {
            if (ports[i].type === usbSerialPortType && ports[i].descriptor.selected) {
                for (let j = 0; j < baudRates.length; ++j) {
                    if (baudRates[j].selected) {
                        return { port: ports[i], baudRate: baudRates[j].rate };
                    }
                }
                return { port: ports[i] };
            }
        }
        const hidPorts = ports.filter(port => port.type === usbHidPortType);
        if (hidPorts.length > 0 && serialPorts.length > 0) {
            return { port: hidPorts[0] }; // for mixed serial and hid default to hid over usb, since hid ports are filtered by Texas Instruments manufacture id.
        }
    }
    ;
}
;
ServicesRegistry.register(usbServiceType, UsbService);
//# sourceMappingURL=UsbService.js.map
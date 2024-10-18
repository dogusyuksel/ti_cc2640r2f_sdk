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
import { connectionManager } from '../../ti-target-connection-manager/lib/ConnectionManager';
import { AbstractTransport } from '../../ti-target-connection-manager/lib/AbstractTransport';
import { usbServiceType } from '../../ti-service-usb/lib/UsbService';
import { usbHidPortType } from '../../ti-service-usb/lib/UsbHidPort';
import { usbSerialPortType, dataEventType } from '../../ti-service-usb/lib/UsbSerialPort';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { bufferOrStringDataType, bufferDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { EventType } from '../../ti-core-assets/lib/Events';
import { TiLocalStorage } from '../../ti-core-assets/lib/TiLocalStorage';
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
;
var StorageKeys;
(function (StorageKeys) {
    StorageKeys["baudRate"] = "baudRate";
    StorageKeys["comPort"] = "comPort";
})(StorageKeys || (StorageKeys = {}));
;
;
export const filterPortsEventType = new EventType('filterUsbPorts');
;
export const selectedPortEventType = new EventType('selectedUsbPort');
;
const HID_RESERVED = 2; // packet bytes reserved by HID
const MAX_PACKET_SIZE = 64 - HID_RESERVED; // size, in bytes, of a USB packet
export class UsbTransport extends AbstractTransport {
    constructor(params) {
        super();
        this.params = params;
        this.encoderInputType = bufferOrStringDataType;
        this.encoderOutputType = bufferDataType;
        this.serialPacketDataHandler = (details) => {
            if (this.codec) {
                this.codec.decode(details.data);
            }
        };
        this.hidPacketDataHandler = (details) => {
            if (this.codec) {
                const rawData = details.data;
                const nRead = rawData[1] || 0;
                if (rawData[0] !== 0x3F) {
                    throw `Invald HID packet header.  Expected the first byte to be 0x3F instead of ${rawData[0]}`;
                }
                else if (nRead > MAX_PACKET_SIZE || nRead < 0) {
                    throw 'Invalid HID packet.  Too much data';
                }
                else if (nRead > 0) { // ignore zero size packets.
                    return this.codec.decode(rawData.slice(HID_RESERVED, nRead + HID_RESERVED));
                }
            }
        };
        connectionManager.registerTransport(this);
        CodecRegistry.register(this);
        if (!UsbTransport.instances.includes(this)) {
            UsbTransport.instances.push(this);
        }
    }
    ;
    get id() {
        return this.params.id || 'usb';
    }
    get selectedPort() {
        return this.usbPort;
    }
    ;
    async doConnect(logger) {
        const acquiredPortSelection = await UsbTransport.acquirePort(this);
        this.assertStillConnecting();
        if (!acquiredPortSelection) {
            throw new Error('No port found');
        }
        this.usbPort = acquiredPortSelection.port;
        this.baudRate = acquiredPortSelection.baudRate;
        this.fireEvent(selectedPortEventType, { port: this.usbPort, baudRate: this.baudRate });
        this.rxDataHandler = this.usbPort.type === usbHidPortType ? this.hidPacketDataHandler : this.serialPacketDataHandler;
        this.usbPort.addEventListener(dataEventType, this.rxDataHandler);
        await this.usbPort.open({ baudRate: this.baudRate });
        this.preferredPortName = this.usbPort.comName;
    }
    ;
    async doDisconnect(logger) {
        if (this.usbPort) {
            if (this.rxDataHandler) {
                this.usbPort.removeEventListener(dataEventType, this.rxDataHandler);
            }
            await this.usbPort.close();
            this.usbPort = undefined;
        }
    }
    ;
    dispose() {
        const i = UsbTransport.instances.indexOf(this);
        if (i >= 0) {
            UsbTransport.instances.splice(i, 1);
        }
    }
    ;
    encode(data) {
        if (this.usbPort) {
            if (this.usbPort.type === usbHidPortType) {
                // Add header to HID packets.
                const header = [0x3f, data.length];
                if (typeof data === 'string') {
                    this.usbPort.write(String.fromCharCode(...header) + data);
                }
                else {
                    this.usbPort.write([...header, ...data]);
                }
            }
            else {
                // No header for Serial packets
                this.usbPort.write(data);
            }
        }
    }
    ;
    addChildDecoder(decoder) {
        this.codec = decoder;
    }
    ;
    deconfigure() {
        this.codec = undefined;
    }
    ;
    filterPorts(ports) {
        // filter ports based on hid and usb flags.  If usb and hid both are false, then filter by usb.
        if (!this.params.hid) {
            ports = ports.filter(port => port.type === usbSerialPortType);
        }
        else if (!this.params.usb) {
            ports = ports.filter(port => port.type === usbHidPortType);
        } // else both usb, and hid are true, so no filtering required.
        const details = { ports: ports };
        this.fireEvent(filterPortsEventType, details);
        return details;
    }
    ;
    onPortsChanged(ports) {
    }
    ;
    get storageKeyPrefix() {
        return `${TiUtils.appName}_${this.params.id}_`;
    }
    ;
    get userSelectedPortName() {
        if (!this._userSelectedPortName) {
            this._userSelectedPortName = TiLocalStorage.getItem(this.storageKeyPrefix + StorageKeys.comPort) || undefined;
        }
        return this._userSelectedPortName;
    }
    ;
    set userSelectedPortName(comPort) {
        if (comPort) {
            TiLocalStorage.setItem(this.storageKeyPrefix + StorageKeys.comPort, comPort);
        }
        else {
            TiLocalStorage.removeItem(this.storageKeyPrefix + StorageKeys.comPort);
        }
        this._userSelectedPortName = comPort || undefined;
    }
    ;
    get userSelectedBaudRate() {
        if (!this._userSelectedBaudRate) {
            const baudRateName = TiLocalStorage.getItem(this.storageKeyPrefix + StorageKeys.baudRate);
            if (baudRateName) {
                this._userSelectedBaudRate = Number.parseInt(baudRateName);
            }
        }
        return this._userSelectedBaudRate;
    }
    ;
    set userSelectedBaudRate(baudRate) {
        if (baudRate) {
            TiLocalStorage.setItem(this.storageKeyPrefix + StorageKeys.baudRate, baudRate.toString());
        }
        else {
            TiLocalStorage.removeItem(this.storageKeyPrefix + StorageKeys.baudRate);
        }
        this._userSelectedBaudRate = baudRate || undefined;
    }
    ;
    computeScoreForPortAllocation(comName, recommendedPortName) {
        let result = this.params.optional ? 0 : 1;
        if (comName === this.userSelectedPortName) {
            result += 8;
        }
        if (comName === this.preferredPortName) {
            result += 4;
        }
        if (comName === recommendedPortName) {
            result += 2;
        }
        return result;
    }
    ;
    static async computeScoresForPortAllocation(ports, transports) {
        const scores = [];
        const usbService = ServicesRegistry.getService(usbServiceType);
        for (let i = 0; i < transports.length; i++) {
            const transport = transports[i];
            // eslint-disable-next-line prefer-const
            let { ports: filteredPorts, recommendedPort: recommendedPort, recommendedBaudRate: recommendedBaudRate } = transport.filterPorts(ports);
            if (!recommendedPort) {
                const defaultPort = await usbService.getDefaultPort(filteredPorts, transport.params.deviceId);
                if (defaultPort) {
                    recommendedPort = defaultPort.port;
                    recommendedBaudRate = defaultPort.baudRate;
                }
            }
            const recommendedComName = recommendedPort ? recommendedPort.comName : undefined;
            filteredPorts.forEach((port) => {
                scores.push({
                    port: port,
                    transport: transport,
                    score: transport.computeScoreForPortAllocation(port.comName, recommendedComName),
                    baudRate: recommendedBaudRate || transport.params.defaultBaudRate || 9600
                });
            });
        }
        return scores;
    }
    ;
    static async allocatePorts(ports, transports) {
        let scores = await this.computeScoresForPortAllocation(ports, transports);
        scores = scores.sort((a, b) => b.score - a.score);
        const picks = [];
        while (scores.length > 0) {
            const pick = scores[0];
            scores = scores.filter((score) => score.port !== pick.port && score.transport !== pick.transport);
            picks.push(pick);
        }
        return picks;
    }
    ;
    static acquirePort(forTransport) {
        if (!this.acquirePortsForList.includes(forTransport)) {
            this.acquirePortsForList.push(forTransport);
        }
        if (!this.acquirePortPromise) {
            const usbService = ServicesRegistry.getService(usbServiceType);
            this.acquirePortPromise = usbService.listPorts().then(ports => {
                // Notify if all ports that are in use have been dropped, and also reserve ports already in use.
                this.instances.forEach(transport => transport.onPortsChanged(ports));
                // filter by reserved ports, including transports as well as other users.
                ports = ports.filter(port => !port.isOpened);
                return ports.length > 0 ? this.allocatePorts(ports, this.acquirePortsForList) : [];
            }).finally(() => {
                this.acquirePortPromise = undefined;
                this.acquirePortsForList = [];
            });
        }
        return this.acquirePortPromise.then((allocatedPorts) => {
            return allocatedPorts.reduce((port, item) => item.transport === forTransport ? item : port, undefined);
        });
    }
    ;
}
UsbTransport.instances = [];
UsbTransport.acquirePortsForList = [];
;
//# sourceMappingURL=UsbTransport.js.map
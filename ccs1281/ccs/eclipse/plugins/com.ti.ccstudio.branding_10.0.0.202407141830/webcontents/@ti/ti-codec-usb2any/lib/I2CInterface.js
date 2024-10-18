/* eslint-disable @typescript-eslint/camelcase */
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
import { RegisterModelEncoderType, RegisterModelDecoderType } from '../../ti-model-register/lib/RegisterModel';
import { Command, getPayload, getResult, getResultLSB, setBytes, setBytesLSB, concatenateResults, getMultipleRegisterReadResult, MAX_PAYLOAD, IUsb2anyEncoderType, nullUsb2anyEncoder } from './Usb2anyCodec';
import { CRC } from '../../ti-codec-aevm/lib/Crc';
import { NoopDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
import { AbstractDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
const I2C_100kHz = 0;
const I2C_400kHz = 1;
const I2C_10kHz = 2;
const I2C_800kHz = 3;
const I2C_7Bits = 0;
const I2C_10Bits = 1;
const I2C_PullUps_OFF = 0;
const I2C_PullUps_ON = 1;
const MAX_COUNT = MAX_PAYLOAD - 6;
/**
 * I2C Interface sub-module definition
*/
export class I2CInterface extends AbstractDecoder {
    constructor(settings) {
        super(settings.id || 'i2c', NoopDecoderType, IUsb2anyEncoderType);
        this.settings = settings;
        this.targetEncoder = nullUsb2anyEncoder;
        this.encoderInputType = RegisterModelEncoderType;
        this.encoderOutputType = RegisterModelDecoderType;
        this.setDataBytes = setBytes;
        this.getDataResult = getResult;
        this.dataEndian = 'big';
        this.internalAddrsBytes = 1;
        const i2cAddressHi = (+settings.deviceAddrs >> 8) & 0xff;
        const i2cAddressLo = +settings.deviceAddrs & 0xff;
        this.readData = [i2cAddressHi, i2cAddressLo];
        this.writeData = [i2cAddressHi, i2cAddressLo];
        const internalAddrsBits = TiUtils.parseNumberProperty('internalAddrsBits', settings.internalAddrsBits || 8, 1, 16);
        this.internalAddrsBytes = Math.ceil(internalAddrsBits / 8);
        this.sequentialRead = settings.sequentialRead || false;
        this.readWithAddress = settings.readWithAddress || false;
        if (settings.crc) {
            this.crc = new CRC(settings.crc);
        }
        if (settings.dataEndian === 'little') {
            this.setDataBytes = setBytesLSB;
            this.getDataResult = getResultLSB;
            this.dataEndian = settings.dataEndian;
        }
        else {
            this.setDataBytes = setBytes;
            this.getDataResult = getResult;
        }
    }
    deconfigure() {
        // called by CodecRegistry before connect
        this.targetEncoder.removeConfigureFirmwareListener(this);
        this.targetEncoder = nullUsb2anyEncoder;
        this.registerModel = undefined;
    }
    setParentEncoder(parent) {
        super.setParentEncoder(parent);
        parent.addConfigureFirmwareListener(this);
    }
    addChildDecoder(child) {
        this.registerModel = child;
        // TODO RegisterModel.setSymbols(deviceInfo) covers readDeviceAddrsMap and is called by RegisterModel ctor.
        // Ask whether there is any need to call setSymbols by other code.
        // this.registerModel.readDeviceAddrsMap('I2C', this.settings);
    }
    configureFirmware() {
        let speed = I2C_10kHz;
        const settings = this.settings;
        switch (settings.speed) {
            case 100:
                speed = I2C_100kHz;
                break;
            case 400:
                speed = I2C_400kHz;
                break;
            case 800:
                speed = I2C_800kHz;
                break;
        }
        let addrsBits = I2C_7Bits;
        switch (settings.addrsBits) {
            case 10:
                addrsBits = I2C_10Bits;
                break;
        }
        const pullUps = settings.pullup ? I2C_PullUps_ON : I2C_PullUps_OFF;
        this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_Control, [
            speed, addrsBits, pullUps
        ]);
        return Promise.resolve();
    }
    setDeviceAddress(buffer, info) {
        let deviceAddrs;
        if (info.deviceAddrs && !isNaN(info.deviceAddrs)) {
            deviceAddrs = +info.deviceAddrs;
            buffer[0] = (deviceAddrs >> 8) & 0xff;
            buffer[1] = deviceAddrs & 0xff;
        }
        else if (this.registerModel) {
            deviceAddrs = this.registerModel.getDeviceAddrsForRegister(info);
            buffer[0] = (deviceAddrs >> 8) & 0xff;
            buffer[1] = deviceAddrs & 0xff;
        }
    }
    async readValue(info, coreIndex) {
        this.setDeviceAddress(this.readData, info);
        const numBytes = info.nBytes !== undefined ? info.nBytes : Math.ceil(info.size !== undefined ? info.size / 8 : 1);
        if (this.readWithAddress) {
            // Using I2C ReadWithAddress API
            this.readData[2] = info.addr || 0;
            this.readData[3] = numBytes;
        }
        else {
            // Using I2C ReadInternal API
            // readData[0-1] - device address
            // readData[2] - size of internal address, in bytes (must be 0, 1, or 2)
            this.readData[2] = this.internalAddrsBytes;
            // readData[3-4] - number of bytes of data
            this.readData[3] = (numBytes >> 8) & 0xff;
            this.readData[4] = numBytes & 0xff;
            // readData[5-6] - Internal address of the data to read
            if (this.internalAddrsBytes === 1) {
                // 1 byte register address
                this.readData[5] = info.addr || 0;
            }
            else {
                // 2 byte register address
                this.readData[5] = info.addr ? (info.addr >> 8) & 0xff : 0;
                this.readData[6] = info.addr ? info.addr & 0xff : 0;
            }
        }
        const cmd = this.readWithAddress ? Command.Cmd_I2C_ReadWithAddress : Command.Cmd_I2C_ReadInternal;
        if (this.crcUser && this.crc) {
            let data = this.readData.slice();
            let crcData = this.crcUser.embed_crc_data(this.crc, {
                write: false,
                deviceAddr: (this.readData[0] << 8) | (this.readData[1] & 0xff),
                registerAddr: info.addr,
                payload: data,
                numBytes: numBytes
            });
            data = (crcData && crcData.payload) || data;
            if (crcData && crcData.numBytes) {
                if (this.readWithAddress) {
                    data[3] = crcData.numBytes;
                }
                else {
                    data[3] = (crcData.numBytes >> 8) & 0xff;
                    data[4] = crcData.numBytes & 0xff;
                }
            }
            const result = await this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(cmd, data));
            let payload = getPayload(result);
            crcData = this.crcUser.verify_crc_data(this.crc, {
                payload: payload
            });
            if (crcData && crcData.valid === false) {
                return Promise.reject('Invalid CRC');
            }
            payload = (crcData && crcData.payload) || payload;
            let resultValue = 0;
            if (this.dataEndian === 'little') {
                for (let i = payload.length - 1; i >= 0; i--) {
                    resultValue = (resultValue << 8) | (payload[i] & 0xff);
                }
            }
            else {
                for (let i = 0; i < payload.length; i++) {
                    resultValue = (resultValue << 8) | (payload[i] & 0xff);
                }
            }
            return resultValue;
        }
        else {
            return this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(cmd, this.readData)).then(this.getDataResult);
        }
    }
    multiRegisterRead(startRegisterInfo, count, coreIndex) {
        if (this.sequentialRead) {
            return this.sequentialReadRegisters(startRegisterInfo, count);
        }
        else {
            const promises = [];
            const info = { ...startRegisterInfo };
            for (let i = 0; i < count; i++) {
                promises.push(this.readValue(info, coreIndex));
                info.addr++;
            }
            return Promise.all(promises);
        }
    }
    sequentialReadRegisters(startRegisterInfo, count) {
        this.setDeviceAddress(this.readData, startRegisterInfo);
        if (count > MAX_COUNT) {
            // need to split into two or more hid packets.
            const promises = [];
            let startAddrs = startRegisterInfo.addr || 0;
            while (count > MAX_COUNT) {
                this.readData[2] = startAddrs;
                this.readData[3] = MAX_COUNT;
                // TODO change to I2C ReadInternal API
                promises.push(this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_ReadWithAddress, this.readData)).then(getMultipleRegisterReadResult));
                count -= MAX_COUNT;
                startAddrs += MAX_COUNT;
            }
            this.readData[2] = startAddrs;
            this.readData[3] = count;
            // TODO change to I2C ReadInternal API
            promises.push(this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_ReadWithAddress, this.readData)).then(getMultipleRegisterReadResult));
            return Promise.all(promises).then(concatenateResults);
        }
        else {
            this.readData[2] = startRegisterInfo.addr || 0;
            this.readData[3] = count;
            return this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_ReadWithAddress, this.readData)).then(getMultipleRegisterReadResult);
        }
    }
    writeValue(info, value, coreIndex) {
        const nBytes = info.nBytes !== undefined ? info.nBytes : Math.ceil(info.size !== undefined ? info.size / 8 : 1);
        const size = 4 + nBytes;
        if (size <= this.writeData.length) {
            this.writeData = this.writeData.slice(0, size);
        }
        this.setDeviceAddress(this.writeData, info);
        this.writeData[2] = nBytes + 1;
        this.writeData[3] = (info.writeAddr === undefined ? info.addr : info.writeAddr) || 0;
        this.setDataBytes(this.writeData, nBytes, value, 4);
        let data = this.writeData.slice();
        if (this.crcUser && this.crc) {
            const crcData = this.crcUser.embed_crc_data(this.crc, {
                write: true,
                deviceAddr: (this.writeData[0] << 8) | (this.writeData[1] & 0xff),
                registerAddr: this.writeData[3],
                writeData: value,
                payload: data,
                numBytes: nBytes
            });
            data = (crcData && crcData.payload) || data;
            if (crcData && crcData.numBytes) {
                data[2] = Math.min(crcData.numBytes + 1, data.length - 3); // GC-2381
            }
        }
        return this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_Write, data));
    }
    I2C_Read(slaveAddr, numBytes) {
        const buffer = [(slaveAddr >> 8) & 0xff, slaveAddr & 0xff, numBytes & 0xff];
        return this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_Read, buffer)).then(getPayload);
    }
    I2C_Write(slaveAddr, pDataBuffer) {
        const buffer = [(slaveAddr >> 8) & 0xff, slaveAddr & 0xff, pDataBuffer.length & 0xff];
        buffer.push(...pDataBuffer);
        return this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_I2C_Write, buffer));
    }
}
//# sourceMappingURL=I2CInterface.js.map
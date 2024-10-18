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
import { Command, PACKET_PAYLOAD, IUsb2anyEncoderType, nullUsb2anyEncoder } from './Usb2anyCodec';
import { AbstractDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
import { NoopDecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
/**
 * Power sub-module implementation
 */
export class PowerInterface extends AbstractDecoder {
    constructor(settings) {
        super(settings.id || 'power', NoopDecoderType, IUsb2anyEncoderType);
        this.settings = settings;
        this.targetEncoder = nullUsb2anyEncoder;
    }
    deconfigure() {
        // called by CodecRegistry before connect
        this.targetEncoder.removeConfigureFirmwareListener(this);
        this.targetEncoder = nullUsb2anyEncoder;
    }
    setParentEncoder(parent) {
        super.setParentEncoder(parent);
        parent.addConfigureFirmwareListener(this, 1);
    }
    configureFirmware() {
        const settings = this.settings;
        const v33power = settings['V3.3'] ? 1 : 0;
        const v50power = settings['V5.0'] ? 1 : 0;
        const vadjpower = settings['Vadj'] ? 1 : 0;
        this.targetEncoder.sendCommandPacket(Command.Cmd_Power_Enable, [v33power, v50power, vadjpower, 0]);
        return this.readStatus().then((status) => {
            if ((status & 7) !== 0) {
                throw 'USB2ANY power fault detected for ' + (status & 1) ? '3.3V.' : (status & 2) ? '5.0V.' : 'Vadj.';
            }
        });
    }
    readStatus() {
        return this.targetEncoder.readResponse(this.targetEncoder.sendCommandPacket(Command.Cmd_Power_ReadStatus, [0, 0, 0x5a, 0x5a])).then((packet) => {
            return packet[PACKET_PAYLOAD] | (packet[PACKET_PAYLOAD + 1] << 1) | (packet[PACKET_PAYLOAD + 2] << 2) | (packet[PACKET_PAYLOAD + 3] << 3);
        });
    }
}
//# sourceMappingURL=PowerInterface.js.map
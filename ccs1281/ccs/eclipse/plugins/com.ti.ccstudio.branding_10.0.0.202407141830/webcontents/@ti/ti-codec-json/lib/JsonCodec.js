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
import { AbstractDataCodec } from '../../ti-target-configuration/lib/AbstractCodec';
import { streamingCodecDataType } from '../../ti-model-streaming/lib/StreamingDataModel';
import { bufferOrStringDataType, stringDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
export class JsonCodec extends AbstractDataCodec {
    constructor(params) {
        super(params.id || 'json', bufferOrStringDataType, stringDataType, streamingCodecDataType, streamingCodecDataType);
        this.numPacketsReceived = 0;
    }
    ;
    encode(data) {
        this.targetEncoder.encode(JSON.stringify(data));
    }
    ;
    decode(rawdata) {
        let result = false;
        try {
            let cleanPacket = '';
            const message = typeof rawdata === 'string' ? rawdata : String.fromCharCode(...rawdata);
            try {
                // remove any leading or trailing garbage characters
                cleanPacket = message.substring(message.indexOf('{'), message.lastIndexOf('}') + 1);
                // remove any spaces between : and the value
                while (cleanPacket.indexOf(': ') > 0) {
                    cleanPacket = cleanPacket.substring(0, cleanPacket.indexOf(': ') + 1) + cleanPacket.substring(cleanPacket.indexOf(': ') + 2).trim();
                }
                this.targetDecoder.decode(JSON.parse(cleanPacket));
                result = true;
            }
            catch (e) {
                if (this.numPacketsReceived > 0) {
                    result = Error(`received non JSON data string:[${cleanPacket}]`);
                }
            }
            this.numPacketsReceived++;
        }
        catch (ex) {
            result = new Error('Error converting buffer to text string');
        }
        return result;
    }
    ;
    deconfigure() {
        super.deconfigure();
        this.numPacketsReceived = 0;
    }
    ;
}
;
//# sourceMappingURL=JsonCodec.js.map
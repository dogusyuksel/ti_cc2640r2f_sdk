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
import { PrimitiveDataType } from './CodecDataTypes';
import { CodecRegistry } from './CodecRegistry';
import { Events } from '../../ti-core-assets/lib/Events';
;
;
;
;
;
;
;
;
;
;
const nullType = new PrimitiveDataType('null');
const nullCodec = new (class extends Events {
    constructor() {
        super(...arguments);
        this.encoderInputType = nullType;
        this.encoderOutputType = nullType;
        this.decoderInputType = nullType;
        this.decoderOutputType = nullType;
        this.id = 'null';
    }
    encode(data) {
    }
    ;
    decode(data) {
        return false;
    }
    ;
    addChildDecoder(child) {
    }
    ;
    setParentEncoder(parent) {
    }
    ;
})();
export class AbstractEncoder extends Events {
    constructor(id, encoderInputType, encoderOutputType) {
        super();
        this.id = id;
        this.encoderInputType = encoderInputType;
        this.encoderOutputType = encoderOutputType;
        CodecRegistry.register(this);
    }
    ;
    addChildDecoder(child) {
        this.targetDecoder = child;
    }
    ;
}
;
export class AbstractDecoder extends Events {
    constructor(id, decoderInputType, decoderOutputType) {
        super();
        this.id = id;
        this.decoderInputType = decoderInputType;
        this.decoderOutputType = decoderOutputType;
        CodecRegistry.register(this);
    }
    ;
    setParentEncoder(parent) {
        this.targetEncoder = parent;
    }
    ;
    toString() {
        return `codec ${this.id}`;
    }
    ;
}
;
export class AbstractCodec extends AbstractDecoder {
    constructor(id, decoderInputType, decoderOutputType, encoderOutputType, encoderInputType) {
        super(id, decoderInputType, decoderOutputType);
        this.encoderOutputType = encoderOutputType;
        this.encoderInputType = encoderInputType;
    }
    ;
    addChildDecoder(child) {
        if (this.targetDecoder) {
            throw new Error(`${this.toString()} does not support multiple child decoders.`);
        }
        else {
            this.targetDecoder = child;
        }
    }
    ;
}
;
export class AbstractDataDecoder extends AbstractDecoder {
    constructor(id, decoderInputType, decoderOutputType) {
        super(id, decoderInputType, decoderOutputType);
        this.targetEncoder = nullCodec;
    }
    ;
    deconfigure() {
        this.targetEncoder = nullCodec;
    }
    ;
}
;
export class AbstractDataCodec extends AbstractDataDecoder {
    constructor(id, decoderInputType, decoderOutputType, encoderOutputType, encoderInputType) {
        super(id, decoderInputType, decoderOutputType);
        this.encoderOutputType = encoderOutputType;
        this.encoderInputType = encoderInputType;
        this.targetDecoder = nullCodec;
    }
    ;
    addChildDecoder(child) {
        if (this.targetDecoder && this.targetDecoder !== nullCodec) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            this.targetDecoder = new DataDecoderTap(child, this.targetDecoder);
        }
        else {
            this.targetDecoder = child;
        }
    }
    ;
    deconfigure() {
        super.deconfigure();
        this.targetDecoder = nullCodec;
    }
    ;
}
;
class DataDecoderTap extends AbstractDataDecoder {
    constructor(targetDecoder, next) {
        super('tap', targetDecoder.decoderInputType, targetDecoder.decoderOutputType);
        this.targetDecoder = targetDecoder;
        this.next = next;
    }
    ;
    decode(data) {
        const result1 = this.targetDecoder.decode(data);
        const result2 = this.next.decode(data);
        return result1 instanceof Error ? result1 : result2 instanceof Error ? result2 : result1 || result2;
    }
    ;
}
;
//# sourceMappingURL=AbstractCodec.js.map
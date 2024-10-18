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
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Events, EventType } from '../../ti-core-assets/lib/Events';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
/**
 * @hidden
 */
export const MODULE_NAME = 'ti-service-ds';
const console = new TiConsole(MODULE_NAME);
export class DSEventType extends EventType {
    constructor(eventName, subObjectName) {
        super(eventName);
        this.subObjectName = subObjectName;
        this.dsEventType = true;
    }
}
/**
 * @hidden
 */
export class AbstractDSModule extends Events {
    constructor(moduleName, dsModule) {
        super();
        this.moduleName = moduleName;
        this.dsModule = dsModule;
    }
    prolog(apiName, ...params) {
        console.logAPI(apiName, ...params);
    }
    toString() {
        return this.moduleName;
    }
    isDSEvent(object) {
        return 'dsEventType' in object;
    }
    addEventListener(type, listener) {
        this.prolog(this.addEventListener.name, ...arguments);
        if (this.isDSEvent(type)) {
            if (type.subObjectName) {
                this.dsModule[type.subObjectName].addListener(type.eventName, listener);
            }
            else {
                this.dsModule.addListener(type.eventName, listener);
            }
        }
        else {
            super.addEventListener(type, listener);
        }
    }
    removeEventListener(type, listener) {
        this.prolog(this.removeEventListener.name, ...arguments);
        if (this.isDSEvent(type)) {
            if (type.subObjectName) {
                this.dsModule[type.subObjectName].removeListener(type.eventName, listener);
            }
            else {
                this.dsModule.removeListener(type.eventName, listener);
            }
        }
        else {
            super.removeEventListener(type, listener);
        }
    }
}
//# sourceMappingURL=AbstractDSModule.js.map
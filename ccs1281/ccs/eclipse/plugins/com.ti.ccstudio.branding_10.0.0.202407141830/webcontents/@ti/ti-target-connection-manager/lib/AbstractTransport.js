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
 *
*/
import { Events, EventType } from '../../ti-core-assets/lib/Events';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
;
export var TRANSPORT_STATE;
(function (TRANSPORT_STATE) {
    TRANSPORT_STATE["DISCONNECTED"] = "disconnected";
    TRANSPORT_STATE["CONNECTED"] = "connected";
    TRANSPORT_STATE["CONNECTING"] = "connecting";
    TRANSPORT_STATE["DISCONNECTING"] = "disconnecting";
})(TRANSPORT_STATE || (TRANSPORT_STATE = {}));
;
;
export const connectedStateChangedEventType = new EventType('ConnectedStateChanged');
;
export const connectionLogEventType = new EventType('ConnectionLog');
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
;
class ConnectionLogger {
    constructor(target, eventEmitter) {
        this.target = target;
        this.eventEmitter = eventEmitter;
        this.lastLogMessage = '';
        this.lastLogType = 'info';
    }
    ;
    assertStillConnecting() {
        this.target.assertStillConnecting();
    }
    ;
    addProgressMessage(message) {
        if (this.lastLogType === 'info') {
            this.lastLogMessage = message;
        }
        this.addLogMessage('info', message);
    }
    ;
    addErrorMessage(message) {
        this.lastLogMessage = 'Error: ' + message;
        this.lastLogType = 'error';
        this.addLogMessage('error', message);
    }
    ;
    addWarningMessage(message) {
        if (this.lastLogType !== 'error') {
            this.lastLogMessage = 'Warning: ' + message;
            this.lastLogType = 'warning';
        }
        this.addLogMessage('warning', message);
    }
    ;
    addDebugMessage(message) {
        this.addLogMessage('debug', message);
    }
    ;
    addLogMessage(type, message) {
        if (message) {
            this.eventEmitter(connectionLogEventType, { type: type, message: capitalize(message), transportId: this.target.id });
        }
    }
    ;
    clear() {
        this.lastLogMessage = '';
        this.lastLogType = 'info';
    }
    ;
    get statusMessage() {
        return this.lastLogMessage;
    }
    ;
}
;
export class AbstractTransport extends Events {
    constructor() {
        super(...arguments);
        this.optional = false;
        this.connectPromise = Promise.resolve();
        this.disconnectPromise = Promise.resolve();
        this._state = TRANSPORT_STATE.DISCONNECTED;
        this.logger = new ConnectionLogger(this, this.fireEvent.bind(this));
    }
    get state() {
        return this._state;
    }
    ;
    isConnected() {
        return this._state === TRANSPORT_STATE.CONNECTED;
    }
    ;
    isConnecting() {
        return this._state === TRANSPORT_STATE.CONNECTING;
    }
    ;
    canConnect() {
        return this.isDisconnected() || this.isDisconnecting();
    }
    ;
    isDisconnected() {
        return this._state === TRANSPORT_STATE.DISCONNECTED;
    }
    ;
    isDisconnecting() {
        return this._state === TRANSPORT_STATE.DISCONNECTING;
    }
    ;
    canDisconnect() {
        return this.isConnected() || this.isConnecting();
    }
    ;
    assertStillConnecting() {
        if (!this.isConnecting()) {
            throw new Error(`Connecting on transport ${this.id} was aborted by the user.`);
        }
    }
    ;
    setState(newState) {
        if (this._state !== newState) {
            this._state = newState;
            this.fireEvent(connectedStateChangedEventType, { newState: this._state, transport: this });
        }
    }
    ;
    async disconnect() {
        if (this.canDisconnect()) {
            this.setState(TRANSPORT_STATE.DISCONNECTING);
            this.logger.addProgressMessage(''); // clear any progress messages from last connection, but keep errors and warnings.
            // eslint-disable-next-line no-async-promise-executor
            this.disconnectPromise = new Promise(async (resolve, reject) => {
                try {
                    await this.connectPromise;
                    await this.onDisconnect();
                    if (this._state === TRANSPORT_STATE.DISCONNECTING) {
                        this.setState(TRANSPORT_STATE.DISCONNECTED);
                    }
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        return this.disconnectPromise;
    }
    ;
    async connect() {
        if (this.canConnect()) {
            this.setState(TRANSPORT_STATE.CONNECTING);
            // clear logger every time we connect, but not on disonnect to preserve last error/warning message.
            this.logger.clear();
            // eslint-disable-next-line no-async-promise-executor
            this.connectPromise = new Promise(async (resolve, reject) => {
                try {
                    await this.disconnectPromise;
                    await this.onConnect();
                    if (this._state === TRANSPORT_STATE.CONNECTING) {
                        this.setState(TRANSPORT_STATE.CONNECTED);
                    }
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        return this.connectPromise;
    }
    ;
    get statusMessage() {
        return this.logger.statusMessage;
    }
    ;
    onConnect() {
        return CodecRegistry.connect(this.id, this.logger);
    }
    ;
    onDisconnect() {
        return CodecRegistry.disconnect(this.id, this.logger);
    }
    ;
    toString() {
        return `transport ${this.id}`;
    }
    ;
}
;
//# sourceMappingURL=AbstractTransport.js.map
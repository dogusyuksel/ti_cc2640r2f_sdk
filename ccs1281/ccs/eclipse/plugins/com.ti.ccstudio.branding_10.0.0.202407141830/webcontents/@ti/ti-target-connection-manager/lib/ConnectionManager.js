import { AbstractTransport, TRANSPORT_STATE, connectedStateChangedEventType } from './AbstractTransport';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
/* eslint-disable @typescript-eslint/no-unused-vars */
let transports = new Array();
let programLoaders = Array();
class ConnectionManager extends AbstractTransport {
    constructor() {
        super(...arguments);
        this.id = 'connectionManager';
        this.isBusy = false;
        this.isPartiallyConnected = false;
        this.configurations = new Map();
        this.waitForConfigurations = new Map();
        this.transportStateChangedHandler = () => {
            if (!this.isBusy) {
                this.computeStatus();
            }
        };
    }
    async onConnect() {
        if (!this.activeConfiguration) {
            throw new Error('There is no active configuration to connect with.');
        }
        CodecRegistry.configure(this.activeConfiguration);
        try {
            this.isBusy = true;
            programLoaders.forEach(async (programLoader) => {
                // TODO: load programs
                // TODO: how to abort program loaders if user cancel operation instead of waiting for them to complete.
                this.assertStillConnecting();
            });
            const promises = transports.reduce((promises, transport) => {
                if (CodecRegistry.isActive(transport.id)) {
                    promises.push(transport.connect());
                }
                return promises;
            }, []);
            await TiPromise.allSettled(promises);
            this.computeStatus();
            if (!this.isConnected()) {
                this.disconnect();
            }
        }
        finally {
            this.isBusy = false;
        }
    }
    ;
    async onDisconnect() {
        try {
            this.isBusy = true;
            const promises = transports.reduce((promises, transport) => {
                if (CodecRegistry.isActive(transport.id)) {
                    promises.push(transport.disconnect());
                }
                return promises;
            }, []);
            await TiPromise.allSettled(promises);
            this.computeStatus();
        }
        finally {
            this.isBusy = false;
        }
    }
    ;
    registerTransport(transport) {
        if (!transports.includes(transport)) {
            transports.push(transport);
            transport.addEventListener(connectedStateChangedEventType, this.transportStateChangedHandler);
        }
    }
    ;
    unregisterTransport(transport) {
        if (transports.includes(transport)) {
            transport.removeEventListener(connectedStateChangedEventType, this.transportStateChangedHandler);
            transports = transports.filter((elem) => elem !== transport);
        }
    }
    ;
    registerProgramLoader(programLoaderInfo) {
        if (!programLoaders.includes(programLoaderInfo)) {
            programLoaders.push(programLoaderInfo);
        }
    }
    ;
    unregisterProgramLoader(programLoaderInfo) {
        if (programLoaders.includes(programLoaderInfo)) {
            programLoaders = programLoaders.filter((loaderInfo) => loaderInfo !== programLoaderInfo);
        }
    }
    ;
    registerConfiguration(id, configuration) {
        this.configurations.set(id, configuration);
        const promise = this.waitForConfigurations.get(id);
        if (promise) {
            promise.resolve(configuration);
            this.waitForConfigurations.delete(id);
        }
    }
    ;
    unregisterConfiguration(id) {
        this.configurations.delete(id);
        this.waitForConfigurations.delete(id);
    }
    ;
    computeStatus() {
        const state = { required: TRANSPORT_STATE.CONNECTED, optional: TRANSPORT_STATE.DISCONNECTED };
        let transportsConnectedCount = 0;
        const activeTransports = [...transports.values()].filter((transport) => CodecRegistry.isActive(transport.id));
        activeTransports.forEach((transport) => {
            if (CodecRegistry.isOptional(transport.id)) {
                /*
                *       Optional                    Each Optional Target Transport
                *         State      |   CONNECTED      CONNECTING    DISCONNECTED   DISCONNECTING
                *     -----------------------------------------------------------------------------
                *  *   DISCONNECTED  |   CONNECTED      CONNECTING    DISCONNECTED   DISCONNECTING
                *  |   DISCONNECTING |   CONNECTED      CONNECTING    DISCONNECTING  DISCONNECTING
                *  |   CONNECTING    |   CONNECTED      CONNECTING     CONNECTING     CONNECTING
                *  V   CONNECTED     |   CONNECTED      CONNECTED      CONNECTED      CONNECTED
                *
                *  The way this works, is that the connectionManager starts with the optional state == DISCONNECTED.
                *  Then for each transport, one at a time, the optional state is modified based on the table above.
                *  This state always progresses down each row, so that the state cannot go up from DISCONNECTING to DISCONNECTED
                *  or up from CONNECTED to CONNECTING.  As a result, the state will only be disconnected when all optional transports
                *  are in the DISCONNECTED state, and the state will become CONNECTED if any optional transport is CONNECTED.
                */
                if (transport.state === TRANSPORT_STATE.CONNECTED) {
                    transportsConnectedCount++;
                    state.optional = TRANSPORT_STATE.CONNECTED;
                }
                else if (transport.state === TRANSPORT_STATE.CONNECTING || state.optional === TRANSPORT_STATE.CONNECTING) {
                    state.optional = TRANSPORT_STATE.CONNECTING;
                }
                else if (transport.state === TRANSPORT_STATE.DISCONNECTING || state.optional === TRANSPORT_STATE.DISCONNECTING) {
                    state.optional = TRANSPORT_STATE.DISCONNECTING;
                }
            }
            else { // required transport
                /*       Required                    Each Required Transport
                *         State      |   CONNECTED      CONNECTING    DISCONNECTED   DISCONNECTING
                *     -----------------------------------------------------------------------------
                *  *   CONNECTED     |   CONNECTED      CONNECTING    DISCONNECTED   DISCONNECTING
                *  |   CONNECTING    |   CONNECTING     CONNECTING    DISCONNECTED   DISCONNECTING
                *  |   DISCONNECTED  |  DISCONNECTED   DISCONNECTED   DISCONNECTED   DISCONNECTING
                *  V   DISCONNECTING |  DISCONNECTING  DISCONNECTING  DISCONNECTING  DISCONNECTING
                *
                *  The way this works, is that the connectionManager starts with the required state == CONNECTED.
                *  Then for each transport, one at a time, the required state is modified based on the table above.
                *  This state always progresses down each row, so that the state cannot go up from CONNECTING to CONNECTED or up from
                *  DISCONNECTING to DISCONNECTED.  As a result, the state will only be connected when all required transports are in the
                *  CONNECTED state, and the state will become DISCONNECTING if at least one required transport is DISCONNECTING.
                *
                *  Based on this table, there are only two outcomes, we either change the state to the current connection.state, or we don't change it.
                */
                if (transport.state === TRANSPORT_STATE.CONNECTED) {
                    // first column in state map for CONNECTED does not change the state.
                    transportsConnectedCount++;
                }
                else {
                    // the last row in state map does not change the state, nor does the
                    // state change if it is DISCONNECTING and the connection is CONNECTING.
                    if (state.required !== TRANSPORT_STATE.DISCONNECTING && !(state.required === TRANSPORT_STATE.DISCONNECTED && transport.state === TRANSPORT_STATE.CONNECTING)) {
                        state.required = transport.state;
                    }
                }
            }
        });
        /*  Finally, the resulting state of all optional and required transports are combined to determine resulting state
         *  overall, and this may result in a partially connected state.
         *
         *                                          Optional State
         *  Required State |   CONNECTED      CONNECTING    DISCONNECTED  DISCONNECTING
         *  -----------------------------------------------------------------------------
         *   CONNECTED     |   CONNECTED      PARTIALLY*     PARTIALLY*     PARTIALLY*
         *   CONNECTING    |   CONNECTING     CONNECTING     CONNECTING     CONNECTING
         *   DISCONNECTED  |  DISCONNECTED   DISCONNECTED   DISCONNECTED   DISCONNECTING
         *   DISCONNECTING |  DISCONNECTING  DISCONNECTING  DISCONNECTING  DISCONNECTING
         *
         *  (*) the partially connected state must be qualified by at least one required transport being connected.
         *  Otherwise, we are in a situation with only optional transports, and we should use the optional state.
         */
        let result = state.required;
        if (result === TRANSPORT_STATE.CONNECTED && state.optional !== TRANSPORT_STATE.CONNECTED) {
            // there are no optional transports connected because state.optional !== CONNECTED
            if (transportsConnectedCount === 0) {
                // there are no required transports, so use the optional state.
                result = state.optional;
            }
        }
        else if (result === TRANSPORT_STATE.DISCONNECTED && state.optional === TRANSPORT_STATE.DISCONNECTING) {
            result = TRANSPORT_STATE.DISCONNECTING;
        }
        // Make sure we have at least one transport connected, otherwise we are really disconnected.
        if (result === TRANSPORT_STATE.CONNECTED && transportsConnectedCount === 0) {
            result = TRANSPORT_STATE.DISCONNECTED;
        }
        this.isPartiallyConnected = false;
        if (result === TRANSPORT_STATE.CONNECTED && transportsConnectedCount < activeTransports.length) {
            this.isPartiallyConnected = true;
        }
        this.setState(result);
    }
    ;
    setActiveConfiguration(activeConfig) {
        this.activeConfiguration = this.configurations.get(activeConfig) || activeConfig;
    }
    ;
    async whenConfigurationReady(id) {
        let configuration = this.configurations.get(id);
        if (!configuration) {
            const deferred = TiPromise.defer();
            this.waitForConfigurations.set(id, deferred);
            configuration = await deferred.promise;
        }
        return CodecRegistry.whenConfigurationReady(configuration);
    }
    ;
    toString() {
        return 'Connection Manager';
    }
    ;
}
;
export const connectionManager = new ConnectionManager();
//# sourceMappingURL=ConnectionManager.js.map
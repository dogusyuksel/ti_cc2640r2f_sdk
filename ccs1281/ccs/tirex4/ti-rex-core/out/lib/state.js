"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverState = exports.ConnectionState = exports.ServerStatus = void 0;
var ServerStatus;
(function (ServerStatus) {
    ServerStatus["INITIALIZING"] = "initializing";
    ServerStatus["UP"] = "up";
    ServerStatus["READY"] = "ready";
    ServerStatus["DOWN"] = "down";
})(ServerStatus = exports.ServerStatus || (exports.ServerStatus = {}));
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["INITIALIZING"] = "initalizing";
    ConnectionState["OFFLINE"] = "offline";
    ConnectionState["CONNECTED"] = "connected";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
/**
 * Server state - may change during run-time (as opposed to vars.js)
 */
class ServerState {
    constructor() {
        this.serverStatus = ServerStatus.DOWN;
        // 'localserver' only:
        this.useRemoteContent = true;
        this.useOfflineContent = true;
        this.connectionState = ConnectionState.INITIALIZING;
    }
    updateConnectionState(state, config) {
        this.connectionState = state;
        // update the server status as it depends on the connection state
        this.updateServerStatus(this.serverStatus, config);
    }
    updateServerStatus(status, config) {
        this.serverStatus = status;
        // see if our status changes due to the connectionState
        const nextStatus = this._getNextServerStatusForConnectionState(this.serverStatus, this.connectionState, config);
        if (nextStatus) {
            this.serverStatus = nextStatus;
        }
    }
    /**
     * serverStatus depends on connectionState; update the serverStatus for
     * the given connectionState.
     *
     * @param {ServerStatus} serverStatus
     * @param {ConnectionState} connectionState
     * @param config
     *
     */
    _getNextServerStatusForConnectionState(serverStatus, connectionState, config) {
        if (!config.mode || config.mode === 'remoteserver') {
            // remoteserver's serverStatus does not depend on connectionState
            return serverStatus === ServerStatus.UP ? ServerStatus.READY : serverStatus;
        }
        else {
            if (serverStatus === ServerStatus.UP) {
                if (connectionState === ConnectionState.CONNECTED ||
                    connectionState === ConnectionState.OFFLINE) {
                    return ServerStatus.READY;
                }
                else if (connectionState === ConnectionState.INITIALIZING) {
                    return ServerStatus.UP;
                }
                else {
                    // unhandled state, error
                    return null;
                }
            }
            else {
                // unhandled transition, error
                return null;
            }
        }
    }
}
exports.serverState = new ServerState();

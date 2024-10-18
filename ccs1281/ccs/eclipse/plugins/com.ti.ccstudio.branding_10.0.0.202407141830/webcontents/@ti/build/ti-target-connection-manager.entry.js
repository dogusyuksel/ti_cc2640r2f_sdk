import { r as registerInstance } from './core-800e68f4.js';
import { connectionManager } from '../ti-target-connection-manager/lib/ConnectionManager';

async function doAutoConnect() {
    const configs = document.querySelectorAll('ti-target-configuration'); 
    for (let i = 0; i < configs.length; i++) { 
        await connectionManager.whenConfigurationReady(configs[i].id || 'default'); 
    } 
    connectionManager.connect(); 
}
; 
const TiTargetConnectionManager = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Indicates if the connection manager should automatically connect to the target on application startup, or
         * if it should wait for the app to call connect().
         *
         * @type {boolean}
         */
        this.autoConnect = false; 
    }
    activeConfigurationChanged() {
        connectionManager.setActiveConfiguration(this.activeConfiguration || 'default'); 
    }
    ; 
    componentDidLoad() {
        this.activeConfigurationChanged(); 
        if (this.autoConnect) { 
            doAutoConnect(); 
        } 
    }
    ; 
    static get watchers() { return {
        "activeConfiguration": ["activeConfigurationChanged"]
    }; }
};
; 

export { TiTargetConnectionManager as ti_target_connection_manager };

//# sourceMappingURL=ti-target-connection-manager.entry.js.map
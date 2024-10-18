import { r as registerInstance, c as getElement } from './core-800e68f4.js';
import { connectionManager } from '../ti-target-connection-manager/lib/ConnectionManager';

const TiTargetConfiguration = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    ; 
    connectedCallback() {
        connectionManager.registerConfiguration(this.el.id || 'default', this.el.innerHTML); 
    }
    ; 
    disconnectedCallback() {
        connectionManager.unregisterConfiguration(this.el.id || 'default'); 
    }
    ; 
    get el() { return getElement(this); }
};
; 

export { TiTargetConfiguration as ti_target_configuration };

//# sourceMappingURL=ti-target-configuration.entry.js.map
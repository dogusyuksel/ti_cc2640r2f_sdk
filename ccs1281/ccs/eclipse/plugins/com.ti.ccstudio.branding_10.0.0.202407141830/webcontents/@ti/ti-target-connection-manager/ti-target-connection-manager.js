import { connectionManager } from '../ti-target-connection-manager/lib/ConnectionManager'; //^ti-target-connection-manager\ti-target-connection-manager.tsx,30^
async function doAutoConnect() {
    const configs = document.querySelectorAll('ti-target-configuration'); //^ti-target-connection-manager\ti-target-connection-manager.tsx,33^
    for (let i = 0; i < configs.length; i++) { //^ti-target-connection-manager\ti-target-connection-manager.tsx,34^
        await connectionManager.whenConfigurationReady(configs[i].id || 'default'); //^ti-target-connection-manager\ti-target-connection-manager.tsx,35^
    } //^ti-target-connection-manager\ti-target-connection-manager.tsx,36^
    connectionManager.connect(); //^ti-target-connection-manager\ti-target-connection-manager.tsx,37^
}
; //^ti-target-connection-manager\ti-target-connection-manager.tsx,38^
/**
 * `ti-target-connection-manager` is a non visual component for sending and receiving data over a USB port.
 * This transport supports both USB-HID and USB serial port operation.  This transport is generally
 * used with a codec for encoding/decodin data sent and received over the port.
 *
 *  Example:
 *
 *     <ti-target-connection-manager auto-connect></ti-target-connection-manager>
 *
 * @customElement ti-target-connection-manager
 * @polymer
 * @label Connection Manager
 * @group Transports, Models, and Codecs
 * @archetype <ti-target-connection-manager></ti-target-connection-manager>
 */
export class TiTargetConnectionManager {
    constructor() {
        /**
         * Indicates if the connection manager should automatically connect to the target on application startup, or
         * if it should wait for the app to call connect().
         *
         * @type {boolean}
         */
        this.autoConnect = false; //^ti-target-connection-manager\ti-target-connection-manager.tsx,67^
    }
    activeConfigurationChanged() {
        connectionManager.setActiveConfiguration(this.activeConfiguration || 'default'); //^ti-target-connection-manager\ti-target-connection-manager.tsx,78^
    }
    ; //^ti-target-connection-manager\ti-target-connection-manager.tsx,79^
    componentDidLoad() {
        this.activeConfigurationChanged(); //^ti-target-connection-manager\ti-target-connection-manager.tsx,82^
        if (this.autoConnect) { //^ti-target-connection-manager\ti-target-connection-manager.tsx,84^
            doAutoConnect(); //^ti-target-connection-manager\ti-target-connection-manager.tsx,85^
        } //^ti-target-connection-manager\ti-target-connection-manager.tsx,86^
    }
    ; //^ti-target-connection-manager\ti-target-connection-manager.tsx,87^
    static get is() { return "ti-target-connection-manager"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "autoConnect": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [{
                        "text": "{boolean}",
                        "name": "type"
                    }],
                "text": "Indicates if the connection manager should automatically connect to the target on application startup, or\nif it should wait for the app to call connect()."
            },
            "attribute": "auto-connect",
            "reflect": false,
            "defaultValue": "false"
        },
        "activeConfiguration": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [{
                        "text": "{boolean}",
                        "name": "type"
                    }],
                "text": "Indicates regular USB-HID support mode only.  Add this attribute to use usb-hid ports only and not regular usb serial ports."
            },
            "attribute": "active-configuration",
            "reflect": false
        }
    }; }
    static get watchers() { return [{
            "propName": "activeConfiguration",
            "methodName": "activeConfigurationChanged"
        }]; }
}
; //^ti-target-connection-manager\ti-target-connection-manager.tsx,88^

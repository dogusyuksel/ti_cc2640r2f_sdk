import { connectionManager } from '../ti-target-connection-manager/lib/ConnectionManager'; //^ti-target-configuration\ti-target-configuration.tsx,30^
/**
 * `ti-target-configuration` defines a particular configuration for models, codecs, and transports for the connection mangager.
 * A configuration as a tree with children.  The roots of the tree are the transports, and the leafs are the models.  To declare a
 * particular configuration you use the + operator to add a single child, and parenthesis to add multiple children to a parent.  All
 * identifiers must refer to models, codecs, or transports by id (including custom ones created for a particlar application), that are
 * present in index.gui.
 *
 *  Example:
 *
 *     <ti-target-configuration id="unique_id">
 *         xds+pm
 *     </ti-target-configuration>
 *
 * @customElement ti-widget-configuration
 * @demo @ti/ti-target-configuration/demo/index.html
 * @label Target Configuration
 * @group Transports, Models, and Codecs
 * @archetype <ti-target-configuration id="config1"></ti-target-configuration>
 */
export class TiTargetConfiguration {
    constructor() {
    }
    ; //^ti-target-configuration\ti-target-configuration.tsx,59^
    connectedCallback() {
        connectionManager.registerConfiguration(this.el.id || 'default', this.el.innerHTML); //^ti-target-configuration\ti-target-configuration.tsx,64^
    }
    ; //^ti-target-configuration\ti-target-configuration.tsx,65^
    disconnectedCallback() {
        connectionManager.unregisterConfiguration(this.el.id || 'default'); //^ti-target-configuration\ti-target-configuration.tsx,68^
    }
    ; //^ti-target-configuration\ti-target-configuration.tsx,69^
    static get is() { return "ti-target-configuration"; }
    static get encapsulation() { return "shadow"; }
    static get elementRef() { return "el"; }
}
; //^ti-target-configuration\ti-target-configuration.tsx,70^

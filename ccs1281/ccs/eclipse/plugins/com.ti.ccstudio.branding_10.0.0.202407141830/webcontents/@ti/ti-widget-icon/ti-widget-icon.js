/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
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
import { TiWidgetBase } from '../ti-widget-base/ti-widget-base'; //^ti-widget-icon\ti-widget-icon.tsx,30^
import { h, getAssetPath } from "@stencil/core"; //^ti-widget-icon\ti-widget-icon.tsx,31^
const getIconName = (strIcon) => {
    return strIcon && strIcon.indexOf(':') > 0 ? //^ti-widget-icon\ti-widget-icon.tsx,35^
        strIcon.substring(strIcon.indexOf(':') + 1).trim() : strIcon; //^ti-widget-icon\ti-widget-icon.tsx,36^
}; //^ti-widget-icon\ti-widget-icon.tsx,37^
const getIconSet = (strIcon) => {
    let result = 'icons'; //^ti-widget-icon\ti-widget-icon.tsx,40^
    if (strIcon && strIcon.indexOf(':') > 0) { //^ti-widget-icon\ti-widget-icon.tsx,41^
        result = strIcon.substring(0, strIcon.indexOf(':')).trim(); //^ti-widget-icon\ti-widget-icon.tsx,42^
        // make backward compatible with GCv2
        if (result === 'ti-core-icons') { //^ti-widget-icon\ti-widget-icon.tsx,44^
            result = 'ti'; //^ti-widget-icon\ti-widget-icon.tsx,45^
        } //^ti-widget-icon\ti-widget-icon.tsx,46^
    } //^ti-widget-icon\ti-widget-icon.tsx,47^
    return result; //^ti-widget-icon\ti-widget-icon.tsx,48^
}; //^ti-widget-icon\ti-widget-icon.tsx,49^
/**
 * `ti-widget-icon` is an svg icon widget with bindable properties.
 *
 * @demo ./ti-widget-icon/demo/index.html
 * @label Icon
 * @group Common
 * @archetype <ti-widget-icon icon="objects:info-circle"></ti-widget-icon>
 */
export class TiWidgetIcon {
    constructor() {
        this.base = new ( // keep on separate line to enable sourcemapping   //^ti-widget-icon\ti-widget-icon.tsx,65^
        class extends TiWidgetBase {
            get element() {
                return this.parent.el; //^ti-widget-icon\ti-widget-icon.tsx,68^
            } //^ti-widget-icon\ti-widget-icon.tsx,69^
        })(this); //^ti-widget-icon\ti-widget-icon.tsx,70^
        /**
         * The icon to be displayed (svgFilename:iconName e.g. objects:info-circle)
         * @order 2
         */
        this.icon = 'objects:info-circle'; //^ti-widget-icon\ti-widget-icon.tsx,76^
        /**
         * Icon appearance, can be one of the following: `primary`, `secondary`, `tertiary`, `success`, `warn`, `error`, `reversed`, or `custom`.
         * Also, `reversed` can be added as in `primary reversed`. This inverts the foreground and background colors.
         * And `custom` can be added as to provide custom fill style.
         * @order 3
         */
        this.appearance = 'tertiary'; //^ti-widget-icon\ti-widget-icon.tsx,84^
        /**
         * Icon size - one of `s` (18x18), `m` (24x24), `l` (36x36), or `xl` (48x48).
         * @order 4
         */
        this.size = 'm'; //^ti-widget-icon\ti-widget-icon.tsx,89^
        /**
         * Place the icon in a circle wrapper.
         * @order 5
         */
        this.circle = false; //^ti-widget-icon\ti-widget-icon.tsx,95^
        /**
         * Path to the icon folder.
         * @order 6
         */
        this.path = undefined; //^ti-widget-icon\ti-widget-icon.tsx,101^
        this.iconName = 'info-circle'; //^ti-widget-icon\ti-widget-icon.tsx,105^
        this.iconSet = 'objects'; //^ti-widget-icon\ti-widget-icon.tsx,106^
        this.iconFolderPath = ''; //^ti-widget-icon\ti-widget-icon.tsx,107^
        /**
         * Controls the tooltip that is displayed for this widget.
         * @order 210
         */
        this.tooltip = ''; //^ti-widget-icon\ti-widget-icon.tsx,157^
        // #endregion
        // #region ti-element-base/ti-element-base-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * Sets to `true` to hide the element, otherwise `false`.
         *
         * @order 200
         */
        this.hidden = false; //^ti-widget-icon\ti-widget-icon.tsx,207^
    }
    render() {
        // JSXON
        return this.base.render(h("ti-svg-icon", { iconSet: this.iconSet, multiIconFile: true, size: this.size, appearance: this.appearance, circle: this.circle, iconName: this.iconName, pathPrefix: this.iconFolderPath }));
        // JSXOFF
    } //^ti-widget-icon\ti-widget-icon.tsx,123^
    componentWillLoad() {
        this.onPathChanged(); //^ti-widget-icon\ti-widget-icon.tsx,126^
        this.onIconChanged(); //^ti-widget-icon\ti-widget-icon.tsx,127^
    } //^ti-widget-icon\ti-widget-icon.tsx,128^
    onIconChanged() {
        this.iconName = getIconName(this.icon); //^ti-widget-icon\ti-widget-icon.tsx,132^
        this.iconSet = getIconSet(this.icon); //^ti-widget-icon\ti-widget-icon.tsx,133^
    } //^ti-widget-icon\ti-widget-icon.tsx,134^
    onPathChanged() {
        var _a;
        this.iconFolderPath = (_a = this.path) !== null && _a !== void 0 ? _a : getAssetPath('../assets/icons/'); //^ti-widget-icon\ti-widget-icon.tsx,138^
    } //^ti-widget-icon\ti-widget-icon.tsx,139^
    /**
     * Sets the CSS property.
     *
     * @param {string} name the element style name
     * @param {string} value the new CSS property to be set
     */
    async setCSSProperty(name, value) {
        return this['base'][`${this.setCSSProperty.name}`](name, value); //^ti-widget-icon\ti-widget-icon.tsx,167^
    } //^ti-widget-icon\ti-widget-icon.tsx,168^
    /**
     * Returns the value of a CSS property.
     *
     * @param {string} name the element style property
     * @returns {string} the value of the property
     */
    async getCSSProperty(name) {
        return this['base'][`${this.getCSSProperty.name}`](name); //^ti-widget-icon\ti-widget-icon.tsx,178^
    } //^ti-widget-icon\ti-widget-icon.tsx,179^
    /**
     * Refresh the element.
     */
    async refresh() {
        return this['base'][`${this.refresh.name}`](); //^ti-widget-icon\ti-widget-icon.tsx,186^
    } //^ti-widget-icon\ti-widget-icon.tsx,187^
    /**
     * Fire an widget event.
     *
     * @param {string} eventName the event name, in dash notation
     * @param detail the event detail
     */
    async fire(eventName, detail) {
        return this['base'][`${this.fire.name}`](eventName, detail); //^ti-widget-icon\ti-widget-icon.tsx,197^
    } //^ti-widget-icon\ti-widget-icon.tsx,198^
    static get is() { return "ti-widget-icon"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["ti-widget-icon.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["ti-widget-icon.css"]
    }; }
    static get properties() { return {
        "icon": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [{
                        "text": "2",
                        "name": "order"
                    }],
                "text": "The icon to be displayed (svgFilename:iconName e.g. objects:info-circle)"
            },
            "attribute": "icon",
            "reflect": false,
            "defaultValue": "'objects:info-circle'"
        },
        "appearance": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "'primary' | 'secondary' | 'tertiary' | 'success' | 'warn' | 'error' | 'reversed' | 'custom'",
                "resolved": "\"custom\" | \"error\" | \"primary\" | \"reversed\" | \"secondary\" | \"success\" | \"tertiary\" | \"warn\"",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [{
                        "text": "3",
                        "name": "order"
                    }],
                "text": "Icon appearance, can be one of the following: `primary`, `secondary`, `tertiary`, `success`, `warn`, `error`, `reversed`, or `custom`.\nAlso, `reversed` can be added as in `primary reversed`. This inverts the foreground and background colors.\nAnd `custom` can be added as to provide custom fill style."
            },
            "attribute": "appearance",
            "reflect": true,
            "defaultValue": "'tertiary'"
        },
        "size": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "'s' | 'm' | 'l' | 'xl'",
                "resolved": "\"l\" | \"m\" | \"s\" | \"xl\"",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [{
                        "text": "4",
                        "name": "order"
                    }],
                "text": "Icon size - one of `s` (18x18), `m` (24x24), `l` (36x36), or `xl` (48x48)."
            },
            "attribute": "size",
            "reflect": false,
            "defaultValue": "'m'"
        },
        "circle": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [{
                        "text": "5",
                        "name": "order"
                    }],
                "text": "Place the icon in a circle wrapper."
            },
            "attribute": "circle",
            "reflect": false,
            "defaultValue": "false"
        },
        "path": {
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
                        "text": "6",
                        "name": "order"
                    }],
                "text": "Path to the icon folder."
            },
            "attribute": "path",
            "reflect": false,
            "defaultValue": "undefined"
        },
        "tooltip": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [{
                        "text": "210",
                        "name": "order"
                    }],
                "text": "Controls the tooltip that is displayed for this widget."
            },
            "attribute": "tooltip",
            "reflect": false,
            "defaultValue": "''"
        },
        "hidden": {
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
                        "text": "200",
                        "name": "order"
                    }],
                "text": "Sets to `true` to hide the element, otherwise `false`."
            },
            "attribute": "hidden",
            "reflect": true,
            "defaultValue": "false"
        }
    }; }
    static get states() { return {
        "iconName": {},
        "iconSet": {},
        "iconFolderPath": {}
    }; }
    static get events() { return [{
            "method": "cssPropertyChanged",
            "name": "css-property-changed",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Event `css-property-changed`, with `detail: { name: string, value: string }`."
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get methods() { return {
        "setCSSProperty": {
            "complexType": {
                "signature": "(name: string, value: string) => Promise<void>",
                "parameters": [{
                        "tags": [{
                                "text": "name the element style name",
                                "name": "param"
                            }],
                        "text": "the element style name"
                    }, {
                        "tags": [{
                                "text": "value the new CSS property to be set",
                                "name": "param"
                            }],
                        "text": "the new CSS property to be set"
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "Sets the CSS property.",
                "tags": [{
                        "name": "param",
                        "text": "name the element style name"
                    }, {
                        "name": "param",
                        "text": "value the new CSS property to be set"
                    }]
            }
        },
        "getCSSProperty": {
            "complexType": {
                "signature": "(name: string) => Promise<string>",
                "parameters": [{
                        "tags": [{
                                "text": "name the element style property",
                                "name": "param"
                            }],
                        "text": "the element style property"
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<string>"
            },
            "docs": {
                "text": "Returns the value of a CSS property.",
                "tags": [{
                        "name": "param",
                        "text": "name the element style property"
                    }, {
                        "name": "returns",
                        "text": "the value of the property"
                    }]
            }
        },
        "refresh": {
            "complexType": {
                "signature": "() => Promise<void>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "Refresh the element.",
                "tags": []
            }
        },
        "fire": {
            "complexType": {
                "signature": "(eventName: string, detail: object) => Promise<void>",
                "parameters": [{
                        "tags": [{
                                "text": "eventName the event name, in dash notation",
                                "name": "param"
                            }],
                        "text": "the event name, in dash notation"
                    }, {
                        "tags": [{
                                "text": "detail the event detail",
                                "name": "param"
                            }],
                        "text": "the event detail"
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "Fire an widget event.",
                "tags": [{
                        "name": "param",
                        "text": "eventName the event name, in dash notation"
                    }, {
                        "name": "param",
                        "text": "detail the event detail"
                    }]
            }
        }
    }; }
    static get elementRef() { return "el"; }
    static get watchers() { return [{
            "propName": "icon",
            "methodName": "onIconChanged"
        }, {
            "propName": "path",
            "methodName": "onPathChanged"
        }]; }
} //^ti-widget-icon\ti-widget-icon.tsx,210^

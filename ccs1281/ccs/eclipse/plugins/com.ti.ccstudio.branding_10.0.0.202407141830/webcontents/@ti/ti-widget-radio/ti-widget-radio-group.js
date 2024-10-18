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
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from "@stencil/core"; //^ti-widget-radio\ti-widget-radio-group.tsx,33^
import { TiWidgetBaseSelector } from '../ti-widget-base/ti-widget-base-selector'; //^ti-widget-radio\ti-widget-radio-group.tsx,36^
import { TiUtils } from '../ti-core-assets/lib/TiUtils'; //^ti-widget-radio\ti-widget-radio-group.tsx,39^
/**
 * `ti-widget-radio-group` is a container for radio buttons that are mutually exclusive in selection.
 * Only one can be selected at a time.
 *
 * @demo ./ti-widget-radio/demo/index.html
 * @label Radio Group
 * @group Containers
 * @isContainer
 * @archetype <ti-widget-radio-group selected-text="medium"><ti-widget-radio label="small"></ti-widget-radio><ti-widget-radio label="medium"></ti-widget-radio><ti-widget-radio label="large"></ti-widget-radio></ti-widget-radio-group>
 */
export class TiWidgetRadioGroup {
    constructor() {
        this.values = new Array(); //^ti-widget-radio\ti-widget-radio-group.tsx,57^
        this.labels = new Array(); //^ti-widget-radio\ti-widget-radio-group.tsx,58^
        this.base = new ( //^ti-widget-radio\ti-widget-radio-group.tsx,60^
        class extends TiWidgetBaseSelector {
            getValues() {
                return this.radioGroup.values; //^ti-widget-radio\ti-widget-radio-group.tsx,63^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,64^
            getLabels() {
                return this.radioGroup.labels; //^ti-widget-radio\ti-widget-radio-group.tsx,66^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,67^
            getSelectedIndex() {
                return this.radioGroup.selectedIndex; //^ti-widget-radio\ti-widget-radio-group.tsx,69^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,70^
            setSelectedIndex(index) {
                this.radioGroup.selectedIndex = index; //^ti-widget-radio\ti-widget-radio-group.tsx,72^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,73^
            selectionChanged(index) {
                const radios = this.radioGroup.getRadios(); //^ti-widget-radio\ti-widget-radio-group.tsx,75^
                for (let i = 0; i < radios.length; ++i) { //^ti-widget-radio\ti-widget-radio-group.tsx,76^
                    const radio = radios[i]; //^ti-widget-radio\ti-widget-radio-group.tsx,77^
                    if (i === index) { //^ti-widget-radio\ti-widget-radio-group.tsx,78^
                        radio.checked = true; //^ti-widget-radio\ti-widget-radio-group.tsx,79^
                    }
                    else { //^ti-widget-radio\ti-widget-radio-group.tsx,80^
                        radio.checked = false; //^ti-widget-radio\ti-widget-radio-group.tsx,81^
                    } //^ti-widget-radio\ti-widget-radio-group.tsx,82^
                } //^ti-widget-radio\ti-widget-radio-group.tsx,83^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,84^
            get radioGroup() {
                return this.parent; //^ti-widget-radio\ti-widget-radio-group.tsx,86^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,87^
            get element() {
                return this.radioGroup.el; //^ti-widget-radio\ti-widget-radio-group.tsx,90^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,91^
        } //^ti-widget-radio\ti-widget-radio-group.tsx,92^
        )(this); //^ti-widget-radio\ti-widget-radio-group.tsx,93^
        /**
         * If true, set the layout of the radio control to horizontal, default is false.
         * @order 2
         */
        this.horizontal = false; //^ti-widget-radio\ti-widget-radio-group.tsx,101^
        /**
         * Controls the tooltip that is displayed for this widget.
         * @order 210
         */
        this.tooltip = ''; //^ti-widget-radio\ti-widget-radio-group.tsx,280^
        // #endregion
        // #region ti-element-base/ti-element-base-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * Sets to `true` to hide the element, otherwise `false`.
         *
         * @order 200
         */
        this.hidden = false; //^ti-widget-radio\ti-widget-radio-group.tsx,330^
        // #endregion
        // #region ti-widget-base/ti-widget-base-title-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * The widget caption text.
         * @order 207
         */
        this.caption = ''; //^ti-widget-radio\ti-widget-radio-group.tsx,338^
        /**
         * The widget info icon help text.
         * @order 208
         */
        this.infoText = ''; //^ti-widget-radio\ti-widget-radio-group.tsx,344^
        // #endregion
        // #region ti-widget-base/ti-widget-base-disabled-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * Controls the widget disabled state.
         * @order 202
         */
        this.disabled = false; //^ti-widget-radio\ti-widget-radio-group.tsx,352^
    }
    componentWillLoad() {
        this.el.className = 'ti-radio-group'; //^ti-widget-radio\ti-widget-radio-group.tsx,104^
        /* initialize designer methods */
        this.el['onSettingChildPropertyValue'] = this.onSettingChildPropertyValue.bind(this); //^ti-widget-radio\ti-widget-radio-group.tsx,107^
        if (this.initialIndex && !TiUtils.isInDesigner) { //^ti-widget-radio\ti-widget-radio-group.tsx,109^
            this.selectedIndex = this.initialIndex; //^ti-widget-radio\ti-widget-radio-group.tsx,110^
        } //^ti-widget-radio\ti-widget-radio-group.tsx,111^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,112^
    componentDidLoad() {
        const radios = this.getRadios(); //^ti-widget-radio\ti-widget-radio-group.tsx,115^
        for (let i = 0; i < radios.length; ++i) { //^ti-widget-radio\ti-widget-radio-group.tsx,116^
            const radio = radios[i]; //^ti-widget-radio\ti-widget-radio-group.tsx,117^
            this.labels.push(radio.label); //^ti-widget-radio\ti-widget-radio-group.tsx,119^
            this.values.push(radio.value); //^ti-widget-radio\ti-widget-radio-group.tsx,120^
            if (this.selectedIndex === i) { //^ti-widget-radio\ti-widget-radio-group.tsx,122^
                radio.checked = true; //^ti-widget-radio\ti-widget-radio-group.tsx,123^
            }
            else if (!TiUtils.isInDesigner && !this.initialIndex && this.selectedValue === radio.value) { //^ti-widget-radio\ti-widget-radio-group.tsx,124^
                radio.checked = true; //^ti-widget-radio\ti-widget-radio-group.tsx,125^
            }
            else if (!TiUtils.isInDesigner && !this.initialIndex && this.selectedText === radio.label) { //^ti-widget-radio\ti-widget-radio-group.tsx,126^
                radio.checked = true; //^ti-widget-radio\ti-widget-radio-group.tsx,127^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,128^
        } //^ti-widget-radio\ti-widget-radio-group.tsx,129^
        this.base.componentDidLoad(); //^ti-widget-radio\ti-widget-radio-group.tsx,131^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,132^
    render() {
        // JSXON
        return this.base.render(h("ti-radio-group", { disabled: this.disabled, horizontal: this.horizontal, value: this.selectedValue },
            h("slot", null)), { caption: this.caption, infoText: this.infoText });
        // JSXOFF
    } //^ti-widget-radio\ti-widget-radio-group.tsx,143^
    getRadios() {
        const radios = this.el.querySelectorAll('ti-widget-radio'); //^ti-widget-radio\ti-widget-radio-group.tsx,146^
        const result = []; //^ti-widget-radio\ti-widget-radio-group.tsx,147^
        for (let i = 0; i < radios.length; ++i) { //^ti-widget-radio\ti-widget-radio-group.tsx,148^
            result.push(radios[i]); //^ti-widget-radio\ti-widget-radio-group.tsx,149^
        } //^ti-widget-radio\ti-widget-radio-group.tsx,150^
        return result; //^ti-widget-radio\ti-widget-radio-group.tsx,151^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,152^
    /**
     * Designer callback method.
     *
     * @param child
     * @param name
     * @param value
     */
    onSettingChildPropertyValue(child, name, value) {
        if (name === 'checked') { //^ti-widget-radio\ti-widget-radio-group.tsx,162^
            return {
                name: 'selectedText',
                value: value ? child.label : '',
                sideEffects: ['selectedIndex', 'selectedValue'] //^ti-widget-radio\ti-widget-radio-group.tsx,166^
            }; //^ti-widget-radio\ti-widget-radio-group.tsx,167^
        } //^ti-widget-radio\ti-widget-radio-group.tsx,168^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,169^
    onTiChanged(event) {
        if (event.currentTarget === this.el && event.detail.selected) { //^ti-widget-radio\ti-widget-radio-group.tsx,173^
            const radios = this.getRadios(); //^ti-widget-radio\ti-widget-radio-group.tsx,174^
            for (let i = 0; i < radios.length; ++i) { //^ti-widget-radio\ti-widget-radio-group.tsx,175^
                if (radios[i].value === event.detail.value) { //^ti-widget-radio\ti-widget-radio-group.tsx,176^
                    this.selectedIndex = i; //^ti-widget-radio\ti-widget-radio-group.tsx,177^
                    return; //^ti-widget-radio\ti-widget-radio-group.tsx,178^
                } //^ti-widget-radio\ti-widget-radio-group.tsx,179^
            } //^ti-widget-radio\ti-widget-radio-group.tsx,180^
        } //^ti-widget-radio\ti-widget-radio-group.tsx,181^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,182^
    onSelectedTextChanged(newValue, oldValue) {
        this.base.selectedTextChanged(); //^ti-widget-radio\ti-widget-radio-group.tsx,186^
        this.selectedTextChanged.emit({ value: this.selectedText /*, oldValue: oldValue*/ }); //^ti-widget-radio\ti-widget-radio-group.tsx,187^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,188^
    onSelectedValueChanged(newValue, oldValue) {
        this.base.selectedValueChanged(); //^ti-widget-radio\ti-widget-radio-group.tsx,192^
        this.selectedValueChanged.emit({ value: this.selectedValue /*, oldValue: oldValue*/ }); //^ti-widget-radio\ti-widget-radio-group.tsx,193^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,194^
    onSelectedIndexChanged(newValue, oldValue) {
        this.base.selectedIndexChanged(); //^ti-widget-radio\ti-widget-radio-group.tsx,198^
        this.selectedIndexChanged.emit({ value: this.selectedIndex }); //^ti-widget-radio\ti-widget-radio-group.tsx,199^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,200^
    /**
     * Sets the CSS property.
     *
     * @param {string} name the element style name
     * @param {string} value the new CSS property to be set
     */
    async setCSSProperty(name, value) {
        return this['base'][`${this.setCSSProperty.name}`](name, value); //^ti-widget-radio\ti-widget-radio-group.tsx,290^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,291^
    /**
     * Returns the value of a CSS property.
     *
     * @param {string} name the element style property
     * @returns {string} the value of the property
     */
    async getCSSProperty(name) {
        return this['base'][`${this.getCSSProperty.name}`](name); //^ti-widget-radio\ti-widget-radio-group.tsx,301^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,302^
    /**
     * Refresh the element.
     */
    async refresh() {
        return this['base'][`${this.refresh.name}`](); //^ti-widget-radio\ti-widget-radio-group.tsx,309^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,310^
    /**
     * Fire an widget event.
     *
     * @param {string} eventName the event name, in dash notation
     * @param detail the event detail
     */
    async fire(eventName, detail) {
        return this['base'][`${this.fire.name}`](eventName, detail); //^ti-widget-radio\ti-widget-radio-group.tsx,320^
    } //^ti-widget-radio\ti-widget-radio-group.tsx,321^
    static get is() { return "ti-widget-radio-group"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["ti-widget-radio-group.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["ti-widget-radio-group.css"]
    }; }
    static get properties() { return {
        "horizontal": {
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
                        "text": "2",
                        "name": "order"
                    }],
                "text": "If true, set the layout of the radio control to horizontal, default is false."
            },
            "attribute": "horizontal",
            "reflect": false,
            "defaultValue": "false"
        },
        "selectedText": {
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
                        "text": "20",
                        "name": "order"
                    }],
                "text": "The label text of the selected option."
            },
            "attribute": "selected-text",
            "reflect": true
        },
        "selectedIndex": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [{
                        "text": "21",
                        "name": "order"
                    }],
                "text": "The zero-based index of the selected option."
            },
            "attribute": "selected-index",
            "reflect": true
        },
        "selectedValue": {
            "type": "any",
            "mutable": false,
            "complexType": {
                "original": "number | string",
                "resolved": "number | string",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [{
                        "text": "23",
                        "name": "order"
                    }],
                "text": "The value represented by the selected option."
            },
            "attribute": "selected-value",
            "reflect": true
        },
        "initialIndex": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "undefined | number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [{
                        "text": "24",
                        "name": "order"
                    }],
                "text": "The index of the option to be initially selected by default."
            },
            "attribute": "initial-index",
            "reflect": false
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
        },
        "caption": {
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
                        "text": "207",
                        "name": "order"
                    }],
                "text": "The widget caption text."
            },
            "attribute": "caption",
            "reflect": true,
            "defaultValue": "''"
        },
        "infoText": {
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
                        "text": "208",
                        "name": "order"
                    }],
                "text": "The widget info icon help text."
            },
            "attribute": "info-text",
            "reflect": true,
            "defaultValue": "''"
        },
        "disabled": {
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
                        "text": "202",
                        "name": "order"
                    }],
                "text": "Controls the widget disabled state."
            },
            "attribute": "disabled",
            "reflect": true,
            "defaultValue": "false"
        }
    }; }
    static get states() { return {
        "combinedErrorText": {}
    }; }
    static get events() { return [{
            "method": "selectedTextChanged",
            "name": "selected-text-changed",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when the `selectedText` property changed."
            },
            "complexType": {
                "original": "{ value: string }",
                "resolved": "{ value: string; }",
                "references": {}
            }
        }, {
            "method": "selectedIndexChanged",
            "name": "selected-index-changed",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [{
                        "text": "22",
                        "name": "order"
                    }],
                "text": "Fired when teh `selectedIndex` property changed."
            },
            "complexType": {
                "original": "{ value: number }",
                "resolved": "{ value: number; }",
                "references": {}
            }
        }, {
            "method": "selectedValueChanged",
            "name": "selected-value-changed",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when the `selectedValue` property changed."
            },
            "complexType": {
                "original": "{ value: number | string }",
                "resolved": "{ value: string | number; }",
                "references": {}
            }
        }, {
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
            "propName": "selectedText",
            "methodName": "onSelectedTextChanged"
        }, {
            "propName": "selectedValue",
            "methodName": "onSelectedValueChanged"
        }, {
            "propName": "selectedIndex",
            "methodName": "onSelectedIndexChanged"
        }]; }
    static get listeners() { return [{
            "name": "tiChange",
            "method": "onTiChanged",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
} //^ti-widget-radio\ti-widget-radio-group.tsx,355^

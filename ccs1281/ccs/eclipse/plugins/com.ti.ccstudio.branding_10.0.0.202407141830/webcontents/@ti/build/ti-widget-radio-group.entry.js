import { r as registerInstance, d as createEvent, h, c as getElement } from './core-800e68f4.js';
import { TiUtils } from '../ti-core-assets/lib/TiUtils';
import { T as TiWidgetBase } from './ti-widget-base-fe722328.js';
import '../ti-core-assets/lib/TiFiles';
import '../ti-core-assets/lib/TiConsole';
import '../ti-core-assets/lib/TiLocalStorage';

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
/**
 * `TiWidgetBaseSelector` provides the base implementation for selector element.
 *
 * @isHidden
 */
class TiWidgetBaseSelector extends TiWidgetBase {
    constructor(parent) {
        super(parent); 
        this.parent = parent;
        this.options = []; 
        this.valuesArray = []; 
        this.desired = undefined; 
        this.loaded = false; 
    } 
    componentDidLoad() {
        this.loaded = true; 
        this.labelsChanged(); 
        this.valuesChanged(); 
        this.sortedChanged(); 
        this.initialIndexChanged(); 
        this.selectedTextChanged(); 
        this.selectedValueChanged(); 
        this.selectedIndexChanged(); 
    } 
    setOptions(options) { } 
    getDisabledValues() { return new Array(); } 
    getSorted() { return false; } 
    getSortedNumerically() { return false; } 
    findOption(propertyName, value) {
        if (value !== null && value !== undefined && (propertyName !== 'index' || (value >= 0 && value < this.options.length))) { 
            for (let i = this.options.length; i-- > 0;) { 
                const option = this.options[i]; 
                if (option[propertyName] === value) { 
                    return { option: option, selectedIndex: i }; 
                } 
            } 
        } 
        return null; 
    } 
    // getIndexAfterSorting(indexBeforeSorting: number) {
    //     let indexAfterSorting = 0;
    //     for (let i = 0; i < this.options.length; i++) {
    //         if (this.options[i].index === indexBeforeSorting) {
    //             indexAfterSorting = i;
    //             break;
    //         }
    //     }
    //     return indexAfterSorting;
    // }
    updateProperties() {
        let result = null; 
        if (this.options.length > 0) { 
            if (this.desired === undefined) { 
                // update desired if needed
                if (this.parent.selectedText !== this.lastSelectedText) { 
                    this.desired = 'Text'; 
                    this.lastSelectedText = this.parent.selectedText; 
                } 
                if (this.parent.selectedValue !== this.lastSelectedValue) { 
                    this.desired = 'Value'; 
                    this.lastSelectedValue = this.parent.selectedValue; 
                } 
                if (this.parent.selectedIndex !== this.lastSelectedIndex) { 
                    this.desired = 'Index'; 
                    this.lastSelectedIndex = this.parent.selectedIndex; 
                } 
            } 
            result = 
                this.desired === undefined 
                    ? this.findOption('index', this.parent.initialIndex === undefined ? this.parent.selectedIndex : this.parent.initialIndex) 
                    : this.findOption(this.desired.toLowerCase(), this.parent['selected' + this.desired]); 
        } 
        if (!result) { 
            result = { option: { index: -1, text: '', value: -1 }, selectedIndex: -1 }; 
        } 
        const option = result.option; 
        if (this.desired !== 'Index' && this.parent.selectedIndex !== option.index) { 
            this.lastSelectedIndex = option.index; 
            this.parent.selectedIndex = option.index; 
        } 
        if (this.desired !== 'Text' && this.parent.selectedText !== option.text) { 
            this.lastSelectedText = option.text; 
            this.parent.selectedText = option.text; 
        } 
        if (this.desired !== 'Value' && this.parent.selectedValue !== option.value) { 
            this.lastSelectedValue = option.value; 
            this.parent.selectedValue = option.value; 
        } 
        if (result.selectedIndex !== this.getSelectedIndex()) { 
            this.setSelectedIndex(result.selectedIndex); 
        } 
    } 
    valuesChanged() {
        if (this.loaded) { 
            this.valuesArray = this.getValues(); 
            const disabledArray = this.getDisabledValues(); 
            if (this.valuesArray.length === 0) { 
                this.valuesArray = undefined; 
            } 
            for (let i = this.options.length; i-- > 0;) { 
                const option = this.options[i]; 
                option.value = this.valuesArray ? this.valuesArray[option.index] : option.index + 1; 
                option.disabled = option.value ? disabledArray.includes(option.value.toString()) : false; 
            } 
            this.setOptions(this.options); 
            this.updateProperties(); 
        } 
    } 
    labelsChanged() {
        if (this.loaded) { 
            const labelsArray = this.getLabels(); 
            const disabledArray = this.getDisabledValues(); 
            this.options = []; 
            for (let i = 0; i < labelsArray.length; i++) { 
                const value = this.valuesArray ? +this.valuesArray[i] : i + 1; 
                const option = {
                    index: i,
                    text: labelsArray[i],
                    value: value,
                    disabled: value ? disabledArray.includes(value.toString()) : false 
                }; 
                this.options.push(option); 
            } 
            if (this.getSorted()) { 
                this.doSort(); 
            } 
            this.setOptions(this.options); 
            // // Bug fix: chrome seems to have a problem if I set the index too quickly after setting labels.
            // // using async to delay the updating of the index seems to fix this issue.
            // Async.timeOut.run(() => {
            //     // refresh
            //     this.updateProperties();
            // });
        } 
    } 
    doSort() {
        if (this.options.length > 0) { 
            if (this.getSorted()) { 
                if (!this.getSortedNumerically()) { 
                    this.options = this.options.sort((a, b) => {
                        return a.text.toLocaleLowerCase().localeCompare(b.text.toLocaleLowerCase()); 
                    }); 
                }
                else { 
                    this.options = this.options.sort((a, b) => {
                        return +a.text - +b.text; 
                    }); 
                } 
            }
            else { 
                this.options = this.options.sort((a, b) => {
                    return a.index - b.index; 
                }); 
            } 
        } 
    } 
    sortedChanged() {
        if (this.loaded) { 
            this.doSort(); 
            // update widget with new order of options
            this.setOptions(this.options); 
            const result = this.findOption('index', this.parent.selectedIndex); 
            this.setSelectedIndex(result === null ? -1 : result.selectedIndex); 
        } 
    } 
    selectedValueChanged() {
        if (this.loaded && this.parent.selectedValue !== this.lastSelectedValue) { 
            this.lastSelectedValue = this.parent.selectedValue; 
            const i = this.getSelectedIndex(); 
            if (i >= 0 && i < this.options.length ? this.options[i].value !== this.parent.selectedValue : this.parent.selectedValue !== undefined) { 
                this.desired = 'Value'; 
                this.updateProperties(); 
            } 
            this.onSelectionChanged(); 
        } 
    } 
    selectedTextChanged() {
        if (this.loaded && this.parent.selectedText !== this.lastSelectedText) { 
            this.lastSelectedText = this.parent.selectedText; 
            const i = this.getSelectedIndex(); 
            if (i >= 0 && i < this.options.length ? this.options[i].text !== this.parent.selectedText : this.parent.selectedText !== undefined) { 
                this.desired = 'Text'; 
                this.updateProperties(); 
            } 
            this.onSelectionChanged(); 
        } 
    } 
    selectedIndexChanged() {
        if (this.loaded && this.parent.selectedIndex !== this.lastSelectedIndex) { 
            this.lastSelectedIndex = this.parent.selectedIndex; 
            const i = this.getSelectedIndex(); 
            if (i >= 0 && i < this.options.length ? this.options[i].index !== this.parent.selectedIndex : this.parent.selectedIndex !== undefined) { 
                this.desired = 'Index'; 
                this.updateProperties(); 
            } 
            this.onSelectionChanged(); 
        } 
    } 
    onSelectionChanged() {
        if (this.desired === undefined) { 
            // arbitrarily choose to preserve index if user makes changes before model does.
            this.desired = 'Index'; 
        } 
        const index = this.getSelectedIndex(); 
        const option = this.options[index]; 
        if (option) { 
            this.parent.selectedIndex = option.index; 
            this.parent.selectedValue = option.value; 
            this.parent.selectedText = option.text; 
        } /*else if (this.parent.allowEmptySelection) {
            // properties are cleared if user clears input and allowEmptySelection is enabled
            this.parent.selectedIndex = index;
            this.parent.selectedValue = undefined;
            this.parent.selectedText = '';
        }*/
        this.selectionChanged(index); 
    } 
    initialIndexChanged() {
        if (this.loaded && this.desired === undefined) { 
            const i = this.getSelectedIndex(); 
            if (i >= 0 && i < this.options.length ? this.options[i].index !== this.parent.initialIndex : this.parent.initialIndex !== undefined) { 
                this.updateProperties(); 
            } 
        } 
    } 
} 

const TiWidgetRadioGroup = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.values = new Array(); 
        this.labels = new Array(); 
        this.base = new ( 
        class extends TiWidgetBaseSelector {
            getValues() {
                return this.radioGroup.values; 
            } 
            getLabels() {
                return this.radioGroup.labels; 
            } 
            getSelectedIndex() {
                return this.radioGroup.selectedIndex; 
            } 
            setSelectedIndex(index) {
                this.radioGroup.selectedIndex = index; 
            } 
            selectionChanged(index) {
                const radios = this.radioGroup.getRadios(); 
                for (let i = 0; i < radios.length; ++i) { 
                    const radio = radios[i]; 
                    if (i === index) { 
                        radio.checked = true; 
                    }
                    else { 
                        radio.checked = false; 
                    } 
                } 
            } 
            get radioGroup() {
                return this.parent; 
            } 
            get element() {
                return this.radioGroup.el; 
            } 
        } 
        )(this); 
        /**
         * If true, set the layout of the radio control to horizontal, default is false.
         * @order 2
         */
        this.horizontal = false; 
        /**
         * Controls the tooltip that is displayed for this widget.
         * @order 210
         */
        this.tooltip = ''; 
        // #endregion
        // #region ti-element-base/ti-element-base-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * Sets to `true` to hide the element, otherwise `false`.
         *
         * @order 200
         */
        this.hidden = false; 
        // #endregion
        // #region ti-widget-base/ti-widget-base-title-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * The widget caption text.
         * @order 207
         */
        this.caption = ''; 
        /**
         * The widget info icon help text.
         * @order 208
         */
        this.infoText = ''; 
        // #endregion
        // #region ti-widget-base/ti-widget-base-disabled-props.tsx:
        // -----------Autogenerated - do not edit--------------
        /**
         * Controls the widget disabled state.
         * @order 202
         */
        this.disabled = false; 
        this.selectedTextChanged = createEvent(this, "selected-text-changed", 7);
        this.selectedIndexChanged = createEvent(this, "selected-index-changed", 7);
        this.selectedValueChanged = createEvent(this, "selected-value-changed", 7);
        this.cssPropertyChanged = createEvent(this, "css-property-changed", 7);
    }
    componentWillLoad() {
        this.el.className = 'ti-radio-group'; 
        /* initialize designer methods */
        this.el['onSettingChildPropertyValue'] = this.onSettingChildPropertyValue.bind(this); 
        if (this.initialIndex && !TiUtils.isInDesigner) { 
            this.selectedIndex = this.initialIndex; 
        } 
    } 
    componentDidLoad() {
        const radios = this.getRadios(); 
        for (let i = 0; i < radios.length; ++i) { 
            const radio = radios[i]; 
            this.labels.push(radio.label); 
            this.values.push(radio.value); 
            if (this.selectedIndex === i) { 
                radio.checked = true; 
            }
            else if (!TiUtils.isInDesigner && !this.initialIndex && this.selectedValue === radio.value) { 
                radio.checked = true; 
            }
            else if (!TiUtils.isInDesigner && !this.initialIndex && this.selectedText === radio.label) { 
                radio.checked = true; 
            } 
        } 
        this.base.componentDidLoad(); 
    } 
    render() {
        // JSXON
        return this.base.render(h("ti-radio-group", { disabled: this.disabled, horizontal: this.horizontal, value: this.selectedValue }, h("slot", null)), { caption: this.caption, infoText: this.infoText });
        // JSXOFF
    } 
    getRadios() {
        const radios = this.el.querySelectorAll('ti-widget-radio'); 
        const result = []; 
        for (let i = 0; i < radios.length; ++i) { 
            result.push(radios[i]); 
        } 
        return result; 
    } 
    /**
     * Designer callback method.
     *
     * @param child
     * @param name
     * @param value
     */
    onSettingChildPropertyValue(child, name, value) {
        if (name === 'checked') { 
            return {
                name: 'selectedText',
                value: value ? child.label : '',
                sideEffects: ['selectedIndex', 'selectedValue'] 
            }; 
        } 
    } 
    onTiChanged(event) {
        if (event.currentTarget === this.el && event.detail.selected) { 
            const radios = this.getRadios(); 
            for (let i = 0; i < radios.length; ++i) { 
                if (radios[i].value === event.detail.value) { 
                    this.selectedIndex = i; 
                    return; 
                } 
            } 
        } 
    } 
    onSelectedTextChanged(newValue, oldValue) {
        this.base.selectedTextChanged(); 
        this.selectedTextChanged.emit({ value: this.selectedText /*, oldValue: oldValue*/ }); 
    } 
    onSelectedValueChanged(newValue, oldValue) {
        this.base.selectedValueChanged(); 
        this.selectedValueChanged.emit({ value: this.selectedValue /*, oldValue: oldValue*/ }); 
    } 
    onSelectedIndexChanged(newValue, oldValue) {
        this.base.selectedIndexChanged(); 
        this.selectedIndexChanged.emit({ value: this.selectedIndex }); 
    } 
    /**
     * Sets the CSS property.
     *
     * @param {string} name the element style name
     * @param {string} value the new CSS property to be set
     */
    async setCSSProperty(name, value) {
        return this['base'][`${this.setCSSProperty.name}`](name, value); 
    } 
    /**
     * Returns the value of a CSS property.
     *
     * @param {string} name the element style property
     * @returns {string} the value of the property
     */
    async getCSSProperty(name) {
        return this['base'][`${this.getCSSProperty.name}`](name); 
    } 
    /**
     * Refresh the element.
     */
    async refresh() {
        return this['base'][`${this.refresh.name}`](); 
    } 
    /**
     * Fire an widget event.
     *
     * @param {string} eventName the event name, in dash notation
     * @param detail the event detail
     */
    async fire(eventName, detail) {
        return this['base'][`${this.fire.name}`](eventName, detail); 
    } 
    get el() { return getElement(this); }
    static get watchers() { return {
        "selectedText": ["onSelectedTextChanged"],
        "selectedValue": ["onSelectedValueChanged"],
        "selectedIndex": ["onSelectedIndexChanged"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n/* chrome: scroll width */\n::-webkit-scrollbar {\n  width: 7.5px;\n}\n\n/* chrome: scroll Track */\n::-webkit-scrollbar-track {\n  background: var(--ti-scroll-track-color, inherit);\n}\n\n/* chrome: scroll Handle */\n::-webkit-scrollbar-thumb {\n  background: var(--ti-scroll-thumb-color, inherit);\n}\n\n/* chrome: scroll Handle on hover */\n::-webkit-scrollbar-thumb:hover {\n  background: var(--ti-scroll-thumb-color-hover, inherit);\n}\n\n*:focus {\n  outline: none;\n}\n\n:host {\n  -webkit-user-select: none;\n  -khtml-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  user-select: none;\n  font-family: \"Roboto\", \"Open Sans\", \"Segoe UI\", Tahoma, sans-serif;\n  font-size: 14px;\n  font-weight: 400;\n  color: var(--theme-font-color, #231f20);\n  margin: 5px;\n  display: inline-block;\n}\n\n:host([hidden]) {\n  display: none;\n}\n\n:host([readonly]:not([disabled])) {\n  pointer-events: none;\n}\n:host([readonly]:not([disabled])) #elementWrapper {\n  pointer-events: none;\n}\n\n:host([disabled]) {\n  cursor: not-allowed;\n}\n:host([disabled]) #elementWrapper {\n  cursor: not-allowed;\n}\n\n:host([caption]:not([caption=\"\"])) {\n  margin-top: 27px;\n}\n\n:host([caption]:not([caption=\"\"])),\n:host([info-text]:not([info-text=\"\"])) {\n  overflow: visible;\n  position: relative;\n}\n\n:host([caption=\"\"][info-text]:not([info-text=\"\"])),\n:host([info-text]:not([info-text=\"\"]):not([caption])) {\n  margin-right: 27px;\n}\n\n#elementWrapper {\n  height: inherit;\n  width: inherit;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\n.root-container {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n}\n.root-container .header-container.top {\n  top: -22px;\n  -ms-flex-direction: row;\n  flex-direction: row;\n}\n.root-container .header-container.side {\n  right: -22px;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  height: inherit;\n}\n.root-container .header-container {\n  position: absolute;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n}\n.root-container .header-container .icon,\n.root-container .header-container ti-widget-icon {\n  margin: auto;\n  height: 18px;\n  width: 18px;\n  display: block;\n}\n.root-container .header-container .caption {\n  -ms-flex: 1;\n  flex: 1;\n  white-space: nowrap;\n  margin-right: 2px;\n  font-weight: 400;\n  font-size: 16px;\n  color: var(--theme-header-font-color, #63666a);\n}\n\n:host {\n  margin: 0;\n}"; }
};

export { TiWidgetRadioGroup as ti_widget_radio_group };

//# sourceMappingURL=ti-widget-radio-group.entry.js.map
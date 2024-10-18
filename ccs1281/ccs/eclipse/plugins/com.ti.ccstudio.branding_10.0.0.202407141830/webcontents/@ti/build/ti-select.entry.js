import { r as registerInstance, d as createEvent, h } from './core-800e68f4.js';

const Select = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.items = [];
        /**
         * Attribute based way of setting the list of options.
         * Expects a comma delimited list of options. Leading and trailing spaces around the options will be removed.
         */
        this.options = '';
        this.tiChange = createEvent(this, "tiChange", 7);
    }
    handleOptionsChange(options) {
        setTimeout(() => this._setItems(options));
    }
    _onSelectChange(event) {
        // set the value property when a selection is made
        this.value = event.target[event.target.selectedIndex].value.trim();
        // emit event
        this.tiChange.emit({ value: this.value });
    }
    _setItems(data) {
        const items = data.split(/[ ]?,[ ]?/); // comma and any leading or trailing spaces
        // reset the value unless it is one of the selected options
        if (items.indexOf(this.value) < 0) {
            this.value = undefined;
        }
        // change state last
        this.items = items;
    }
    componentWillLoad() {
        if (this.options && this.items.length === 0) {
            this._setItems(this.options);
        }
    }
    render() {
        return (h("select", { class: "ti-select-input", onChange: (e) => this._onSelectChange(e) }, (this.items.indexOf(this.value) < 0) && h("option", { value: this.value ? this.value : undefined }), this.items.length > 0 &&
            this.items.map(item => h("option", { value: item, selected: item === this.value }, item))));
    }
    static get watchers() { return {
        "options": ["handleOptionsChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host .ti-select-input {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  display: block;\n  width: auto;\n  max-width: 100%;\n  height: 32px;\n  padding: 0 calc(0.5rem + 28px) 0 0.5rem;\n  line-height: 30px;\n  font-family: inherit;\n  font-size: 14px;\n  border: 1px solid #cccccc;\n  background-image: url(\"https://www.ti.com/assets/icons/ti_icons-objects/chevron-down.svg\");\n  background-position: right 6px top 7px;\n  background-size: 18px;\n  background-repeat: no-repeat;\n  background-color: #ffffff;\n  border-radius: 0;\n  color: #555555;\n  cursor: pointer;\n}\n:host .ti-select-input::-ms-expand {\n  display: none;\n}\n:host .ti-select-input[disabled] {\n  background-color: #e8e8e8;\n  cursor: not-allowed;\n}"; }
};

export { Select as ti_select };

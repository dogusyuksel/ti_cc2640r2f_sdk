import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const Radio = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._hasRadioGroup = true;
        this._inputId = `ti-radio-${Radio.radioButtonIds++}`;
        /**
         * If `true`, the user cannot interact with the radio.
         */
        this.disabled = false;
        /**
         * If `true`, the radio is selected.
         */
        this.selected = false;
        this.tiChange = createEvent(this, "tiChange", 7);
        this.tiValue = createEvent(this, "tiValue", 7);
    }
    handleSelectedChange(isSelected) {
        // fire event
        this.tiChange.emit({
            selected: isSelected,
            value: this.value
        });
    }
    handleValueChange(value) {
        // fire event
        this.tiValue.emit({
            selected: this.selected,
            value: value
        });
    }
    /**
     * We override componentWillLoad so that we can ensure that radio
     * buttons have a value if not set by the user.
     */
    componentWillLoad() {
        let parent = this.hostElement.parentElement;
        while (parent.tagName !== 'TI-RADIO-GROUP' && parent.tagName !== 'BODY') {
            parent = parent.parentElement;
        }
        this._hasRadioGroup = parent.tagName === 'TI-RADIO-GROUP';
        if (this.value === undefined) {
            this.value = this._inputId;
        }
    }
    onClick() {
        this.selected = true;
    }
    onKeydown(ev) {
        // when not inside radio group, spacebar should select
        if (!this._hasRadioGroup && ev.keyCode === 32) {
            this.selected = true;
            ev.preventDefault();
        }
    }
    render() {
        const { _inputId: inputId, disabled, _hasRadioGroup: hasRadioGroup, selected, tooltip } = this;
        const labelId = inputId + '-lbl';
        const label = this._labelElement;
        if (label) {
            label.id = labelId;
        }
        return (h(Host, { "aria-checked": selected, "aria-disabled": disabled ? 'true' : null, "aria-labelledby": labelId, role: "radio", tabindex: disabled ? null : (hasRadioGroup ? -1 : 0), title: tooltip }, h("label", { ref: (el) => this._labelElement = el }, h("slot", null))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "selected": ["handleSelectedChange"],
        "value": ["handleValueChange"]
    }; }
    static get style() { return "\@charset \"UTF-8\";\n/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  font-family: \"Roboto\", \"Franklin Gothic Medium\", Tahoma, sans-serif;\n  cursor: pointer;\n  display: inline-block;\n  outline: 0;\n}\n:host label {\n  position: relative;\n  display: inline-block;\n  padding-left: 1.75rem;\n  line-height: 18px;\n  cursor: pointer;\n}\n:host label::before {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  position: absolute;\n  top: 0;\n  left: 0;\n  content: \" \";\n  background: #ffffff;\n  display: block;\n  width: 18px;\n  height: 18px;\n  -webkit-transition: all 100ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: all 100ms cubic-bezier(0.4, 0, 0.2, 1);\n  border-radius: 50%;\n  border: 2px solid #555555;\n}\n\n\@-webkit-keyframes focus-shadow {\n  from {\n    -webkit-box-shadow: 0 0 0 3px #9ed6df;\n    box-shadow: 0 0 0 3px #9ed6df;\n  }\n  to {\n    -webkit-box-shadow: 0 0 0 3px rgba(158, 214, 223, 0.25);\n    box-shadow: 0 0 0 3px rgba(158, 214, 223, 0.25);\n  }\n}\n\n\@keyframes focus-shadow {\n  from {\n    -webkit-box-shadow: 0 0 0 3px #9ed6df;\n    box-shadow: 0 0 0 3px #9ed6df;\n  }\n  to {\n    -webkit-box-shadow: 0 0 0 3px rgba(158, 214, 223, 0.25);\n    box-shadow: 0 0 0 3px rgba(158, 214, 223, 0.25);\n  }\n}\n:host(:focus) label::before {\n  -webkit-animation: focus-shadow linear 1s infinite alternate;\n  /* Chrome, Safari, Opera */\n  animation: focus-shadow linear 1s infinite alternate;\n}\n\n:host([selected]) label::before {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  background-color: #555555;\n  border: 2px solid #555555;\n}\n:host([selected]) label::after {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 14px;\n  height: 14px;\n  content: \" \";\n  border-radius: 50%;\n  background-color: #555555;\n  border: 2px solid #ffffff;\n}\n\n:host([disabled]) {\n  cursor: not-allowed;\n  pointer-events: none;\n  opacity: 0.5;\n}"; }
};
Radio.radioButtonIds = 0;

export { Radio as ti_radio };

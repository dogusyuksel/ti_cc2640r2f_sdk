import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const NEXT_KEYS = [
    'ArrowDown',
    'ArrowRight',
    // IE11 support:
    'Down',
    'Right'
];
const PREV_KEYS = [
    'ArrowLeft',
    'ArrowUp',
    // IE11 support:
    'Left',
    'Up'
];
const ARROW_KEYS = [...NEXT_KEYS, ...PREV_KEYS];
const RadioGroup = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._inputId = `ti-radio-group-${RadioGroup.radioGroupIds++}`;
        this._radios = [];
        /**
         * If `true`, the user cannot interact with this radio group.
         */
        this.disabled = false;
        /**
         * Sets the layout of the radio controls to horizontal instead of the default vertical.
         */
        this.horizontal = false;
        /**
         * The name of the control, which is submitted with the form data.
         */
        this.name = this._inputId;
        this.tiChange = createEvent(this, "tiChange", 7);
    }
    handleValueChange(value) {
        this._selectRadio(value);
        this.tiChange.emit({ value });
    }
    componentWillLoad() {
        /*
        Set intial state of group and radios
        - the group value should override any selections
        - make sure there is only one selection
        - if there is no value get it from the first selected radio
        */
        this._refreshRadioList();
        if (this.value === undefined) {
            // set the value based on selected radio
            let foundSelected = false;
            for (const radio of this._radios) {
                if (radio.selected) {
                    if (!foundSelected) {
                        this.value = radio.value;
                        foundSelected = true;
                    }
                    else {
                        // unselect multiple selections
                        radio.selected = false;
                    }
                }
            }
        }
        else {
            // select the radio matching the value
            let foundSelected = false;
            for (const radio of this._radios) {
                if (!foundSelected && radio.value === this.value) {
                    radio.selected = true;
                    foundSelected = true;
                }
                else if (radio.selected) {
                    // unselect multiple selections
                    radio.selected = false;
                }
            }
        }
    }
    onChange(ev) {
        const selectedRadio = ev.target;
        if (selectedRadio && ev.detail.selected) {
            this._unselectRadios(selectedRadio);
            this.value = ev.detail.value;
        }
    }
    onKeydown(ev) {
        // handle arrow keys only
        if (ARROW_KEYS.indexOf(ev.key) >= 0) {
            let radio = null;
            // if the group has focus, transfer it to a radio
            if (document.activeElement == this.hostElement) {
                // look for either a selected radio, or
                // the radio that has our current value
                let valueRadio = null;
                for (const r of this._radios) {
                    // we should always default to the selected radio
                    if (r.selected) {
                        // found a selected radio - done
                        radio = r;
                        break;
                    }
                    // find the first radio with matching value in case nothing selected
                    if (!valueRadio && r.value === this.value) {
                        valueRadio = r;
                    }
                }
                // if nothing is selected, use the first radio with matching value
                if (!radio && valueRadio) {
                    radio = valueRadio;
                }
            }
            // check if one of our radios has the focus
            else {
                radio = this._getFocusedRadio();
            }
            // if a radio is already selected, has focus,
            // or matches the group value,
            // move focus to another radio
            if (radio) {
                let focusMoveDirection = (NEXT_KEYS.indexOf(ev.key) >= 0) ? 1 : -1;
                this._focusMove(radio, focusMoveDirection);
            }
            // if no matching radio was found, select the first one
            else {
                // apply focus and select - selection will trigger event that updates value
                this._radios[0].focus();
                this._radios[0].selected = true;
            }
            ev.preventDefault(); // keep the window from scrolling
        }
    }
    onValue(ev) {
        const selectedRadio = ev.target;
        if (selectedRadio && ev.detail.selected) {
            this.value = ev.detail.value;
        }
    }
    _focusMove(fromRadio, direction) {
        this._refreshRadioList();
        let index = this._radios.indexOf(fromRadio) + direction;
        if (index < 0) {
            index = this._radios.length - 1;
        }
        else if (index >= this._radios.length) {
            index = 0;
        }
        // apply focus and select - selection will trigger event that updates value
        this._radios[index].focus();
        this._radios[index].selected = true;
    }
    _getFocusedRadio() {
        if (!document.hasFocus())
            return null;
        this._refreshRadioList();
        const activeItem = document.activeElement;
        for (const radio of this._radios) {
            if (activeItem === radio)
                return radio;
        }
        return null;
    }
    _refreshRadioList() {
        // refresh our internal radio list
        let radioList = [];
        let elements = this.hostElement.querySelectorAll('ti-radio:not([disabled])');
        for (let i = 0; i < elements.length; i++) {
            radioList.push(elements.item(i));
        }
        ;
        this._radios = radioList.splice(0);
    }
    _selectRadio(value) {
        this._refreshRadioList();
        for (const radio of this._radios) {
            if (value !== null && radio.value === value) {
                radio.selected = true;
                break;
            }
            else {
                radio.selected = false;
            }
        }
    }
    _unselectRadios(selectedRadio) {
        this._refreshRadioList();
        for (const radio of this._radios) {
            if (radio !== selectedRadio) {
                radio.selected = false;
            }
        }
    }
    render() {
        return (h(Host, { role: "radiogroup", tabindex: !this.disabled ? 0 : null }, h("slot", null)));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "value": ["handleValueChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: -ms-flexbox;\n  display: flex;\n}\n:host ::slotted(ti-radio), :host.sc-ti-radio-group-s ti-radio {\n  margin-right: 2rem;\n  margin-bottom: 0;\n}\n\n:host(:not([horizontal])) {\n  -ms-flex-direction: column;\n  flex-direction: column;\n}\n:host(:not([horizontal])) ::slotted(ti-radio), :host(:not([horizontal])).sc-ti-radio-group-s ti-radio {\n  margin-right: 0;\n  margin-bottom: 0.5rem;\n}\n:host(:not([horizontal])) ::slotted(ti-radio:last-child), :host(:not([horizontal])).sc-ti-radio-group-s ti-radio:last-child {\n  margin-bottom: 0;\n}"; }
};
RadioGroup.radioGroupIds = 0;

export { RadioGroup as ti_radio_group };

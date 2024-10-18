import { r as registerInstance, d as createEvent, h } from './core-800e68f4.js';

const Input = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Property for disabling the input
         *
         * @type {boolean}
         * @default false
         */
        this.disabled = false;
        /**
         * Property for setting read-only on the input
         *
         * @type {boolean}
         * @default false
         */
        this.readonly = false;
        /**
         * Property to set the type of input to `number` for standard numeric input allowing negative and decimal numbers.
         * This is a shortcut for setting `pattern="[-]?[0-9]*?[.]?[0-9]*?"`.
         * Only `number` is supported other than default `text`.
         *
         * @type {string}
         * @default 'text'
         */
        this.type = 'text';
        /**
         * Property for input value
         *
         * @type {string}
         * @default ''
         */
        this.value = '';
        this._onBlur = (ev) => {
            const input = ev.target;
            if (input) {
                const value = input.value || '';
                this.tiBlur.emit({ value });
            }
        };
        this._onFocus = (ev) => {
            const input = ev.target;
            if (input) {
                const value = input.value || '';
                this.tiFocus.emit({ value });
            }
        };
        this._onPaste = (ev) => {
            let data = '';
            // check for IE11 as clipboardData is not supported
            if (ev.clipboardData === undefined) {
                data = window['clipboardData'].getData('Text');
            }
            else {
                data = ev.clipboardData.getData('Text');
            }
            if (!data || !this._regex) {
                return;
            }
            this._filterInputEvent(ev, data);
        };
        this._onInput = (ev) => {
            const input = ev.target;
            if (input) {
                this.value = input.value || '';
            }
        };
        this._onKeyPress = (ev) => {
            this._filterInputEvent(ev, ev.key);
        };
        this.tiChange = createEvent(this, "tiChange", 7);
        this.tiBlur = createEvent(this, "tiBlur", 7);
        this.tiFocus = createEvent(this, "tiFocus", 7);
    }
    valueChanged() {
        this.tiChange.emit({ value: this.value });
    }
    componentWillLoad() {
        if (this.pattern) {
            this._regex = this.pattern;
        }
        else if (this.type === 'number') {
            this._regex = '[-]?[0-9]*?[.]?[0-9]*?';
        }
    }
    _filterInputEvent(event, value) {
        const input = event.target;
        if (input) {
            let inputValue = input.value;
            let insertPosition = input.selectionStart;
            if (insertPosition !== input.selectionEnd) {
                // paste over selection - remove the selected text first
                if (input.selectionDirection === 'backward') {
                    inputValue = inputValue.replace(inputValue.substring(input.selectionEnd, insertPosition), '');
                    insertPosition = input.selectionEnd;
                }
                else {
                    inputValue = inputValue.replace(inputValue.substring(insertPosition, input.selectionEnd), '');
                }
            }
            const newValue = this._placeValueAtPositionInText(inputValue, insertPosition, value);
            // need to use a new RegExp each time
            if (this._regex && !new RegExp('^' + this._regex + '$', 'g').test(newValue)) {
                event.preventDefault();
            }
        }
    }
    _placeValueAtPositionInText(text, position, value) {
        const newString = [text.slice(0, position), value, text.slice(position)].join('');
        return newString;
    }
    render() {
        return (h("input", { type: "text", "data-di-unmask-field": true, value: this.value, placeholder: this.placeholder, readonly: this.readonly, disabled: this.disabled, onBlur: this._onBlur, onFocus: this._onFocus, onInput: this._onInput, onKeyPress: this._onKeyPress, onPaste: this._onPaste }));
    }
    static get watchers() { return {
        "value": ["valueChanged"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: inline-block;\n}\n:host input {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  margin-bottom: 0;\n  width: 100%;\n  height: 32px;\n  padding: 0 0.5rem;\n  border: 1px solid #cccccc;\n  color: #555555;\n  font-family: inherit;\n  font-size: 14px;\n}\n:host input[disabled] {\n  background-color: #e8e8e8;\n  cursor: not-allowed;\n}\n:host input[readonly] {\n  cursor: not-allowed;\n}\n:host input[type=number]::-webkit-outer-spin-button,\n:host input[type=number]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n:host input[type=number] {\n  -moz-appearance: textfield;\n  /* Firefox */\n}"; }
};

export { Input as ti_input };

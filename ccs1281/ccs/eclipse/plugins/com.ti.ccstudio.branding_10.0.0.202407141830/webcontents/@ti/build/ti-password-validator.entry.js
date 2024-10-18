import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const PasswordValidator = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Property for disabling the input
         */
        this.disabled = false;
        /**
         * Placeholder text when input is empty
         */
        this.placeholder = '';
        /**
         * Property for setting read-only on the input
         */
        this.readonly = false;
        /**
         * A comma separated array of descriptions for each of the five strength levels
         * (for example, "Weak,Weak,Weak,Moderate,Strong")
         */
        this.strengthLevels = 'Weak,Weak,Weak,Moderate,Strong';
        /**
         * The "Strength:" text shown below the strength meter
         */
        this.strengthPrompt = 'Strength:';
        /**
         * Returns true if the value meets the password rules; false otherwise
         */
        this.isValid = false;
        /**
         * Property for initial value
         */
        this.value = '';
        this.tiChange = createEvent(this, "tiChange", 7);
        this.componentLoaded = createEvent(this, "componentLoaded", 7);
    }
    valueChanged() {
        this._checkPassword(this.value);
        this.tiChange.emit({ value: this.value });
    }
    /**
     * Initialize component
     */
    componentDidLoad() {
        let sr = this.hostElement.shadowRoot;
        this._passwordInput = sr.querySelector('input');
        // Set the maxlength and autocomplete attributes
        this._passwordInput.setAttribute('maxlength', '128');
        this._passwordInput.setAttribute('autocomplete', 'new-password');
        // Initialize the strength level string array
        this._strengthLevels = this.strengthLevels.split(',', 5);
        // Disable strength meter if zxcvbn not available
        if (typeof (window['zxcvbn']) !== 'function') {
            sr.querySelector('.ti-password-validator-strength-meter').setAttribute('style', 'display:none');
            console.log('zxcvbn not present; password validator will not check strength');
        }
        // Check initial value if needed
        this._checkPassword(this.value);
        // Emit an event so that listeners can update their visual state
        this.componentLoaded.emit();
    }
    _onPasswordInput(ev) {
        const input = ev.target;
        if (input) {
            this.value = input.value || '';
            this._checkPassword(input.value);
        }
    }
    /**
     * Check the password value to see if it passes the rules and measure its strength
     * @param value
     */
    _checkPassword(value) {
        // Check the rules
        let valid = true;
        for (let i = 0; i < PasswordValidator._PASSWORD_RULES.length; i++) {
            if (PasswordValidator._PASSWORD_RULES[i](value)) {
                PasswordValidator._RULE_ELEMENTS[i].classList.add('ti-password-validator-satisfied');
            }
            else {
                valid = false;
                PasswordValidator._RULE_ELEMENTS[i].classList.remove('ti-password-validator-satisfied');
            }
        }
        this.isValid = valid; // Avoid setting isValid more than needed (triggers render)
        // Check strength
        if (typeof (window['zxcvbn']) === 'function') {
            let score = 0;
            if (valid) {
                score = window['zxcvbn'](value).score;
            }
            const strClasses = [0, 1, 2, 3, 4, 5].map(x => 'ti-password-validator-strength-' + x);
            this._strengthMeterDiv.classList.remove(...strClasses);
            this._strengthMeterDiv.classList.add('ti-password-validator-strength-' + score);
            let strengthLevel = this._strengthLevels[score];
            if (value == '') {
                strengthLevel = "<span class='ti-password-validator-dash'></span>";
            }
            this._strengthTextDiv.innerHTML = '<b>' + this.strengthPrompt + '</b>&nbsp;' + strengthLevel;
        }
    }
    render() {
        let rule_rows = [];
        // Build the JSX for each of the rule rows. Inline because IE11
        // has issues with svg background-image
        for (let i = 0; i < PasswordValidator._RULE_ELEMENTS.length; i++) {
            rule_rows.push(h("li", { ref: el => PasswordValidator._RULE_ELEMENTS[i] = el }, h("span", { class: 'ti-password-validator-checkmark' }, h("svg", { viewBox: '-30 -30 200 200', focusable: 'false', xmlns: 'http://www.w3.org/2000/svg' }, h("path", { d: "M154.049 67.093l-75.956 75.956-.093-.093-.093.093-41.956-41.956 14.142-14.142L78 114.858l61.907-61.907 14.142 14.142z" }))), h("span", { class: 'ti-password-validator-close' }, h("svg", { viewBox: '-90 -120 300 300', focusable: 'false', xmlns: 'http://www.w3.org/2000/svg' }, h("path", { d: "M165 40.899L151.101 27 96 82.101 40.899 27 27 40.899 82.101 96 27 151.101 40.899 165 96 109.899 151.101 165 165 151.101 109.899 96z" }))), h("slot", { name: PasswordValidator._RULE_SLOT_NAMES[i] })));
        }
        return (h(Host, { class: 'ti-password-validator' }, h("input", { type: 'password', placeholder: this.placeholder, readonly: this.readonly, disabled: this.disabled, value: this.value, onInput: this._onPasswordInput.bind(this) }), h("div", { class: "ti-password-validator-strength-meter" }, h("div", { class: "ti-password-validator-strength-fill ti-password-validator-strength-0", ref: el => this._strengthMeterDiv = el })), h("div", { ref: el => this._strengthTextDiv = el }), rule_rows));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "value": ["valueChanged"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: inline-block;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host, :host :before, :host :after, :host * {\n  -webkit-box-sizing: inherit;\n  box-sizing: inherit;\n}\n:host input {\n  margin-bottom: 0;\n  width: 100%;\n  height: 32px;\n  padding: 0 0.5rem;\n  border: 1px solid #cccccc;\n  color: #555555;\n  font-size: 14px;\n  font-family: inherit;\n}\n:host input[disabled] {\n  background-color: #e8e8e8;\n  cursor: not-allowed;\n}\n:host input[readonly] {\n  cursor: not-allowed;\n}\n:host .ti-password-validator-strength-meter {\n  margin-top: 10px;\n  margin-bottom: 8px;\n  background-color: #e8e8e8;\n}\n:host .ti-password-validator-strength-fill {\n  height: 4px;\n  -webkit-transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms linear;\n  transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms linear;\n}\n:host .ti-password-validator-strength-0 {\n  width: 0%;\n}\n:host .ti-password-validator-strength-1 {\n  width: 25%;\n  background-color: #cc0000;\n}\n:host .ti-password-validator-strength-2 {\n  width: 50%;\n  background-color: #ff9933;\n}\n:host .ti-password-validator-strength-3 {\n  width: 75%;\n  background-color: #fbe458;\n}\n:host .ti-password-validator-strength-4 {\n  width: 100%;\n  background-color: #44bb55;\n}\n:host li {\n  list-style-type: none;\n  margin: 3px 0;\n}\n:host ul {\n  padding-left: 0;\n  margin: 4px 0;\n}\n:host span.ti-password-validator-checkmark {\n  display: none;\n  width: 18px;\n  margin-top: 1px;\n  margin-right: 0.5rem;\n}\n:host span.ti-password-validator-checkmark svg {\n  width: 18px;\n  height: 18px;\n  fill: #4b5;\n}\n:host span.ti-password-validator-close {\n  display: inline-block;\n  width: 18px;\n  margin-top: 1px;\n  margin-right: 0.5rem;\n}\n:host span.ti-password-validator-close svg {\n  width: 18px;\n  height: 18px;\n  fill: #c00;\n}\n:host span.ti-password-validator-dash {\n  display: inline-block;\n  width: 0.6rem;\n  margin-top: 0.5rem;\n  margin-left: 0.3rem;\n  position: absolute;\n  border-top: 2px solid #555;\n}\n:host li.ti-password-validator-satisfied span.ti-password-validator-checkmark {\n  display: inline-block;\n  fill: #44bb55;\n}\n:host li.ti-password-validator-satisfied span.ti-password-validator-close {\n  display: none;\n}"; }
};
/**
 * Password rules: each has an HTML element and a corresponding lambda function
 */
PasswordValidator._RULE_ELEMENTS = new Array(4);
PasswordValidator._RULE_SLOT_NAMES = ["req_length", "req_lowercase", "req_uppercase", "req_number"];
PasswordValidator._PASSWORD_RULES = [
    value => (value.length >= 8),
    // length requirement
    value => (/[a-z]/.test(value)),
    // lowercase requirement
    value => (/[A-Z]/.test(value)),
    // uppercase requirement
    value => (/[0-9]/.test(value)) // numeric digit requirement
];

export { PasswordValidator as ti_password_validator };

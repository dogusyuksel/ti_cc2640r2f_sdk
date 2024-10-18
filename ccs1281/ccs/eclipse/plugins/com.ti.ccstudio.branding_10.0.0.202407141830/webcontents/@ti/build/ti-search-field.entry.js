import { r as registerInstance, d as createEvent, h, H as Host } from './core-800e68f4.js';

const SearchField = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * State of the clear button's visibility. Modified when the input value changes.
         *
         * @type {boolean}
         * @memberof SearchField
         */
        this.clearButtonVisible = false;
        /**
         * Placeholder text for the text field. Defaults to `Search`.
         *
         * @type {string}
         * @memberof SearchField
         */
        this.placeholder = 'Search';
        this.tiChange = createEvent(this, "tiChange", 7);
        this.tiFocus = createEvent(this, "tiFocus", 7);
    }
    /**
     * Method to clear the ti-search-field. Optionally suppress the
     * `tiChange` event by providing `false` as a
     * parameter value. By default the event is fired.
     * @param {boolean} fireEvent - optional flag to suppress the tiChange event.
     */
    async clearSearch(fireEvent = true) {
        this.value = '';
        this.clearButtonVisible = false;
        if (fireEvent) {
            this.tiChange.emit({ value: this.value, eventType: 'click' }); // 'eventType' added for metrics tracking
            this._searchInput.focus();
        }
    }
    _onFocus(event) {
        const value = this.value || event.target.value;
        // emit event on focus of <input /> field
        this.tiFocus.emit({ value: value });
    }
    _onInput(event) {
        // figure out if the search was reverted to a previous value via backspacing/deleting
        const oldValue = (this.value || '').toLowerCase();
        const newValue = event.target.value.toLowerCase();
        const searchReverted = oldValue.indexOf(newValue) === 0;
        // store the new value
        this.value = event.target.value;
        // emit event
        this.tiChange.emit({ value: this.value, reverted: searchReverted });
        // deal with clear button status
        // hide if any text is in the textbox
        // make button visible otherwise
        if (this.value && this.value.length > 0) {
            this.clearButtonVisible = true;
        }
        else {
            this.clearButtonVisible = false;
        }
    }
    render() {
        return (h(Host, { class: { 'ti-search-field-clear': this.clearButtonVisible } }, h("div", { class: "ti-search-field-container" }, h("input", { "data-di-unmask-field": true, class: "ti-search-field-input", type: "text", placeholder: this.placeholder, value: this.value, ref: el => this._searchInput = el, onInput: (e) => this._onInput(e), onFocus: (e) => this._onFocus(e) }), this.clearButtonVisible &&
            h("input", { class: "ti-search-field-clear", onClick: () => this.clearSearch(), type: "button" }, "Clear search"))));
    }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host .ti-search-field-container {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  max-width: 400px;\n}\n:host .ti-search-field-container .ti-search-field-input {\n  margin-bottom: 0;\n  width: 100%;\n  height: 30px;\n  padding: 0 0.5rem;\n  border: 1px solid #cccccc;\n  color: #555555;\n  font-size: 1em;\n  -webkit-box-sizing: content-box;\n  box-sizing: content-box;\n  font-family: inherit;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  padding-right: calc(0.5rem + 28px);\n  background-size: 24px;\n  background-repeat: no-repeat;\n  background-image: url(\"https://www.ti.com/etc/designs/ti/images/icons/svg/ti_icons-actions/search.svg\");\n  background-position: calc(100% - 3px) -69px;\n}\n:host .ti-search-field-container .ti-search-field-input::-ms-clear {\n  display: none;\n}\n:host .ti-search-field-container .ti-search-field-clear {\n  position: absolute;\n  top: 1px;\n  right: 1px;\n  width: 30px;\n  height: 30px;\n  border: 0;\n  padding: 0;\n  border-radius: 0;\n  cursor: pointer;\n  text-indent: 100%;\n  white-space: nowrap;\n  overflow: hidden;\n  vertical-align: bottom;\n  background-size: 18px;\n  background-repeat: no-repeat;\n  background-position: 6px 6px;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'192\' height=\'960\'%3E%3Cpath xmlns=\'http://www.w3.org/2000/svg\' d=\'M165 40.899L151.101 27 96 82.101 40.899 27 27 40.899 82.101 96 27 151.101 40.899 165 96 109.899 151.101 165 165 151.101 109.899 96z\'/%3E%3C/svg%3E\");\n  background-color: transparent;\n  -webkit-transition: background-color 0.1s linear;\n  transition: background-color 0.1s linear;\n}\n:host .ti-search-field-container .ti-search-field-clear:hover, :host .ti-search-field-container .ti-search-field-clear:focus {\n  background-color: #e8e8e8;\n}\n\n:host(.ti-search-field-clear) .ti-search-field-input {\n  background: #ffffff !important;\n}"; }
};

export { SearchField as ti_search_field };

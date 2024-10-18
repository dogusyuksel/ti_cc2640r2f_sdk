import { r as registerInstance, h, H as Host, c as getElement } from './core-800e68f4.js';

const Card = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Property for color variants
         * Can only be: primary, secondary, callout, success, warn, error, plain-grey, plain-white; it is primary by default.
         */
        this.appearance = 'primary';
        /**
         * data-lid property for metrics tracking.
         */
        this.dataLid = "";
        /**
         * Enable the wide format of the card. This applies the colored border to
         * the left side of the card, and makes the card display as a `block` element
         * so that multiple cards will naturally be layed out vertically on the page.
         * `callout`, `success`, `warn`, and `error` cards are automatically always wide.
         *
         * @type {boolean}
         * @memberof Card
         */
        this.wide = false;
        this.dismissed = false;
    }
    componentWillLoad() {
        this._hasAction = !!this.hostElement.querySelector('[slot="action"]');
        this._hasCloseIcon = !!this.hostElement.querySelector('[slot="close-icon"]');
        this._hasLeftIcon = !!this.hostElement.querySelector('[slot="left-icon"]');
        this._hasTitle = !!this.hostElement.querySelector('[slot="title"]');
        this._hasTopAlert = !!this.hostElement.querySelector('[slot="top-alert"]');
        if (this._hasTopAlert || Card._WIDE_CARDS.some(appearance => appearance === this.appearance)) {
            this.wide = true;
        }
    }
    async dismiss() {
        this.dismissed = true;
    }
    /*
     * Component template structure notes
     *
     * The interior of the card has its own DIV in order to protect
     * layout from outer style by keeping it in the shadow. General
     * properties such as size can be applied to the host, but layout,
     * padding, etc. is protected.
     *
     * If the title and action slots are not used, their sections will be
     * excluded from the layout so that the margin spacings between the
     * content section and the title and/or action section will be dropped,
     * leaving no extraneous space above or below whatever section ends up
     * being at the top or bottom of the card.
     *
     * Cards using the top-alert slot are automatically wide cards.
     */
    render() {
        if (this.dismissed) {
            this.hostElement.remove();
            return null;
        }
        const mainContent = [
            this._hasTitle &&
                h("h3", { class: "ti-card-title" }, h("slot", { name: "title" })),
            h("div", { class: "ti-card-content" }, h("slot", null)),
            this._hasAction &&
                h("div", { class: "ti-card-action" }, h("slot", { name: "action" }))
        ];
        return (h(Host, { class: `
                    ti-card-${this.appearance}
                    ${this._hasTopAlert && 'ti-card-top-alert'}
                    ${this.wide && 'ti-card-wide'}
                ` }, this._hasCloseIcon && h("div", { class: "ti-card-close-icon", onClick: () => this.dismiss() }, h("slot", { name: "close-icon" })), this._hasTopAlert && h("div", { class: "ti-card-top-alert" }, h("ti-svg-icon", { appearance: "warn", size: "m" }, "warning"), h("slot", { name: "top-alert" })), h("div", { class: "ti-card-container" }, this.wide && this._hasLeftIcon
            ?
                h("div", { class: "ti-card-wide-content-wrapper" }, h("div", { class: "ti-card-left-icon-container" }, h("slot", { name: "left-icon" })), h("div", { class: "ti-card-content-wrapper" }, mainContent))
            :
                mainContent)));
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: -ms-flexbox;\n  display: flex;\n  height: 100%;\n  position: relative;\n  border-style: solid;\n  border-width: 2px 0px 0px;\n  -webkit-box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.1), 0 1px 1px 0 rgba(0, 0, 0, 0.12), 0 2px 1px -1px rgba(0, 0, 0, 0.1);\n  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.1), 0 1px 1px 0 rgba(0, 0, 0, 0.12), 0 2px 1px -1px rgba(0, 0, 0, 0.1);\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-card-close-icon {\n  position: absolute;\n  top: 1rem;\n  right: 1rem;\n  cursor: pointer;\n}\n:host .ti-card-container {\n  height: 100%;\n  width: 100%;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  padding: 2rem;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-card-container .ti-card-title {\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  display: block;\n  margin-top: 0;\n  color: #333333;\n}\n:host .ti-card-container .ti-card-content {\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-card-container .ti-card-action {\n  margin-top: 1.5rem;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  display: -ms-flexbox;\n  display: flex;\n}\n:host ::slotted([slot=top-alert]) {\n  font-family: inherit !important;\n  color: inherit !important;\n  text-decoration: none !important;\n  display: inline;\n}\n:host ::slotted([slot=title]) {\n  font-family: inherit !important;\n  font-size: 24px;\n  line-height: 24px;\n  font-weight: 300;\n  color: inherit !important;\n  text-decoration: none !important;\n}\n:host ::slotted(a[slot=title]) {\n  color: #333333 !important;\n  text-decoration: none !important;\n  cursor: pointer;\n}\n:host ::slotted(a[slot=title]:hover) {\n  color: #555555 !important;\n}\n:host ::slotted(:not([slot])) {\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n}\n:host ::slotted(:not(ti-button)[slot=action]) {\n  margin: 0;\n  text-decoration: none;\n  outline: 0;\n  font-family: inherit !important;\n  font-size: 1em;\n  white-space: nowrap;\n  cursor: pointer;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host ::slotted(:not(ti-button)[slot=action]:hover) {\n  color: #007c8c;\n}\n:host ::slotted(a[slot=action]) {\n  color: #007c8c;\n}\n:host ::slotted(a[slot=action]:hover) {\n  text-decoration: underline;\n}\n:host ::slotted([slot=action]:not(:nth-last-of-type(1))) {\n  margin-right: 1rem;\n}\n\n:host(.ti-card-plain-white) {\n  border: 0;\n  background-color: #ffffff;\n}\n\n:host(.ti-card-plain-grey) {\n  border: 0;\n  background-color: #f9f9f9;\n}\n\n:host(.ti-card-primary) {\n  border-color: #cc0000;\n  background-color: #ffffff;\n}\n:host(.ti-card-primary) .ti-card-container {\n  padding-top: calc(2rem - 2px);\n}\n\n:host(.ti-card-secondary) {\n  border-color: #007c8c;\n  background-color: #f9f9f9;\n}\n:host(.ti-card-secondary) .ti-card-container {\n  padding-top: calc(2rem - 2px);\n}\n\n:host(.ti-card-callout) {\n  border-color: #007c8c;\n  background-color: #ffffff;\n}\n\n:host(.ti-card-success) {\n  border-color: #44bb55;\n  background-color: #f9f9f9;\n}\n\n:host(.ti-card-warn) {\n  border-color: #ff9933;\n  background-color: #f9f9f9;\n}\n\n:host(.ti-card-error) {\n  border-color: #990000;\n  background-color: #f9f9f9;\n}\n\n:host(.ti-card-top-alert) {\n  border-color: #ff9933;\n}\n:host(.ti-card-top-alert) .ti-card-top-alert {\n  height: 42px;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  color: #fff;\n  padding: 0 1rem 0 calc(1rem - 3px);\n  background-color: #555;\n  line-height: 24px;\n  font-size: 16px;\n  font-weight: 500;\n  text-decoration: none;\n  display: -ms-flexbox;\n  display: flex;\n}\n:host(.ti-card-top-alert) .ti-card-top-alert ti-svg-icon {\n  display: inline-block;\n  margin: 0px 10px 0px -2px;\n  overflow: visible;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n}\n:host(.ti-card-top-alert) .ti-card-close-icon {\n  top: calc((42px - 24px) / 2);\n}\n\n:host(.ti-card-wide) {\n  display: block;\n  border-top-width: 0px;\n  border-left-width: 3px;\n}\n:host(.ti-card-wide) .ti-card-container {\n  padding: 3rem;\n  padding-left: calc(3rem - 3px);\n}\n:host(.ti-card-wide) .ti-card-container .ti-card-wide-content-wrapper {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: start;\n  align-items: flex-start;\n}\n:host(.ti-card-wide) .ti-card-container .ti-card-wide-content-wrapper .ti-card-left-icon-container {\n  width: auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  margin-right: 1rem;\n}\n:host(.ti-card-wide) .ti-card-container .ti-card-wide-content-wrapper .ti-card-content-wrapper {\n  width: auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n}"; }
};
Card._WIDE_CARDS = ['callout', 'success', 'warn', 'error'];

export { Card as ti_card };

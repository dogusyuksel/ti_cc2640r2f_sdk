import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const DropdownPanel = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /* extra space in px when checking for dropdown panel bounds */
        this._safetySpace = 32;
        /**
         * state of dropdown panel
         * "isExpanded = true", dropdown panel is expanded
         * "isExpanded = false", dropdown panel is collapsed
         * @default 'false'
         */
        this.isExpanded = false;
        /**
         * Property for which direction the dropdown panel is pinned to open
         * "left to right" or "right to left"
         * @default 'ltr'
         */
        this.direction = 'ltr';
        /**
         * Property for dropdown panel trigger type
         * "hover = false", panel opens on click of trigger element
         * "hover = true", panel opens on hover
         * @default 'false'
         */
        this.hover = false;
        this.tiDropdownPanelToggle = createEvent(this, "tiDropdownPanelToggle", 7);
    }
    /**
     * Listening for click outside of host element to close open dropdown panel
     */
    onClick(ev) {
        if (this.isExpanded && !ev.composedPath().includes(this.hostElement)) {
            this.closeDropdownPanel();
        }
    }
    /**
     * Listening for other panels opening to close panel
     */
    onDropdownPanelToggle(event) {
        if (event.detail && this.isExpanded && !event.composedPath().includes(this.hostElement)) {
            this.closeDropdownPanel(false);
        }
    }
    /**
     * Listen to the `mouseenter` event on host-element
     */
    onMouseEnter() {
        if (this.hover) {
            // clear hover exit timer
            if (typeof this._hoverTimer === 'number') {
                window.clearTimeout(this._hoverTimer);
            }
            this._openDropdownPanel();
        }
    }
    /**
     * Listen to the `mouseleave` event on host-element
     */
    onMouseLeave() {
        if (this.hover) {
            // set styles for hidden panel
            this._ddPanelElement.style.zIndex = '5'; // adjust z-index immediately
            // timer to mimic hover intent on mouse exit
            this._hoverTimer = window.setTimeout(() => {
                this.closeDropdownPanel();
            }, 250);
        }
    }
    /**
     * Method to close the dropdown panel. Optionally suppress the
     * `tiDropdownPanelToggle` event by providing `false` as a
     * parameter value. By default the event is fired.
     * @param {boolean} fireEvent - optional flag to suppress the tiDropdownPanelToggle event.
     */
    async closeDropdownPanel(fireEvent = true) {
        this.isExpanded = false;
        this._ddPanelElement.style.cssText = `
            z-index: 5;
            opacity: 0;
            height: 0;
            padding: 0;
            border-bottom: none;
            overflow: hidden;
            bottom: ${this._ddPanelElement.style.bottom};
            left: ${this._ddPanelElement.style.left};
            right: ${this._ddPanelElement.style.right};
        `;
        if (fireEvent) {
            this.tiDropdownPanelToggle.emit(false);
        }
    }
    /**
     * Function to return true if dropdown panel element would extend below end of page.
     * @returns {boolean}
     */
    _checkDropdownPanelBoundsBottom() {
        return (this._ddPanelElement.getBoundingClientRect().top + this._ddPanelElement.scrollHeight) > (document.body.clientHeight - this._safetySpace);
    }
    /**
     * Function to return true if dropdown panel element would extend past left side of page.
     * @returns {boolean}
     */
    _checkDropdownPanelBoundsLeft() {
        return (this._ddPanelElement.getBoundingClientRect().left) < (-this._safetySpace);
    }
    /**
     * Function to return true if dropdown panel element would extend past right side of page.
     * @returns {boolean}
     */
    _checkDropdownPanelBoundsRight() {
        return (this._ddPanelElement.getBoundingClientRect().right) > (window.innerWidth - this._safetySpace);
    }
    /**
     * Toggle dropdown panel.
     * @returns {void}
     */
    _onTriggerClick(ev) {
        ev.preventDefault();
        if (!this.isExpanded) {
            this._openDropdownPanel();
        }
        else {
            this.closeDropdownPanel();
        }
    }
    /**
     * Set visible panel styles
     * @returns {void}
     */
    _openDropdownPanel() {
        this.isExpanded = true;
        this.tiDropdownPanelToggle.emit(true);
        this._ddPanelElement.style.cssText = `
            z-index: 10;
            opacity: 1;
            pointer-events: initial;
        `;
        this._ddPanelElement.style.bottom = (this._checkDropdownPanelBoundsBottom()) ? `${this.hostElement.clientHeight}px` : 'initial';
        this._ddPanelElement.style.left = (this.direction == 'ltr') ? '-1.5rem' : 'initial';
        this._ddPanelElement.style.right = (this.direction == 'ltr') ? 'initial' : '-1.5rem';
        if ((this.direction == 'ltr') && this._checkDropdownPanelBoundsRight()) {
            this._ddPanelElement.style.left = 'initial';
            this._ddPanelElement.style.right = '-1.5rem';
        }
        ;
        if ((this.direction == 'rtl') && this._checkDropdownPanelBoundsLeft()) {
            this._ddPanelElement.style.left = '-1.5rem';
            this._ddPanelElement.style.right = 'initial';
        }
        ;
    }
    render() {
        return (h(Host, { class: {
                'ti-dropdown-panel-expanded': this.isExpanded,
                'ti-dropdown-panel-hover': this.hover,
            } }, h("div", { class: "ti-dropdown-panel-trigger", onClick: (event) => this.hover ? undefined : this._onTriggerClick(event) }, h("slot", { name: "trigger" }), h("div", { class: "ti-dropdown-panel-icon" }, h("ti-svg-icon", { size: "s", "icon-set": "objects" }, "chevron-down"))), h("div", { class: "ti-dropdown-panel-content", ref: (el) => this._ddPanelElement = el }, h("slot", { name: "content" }))));
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: inline-block;\n  position: relative;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  text-align: left;\n}\n:host *, :host *::before, :host *::after {\n  -webkit-box-sizing: inherit;\n  box-sizing: inherit;\n}\n:host .ti-dropdown-panel-trigger {\n  cursor: pointer;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n}\n:host .ti-dropdown-panel-content {\n  position: absolute;\n  top: initial;\n  right: initial;\n  bottom: initial;\n  left: initial;\n  z-index: 5;\n  padding: 1rem 1.5rem;\n  opacity: 0;\n  pointer-events: none;\n  width: -webkit-max-content;\n  width: -moz-max-content;\n  width: max-content;\n  min-width: calc(100% + 3rem);\n  background-color: #f9f9f9;\n  -webkit-box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.09), 0 3px 4px 0 rgba(0, 0, 0, 0.11), 0 3px 3px -2px rgba(0, 0, 0, 0.09);\n  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.09), 0 3px 4px 0 rgba(0, 0, 0, 0.11), 0 3px 3px -2px rgba(0, 0, 0, 0.09);\n  border-bottom: 2px solid #555555;\n  -webkit-transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), height 250ms cubic-bezier(0.4, 0, 1, 1);\n  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), height 250ms cubic-bezier(0.4, 0, 1, 1);\n}\n:host .ti-dropdown-panel-icon {\n  margin-left: 0.5rem;\n  -ms-flex-item-align: center;\n  align-self: center;\n}\n:host .ti-dropdown-panel-icon ti-svg-icon {\n  -webkit-transition: -webkit-transform 0.15s ease-in-out;\n  transition: -webkit-transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;\n}\n\n:host(.ti-dropdown-panel-expanded:not(.ti-dropdown-panel-hover)) .ti-dropdown-panel-icon ti-svg-icon {\n  -webkit-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n\n:host([direction=ltr]) .ti-dropdown-panel-content {\n  left: -1.5rem;\n}\n\n:host([direction=rtl]) .ti-dropdown-panel-content {\n  right: -1.5rem;\n}"; }
};

export { DropdownPanel as ti_dropdown_panel };

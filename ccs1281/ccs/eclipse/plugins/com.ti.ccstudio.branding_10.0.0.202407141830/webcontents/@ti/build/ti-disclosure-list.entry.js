import { r as registerInstance, d as createEvent, h, H as Host } from './core-800e68f4.js';

/**
 * Convenience method for using fetch but setting a time limit for the response
 * to come back.
 *
 * NOTE: 5 seconds is the TI standard timeout
 *
 * @param url Url to fetch
 * @param options Options to forward to regular fetch() method
 * @param timeout Time to wait before rejecting the promise (optional)
 */
function fetchWithTimeout(url, options, timeout = 5000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
}
/**
 * Cheap function for doing like a "sleep" or "timeout".
 * You can use `.then()` or `await _wait(...` if you're running in async function
 * @param timeout Time to wait, in milliseconds
 */
async function waitFor(timeout) {
    return new Promise((resolve, _) => setTimeout(() => resolve(), timeout));
}

const DisclosureList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        // tiDisclosureListChange is being fired in _updateDropdownPanel but
        // that fucntion is being used before component is loaded
        // added a flag to only fire tiDisclosureListChange once component has been loaded
        // eg when user expands/collapses list
        this._loaded = false;
        /**
         * Property for directly setting whether the component is expanded or not.
         *
         * @default false
         * @memberof DisclosureList
         */
        this.expanded = false;
        /**
         * Property for setting the component to be non-collapsible.
         *
         * @default false
         * @memberof DisclosureList
         */
        this.noCollapse = false;
        this.tiDisclosureListChange = createEvent(this, "tiDisclosureListChange", 7);
        this.tiDisclosureListRendered = createEvent(this, "tiDisclosureListRendered", 7);
    }
    handleExpandedChange() {
        this._updateDropdownPanel();
        if (this._loaded) {
            let detail = {
                action: this.expanded ? "open" : "close"
            };
            this.tiDisclosureListChange.emit(detail);
        }
    }
    handleNoCollapseChange(noCollapseValue) {
        this.expanded = noCollapseValue || this.expanded;
    }
    componentWillLoad() {
        if (this.noCollapse) {
            this.expanded = true;
        }
    }
    componentDidLoad() {
        this._height = this._expandableElement.scrollHeight;
        this._updateDropdownPanel();
        this._loaded = true;
        this.tiDisclosureListRendered.emit();
    }
    /**
     * Method for expanding/collapsing the list. This only works
     * when `noCollapse` is not true.
     */
    async toggle() {
        this.expanded = this.noCollapse ? true : !this.expanded;
    }
    _updateDropdownPanel() {
        if (this._expandableElement !== undefined) {
            // recalculate the height
            this._height = this._expandableElement.scrollHeight;
            if (this.noCollapse) {
                this._expandableElement.style.height = 'auto';
            }
            else if (this.expanded) {
                //Need to set height using js because height:auto cannot css animate
                this._expandableElement.style.height = this._height + 'px';
                // reset height to auto after animation so that we resize to fit contents
                waitFor(400).then(() => {
                    this._expandableElement.style.height = 'auto';
                });
            }
            else {
                // set fixed height, then wait and set height to zero to animate the collapse
                this._expandableElement.style.height = this._height + 'px';
                waitFor(50).then(() => {
                    this._expandableElement.style.height = 0 + 'px';
                });
            }
        }
    }
    render() {
        return (h(Host, null, h("div", { class: "ti-disclosure-list-label", onClick: !this.noCollapse && (() => this.toggle()) }, h("slot", { name: "label" }), !this.noCollapse && h("ti-svg-icon", { "icon-set": "objects", size: "s", appearance: "secondary" }, "chevron-down")), h("div", { class: "ti-disclosure-list-content-container", ref: (el) => this._expandableElement = el }, h("div", { class: "ti-disclosure-list-content" }, h("slot", null)))));
    }
    static get watchers() { return {
        "expanded": ["handleExpandedChange"],
        "noCollapse": ["handleNoCollapseChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: inline-block;\n}\n:host .ti-disclosure-list-label {\n  line-height: 18px;\n  font-size: 14px;\n  color: #007c8c;\n  cursor: pointer;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-transition: padding-bottom 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: padding-bottom 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-disclosure-list-label ti-svg-icon {\n  margin-left: 0.25rem;\n  -webkit-transition: -webkit-transform 0.15s ease-in-out;\n  transition: -webkit-transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;\n}\n:host .ti-disclosure-list-content-container {\n  width: 100%;\n  -webkit-transition: height 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: height 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n  overflow-y: hidden;\n  height: 0;\n}\n:host .ti-disclosure-list-content-container .ti-disclosure-list-content {\n  display: table;\n  border-collapse: collapse;\n  border-spacing: 0px;\n}\n:host ::slotted(ti-disclosure-list-item) {\n  vertical-align: middle;\n  font-size: 12px;\n}\n:host ::slotted([slot=label]) {\n  margin: 0;\n}\n\n:host([expanded]) .ti-disclosure-list-label {\n  padding-bottom: 6px;\n}\n:host([expanded]) .ti-disclosure-list-label ti-svg-icon {\n  -webkit-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n\n:host([no-collapse]) .ti-disclosure-list-label {\n  cursor: default;\n}\n:host([no-collapse]) .ti-disclosure-list-content-container {\n  overflow: visible;\n}"; }
};

export { DisclosureList as ti_disclosure_list };

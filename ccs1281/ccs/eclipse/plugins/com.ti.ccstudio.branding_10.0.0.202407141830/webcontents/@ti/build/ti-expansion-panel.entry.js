import { r as registerInstance, d as createEvent, h, H as Host } from './core-800e68f4.js';

const ExpansionPanel = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Property for directly setting whether the component is expanded or not
         * @default false
         */
        this.isExpanded = false;
        this.tiChange = createEvent(this, "tiChange", 7);
    }
    handleIsExpandedChange() {
        this._updateExpansionPanel();
        this.tiChange.emit();
    }
    componentDidLoad() {
        this._height = this._contentEl.scrollHeight;
        this._updateExpansionPanel();
    }
    async toggle() {
        this.isExpanded = !this.isExpanded;
        this._updateExpansionPanel();
    }
    _updateExpansionPanel() {
        if (this.isExpanded) {
            //Need to set height using js because height:auto cannot css animate
            this._contentEl.style.height = this._height + 'px';
        }
        else {
            this._contentEl.style.height = 0 + 'px';
        }
    }
    render() {
        return (h(Host, { class: {
                'ti-expansion-panel': true,
                'ti-expansion-panel-expanded': this.isExpanded,
            } }, h("div", { class: "ti-expansion-panel-title", onClick: () => this.toggle() }, h("slot", { name: "title" }), h("div", { class: "ti-expansion-panel-icon" }, h("ti-svg-icon", { "icon-set": "objects", size: "m" }, "chevron-down"))), h("div", { class: "ti-expansion-panel-content-container", ref: (el) => this._contentEl = el }, h("div", { class: "ti-expansion-panel-content" }, h("slot", { name: "content" })))));
    }
    static get watchers() { return {
        "isExpanded": ["handleIsExpandedChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: block;\n  margin-bottom: 2px;\n}\n:host ti-svg-icon {\n  -webkit-transition: -webkit-transform 0.15s ease-in-out;\n  transition: -webkit-transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;\n}\n:host ::slotted([slot=title]) {\n  margin: 0 !important;\n  font-size: 1.2em !important;\n}\n:host .ti-expansion-panel-title {\n  cursor: pointer;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  padding: 0.75rem;\n  -webkit-transition: background-color 150ms linear;\n  transition: background-color 150ms linear;\n  background-color: #f9f9f9;\n}\n:host .ti-expansion-panel-title:hover {\n  background-color: #e8e8e8;\n}\n:host .ti-expansion-panel-content-container {\n  -webkit-transition: height 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: height 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n  overflow-y: hidden;\n  height: 0;\n}\n:host .ti-expansion-panel-content-container .ti-expansion-panel-content {\n  margin: 0.75rem;\n}\n\n:host(.ti-expansion-panel-expanded) {\n  border-color: #b9b9b9;\n  border-style: dotted;\n  border-width: 1px 0;\n  display: block;\n  margin-top: -1px;\n}\n:host(.ti-expansion-panel-expanded) .ti-expansion-panel-icon ti-svg-icon {\n  -webkit-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n:host(.ti-expansion-panel-expanded) .ti-expansion-panel-title {\n  -webkit-transition: background 500ms;\n  transition: background 500ms;\n  background: none;\n}"; }
};

export { ExpansionPanel as ti_expansion_panel };

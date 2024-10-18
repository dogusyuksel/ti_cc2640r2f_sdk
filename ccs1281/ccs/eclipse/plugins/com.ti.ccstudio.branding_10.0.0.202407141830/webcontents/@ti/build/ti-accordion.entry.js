import { r as registerInstance, h, c as getElement } from './core-800e68f4.js';

const Accordion = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._expandedCount = 0;
        /**
         * State for the ti-expansion-panel children
         */
        this.expansionPanels = [];
        /**
         * Property to set the collapse all label display
         * @default Accordion.DEFAULT_COLLAPSE_ALL_LABEL
         */
        this.collapseAllLabel = Accordion.DEFAULT_COLLAPSE_ALL_LABEL;
        /**
         * Property to set the expand all label display
         * @default is Accordion.DEFAULT_EXPAND_ALL_LABEL
         */
        this.expandAllLabel = Accordion.DEFAULT_EXPAND_ALL_LABEL;
    }
    componentWillLoad() {
        this.expansionPanels = Array.from(this.hostElement.querySelectorAll('ti-expansion-panel'));
        this.expansionPanels.forEach(expansionPanel => {
            if (expansionPanel.isExpanded) {
                this._expandedCount++;
            }
        });
        this._updateExpandAllState();
    }
    handleExpansionPanelExpand(ev) {
        const expansionPanel = ev.target;
        if (expansionPanel) {
            if (expansionPanel.isExpanded) {
                this._expandedCount++;
            }
            else {
                this._expandedCount--;
            }
        }
        this._updateExpandAllState();
    }
    /**
     * Method to toggle the label change and expansion/collapse of children ti-expansion-panels
     */
    async toggle() {
        const expandAll = this.action === 1 /* expandAll */;
        this.action = expandAll ? 0 /* collapseAll */ : 1 /* expandAll */;
        this.expansionPanels.forEach(function (expansionPanel) {
            expansionPanel.isExpanded = expandAll;
        });
    }
    _updateExpandAllState() {
        if (this._expandedCount > this.expansionPanels.length / 2) {
            this.action = 0 /* collapseAll */;
        }
        else {
            this.action = 1 /* expandAll */;
        }
    }
    render() {
        return ([
            h("div", { class: "ti-accordion-button" }, h("span", { onClick: () => this.toggle() }, this.action === 1 /* expandAll */ ? this.expandAllLabel : this.collapseAllLabel)),
            h("slot", null)
        ]);
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\nti-accordion .ti-accordion-button {\n  color: #007c8c;\n  cursor: pointer;\n  float: none;\n  margin-bottom: 0.5rem;\n  text-align: right;\n}\nti-accordion .ti-accordion-button:hover {\n  text-decoration: underline;\n}\n\nti-expansion-panel.ti-expansion-panel-expanded + ti-expansion-panel.ti-expansion-panel-expanded {\n  border-top: none;\n}"; }
};
Accordion.DEFAULT_COLLAPSE_ALL_LABEL = 'Collapse all';
Accordion.DEFAULT_EXPAND_ALL_LABEL = 'Expand all';

export { Accordion as ti_accordion };

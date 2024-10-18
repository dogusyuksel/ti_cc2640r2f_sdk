import { r as registerInstance, h, H as Host, c as getElement } from './core-800e68f4.js';

const TooltipTrigger = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._toolTipLastPosition = "";
        /**
         * Enables fixed positioning of the tooltip such that it is always oriented
         * to the area of the screen with the most room.
         * eg: If this trigger is in the bottom-right of the screen, the tooltip
         * will try to be oriented to the upper-left of the trigger.
         * @default false
         */
        this.useFixedPositionForTooltip = false;
    }
    _handleMouseOver(_) {
        this._setTooltipPosition();
    }
    _setTooltipPosition() {
        if (!this.useFixedPositionForTooltip) {
            return;
        }
        const tooltip = this.hostElement.querySelector(`ti-tooltip`);
        if (!tooltip) {
            return;
        }
        // set the tooltip positioning to fixed
        tooltip.style.position = "fixed";
        // goal is to figure out where we are...
        // and the put the tooltip always in the direction that has the most room
        const triggerBounds = this.hostElement.getBoundingClientRect();
        const triggerCenter = {
            x: triggerBounds.left + triggerBounds.width * (0.5),
            y: triggerBounds.top + triggerBounds.height * (0.5),
        };
        const windowCenter = {
            x: window.innerWidth * (0.5),
            y: window.innerHeight * (0.5),
        };
        // clear the tooltip position
        if (this._toolTipLastPosition) {
            tooltip.classList.remove(this._toolTipLastPosition);
            this._toolTipLastPosition = "";
        }
        else {
            // possible that tooltip has default positions
            // we should clear them out
            if (tooltip.classList.contains('ti-tooltip-bottom')) {
                tooltip.classList.remove('ti-tooltip-bottom');
            }
            else if (tooltip.classList.contains('ti-tooltip-right')) {
                tooltip.classList.remove('ti-tooltip-right');
            }
        }
        // NOTE: we also made some minor pixel adjustments here...
        const tooltipPointerPadding = 14;
        const tooltipBounds = tooltip.getBoundingClientRect();
        // try and figure out where we should position the tooltip based on our current size
        if (triggerCenter.y < windowCenter.y && triggerCenter.x > windowCenter.x) {
            this._toolTipLastPosition = 'ti-tooltip-left-down';
            // we're in the top-right, so we want the tooltip to be left-down
            tooltip.classList.add(this._toolTipLastPosition);
            // line up with our top
            tooltip.style.top = triggerBounds.top - tooltipPointerPadding - 1 + "px";
            // position to our left
            tooltip.style.left = triggerBounds.left - tooltipBounds.width - tooltipPointerPadding + "px";
        }
        else if (triggerCenter.y > windowCenter.y && triggerCenter.x < windowCenter.x) {
            this._toolTipLastPosition = 'ti-tooltip-right-up';
            // we're in the bottom-left, so we want the tooltip to be right-up
            tooltip.classList.add(this._toolTipLastPosition);
            // line up with our bottom
            tooltip.style.top = triggerBounds.top + triggerBounds.height - tooltipBounds.height + tooltipPointerPadding + 3 + "px";
            // position to our right
            tooltip.style.left = triggerBounds.left + triggerBounds.width + tooltipPointerPadding + "px";
        }
        else if (triggerCenter.y > windowCenter.y && triggerCenter.x > windowCenter.x) {
            this._toolTipLastPosition = 'ti-tooltip-left-up';
            // we're in the bottom-right, so we want the tooltip to be left-up
            tooltip.classList.add(this._toolTipLastPosition);
            // line up with our bottom
            // (add 3 to line up the bottom of the text)
            tooltip.style.top = triggerBounds.top + triggerBounds.height - tooltipBounds.height + tooltipPointerPadding + 3 + "px";
            // position to our left
            tooltip.style.left = triggerBounds.left - tooltipBounds.width - tooltipPointerPadding + "px";
        }
        else {
            this._toolTipLastPosition = 'ti-tooltip-right-down';
            // we're in the top-left, so we want the tooltip to be right-down
            tooltip.classList.add(this._toolTipLastPosition);
            // line up with our top
            tooltip.style.top = triggerBounds.top - tooltipPointerPadding - 1 + "px";
            // position to our right
            tooltip.style.left = triggerBounds.left + triggerBounds.width + tooltipPointerPadding + "px";
        }
    }
    componentDidRender() {
        this._setTooltipPosition();
    }
    render() {
        return (h(Host, { onMouseOver: (ev) => { this._handleMouseOver(ev); } }, h("slot", null)));
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\nti-tooltip-trigger {\n  cursor: pointer;\n  position: relative;\n}\n\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\nti-tooltip-trigger {\n  display: inline-block;\n  position: relative;\n}\nti-tooltip-trigger:hover ti-tooltip, ti-tooltip-trigger:focus ti-tooltip, ti-tooltip-trigger:checked ti-tooltip {\n  display: inline-block;\n  z-index: 2;\n  opacity: 1;\n}"; }
};

export { TooltipTrigger as ti_tooltip_trigger };

import { r as registerInstance, h, c as getElement } from './core-800e68f4.js';

const FeaturedProduct = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Property for ti-card color variants
         * Can only be: primary, secondary; it is primary by default
         */
        this.appearance = 'primary';
    }
    componentDidLoad() {
        if (this._hasImage) {
            let image = this.hostElement.querySelector('img[slot="image"]');
            if (!image) {
                image = this.hostElement.querySelector('[slot="image"] img');
            }
            if (!!image) {
                /*
                * The overall intent of this design is to force the image section to
                * have a 16:9 aspect ratio with the <img> always directly centered.
                * See the SCSS code for the other part of this equation. Here, the
                * <img> inside the image slot is positioned by the component
                * code so that it will align in the center of the 16:9 image area.
                */
                image.setAttribute('style', `max-width: 100%;
                    max-height: 100%;
                    display: block;
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    margin: auto`);
            }
        }
    }
    componentWillLoad() {
        this._hasImage = !!this.hostElement.querySelector('[slot="image"]');
    }
    render() {
        return (h("ti-card", { appearance: this.appearance }, this._hasImage &&
            h("div", { class: "ti-featured-product-image" }, h("slot", { name: "image" })), h("h3", { class: "ti-featured-product-title" }, h("slot", { name: "title" })), h("div", null, h("slot", { name: "content" })), h("div", { slot: "action" }, h("slot", { name: "button" }))));
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n/**\n* ==========================================================================\n* featured-product.scss\n*\n* Featured box layout currently includes: ti-card, buttons, icons and styled list\n* ==========================================================================\n*/\n:host {\n  font-size: var(--ti-font-size, 14px);\n  /*\n   * The overall intent of this design is to force the image area to\n   * have a 16:9 aspect ratio with the <img> always directly centered.\n   * Horizontal centering is achieved by having the parent image-container\n   * horizontally align its content in the center with text-align:center,\n   * and giving the inner image section 100% width. Vertical centering is\n   * achieved by assigning the inner image section zero height and top\n   * padding of 56.25%. The <img> inside this section will be positioned by\n   * the component code so that it will align in the center of the 16:9 area.\n   */\n}\n:host .ti-featured-product-title {\n  -ms-flex: 0;\n  flex: 0;\n  display: block;\n  font-size: 20px;\n  font-weight: 500;\n  margin: 0 0 1em 0;\n  text-align: center;\n}\n:host ::slotted([slot=title]) {\n  color: #555 !important;\n  text-decoration: none;\n  outline: 0;\n}\n:host ::slotted(a[slot=title]:hover) {\n  text-decoration: underline !important;\n}\n:host ::slotted([slot=content]) {\n  max-width: 100%;\n}"; }
};

export { FeaturedProduct as ti_featured_product };

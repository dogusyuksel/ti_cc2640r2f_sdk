import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const ViewMore = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._hasLinkSlot = false;
        /**
         * State of the view more button's visibility.
         */
        this.hideAction = false;
        /**
         * The starting height of the component (in collapsed state) in pixels.
         * The default is `260` or ten lines (Polaris line height is 26px).
         * @type {number}
         * @default 260
         */
        this.collapsedHeight = 260;
        /**
         * Property that sets whether component is isExpanded or not.
         */
        this.isExpanded = false;
        /**
         * Locale
         * Can be 'en-US', 'zh-CN', 'ja-JP'
         * This component has built in language strings for the
         * "View more" / "View less" action labels and will be
         * set according to locale unless directly provided in
         * expandActionLabel or collapseActionLabel
         *
         * @type {string}
         * @default "en-US"
         */
        this.locale = 'en-US';
        /**
         * Use a centered full-width button as the view-more/less control instead of the text link.
         * When using the button, the link slot is not displayed.
         *
         * @type {boolean}
         * @memberof ViewMore
         */
        this.useButton = false;
        this.tiChange = createEvent(this, "tiChange", 7);
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    handleLocaleChange(newValue, oldValue) {
        if (!['en-US', 'zh-CN', 'ja-JP'].includes(newValue)) {
            newValue = 'en-US';
        }
        if (newValue !== oldValue) {
            this.expandActionLabel = ViewMore.LANGUAGE_STRINGS[newValue]["expandActionLabel"];
            this.collapseActionLabel = ViewMore.LANGUAGE_STRINGS[newValue]["collapseActionLabel"];
        }
    }
    componentWillLoad() {
        // validate our locale
        if (!['en-US', 'zh-CN', 'ja-JP'].includes(this.locale)) {
            this.locale = 'en-US';
        }
        // set the default labels if not provided by user
        if (!this.expandActionLabel)
            this.expandActionLabel = ViewMore.LANGUAGE_STRINGS[this.locale]["expandActionLabel"];
        if (!this.collapseActionLabel)
            this.collapseActionLabel = ViewMore.LANGUAGE_STRINGS[this.locale]["collapseActionLabel"];
        this._hasLinkSlot = this.hostElement.querySelector('[slot="link"]') != null;
    }
    componentDidLoad() {
        // figure out how tall our content is based on
        // the height of the slotted content
        this._contentHeight = this._slotWrapperEl.offsetHeight;
        this._updateHideAction();
        this._updateViewMoreContent();
    }
    /**
     * Handler for window resize events. Checks for changes to the
     * height of content and updates the view more button display
     * and container size if necessary.
     */
    onResizeWindow() {
        // update only if rendered and height really changed
        if (this._slotWrapperEl && this._contentHeight !== this._slotWrapperEl.offsetHeight) {
            this._contentHeight = this._slotWrapperEl.offsetHeight;
            // update whether or not to show the view more button
            this._updateHideAction();
            // if currently expanded, resize automatically (fake 'auto' height)
            if (this.isExpanded)
                this._updateViewMoreContent();
        }
    }
    /**
     * Handler for tiChange event.
     * Emits `tiMetricsAction` event on toggle of view-more component.
     */
    onTiChange() {
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: 'link click',
            data: { value: this.isExpanded ? 'view all' : 'view less' }
        });
    }
    /**
     * Collapses the component
     */
    async collapse() {
        this.isExpanded = false;
    }
    /**
     * Expands the component.
     */
    async expand() {
        this.isExpanded = true;
    }
    /**
     * Toggles component state.
     * If component is isExpanded, it becomes collapsed.
     * If component is collapsed, it becomes isExpanded.
     */
    async toggle() {
        this.isExpanded = !this.isExpanded;
    }
    /**
     * Handler for the toggle click. Toggles the state, updates the view, and fires an event.
     */
    _toggleClick() {
        this.toggle();
        this._updateWindowPosition();
        this._updateViewMoreContent();
        this.tiChange.emit({
            isExpanded: this.isExpanded
        });
    }
    /**
     * Updates the view more action button on init and resize.
     */
    _updateHideAction() {
        // if the content is not at least 4 lines taller than the collapsed height
        // we don't want to have a "view more" button because it's annoying
        // a line is 26px tall (Polaris)
        const newHideAction = this._contentHeight < this.collapsedHeight + 104;
        if (newHideAction) {
            // keep expanded when the button is hidden
            this.isExpanded = true;
        }
        else if (this.hideAction) {
            // changing from button hidden to not hidden - default to collapsed
            this.isExpanded = false;
        }
        this.hideAction = newHideAction;
    }
    /**
     * Animates the height using js because css cannot animate from height:x to height:auto
     */
    _updateViewMoreContent() {
        if (this.isExpanded) {
            // Need to set height using js because height:auto cannot css animate
            this._contentEl.style.height = this._contentHeight + 'px';
        }
        else {
            this._contentEl.style.height = this.collapsedHeight + 'px';
        }
    }
    _updateWindowPosition() {
        if (!this.isExpanded) { // just collapsed
            // check if the view-more button is going to move off screen
            const collapseAmount = this._contentHeight - this.collapsedHeight;
            if (this._buttonEl.getBoundingClientRect().top < collapseAmount) {
                // scroll the top of the component into view
                const top = window.pageYOffset + this.hostElement.getBoundingClientRect().top;
                window.scrollTo(window.scrollX, top);
            }
        }
    }
    render() {
        return (h(Host, { class: { "ti-view-more-button": this.useButton, "ti-view-more-expanded": this.isExpanded } }, h("div", { class: 'ti-view-more' }, h("div", { ref: (el) => this._contentEl = el, class: "ti-view-more-content" }, h("div", { class: "ti-view-more-slot-wrapper", ref: (el) => this._slotWrapperEl = el }, h("slot", null))), h("div", { class: (this.hideAction && (this.useButton || !this._hasLinkSlot)) ? "ti-view-more-hide" : "ti-view-more-action" }, !this.hideAction && h("span", { class: "ti-view-more-action-label", ref: (el) => this._buttonEl = el, onClick: () => this._toggleClick() }, (this.isExpanded) ? this.collapseActionLabel : this.expandActionLabel, h("ti-svg-icon", { size: "s", appearance: "secondary" }, "chevron-down")), this.hideAction && this._hasLinkSlot && h("span", { class: "ti-view-more-action-label", style: { 'cursor': 'default' } }, "\u00A0"), h("span", { class: this.useButton ? "ti-view-more-hide" : "ti-view-more-action-link" }, h("slot", { name: "link" }))))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "locale": ["handleLocaleChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: block;\n}\n:host .ti-view-more {\n  /**\n  * \@prop  --ti-view-more-width: Default 100%. For adjusting the width of the component.\n  */\n  width: var(--ti-view-more-width, 100%);\n}\n:host .ti-view-more .ti-view-more-content {\n  overflow: hidden;\n  -webkit-transition: height 250ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: height 250ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-view-more .ti-view-more-content .ti-view-more-slot-wrapper {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  margin: -1px 0;\n  padding: 1px 0;\n}\n:host .ti-view-more .ti-view-more-action {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  width: 100%;\n  margin-top: 1px;\n  -webkit-transition: margin-top 250ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: margin-top 250ms cubic-bezier(0.4, 0, 0.2, 1);\n  position: relative;\n}\n:host .ti-view-more .ti-view-more-action:before {\n  content: \" \";\n  height: 32px;\n  width: 100%;\n  background: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, 0)), color-stop(88%, white), to(white));\n  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, white 88%, white 100%);\n  position: absolute;\n  display: block;\n  bottom: 19px;\n  pointer-events: none;\n  -webkit-transition: height 250ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: height 250ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-view-more .ti-view-more-action .ti-view-more-action-label,\n:host .ti-view-more .ti-view-more-action .ti-view-more-action-link {\n  background: #ffffff;\n  color: #007c8c;\n  z-index: 1;\n}\n:host .ti-view-more .ti-view-more-action .ti-view-more-action-label {\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  cursor: pointer;\n}\n:host .ti-view-more .ti-view-more-action .ti-view-more-action-label ti-svg-icon {\n  fill: #007c8c;\n  margin: 0 0.5rem;\n  -webkit-transition: -webkit-transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: -webkit-transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-view-more .ti-view-more-action .ti-view-more-action-link {\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n}\n:host .ti-view-more .ti-view-more-hide {\n  display: none;\n}\n\n:host(.ti-view-more-button) .ti-view-more > .ti-view-more-action:before {\n  bottom: 41px;\n}\n:host(.ti-view-more-button) .ti-view-more > .ti-view-more-action .ti-view-more-action-label {\n  width: 100%;\n  text-align: center;\n  padding: 10px 0;\n  background: #f9f9f9;\n  color: #007c8c;\n  font-size: 14px;\n  border: 1px solid #cccccc;\n  border-radius: 0;\n  display: block;\n  cursor: pointer;\n}\n\n:host(.ti-view-more-expanded) .ti-view-more .ti-view-more-content + .ti-view-more-action:before {\n  background: transparent;\n}\n:host(.ti-view-more-expanded) .ti-view-more .ti-view-more-action {\n  margin-top: 1rem;\n}\n:host(.ti-view-more-expanded) .ti-view-more .ti-view-more-action:before {\n  height: 0;\n}\n:host(.ti-view-more-expanded) .ti-view-more .ti-view-more-action .ti-view-more-action-label > ti-svg-icon {\n  -webkit-transform: rotate(180deg);\n  transform: rotate(180deg);\n}"; }
};
// language strings for component
ViewMore.LANGUAGE_STRINGS = {
    "en-US": {
        "expandActionLabel": "View more",
        "collapseActionLabel": "View less"
    },
    "zh-CN": {
        "expandActionLabel": "显示更多",
        "collapseActionLabel": "部分显示"
    },
    "ja-JP": {
        "expandActionLabel": "詳細を表示",
        "collapseActionLabel": "詳細を非表示"
    }
};

export { ViewMore as ti_view_more };

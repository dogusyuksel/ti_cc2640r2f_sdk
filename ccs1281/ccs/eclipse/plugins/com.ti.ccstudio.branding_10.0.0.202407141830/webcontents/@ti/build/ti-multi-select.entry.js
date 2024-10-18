import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const MultiSelect = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._checkboxes = [];
        this._panelMaxHeight = 289;
        // if they scroll, we close
        this._parentScrollbarListener = {
            handleEvent: () => {
                if (this.isExpanded) {
                    this.isExpanded = false;
                    this._updateDropdownPanel();
                    this._scrollParent.removeEventListener('scroll', this._parentScrollbarListener);
                }
            }
        };
        // close the panel if the user scrolls
        this._windowScrollListener = {
            handleEvent: () => {
                if (this.isExpanded) {
                    this.isExpanded = false;
                    this._updateDropdownPanel();
                    window.removeEventListener('scroll', this._windowScrollListener);
                }
            }
        };
        /**
         * Object that holds filter options and their state (checked/disabled)
         */
        this.items = {};
        /**
         * Panel is expanded state
         */
        this.isExpanded = false;
        /**
         * Placeholder text for the text field. Defaults to ` `.
         */
        this.placeholder = ' ';
        /**
         * Way to set the delimiter.
         * Sometimes you can't use commas to delimit things (especially if the values
         * have commas).
         *
         * @default ","
         */
        this.optionDelimiter = ',';
        /**
         * Multi-select component is disabled
         */
        this.disabled = false;
        this.enabledOptions = '';
        /**
         * Locale.
         *
         * @type {string} Possible values include 'en-US','zh-CN','ja-JP'.
         * @default 'en-US'
         */
        this.locale = 'en-US';
        /**
         * Attribute based way of setting the list of options.
         * Expects a comma delimited list of options.
         */
        this.options = '';
        this.tiMultiSelectChange = createEvent(this, "tiMultiSelectChange", 7);
    }
    disabledHandler(isDisabled) {
        if (isDisabled) {
            this.isExpanded = false;
            this._updateDropdownPanel();
        }
    }
    enabledOptionsHandler(newVal) {
        const newOptions = newVal.split(this.optionDelimiter);
        for (let key in this.items) {
            if (this.items.hasOwnProperty(key)) {
                this.items[key].disabled = newOptions.indexOf(this.items[key].value) === -1;
                if (this.items[key].disabled) {
                    this.items[key].selected = false;
                }
            }
        }
        this._setSelectedNumber();
    }
    /**
     * Disable checkboxes when they should not be selectable
     */
    async setEnabledOptions(options) {
        if (options !== undefined) {
            this.enabledOptions = options;
        }
    }
    onTiMultiSelectChange(event) {
        const el = event.detail.originator;
        // not one of us...
        if (el.options != this.options || el === this) {
            return;
        }
        const values = event.detail.value.split(this.optionDelimiter);
        if (values.length === 0) {
            this._checkboxes.forEach(checkbox => {
                this.items[checkbox.value].selected = false;
            });
            this._setSelectedNumber();
            return;
        }
        this._checkboxes.forEach(checkbox => {
            this.items[checkbox.value].selected = (values.indexOf(checkbox.value) > -1);
        });
        this._setSelectedNumber();
    }
    onClick(event) {
        const path = event.composedPath();
        let closeThisMultiSelect = true;
        for (var i = 0; i < path.length; i++) {
            let thisTag = path[i];
            if (thisTag.tagName === "TI-MULTI-SELECT") {
                if (thisTag.parentElement.getAttribute('filter-column') === this.hostElement.parentElement.getAttribute('filter-column')) {
                    closeThisMultiSelect = false;
                }
                break;
            }
        }
        if (closeThisMultiSelect) {
            this.isExpanded = false;
            this._updateDropdownPanel();
        }
    }
    _clearOptionsHandler(event) {
        this._checkboxes.forEach(checkbox => {
            this.items[checkbox.value].selected = false;
        });
        this._setSelectedNumber();
        const detail = Object.assign(Object.assign({}, event.detail), { value: "", originator: this });
        this.tiMultiSelectChange.emit(detail);
    }
    _getSelectedOptions() {
        const selectedOptions = [];
        for (var key in this.items) {
            if (this.items.hasOwnProperty(key) && this.items[key].selected) {
                selectedOptions.push(key);
            }
        }
        return selectedOptions;
    }
    _selectOptionHandler(event) {
        this._checkboxes.forEach(checkbox => {
            this.items[checkbox.value].selected = checkbox.checked;
        });
        const selectedOptions = this._getSelectedOptions();
        this._setSelectedNumber();
        const detail = Object.assign(Object.assign({}, event.detail), { value: selectedOptions.join(this.optionDelimiter), originator: this });
        this.tiMultiSelectChange.emit(detail);
    }
    _setSelectedNumber() {
        const selectedOptions = this._getSelectedOptions();
        if (selectedOptions.length > 0) {
            this.placeholder = MultiSelect.LANGUAGE_STRINGS[this.locale]["selectedLabel"].replace("{}", selectedOptions.length.toString());
        }
        else {
            this.placeholder = this._originalPlaceholder;
        }
        this.showClearButton = (selectedOptions.length > 0) ? true : false;
    }
    /**
     * Toggle dropdown panel
     */
    _toggleDropdown() {
        if (this.disabled) {
            return;
        }
        this.isExpanded = !this.isExpanded;
        this._updateDropdownPanel();
    }
    /**
     * animate dropdown panel and set scrollbar display
     */
    _updateDropdownPanel() {
        if (this._panelElement) { // Occasionally on IE this is undefined
            if (this.isExpanded) {
                const viewPortHeight = window.innerHeight;
                // if we don't have a panelHeight, which we won't if we're in sticky situation
                // fall back to getting scrollheight again
                this._panelElement.style.height = (this._panelHeight || this._panelElement.scrollHeight) + 'px';
                this._panelHeight = this._panelElement.scrollHeight;
                // if _panelHeight shorter than .ti-select-panel max-height: calc(34px * 8.5)...
                // or if _panelHeight is shorter than viewPortHeight
                // we hide scrollbar
                if ((this._panelHeight <= this._panelMaxHeight && this._panelHeight < viewPortHeight)) {
                    this._panelElement.style.overflowY = 'hidden';
                    // if _panelHeight is taller than max-Height
                    // we keep scrollbar
                }
                else if (this._panelHeight > this._panelMaxHeight) {
                    this._panelElement.style.overflowY = 'scroll';
                }
                if (!this._scrollParent) {
                    // get a handle of our parent table (if there is one)
                    const parentTable = this.hostElement.closest(`table`);
                    if (parentTable && parentTable.parentElement) {
                        this._scrollParent = parentTable.parentElement;
                    }
                }
                this._panelElement.style.maxWidth = this._panelElement.scrollWidth + 'px';
                this._panelElement.style.minWidth = this._panelElement.scrollWidth + 'px';
                this._panelElement.style.position = 'fixed';
                // set our position
                this._panelElement.style.left = (this.hostElement.offsetLeft - this._scrollParent.scrollLeft) + 'px';
                // cases
                // non sticky   : use selectBox bottom for position  (default)
                // sticky       : use window bottom or scroll parent bottom for position
                // default our panelY position based on the bottom of the selectBox
                const selectBoundingRect = this._selectBoxElement.getBoundingClientRect();
                let panelY = selectBoundingRect.top + selectBoundingRect.height;
                // TODO: figure out less hacky way to figure out if we're sticky
                // if we're NOT sticky
                if (this._scrollParent && this._scrollParent.classList.contains("ti-table-controller-scroll-container")) {
                    const scrollParentRect = this._scrollParent.getBoundingClientRect();
                    // we want to compare against the window bottom or the scrollParent bottom,
                    // whichever is closer
                    const windowBottom = Math.min(viewPortHeight, scrollParentRect.bottom);
                    // if panel would protrude through bottom of scrollparent or bottom of window
                    // leave 20 px for the horizontal scroll bar...
                    if (panelY + this._panelHeight > windowBottom) {
                        panelY = windowBottom - this._panelHeight - 20;
                    }
                    // add a listener so we can close up if they scroll
                    this._scrollParent.addEventListener('scroll', this._parentScrollbarListener);
                }
                // if viewport height smaller than panel height
                // should happen to both sticky and non sticky
                // the -10 is to account for sticky scrollbar
                if ((viewPortHeight - 10) < parseInt(this._panelElement.style.height)) {
                    // make sure scroll bar is there
                    // place panel on the top
                    // adjust height of panel
                    this._panelElement.style.overflowY = 'scroll';
                    panelY = 0;
                    this._panelElement.style.height = (viewPortHeight - 30) + 'px';
                }
                this._panelElement.style.top = panelY + 'px';
                // add a listener that will close our panel if user scrolls
                window.addEventListener('scroll', this._windowScrollListener);
            }
            else {
                this._panelElement.style.height = 0 + 'px';
            }
        }
    }
    componentWillLoad() {
        if (this.options && Object.keys(this.items).length === 0) {
            const items = this.options.split(this.optionDelimiter);
            for (let i = 0; i < items.length; i++) {
                const option = items[i].trim();
                this.items[option] = {
                    'label': option,
                    'value': option,
                    'disabled': false,
                    'selected': false
                };
            }
        }
        this._originalPlaceholder = MultiSelect.LANGUAGE_STRINGS[this.locale]["defaultLabel"];
        this.placeholder = this._originalPlaceholder;
    }
    componentDidLoad() {
        const checkboxes = this.hostElement.shadowRoot.querySelectorAll('ti-checkbox');
        for (let i = 0; i < checkboxes.length; i++) {
            this._checkboxes.push(checkboxes[i]);
        }
        this._panelHeight = this._panelElement.scrollHeight;
        this._updateDropdownPanel();
    }
    render() {
        return (h(Host, null, h("div", { class: "ti-multi-select-box", ref: (el) => this._selectBoxElement = el, onClick: () => this._toggleDropdown() }, h("span", { class: "ti-multi-select-selected" }, this.placeholder)), this.showClearButton &&
            h("span", { class: "ti-multi-select-clear", onClick: (e) => this._clearOptionsHandler(e) }, h("ti-svg-icon", { size: "s", "icon-set": "actions" }, "close")), h("div", { class: "ti-multi-select-panel", ref: (el) => this._panelElement = el }, h("div", { class: "ti-multi-select-panel-content" }, h("div", { class: "ti-multi-select-panel-row" }, h("div", { class: "ti-multi-select-panel-column" }, h("ul", { class: "ti-multi-select-option-list" }, Object.keys(this.items).length > 0 &&
            Object.keys(this.items).map(key => h("li", { class: "ti-multi-select-option" }, h("ti-checkbox", { value: this.items[key].value, onClick: (e) => this._selectOptionHandler(e), disabled: this.items[key].disabled, checked: this.items[key].selected }, this.items[key].label))))))))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "disabled": ["disabledHandler"],
        "enabledOptions": ["enabledOptionsHandler"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: block;\n  position: relative;\n  min-width: 120px;\n}\n:host .ti-multi-select-input {\n  visibility: hidden;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n:host .ti-multi-select-box {\n  position: relative;\n  z-index: 1;\n  cursor: pointer;\n  border: 1px solid #cccccc;\n  height: 30px;\n  line-height: 30px;\n  padding: 0 0.5rem;\n  padding-right: calc(0.5rem + 24px);\n  background-image: url(\"https://www.ti.com/assets/icons/ti_icons-objects/chevron-down.svg\");\n  background-position: right 6px top 7px;\n  background-size: 18px;\n  background-repeat: no-repeat;\n  background-color: #ffffff;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  color: #555555;\n}\n:host .ti-multi-select-box.has-placeholder {\n  font-style: italic;\n}\n:host .ti-multi-select-clear {\n  position: absolute;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  height: 30px;\n  line-height: 30px;\n  width: 30px;\n  background-color: #ffffff;\n  border: 1px solid #cccccc;\n  border-left-width: 0;\n  cursor: pointer;\n}\n:host .ti-multi-select-clear:hover {\n  background-color: #e8e8e8;\n}\n:host .ti-multi-select-panel {\n  width: -webkit-max-content;\n  width: -moz-max-content;\n  width: max-content;\n  min-width: 100%;\n  max-height: calc(34px * 8.5);\n  overflow-x: hidden;\n  position: absolute;\n  left: 0;\n  z-index: 5;\n  padding: 0;\n  background-color: #ffffff;\n  -webkit-box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.09), 0 3px 4px 0 rgba(0, 0, 0, 0.11), 0 3px 3px -2px rgba(0, 0, 0, 0.09);\n  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.09), 0 3px 4px 0 rgba(0, 0, 0, 0.11), 0 3px 3px -2px rgba(0, 0, 0, 0.09);\n  -webkit-transition: height 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n  transition: height 0.225s cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-multi-select-panel.ti-multi-select-panel-direction-up {\n  bottom: 30px;\n}\n:host .ti-multi-select-panel.ti-multi-select-panel-direction-left {\n  left: initial;\n  right: 0;\n}\n:host .ti-multi-select-panel-row {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: row;\n  flex-direction: row;\n}\n:host .ti-multi-select-panel-column {\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n}\n:host .ti-multi-select-option-list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n:host .ti-multi-select-option {\n  position: relative;\n  margin-bottom: 0;\n  padding: 0;\n  line-height: 18px;\n  white-space: nowrap;\n  color: #555555;\n}\n:host .ti-multi-select-option:hover {\n  cursor: pointer;\n  background-color: #e8e8e8;\n}\n:host .ti-multi-select-option.select-all {\n  border-bottom: 1px dotted #cccccc;\n  padding-bottom: calc(0.5rem - 1px);\n}\n:host .ti-multi-select-option.is-disabled span {\n  opacity: 0.5;\n}\n:host .ti-multi-select-option.is-disabled:hover {\n  cursor: default;\n  background-color: inherit;\n}\n:host .ti-multi-select-option-filter {\n  padding: 0.5rem;\n}\n:host ti-checkbox {\n  width: calc(100% - 2rem);\n  padding: 0.5rem;\n  padding-right: 1.5rem;\n}\n\@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {\n  :host ti-checkbox {\n    width: 100%;\n    padding-right: 1rem;\n  }\n}\n\n:host([disabled]) .ti-multi-select-box,\n:host([disabled]) .ti-multi-select-clear {\n  background-color: #e8e8e8;\n  cursor: not-allowed;\n}"; }
};
/**
 * language strings for component
 */
MultiSelect.LANGUAGE_STRINGS = {
    "en-US": {
        "defaultLabel": "Select",
        "selectedLabel": "{} selected"
    },
    "zh-CN": {
        "defaultLabel": "选择",
        "selectedLabel": "已选择 {} 项"
    },
    "ja-JP": {
        "defaultLabel": "選択",
        "selectedLabel": "{} つを選択済み"
    }
};

export { MultiSelect as ti_multi_select };

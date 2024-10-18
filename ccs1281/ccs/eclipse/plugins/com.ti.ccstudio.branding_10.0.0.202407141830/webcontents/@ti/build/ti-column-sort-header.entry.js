import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const ColumnSortHeader = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Disable sorting. This will hide the sort icon and disable click and spacebar handling,
         * and also remove the component from keyboard navigation.
         */
        this.disabled = false;
        /**
         * Optional property to set the direction of the sort when it is first invoked.
         * Only used when the initial value for `sort-direction` is `none` (default).
         * The default first sort direction is `down`.
         *
         * @type {string}
         * @memberof ColumnSortHeader
         */
        this.firstSortDirection = ColumnSortHeader.SORT_DIRECTION.down;
        /**
         * Highlight part of the icon to indicate an active sort direction.
         * Can be `none`, `down` or `up`.
         *
         * @type {string}
         * @memberof ColumnSortHeader
         */
        this.sortDirection = ColumnSortHeader.SORT_DIRECTION.none;
        this.tiColumnSortChange = createEvent(this, "tiColumnSortChange", 7);
    }
    /**
     * When the component is clicked, toggle the sort direction and fire an event.
     */
    onClick() {
        if (!this.disabled) {
            this.toggleSortDirection().then(() => {
                this.tiColumnSortChange.emit({
                    sortColumn: this.sortColumn,
                    sortDirection: this.sortDirection,
                    sortType: this.sortType
                });
            });
        }
    }
    ;
    /**
     * When the spacebar is pressed, toggle the sort direction and fire an event.
     *
     * @param event KeyboardEvent
     */
    onKeydown(event) {
        if (!this.disabled && event.keyCode === 32) { // spacebar
            event.preventDefault();
            this.toggleSortDirection().then(() => {
                this.tiColumnSortChange.emit({
                    sortColumn: this.sortColumn,
                    sortDirection: this.sortDirection
                });
            });
        }
    }
    /**
     * Reverse the sort direction. If no direction is currently set (`none`), this will
     * set the direction to the value of `first-sort-direction` which by default is `down`.
     */
    async toggleSortDirection() {
        if (this.sortDirection === ColumnSortHeader.SORT_DIRECTION.up) {
            this.sortDirection = ColumnSortHeader.SORT_DIRECTION.down;
        }
        else if (this.sortDirection === ColumnSortHeader.SORT_DIRECTION.down
            || this.firstSortDirection === ColumnSortHeader.SORT_DIRECTION.up) {
            this.sortDirection = ColumnSortHeader.SORT_DIRECTION.up;
        }
        else {
            this.sortDirection = ColumnSortHeader.SORT_DIRECTION.down;
        }
    }
    /**
     * Set the sort direction indication to `down`.
     */
    async setSortDirectionDown() {
        this.sortDirection = ColumnSortHeader.SORT_DIRECTION.down;
    }
    /**
     * Set the sort direction indication to `none`.
     */
    async setSortDirectionNone() {
        this.sortDirection = ColumnSortHeader.SORT_DIRECTION.none;
    }
    /**
     * Set the sort direction indication to `up`.
     */
    async setSortDirectionUp() {
        this.sortDirection = ColumnSortHeader.SORT_DIRECTION.up;
    }
    _getIconSvg() {
        if (this.sortDirection === ColumnSortHeader.SORT_DIRECTION.down) {
            return (h("svg", { viewBox: "0 0 192 192", width: "18", height: "18" }, h("path", { d: "M96 160l64-64-11.36-11.36L104 129.36V32H88v97.36L43.28 84.72 32 96z" })));
        }
        else if (this.sortDirection === ColumnSortHeader.SORT_DIRECTION.up) {
            return (h("svg", { viewBox: "0 0 192 192", width: "18", height: "18" }, h("path", { d: "M32 96l11.28 11.28L88 62.64V160h16V62.64l44.64 44.72L160 96 96 32z" })));
        }
        else {
            return (h("svg", { viewBox: "0 0 192 192", width: "18", height: "18" }, h("path", { d: "M144.905 160.134V62.797l28.279 28.279 11.383-11.384-47.669-47.668L89.2 79.721l11.384 11.384 28.308-28.308v97.337h16.013zM63.137 32.024v97.337l28.279-28.279 11.384 11.384-47.669 47.668-47.698-47.697 11.383-11.383 28.308 28.307V32.024h16.013z" })));
        }
    }
    render() {
        return (h(Host, { tabindex: !this.disabled && '0', class: this.sortDirection !== ColumnSortHeader.SORT_DIRECTION.none && 'ti-column-sort-header-active' }, h("div", { class: "ti-column-sort-header-container", id: "sort_col_" + this.sortColumn }, this.hostElement.textContent.trim().length > 0
            ?
                h("div", { class: "ti-column-sort-header-label" }, h("slot", null))
            :
                h("slot", null), !this.disabled && this._getIconSvg())));
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: inline-block;\n  cursor: pointer;\n}\n:host .ti-column-sort-header-container {\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n}\n:host .ti-column-sort-header-container .ti-column-sort-header-label + svg {\n  margin-left: 6px;\n}\n:host .ti-column-sort-header-container svg {\n  min-width: 18px;\n  min-height: 18px;\n  text-align: center;\n  vertical-align: middle;\n  padding-bottom: 2px;\n  fill: #999999;\n  -webkit-box-sizing: content-box;\n  box-sizing: content-box;\n}\n\n:host(.ti-column-sort-header-active) .ti-column-sort-header-container > svg {\n  fill: #555555;\n}"; }
};
ColumnSortHeader.SORT_DIRECTION = {
    down: 'down',
    none: 'none',
    up: 'up'
};

export { ColumnSortHeader as ti_column_sort_header };

import { r as registerInstance, d as createEvent, h, c as getElement } from './core-800e68f4.js';

const TabGroup = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._allTabTitle = null;
        this._hashDelimiter = '##';
        this._tabs = [];
        this._tabTitleList = [];
        this._tabTitleListContent = [];
        /**
         * Display an "All" tab that shows the content of every tab.
         *
         * @type {boolean}
         * @memberof TabGroup
         * @default false
         */
        this.allTab = false;
        /**
         * Id of section in which tab is located
         * Needed only when using tab bookmarking and the all tab is enabled
         *
         * @type {string}
         * @memberof TabGroup
         */
        this.hashId = "";
        /**
         * Set the language for the "All" label.
         *
         * @type {string}
         * @memberof TabGroup
         */
        this.locale = 'en-us';
        /**
         * Set which tab is shown. By default, the first tab is shown.
         *
         * @type {number}
         * @memberof TabGroup
         */
        this.selectedIndex = -1;
        this.tiTabSelectionChange = createEvent(this, "tiTabSelectionChange", 7);
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    handleLocaleChange(newValue) {
        if (['en-us', 'zh-cn', 'ja-jp'].indexOf(newValue) === -1) {
            newValue = 'en-us';
        }
        this.locale = newValue;
    }
    componentWillLoad() {
        if (['en-us', 'zh-cn', 'ja-jp'].indexOf(this.locale) === -1) {
            this.locale = 'en-us';
        }
        this._tabTitleListContent = [];
        this._tabs = Array.from(this.hostElement.getElementsByTagName('ti-tab'), (tab) => {
            const slotEl = tab.querySelector('[slot="title"]');
            this._tabTitleListContent.push({
                title: slotEl.outerHTML,
                id: tab.id
            });
            tab.hideTab(true);
            return tab;
        });
        this._checkHash();
    }
    componentDidLoad() {
        this._checkSelectedTab();
    }
    _checkHash() {
        const hash = window.location.hash;
        // check if delimiter is found in hash
        // if delimiter is found, extract value
        let delimiterFoundIndex = hash.indexOf(this._hashDelimiter);
        if (delimiterFoundIndex === -1) {
            return;
        }
        let tabHashVal = hash.substr(delimiterFoundIndex + this._hashDelimiter.length);
        if (tabHashVal === undefined || tabHashVal === "") {
            return;
        }
        // if value equals all, make sure option is available
        if (tabHashVal === "all" && this.allTab) {
            this.selectedIndex = -1;
            return;
        }
        // check if value matches any tab in this tag group
        // if there's a match, set that tab as active
        this._tabs.forEach((tab, i) => {
            if (tabHashVal === tab.getAttribute('tab-hash-id')) {
                this.selectedIndex = i;
                this._checkSelectedTab();
                return;
            }
        });
    }
    _checkSelectedTab() {
        if (this.allTab && this.selectedIndex === -1) {
            this._showAllTabs();
        }
        else {
            this.selectedIndex = this.selectedIndex === -1 ? 0 : this.selectedIndex;
            this._tabTitleList[this.selectedIndex].classList.add('ti-tab-group-is-active');
            this._tabs[this.selectedIndex].hideTab(false);
        }
    }
    _fireAllTabMetrics() {
        this.tiTabSelectionChange.emit(TabGroup.LANGUAGE_STRINGS[this.locale]._allTitle);
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: "tab click",
            data: {
                context: TabGroup.LANGUAGE_STRINGS['en-us'].allTitle
            }
        });
    }
    _renderAllTab() {
        if (this.allTab) {
            return (h("li", { class: "ti-tab-group-list-item", ref: el => this._allTabTitle = el }, h("div", { class: "ti-tab-group-title", onClick: () => { this._showAllTabs(), this._fireAllTabMetrics(); } }, this.hashId
                ? h("a", { href: '#' + this.hashId + '##all' }, " ", TabGroup.LANGUAGE_STRINGS[this.locale].allTitle, " ")
                : h("span", null, " ", TabGroup.LANGUAGE_STRINGS[this.locale].allTitle, " "))));
        }
        return null;
    }
    _renderNavItem(tabTitle) {
        const liElement = (h("li", { class: "ti-tab-group-list-item", id: `${tabTitle.id}-tab-item`, ref: el => this._tabTitleList.push(el) }, h("div", { class: "ti-tab-group-title", onClick: (e) => this._showTabContent(e, tabTitle.id), innerHTML: tabTitle['title'] })));
        return liElement;
    }
    _showAllTabs() {
        if (this.allTab) {
            this._allTabTitle.classList.add('ti-tab-group-is-active');
            this._tabTitleList.forEach(tabTitle => {
                tabTitle.classList.remove('ti-tab-group-is-active');
            });
            this._tabs.forEach((tab, count) => {
                tab.hideTab(false);
                tab.showHeader(true, this._tabTitleListContent[count].title);
                const dataLid = tab.getAttribute('data-lid');
                if (dataLid !== null) {
                    tab.setAttribute('data-lid', dataLid + '_all');
                }
            });
        }
    }
    _showTabContent(event, id) {
        event.preventDefault();
        if (this.hashId !== "") {
            const tabHashIndex = event.target.href.indexOf('##');
            if (tabHashIndex > -1) {
                history.replaceState(null, null, '#' + this.hashId + event.target.href.substr(tabHashIndex));
            }
        }
        if (this.allTab) {
            this._allTabTitle.classList.remove('ti-tab-group-is-active');
        }
        this._tabTitleList.forEach(tabTitle => {
            if (tabTitle.id === `${id}-tab-item`) {
                tabTitle.classList.add('ti-tab-group-is-active');
            }
            else {
                tabTitle.classList.remove('ti-tab-group-is-active');
            }
        });
        this._tabs.forEach(tab => {
            tab.showHeader(false);
            const dataLid = tab.getAttribute('data-lid');
            if (dataLid !== null && dataLid.endsWith('_all')) {
                tab.setAttribute('data-lid', dataLid.replace('_all', ''));
            }
            if (tab.id === id) {
                tab.hideTab(false);
                this.tiTabSelectionChange.emit(tab.tabName);
                this.tiMetricsAction.emit({
                    elementName: this.hostElement.tagName,
                    eventName: "tab click",
                    data: {
                        context: tab.tabName
                    }
                });
            }
            else {
                tab.hideTab(true);
            }
        });
    }
    render() {
        this._tabTitleList = [];
        return (h("div", { class: "ti-tab-group-container" }, h("div", { class: "ti-tab-group-header" }, h("ul", { class: "ti-tab-group-list" }, this._renderAllTab(), this._tabTitleListContent.map(tabTitle => this._renderNavItem(tabTitle))), h("slot", { name: "option" })), h("div", null, h("slot", null))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "locale": ["handleLocaleChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host .ti-tab-group-container {\n  width: 100%;\n  height: 100%;\n}\n:host .ti-tab-group-container .ti-tab-group-header {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  font-size: 16px;\n  line-height: 20.3px;\n  border-bottom: 1px solid #cccccc;\n  margin-bottom: 1.5rem;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list {\n  display: -ms-flexbox;\n  display: flex;\n  margin: 0;\n  padding: 0;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  -ms-flex-align: center;\n  align-items: center;\n  margin: 0 12px;\n  padding: 0;\n  background: 0;\n  line-height: 40px;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  cursor: pointer;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item:first-child {\n  margin-left: 0;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title {\n  color: #333333;\n  height: 100%;\n  position: relative;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title h1, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title h2, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title h3, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title h4, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title h5, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title h6 {\n  margin: 0;\n  font-weight: 400;\n  font-size: 16px;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title::after {\n  display: block;\n  width: 100%;\n  height: 2px;\n  content: \"\";\n  position: absolute;\n  bottom: 0;\n  background-color: transparent;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title:hover::after {\n  background-color: #333333;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item .ti-tab-group-title a {\n  color: #333333;\n  text-decoration: none;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item.ti-tab-group-is-active .ti-tab-group-title, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item.ti-tab-group-is-active .ti-tab-group-title a {\n  color: #cc0000;\n}\n:host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item.ti-tab-group-is-active .ti-tab-group-title::after, :host .ti-tab-group-container .ti-tab-group-header .ti-tab-group-list .ti-tab-group-list-item.ti-tab-group-is-active .ti-tab-group-title a::after {\n  background-color: #cc0000;\n}"; }
};
TabGroup.LANGUAGE_STRINGS = {
    'en-us': {
        allTitle: 'All'
    },
    'zh-cn': {
        allTitle: '全部'
    },
    'ja-jp': {
        allTitle: 'すべて'
    }
};

export { TabGroup as ti_tab_group };

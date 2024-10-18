import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const ChapterNav = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._chapterNavItems = new Set();
        this._tabDelimiter = "##";
        /**
         * This flag is to differentiate manual scroll and window.scrollTo initiated by click on chapter-nav
         *
         * @type {boolean}
         * @default false
         */
        this._isAutoScrolling = false;
        /**
         * Value passed to window.scrollTo
         *
         * @type {number}
         * @default 0
         */
        this._scrollToPosition = 0;
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    componentWillLoad() {
        this._chapterNav = this.hostElement.closest('ti-chapter-nav');
        this._hasStickyContentSlotted = !!this.hostElement.querySelector('[slot="sticky-content"]');
        this._hasTopAnchorSlotted = !!this.hostElement.querySelector('[slot="top-anchor"]');
    }
    componentDidLoad() {
        setTimeout(() => {
            // set the anchor element positions - same code in window onLoad method as well, for IE bug fix
            // code in both places will make sure to scroll to correct position if there is a hash
            this._setAnchorTops();
        }, 50);
    }
    /**
     * Even though the browser takes care of hash scrolling,
     * it doesn't position things the same way that we do here,
     * so we need to update the position after the hash change.
     */
    onHashchange() {
        const hash = window.location.hash;
        // changing tabs can modify hash but should not scroll window
        if (hash.indexOf(this._tabDelimiter) > -1) {
            return;
        }
        setTimeout(() => {
            this._navigateToHash(hash);
        }, 50);
    }
    /**
     * Once the page has finished loading, set the anchor positions
     * and navigate if there is a hash. We do this here instead of
     * in `componentDidLoad` so that other parts of the page aren't
     * still loading/hydrating which will affect positioning.
     */
    onLoad() {
        setTimeout(() => {
            this.isSticky = !this._isElementInBounds(this._chapterNav, 0, null);
            // set the anchor element positions - same code in componentDidLoad as well, for IE bug fix
            // code in both places will make sure to scroll to correct position if there is a hash
            this._setAnchorTops();
        }, 50);
    }
    onScroll() {
        // This is a required check as the listener attaches before the componentWillLoad fires
        // We don't need to worry about the initialization as that is taken care of in componentDidLoad
        if (this._chapterNav) {
            const prevHighlightedEl = this.isSticky ? this._highlightedChapterElement : undefined;
            this._setSticky(!this._isElementInBounds(this._chapterNav, 0, null));
            this._updateChapterNavItemStatus();
            const offsetDifference = window.pageYOffset - this._scrollToPosition;
            if (this._isAutoScrolling && (offsetDifference <= 1 && offsetDifference >= -1)) {
                this._isAutoScrolling = false; //sets autoscrolling flag to false once it arrives at target
            }
            else if (!this._isAutoScrolling && this.isSticky && this._highlightedChapterElement !== undefined && this._highlightedChapterElement !== prevHighlightedEl) {
                this.tiMetricsAction.emit({
                    elementName: this.hostElement.tagName,
                    eventName: "scroll",
                    data: {
                        context: (this.isSticky ? "sticky_nav" : "fixed_nav") + " " + this._activeAnchor.getAttribute('anchor-name')
                    }
                });
            }
        }
    }
    /**
     * Listens for custom event to respond to outside scroll control via hash.
     *
     * @param event
     */
    onTiChapterNavControl(event) {
        this._navigateToHash(event.detail.hash);
    }
    /**
     * Find the `ti-chapter-nav-anchor` element that matches the hash id.
     *
     * @param hash A location hash including the hash separator.
     */
    _findHashAnchor(hash) {
        if (!hash || hash.length < 2) {
            return null;
        }
        return this.chapterNavAnchors.find(anchor => anchor.id === hash.substring(1));
    }
    /**
     * Check if element is in bounds. Currently only concerned with top and bottom
     *
     * @param el Element to be checked
     * @param top Optional top position that element must be below
     * @param bottom Optional bottom position that element must be above
     */
    _isElementInBounds(el, top, bottom) {
        const element = el.getBoundingClientRect();
        if ((top === null || element.top >= top) &&
            (bottom === null || (element.bottom <= bottom &&
                element.bottom <= (window.innerHeight || document.documentElement.clientHeight))) //need to account for stickychapternav height + spacing
        ) {
            return true;
        }
        else {
            return false;
        }
    }
    _navigateToAnchor(chapterNavAnchor) {
        // Don't use scrollIntoView because it is blocked by the DOM manipulation of the sticky table header setting top in midscroll
        const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style; //Check for IE11 support
        this._isAutoScrolling = true; // before click initiated scroll event starts
        this._scrollToPosition = chapterNavAnchor.getBoundingClientRect().top + pageYOffset;
        if (supportsNativeSmoothScroll) {
            window.scrollTo({ top: this._scrollToPosition, behavior: 'smooth' });
        }
        else {
            window.scrollTo(0, this._scrollToPosition);
        }
        history.pushState(null, null, `#${chapterNavAnchor.id}`);
    }
    /**
     * Navigate to the `ti-chapter-nav-anchor` element matching the hash id.
     *
     * @param hash Location hash including hash separator
     */
    _navigateToHash(hash) {
        const anchor = this._findHashAnchor(hash);
        if (anchor) {
            this._navigateToAnchor(anchor);
        }
    }
    _navigateToTop() {
        this._scrollToPosition = 0;
        this._isAutoScrolling = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, null, `#top`);
    }
    /**
     * Render chapter nav links based on chapterNavAnchors on page
     * Will apply sticky or fixed id for metrics
     */
    _renderChapterNavListItems(isSticky) {
        //Only add the Chapter Nav LI from the sticky element to the set
        //since only the sticky chapter nav changes color indicating active chapter
        //and not when its fixed
        if (this.chapterNavAnchors) {
            return this.chapterNavAnchors.map(anchor => (anchor.isChapterNavEligible === undefined || anchor.isChapterNavEligible) &&
                h("li", { id: anchor.id + '-nav-item', ref: el => isSticky ? this._chapterNavItems.add(el) : '' }, h("a", { onClick: (ev) => { this._navigateToAnchor(anchor); ev.preventDefault(); }, id: (isSticky ? "sticky-nav-" : "fixed-nav-") + anchor.id, href: '#' + anchor.id }, anchor.anchorName)));
        }
    }
    _setAnchorTops() {
        // only do this once after the page has loaded
        if (!this.chapterNavAnchors && document.readyState === 'complete' && this._chapterNavSticky) {
            const chapterNavStickyHeight = this._chapterNavSticky.getBoundingClientRect().height + 8;
            this.chapterNavAnchors = Array.from(document.getElementsByTagName('ti-chapter-nav-anchor'), anchor => {
                anchor.style.top = anchor.style.top || -1 * chapterNavStickyHeight + 'px';
                return anchor;
            });
            // if hash has tab id, remove and go to section
            let hash = window.location.hash;
            const delimiTerIndex = hash.indexOf(this._tabDelimiter);
            if (delimiTerIndex > -1) {
                hash = hash.substr(0, delimiTerIndex);
            }
            this._navigateToHash(hash);
        }
    }
    /**
     * Sets sticky state and applies animation
     *
     * @param sticky Sticky value
     */
    _setSticky(sticky) {
        //Prevents from firing multiple times
        if (!this._chapterNavSticky)
            return;
        if (this.isSticky === sticky) {
            return;
        }
        if (sticky) {
            this.isSticky = true;
            this._chapterNavSticky.classList.remove('ti-chapter-nav-animate-out');
        }
        else {
            this._chapterNavSticky.classList.add('ti-chapter-nav-animate-out');
            //Wait till after animation is done to apply
            setTimeout(() => {
                this.isSticky = sticky;
            }, 200);
        }
    }
    _updateChapterNavItemStatus() {
        let activeChapterNavAnchor;
        // If scroll position is at the bottom of the screen, last chapter nav is active
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            this._updateHighlightedChapterElement(Array.from(this._chapterNavItems).pop()); //Last ChapterNav will be active
        }
        else {
            if (this.chapterNavAnchors) {
                this.chapterNavAnchors.forEach(anchor => {
                    const anchorAtTopOfPage = this._isElementInBounds(anchor, null, 225);
                    if (anchorAtTopOfPage) {
                        activeChapterNavAnchor = anchor; //activeChapter is last chapternav inbounds
                    }
                });
            }
            //No chapter navs are in bound ie. scroll is above fixed chapter nav
            if (!activeChapterNavAnchor) {
                this._activeAnchor = undefined;
                this._updateHighlightedChapterElement(undefined);
            }
            else {
                this._chapterNavItems.forEach(item => {
                    if (item.id == activeChapterNavAnchor.id + '-nav-item') {
                        if (this._highlightedChapterElement != item) {
                            this._activeAnchor = activeChapterNavAnchor;
                            this._updateHighlightedChapterElement(item);
                        }
                    }
                });
            }
        }
    }
    /**
     * Updates active chapter nav based on current updatedHighlightedChapterElement
     */
    _updateHighlightedChapterElement(element) {
        this._highlightedChapterElement = element;
        this._chapterNavItems.forEach(anchor => {
            if (anchor == this._highlightedChapterElement) {
                anchor.classList.add('ti-chapter-nav-active');
            }
            else {
                anchor.classList.remove('ti-chapter-nav-active');
            }
        });
    }
    /**
    * Need persistent nav to maintain space and more performant not requiring
    * the browser to rerender the page when sticky is activated because
    * of page redrawing when sticky nav is position: fixed removing itself
    * from its container
    */
    render() {
        return (h(Host, { "data-lid": this.isSticky ? "sticky_nav" : "fixed_nav" }, h("nav", { class: "ti-chapter-nav-fixed-nav" }, h("ul", { class: { "ti-chapter-nav-center": this.center } }, this._renderChapterNavListItems(false))), h("div", { ref: el => this._chapterNavSticky = el, class: {
                "ti-chapter-nav-sticky": this.isSticky,
                "ti-chapter-nav-sticky-container": true,
                "ti-chapter-nav-compact": this._hasStickyContentSlotted
            } }, h("slot", { name: "sticky-content" }), h("nav", null, h("ul", { class: { "ti-chapter-nav-center": this.center } }, this._hasTopAnchorSlotted &&
            h("li", { class: "ti-chapter-nav-top-anchorlink" }, h("a", { onClick: (ev) => { this._navigateToTop(); ev.preventDefault(); }, id: "sticky-nav-top", "data-navtitle": "top", href: "#top", style: !this.chapterNavAnchors && { opacity: "0", pointerEvents: "none" } }, h("slot", { name: "top-anchor" }))), this._renderChapterNavListItems(true))))));
    }
    get hostElement() { return getElement(this); }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: block;\n}\n:host nav {\n  display: block;\n  background: #f9f9f9;\n  border-top: 1px solid #e8e8e8;\n  border-bottom: 1px solid #e8e8e8;\n}\n:host .ti-chapter-nav-fixed-nav {\n  height: 64px;\n}\n:host a {\n  text-decoration: none;\n  color: #333333;\n  outline: 0;\n  max-width: 250px;\n  padding: 1.5rem 0;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  line-height: 1em;\n  cursor: pointer;\n  font-size: 16px;\n}\n:host a:hover {\n  text-decoration: underline;\n}\n:host ul {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 0;\n  padding-left: 3.5rem;\n}\n:host ul.ti-chapter-nav-center {\n  max-width: 1240px;\n  margin: auto !important;\n}\n:host ul li {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -webkit-box-flex: 0;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  margin: 0;\n  padding: 0;\n  background: 0;\n}\n:host ul li.ti-chapter-nav-active a {\n  color: #cc0000 !important;\n}\n:host ul li:not(:last-child)::after {\n  position: relative !important;\n  display: inline-block !important;\n  margin: 0 1rem !important;\n  content: \"|\" !important;\n  color: #cccccc !important;\n}\n:host .ti-chapter-nav-sticky-container {\n  opacity: 0;\n  pointer-events: none;\n  position: fixed;\n  z-index: 200;\n  top: 0;\n  left: 0;\n  height: auto;\n  width: 100%;\n  -webkit-box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.08), 0 5px 22px 4px rgba(0, 0, 0, 0.06);\n  box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.08), 0 5px 22px 4px rgba(0, 0, 0, 0.06);\n}\n:host .ti-chapter-nav-sticky {\n  -webkit-animation: slideDown 250ms cubic-bezier(0, 0, 0.2, 1), fadeIn 200ms;\n  animation: slideDown 250ms cubic-bezier(0, 0, 0.2, 1), fadeIn 200ms;\n  -webkit-animation-fill-mode: forwards;\n  animation-fill-mode: forwards;\n}\n:host .ti-chapter-nav-sticky.ti-chapter-nav-sticky-container {\n  pointer-events: initial;\n}\n:host .ti-chapter-nav-sticky.ti-chapter-nav-compact a {\n  padding: 1rem 0;\n}\n\n.ti-chapter-nav-animate-out {\n  -webkit-animation: slideUp 200ms cubic-bezier(0.4, 0, 1, 1), fadeOut 200ms;\n  animation: slideUp 200ms cubic-bezier(0.4, 0, 1, 1), fadeOut 200ms;\n  -webkit-animation-fill-mode: forwards;\n  animation-fill-mode: forwards;\n}\n\n\@-webkit-keyframes slideDown {\n  0% {\n    -webkit-transform: translateY(-15px);\n    transform: translateY(-15px);\n  }\n  100% {\n    -webkit-transform: translateY(0px);\n    transform: translateY(0px);\n  }\n}\n\n\@keyframes slideDown {\n  0% {\n    -webkit-transform: translateY(-15px);\n    transform: translateY(-15px);\n  }\n  100% {\n    -webkit-transform: translateY(0px);\n    transform: translateY(0px);\n  }\n}\n\@-webkit-keyframes slideUp {\n  0% {\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n  100% {\n    -webkit-transform: translateY(-24px);\n    transform: translateY(-24px);\n  }\n}\n\@keyframes slideUp {\n  0% {\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n  100% {\n    -webkit-transform: translateY(-24px);\n    transform: translateY(-24px);\n  }\n}\n\@-webkit-keyframes fadeIn {\n  0% {\n    display: none;\n    opacity: 0;\n  }\n  1% {\n    display: block;\n    opacity: 0;\n  }\n  100% {\n    display: block;\n    opacity: 1;\n  }\n}\n\@keyframes fadeIn {\n  0% {\n    display: none;\n    opacity: 0;\n  }\n  1% {\n    display: block;\n    opacity: 0;\n  }\n  100% {\n    display: block;\n    opacity: 1;\n  }\n}\n\@-webkit-keyframes fadeOut {\n  0% {\n    display: block;\n    opacity: 1;\n  }\n  99% {\n    display: block;\n    opacity: 0;\n  }\n  100% {\n    display: none;\n    opacity: 0;\n  }\n}\n\@keyframes fadeOut {\n  0% {\n    display: block;\n    opacity: 1;\n  }\n  99% {\n    display: block;\n    opacity: 0;\n  }\n  100% {\n    display: none;\n    opacity: 0;\n  }\n}"; }
};

export { ChapterNav as ti_chapter_nav };

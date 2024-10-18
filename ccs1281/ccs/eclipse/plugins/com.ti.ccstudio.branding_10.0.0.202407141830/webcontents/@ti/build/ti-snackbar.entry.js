import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const Snackbar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._actionText = '';
        this._actionCallback = null;
        this._actionUrl = '';
        this._fadeDuration = 200;
        this._message = '';
        this._snackbarQueue = [];
        /**
         * The state of the snackbar - indicates the snackbar is in use.
         * This is the only State or Prop so that the display of the
         * snackbar, which is controlled by the render of the component,
         * can only be triggered by this property. When false, the snackbar
         * is in a ready state, waiting to display the next message.
         *
         * @type {boolean}
         * @memberof Snackbar
         */
        this.active = false;
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    handleActiveChange(active) {
        // after the message is updated, animate the fade out
        if (active && this._message) {
            this._hideTimeout = setTimeout(() => this._hideSnackbar(), this._fadeDuration + this._displayDuration);
            return;
        }
        // on change to inactive, process any queued snackbar messages
        if (!active) {
            this._processSnackbarQueue();
        }
    }
    componentDidUpdate() {
        if (this.active) {
            // fire the metrics impression event when the component changes
            // state to active which indicates a snackbar was shown
            this._trackMetricsSnackbarImpression();
        }
    }
    onLoad() {
        // we must process the snackbar queue when the page loads in case
        // there are any snackbars waiting to be shown - note that this
        // call never happens if the page loads before the component which
        // is always the case if the snackbar element is dynamically added,
        // but in those cases there won't be any snackbars queued up
        this._processSnackbarQueue();
    }
    /**
     * Show the snackbar with the provided content.
     *
     * @param message Snackbar message
     * @param actionText Optional link text
     * @param action Optional link url or callback function
     * @param extendDisplayDuration Optional specifier for extending the display duration with links/actions only
     */
    async show(message = '', actionText = '', action = '', extendDisplayDuration = false) {
        const snackbarData = {
            message: message,
            actionText: actionText,
            duration: Snackbar._MESSAGE_DURATION
        };
        if (action) {
            snackbarData.duration = extendDisplayDuration ? Snackbar._LONG_DURATION : Snackbar._ACTION_DURATION;
            if (typeof action === 'string') {
                snackbarData.url = action;
            }
            else {
                snackbarData.callback = action;
            }
        }
        this._showSnackbar(snackbarData);
    }
    /**
     * Invoke the action callback.
     *
     * @param ev Click event
     */
    _callAction(ev) {
        ev.stopPropagation(); // don't click through the snackbar
        this._trackMetricsSnackbarLinkClick();
        this._hideSnackbar(this._actionCallback);
    }
    /**
     * Hide the snackbar via style, and update state.
     *
     * @param callback A function to be called after hiding the snackbar
     *
     */
    _hideSnackbar(callback) {
        clearTimeout(this._hideTimeout);
        if (this.active) {
            this.hostElement.classList.add("ti-snackbar-animate-out");
            setTimeout(() => {
                this.hostElement.classList.remove("ti-snackbar-animate-out");
                this.hostElement.style.display = 'none';
                this.hostElement.style.marginLeft = '0';
                this._displayDuration = undefined;
                this._message = '';
                this._actionText = '';
                this._actionUrl = '';
                this._actionCallback = null;
                if (callback) {
                    setTimeout(() => callback());
                }
                this.active = false; // reset state
            }, this._fadeDuration);
        }
    }
    /**
     * Show the next snackbar in the queue if not currently active.
     */
    _processSnackbarQueue() {
        if (!this.active && this._snackbarQueue.length) {
            setTimeout(() => this._showSnackbar(this._snackbarQueue.shift()));
        }
    }
    _showSnackbar(snackbarData) {
        // we need to wait until the page is loaded before displaying
        // snackbars so that metrics code will be loaded and able to capture
        // the impression tracking event fired when snackbar is shown
        if (document.readyState !== 'complete' || this.active) {
            this._snackbarQueue.push(snackbarData);
            return;
        }
        this.hostElement.style.display = 'block'; // set this before triggering render
        this.hostElement.style.opacity = '1'; // set this before triggering render
        this._displayDuration = snackbarData.duration;
        this._message = snackbarData.message;
        this._actionText = snackbarData.actionText;
        this._actionCallback = snackbarData.callback;
        this._actionUrl = snackbarData.url;
        // update the active state to trigger componentDidUpdate
        this.active = true;
    }
    /**
     * A function to emit metrics event when the snackbar is clicked
     *
     */
    _trackMetricsSnackbarLinkClick() {
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: 'link click',
            data: {
                value: 'snackbar|' + this._actionText
            }
        });
    }
    /**
    * A function to emit metrics event when the snackbar impression is displayed
    *
    */
    _trackMetricsSnackbarImpression() {
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: 'snackbar impression',
            data: {}
        });
    }
    render() {
        return h(Host, null, h("div", { class: "ti-snackbar-container" }, h("div", { class: "ti-snackbar" }, h("span", { class: "ti-snackbar-message" }, this._message), this._actionText && this._actionUrl && h("a", { class: "ti-snackbar-action", href: this._actionUrl, target: "_blank", onClick: _ev => { this._trackMetricsSnackbarLinkClick(), this._hideSnackbar(); } }, this._actionText), this._actionText && this._actionCallback && h("span", { class: "ti-snackbar-action", onClick: ev => this._callAction(ev) }, this._actionText))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "active": ["handleActiveChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: none;\n  z-index: 15000;\n  position: fixed;\n  width: 100%;\n  left: 0;\n  bottom: 2rem;\n  opacity: 0;\n  pointer-events: none;\n  -webkit-animation: slideUp 250ms cubic-bezier(0, 0, 0.2, 1), fadeIn 150ms;\n  animation: slideUp 250ms cubic-bezier(0, 0, 0.2, 1), fadeIn 150ms;\n}\n:host .ti-snackbar-container {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-snackbar-container .ti-snackbar {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  min-width: 344px;\n  max-width: 60rem;\n  background-color: rgba(45, 45, 45, 0.95);\n  padding: 2rem 3rem;\n  box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.08), 0 5px 22px 4px rgba(0, 0, 0, 0.06);\n  -webkit-box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.08), 0 5px 22px 4px rgba(0, 0, 0, 0.06);\n  border-radius: 2px;\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 1.5;\n  pointer-events: auto;\n}\n:host .ti-snackbar-container .ti-snackbar .ti-snackbar-message {\n  color: #ffffff;\n}\n:host .ti-snackbar-container .ti-snackbar .ti-snackbar-action {\n  color: #00CEE0;\n  cursor: pointer;\n  margin-left: 2rem;\n  white-space: nowrap;\n}\n\n:host(.ti-snackbar-animate-out) {\n  -webkit-animation: slideDown 200ms cubic-bezier(0.4, 0, 1, 1), fadeOut 200ms forwards;\n  animation: slideDown 200ms cubic-bezier(0.4, 0, 1, 1), fadeOut 200ms forwards;\n}\n\n\@-webkit-keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n\@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\@-webkit-keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n\@keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n\@-webkit-keyframes slideUp {\n  from {\n    -webkit-transform: translateY(15px);\n    transform: translateY(15px);\n  }\n  to {\n    -webkit-transform: translateY(0px);\n    transform: translateY(0px);\n  }\n}\n\@keyframes slideUp {\n  from {\n    -webkit-transform: translateY(15px);\n    transform: translateY(15px);\n  }\n  to {\n    -webkit-transform: translateY(0px);\n    transform: translateY(0px);\n  }\n}\n\@-webkit-keyframes slideDown {\n  from {\n    -webkit-transform: translateY(0px);\n    transform: translateY(0px);\n  }\n  to {\n    -webkit-transform: translateY(15px);\n    transform: translateY(15px);\n  }\n}\n\@keyframes slideDown {\n  from {\n    -webkit-transform: translateY(0px);\n    transform: translateY(0px);\n  }\n  to {\n    -webkit-transform: translateY(15px);\n    transform: translateY(15px);\n  }\n}"; }
};
Snackbar._ACTION_DURATION = 7000;
Snackbar._LONG_DURATION = 9000;
Snackbar._MESSAGE_DURATION = 5000;

export { Snackbar as ti_snackbar };

import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const Dialog = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._inputId = `ti-dialog-${Dialog.dialogIds++}`;
        /**
         * Whether the dialog is leaving the view
         * @default false
         */
        this.isExiting = false;
        /**
         * Whether the dialog is exiting the view and animating
         * @default false
         */
        this.isOpen = false;
        /**
         * Force the user to interact with the dialog content
         * NOTES:
         * Using blocking forces the dialog into the modal variation
         * Developers will need to implement their own action buttons if this is enabled
         * @default false
         */
        this.blocking = false;
        /**
         * If the dialog is a modal
         * @default false
         */
        this.modal = false;
        /**
         * If the dialog is fullscreen
         * @default false
         */
        this.fullscreen = false;
        this.tiDialogClosed = createEvent(this, "tiDialogClosed", 7);
        this.tiDialogOpened = createEvent(this, "tiDialogOpened", 7);
    }
    handleIsOpenChange(isOpen) {
        if (isOpen) {
            if (this.modal) {
                document.body.style.overflow = 'hidden'; // locks body from scrolling
            }
            this.tiDialogOpened.emit();
        }
        else {
            this.isExiting = true; // Applies the fade-out animation class
            window.setTimeout(() => {
                this.isExiting = false;
                if (this.modal) {
                    document.body.style.overflow = 'auto';
                }
                this.tiDialogClosed.emit();
            }, 250); //Timing for exit animation to finish
        }
    }
    componentWillLoad() {
        this._hasAction = !!this.hostElement.querySelector('[slot="action"]');
        this._hasTitle = !!this.hostElement.querySelector('[slot="title"]');
        if (this.blocking) {
            this.modal = true;
        }
        if (this.modal && this.isOpen) {
            document.body.style.overflow = 'hidden';
        }
    }
    /**
     * Check if the dialog is open and a page click happens outside of the dialog to dismiss the dialog
     * @param ev Mouse click event
     */
    onClick(ev) {
        if (this.isOpen && !this.blocking) {
            const dialogRect = this.hostElement.shadowRoot.querySelector(".ti-dialog-content").getBoundingClientRect();
            // Need to check for height and width greater than 0 since isOpen updates before the visual update
            if (dialogRect.height > 0 && dialogRect.width > 0 &&
                (ev.clientX <= dialogRect.left || ev.clientX >= dialogRect.right ||
                    ev.clientY <= dialogRect.top || ev.clientY >= dialogRect.bottom)) {
                this.isOpen = false;
            }
        }
    }
    ;
    /**
     * Check if the dialog is open and the user presses 'esc' dismiss the dialog
     * @param ev keydown event
     */
    onKeydown(ev) {
        if ((ev.key === 'Escape' || ev.key === 'Esc') && !this.blocking && this.isOpen) {
            this.isOpen = false;
        }
    }
    ;
    /**
     * Close the dialog.
     */
    async close() {
        this.isOpen = false;
    }
    /**
     * Open the dialog.
     */
    async open() {
        this.isOpen = true;
    }
    render() {
        const { _inputId: inputId } = this;
        const labelId = inputId + '-lbl';
        const dialogContent = h("div", { class: {
                'ti-dialog-content': true,
                'ti-dialog-content-center': this.modal,
                'ti-dialog-content-fullscreen': this.fullscreen
            } }, (!this.blocking) &&
            h("div", { class: "ti-dialog-close", "aria-label": "Close", onClick: () => { this.close(); } }, h("ti-svg-icon", { "icon-set": "actions", size: "s" }, "close")), this._hasTitle &&
            h("slot", { name: "title" }), h("div", { class: "ti-dialog-content-section" }, h("slot", null)), this._hasAction &&
            h("div", { class: "ti-dialog-action" }, h("slot", { name: "action" })));
        return (h(Host, { class: {
                'ti-dialog': true,
                'ti-dialog-visible': this.isOpen || this.isExiting,
                'ti-dialog-hidden': !this.isOpen && !this.isExiting,
                'ti-dialog-is-exiting': this.isExiting
            }, role: "dialog", "aria-expanded": this.isOpen, "aria-labelledby": labelId, "aria-modal": this.modal }, this.modal ?
            h("div", { class: "ti-dialog-backdrop" }, dialogContent)
            :
                dialogContent));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "isOpen": ["handleIsOpenChange"]
    }; }
    static get style() { return "/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host .ti-dialog-content-section {\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  min-height: 60px;\n  overflow-y: auto;\n  width: calc(100% - 1px);\n  margin-left: -2rem;\n  padding: 0 2rem;\n}\n:host ::slotted([slot=title]) {\n  margin-right: 24px !important;\n}\n:host ::slotted([slot=action]) {\n  margin-right: 1rem;\n}\n:host ::slotted(:not(ti-button)[slot=action]) {\n  margin: 0;\n  text-decoration: none;\n  outline: 0;\n  font-family: inherit !important;\n  font-size: 1em;\n  white-space: nowrap;\n  cursor: pointer;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  padding: 0.3em 0;\n}\n:host ::slotted(:not(ti-button)[slot=action]:hover) {\n  color: #007c8c;\n}\n:host ::slotted(a[slot=action]) {\n  color: #007c8c;\n}\n:host ::slotted(a[slot=action]:hover) {\n  text-decoration: underline;\n}\n:host .ti-dialog-content {\n  /* NOSONAR */\n  text-align: left;\n  padding: 2rem;\n  position: absolute;\n  z-index: 11500;\n  border-radius: 0;\n  background: #ffffff;\n  -webkit-box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.08), 0 5px 22px 4px rgba(0, 0, 0, 0.06);\n  box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.06), 0 12px 17px 2px rgba(0, 0, 0, 0.08), 0 5px 22px 4px rgba(0, 0, 0, 0.06);\n  opacity: 0;\n  -webkit-box-sizing: content-box;\n  box-sizing: content-box;\n}\n:host .ti-dialog-content .ti-dialog-close {\n  position: absolute;\n  top: 0.25rem;\n  right: 0.25rem;\n  cursor: pointer;\n  padding: 0.75rem;\n}\n:host .ti-dialog-content-center {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  max-height: calc(100vh - 7rem);\n  min-height: 100px;\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translate3d(-50%, -50%, 0);\n  transform: translate3d(-50%, -50%, 0);\n}\n:host .ti-dialog-content-fullscreen {\n  position: fixed;\n  top: 3rem;\n  right: 3rem;\n  bottom: 3rem;\n  left: 3rem;\n  -webkit-transform: none;\n  transform: none;\n  margin-bottom: 0;\n  margin-top: 0;\n}\n:host .ti-dialog-content-fullscreen .ti-dialog-content-section {\n  height: 100%;\n  max-height: initial;\n}\n:host .ti-dialog-action {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  padding: 2rem 0 0;\n}\n:host .ti-dialog-backdrop {\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, 0.6);\n  position: fixed;\n  z-index: 11000;\n  display: -ms-flexbox;\n  display: flex;\n  opacity: 0;\n}\n\@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {\n  :host .ti-dialog-content-center {\n    max-width: 50vw;\n  }\n  :host .ti-dialog-content-center .ti-dialog-content-section {\n    max-width: 100vw;\n    max-height: calc(100vh - 232px);\n    -webkit-box-sizing: content-box;\n    box-sizing: content-box;\n  }\n  :host .ti-dialog-content-center.ti-dialog-content-fullscreen {\n    max-width: none;\n  }\n  :host .ti-dialog-content-center.ti-dialog-content-fullscreen .ti-dialog-content-section {\n    max-height: 100vh;\n  }\n  :host .ti-dialog-action {\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n  }\n}\n\n:host(.ti-dialog-hidden) {\n  /* NOSONAR */\n  display: none;\n}\n\n:host(.ti-dialog-visible) {\n  /* NOSONAR */\n  display: block;\n  /* Animation Fade In */\n}\n:host(.ti-dialog-visible) .ti-dialog-content {\n  -webkit-animation: fadeIn 150ms cubic-bezier(0, 0, 0.2, 1);\n  animation: fadeIn 150ms cubic-bezier(0, 0, 0.2, 1);\n  -webkit-animation-fill-mode: forwards;\n  animation-fill-mode: forwards;\n}\n:host(.ti-dialog-visible) .ti-dialog-backdrop {\n  -webkit-animation: fadeIn 250ms cubic-bezier(0, 0, 0.2, 1);\n  animation: fadeIn 250ms cubic-bezier(0, 0, 0.2, 1);\n  -webkit-animation-fill-mode: forwards;\n  animation-fill-mode: forwards;\n}\n\n:host(.ti-dialog-visible.ti-dialog-is-exiting) {\n  /* NOSONAR */\n}\n:host(.ti-dialog-visible.ti-dialog-is-exiting) .ti-dialog-content {\n  -webkit-animation: fadeOut 150ms cubic-bezier(0.4, 0, 1, 1);\n  animation: fadeOut 150ms cubic-bezier(0.4, 0, 1, 1);\n}\n:host(.ti-dialog-visible.ti-dialog-is-exiting) .ti-dialog-backdrop {\n  -webkit-animation: fadeOut 250ms cubic-bezier(0.4, 0, 1, 1);\n  animation: fadeOut 250ms cubic-bezier(0.4, 0, 1, 1);\n}\n\n\@-webkit-keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n\@keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\@-webkit-keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n\@keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}"; }
};
Dialog.dialogIds = 0;

export { Dialog as ti_dialog };

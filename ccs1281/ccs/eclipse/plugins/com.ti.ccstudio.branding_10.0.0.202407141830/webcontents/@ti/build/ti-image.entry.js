import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const Image = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Optional property for to make image zoomable
         * using a dialog box
         */
        this.zoom = false;
        /*
         * Optional property to display alt text as caption title
         * in modal zoom
         */
        this.zoomCaption = false;
        /**
         * Optional property to show download button on image
         * modal zoom
         */
        this.zoomDownload = false;
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    imageSourceUpdated() {
        this._addIntersectionObserver();
    }
    componentWillLoad() {
        // html decode the titles
        this.alt = this._htmlDecode(this.alt);
        this._hasCaption = !!this.hostElement.querySelector('[slot="caption"]');
        // check for object fit support
        this._supportsObjectFit = ('objectFit' in document.documentElement.style);
        // if it has zoom, then set the size of the image for ie to mimic object fit
        if (this.zoom) {
            const image = document.createElement('img');
            image.src = this.srcLg || this.src;
            image.onload = () => {
                this._imageWidth = image.width;
            };
        }
    }
    componentDidLoad() {
        this._addIntersectionObserver();
    }
    componentDidUnload() {
        this._removeIntersectionObserver();
    }
    /**
     * Intersection observer for lazy load images
     * possible polyfill at https://github.com/w3c/IntersectionObserver/tree/master/polyfill
     * <script src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>
     */
    _addIntersectionObserver() {
        if (!this.src) {
            return;
        }
        if ('IntersectionObserver' in window) {
            this._io = new IntersectionObserver((data) => {
                // because there will only ever be one instance
                // of the element we are observing
                // we can just use data[0]
                if (data[0].isIntersecting) {
                    this._processImage();
                    this._removeIntersectionObserver();
                }
            });
            // this only applies to the polyfill, and will hopefully prevent IE from freezing
            if (this._io.hasOwnProperty('USE_MUTATION_OBSERVER')) {
                this._io['USE_MUTATION_OBSERVER'] = false;
            }
            this._io.observe(this._imgElement);
        }
        else {
            // fall back to setTimeout for Safari and IE
            setTimeout(() => {
                this._processImage();
            }, 100);
        }
    }
    /**
     * Fire metrics event
     */
    _trackImageClickMetrics() {
        const imgSrc = this.srcLg !== undefined && this.srcLg !== null ? this.srcLg : this.src;
        const imgName = imgSrc.split("/").pop().split("?")[0];
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: 'image click',
            data: {
                value: 'expand',
                column: imgName
            }
        });
    }
    /*
     * Process image for lazyload
     */
    _processImage() {
        this._imgElement.setAttribute('src', this._imgElement.getAttribute('data-src'));
        this._imgElement.onload = () => {
            this._imgElement.removeAttribute('data-src');
            this._imgElement.parentElement.classList.add('ti-image-has-loaded');
        };
        this._imgElement.onerror = () => {
            if (this.srcDefault != undefined && this.srcDefault != this._imgElement.getAttribute('data-src')) {
                this._imgElement.onerror = null; // to avoid infinite loop when default image is not found
                this._imgElement.setAttribute('src', this.srcDefault);
                this._imgElement.removeAttribute('data-src');
                this._imgElement.parentElement.classList.add('ti-image-has-loaded');
            }
        };
    }
    /**
     * Remove intersection observer
     */
    _removeIntersectionObserver() {
        if (this._io) {
            this._io.disconnect();
            this._io = null;
        }
    }
    /**
     * decodes html encoded string
     * @param input - html encoded string
     */
    _htmlDecode(input) {
        if (input) {
            var doc = new DOMParser().parseFromString(input, "text/html");
            return doc.documentElement.textContent;
        }
        return null;
    }
    render() {
        const imageObject = [
            h("span", { class: "ti-image-object-wrapper" }, h("img", { class: "ti-image-object", "data-src": this.src, alt: this.alt, ref: el => this._imgElement = el }))
        ];
        const imageContainer = this.href && !this.zoom ?
            h("a", { class: "ti-image-link", href: this.href, target: this.target }, imageObject)
            : this.zoom ?
                h("div", { class: "ti-image-zoom", onClick: () => { this._trackImageClickMetrics(), this._modalElement.open(); } }, imageObject)
                : imageObject;
        return (h(Host, null, this._hasCaption
            ?
                h("figure", { class: "ti-image-figure" }, imageContainer, h("figcaption", null, h("slot", { name: "caption" })))
            : imageContainer, this.zoom &&
            h("ti-dialog", { modal: true, fullscreen: true, ref: (el) => this._modalElement = el }, (this.zoomCaption || this.zoomDownload) &&
                h("div", { class: 'ti-image-zoom-title' }, this.zoomCaption &&
                    h("span", null, this.alt), this.zoomDownload &&
                    h("ti-file-download", { fileSrc: this.src, fileName: this.src.split('/').pop().split('?')[0] }, h("a", { href: this.src, target: "_blank" }, h("ti-svg-icon", { "icon-set": "actions", size: "s", appearance: "secondary" }, "download"), h("slot", { name: "download-label" })))), h("div", { class: "ti-image-zoom-image" }, this._supportsObjectFit == true
                ?
                    h("img", { class: "ti-image-zoomed-object", src: this.srcLg || this.src, alt: this.alt })
                :
                    h("img", { class: "ti-image-zoomed-object", src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", alt: this.alt, style: {
                            backgroundImage: `url('${this.srcLg || this.src}')`,
                            maxWidth: `${this._imageWidth}px`
                        } })))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "src": ["imageSourceUpdated"]
    }; }
    static get style() { return "\@charset \"UTF-8\";\n/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: block;\n}\n:host a {\n  color: #007c8c;\n}\n:host img {\n  font-size: 14px;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n:host .ti-image-object-wrapper {\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%;\n  height: 100%;\n  -webkit-transition: 0.3s;\n  transition: 0.3s;\n  background: -webkit-gradient(linear, right top, left top, from(#e8e8e8), color-stop(50%, #f9f9f9), to(#e8e8e8));\n  background: linear-gradient(-90deg, #e8e8e8 0%, #f9f9f9 50%, #e8e8e8 100%);\n  background-size: 400% 400%;\n  -webkit-animation: shine 1.3s infinite;\n  animation: shine 1.3s infinite;\n  opacity: 0.8;\n}\n:host .ti-image-object-wrapper.ti-image-has-loaded {\n  background: transparent;\n  -webkit-animation: none;\n  animation: none;\n  opacity: 1;\n}\n:host .ti-image-link {\n  display: block;\n}\n:host .ti-image-zoom {\n  position: relative;\n  display: block;\n  cursor: pointer;\n  cursor: -webkit-zoom-in;\n  cursor: zoom-in;\n  border: 1px solid #cccccc;\n}\n:host .ti-image-zoom::after {\n  position: absolute;\n  bottom: -1px;\n  right: -1px;\n  width: 31px;\n  height: 31px;\n  content: \" \";\n  border: inherit;\n  background-image: url(\"https://www.ti.com/assets/icons/ti_icons-actions/zoom-in.svg\");\n  background-position: 4px 4px;\n  background-size: 24px;\n  background-repeat: no-repeat;\n  background-color: #ffffff;\n  pointer-events: none;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-image-zoom-modal {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n:host .ti-image-zoomed-object {\n  -o-object-fit: scale-down;\n  object-fit: scale-down;\n  width: 100%;\n  height: 100%;\n  background-position: 50% 50%;\n  background-size: contain;\n  background-repeat: no-repeat;\n  background-origin: content-box;\n}\n:host .ti-image-figure {\n  position: relative;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  text-align: center;\n}\n:host .ti-image-figure figcaption {\n  max-width: 100%;\n  margin: 0.75rem 0 0 0;\n  padding-bottom: calc(0.75rem - 1px);\n  text-align: left;\n  color: #555555;\n  border-bottom: 1px solid #e8e8e8;\n  font-size: 12px;\n}\n:host .ti-image-figure figcaption p:last-child {\n  margin-bottom: 0;\n}\n:host .ti-image-figure figcaption p:empty {\n  display: none;\n}\n:host .ti-image-figure figcaption:empty {\n  display: none;\n  border-bottom: none;\n}\n:host .ti-image-zoom-image {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-align: center;\n  align-items: center;\n  height: 100%;\n  min-height: 100px;\n}\n:host .ti-image-zoom-image img {\n  width: 100%;\n  height: 100%;\n  background-position: 50% 50%;\n  background-size: contain;\n  background-repeat: no-repeat;\n  background-origin: content-box;\n}\n\@supports ((-o-object-fit: scale-down) or (object-fit: scale-down)) {\n  :host .ti-image-zoom-image img {\n    -o-object-fit: scale-down;\n    object-fit: scale-down;\n    width: auto;\n    height: auto;\n    max-height: 100%;\n    max-width: 100%;\n  }\n}\n:host .ti-image-zoom-title {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  font-size: 20px;\n  line-height: 24px;\n  margin-bottom: 1rem;\n  text-align: center;\n  padding: 0 140px;\n  color: #333333;\n}\n:host .ti-image-zoom-title a {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  position: absolute;\n  top: 2px;\n  right: 20px;\n  font-size: 14px;\n  color: #007c8c;\n  text-decoration: none;\n}\n:host .ti-image-zoom-title a:hover, :host .ti-image-zoom-title a:focus {\n  text-decoration: underline;\n}\n:host .ti-image-zoom-title a ti-svg-icon {\n  margin-right: 0.5rem;\n}\n:host .ti-image-zoom-title + .ti-image-zoom-image {\n  height: calc(100% - 3rem);\n}\n:host ::slotted(p:last-child) {\n  margin-bottom: 0 !important;\n}\n:host ::slotted([slot=download-label]) {\n  white-space: nowrap !important;\n}\n\n:host(:not([ratio])) img {\n  width: 100%;\n  max-width: 100%;\n  height: auto;\n}\n\n:host([ratio]) .ti-image-object-wrapper {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n}\n:host([ratio]) .ti-image-object-wrapper img {\n  position: absolute;\n  max-width: 100%;\n  max-height: 100%;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  margin: auto;\n}\n\n:host([ratio=rectangle]) .ti-image-object-wrapper {\n  padding: 56.25% 0 0 0;\n}\n\n:host([ratio=square]) .ti-image-object-wrapper {\n  padding: 100% 0 0 0;\n}\n\n\@-webkit-keyframes shine {\n  0% {\n    background-position: 0% 0%;\n  }\n  100% {\n    background-position: -135% 0%;\n  }\n}\n\n\@keyframes shine {\n  0% {\n    background-position: 0% 0%;\n  }\n  100% {\n    background-position: -135% 0%;\n  }\n}"; }
};

export { Image as ti_image };

import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

const ImageGallery = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._modalOpen = false;
        /* check for objectFit support css */
        this._supportsObjectFit = ('objectFit' in document.documentElement.style);
        /**
         * State of thumbnail view
         */
        this.showingAll = false;
        /**
         * Property way of setting number of thumbnails per row
         */
        this.columns = 4;
        /**
         * Property to show all the thumbnails instead of only showing first row and adding "+n" on the last thumbnail
         */
        this.showAllThumbnails = false;
        /**
         * Handler for carousel update on scroll and resize
         */
        this._handleCarouselScrollUpdate = this._debounce(() => {
            this._updateThumbnailCarouselButtons();
        }, 200);
        /**
         * Check to see if element is actually overflowing
         */
        this._checkCarouselOverflow = ({ clientWidth, scrollWidth }) => {
            return scrollWidth > clientWidth;
        };
        /**
         * Check to see if element is actually overflowing
         */
        this._checkCarouselScrollPosition = ({ clientWidth, scrollWidth, scrollLeft }) => {
            const maxScrollLeft = scrollWidth - clientWidth;
            const scrollPosition = (scrollLeft == 0) ? 'left' : (scrollLeft == maxScrollLeft) ? 'right' : 'between';
            return scrollPosition;
        };
        /**
         * Native smooth scrolling for Chrome, Firefox & Opera
         */
        this.nativeSmoothScroll = (el, distance) => {
            el.scroll({
                behavior: 'smooth',
                left: distance,
                top: 0
            });
        };
        /**
         * polyfilled smooth scrolling for IE, Edge & Safari
         */
        this.smoothScroll = (el, to, duration) => {
            const element = el, start = element.scrollLeft, change = to - start, startDate = +new Date();
            const easeInOutQuad = (t, b, c, d) => {
                t /= d / 2;
                if (t < 1)
                    return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            };
            const animateScroll = () => {
                const currentDate = +new Date();
                const currentTime = currentDate - startDate;
                element.scrollLeft = parseInt(easeInOutQuad(currentTime, start, change, duration));
                if (currentTime < duration) {
                    requestAnimationFrame(animateScroll);
                }
                else {
                    element.scrollLeft = to;
                }
            };
            animateScroll();
        };
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    handleColumnsChange(newValue) {
        this.columns = newValue;
        this._visibleImagesCount = (Object.entries(this._imageList).length > this.columns) ? Math.max(0, this.columns - 1) : this.columns;
        if (this.showAllThumbnails) {
            this._showMoreImages();
        }
        else {
            this._currentImageList = JSON.parse(this.images).slice(0, this._visibleImagesCount);
        }
    }
    componentDidLoad() {
        this._addIntersectionObserver();
    }
    componentDidUnload() {
        this._removeIntersectionObserver();
    }
    /**
     * Add window resize listener when gallery zoom modal opened
     */
    handleTiDialogOpened() {
        window.addEventListener('resize', this._handleCarouselScrollUpdate, {
            passive: true
        });
        this._carouselScrollElement.addEventListener('scroll', this._handleCarouselScrollUpdate, false);
        this._modalOpen = true;
    }
    /**
     * Remove window resize listener when gallery zoom modal closed
     */
    handleTiDialogClosed() {
        window.removeEventListener('resize', this._handleCarouselScrollUpdate);
        this._carouselScrollElement.removeEventListener('scroll', this._handleCarouselScrollUpdate, false);
        this._modalOpen = false;
    }
    /**
     * Intersection observer for lazy load images
     * possible polyfill at https://github.com/w3c/IntersectionObserver/tree/master/polyfill
     * <script src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>
     */
    _addIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this._io = new IntersectionObserver((data) => {
                // because there will only ever be one instance
                // of the element we are observing
                // we can just use data[0]
                if (data[0].isIntersecting) {
                    this._init();
                    this._removeIntersectionObserver();
                }
            });
            // this only applies to the polyfill, and will hopefully prevent IE from freezing
            if (this._io.hasOwnProperty('USE_MUTATION_OBSERVER')) {
                this._io['USE_MUTATION_OBSERVER'] = false;
            }
            this._io.observe(this.hostElement);
        }
        else {
            // fall back to setTimeout for Safari and IE
            setTimeout(() => {
                this._init();
            }, 100);
        }
    }
    /**
     * Debounce helper function for window resize listener
     */
    _debounce(func, wait, immediate) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            const later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    }
    ;
    _init() {
        // get image list from attribute
        this._imageList = JSON.parse(this.images);
        // set how many images are visible, and put them in a list
        this._visibleImagesCount = (Object.entries(this._imageList).length > this.columns) ? Math.max(0, this.columns - 1) : this.columns;
        this._currentImageList = JSON.parse(this.images).slice(0, this._visibleImagesCount);
        // html decoding all alt tags
        Object.entries(this._imageList).length &&
            Object.values(this._imageList).map(image => image['alt'] = this._htmlDecode(image['alt']));
        // set first image as current
        const currentImage = this._imageList[0];
        this.currentImageSrc = currentImage['src'];
        this.currentImageAltSrc = currentImage['src-lg'];
        this.currentImageAlt = currentImage['alt'];
        if (!this._supportsObjectFit) {
            this._setCurrentImageWidth();
        }
        if (this.showAllThumbnails) {
            this._showMoreImages();
        }
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
     * Fire metrics event
     */
    _trackImageClickMetrics() {
        const imgSrc = this.currentImageAltSrc !== undefined && this.currentImageAltSrc !== null ? this.currentImageAltSrc : this.currentImageSrc;
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
    /**
     * Fire metrics event on thumbnail click
     */
    _trackThumbnailClickMetrics(thumbnaillImgName) {
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: 'image click',
            data: {
                value: 'thumbnail',
                column: thumbnaillImgName
            }
        });
    }
    /**
     * Fire metrics event on carousel scroll
     */
    _trackMetricsThumbnailScroll(buttonSide) {
        this.tiMetricsAction.emit({
            elementName: this.hostElement.tagName,
            eventName: 'click',
            data: {
                value: buttonSide + ' scroll'
            }
        });
    }
    /**
     * Setting active image and highlight on thumbnail click
     */
    _selectImage(ev) {
        this.currentImageSrc = ev.currentTarget.getAttribute('src');
        this.currentImageAltSrc = ev.currentTarget.getAttribute('src-lg');
        this.currentImageAlt = ev.currentTarget.getAttribute('alt');
        const imgSrc = this.currentImageAltSrc !== undefined && this.currentImageAltSrc !== null ? this.currentImageAltSrc : this.currentImageSrc;
        const imgName = imgSrc.split("/").pop().split("?")[0];
        if (!this._supportsObjectFit) {
            this._setCurrentImageWidth();
        }
        this._trackThumbnailClickMetrics(imgName);
        // if in the modal view, scroll thumbnail into view if it's outside
        if (this._modalOpen) {
            // needs to be parent of target to account for border
            ev.target.parentElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
        }
        ;
    }
    _setCurrentImageWidth() {
        const image = document.createElement('img');
        image.src = this.currentImageAltSrc !== undefined && this.currentImageAltSrc !== null ? this.currentImageAltSrc : this.currentImageSrc;
        image.onload = () => {
            this._currentImageWidth = image.width;
        };
    }
    /**
     * Clicking on main gallery image opens modal zoom
     */
    _openGalleryZoom() {
        // fire metrics event
        this._trackImageClickMetrics();
        // open the modal
        this._modalElement.open();
        // update carousel scroll and thumbnail accordingly
        setTimeout(() => {
            this._carouselElement.querySelector('.ti-image-gallery-thumbnails-item-is-active').scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
        }, 10);
        setTimeout(() => {
            this._updateThumbnailCarouselButtons();
        }, 200);
    }
    /**
     * Update chevron appearances on modal carousel based on scroll pos and overflow
     */
    _updateThumbnailCarouselButtons() {
        const carouselThumbnailContainer = this._carouselScrollElement;
        const scrollPosition = this._checkCarouselScrollPosition(carouselThumbnailContainer);
        const classNameBase = 'ti-image-gallery-carousel sc-ti-image-gallery';
        const classNamePosition = `${classNameBase} ti-image-gallery-carousel-is-scrollable ti-image-gallery-carousel-is-${scrollPosition}`;
        // sets the classname based on scroll position
        this._carouselElement.className = (this._checkCarouselOverflow(carouselThumbnailContainer)) ? classNamePosition : classNameBase;
    }
    /**
     * Do carousel scroll button clicks
     */
    _carouselScroll(ev) {
        const carouselThumbnailContainer = this._carouselScrollElement, carouselThumbnailWidth = carouselThumbnailContainer.children[0].clientWidth, carouselThumbnailScrollPosition = carouselThumbnailContainer.scrollLeft, buttonDirection = (this._carouselElement.firstChild == ev.currentTarget) ? 'left' : 'right', scrollDistance = (buttonDirection == 'left')
            ? carouselThumbnailScrollPosition - (carouselThumbnailWidth * 2.5)
            : carouselThumbnailScrollPosition + (carouselThumbnailWidth * 2.5);
        this._trackMetricsThumbnailScroll(buttonDirection);
        // do native or polyfilled scroll behaviour
        const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
        if (supportsNativeSmoothScroll) {
            this.nativeSmoothScroll(carouselThumbnailContainer, scrollDistance);
        }
        else {
            this.smoothScroll(carouselThumbnailContainer, scrollDistance, 500);
        }
        // update style for chevron and shadow immediately when leaving full left or right
        if (this._checkCarouselScrollPosition(carouselThumbnailContainer) != buttonDirection) {
            this._carouselElement.className = 'ti-image-gallery-carousel sc-ti-image-gallery ti-image-gallery-carousel-is-scrollable ti-image-gallery-carousel-is-between';
        }
    }
    /**
     * Show more thumbnail images click
     */
    _showMoreImages() {
        this.showingAll = true;
        this._currentImageList = this._imageList;
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
        const _biggestImgSrc = this.currentImageAltSrc !== undefined && this.currentImageAltSrc !== null ? this.currentImageAltSrc : this.currentImageSrc;
        if (!_biggestImgSrc) {
            return null;
        }
        const _biggestImgName = _biggestImgSrc.split("/").pop().split("?")[0];
        const _thumbnails = (carousel) => {
            // if this is carousel, then all images are shown, otherwise only currently visible images
            const visibleImages = carousel ? this._imageList : this._currentImageList;
            // set width of gallery items as % based on # of items per row, minus 0.5rem to account for margins
            const widthValue = `calc(${100 / this.columns}% - 0.5rem)`;
            return [
                // the list of images...
                (Object.entries(this._imageList).length &&
                    Object.values(visibleImages).map(image => h("div", { style: !carousel && { width: widthValue }, class: {
                            'ti-image-gallery-thumbnails-item': true,
                            'ti-image-gallery-thumbnails-item-is-active': image['src'] == this.currentImageSrc
                        } }, h("ti-image", { src: image['src'], "src-lg": image['src-lg'], ratio: "rectangle", alt: image['alt'], onClick: (ev) => this._selectImage(ev) })))),
                // ...and the 'more' button if needed
                (Object.entries(this._imageList).length > this.columns && !this.showingAll && !carousel &&
                    h("div", { style: !carousel && { width: widthValue }, class: "ti-image-gallery-thumbnails-item", onClick: () => this._showMoreImages() }, "+", Object.entries(this._imageList).length - Object.entries(visibleImages).length))
            ];
        };
        return (h(Host, null, h("div", { class: 'ti-image-gallery-primary-image' }, h("ti-image", { src: this.currentImageSrc, ratio: "rectangle", alt: this.currentImageAlt, onClick: () => this._openGalleryZoom() })), this._visibleImagesCount != 0 &&
            h("div", { class: "ti-image-gallery-thumbnails" }, _thumbnails()), h("ti-dialog", { modal: true, fullscreen: true, ref: (el) => this._modalElement = el }, h("div", { class: "ti-image-gallery-zoom-content" }, h("div", { class: "ti-image-gallery-zoom-title" }, this.currentImageAlt, h("ti-file-download", { fileSrc: _biggestImgSrc, fileName: _biggestImgName }, h("a", { href: _biggestImgSrc, target: "_blank" }, h("ti-svg-icon", { "icon-set": "actions", size: "s", appearance: "secondary" }, "download"), h("slot", { name: "download-label" })))), h("div", { class: "ti-image-gallery-zoom-image" }, this._supportsObjectFit == true
            ?
                h("img", { src: _biggestImgSrc, alt: this.currentImageAlt })
            :
                h("img", { src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", alt: this.currentImageAlt, style: {
                        backgroundImage: `url('${_biggestImgSrc}')`,
                        maxWidth: `${this._currentImageWidth}px`
                    } })), h("div", { class: "ti-image-gallery-carousel", ref: (el) => this._carouselElement = el }, h("div", { class: "ti-image-gallery-carousel-button", onClick: (ev) => this._carouselScroll(ev) }, h("ti-svg-icon", { size: "l" }, "chevron-left")), h("div", { class: "ti-image-gallery-carousel-thumbnails", ref: (el) => this._carouselScrollElement = el }, _thumbnails(true)), h("div", { class: "ti-image-gallery-carousel-button", onClick: (ev) => this._carouselScroll(ev) }, h("ti-svg-icon", { size: "l" }, "chevron-right")))))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "columns": ["handleColumnsChange"]
    }; }
    static get style() { return "\@charset \"UTF-8\";\n/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:host {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  width: 100%;\n}\n:host ::slotted([slot=download-label]) {\n  white-space: nowrap !important;\n}\n:host *, :host *::after, :host *::before {\n  -webkit-box-sizing: inherit;\n  box-sizing: inherit;\n}\n:host img {\n  display: block;\n  width: 100%;\n}\n:host .ti-image-gallery-primary-image {\n  position: relative;\n  display: block;\n  cursor: pointer;\n  cursor: -webkit-zoom-in;\n  cursor: zoom-in;\n  border: 1px solid #cccccc;\n}\n:host .ti-image-gallery-primary-image::after {\n  position: absolute;\n  bottom: -1px;\n  right: -1px;\n  width: 33px;\n  height: 33px;\n  content: \" \";\n  border: inherit;\n  background-image: url(\"https://www.ti.com/assets/icons/ti_icons-actions/zoom-in.svg\");\n  background-position: 4px 4px;\n  background-size: 24px;\n  background-repeat: no-repeat;\n  background-color: #ffffff;\n  pointer-events: none;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:host .ti-image-gallery-thumbnails {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  overflow: hidden;\n  position: relative;\n  width: auto;\n  margin-left: -0.25rem;\n  margin-right: -0.25rem;\n}\n:host .ti-image-gallery-thumbnails-item {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  -ms-flex-preferred-size: auto;\n  flex-basis: auto;\n  position: relative;\n  margin-top: 0.5rem;\n  margin-left: 0.25rem;\n  margin-right: 0.25rem;\n  border: 1px solid #cccccc;\n  cursor: pointer;\n  -webkit-animation: fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1);\n  animation: fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1);\n  text-align: center;\n  color: #aaaaaa;\n  font-size: 24px;\n  background-color: #ffffff;\n  opacity: 1;\n  -webkit-transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-image-gallery-thumbnails-item.ti-image-gallery-thumbnails-item-is-active {\n  border-color: #cc0000;\n}\n:host .ti-image-gallery-zoom-content {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  position: relative;\n  height: 100%;\n}\n:host .ti-image-gallery-zoom-title {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  font-size: 20px;\n  line-height: 24px;\n  margin-bottom: 1rem;\n  text-align: center;\n  padding: 0 140px;\n  color: #333333;\n}\n:host .ti-image-gallery-zoom-title a {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  position: absolute;\n  top: 2px;\n  right: 20px;\n  font-size: 14px;\n  color: #007c8c;\n  text-decoration: none;\n}\n:host .ti-image-gallery-zoom-title a:hover, :host .ti-image-gallery-zoom-title a:focus {\n  text-decoration: underline;\n}\n:host .ti-image-gallery-zoom-title a ti-svg-icon {\n  margin-right: 0.5rem;\n}\n:host .ti-image-gallery-zoom-image {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-align: center;\n  align-items: center;\n  height: calc(100% - 120px - 1rem);\n  min-height: 100px;\n  margin-bottom: 1rem;\n}\n:host .ti-image-gallery-zoom-image img {\n  width: 100%;\n  height: 100%;\n  background-position: 50% 50%;\n  background-size: contain;\n  background-repeat: no-repeat;\n  background-origin: content-box;\n}\n\@supports ((-o-object-fit: scale-down) or (object-fit: scale-down)) {\n  :host .ti-image-gallery-zoom-image img {\n    -o-object-fit: scale-down;\n    object-fit: scale-down;\n    width: auto;\n    height: auto;\n    max-height: 100%;\n    max-width: 100%;\n  }\n}\n:host .ti-image-gallery-carousel {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  width: 100%;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  margin-top: -0.5rem;\n}\n:host .ti-image-gallery-carousel-thumbnails {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n  overflow: hidden;\n  padding: 0.5rem 0;\n}\n:host .ti-image-gallery-carousel-thumbnails .ti-image-gallery-thumbnails-item {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  margin-top: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  width: 114px;\n}\n:host .ti-image-gallery-carousel-thumbnails .ti-image-gallery-thumbnails-item:first-child {\n  margin-left: 0;\n}\n:host .ti-image-gallery-carousel-thumbnails .ti-image-gallery-thumbnails-item:last-child {\n  margin-right: 0;\n}\n:host .ti-image-gallery-carousel-button {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  margin: 0 0.5rem;\n  opacity: 0;\n  -webkit-transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-image-gallery-carousel-is-scrollable::before, :host .ti-image-gallery-carousel-is-scrollable::after {\n  display: block;\n  opacity: 1;\n  position: absolute;\n  bottom: 1;\n  z-index: 11505;\n  content: \" \";\n  width: 32px;\n  height: 100%;\n  pointer-events: none;\n  -webkit-transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n:host .ti-image-gallery-carousel-is-scrollable::before {\n  left: 52px;\n  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0.15)), to(rgba(0, 0, 0, 0)));\n  background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 100%);\n}\n:host .ti-image-gallery-carousel-is-scrollable::after {\n  right: 52px;\n  background-image: -webkit-gradient(linear, right top, left top, from(rgba(0, 0, 0, 0.15)), to(rgba(0, 0, 0, 0)));\n  background-image: linear-gradient(270deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 100%);\n}\n:host .ti-image-gallery-carousel-is-scrollable .ti-image-gallery-carousel-button {\n  opacity: 1;\n  cursor: pointer;\n}\n:host .ti-image-gallery-carousel-is-scrollable.ti-image-gallery-carousel-is-right::after {\n  opacity: 0;\n}\n:host .ti-image-gallery-carousel-is-scrollable.ti-image-gallery-carousel-is-right .ti-image-gallery-carousel-button:last-child {\n  opacity: 0.3;\n  cursor: default;\n}\n:host .ti-image-gallery-carousel-is-scrollable.ti-image-gallery-carousel-is-left::before {\n  opacity: 0;\n}\n:host .ti-image-gallery-carousel-is-scrollable.ti-image-gallery-carousel-is-left .ti-image-gallery-carousel-button:first-child {\n  opacity: 0.3;\n  cursor: default;\n}\n\@-webkit-keyframes fade-in {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\@keyframes fade-in {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}"; }
};

export { ImageGallery as ti_image_gallery };

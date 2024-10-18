import { r as registerInstance, d as createEvent, h, H as Host, c as getElement } from './core-800e68f4.js';

var TableControllerFilterType;
(function (TableControllerFilterType) {
    TableControllerFilterType["exact"] = "exact";
    TableControllerFilterType["full"] = "full";
    TableControllerFilterType["multi"] = "multi";
    TableControllerFilterType["partial"] = "partial";
    TableControllerFilterType["start"] = "start";
})(TableControllerFilterType || (TableControllerFilterType = {}));

let slice = Array.prototype.slice;
let doc = document;
let dom = {
    doc,
    html: doc.documentElement,
    body: doc.body,
    $(ref) {
        if (typeof ref === "string") { // ref is a selector
            return dom.body.querySelector(ref);
        }
        return ref; // ref is already an element
    },
    $$(ref) {
        if (Array.isArray(ref)) { // ref is an array of elements
            return ref;
        }
        if (ref.nodeType === Node.ELEMENT_NODE) { // ref is an element
            return [ref];
        }
        if (typeof ref === "string") { // ref is a selector
            return slice.call(dom.body.querySelectorAll(ref));
        }
        return slice.call(ref); // ref is an array-like object (NodeList or HTMLCollection)
    }
};

/**
 * Taken from "handy-scroll": "^1.0.5",
 */
let handyScrollProto = {
    init(container) {
        let instance = this;
        let scrollBodies = dom.$$(".ti-table-controller-handy-scroll-body")
            .filter(node => node.contains(container));
        if (scrollBodies.length) {
            instance.scrollBody = scrollBodies[0];
        }
        instance.container = container;
        instance.visible = true;
        instance.initWidget();
        instance.update(); // recalculate scrollbar parameters and set its visibility
        instance.addEventHandlers();
        // Set skipSync flags to their initial values (because update() above calls syncWidget())
        instance.skipSyncContainer = instance.skipSyncWidget = false;
    },
    initWidget() {
        let instance = this;
        let widget = instance.widget = dom.doc.createElement("div");
        widget.classList.add("ti-table-controller-handy-scroll");
        let strut = dom.doc.createElement("div");
        strut.style.width = `${instance.container.scrollWidth}px`;
        widget.appendChild(strut);
        instance.container.appendChild(widget);
    },
    addEventHandlers() {
        let instance = this;
        let eventHandlers = instance.eventHandlers = [
            {
                el: instance.scrollBody || window,
                handlers: {
                    scroll() {
                        instance.checkVisibility();
                    },
                    resize() {
                        instance.update();
                    }
                }
            },
            {
                el: instance.widget,
                handlers: {
                    scroll() {
                        if (instance.visible && !instance.skipSyncContainer) {
                            instance.syncContainer();
                        }
                        // Resume widget->container syncing after the widget scrolling has finished
                        // (it might be temporally disabled by the container while syncing the widget)
                        instance.skipSyncContainer = false;
                    }
                }
            },
            {
                el: instance.container,
                handlers: {
                    scroll() {
                        if (!instance.skipSyncWidget) {
                            instance.syncWidget();
                        }
                        // Resume container->widget syncing after the container scrolling has finished
                        // (it might be temporally disabled by the widget while syncing the container)
                        instance.skipSyncWidget = false;
                    },
                    focusin() {
                        setTimeout(() => instance.syncWidget(), 0);
                    }
                }
            }
        ];
        eventHandlers.forEach(({ el, handlers }) => {
            Object.keys(handlers).forEach(event => el.addEventListener(event, handlers[event], false));
        });
    },
    checkVisibility() {
        let instance = this;
        let { widget, container, scrollBody } = instance;
        let mustHide = (widget.scrollWidth <= widget.offsetWidth);
        if (!mustHide) {
            let containerRect = container.getBoundingClientRect();
            let maxVisibleY = scrollBody
                ? scrollBody.getBoundingClientRect().bottom
                : window.innerHeight || dom.html.clientHeight;
            mustHide = ((containerRect.bottom <= maxVisibleY) || (containerRect.top > maxVisibleY));
        }
        if (instance.visible === mustHide) {
            instance.visible = !mustHide;
            // We cannot simply hide the scrollbar since its scrollLeft property will not update in that case
            widget.classList.toggle("ti-table-controller-handy-scroll-hidden");
        }
    },
    syncContainer() {
        let instance = this;
        let { scrollLeft } = instance.widget;
        if (instance.container.scrollLeft !== scrollLeft) {
            // Prevents container’s “scroll” event handler from syncing back again widget scroll position
            instance.skipSyncWidget = true;
            // Note that this makes container’s “scroll” event handlers execute
            instance.container.scrollLeft = scrollLeft;
        }
    },
    syncWidget() {
        let instance = this;
        let { scrollLeft } = instance.container;
        if (instance.widget.scrollLeft !== scrollLeft) {
            // Prevents widget’s “scroll” event handler from syncing back again container scroll position
            instance.skipSyncContainer = true;
            // Note that this makes widget’s “scroll” event handlers execute
            instance.widget.scrollLeft = scrollLeft;
        }
    },
    // Recalculate scroll width and container boundaries
    update() {
        let instance = this;
        let { widget, container, scrollBody } = instance;
        let { clientWidth, scrollWidth } = container;
        widget.style.width = `${clientWidth}px`;
        if (!scrollBody) {
            widget.style.left = `${container.getBoundingClientRect().left}px`;
        }
        widget.firstElementChild.style.width = `${scrollWidth}px`;
        // Fit widget height to the native scroll bar height if needed
        if (scrollWidth > clientWidth) {
            // hacked in our own min height because this ends up being 0 on macs
            const calculatedHeight = widget.offsetHeight - widget.clientHeight;
            widget.style.height = Math.max(calculatedHeight, 15) + 'px';
        }
        instance.syncWidget();
        instance.checkVisibility(); // fixes issue Amphiluke/floating-scroll#2
    },
    // Remove a scrollbar and all related event handlers
    destroy() {
        let instance = this;
        instance.eventHandlers.forEach(({ el, handlers }) => {
            Object.keys(handlers).forEach(event => el.removeEventListener(event, handlers[event], false));
        });
        instance.widget.parentNode.removeChild(instance.widget);
        instance.eventHandlers = instance.widget = instance.container = instance.scrollBody = null;
    }
};

let instances = []; // if it were not for IE it would be better to use WeakMap (container -> instance)
/**
 * Taken from "handy-scroll": "^1.0.5",
 */
let handyScroll = {
    /**
     * Mount widgets in the given containers
     * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
     */
    mount(containerRef) {
        dom.$$(containerRef).forEach(container => {
            if (handyScroll.mounted(container)) {
                return;
            }
            let instance = Object.create(handyScrollProto);
            instances.push(instance);
            instance.init(container);
        });
    },
    /**
     * Check if a widget is already mounted in the given container
     * @param {HTMLElement|String} containerRef - Widget container reference (either an element, or a selector)
     * @returns {Boolean}
     */
    mounted(containerRef) {
        let container = dom.$(containerRef);
        return instances.some(instance => instance.container === container);
    },
    /**
     * Update widget parameters and position
     * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
     */
    update(containerRef) {
        dom.$$(containerRef).forEach(container => {
            instances.some(instance => {
                if (instance.container === container) {
                    instance.update();
                    return true;
                }
                return false;
            });
        });
    },
    /**
     * Destroy widgets mounted in the given containers
     * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
     */
    destroy(containerRef) {
        dom.$$(containerRef).forEach(container => {
            instances.some((instance, index) => {
                if (instance.container === container) {
                    instances.splice(index, 1)[0].destroy();
                    return true;
                }
                return false;
            });
        });
    }
};

const TableController = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        // we need to know if filters are active
        this._activeFilters = {};
        this._columnFilters = [];
        // place for column widths
        this._columnElements = '';
        // all of the columns
        this._dataColumns = [];
        // only columns being displayed
        this._displayColumns = [];
        // hidden columns
        this._hiddenColumns = [];
        // for keeping track of position and correcting the sticky header position
        this._lastTop = -1;
        // sticky column scrollbar listener
        this._scrollbarListener = {
            handleEvent: () => this._stickyHeaderContainer.scrollLeft = this._renderedTableContainer.scrollLeft
        };
        this._sortHeaders = [];
        this._statusType = {
            LOADING: 'LOADING',
            READY: 'READY',
            ERROR: 'ERROR'
        };
        // place to keep permanent copy of all the data
        this._tableBodyRows = [];
        // place to keep a hold of all the original table elements
        this._tableBodyRowsElements = [];
        // place to stash the table head html
        this._tableHeadRows = [];
        // needed so that we don't have to keep cacluting this
        this._totalHeaderHeight = 0;
        /**
         * String of comma or space separated column names/ids.
         * These must match exactly with columns provided in the table.
         *
         * @type {string}
         * @memberof TableController
         */
        this.columns = '';
        /**
         * Our 'model', which we update with items to actually display.
         *
         * @memberof TableController
         */
        this.displayRows = [];
        /**
         * String of comma or space separated column names/ids that should not be displayed.
         * These columns can be used for sorting or other purposes. For example, dates
         * could have a localized formatted string for display and a utc date code or timestamp
         * for sorting. The utc or timestamp column would remain hidden.
         *
         * @type {string}
         * @memberof TableController
         */
        this.hideColumns = '';
        /**
         * Number of columns (starting from the left) that we want
         * to be sticky columns.
         */
        this.numStickyLeftColumns = 0;
        /**
         * The number of rows to display initially - also the 'view-more' increment when not in view-all mode.
         *
         * @type {number | 'all'}
         * @memberof TableController
         */
        this.pageLength = 'all';
        /**
         * Set the top position of the sticky header.
         * For cases when the table is used in conjunction with another "sticky header"
         * such as `ti-chapter-nav`, so that the table's sticky header sticks to the
         * bottom of the other sticky header.
         *
         * @type {number} Pixel offset - usually the height of another sticky header component.
         * @memberof TableController
         */
        this.stickyHeaderOffset = 0;
        /**
         * Way to turn the footer on and off
         */
        this.useFooter = false;
        /**
         * Enable or disable the sticky headers.
         * (Causes table header to stay on the screen so that, if your table is tall,
         * user will always be able to see the header that each column corresponds to.)
         */
        this.useStickyHeader = false;
        /**
         * Keep track of the status of the component so that we can render
         * a response to the user accordingly.
         *
         * @default StatusType.Loading
         */
        this.status = this._statusType.LOADING;
        this.tiMetricsAction = createEvent(this, "tiMetricsAction", 7);
    }
    handleDisplayUpdate() {
        if (this._renderedTableBody && this.displayRows.length > 0) {
            const rowsToDisplay = this.displayRows.map(item => item._id);
            const rowsWeAreShowing = Array.from(this._renderedTableBody.querySelectorAll('tr')).map(tr => tr.getAttribute("data-table-id"));
            // don't do anything if the rows are the same / same order
            if (rowsToDisplay.toString() == rowsWeAreShowing.toString()) {
                return;
            }
            // remove the table body
            this._renderedTableBody.remove();
            // create a new one
            const newBody = this._renderedTable.createTBody();
            this._renderedTableBody = newBody;
            // display the rows as per displayRows
            // NOTE: using a document fragment hepls avoid reflow for each child
            const fragment = document.createDocumentFragment();
            for (let rowNum = 0; rowNum < this.displayRows.length; rowNum++) {
                fragment.appendChild(this._tableBodyRowsElements[this.displayRows[rowNum]._id]);
            }
            this._renderedTableBody.appendChild(fragment);
        }
    }
    handlePageLengthChange(newValue, oldValue) {
        if (newValue != oldValue) { // deliberate `!=` for comparing number strings with actual numbers
            if (newValue === 'all') {
                this._rowsToShow = this._tableBodyRows.length;
            }
            else if (Number.parseInt(newValue.toString()) < 0) {
                this.pageLength = oldValue ? oldValue : 'all';
                this._rowsToShow = this._tableBodyRows.length;
            }
            else {
                this.pageLength = Number.parseInt(newValue.toString());
                this._rowsToShow = Math.max(this.pageLength, this._rowsToShow);
            }
        }
    }
    componentWillLoad() {
        // need to know if using IE
        this._styleScoped = !document.head.attachShadow;
        if (this._tableBodyRows && this._tableBodyRows.length > 0)
            return;
        if (this.status !== this._statusType.LOADING)
            return;
        if (this.hostElement.children.length === 0) {
            this.status = this._statusType.ERROR;
            return;
        }
        // find the table!
        const table = this.hostElement.querySelector('table');
        if (!table) {
            this.status = this._statusType.ERROR;
            return;
        }
        // get colgroup columns and their widths
        const colgroupElement = table.querySelector('colgroup');
        if (colgroupElement) {
            this._columnElements = colgroupElement.innerHTML;
        }
        this._dataColumns = this.columns.split(/[, ]+/);
        this._hiddenColumns = this.hideColumns.split(/[, ]+/);
        this._displayColumns = this._dataColumns.filter(column => this._hiddenColumns.indexOf(column) < 0);
        // stash the table head html
        const headRowElements = table.querySelectorAll('thead > tr');
        for (let rowNum = 0; rowNum < headRowElements.length; rowNum++) {
            const rowElement = headRowElements[rowNum];
            const cellElements = rowElement.querySelectorAll('th');
            const rowData = {
                "_id": rowNum,
                "_el": rowElement
            };
            for (let colNum = 0; colNum < cellElements.length; colNum++) {
                const columnId = this._dataColumns[colNum];
                const cellHTML = cellElements[colNum].innerHTML.trim();
                rowData[columnId] = {
                    innerHTML: cellHTML
                };
            }
            this._tableHeadRows.push(rowData);
        }
        // process the table body and stash the html and the text
        const rowElements = table.querySelectorAll('tbody > tr');
        for (let rowNum = 0; rowNum < rowElements.length; rowNum++) {
            const rowElement = rowElements[rowNum];
            const tdElements = rowElement.querySelectorAll('td');
            const rowData = {
                // keep an id that matches original row order
                "_id": rowNum
            };
            for (let colNum = 0; colNum < tdElements.length; colNum++) {
                // NOTE using textContent here because innerText is blank for some reason...
                const cellText = this._removeSpacingArtifacts(tdElements[colNum].textContent.trim());
                const cellHTML = this._removeSpacingArtifacts(tdElements[colNum].innerHTML.trim());
                const columnId = this._dataColumns[colNum];
                rowData[columnId] = { html: cellHTML, text: cellText };
            }
            // give the tr an id that we can match
            rowElement.setAttribute("data-table-id", rowNum + "");
            this._tableBodyRows.push(rowData);
            this._tableBodyRowsElements.push(rowElement);
        }
        // remove original table element
        // table.remove();
        // set the rows that will be displayed - treat invalid as 'all'
        if (this.pageLength === 'all' || Number(this.pageLength) < 1) {
            this.pageLength = 'all';
            this._rowsToShow = this._tableBodyRows.length;
        }
        else {
            // ensure pageLength is a number;
            this._rowsToShow = this.pageLength = Number(this.pageLength);
        }
        this.displayRows = this._tableBodyRows.slice(0, this._rowsToShow);
        this._renderedTable = table;
        this._renderedTableBody = table.querySelector('tbody');
        // update our status to start showing stuff
        this.status = this._statusType.READY;
    }
    componentDidLoad() {
        // grab all the sort headers to synchronize sorting
        const sortHeaders = this.hostElement.querySelectorAll('ti-column-sort-header');
        for (let i = 0; i < sortHeaders.length; i++) {
            this._sortHeaders.push(sortHeaders[i]);
        }
        // grab all filters
        const columnFilters = this.hostElement.querySelectorAll('ti-column-filter');
        for (let i = 0; i < columnFilters.length; i++) {
            this._columnFilters.push(columnFilters[i]);
        }
        this._updateStickyColumnLeftAndWidths();
        if (this.useStickyHeader && handyScroll) {
            handyScroll.mount(this._renderedTableContainer);
        }
    }
    componentDidUpdate() {
        // check for adding rows to make sure style gets set
        if (this._tableBodyRows[this._rowsToShow - 1] && this._tableBodyRows[this._rowsToShow - 1][this._displayColumns[0]].style === undefined) {
            this._updateStickyColumnLeftAndWidths();
        }
    }
    componentDidRender() {
        // update the bounds that we need to use during scroll
        // to figure out
        this._updateRenderedTableBoundMeasurements();
        if (this.useStickyHeader && handyScroll) {
            handyScroll.update(this._renderedTableContainer);
        }
        // make sure the table body is displayed
        this._fadeTableBody(false);
    }
    componentDidUnload() {
        this._renderedTableContainer.removeEventListener('scroll', this._scrollbarListener);
        handyScroll.destroy(this._renderedTableContainer);
    }
    /**
    Listening for clicks on the table for some metrics calls
    */
    onClick(event) {
        let ele;
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1) {
            // MS detected
            // not using shadow dom, can use event.target
            ele = event.target;
        }
        else {
            // for every other browser we are using shadow dom so we need composedPath
            ele = event.composedPath()[0];
        }
        // for request sample and distributor links
        if (ele.getAttribute('ti-data-change')) {
            const eventName = ele.getAttribute('ti-data-change');
            let data = {
                ti_opn: ele.getAttribute('opn'),
                ti_gpn: ele.getAttribute('gpn'),
                part_type: ele.getAttribute('part-type')
            };
            if (eventName === "buy from distributor") {
                data['distributor_name'] = ele.text;
            }
            this.tiMetricsAction.emit({
                eventName: eventName,
                elementName: this.hostElement.tagName,
                data: data
            });
        }
    }
    /**
     * Update the table measurements after the page finishes loading so that sticky header
     * shows up properly. Needed because other page content may change the table position
     * after the table has finished loading.
     */
    onLoad() {
        this._updateRenderedTableBoundMeasurements();
        this._lastTop = this.hostElement.offsetTop;
    }
    /**
     * Update the table measurements after the window is resized so that sticky header
     * shows up properly.
     */
    onResize() {
        this._checkStickyHeaderPosition();
    }
    onScroll() {
        // check if the table position has changed first - no other way to detect page content expansion
        this._checkStickyHeaderPosition();
        if (this.useStickyHeader && this._renderedTable && this._renderedTableBounds) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (this._renderedTableBounds.top <= scrollTop && this._renderedTableBounds.bottom > scrollTop + this._totalHeaderHeight) {
                this._stickyHeader.style.top = `${this.stickyHeaderOffset}px`;
                // update the sticky header location once otherwise it won't be aligned
                this._stickyHeaderContainer.scrollLeft = this._renderedTableContainer.scrollLeft;
                // update the left position of the sticky header in case window is horizontally scrolled
                const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
                this._stickyHeader.style.left = -scrollLeft + 'px';
            }
            else {
                // positioning sticky header outside of view instead of hiding
                // this fixes issues with FF resetting horizontal scroll position
                // of table when sticky header shows up
                this._stickyHeader.style.top = '-10000px';
            }
            handyScroll.update(this._renderedTableContainer);
        }
    }
    onTiColumnSortChange(event) {
        // update other sort headers
        this._sortHeaders.forEach(sortHeader => {
            if (sortHeader.sortColumn !== event.detail.sortColumn) {
                sortHeader.setSortDirectionNone();
            }
            else if (sortHeader.sortDirection !== event.detail.sortDirection) {
                // this takes care of syncing duplicate headers in the sticky and normal headers
                sortHeader.sortDirection = event.detail.sortDirection;
                // } else {
                //     // this is the active column
            }
        });
        // flag a sort direction toggle
        const sortReversal = this._lastSortEventDetail
            && this._lastSortEventDetail.sortColumn === event.detail.sortColumn
            && this._lastSortEventDetail.sortDirection !== event.detail.sortDirection;
        // stash the last sort
        this._lastSortEventDetail = event.detail;
        // perform sort after fading out the table body
        this._fadeTableBody(true).then(() => this._sort(event.detail.sortType, event.detail.sortColumn, event.detail.sortDirection, sortReversal));
        // trigger metrics action
        const metricsDetail = {
            eventName: 'sort',
            elementName: this.hostElement.tagName,
            data: event.detail
        };
        this.tiMetricsAction.emit(metricsDetail);
    }
    onTiColumnFilterChange(event) {
        const filterVal = event.detail.filterValue;
        let unchecking = false;
        if (filterVal.length > 1) {
            this._activeFilters[event.detail.filterColumn] = event.detail;
        }
        else {
            delete this._activeFilters[event.detail.filterColumn];
            unchecking = true;
        }
        // apply filtering after fading out the table body
        this._fadeTableBody(true).then(() => {
            this.displayRows = this._filterRows(this._tableBodyRows, this._activeFilters, this._rowsToShow);
            this._updateFilterOptions(event.detail.filterColumn, this.displayRows, unchecking);
        });
        // trigger metrics action
        const metricsDetail = {
            eventName: 'filter',
            elementName: this.hostElement.tagName,
            data: event.detail
        };
        this.tiMetricsAction.emit(metricsDetail);
        // scroll to top of table
        // only do that when scroll is already past top of component
        // not using this.hostElement.scrollIntoView() or similar
        // because sticky header blocks first item
        const stickyHeight = this.useStickyHeader ? this._stickyHeader.offsetHeight : 0;
        const tablePosition = this.hostElement.offsetTop - stickyHeight;
        if (window.scrollY > tablePosition) {
            window.scrollTo({
                top: tablePosition
            });
        }
    }
    /**
     * Listen to expand/collapse events of disclosure list
     */
    onTiDisclosureListChange(event) {
        const metricsDetail = {
            eventName: 'chevron click',
            elementName: this.hostElement.tagName,
            data: {
                value: event.detail.action,
                column: event.target.getAttribute('column')
            }
        };
        this.tiMetricsAction.emit(metricsDetail);
        // update the bounds we use for scroll
        this._updateRenderedTableBoundMeasurements();
    }
    /**
     * Listen to distributor region dropdown changes
     */
    onTiDistributorRegionChange(event) {
        const metricsDetail = {
            eventName: 'filter',
            elementName: this.hostElement.tagName,
            data: {
                filterColumn: "buy_from_distributors",
                filterValue: event.detail.value
            }
        };
        this.tiMetricsAction.emit(metricsDetail);
    }
    /**
     * Metrics interceptor for add-to-cart so we can emit from the source (table)
     */
    onTiMetricsAction(event) {
        // Need to target add-to-cart specifically as this will capture tiMetricsActions fired from this component as well
        if (event.detail.elementName === 'TI-ADD-TO-CART' && event.detail.eventName !== 'add to cart modal close') {
            event.stopPropagation();
            let newMetricsEvent = event.detail;
            newMetricsEvent.elementName = this.hostElement.tagName;
            this.tiMetricsAction.emit(newMetricsEvent);
        }
    }
    _arrUniqueValues(arr) {
        return arr.filter((v, i, a) => a.indexOf(v) === i);
    }
    /**
     * Check if the table's position moved due to page content or window size
     * changes and if so update the measurements for sticky header positioning.
     */
    _checkStickyHeaderPosition() {
        if (this.useStickyHeader && this._lastTop >= 0 && this._lastTop !== this.hostElement.offsetTop) {
            this._updateRenderedTableBoundMeasurements();
            this._lastTop = this.hostElement.offsetTop;
        }
    }
    _extractColumn(arr, col) {
        return arr.map(item => this._removeSpacingArtifacts(item[col].text));
    }
    /**
     * Choregraphy of style animation to fade out/in the table body before/after operations that
     * repaint the table such as sorting, filtering, etc.
     *
     * IMPORTANT! This is called for the fade-in after every render, so it is important to do nothing
     * but quick style property changes and NEVER trigger another update cycle!!!
     *
     * @param fadeOut If true fade out otherwise fade in.
     * @returns A Promise once the fade animation has been completed so that after-fade actions can be taken.
     */
    async _fadeTableBody(fadeOut) {
        if (fadeOut) {
            // hide the table body content and cell borders, and change the table cursor before sorting
            this.hostElement.style.cursor = 'wait';
            this._renderedTableBody.style.opacity = '0';
            this._renderedTableBody.style.borderColor = 'transparent';
            return new Promise(resolve => setTimeout(resolve, 150));
        }
        else {
            // restore the table body content and cell borders, and change the table cursor after sorting
            this._renderedTableBody.style.opacity = '1';
            this.hostElement.style.cursor = 'auto';
            return new Promise(resolve => setTimeout(resolve, 150)).then(
            // delay the border enable to wait for the body opacity transition which is .125s
            () => this._renderedTableBody.style.borderColor = 'inherit');
        }
    }
    _filterRows(tableBodyRows, activeFilters, itemLimit = null) {
        const newItems = [];
        tableBodyRows.forEach(item => {
            const rowMatch = !Object.keys(activeFilters).some((column) => {
                const filter = activeFilters[column];
                return !this._isFilterMatch(item[filter.filterColumn].text, filter.filterValue, filter.filterType, filter.optionDelimiter);
            });
            if (rowMatch) {
                newItems.push(item);
            }
        });
        return newItems.slice(0, (itemLimit) ? itemLimit : newItems.length);
    }
    _flattenStyle(styleObj) {
        let styles = [];
        styles = Object.keys(styleObj).map(key => {
            var hyphenated = key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
            return `${hyphenated}: ${styleObj[key]}`;
        });
        return styles.join('; ');
    }
    _highlightMatchingText(element, filter) {
        const childElements = element.children;
        if (childElements && childElements.length > 0) {
            for (let i = 0; i < childElements.length; i++) {
                this._highlightMatchingText(childElements[i], filter);
            }
        }
        else {
            const text = element.textContent;
            const matchIndex = text.toLowerCase().indexOf(filter);
            const matchLength = filter.length;
            const preMatchText = text.substr(0, matchIndex);
            const matchText = text.substr(matchIndex, matchLength);
            const postMatchText = text.substr(matchIndex + matchLength);
            const classList = `ti-table-controller-highlight${this._styleScoped ? ' sc-ti-table-controller' : ''}`; // IE hack
            const highlightedText = `${preMatchText}<span class="${classList}">${matchText}</span>${postMatchText}`;
            element.innerHTML = highlightedText;
        }
    }
    _isFilterMatch(text, filter, filterType, filterDelimiter = ",") {
        // depending on markup we need to deal with break lines,
        // tabs and duplicate spaces in the markup
        // replace first new line and tab characters with spaces
        // then dealing with dup spaces.
        // we need two separate steps for cases like the pipe character needing two spaces around it
        // but having tabs on one side and a break line on the other
        text = this._removeSpacingArtifacts(text);
        if (filter === '') {
            return true;
        }
        if (text === '') {
            return false;
        }
        if (filterType === TableControllerFilterType.exact) {
            return text === filter;
        }
        if (filterType === TableControllerFilterType.full) {
            return text.toLowerCase() === filter.toLowerCase();
        }
        if (filterType === TableControllerFilterType.partial) {
            return text.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
        }
        if (filterType === TableControllerFilterType.start) {
            return text.toLowerCase().indexOf(filter.toLowerCase()) === 0;
        }
        if (filterType === TableControllerFilterType.multi) {
            return filter.split(filterDelimiter).indexOf(text) >= 0;
        }
    }
    _objectSize(obj) {
        let size = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    }
    _removeSpacingArtifacts(term) {
        return term.replace(/[\r\n]+/g, " ").replace(/\s+/g, ' ');
    }
    /**
     *
     * @param type text or numeric
     * @param column table column used for sort
     * @param direction down or up
     * @param reversal flag to indicate that this sort is a reversal of the last sort
     */
    _sort(type, column, direction, reversal) {
        // for a reversal, if the direction is down (forward), we need to reverse the items on ties
        // otherwise, users will not see a sort direction change for a column that has the same value in every row
        const tieDirection = reversal && direction === 'down' ? -1 : 1;
        this._tableBodyRows.sort(type === 'numeric'
            ? this._sortNumeric(column, direction === 'down' ? 1 : -1, tieDirection)
            : this._sortText(column, direction === 'down' ? 1 : -1, tieDirection));
        this.displayRows = this._filterRows(this._tableBodyRows, this._activeFilters, this._rowsToShow);
        // this._techdocsMetricsHandler('Date Sort');
    }
    /**
     * This is a sort that takes the text content and tries to interpret it as a number.
     * If an item is not a number, it will lose the sort comparison in both directions.
     *
     * @param column
     * @param direction
     * @param tieDirection direction of sort in case of ties between items
     */
    _sortNumeric(column, direction, tieDirection) {
        return (a, b) => {
            // regex to filter out non-numeric stuff - this is a simplistic approach
            const nonNumeric = /[^\d.]/g;
            const bNum = Number.parseFloat(b[column].text.replace(nonNumeric, ''));
            if (Number.isNaN(bNum)) {
                return -1;
            }
            const aNum = Number.parseFloat(a[column].text.replace(nonNumeric, ''));
            if (Number.isNaN(aNum)) {
                return 1;
            }
            const factor = aNum < bNum
                ? -1
                : aNum > bNum
                    ? 1
                    : tieDirection;
            return factor * direction;
        };
    }
    /**
     * Simple alphanumeric default sorting.
     *
     * @param column
     * @param direction
     * @param tieDirection direction of sort in case of ties between items
     */
    _sortText(column, direction, tieDirection) {
        return (a, b) => {
            const factor = a[column].text < b[column].text
                ? -1
                : a[column].text > b[column].text
                    ? 1
                    : tieDirection;
            return factor * direction;
        };
    }
    /**
     *
     * @param col column where multi-select is used
     * @param results list of current results in the table
     * @param unchecking flag when the action is unchecking an option in the multi-select
     */
    _updateFilterOptions(col, results, unchecking) {
        //loops through all filters in header
        this._columnFilters.forEach(colFilter => {
            // current filter in loop
            const filter = colFilter.getAttribute('filter-column');
            // filter in loop different than filter that triggered filtering event
            // deal first with case when there's an active filter and the action is unchecking an option
            if (filter !== col && this._objectSize(this._activeFilters) === 1 && unchecking) {
                const allOptions = this._extractColumn(this._tableBodyRows, filter);
                colFilter.setEnabledOptions(this._arrUniqueValues(allOptions).join(colFilter.optionDelimiter));
                // two cases here
                // when we are looping through a filter different than the one used
                // and when it's same filter but we are unchecking an option
            }
            else if (filter !== col || (filter === col && unchecking)) {
                const availableOptions = this._extractColumn(results, filter);
                colFilter.setEnabledOptions(this._arrUniqueValues(availableOptions).join(colFilter.optionDelimiter));
            }
        });
    }
    _updateRenderedTableBoundMeasurements() {
        if (this.useStickyHeader && this._renderedTable) {
            // getBoundingClientRect is kind of expensive.
            // don't want to do this too often, so only calculating here
            const bodyRect = document.body.getBoundingClientRect(), elemRect = this._renderedTable.getBoundingClientRect(), offset = {
                top: elemRect.top - bodyRect.top - this.stickyHeaderOffset,
                left: elemRect.left,
                bottom: elemRect.top - bodyRect.top + elemRect.height,
                right: elemRect.right,
                height: elemRect.height,
                width: elemRect.width,
            };
            this._renderedTableBounds = offset;
        }
    }
    /**
     * After initial render, we wait a bit and then run this method to
     * update `this._tableBodyRows` and `this._columnMeasurements` with
     * all the styles + measurements we need for each cell.
     * (Otherwise, the sticky column doesn't work.)
     */
    _updateStickyColumnLeftAndWidths() {
        if (!this._renderedTable)
            return;
        if (this.numStickyLeftColumns === 0)
            return;
        // remember the left and width for header items
        const ths = this._renderedTable.querySelectorAll(`thead > tr:nth-child(1) > th`);
        let containerMarginLeft = 0;
        let left = 0;
        for (let i = 0; i < ths.length; i++) {
            const column = this._dataColumns[i];
            if (this._hiddenColumns.indexOf(column) > -1) {
                continue;
            }
            const width = ths[i].clientWidth;
            this._tableHeadRows[0][column].style = {
                minWidth: width + "px",
                maxWidth: width + "px",
                height: ths[i].offsetHeight + 4 + "px" //need offset height to account for border to prevent gap
            };
            if (i < this.numStickyLeftColumns) {
                this._tableHeadRows[0][column].class = "ti-table-controller-sticky-cell";
                this._tableHeadRows[0][column].style.position = "absolute";
                this._tableHeadRows[0][column].style.left = left + "px";
                containerMarginLeft += width;
            }
            else if (this.numStickyLeftColumns > 0 && i === this.numStickyLeftColumns) {
                // left-most column that is not sticky - extra left padding because of shadow
                this._tableHeadRows[0][column].style.paddingLeft = '1.2rem';
            }
            left += width;
        }
        // record header height that we have now
        this._totalHeaderHeight = parseInt(this._tableHeadRows[0][this._displayColumns[0]].style.height);
        // header width needs to be used for maxWidth of sticky header container
        if (this._tableHeadRows.length > 1) {
            for (let i = 1; i < this._tableHeadRows.length; i++) {
                const firstTh = this._renderedTable.querySelector(`thead > tr:nth-child(${i + 1}) > th`);
                const height = firstTh.offsetHeight + 1;
                // update the total header height so that we can use this for our bounds when
                // the user scrolls
                this._totalHeaderHeight += height;
                for (let j = 0; j < this._displayColumns.length; j++) {
                    const column = this._dataColumns[j];
                    if (this._hiddenColumns.indexOf(column) > -1) {
                        continue;
                    }
                    const width = this._tableHeadRows[0][column].style.minWidth;
                    this._tableHeadRows[i][column].style = {
                        minWidth: width,
                        maxWidth: width,
                        height: height + "px"
                    };
                    if (j < this.numStickyLeftColumns) {
                        this._tableHeadRows[i][column].class = "ti-table-controller-sticky-cell";
                        this._tableHeadRows[i][column].style.left = this._tableHeadRows[0][column].style.left;
                        this._tableHeadRows[i][column].style.position = "absolute";
                    }
                    else if (this.numStickyLeftColumns > 0 && j === this.numStickyLeftColumns) {
                        // left-most column that is not sticky - extra left padding because of shadow
                        this._tableHeadRows[i][column].style.paddingLeft = this._tableHeadRows[0][column].style.paddingLeft;
                    }
                }
            }
        }
        // we just need the widths for the first column and the height of the cells in the first column
        // then we can just populate everything from there.
        for (let i = 0; i < this.displayRows.length; i++) {
            const firstTdInRow = this._renderedTable.querySelector(`tbody > tr:nth-child(${i + 1}) > td`);
            const height = firstTdInRow.offsetHeight + 3 + "px";
            for (let j = 0; j < this._displayColumns.length; j++) {
                const column = this._displayColumns[j];
                // add a new "style" prop to the column data
                this._tableBodyRows[i][column].style = {
                    minWidth: this._tableHeadRows[0][column].style.minWidth,
                    // IE needs maxWidth to prevent column jitter during sort
                    maxWidth: this._tableHeadRows[0][column].style.maxWidth,
                    height: height
                };
                if (j < this.numStickyLeftColumns) {
                    this._tableBodyRows[i][column].style.left = this._tableHeadRows[0][column].style.left;
                    this._tableBodyRows[i][column].style.position = "absolute";
                }
                else if (this.numStickyLeftColumns > 0 && j === this.numStickyLeftColumns) {
                    // left-most column that is not sticky - extra left padding because of shadow
                    this._tableBodyRows[i][column].style.paddingLeft = this._tableHeadRows[0][column].style.paddingLeft;
                }
            }
        }
        if (this._renderedTable && this.useStickyHeader) {
            this._renderedTableContainer.addEventListener('scroll', this._scrollbarListener);
        }
        // TODO: limit the number of rows that we're showing if this._rowsToShow is set
        // renderedTableContainerStyles is a state, so updating will force rerender
        // need to set height so ::before element can inherit the correct height
        this.renderedTableContainerStyles = {
            marginLeft: containerMarginLeft - 1 + "px",
        };
    }
    _updateTableBody() {
        const rowElements = this._tableBodyRowsElements;
        // update the rows based on the rows we're supposed to display
        for (let rowNum = 0; rowNum < this.displayRows.length; rowNum++) {
            // use the internal id for the row to access the right _tableBodyRowsElements
            // because that was the original order and is the original measurement
            const rowId = this.displayRows[rowNum]._id;
            const rowElement = rowElements[rowId];
            const tdElements = rowElement.querySelectorAll('td');
            for (let colNum = 0; colNum < tdElements.length; colNum++) {
                const column = this._dataColumns[colNum];
                const tdElement = tdElements[colNum];
                if (this._activeFilters[column] && this._activeFilters[column].highlightMatch) {
                    this._highlightMatchingText(tdElement, this._activeFilters[column].filterValue);
                }
                if (this._hiddenColumns.indexOf(column) > -1) {
                    tdElement.setAttribute('style', `display: none;`);
                }
                else {
                    // _tableBodyRows already matches displayRows,
                    // so we just use rowNum here instead of rowId
                    const styles = this._tableBodyRows[rowNum][column].style;
                    if (styles) {
                        tdElement.setAttribute('style', this._flattenStyle(styles));
                    }
                }
            }
        }
    }
    _updateTableHeadStyles() {
        for (let i = 0; i < this._tableHeadRows.length; i++) {
            const headerCells = this._tableHeadRows[i]._el.querySelectorAll(`th`);
            for (let j = 0; j < headerCells.length; j++) {
                const column = this._dataColumns[j];
                const th = headerCells[j];
                if (this._hiddenColumns.indexOf(column) > -1) {
                    th.setAttribute('style', `display: none;`);
                }
                else if (this.numStickyLeftColumns > 0 && j <= this.numStickyLeftColumns) {
                    const styles = this._tableHeadRows[i][column].style;
                    if (styles) {
                        th.setAttribute('style', this._flattenStyle(styles));
                    }
                    if (j < this.numStickyLeftColumns) {
                        th.setAttribute('class', "ti-table-controller-sticky-cell");
                    }
                }
            }
        }
    }
    _viewMore() {
        const numRows = (this.pageLength === 'all')
            ? this._tableBodyRows.length
            : Math.min(this._tableBodyRows.length, this._rowsToShow + Number.parseInt(this.pageLength.toString()));
        if (numRows > this._rowsToShow) {
            this._rowsToShow = numRows;
            // update content after fading out the table body
            this._fadeTableBody(true).then(() => this.displayRows = this._filterRows(this._tableBodyRows, this._rowsToShow));
        }
    }
    render() {
        if (this._renderedTable && this.numStickyLeftColumns > 0) {
            this._updateTableHeadStyles();
            this._updateTableBody();
        }
        return (h(Host, { class: {
                'ti-table-controller-empty': this.displayRows.length === 0,
                'ti-table-controller-all': this._rowsToShow === this._tableBodyRows.length || this.displayRows.length === 0 || this.displayRows.length < this._rowsToShow
            } }, (this.useStickyHeader) &&
            h("div", { ref: (el) => this._stickyHeader = el, class: "ti-table-controller-sticky-header", style: { width: "100%", height: this._totalHeaderHeight + "px" } }, h("div", { class: 'ti-table-controller-sticky-header-shadow-left', style: Object.assign(Object.assign({}, this.renderedTableContainerStyles), { height: this._totalHeaderHeight + 'px' }) }), h("div", { class: 'ti-table-controller-sticky-header-shadow-right', style: { height: this._totalHeaderHeight + 'px' } }), h("div", { ref: (el) => this._stickyHeaderContainer = el, class: { 'ti-table-controller-sticky': this.numStickyLeftColumns > 0 }, style: Object.assign({}, this.renderedTableContainerStyles) }, h("table", null, this._columnElements.length > 0 &&
                h("colgroup", { innerHTML: this._columnElements }), h("thead", null, this._tableHeadRows.map(row => h("tr", null, this._displayColumns.map(column => {
                return h("th", Object.assign({}, row[column]));
            }))))))), h("div", { ref: (el) => this._renderedTableContainer = el, class: {
                'ti-table-controller-scroll-container': true,
                'ti-table-controller-sticky': this.numStickyLeftColumns > 0
            }, style: Object.assign({}, this.renderedTableContainerStyles) }, h("div", { class: 'ti-table-controller-sticky-header-shadow-left', style: { height: this._totalHeaderHeight + 'px' } }), h("div", { class: 'ti-table-controller-sticky-header-shadow-right', style: { height: this._totalHeaderHeight + 'px' } }), h("slot", null)), this.useFooter && this._tableBodyRows && this._tableBodyRows.length > this._rowsToShow &&
            h("div", { class: "ti-table-controller-footer" }, h("div", { class: "ti-table-controller-error" }, h("slot", { name: "error-message" })), h("button", { class: "ti-table-controller-results-button", type: "button", onClick: () => this._viewMore() }, h("slot", { name: "show-all-label" }), h("ti-svg-icon", { "icon-set": "objects", size: "s", appearance: "secondary" }, "chevron-down")))));
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "displayRows": ["handleDisplayUpdate"],
        "pageLength": ["handlePageLengthChange"]
    }; }
    static get style() { return "\@charset \"UTF-8\";\n/*\n* ==========================================================================\n* _polaris.colors.scss\n* This file imports the Polaris color palette.\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* color palette\n* --------------------------------------------------------------------------\n*/\n/*\n* ==========================================================================\n* _polaris.mixins.scss\n* This file contains Polaris mixins\n* prefix with mix-\n* ==========================================================================\n*/\n/*\n* ==========================================================================\n* _polaris-variables.scss\n* This file contains global-css variables and is using component based naming.\n*\n* Naming structure: [application(namespacing)]-[type]-[function]-[property]\n* ==========================================================================\n*/\n/*\n* --------------------------------------------------------------------------\n* Color variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris Component color definitions\n*/\n/*\n* Polaris Card Background color definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.03-background-color)\n*/\n/*\n* --------------------------------------------------------------------------\n* shape variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Polaris border radius definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.05-border-radius)\n*/\n/*\n* Polaris box shadow definitions\n* Ref: (http://polaris/01-ui-style-foundations.html#02-style-principles.06-box-shadow)\n*/\n/*\n* --------------------------------------------------------------------------\n* font variables\n* Ref: (http://polaris/01-ui-style-foundations.html#07-typography-fundamentals)\n* --------------------------------------------------------------------------\n*/\n/*\n* Font stack definitions\n*/\n/*\n* Font families\n*/\n/*\n* Root HTML and BODY tag values\n*/\n/*\n* Font size cadence values\n*/\n/*\n* Standard Paragraph font sizes\n*/\n/*\n* Header tag font sizes\n*/\n/*\n* Line height cadence values\n*/\n/*\n* Font weight values\n*/\n/*\n* --------------------------------------------------------------------------\n* spacing values variables\n* --------------------------------------------------------------------------\n*/\n/*\n* Base spacing cadence values\n* (base grid size x multiplier) / root font size = rem value\n*/\n/*\n* Component/element specific spacing\n*/\n/*\n* --------------------------------------------------------------------------\n* page layout variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* animation variables\n* ref: (http://polaris/01-ui-style-foundations.html#04-motion)\n* --------------------------------------------------------------------------\n*/\n/*\n* Animation easing types\n*/\n/*\n* Animation timings\n*/\n/*\n* --------------------------------------------------------------------------\n* icon size variables\n* --------------------------------------------------------------------------\n*/\n/*\n* --------------------------------------------------------------------------\n* legacy variable names\n* - May still be used in other component repos\n* --------------------------------------------------------------------------\n*/\n/* Font variables */\n/* Space size variables */\n/*\n* ==========================================================================\n* _ti-core.scss\n*\n*  This files contains mixins uses within TI Webcomponents\n* ==========================================================================\n*/\n/*\n * Base style for trigger element\n */\n/*\n* Tooltip trigger main mixin.\n* Use to add style to trigger tooltip display.\n* For example:\n*\n* .tooltip-trigger:hover {\n*     \@include ti-tooltip-trigger();\n* }\n*\n* Typically not used directly, but via the other mixins below.\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* an element selector on hover, focus and checked.\n* For example:\n*\n* .tooltip-trigger {\n     \@include ti-tooltip-trigger-element();\n* }\n*/\n/*\n* Mixin for adding style to trigger tooltip display to\n* a web component shadow host on hover, focus and checked.\n* Use in the web component style sheet outside of :host{}.\n* For example:\n*\n* \@include ti-tooltip-trigger-host();\n* :host {\n*     ...\n* }\n*\n* The optional $selector parameter allows a CSS selector\n* which will be added to the :host selector to allow control\n* over the host trigger via a style class or another selector.\n* For example:\n*\n* \@include ti-tooltip-trigger-host(\'.ti-tooltip-trigger\');\n*\n* creates code like\n*\n* :host(.ti-tooltip-trigger:hover) {\n*     ...\n* }\n*\n* instead of\n*\n* :host(:hover) {\n*     ...\n* }\n*/\n:root ti-table-controller {\n  display: block;\n  border-top: 1px solid #cccccc;\n  border-bottom: 1px solid #cccccc;\n  /* Table Sticky Styling */\n  /* Sticky Cell Styling */\n}\n:root ti-table-controller th, :root ti-table-controller td {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:root ti-table-controller table {\n  border: 0px none #e8e8e8;\n  border-collapse: collapse;\n  width: 100%;\n}\n:root ti-table-controller table a {\n  color: #007c8c;\n  text-decoration: none;\n}\n:root ti-table-controller table a:hover {\n  text-decoration: underline;\n}\n:root ti-table-controller table thead {\n  background-color: #f9f9f9;\n}\n:root ti-table-controller table thead th {\n  border: 0;\n  vertical-align: top;\n  padding: 0 0.75rem;\n  font-weight: 400;\n  color: #333333;\n  font-size: 14px;\n  word-break: keep-all;\n}\n:root ti-table-controller table thead th span, :root ti-table-controller table thead th .ti-table-controller-header-label {\n  clear: both;\n}\n:root ti-table-controller table thead th .ti-table-controller-header-label {\n  padding: 0 0 0.75rem;\n  font-weight: 300;\n}\n:root ti-table-controller table thead th .ti-table-controller-header-sort {\n  cursor: pointer;\n}\n:root ti-table-controller table thead th ti-column-sort-icon {\n  margin-left: 6px;\n}\n:root ti-table-controller table thead tr:first-child th {\n  padding-top: 0.75rem;\n}\n:root ti-table-controller table thead tr:last-child th {\n  padding-bottom: 0.75rem;\n}\n:root ti-table-controller table thead th, :root ti-table-controller table thead td, :root ti-table-controller table tbody th, :root ti-table-controller table tbody td {\n  text-align: left;\n}\n:root ti-table-controller table thead th:first-child, :root ti-table-controller table thead td:first-child, :root ti-table-controller table tbody th:first-child, :root ti-table-controller table tbody td:first-child {\n  width: 21px;\n}\n:root ti-table-controller table thead th.ti-table-controller-cell-nowrap, :root ti-table-controller table thead td.ti-table-controller-cell-nowrap, :root ti-table-controller table tbody th.ti-table-controller-cell-nowrap, :root ti-table-controller table tbody td.ti-table-controller-cell-nowrap {\n  white-space: nowrap;\n}\n:root ti-table-controller table thead td, :root ti-table-controller table tbody td {\n  border-width: 0px;\n  border-style: none;\n  color: #555555;\n  vertical-align: top;\n  padding: 0.75rem;\n}\n:root ti-table-controller table thead td .ti-table-controller-highlight, :root ti-table-controller table tbody td .ti-table-controller-highlight {\n  color: #333333;\n  background-color: #e8e8e8;\n}\n:root ti-table-controller table tbody, :root ti-table-controller table tbody > tr, :root ti-table-controller table tbody > tr > td {\n  border-color: inherit;\n  opacity: inherit;\n  -webkit-transition: opacity 0.125s;\n  transition: opacity 0.125s;\n}\n:root ti-table-controller .ti-table-controller-sticky {\n  overflow: hidden;\n}\n:root ti-table-controller .ti-table-controller-sticky-header-shadow-left,\n:root ti-table-controller .ti-table-controller-sticky-header-shadow-right {\n  background: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0.1)), color-stop(79%, rgba(0, 0, 0, 0)));\n  background: linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 79%);\n  position: absolute;\n  width: 9px;\n  z-index: 2;\n}\n:root ti-table-controller .ti-table-controller-sticky-header-shadow-right {\n  background: -webkit-gradient(linear, right top, left top, from(rgba(0, 0, 0, 0.1)), color-stop(79%, rgba(0, 0, 0, 0)));\n  background: linear-gradient(270deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 79%);\n  right: 0;\n}\n:root ti-table-controller .ti-table-controller-scroll-container thead .ti-table-controller-sticky-cell,\n:root ti-table-controller .ti-table-controller-sticky-header thead .ti-table-controller-sticky-cell {\n  background-color: #f9f9f9;\n}\n:root ti-table-controller .ti-table-controller-scroll-container thead th:first-child,\n:root ti-table-controller .ti-table-controller-sticky-header thead th:first-child {\n  padding-left: 1.5rem;\n}\n:root ti-table-controller .ti-table-controller-scroll-container tbody tr > td,\n:root ti-table-controller .ti-table-controller-sticky-header tbody tr > td {\n  border-top-width: 1px;\n  border-top-style: solid;\n}\n:root ti-table-controller .ti-table-controller-scroll-container tbody tr > td:first-child,\n:root ti-table-controller .ti-table-controller-sticky-header tbody tr > td:first-child {\n  padding-left: 1.5rem;\n}\n:root ti-table-controller .ti-table-controller-scroll-container {\n  overflow-x: auto;\n  overflow-y: visible;\n  padding: 0;\n}\n:root ti-table-controller .ti-table-controller-scroll-container.ti-table-controller-sticky {\n  -webkit-box-shadow: inset 5px 0 5px rgba(0, 0, 0, 0.1), inset -5px 0 5px rgba(0, 0, 0, 0.1);\n  box-shadow: inset 5px 0 5px rgba(0, 0, 0, 0.1), inset -5px 0 5px rgba(0, 0, 0, 0.1);\n}\n:root ti-table-controller .ti-table-controller-sticky-header {\n  overflow: hidden;\n  z-index: 102;\n  position: fixed;\n  top: -10000px;\n  left: 0;\n  border-top: 1px solid #cccccc;\n  border-bottom: 1px solid #e8e8e8;\n}\n:root ti-table-controller .ti-table-controller-footer .ti-table-controller-results-button {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-align: center;\n  align-items: center;\n  width: 100%;\n  padding: 0.75rem 0;\n  background: #f9f9f9;\n  color: #007c8c;\n  font-size: 14px;\n  border: 1px solid #cccccc;\n  white-space: nowrap;\n  line-height: 18px;\n  cursor: pointer;\n}\n:root ti-table-controller .ti-table-controller-footer .ti-table-controller-results-button ti-svg-icon {\n  margin-left: 0.25rem;\n}\n:root ti-table-controller .ti-table-controller-footer .ti-table-controller-error {\n  display: none;\n  min-height: 60px;\n  width: 100%;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll {\n  bottom: 0;\n  min-height: 17px;\n  overflow: auto;\n  position: fixed;\n  background-color: #e8e8e8;\n  z-index: 1;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll:before, :root ti-table-controller .ti-table-controller-handy-scroll:after {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll::-webkit-scrollbar {\n  width: 10px;\n  background-color: #f5f5f5;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll::-webkit-scrollbar-thumb {\n  background-color: #cccccc;\n  border: 1px solid #999999;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll::-webkit-scrollbar-track {\n  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);\n  background-color: #f5f5f5;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll div {\n  height: 1px;\n  overflow: hidden;\n  pointer-events: none;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll div:before {\n  content: \" \";\n}\n:root ti-table-controller .ti-table-controller-handy-scroll, :root ti-table-controller .ti-table-controller-handy-scroll div {\n  font-size: 1px;\n  line-height: 0;\n  margin: 0;\n  padding: 0;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-hidden {\n  bottom: 9999px;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-hidden div:before {\n  content: \"  \";\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-viewport {\n  position: relative;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-body {\n  overflow: auto;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-viewport :root ti-table-controller .ti-table-controller-handy-scroll {\n  left: 0;\n  position: absolute;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-hoverable :root ti-table-controller .ti-table-controller-handy-scroll {\n  opacity: 0;\n  -webkit-transition: opacity 0.5s ease 0.3s;\n  transition: opacity 0.5s ease 0.3s;\n}\n:root ti-table-controller .ti-table-controller-handy-scroll-hoverable:hover :root ti-table-controller .ti-table-controller-handy-scroll {\n  opacity: 1;\n}\n\n:host(.ti-table-controller-empty) table {\n  border-bottom: 1px solid #cccccc;\n}\n:host(.ti-table-controller-empty) .ti-table-controller-error {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\n:host(.ti-table-controller-all) .ti-table-controller-results-button {\n  display: none !important;\n}"; }
};

export { TableController as ti_table_controller };

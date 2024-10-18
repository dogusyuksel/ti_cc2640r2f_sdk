import { r as registerInstance, d as createEvent, h, c as getElement } from './core-800e68f4.js';

const ColumnFilter = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * Property to get selectable options in filter.
         * If empty it means all options should be enabled
         * Many values, separated by comma, indicate the values available for selection.
         * Mostly for multi-select
         *
         * @type {string}
         * @memberof ColumnFilter
         */
        this.enabledOptions = '';
        /**
         * The name of the event that will be emitted from an element added to the
         * host element, which will trigger the firing of the `tiColumnFilterChange` event.
         * The default event name is `tiChange`.
         *
         * @type {string}
         * @memberof ColumnFilter
         */
        this.eventName = 'tiChange';
        /**
         * Type of filter. Any string that is supported as a sort type can be used.
         * The default is 'partial' which is supported by `ti-table-controller`.
         *
         * @type {string}
         * @memberof ColumnFilter
         */
        this.filterType = 'partial';
        /**
         * Whether or not the filter text should be highlighted in the matching item.
         * Default is false;
         *
         * @type {boolean}
         * @memberof ColumnFilter
         */
        this.highlightMatch = false;
        /**
         * Way to get the option delimiter of the child multi-select
         */
        this.optionDelimiter = ",";
        /**
         * The name of the property that is the filter change value. Used in conjunction with
         * `eventName` to determine the filter change event value, by checking first the event
         * detail object for a property with this name, and if that is undefined then the
         * event object. The default is 'value`.
         *
         * @type {string}
         * @memberof ColumnFilter
         */
        this.valueProperty = 'value';
        this.tiColumnFilterChange = createEvent(this, "tiColumnFilterChange", 7);
    }
    enabledOptionsHandler(newVal) {
        this._multiSelect.setEnabledOptions(newVal);
    }
    async setEnabledOptions(options) {
        if (options !== undefined) {
            this.enabledOptions = options;
        }
    }
    componentDidLoad() {
        // we add the listener here instead of using @Listen() because we can't use
        // the eventName property with @Listen()
        this.hostElement.addEventListener(this.eventName, (event) => this._onEvent(event));
        // grab all multi-select elements
        if (this.filterType === 'multi') {
            this._multiSelect = this.hostElement.querySelector('ti-multi-select');
            this.optionDelimiter = this._multiSelect.optionDelimiter;
        }
    }
    _onEvent(event) {
        // check for the property in the detail or the event
        // don't use truthiness in case the value is an empty string
        let eventValue;
        if (event.detail[this.valueProperty] !== undefined) {
            eventValue = event.detail[this.valueProperty];
        }
        else {
            eventValue = event[this.valueProperty];
        }
        // fire the event to notify the table
        if (eventValue !== undefined) {
            this.filterValue = eventValue;
            const detail = Object.assign(Object.assign({}, event.detail), { filterColumn: this.filterColumn, filterType: this.filterType, filterValue: this.filterValue, optionDelimiter: this.optionDelimiter, highlightMatch: this.highlightMatch });
            this.tiColumnFilterChange.emit(detail);
        }
    }
    render() {
        return h("slot", null);
    }
    get hostElement() { return getElement(this); }
    static get watchers() { return {
        "enabledOptions": ["enabledOptionsHandler"]
    }; }
};

export { ColumnFilter as ti_column_filter };

import { TiWidgetBase } from './ti-widget-base'; //^ti-widget-base\ti-widget-base-intermediate-value.tsx,30^
/**
 * `TiWidgetBaseIntermediateValue` provides the base implementation for elements that have a boolean
 * attribute "intermediateChanges" that can be used to control if immediate changes to a widget are
 * reflected in the value attribute, or if the value attribute is only updated after changes have been
 * committed by user action.
 */
export class TiWidgetBaseIntermediateValue extends TiWidgetBase {
    constructor(parent) {
        super(parent); //^ti-widget-base\ti-widget-base-intermediate-value.tsx,42^
        this.parent = parent;
    } //^ti-widget-base\ti-widget-base-intermediate-value.tsx,43^
    onIntermediateValueChanged(newValue, commit) {
        if (this.parent.intermediateChanges && (this.intermediateValue !== newValue)) { //^ti-widget-base\ti-widget-base-intermediate-value.tsx,49^
            const oldValue = this.intermediateValue; //^ti-widget-base\ti-widget-base-intermediate-value.tsx,50^
            this.intermediateValue = newValue; //^ti-widget-base\ti-widget-base-intermediate-value.tsx,51^
            this.onValueChanged(newValue, oldValue); //^ti-widget-base\ti-widget-base-intermediate-value.tsx,52^
        }
        else if (commit && newValue !== this.value) { //^ti-widget-base\ti-widget-base-intermediate-value.tsx,54^
            this.onValueChanged(newValue, this.value); //^ti-widget-base\ti-widget-base-intermediate-value.tsx,55^
        } //^ti-widget-base\ti-widget-base-intermediate-value.tsx,56^
    } //^ti-widget-base\ti-widget-base-intermediate-value.tsx,57^
} //^ti-widget-base\ti-widget-base-intermediate-value.tsx,58^

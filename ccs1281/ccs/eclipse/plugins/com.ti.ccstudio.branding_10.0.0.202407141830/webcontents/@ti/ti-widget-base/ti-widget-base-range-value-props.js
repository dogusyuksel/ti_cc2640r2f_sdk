var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { TiWidgetBaseIntermediateValueProps } from './ti-widget-base-intermediate-value-props';
/**
 * `TiWidgetBaseRangeValue` is a mixin that provides minimum and maximum value ranges.
 * Only applicable to subclasses of TiWidgetBaseValue.
 */
export class TiWidgetBaseRangeValueProps extends TiWidgetBaseIntermediateValueProps {
    constructor() {
        super(...arguments);
        /**
         * The value.
         * @order 20
         */
        this.value = 0;
        /**
         * Provides a minimum value.
         * @order 21
         */
        this.minValue = 0;
        /**
         * Provides a maximum value.
         * @order 22
         */
        this.maxValue = 100;
    }
}
__decorate([
    Prop({ mutable: true })
], TiWidgetBaseRangeValueProps.prototype, "value", void 0);
__decorate([
    Prop({ mutable: true })
], TiWidgetBaseRangeValueProps.prototype, "minValue", void 0);
__decorate([
    Prop({ mutable: true })
], TiWidgetBaseRangeValueProps.prototype, "maxValue", void 0);

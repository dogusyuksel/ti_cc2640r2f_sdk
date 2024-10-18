var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { TiWidgetBaseProps } from './ti-widget-base-props';
export class TiWidgetBaseIntermediateValueProps extends TiWidgetBaseProps {
    constructor() {
        super(...arguments);
        /**
         * Controls whether or not intermediate changes due to the user's mouse dragging or typing are committed
         * to the value attribute. If intermediate changes are not allowed, then the value attribute will only
         * update when the user has finished dragging or entering text.
         * @order 10
         */
        this.intermediateChanges = false;
    }
}
__decorate([
    Prop({ mutable: true })
], TiWidgetBaseIntermediateValueProps.prototype, "intermediateChanges", void 0);

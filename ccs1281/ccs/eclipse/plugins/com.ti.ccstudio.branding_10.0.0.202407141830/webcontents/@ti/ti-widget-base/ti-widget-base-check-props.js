var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { TiWidgetBaseProps } from './ti-widget-base-props';
export class TiWidgetBaseCheckProps extends TiWidgetBaseProps {
    constructor() {
        super(...arguments);
        /**
         * If true, the widget is checked.
         * @order 2
         */
        this.checked = false;
        /**
         * Provides label text to display
         * @order 3
         */
        this.label = 'Check';
    }
}
__decorate([
    Prop({ reflect: true })
], TiWidgetBaseCheckProps.prototype, "checked", void 0);
__decorate([
    Event({ eventName: 'checked-changed' })
], TiWidgetBaseCheckProps.prototype, "checkedChanged", void 0);
__decorate([
    Prop({ reflect: true })
], TiWidgetBaseCheckProps.prototype, "label", void 0);
__decorate([
    Prop({ reflect: true })
], TiWidgetBaseCheckProps.prototype, "labelWhenChecked", void 0);

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { TiElementBaseProps } from '../ti-element-base/ti-element-base-props';
export class TiWidgetBaseProps extends TiElementBaseProps {
    constructor() {
        super(...arguments);
        /**
         * Controls the tooltip that is displayed for this widget.
         * @order 210
         */
        this.tooltip = '';
    }
    /**
     * Sets the CSS property.
     *
     * @param {string} name the element style name
     * @param {string} value the new CSS property to be set
     */
    async setCSSProperty(name, value) {
        return this['base'][`${this.setCSSProperty.name}`](name, value);
    }
    /**
     * Returns the value of a CSS property.
     *
     * @param {string} name the element style property
     * @returns {string} the value of the property
     */
    async getCSSProperty(name) {
        return this['base'][`${this.getCSSProperty.name}`](name);
    }
    /**
     * Refresh the element.
     */
    async refresh() {
        return this['base'][`${this.refresh.name}`]();
    }
    /**
     * Fire an widget event.
     *
     * @param {string} eventName the event name, in dash notation
     * @param detail the event detail
     */
    async fire(eventName, detail) {
        return this['base'][`${this.fire.name}`](eventName, detail);
    }
}
__decorate([
    Element()
], TiWidgetBaseProps.prototype, "el", void 0);
__decorate([
    Event({ eventName: 'css-property-changed' })
], TiWidgetBaseProps.prototype, "cssPropertyChanged", void 0);
__decorate([
    Prop()
], TiWidgetBaseProps.prototype, "tooltip", void 0);
__decorate([
    Method()
], TiWidgetBaseProps.prototype, "setCSSProperty", null);
__decorate([
    Method()
], TiWidgetBaseProps.prototype, "getCSSProperty", null);
__decorate([
    Method()
], TiWidgetBaseProps.prototype, "refresh", null);
__decorate([
    Method()
], TiWidgetBaseProps.prototype, "fire", null);

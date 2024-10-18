var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
export class TiCodecBaseProps {
    constructor() {
        /**
         * A flag indicating that this model, transport, or codec is not necessary for connecting
         * to the target, and any failure should not prevent connection.
         *
         * @type {boolean}
         * @order 77
         */
        this.optional = false; //^ti-target-configuration\ti-codec-base-props.tsx,40^
        /**
         * The optional identifier of a target device that is associated with this model, transport or codec.
         * Specifying a target device idicates that this is necessary and/or optional for this connecting
         * to the specified device.  The absence of a target device indicates this is necessary and/or optional
         * for any device.
         *
         * @type {string}
         * @order 80
         */
        this.deviceId = undefined; //^ti-target-configuration\ti-codec-base-props.tsx,51^
    }
}
__decorate([
    Prop()
], TiCodecBaseProps.prototype, "optional", void 0);
__decorate([
    Prop()
], TiCodecBaseProps.prototype, "deviceId", void 0);
__decorate([
    Element()
], TiCodecBaseProps.prototype, "el", void 0);
; //^ti-target-configuration\ti-codec-base-props.tsx,54^

/**
 *  Copyright (c) 2019-2020, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  *   Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *  *   Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { h } from "@stencil/core"; //^ti-widget-base\ti-widget-base.tsx,29^
import { TiUtils } from '../ti-core-assets/lib/TiUtils'; //^ti-widget-base\ti-widget-base.tsx,30^
import { TiElementBase } from '../ti-element-base/ti-element-base'; //^ti-widget-base\ti-widget-base.tsx,31^
/**
 * `TiWidgetBase` provides the base implementation for TI widgets.
 */
export class TiWidgetBase extends TiElementBase {
    constructor(parent) {
        super(parent); //^ti-widget-base\ti-widget-base.tsx,44^
        this.parent = parent;
    } //^ti-widget-base\ti-widget-base.tsx,45^
    /* Widget that response to CSS property change should override this method to re-render */
    onCSSPropertyChanged(name, value) { }
    ; //^ti-widget-base\ti-widget-base.tsx,48^
    renderInfoText(infoText) {
        if (infoText) { //^ti-widget-base\ti-widget-base.tsx,51^
            // JSXON
            return (h("div", { class: "help-text icon" },
                h("ti-widget-tooltip", { text: infoText },
                    h("ti-widget-icon", { appearance: "secondary", icon: "help", size: "s" }))));
            // JSXOFF
        }
        else { //^ti-widget-base\ti-widget-base.tsx,61^
            return null; //^ti-widget-base\ti-widget-base.tsx,62^
        } //^ti-widget-base\ti-widget-base.tsx,63^
    } //^ti-widget-base\ti-widget-base.tsx,64^
    render(element, options) {
        if (options && (options.caption || options.infoText)) { //^ti-widget-base\ti-widget-base.tsx,67^
            // JSXON
            return (h("div", { class: "root-container", onClick: (e) => this.onClickHandler(e, e.target) },
                (options === null || options === void 0 ? void 0 : options.caption) ? h("div", { class: "header-container top" },
                    (options === null || options === void 0 ? void 0 : options.caption) ? h("div", { class: "caption" }, options.caption) : null,
                    this.renderInfoText(options === null || options === void 0 ? void 0 : options.infoText)) : null,
                this.parent.tooltip ? (h("div", { id: "elementWrapper" },
                    element,
                    h("ti-widget-tooltip", { class: "tooltip", text: this.parent.tooltip, anchorId: "elementWrapper" }))) : h("div", { id: "elementWrapper" }, element),
                (options === null || options === void 0 ? void 0 : options.infoText) && !(options === null || options === void 0 ? void 0 : options.caption) ? h("div", { class: "header-container side" }, this.renderInfoText(options === null || options === void 0 ? void 0 : options.infoText)) : null));
            // JSXOFF
        }
        else { //^ti-widget-base\ti-widget-base.tsx,86^
            // JSXON
            return (h("div", { id: "elementWrapper" },
                element,
                this.parent.tooltip ? h("ti-widget-tooltip", { class: "tooltip", text: this.parent.tooltip, anchorId: "elementWrapper" }) : null));
            // JSXOFF
        } //^ti-widget-base\ti-widget-base.tsx,94^
    } //^ti-widget-base\ti-widget-base.tsx,95^
    onClickHandler(event, element) {
        if (element) { //^ti-widget-base\ti-widget-base.tsx,98^
            const parent = element.parentElement; //^ti-widget-base\ti-widget-base.tsx,99^
            if (parent && parent.id === 'elementWrapper') { //^ti-widget-base\ti-widget-base.tsx,100^
                return; //^ti-widget-base\ti-widget-base.tsx,101^
            }
            else if (!element.classList.contains('root-container')) { //^ti-widget-base\ti-widget-base.tsx,103^
                this.onClickHandler(event, element.parentElement); //^ti-widget-base\ti-widget-base.tsx,104^
            }
            else { //^ti-widget-base\ti-widget-base.tsx,106^
                event.stopPropagation(); //^ti-widget-base\ti-widget-base.tsx,107^
            } //^ti-widget-base\ti-widget-base.tsx,108^
        } //^ti-widget-base\ti-widget-base.tsx,109^
    } //^ti-widget-base\ti-widget-base.tsx,110^
    fire(eventName, detail) {
        const obj = this.parent; //^ti-widget-base\ti-widget-base.tsx,113^
        for (const x in obj) { //^ti-widget-base\ti-widget-base.tsx,114^
            if (TiUtils.camelToDashCase(x) === eventName) { //^ti-widget-base\ti-widget-base.tsx,115^
                return obj[x].emit(detail); //^ti-widget-base\ti-widget-base.tsx,116^
            } //^ti-widget-base\ti-widget-base.tsx,117^
        } //^ti-widget-base\ti-widget-base.tsx,118^
    } //^ti-widget-base\ti-widget-base.tsx,119^
    setCSSProperty(name, value) {
        value = value.replace(/^[ ]+|[ ]+$/g, ''); //^ti-widget-base\ti-widget-base.tsx,122^
        this.element.style.setProperty(name, value); //^ti-widget-base\ti-widget-base.tsx,123^
        this.parent.cssPropertyChanged.emit({ name: name, value: value }); //^ti-widget-base\ti-widget-base.tsx,124^
    } //^ti-widget-base\ti-widget-base.tsx,125^
    getCSSProperty(name) {
        return getComputedStyle(this.element).getPropertyValue(name); //^ti-widget-base\ti-widget-base.tsx,128^
    } //^ti-widget-base\ti-widget-base.tsx,129^
    refresh() {
        return this.element['forceUpdate'](); //^ti-widget-base\ti-widget-base.tsx,132^
    } //^ti-widget-base\ti-widget-base.tsx,133^
    /**
     * Add the class name to the element.
     *
     * @param {string} name the class name
     * @param {HTMLElement} element the element
     * @protected
     */
    addClassName(name, element) {
        this.modifyClassName(true, name, element); //^ti-widget-base\ti-widget-base.tsx,143^
    } //^ti-widget-base\ti-widget-base.tsx,144^
    /**
     * Remove the class name from the element.
     *
     * @param {string} name the class name
     * @param {HTMLElement} element the element
     * @protected
     */
    removeClassName(name, element) {
        this.modifyClassName(false, name, element); //^ti-widget-base\ti-widget-base.tsx,154^
    } //^ti-widget-base\ti-widget-base.tsx,155^
    modifyClassName(isAdd, name, element = this.element) {
        if (element.className.indexOf(name) < 0) { //^ti-widget-base\ti-widget-base.tsx,158^
            if (isAdd) { //^ti-widget-base\ti-widget-base.tsx,159^
                // add because it doesn't exist yet and should
                element.className = (element.className + ' ' + name).trim(); //^ti-widget-base\ti-widget-base.tsx,161^
            } //^ti-widget-base\ti-widget-base.tsx,162^
        }
        else if (!isAdd) { //^ti-widget-base\ti-widget-base.tsx,163^
            // remove because it does exist and shouldn't
            element.className = element.className.replace(name, '').trim(); //^ti-widget-base\ti-widget-base.tsx,165^
        } //^ti-widget-base\ti-widget-base.tsx,166^
    } //^ti-widget-base\ti-widget-base.tsx,167^
} //^ti-widget-base\ti-widget-base.tsx,168^

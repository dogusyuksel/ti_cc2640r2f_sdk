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
import { h } from "@stencil/core"; //^ti-widget-base\ti-widget-base-check.tsx,30^
import { TiWidgetBase } from './ti-widget-base'; //^ti-widget-base\ti-widget-base-check.tsx,32^
/**
 * `TiWidgetBaseCheck` provides the base implementation for TI check element.
 *
 * @isHidden
 */
export class TiWidgetBaseCheck extends TiWidgetBase {
    constructor(parent) {
        super(parent); //^ti-widget-base\ti-widget-base-check.tsx,41^
        this.parent = parent;
    } //^ti-widget-base\ti-widget-base-check.tsx,42^
    renderCheck() {
        return this.parent.labelWhenChecked ? //^ti-widget-base\ti-widget-base-check.tsx,45^
            h("div", { class: "labelContainer" },
                "   //^ti-widget-base\\ti-widget-base-check.tsx,46^",
                h("div", { class: "label" },
                    " ",
                    this.parent.label) //^ti-widget-base\ti-widget-base-check.tsx,47^
            ,
                "   //^ti-widget-base\\ti-widget-base-check.tsx,47^",
                h("div", { class: "labelWhenChecked" }, this.parent.labelWhenChecked) //^ti-widget-base\ti-widget-base-check.tsx,48^
            ,
                "   //^ti-widget-base\\ti-widget-base-check.tsx,48^") //^ti-widget-base\ti-widget-base-check.tsx,49^
            : this.parent.label ? h("div", { class: "label" }, this.parent.label) : undefined; //^ti-widget-base\ti-widget-base-check.tsx,50^
    } //^ti-widget-base\ti-widget-base-check.tsx,51^
} //^ti-widget-base\ti-widget-base-check.tsx,52^

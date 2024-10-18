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
import { TiWidgetBaseIntermediateValue } from './ti-widget-base-intermediate-value'; //^ti-widget-base\ti-widget-base-range-value.tsx,29^
/**
 * `TiWidgetBaseRangeValue` is a mixin that provides minimum and maximum value ranges.
 * Only applicable to subclasses of TiWidgetBaseValue.
 *
 * @mixinFunction
 *
 * @isHidden
 */
export class TiWidgetBaseRangeValue extends TiWidgetBaseIntermediateValue {
    constructor(parent) {
        super(parent); //^ti-widget-base\ti-widget-base-range-value.tsx,41^
        this.parent = parent;
    } //^ti-widget-base\ti-widget-base-range-value.tsx,42^
    minValueChanged() {
        // make sure we convert strings to numbers
        this.parent.minValue = +this.parent.minValue; //^ti-widget-base\ti-widget-base-range-value.tsx,46^
        // make sure value is >= new min
        this.parent.value = Math.max(this.parent.minValue, this.parent.value); //^ti-widget-base\ti-widget-base-range-value.tsx,49^
    } //^ti-widget-base\ti-widget-base-range-value.tsx,50^
    maxValueChanged() {
        // make sure we convert strings to numbers
        this.parent.maxValue = +this.parent.maxValue; //^ti-widget-base\ti-widget-base-range-value.tsx,54^
        // make sure value is <= new max
        this.parent.value = Math.min(this.parent.maxValue, this.parent.value); //^ti-widget-base\ti-widget-base-range-value.tsx,57^
    } //^ti-widget-base\ti-widget-base-range-value.tsx,58^
} //^ti-widget-base\ti-widget-base-range-value.tsx,59^

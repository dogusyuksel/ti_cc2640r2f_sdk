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
/* eslint-disable @typescript-eslint/no-explicit-any */
const DESIGNER = 'GCDesigner';
/**
* Helper class with static methods for bit field manipulation.
*/
class BitField {
    /**
    * Returns a bitmask with the bits from startBit to stopBit set to 1
    * and all other bits set to 0.  This only works for 32-bit integers or less.
    * @param startBit - lsb of the mask
    * @param stopBit - msb of the mask
    * @returns mask value
    */
    static getMask(startBit, stopBit) {
        if (stopBit > 30) {
            // TODO: use BigInt when Cloud agent moves to 10.4+ nodejs version, and typescript ES2020.
            /*
            const bigStopBit = BigInt(stopBit+1);
            const bigStartBit = BigInt(startBit);
            const one = BigInt(1);
            return Number(one << bigStopBit - one << bigStartBit);
            */
            if (stopBit !== 31) {
                throw 'getMask() does not support integer sizes > 32 bits.';
            }
            else if (startBit === 31) {
                return 0x80000000;
            }
            else {
                return 0x100000000 - (1 << startBit);
            }
        }
        else {
            return (1 << (stopBit + 1)) - (1 << startBit);
        }
    }
    ;
    /**
    * Returns the field value from within a larger numberic value.  The mask is used to define which bits are part of the field.
    * The shift is optional and is applied directly to the field before returning it.  Typically the shift is equibalent to the lsb of the mask.
    * If a negativeBit is provided, then the result will be a signed integer, otherwise an unsigned value will always be returned.
    * The negativeBit also represents the mask for the sign bit, and should equal the most significant bit of the mask value.
    *
    * @param dataValue - the larget numberic value from which the field is to be retrieved.
    * @param mask - value for masking out the field from within the larger numeric value.
    * @param shift - number of times to shift the resulting field to the right, typically to remove zeros created with the mask.
    * @param negativeBit - if specified this represenys the mask for the sign bit, and the return value will be signed accordingly; otherwise an unsigned value is always returned.
    * @returns the value of the field after being masked and shifted to the right.
    */
    static readField(dataValue, mask, shift = 0, negativeBit) {
        let result = (dataValue & mask) >>> shift;
        if (result < 0) {
            result = 0x100000000 + result; // convert to positive integer
        }
        if (negativeBit) {
            if (shift) {
                negativeBit = negativeBit >>> shift;
            }
            if (result >= negativeBit) {
                result = result - negativeBit;
                result = result - negativeBit;
            }
        }
        return result;
    }
    ;
    /**
    * Sets a field value within a larger numberic value, without modifying the bits outside the field.  The mask is used to define
    * which bits are part of the field, and which bits should not be touched.  The return value is always unsigned.  The field value
    * to set may be signed or unsigned since the sign extension will be masked off in either event.
    * The shift is applied to the field value before being masked into the final result.  This is typically set to the number of
    * least significant zero bit in the mask value, and is used to align the field value with the mask value.
    *
    * @param dataValue - the larget numberic value containing the field that is to be replaced with the one provided.
    * @param mask - value indicating mask bits for the dataValue that define which bits will be replaced in the returned value.
    * @param shift - number of times to shift the new field value to the left, before being or'ed into the dataValue.
    * @param bitFieldValue - the new bit field value to replace the old field value in the imput dataValue.
    * @returns the input dataValue with the field defined by the mask replaced with the new bitFieldValue input.
    */
    static writeField(dataValue, mask, shift, bitFieldValue) {
        const result = ((bitFieldValue << shift) & mask) | (dataValue & ~mask);
        return result >= 0 ? result : 0x100000000 + result;
    }
    ;
}
;
// camel to dash and dash to camel conversion helpers
const fromCamelCaseRegEx = /([A-Z])/g;
const toCamelCaseRegEx = /-([a-z])/g;
/**
 * Common helper functions and utilities.
 */
export class TiUtils {
    /**
     * (Getter) Returns the root window object.
     */
    static get rootWin() {
        let root = null;
        while (root !== window.parent)
            root = window.parent;
        return root;
    }
    /**
     * (Getter) Returns the application name.
     */
    static get appName() {
        if (TiUtils.isNodeJS) {
            return 'NodeJS';
        }
        else {
            const pathname = window.location.pathname;
            /* Gallery App */
            if (pathname.match(/\/gallery\/view\/.*\//)) {
                return pathname.split('/gallery/view/')[1].split('/')[1];
                /* CCS GC App */
            }
            else if (pathname.match(/\/guicomposer\/.*\//)) {
                return pathname.split('/')[2];
                /* GC Designer Preview */
            }
            else if (pathname.match(/\/gc\/preview\/.*/)) {
                return pathname.split('/gc/preview/default/')[1].split('/')[0];
                /* GC Designer */
            }
            else {
                return DESIGNER;
            }
        }
    }
    /**
     * (Getter) Returns true if the application is running in the GC Designer.
     */
    static get isInDesigner() {
        return TiUtils.appName === DESIGNER;
    }
    /**
     * (Getter) Returns true if the application is running in the cloud environment.
     */
    static get isCloud() {
        return !TiUtils.isCCS && !TiUtils.isNW && !this.isNodeJS && (location && location.hostname.indexOf('127.0.0.1') !== 0);
    }
    /**
     * (Getter) Returns true if the application is running in the mobile environment.
     */
    static get isMobile() {
        return navigator && (navigator.app || navigator.device);
    }
    /**
     * (Getter) Returns true if the application is running in the Node Webkit environment.
     */
    static get isNW() {
        return (typeof window !== 'undefined') &&
            (typeof window.process !== 'undefined') &&
            (typeof window.process.versions !== 'undefined') &&
            !!window.process.versions['node-webkit'];
    }
    /**
     * (Getter) Returns true if the application is running in the NodeJS environment.
     */
    static get isNodeJS() {
        return !TiUtils.isNW &&
            (typeof process !== 'undefined') &&
            (typeof process.versions !== 'undefined') &&
            !!process.versions['node'];
    }
    /**
     * (Getter) Returns true if the application is running in the Code Composer Studio environment.
     */
    static get isCCS() {
        return (typeof navigator !== 'undefined') &&
            (typeof navigator.userAgent !== 'undefined') &&
            (navigator.userAgent.indexOf('CCStudio') !== -1);
    }
    static get OS() {
        return ((global === null || global === void 0 ? void 0 : global.TICloudAgent) || (window === null || window === void 0 ? void 0 : window.TICloudAgent)).getOS();
    }
    static get path() {
        return {
            basename: (url) => {
                const tmp = url.replace(new RegExp('\\\\', 'g'), '/');
                const segments = tmp.split('/');
                return segments[tmp.length - 1];
            },
            // dirname: (url: string) => {
            //     const tmp = url.replace(new RegExp('\\\\', 'g'), '/');
            //     const segments = tmp.split('/');
            //     // return segments[]
            // },
            // For ES6 module, prefer rest parameters over arguments object.
            // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
            join: (...theArgs) => {
                let result = theArgs[0];
                for (let i = 1, j = theArgs.length; i < j; i++) {
                    if (result.length > 0) {
                        result += `/${theArgs[i]}`;
                    }
                    else {
                        result = theArgs[i];
                    }
                }
                return result;
            }
        };
    }
    static camelToDashCase(propertyName) {
        return propertyName.replace(fromCamelCaseRegEx, '-$1').toLowerCase();
    }
    ;
    static dashToCamelCase(attributeName) {
        return attributeName.replace(toCamelCaseRegEx, (m) => {
            return m[1].toUpperCase();
        });
    }
    ;
    /**
    * Helper function to convert numberic input in the form of a number or a string into a number.
    * JSon files do not support hexadecimal by default, so hex values must be
    * entered as strings.  This function will aide in converting the values back to a number.
    *
    * @param value - an optional numberic value in the form of either a number or a string.
    * @returns the numberic value of the input, or undefined if the input is blank, or NaN if the input string could not be converted to a number.
    */
    static string2value(value) {
        let result;
        if (typeof value === 'string') {
            value = value.trim();
            if (value.indexOf('"') === 0 || value.indexOf('\'') === 0) {
                // literal string - remove quotes
                value = value.substring(1, value.length - 1);
            }
            if (value === 'true') {
                result = 1;
            }
            else if (value === 'false') {
                result = 0;
            }
            else {
                result = parseInt(value);
            }
        }
        else {
            result = value;
        }
        return result;
    }
    ;
    /**
     * Parse and validate a numeric property.
     *
     * @param message - the name of the numeric property.
     * @param value - the property value to be parsed.
     * @param min - optional minimum number.
     * @param max - optional maximum number.
     * @returns the number.
     */
    static parseNumberProperty(message, value, min, max) {
        const result = +value;
        const theValueForEntry = `The value ${value} for entry ${message}`;
        if (isNaN(result)) {
            throw Error(`${theValueForEntry} is not a number.`);
        }
        if (min && result < min) {
            throw Error(`${theValueForEntry} must be greater than ${min}.`);
        }
        if (max && result > max) {
            throw Error(`${theValueForEntry} must be less than ${max}.`);
        }
        return result;
    }
    ;
    /**
     * Parse and map a string property to a numeric value.
     * @param message - the name of the string property.
     * @param value - the string value to be parsed.
     * @param valueMap - a map of property values that maps a string value to a numeric value.
     * @returns the numeric value corresponds to the string value.
     */
    static parseStringProperty(message, value, valueMap) {
        const stringValue = ('' + value).toLowerCase();
        if (stringValue in valueMap) {
            return valueMap[stringValue];
        }
        else {
            message = `The value ${value} for entry ${message} is not supported. Valid entries are`;
            let delimiter = ' "';
            let lastOption;
            for (const option in valueMap) {
                if (lastOption) {
                    message = message + delimiter + lastOption;
                    delimiter = '", "';
                }
                lastOption = option;
            }
            throw Error(`${message}", or "${lastOption}".`);
        }
    }
    ;
}
TiUtils.bitField = BitField;
//# sourceMappingURL=TiUtils.js.map
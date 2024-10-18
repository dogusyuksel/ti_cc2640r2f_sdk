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
import '../ti-core-assets/ti-core-assets'; //^ti-element-base\ti-element-base.tsx,29^
import { TiLocalStorage } from '../ti-core-assets/lib/TiLocalStorage'; //^ti-element-base\ti-element-base.tsx,30^
import { TiConsole } from '../ti-core-assets/lib/TiConsole'; //^ti-element-base\ti-element-base.tsx,31^
import { TiUtils } from '../ti-core-assets/lib/TiUtils'; //^ti-element-base\ti-element-base.tsx,32^
/**
 * `TiElementBase` provides the base implementation for TI elements.
 *
 * @customElement
 * @isHidden
 */
export class TiElementBase {
    constructor(parent) {
        this.parent = parent;
    } //^ti-element-base\ti-element-base.tsx,44^
    /**
     * Returns true if the element is hosted in the designer, otherwise false.
     *
     * @return {boolean}
     */
    isDesignerHosted() {
        return !!TiUtils.rootWin.TIDesigner; //^ti-element-base\ti-element-base.tsx,52^
    } //^ti-element-base\ti-element-base.tsx,53^
    /**
     * Parse the delimited string into an array.
     *
     * @param {undefined|string|Array<string>} text the input text
     * @param delimiter the delimiter character
     * @return {Array<string>} the array
     */
    parseArray(text, delimiter) {
        text = text || ''; //^ti-element-base\ti-element-base.tsx,63^
        // support arrays as well
        if (text instanceof Array) { //^ti-element-base\ti-element-base.tsx,66^
            return text; //^ti-element-base\ti-element-base.tsx,67^
        } //^ti-element-base\ti-element-base.tsx,68^
        // support using terminating character as a delimiter if one of [,;|].
        // this means that if you want a blank element at the end of the list, you have to use a double terminator; for example, A|B|C||
        if (!delimiter && text.length > 1) { //^ti-element-base\ti-element-base.tsx,72^
            const lastCharacter = text.charAt(text.length - 1); //^ti-element-base\ti-element-base.tsx,73^
            if (lastCharacter === '|' || lastCharacter === ',' || lastCharacter === ';') { //^ti-element-base\ti-element-base.tsx,74^
                delimiter = lastCharacter; //^ti-element-base\ti-element-base.tsx,75^
                text = text.substring(0, text.length - 1); //^ti-element-base\ti-element-base.tsx,76^
            } //^ti-element-base\ti-element-base.tsx,77^
        } //^ti-element-base\ti-element-base.tsx,78^
        // support comma-separated values, semi-colon separated, or | separated fields.
        let fields = text.split(delimiter || '|'); //^ti-element-base\ti-element-base.tsx,81^
        if (!delimiter) { //^ti-element-base\ti-element-base.tsx,82^
            let altFields = text.split(';'); //^ti-element-base\ti-element-base.tsx,83^
            if (altFields.length > fields.length) { //^ti-element-base\ti-element-base.tsx,84^
                fields = altFields; //^ti-element-base\ti-element-base.tsx,85^
            } //^ti-element-base\ti-element-base.tsx,86^
            altFields = text.split(','); //^ti-element-base\ti-element-base.tsx,87^
            if (altFields.length > fields.length && (altFields.length !== fields.length + 1 || fields.length === 1)) { //^ti-element-base\ti-element-base.tsx,88^
                fields = altFields; //^ti-element-base\ti-element-base.tsx,89^
            } //^ti-element-base\ti-element-base.tsx,90^
        } //^ti-element-base\ti-element-base.tsx,91^
        for (let i = fields.length; i-- > 0;) { //^ti-element-base\ti-element-base.tsx,92^
            fields[i] = fields[i].trim(); //^ti-element-base\ti-element-base.tsx,93^
        } //^ti-element-base\ti-element-base.tsx,94^
        if (fields.length === 1 && fields[0].length === 0) { //^ti-element-base\ti-element-base.tsx,96^
            return []; //^ti-element-base\ti-element-base.tsx,97^
        } //^ti-element-base\ti-element-base.tsx,98^
        return fields; //^ti-element-base\ti-element-base.tsx,100^
    } //^ti-element-base\ti-element-base.tsx,101^
    /**
     * Returns the cookie value.
     *
     * @param {string} name the name of the cookie
     * @return {string} the cookie value
     */
    static getCookie(name) {
        const value = '; ' + document.cookie; //^ti-element-base\ti-element-base.tsx,110^
        const parts = value.split('; ' + name + '='); //^ti-element-base\ti-element-base.tsx,111^
        if (parts.length === 2) { //^ti-element-base\ti-element-base.tsx,112^
            const item = parts.pop(); //^ti-element-base\ti-element-base.tsx,113^
            if (item !== null) { //^ti-element-base\ti-element-base.tsx,114^
                return item.split(';').shift() || ''; //^ti-element-base\ti-element-base.tsx,115^
            } //^ti-element-base\ti-element-base.tsx,116^
        } //^ti-element-base\ti-element-base.tsx,117^
        return ''; //^ti-element-base\ti-element-base.tsx,118^
    } //^ti-element-base\ti-element-base.tsx,119^
    /**
     * Helper method to log trace message to the console.
     *
     * @param {string} logtype trace type, can be log|info|warn|debug
     * @param {function|string} message the message to log
     */
    trace(logType, message) {
        const output = typeof message === 'object' ? JSON.stringify(message) : message; //^ti-element-base\ti-element-base.tsx,128^
        const id = this.element.id ? this.element.id : 'no-id'; //^ti-element-base\ti-element-base.tsx,129^
        switch (logType) { //^ti-element-base\ti-element-base.tsx,130^
            case 'error': //^ti-element-base\ti-element-base.tsx,131^
                TiConsole.error('[' + this.element.localName + ': ' + id + ']', output); //^ti-element-base\ti-element-base.tsx,132^
                break; //^ti-element-base\ti-element-base.tsx,133^
            case 'warning': //^ti-element-base\ti-element-base.tsx,134^
                TiConsole.warning('[' + this.element.localName + ': ' + id + ']', output); //^ti-element-base\ti-element-base.tsx,135^
                break; //^ti-element-base\ti-element-base.tsx,136^
            case 'info': //^ti-element-base\ti-element-base.tsx,137^
                TiConsole.info('[' + this.element.localName + ': ' + id + ']', output); //^ti-element-base\ti-element-base.tsx,138^
                break; //^ti-element-base\ti-element-base.tsx,139^
            case 'log': //^ti-element-base\ti-element-base.tsx,140^
                TiConsole.log('[' + this.element.localName + ': ' + id + ']', output); //^ti-element-base\ti-element-base.tsx,141^
                break; //^ti-element-base\ti-element-base.tsx,142^
            case 'debug': //^ti-element-base\ti-element-base.tsx,143^
                TiConsole.debug('[' + this.element.localName + ': ' + id + ']', output); //^ti-element-base\ti-element-base.tsx,144^
                break; //^ti-element-base\ti-element-base.tsx,145^
        } //^ti-element-base\ti-element-base.tsx,146^
    } //^ti-element-base\ti-element-base.tsx,147^
    /**
     * Saves the setting to local storage.
     *
     * @param {string} name the setting name
     * @param {string} value the value
     */
    saveSetting(name, value) {
        const id = this.element.tagName.toLowerCase(); //^ti-element-base\ti-element-base.tsx,156^
        const root = JSON.parse(TiLocalStorage.getItem(TiElementBase.STORAGE_ROOT) || '{}'); //^ti-element-base\ti-element-base.tsx,157^
        if (!root[id]) { //^ti-element-base\ti-element-base.tsx,158^
            root[id] = {}; //^ti-element-base\ti-element-base.tsx,159^
        } //^ti-element-base\ti-element-base.tsx,160^
        root[id][name] = value; //^ti-element-base\ti-element-base.tsx,161^
        TiLocalStorage.setItem(TiElementBase.STORAGE_ROOT, JSON.stringify(root)); //^ti-element-base\ti-element-base.tsx,162^
    } //^ti-element-base\ti-element-base.tsx,163^
    /**
     * Loads the setting from local storage.
     *
     * @param {string} name the setting name
     * @return {object} the setting JSON object
     */
    loadSetting(name) {
        const id = this.element.tagName.toLowerCase(); //^ti-element-base\ti-element-base.tsx,172^
        const root = JSON.parse(TiLocalStorage.getItem(TiElementBase.STORAGE_ROOT) || '{}'); //^ti-element-base\ti-element-base.tsx,173^
        const element = root[id] || {}; //^ti-element-base\ti-element-base.tsx,174^
        return element[name]; //^ti-element-base\ti-element-base.tsx,175^
    } //^ti-element-base\ti-element-base.tsx,176^
} //^ti-element-base\ti-element-base.tsx,179^
TiElementBase.STORAGE_ROOT = 'GC-SETTINGS'; //^ti-element-base\ti-element-base.tsx,42^

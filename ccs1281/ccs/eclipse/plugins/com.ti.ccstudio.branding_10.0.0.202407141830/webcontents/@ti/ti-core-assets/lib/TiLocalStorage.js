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
/* eslint-disable @typescript-eslint/camelcase */
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
const MODULE_NAME = 'TiLocalStorage';
const nw = (typeof window !== 'undefined') ? window.nw : undefined;
let initialized = false;
let properties = {};
const NW_getStoragePath = () => nw.App.getDataPath() + require('path').sep + 'Web Data - GC.json';
const NW_ensureProperties = () => {
    if (!initialized) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const fs = require('fs');
            properties = fs.existsSync(NW_getStoragePath()) ? JSON.parse(fs.readFileSync(NW_getStoragePath(), 'utf-8')) : {};
        }
        catch (e) {
            properties = {};
            TiConsole.error(MODULE_NAME, e.toString());
        }
        initialized = true;
    }
};
const NW_storeToFile = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        fs.writeFileSync(NW_getStoragePath(), JSON.stringify(properties, null, 4), 'utf-8');
    }
    catch (e) {
        TiConsole.error(MODULE_NAME, e.toString());
    }
};
/**
 * Provides local storage API.
 */
export class TiLocalStorage {
    /**
     * Clears the local storage.
     */
    static clear() {
        if (TiUtils.isNW) {
            NW_ensureProperties();
            properties = {};
            NW_storeToFile();
        }
        else if (TiUtils.isNodeJS) {
            properties = {};
        }
        else {
            localStorage.clear();
        }
    }
    ;
    /**
     * Sets the item to the storage.
     *
     * @param {string} name the item name
     * @param {string} value the item value
     */
    static setItem(name, value) {
        if (TiUtils.isNW) {
            NW_ensureProperties();
            properties[name] = value;
            NW_storeToFile();
        }
        else if (TiUtils.isNodeJS) {
            properties[name] = value;
        }
        else {
            localStorage.setItem(name, value);
        }
    }
    ;
    /**
     * Returns the item from the storage.
     *
     * @param {string} name the item name
     * @return {null|string} the item value
     */
    static getItem(name) {
        if (TiUtils.isNW) {
            NW_ensureProperties();
            return (typeof properties[name] !== 'undefined') ? properties[name] : null;
        }
        else if (TiUtils.isNodeJS) {
            return (typeof properties[name] !== 'undefined') ? properties[name] : null;
        }
        else {
            return localStorage.getItem(name);
        }
    }
    ;
    /**
     * Removes the item from the storage.
     *
     * @param {string} name the item name
     */
    static removeItem(name) {
        if (TiUtils.isNW) {
            NW_ensureProperties();
            delete properties[name];
            NW_storeToFile();
        }
        else if (TiUtils.isNodeJS) {
            delete properties[name];
        }
        else {
            localStorage.removeItem(name);
        }
    }
    ;
    /**
     * (Getter) Returns the number of items in the storage.
     *
     * @return {number} the item length
     */
    // @ts-ignore
    static get length() {
        if (TiUtils.isNW) {
            NW_ensureProperties();
            return Object.keys(properties).length;
        }
        else if (TiUtils.isNodeJS) {
            return Object.keys(properties).length;
        }
        else {
            return localStorage.length;
        }
    }
    ;
    /**
     * Returns the key of the item for the given index.
     *
     * @param {number} index the item index
     * @return {string | null} the key
     */
    static key(index) {
        if (TiUtils.isNW || TiUtils.isNodeJS) {
            if (TiUtils.isNW) {
                NW_ensureProperties();
            }
            if (typeof index !== 'number') {
                return null;
            }
            if (index < 0 || index >= this.length) {
                return null;
            }
            let count = 0;
            for (const prop in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, prop)) {
                    if (count === index)
                        return prop;
                    count++;
                }
            }
            return null;
        }
        else {
            return localStorage.key(index);
        }
    }
}
//# sourceMappingURL=TiLocalStorage.js.map
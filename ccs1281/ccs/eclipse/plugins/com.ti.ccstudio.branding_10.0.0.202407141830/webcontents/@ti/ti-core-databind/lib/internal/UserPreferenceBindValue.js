/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
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
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
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
import { isDisposable } from './IDisposable';
import { TiLocalStorage as localStorage } from '../../../ti-core-assets/lib/TiLocalStorage';
import { TiUtils } from '../../../ti-core-assets/lib/TiUtils';
import { valueChangedEventType } from './IBindValue';
import { AbstractBindValue } from './AbstractBindValue';
import { ConstantBindValue } from './ConstantBindValue';
/**
 * Class that extends AbstractBindValue for a variable value binding that
 * is persisted in the user's preferences.  Each binding
 * requires a set of keys that make it unique within the users preferences.
 * One or more keys may be provided as additional attributes to this
 * constructor.  These attributes may either be string literals (constant key),
 * or IBindValues where the key value is provided by another binding.  In this
 * case, when any key changes value, this binding's value is updated with the
 * stored user preference for the new keys.  All keys are joined together to
 * form a single user preference key with '_' delimiters inserted between key values.
 *
 * @constructor
 * @extends gc.databind.AbstractBindValue
 * @param {...*} args one or more key values or key bindings.
 */
export class UserPreferenceBindValue extends AbstractBindValue {
    constructor(...keys) {
        super(typeof String);
        this.storageKey = '';
        this.excludeFromStorageProviderData = true;
        // TODO: add project Name to TiUtils or Storage provider?
        this.storageKeyPrefix = TiUtils.appName;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.storageKeyChangeHandler = (details) => this.keyValueChangeHandler();
        this.indexBindings = keys.map((key) => {
            if (typeof key === 'string') {
                return new ConstantBindValue(key);
            }
            else {
                key.addEventListener(valueChangedEventType, this.storageKeyChangeHandler);
                return key;
            }
        });
        // trigger key value change to initialize binding value from user preferences.
        this.keyValueChangeHandler();
    }
    ;
    onValueChanged(details) {
        if (!this.readOnly) {
            // save new value in local storage
            localStorage.setItem(this.storageKey, details.newValue);
        }
    }
    ;
    dispose() {
        for (let i = this.indexBindings.length; i-- > 0;) {
            const indexBinding = this.indexBindings[i];
            indexBinding.removeEventListener(valueChangedEventType, this.storageKeyChangeHandler);
            if (isDisposable(indexBinding)) {
                indexBinding.dispose();
            }
        }
    }
    ;
    set defaultValue(defaultValue) {
        if (this.readOnly) {
            this.updateValue(defaultValue);
        }
        else if (this._defaultValue !== defaultValue) {
            this._defaultValue = defaultValue;
            // trigger key value change to initialize binding value from user preferences.
            this.keyValueChangeHandler();
        }
    }
    ;
    get defaultValue() {
        return this._defaultValue;
    }
    keyValueChangeHandler() {
        if (!this.readOnly) {
            // ignore localStorage, because if it has a value, its wrong because we don't store constant values there.
            // calculate new key value
            this.storageKey = this.indexBindings.reduce((result, key) => result + key.getValue(), this.storageKeyPrefix);
            // load preference value from local storage
            this.updateValue(localStorage.getItem(this.storageKey) || this.defaultValue);
        }
    }
    ;
}
;
//# sourceMappingURL=UserPreferenceBindValue.js.map
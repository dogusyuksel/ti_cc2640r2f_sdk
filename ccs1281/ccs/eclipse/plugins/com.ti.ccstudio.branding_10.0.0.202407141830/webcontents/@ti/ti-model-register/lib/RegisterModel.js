/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:\
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
import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
import { RegisterBind, RegisterAllBind, RegisterArrayOperator } from './internal/RegisterBind';
import { FieldBind } from './internal/FieldBind';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { EncoderType, DecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
import { ReferenceBindValue } from '../../ti-core-databind/lib/internal/ReferenceBindValue';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { AbstractPollingDataModel, VariableBindValue, UserPreferenceBindValue, ConstantBindValue, Status } from '../../ti-core-databind/lib/CoreDatabind';
var BIND_TYPE;
(function (BIND_TYPE) {
    BIND_TYPE[BIND_TYPE["CALCULATED"] = 0] = "CALCULATED";
    BIND_TYPE[BIND_TYPE["FIELD"] = 1] = "FIELD";
    BIND_TYPE[BIND_TYPE["CORE_REGISTER"] = 2] = "CORE_REGISTER";
    BIND_TYPE[BIND_TYPE["USER"] = 3] = "USER";
    BIND_TYPE[BIND_TYPE["REGISTER_ALL"] = 4] = "REGISTER_ALL";
    BIND_TYPE[BIND_TYPE["ACTIVE_REGISTER"] = 5] = "ACTIVE_REGISTER";
    BIND_TYPE[BIND_TYPE["BAD"] = 6] = "BAD";
})(BIND_TYPE || (BIND_TYPE = {}));
;
const notIdentifierRegExp = /[^A-Za-z$_.0-9]+/;
const console = new TiConsole('ti-register-model');
;
;
export const RegisterModelEncoderType = new EncoderType('regInfo');
export const RegisterModelDecoderType = new DecoderType('regModel');
;
function resolveBlockRead(promises, offset, size, results) {
    for (let i = 0; i < size; i++) {
        promises[i + offset].resolve(results[i]);
    }
}
;
function failBlockRead(promises, offset, size, reason) {
    for (let i = 0; i < size; i++) {
        promises[i + offset].reject(reason);
    }
}
;
;
class RegisterBlock {
    constructor(registerModel, info, next) {
        this.len = 1;
        this.registerModel = registerModel;
        this.addr = info.addr;
        this.next = next;
        this.regs = [info];
    }
    ;
    prependRegister(regInfo) {
        this.len++;
        this.addr--;
        this.regs.unshift(regInfo);
    }
    ;
    appendRegister(regInfo) {
        this.len++;
        this.regs.push(regInfo);
        if (this.next && regInfo.addr === this.next.addr - 1) {
            // combine next register block into this one.
            this.len += this.next.len;
            this.regs.push(...this.next.regs);
            this.next = this.next.next;
        }
    }
    ;
    doReadRegisters(coreIndex) {
        const promises = this.promises || [];
        for (let i = 0; i < promises.length; i++) {
            if (promises[i]) {
                let size = 1;
                while (promises[i + size]) {
                    size++;
                }
                const codec = this.registerModel.codec;
                if (codec) {
                    if (size > 1) {
                        // block read values
                        codec.multiRegisterRead(this.regs[i], size, coreIndex).then((results) => {
                            resolveBlockRead(promises, i, size, results);
                        }).catch((err) => {
                            failBlockRead(promises, i, size, err);
                        });
                        i += size - 1;
                    }
                    else {
                        // single value read
                        codec.readValue(this.regs[i], coreIndex).then(promises[i].resolve).catch(promises[i].reject);
                    }
                }
            }
        }
        this.promises = undefined;
    }
    ;
    readRegister(regInfo, coreIndex) {
        if (!this.promises) {
            this.promises = [];
            setTimeout(() => {
                this.doReadRegisters(coreIndex);
            }, 0);
        }
        const deferred = TiPromise.defer();
        this.promises[regInfo.addr - this.addr] = deferred;
        return deferred.promise;
    }
    ;
}
class RegisterBlocks {
    constructor(registerModel) {
        this.registerModel = registerModel;
    }
    ;
    findRegisterBlock(info) {
        const addr = info.addr;
        if (addr !== undefined) {
            let cur = this.first;
            while (cur && addr >= cur.addr + cur.len) {
                cur = cur.next;
            }
            if (cur && addr >= cur.addr && cur.len > 1) {
                return cur;
            }
        }
    }
    ;
    addRegister(info) {
        const addr = info.addr;
        if (addr !== undefined) {
            let cur = this.first;
            if (!cur) {
                // first element
                this.first = new RegisterBlock(this.registerModel, info);
            }
            else if (addr < cur.addr - 1) {
                // insert before first element
                this.first = new RegisterBlock(this.registerModel, info, cur);
            }
            else {
                // find insert point
                while (cur.next && addr >= cur.next.addr - 1 && addr !== cur.addr + cur.len) {
                    cur = cur.next;
                }
                if (addr === cur.addr - 1) {
                    // insert at beginning of block
                    cur.prependRegister(info);
                }
                else if (addr === cur.addr + cur.len) {
                    // insert at end of block
                    cur.appendRegister(info);
                }
                else {
                    // insert new block after current element.
                    cur.next = new RegisterBlock(this.registerModel, info, cur.next);
                }
            }
        }
    }
    ;
    readRegister(codec, info, coreIndex) {
        const block = this.findRegisterBlock(info);
        if (block && codec.multiRegisterRead) {
            return block.readRegister(info, coreIndex);
        }
        return codec.readValue(info, coreIndex);
    }
    ;
}
;
const calculatedBindingsPrefix = '_';
const NotDeviceArrayMessage = 'Must set is-device-array="true" on ti-model-register in order to use URIs that start with $cores';
;
export class RegisterModel extends AbstractPollingDataModel {
    constructor(params) {
        super(params.id || 'reg');
        this.params = params;
        this.decoderInputType = RegisterModelDecoderType;
        this.decoderOutputType = RegisterModelEncoderType;
        this.symbols = new Map();
        this.uriPrefix = '';
        this.registerBlocksMap = new Map();
        this.deviceAddrsUserPreferenceDefaults = new Map();
        this.setSymbols();
        this.selectedConfigurationBind = new VariableBindValue('default');
        const deviceKey = new UserPreferenceBindValue(this.id, this.selectedConfigurationBind, 'device');
        this.modelBindings.set('$selectedDevice', deviceKey);
        if (this.isDeviceArray) {
            this.modelBindings.set('$selectedCore', new UserPreferenceBindValue(this.id, deviceKey, 'core'));
            this.modelBindings.set('$cores.length', new VariableBindValue(undefined, true));
        }
        CodecRegistry.register(this);
    }
    ;
    get isDeviceArray() {
        return this.params.isDeviceArray || false;
    }
    getBinding(uri) {
        // use a prefix for looking up bindings, but only if a symbol exists for the prefix + uri, otherwise just use uri.
        if (this.uriPrefix) {
            if (this.deviceAddrsUserPreferenceDefaults.has(this.uriPrefix + uri)) {
                uri = this.uriPrefix + uri;
            }
        }
        return super.getBinding(uri);
    }
    ;
    createNewBind(uri) {
        var _a;
        const customRefreshBind = super.createNewBind(uri);
        if (customRefreshBind) {
            return customRefreshBind;
        }
        let bindResult;
        let registerAllBind;
        let registerBind;
        try {
            const segments = uri.split('.');
            switch (RegisterModel.getBindingTypeFromUri(uri, segments)) {
                case BIND_TYPE.FIELD: {
                    const pos = uri.lastIndexOf('.');
                    const parentBind = this.getBinding(uri.substring(0, pos));
                    if (parentBind instanceof RegisterBind || parentBind instanceof RegisterArrayOperator) {
                        const bitNumber = uri.substring(pos + 1);
                        let symbolName = uri;
                        let symbolData = this.symbols.get(symbolName);
                        if (!isNaN(+bitNumber)) {
                            symbolData = { start: +bitNumber, stop: +bitNumber, name: uri };
                            symbolName = '';
                        }
                        else if (segments.length === 4) {
                            // strip $cores.xxx.  from the uri.
                            symbolName = segments[2] + '.' + segments[3];
                            symbolData = this.symbols.get(symbolName);
                        }
                        bindResult = new FieldBind(symbolName, parentBind, symbolData);
                    }
                    else {
                        throw ((_a = parentBind === null || parentBind === void 0 ? void 0 : parentBind.status) === null || _a === void 0 ? void 0 : _a.message) || NotDeviceArrayMessage;
                    }
                    break;
                }
                case BIND_TYPE.USER: {
                    const deviceKey = this.modelBindings.get('$selectedDevice');
                    bindResult = new UserPreferenceBindValue(this.id, deviceKey, uri);
                    break;
                }
                case BIND_TYPE.CALCULATED: {
                    bindResult = new ReferenceBindValue(uri);
                    this.updateCalculatedBind(bindResult);
                    break;
                }
                case BIND_TYPE.ACTIVE_REGISTER: {
                    const symbolData = this.symbols.get(uri);
                    if (this.isDeviceArray) {
                        registerAllBind = this.getBinding('$cores.all.' + uri);
                        registerBind = new RegisterBind(uri, this, undefined, symbolData, registerAllBind);
                        registerBind.name = uri;
                        const activeRegisterBind = this.getBinding('$selectedCore');
                        bindResult = new RegisterArrayOperator(registerBind, activeRegisterBind);
                    }
                    else {
                        bindResult = new RegisterBind(uri, this, this.defaultRefreshBinding, symbolData);
                    }
                    break;
                }
                case BIND_TYPE.REGISTER_ALL: {
                    if (this.isDeviceArray) {
                        const symbolName = segments[2];
                        const symbolData = this.symbols.get(symbolName);
                        bindResult = new RegisterAllBind(symbolName, this, this.defaultRefreshBinding, symbolData);
                    }
                    else {
                        throw NotDeviceArrayMessage;
                    }
                    break;
                }
                // eslint-disable-next-line no-fallthrough
                case BIND_TYPE.CORE_REGISTER: {
                    if (this.isDeviceArray) {
                        const symbolName = segments[2];
                        const symbolData = this.symbols.get(symbolName);
                        registerAllBind = this.getBinding('$cores.all.' + symbolName);
                        bindResult = new RegisterBind(symbolName, this, undefined, symbolData, registerAllBind);
                        bindResult.setIndex(segments[1]);
                    }
                    else {
                        throw NotDeviceArrayMessage;
                    }
                    break;
                }
                default: {
                    throw `Invalid register bind name: ${uri}`;
                }
            }
        }
        catch (e) {
            bindResult = new ConstantBindValue();
            bindResult.status = Status.createErrorStatus(e);
        }
        return bindResult;
    }
    ;
    updateAllBindings() {
        this.modelBindings.forEach((bind, bindName) => {
            if (bind) {
                if (bind instanceof FieldBind) {
                    bind.updateRegisterInfo(this);
                }
                else if (bind instanceof RegisterBind) {
                    bind.updateRegisterInfo();
                }
                else if (bind instanceof RegisterArrayOperator) {
                    bind.updateRegisterInfo();
                }
                else if (bind instanceof ReferenceBindValue) {
                    this.updateCalculatedBind(bind);
                }
                else if (bind instanceof UserPreferenceBindValue && (bind.name || '').split('.')[0] === 'deviceAddrs') {
                    this.updateUserPreferenceBind(bind);
                }
            }
        });
    }
    ;
    addSymbol(symbolName, symbolData, isRegister) {
        /* truth table
         *                       new entry
         * existing entry | Register |  Field   |
         * ===============+=====================+
         *      undefined | replace  | replace  |
         *           null | replace  |   skip   |
         *       Register | replace  |   skip   |
         *          Field | replace  | set null |
         */
        symbolName = symbolName.split(' ').join('_'); // convert spaces to underscores
        const symbolEntry = this.symbols.get(symbolName);
        if (symbolEntry === undefined || isRegister) {
            this.symbols.set(symbolName, symbolData); // replace
        }
        else if (symbolEntry && !isRegister) {
            this.symbols.set(symbolName, null); // remove duplicates from the symbol table, unless field is trying to override a register.
        }
        return symbolName;
    }
    ;
    setSymbols(deviceInfo) {
        this.registerBlocksMap = new Map();
        this.symbols.clear();
        this.clearAllModelSpecificBindExpressions();
        if (deviceInfo) {
            const groups = (deviceInfo.regblocks || []).map((groupInfo) => {
                const regs = (groupInfo.registers || []).map((regInfo) => {
                    const size = TiUtils.string2value(regInfo.size);
                    const reg = {
                        ...regInfo,
                        size: size,
                        nBytes: Math.ceil((size === undefined ? 8 : size) / 8),
                        addr: TiUtils.string2value(regInfo.addr) || 0,
                        writeAddr: TiUtils.string2value(regInfo.writeAddr),
                        value: TiUtils.string2value(regInfo.value),
                        default: TiUtils.string2value(regInfo.default),
                        deviceAddrs: regInfo.deviceAddrs || groupInfo.deviceAddrs || deviceInfo.deviceAddrsDefault,
                        fields: []
                    };
                    reg.fields = (regInfo.fields || []).map((fieldInfo) => {
                        const field = {
                            ...fieldInfo,
                            start: TiUtils.string2value(fieldInfo.start),
                            stop: TiUtils.string2value(fieldInfo.stop),
                            value: TiUtils.string2value(fieldInfo.value),
                            default: TiUtils.string2value(fieldInfo.default),
                            parentRegister: reg
                        };
                        const symbolName = (reg.id || reg.name) + '.' + (field.id || field.name);
                        this.addSymbol(symbolName.trim(), field, false);
                        return field;
                    });
                    // add registers to registerBlockMap to support Multi-register read operations.
                    if (reg.nBytes === 1) {
                        const blockname = reg.deviceAddrs || '.default';
                        let block = this.registerBlocksMap.get(blockname);
                        if (!block) {
                            block = new RegisterBlocks(this);
                            this.registerBlocksMap.set(blockname, block);
                        }
                        block.addRegister(reg);
                    }
                    const symbolName = reg.id || reg.name;
                    this.addSymbol(symbolName, reg, true);
                    return reg;
                });
                return {
                    ...groupInfo,
                    registers: regs
                };
            });
            this.registerJsonData = {
                ...deviceInfo,
                regblocks: groups
            };
            if (deviceInfo.calculatedBindings) {
                Object.keys(deviceInfo.calculatedBindings).forEach((calcBindName) => {
                    if (calcBindName.indexOf(calculatedBindingsPrefix) !== 0) {
                        const errorBind = new ConstantBindValue();
                        const errorMessage = `The calculated binding "${calcBindName}" must begin with the prefix "${calculatedBindingsPrefix}".  Please edit your system.json and ensure you prefix all your calculated binding definitions with this.`;
                        errorBind.status = Status.createErrorStatus(errorMessage);
                        this.modelBindings.set(calcBindName, errorBind);
                    }
                    else {
                        // add symbols for calculated bindings
                        this.symbols.set(calcBindName, null);
                    }
                });
            }
            this.readDeviceAddrsMap(deviceInfo);
        }
        else {
            this.registerJsonData = undefined;
        }
        this.updateAllBindings(); // update bindings to reflect new symbols available or not.
    }
    ;
    getSymbolSuggestions(prefix) {
        prefix = prefix || '';
        const result = [];
        this.symbols.forEach((value, key) => {
            if (key.indexOf(prefix) === 0) {
                result.push(key);
            }
        });
        return result;
    }
    ;
    setVerifyConnectionReadValuePromise(promise) {
        if (!this.isConnected() && !this.verifyConnectionReadValuePromise) {
            this.verifyConnectionReadValuePromise = this.verifyConnectionReadValuePromise || promise;
        }
    }
    ;
    async readValue(uri, coreIndex) {
        if (!this.isConnected()) {
            await this.whenConnected();
        }
        if (this.isDeviceArray && coreIndex === undefined) {
            // assumption is that this is coming from _scriptRead api and we should be using the active core.
            coreIndex = +this.getBinding('$selectedCore').getValue();
        }
        else {
            coreIndex = coreIndex || 0;
        }
        this.verifyConnectionReadValuePromise = undefined;
        const symbolData = this.symbols.get(uri);
        if (symbolData) {
            if (this.codec) {
                const blockName = symbolData.deviceAddrs || '.default';
                const block = this.registerBlocksMap.get(blockName);
                if (block) {
                    return block.readRegister(this.codec, symbolData, coreIndex);
                }
                return this.codec.readValue(symbolData, coreIndex);
            }
        }
        throw `Register "${uri}" is not recognized for this device.  Please check the spelling.`;
    }
    ;
    async readBitfieldValue(uri, coreIndex) {
        const segments = uri.split('.');
        const symbolData = this.symbols.get(uri);
        if (segments.length > 1 && symbolData) {
            const value = await this.readValue(segments[segments.length - 2], coreIndex);
            const { mask, shift, signBit } = FieldBind.calcShiftMaskAndSignBit(symbolData);
            if (value instanceof Array) {
                return value.map((val) => TiUtils.bitField.readField(val, mask, shift, signBit));
            }
            return TiUtils.bitField.readField(value, mask, shift, signBit);
        }
        else {
            throw `Invalid register bitfield expression: ${uri}.`;
        }
    }
    ;
    async writeValue(uri, value, coreIndex) {
        if (!this.isConnected()) {
            await this.whenConnected();
        }
        if (this.isDeviceArray && coreIndex === undefined) {
            // assumption is that this is coming from _scriptWrite api and we should be using the active core.
            coreIndex = +this.getBinding('$selectedCore').getValue();
        }
        else {
            coreIndex = coreIndex || 0;
        }
        const symbolData = this.symbols.get(uri);
        if (symbolData) {
            if (this.codec) {
                return this.codec.writeValue(symbolData, value, coreIndex);
            }
        }
        throw `Register "${uri}" is not recognized for this device.  Please check the spelling.`;
    }
    ;
    async writeBitfieldValue(uri, value, coreIndex) {
        const segments = uri.split('.');
        const symbolData = this.symbols.get(uri);
        if (segments.length > 1 && symbolData && symbolData) {
            const oldValue = await this.readValue(segments[segments.length - 2], coreIndex);
            if (oldValue instanceof Array) {
                throw 'writeBitfield() method does not supported multi-core.  coreIndex must not be -1.';
            }
            const { shift, mask } = FieldBind.calcShiftMaskAndSignBit(symbolData);
            const newValue = TiUtils.bitField.writeField(oldValue, mask, shift, value);
            await this.writeValue(segments[segments.length - 2], newValue, coreIndex);
        }
        else {
            throw `Invalid register bitfield expression: ${uri}`;
        }
    }
    ;
    readDeviceAddrsMap(settings) {
        this.deviceAddrsUserPreferenceDefaults.clear();
        const deviceAddrsMap = settings.deviceAddrsMap;
        if (deviceAddrsMap) {
            Object.keys(deviceAddrsMap).forEach((blockName) => {
                const bindName = '$deviceAddrs.' + blockName;
                const bind = this.getBinding(bindName);
                const defaultValue = TiUtils.string2value(deviceAddrsMap[blockName]) || 0;
                this.deviceAddrsUserPreferenceDefaults.set(bindName, defaultValue);
                this.updateUserPreferenceBind(bind, defaultValue);
            });
            if (!settings.deviceAddrsDefault) {
                console.error(name + ' interface in system.json file is missing required deviceAddrsDefault member');
            }
            else if (!(settings.deviceAddrsDefault in deviceAddrsMap)) {
                console.error('deviceAddrsDefault value does not match members in the deviceAddrsMap in the system.json file.');
            }
        }
    }
    ;
    getDeviceAddrsForRegister(info) {
        let bind = info.__deviceAddressBinding;
        if (!bind) {
            const addrsExpression = info.deviceAddrs || '$deviceAddrs';
            this.uriPrefix = '$deviceAddrs.';
            bind = this.parseModelSpecificBindExpression(addrsExpression) || undefined;
            this.uriPrefix = '';
            info.__deviceAddressBinding = bind;
        }
        return bind.getValue();
    }
    ;
    getRegisterInfo(uri) {
        return this.symbols.get(uri) || undefined;
    }
    ;
    static getBindingTypeFromUri(uri, segments) {
        const unexpectedCharacters = notIdentifierRegExp.exec(uri);
        if (unexpectedCharacters !== null || !uri) {
            return BIND_TYPE.BAD;
        }
        segments = segments || uri.split('.');
        if (segments[0] === '$cores') {
            switch (segments.length) {
                case 4: {
                    return (segments[1] === 'all' || !isNaN(+segments[1])) ? BIND_TYPE.FIELD : BIND_TYPE.BAD;
                }
                case 3: {
                    return segments[1] === 'all' ? BIND_TYPE.REGISTER_ALL : isNaN(+segments[1]) ? BIND_TYPE.BAD : BIND_TYPE.CORE_REGISTER;
                }
                default: {
                    return BIND_TYPE.BAD;
                }
            }
        }
        const firstSegmentFirstChar = segments[0].charAt(0);
        if (firstSegmentFirstChar === '$') {
            return BIND_TYPE.USER; // any uri beginning with a $
        }
        else if (firstSegmentFirstChar === calculatedBindingsPrefix) {
            return BIND_TYPE.CALCULATED;
        }
        else if (segments.length === 2) {
            return BIND_TYPE.FIELD;
        }
        else if (segments.length > 2) {
            return BIND_TYPE.BAD;
        }
        return BIND_TYPE.ACTIVE_REGISTER;
    }
    ;
    updateUserPreferenceBind(bind, defaultValue) {
        defaultValue = defaultValue || this.deviceAddrsUserPreferenceDefaults.get(bind.name || '');
        if (defaultValue !== undefined) {
            bind.defaultValue = defaultValue;
            bind.status = null;
        }
        else {
            bind.status = Status.createErrorStatus(`Unknown User Preference Binding named: ${bind.toString()}`);
        }
    }
    ;
    updateCalculatedBind(bind) {
        var _a, _b;
        let bindExpression;
        const bindName = bind.name;
        if (((_a = this.registerJsonData) === null || _a === void 0 ? void 0 : _a.calculatedBindings) && bindName) {
            bindExpression = (_b = this.registerJsonData) === null || _b === void 0 ? void 0 : _b.calculatedBindings[bindName];
        }
        bind.updateReferenceBinding(bindExpression, this);
    }
    ;
    setParentEncoder(parent) {
        this.codec = parent;
    }
    ;
    deconfigure() {
        this.codec = undefined;
    }
    ;
    get _ignoreWriteOperationsWhenDisconnected() {
        return this.params.ignoreWriteOperationsWhenDisconnected || false;
    }
    ;
}
;
//# sourceMappingURL=RegisterModel.js.map
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
import { AbstractBindProvider } from './AbstractBindProvider';
import { isDisposable } from './IDisposable';
import { DataBinder } from './DataBinder';
import { NAME } from './IBind';
import { CollectionBindValue } from './CollectionBindValue';
import { Status } from './Status';
import { TiFiles } from '../../../ti-core-assets/lib/TiFiles';
import { ProgressCounter } from './ProgressCounter';
import './DataFormatter'; // this is required to register $hex formatters for example.
import { MathModel } from './MathModel';
import { PropertyModel } from './PropertyModel';
import { TiConsole as console } from '../../../ti-core-assets/lib/TiConsole';
import { WidgetModel } from './WidgetModel';
import { TiUtils } from '../../../ti-core-assets/lib/TiUtils';
const nullDataBinder = new (class {
    constructor() {
        this.enabled = false;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispose() {
    }
});
const matchIDRegEx = /\s+id="([^"]+)"/;
class BinderCollection {
    constructor() {
        this.binders = [];
        this._enabled = false;
    }
    set enabled(enable) {
        if (this._enabled !== enable) {
            this._enabled = enable;
            this.binders.forEach((binder) => binder.enabled = enable);
        }
    }
    ;
    get enabled() {
        return this._enabled;
    }
    add(binder) {
        if (binder) {
            this.binders.push(binder);
            binder.enabled = this.enabled;
        }
    }
    ;
    dispose() {
        this.enabled = false;
    }
    ;
}
;
/**
 * Singleton class where all bindings, and binding expressions are
 * registered. This is also where data model {gc.databind.IBindFactory}
 * instances are registered.
 *
 * @constructor
 * @implements {gc.databind.IBindProvider}
 */
class BindingRegistry extends AbstractBindProvider {
    constructor() {
        super(...arguments);
        this.models = new Map();
        this.bindingCollections = new Map();
    }
    /**
     * Register a data model with the binding registry. At least one model must
     * be registered in order for this class to be able to create bindings.
     *
     * @param {gc.databind.IBindFactory} model - the models binding factory to
     *        create new bindings.
     * @param {boolean} [makedefault] - optional flag to make this the new
     *        default model.
     * @param {string} [alias] - optional alias that can be used in place of the model name, for example, $ for widget
     */
    registerModel(model, makeDefault = false, alias) {
        const name = model.id;
        // use first registered model as default, if not already specified.
        this.defaultModelName = this.defaultModelName || name;
        if (makeDefault) {
            this.defaultModelName = name;
        }
        this.models.set(name, model);
        if (alias && !this.models.has(alias)) {
            this.models.set(alias, model); // don't overwrite a real model name with an alias.
        }
    }
    ;
    /**
     * get a data model that has already been registered with this binding provider.
     *
     * @param {string} [name] - identifier for the model. E.g. widget. If
     *        missing returns the default model.
     * @returns {gc.databind.IBindFactory} - the model found or undefined if it
     *          is not registered.
     */
    getModel(name) {
        name = name || this.defaultModelName; // use default if not specified.
        return name ? this.models.get(name) || null : null;
    }
    ;
    /**
     * Combined Getter/Setter for the default model name. Called without
     * parameters and it will return the name of the current default model.
     * E.g. let name = registry.defaultModel(); Pass in a model name and it
     * will change the default model to the one specified; for example,
     * registry.defaultModel("widget"); Usually binding names start with the
     * model identifier; for example, "widget.widgetid.property". However, if
     * the default model is set to "widget", then users can omit the model
     * identifier and use binding names like "widgetid.property" as a short cut.
     *
     * @param {string} [name] - identifier for the new default model when used
     *        as a setter function. E.g. widget.
     * @param {gc.databind.IBindFactory} model - the name of the default model
     *        when used as getter, or the this pointer when used as a setter.
     */
    get defaultModel() {
        return this.defaultModelName;
    }
    ;
    set defaultModel(name) {
        this.defaultModelName = name;
    }
    ;
    /**
     * Method to delete and dispose of all bindings and models in the binding
     * registry.
     */
    dispose() {
        super.dispose();
        this.models.forEach((model) => {
            if (isDisposable(model)) {
                model.dispose();
            }
        });
        this.models.clear();
        this.defaultModelName = undefined;
    }
    ;
    parseModelFromBinding(uri) {
        let modelFactory = null;
        let pos = uri.indexOf('.');
        if (pos > 0) {
            let modelName = uri.substring(0, pos);
            if (modelName === 'widget' || modelName === '$') {
                const endPos = uri.indexOf('.', pos + 1);
                if (endPos > 0) {
                    const widgetModelName = uri.substring(pos + 1, endPos);
                    if (this.getModel(widgetModelName)) {
                        modelName = widgetModelName;
                        pos = endPos;
                    }
                }
            }
            modelFactory = this.getModel(modelName);
            if (modelFactory) {
                uri = uri.substring(pos + 1);
            }
        }
        modelFactory = modelFactory || this.getModel();
        if (!modelFactory) {
            throw new Error('There is no default model for bindings');
        }
        return { model: modelFactory, bindName: uri };
    }
    ;
    /**
     * Method to disable a binding previously created using the bind() method.
     * This will also unregister the two bind values that are being bound together.
     * If no other binding or expression is using the bind values, then garbage collection
     * will dispose of them.  Otherwise, new bindings may create additional bindValues
     * and you will end up with multiple bindValues for the same model or target data.
     * This will not cause problems, but is less efficient.
     *
     * @param {gc.databind.IDataBinder} binder - the binding to delete.
     *        as a setter function. E.g. widget.
     * @param {gc.databind.IBindFactory} model - the name of the default model
     *        when used as getter, or the this pointer when used as a setter.
     */
    unbind(binder) {
        binder.enabled = false;
    }
    ;
    createBindingCollection(bindings) {
        if (typeof bindings === 'object') {
            const result = new Map();
            for (const name in bindings) {
                // eslint-disable-next-line no-prototype-builtins
                if (bindings.hasOwnProperty(name)) {
                    let binding;
                    // @ts-ignore
                    const bindName = bindings[name];
                    try {
                        binding = this.getBinding(bindName);
                    }
                    catch (e) {
                        throw new Error(`Can't parse binding "${bindName}".\n${e}`);
                    }
                    if (binding !== null) {
                        result.set(name, binding);
                    }
                    else {
                        throw new Error(`Binding "${bindName}" could not be found.`);
                    }
                }
            }
            return new CollectionBindValue(result);
        }
        else {
            try {
                return this.getBinding(bindings);
            }
            catch (message) {
                throw new Error(`Can't parse binding "${bindings}".\n${message}`);
            }
        }
    }
    ;
    /**
     * <p>
     * Method to bind together a target and a model binding.
     * </p>
     * <p>
     * The difference between the target binding and the model binding is
     * subtle. The modelBinding contains the initial value. Otherwise there is
     * no distinction between model and target. Once the bindings are bound
     * together, their value and status will forever be the same. If either
     * value of status changes on one binding, the other will be updated to
     * reflect the change. This is typically used to keep widget and model data
     * in sync.
     * </p>
     * <p>
     * This method returns a binder object that can be used to control the
     * enabled disabled state of this two-way data binding between target and
     * model bindings.
     * </p>
     *
     * @param {string|object} targetBinding - name or expression for the target
     *        binding.
     * @param {string|object} modelBinding - name or expression for the model
     *        binding.
     * @param {function} [getter] - getter/preprocessing for a computed value
     * @param {function} [setter] - setter/postprocessing for a computed value
     * @returns {IDataBinder} - interface to control the binding created between
     *          the the target and model bindings.
     */
    bind(targetBinding, modelBinding, getter, setter) {
        let targetBind = null;
        let modelBind = null;
        try {
            targetBind = this.createBindingCollection(targetBinding);
            modelBind = this.createBindingCollection(modelBinding);
            return DataBinder.bind(targetBind, modelBind, getter, setter);
        }
        catch (e) {
            const errorStatus = Status.createErrorStatus(e.message);
            if (targetBind) {
                targetBind.status = errorStatus;
            }
            else {
                try {
                    if (!modelBind) {
                        modelBind = typeof modelBinding === 'object' ? this.createBindingCollection(modelBinding) : this.getBinding(modelBinding);
                    }
                    if (modelBind) {
                        modelBind.status = errorStatus;
                    }
                    // eslint-disable-next-line no-empty
                }
                catch (err) {
                }
            }
            console.error(NAME, e);
            return nullDataBinder;
        }
    }
    ;
    getDefaultBindingFile() {
        try {
            let path = window.location.pathname;
            const pos = path.lastIndexOf('/');
            if (pos !== path.length - 1) {
                path = path.substring(pos + 1);
                return path.replace('.html', '.json');
            }
        }
        catch (e) { /* do nothing */ }
        return 'index.json';
    }
    ;
    getDefaultPropertyFile() {
        return 'index_prop.json';
    }
    ;
    unloadBindingsFromFile(jsonFile) {
        jsonFile = jsonFile || this.getDefaultBindingFile();
        const binder = this.bindingCollections.get(jsonFile);
        if (binder) {
            binder.enabled = false;
        }
    }
    ;
    async loadBindingsFromFile(jsonFile) {
        jsonFile = jsonFile || this.getDefaultBindingFile();
        let results = this.bindingCollections.get(jsonFile);
        if (!results) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await TiFiles.readJsonFile(jsonFile);
                results = new BinderCollection();
                this.bindingCollections.set(jsonFile, results);
                if (data) {
                    for (const prop in data.widgetBindings) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (data.widgetBindings.hasOwnProperty(prop)) {
                            const wb = data.widgetBindings[prop];
                            // set the default type for the widget binding
                            const widgetBindName = `widget.${wb.widgetId}.${wb.propertyName}`;
                            if (wb.options && wb.options.dataType) {
                                const widgetBind = this.getBinding(widgetBindName);
                                let defaultType = wb.options.dataType.toLowerCase();
                                if (defaultType === 'long' || defaultType === 'short' || defaultType === 'int' || defaultType === 'double' || defaultType === 'float') {
                                    defaultType = 'number';
                                }
                                if (widgetBind && widgetBind.setDefaultType) {
                                    widgetBind.setDefaultType(defaultType);
                                }
                                else {
                                    console.error(NAME, `Cannot set default type on binding "${widgetBindName}" becaue it does not exist.`);
                                }
                            }
                            // Binding records with no widgetId are used to initialize backplane bindings.
                            if (!wb.widgetId && wb.serverBindName && wb.options && (typeof wb.options.defaultValue !== 'undefined')) {
                                const bind = this.getBinding(wb.serverBindName);
                                if (bind) {
                                    bind.setValue(wb.options.defaultValue);
                                }
                                else {
                                    console.error(NAME, `Cannot set default binding value because the binding "${wb.serverBindName}" does not exist.`);
                                }
                            }
                            else {
                                const binder = this.bind(widgetBindName, wb.serverBindName);
                                if (binder) {
                                    results.add(binder);
                                }
                                else {
                                    console.error(NAME, `Cannot find binding "${widgetBindName}", that is referenced in json file "${jsonFile}".`);
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error(NAME, error);
                return nullDataBinder;
            }
            ;
        }
        results.enabled = true;
        return results;
    }
    ;
    async loadPropertiesFromFile(model, jsonFile) {
        jsonFile = jsonFile || this.getDefaultPropertyFile();
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsonData = await TiFiles.readJsonFile(jsonFile);
            return jsonData ? jsonData[model] : undefined;
        }
        catch (error) {
            console.error(NAME, error);
            return undefined;
        }
        ;
    }
    ;
    parseBindingsFromGist(modelName, arrayOfLines, modelID) {
        const re = new RegExp('\\s+(\\w+)\\s*=\\s*"\\s*{{\\s*\\$\\.' + modelName + '\\.([a-zA-Z0-9_\\.$]+)', 'g');
        const bindingsData = [];
        if (this.defaultModel === modelID) {
            modelID = '';
        }
        else {
            modelID = modelID + '.';
        }
        for (let i = 0; i < arrayOfLines.length; i++) {
            const pos = arrayOfLines[i].indexOf('$.' + modelName + '.');
            if (pos >= 0) {
                // parse binding expression and property name
                const matches = arrayOfLines[i].match(matchIDRegEx);
                if (matches) {
                    const widgetId = matches[1];
                    let match = re.exec(arrayOfLines[i]);
                    while (match) {
                        const bindingExpression = match[2];
                        const propertyName = match[1];
                        bindingsData.push({
                            propertyName: propertyName,
                            serverBindName: modelID + bindingExpression,
                            widgetId: widgetId
                        });
                        match = re.exec(arrayOfLines[i]);
                    }
                }
            }
        }
        return bindingsData;
    }
    ;
    saveJsonFile(jsonFile, jsonObject) {
        return TiFiles.writeJsonFile(jsonFile, jsonObject);
    }
    ;
    savePropertiesToFile(jsonFile, properties) {
        jsonFile = jsonFile || this.getDefaultPropertyFile();
        return this.saveJsonFile(jsonFile, properties);
    }
    ;
    saveBindingsToFile(jsonFile, bindings) {
        let jsonObject = bindings;
        if (bindings instanceof Array) {
            jsonObject = {
                widgetBindings: bindings
            };
        }
        jsonFile = jsonFile || this.getDefaultBindingFile();
        return this.saveJsonFile(jsonFile, jsonObject);
    }
    ;
}
;
export const bindingRegistry = new BindingRegistry();
bindingRegistry.registerModel(new MathModel());
bindingRegistry.registerModel(new PropertyModel());
bindingRegistry.registerModel(WidgetModel.instance, true, '$');
export const modelsReady = new ProgressCounter();
setTimeout(() => {
    modelsReady.done();
}, 10);
// Fire ready event for gc.databind.ready
modelsReady.promise.then(function () {
    try {
        if (window.document.dispatchEvent) {
            window.document.dispatchEvent(new CustomEvent('gc-databind-ready', { detail: { registry: bindingRegistry } }));
        }
        if (!TiUtils.rootWin.TIDesigner) {
            bindingRegistry.loadBindingsFromFile();
        }
    }
    catch (e) {
        // ignore errors, most likely do to windows not being defined for mocha test case.
    }
});
//# sourceMappingURL=BindingRegistry.js.map
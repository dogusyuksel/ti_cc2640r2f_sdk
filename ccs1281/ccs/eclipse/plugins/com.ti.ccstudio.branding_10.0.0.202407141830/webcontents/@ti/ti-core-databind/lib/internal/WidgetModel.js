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
import { valueChangedEventType } from './IBindValue';
import { AbstractBindValue, blockNewEditUndoOperationCreation } from './AbstractBindValue';
import { AbstractBindFactory } from './AbstractBindFactory';
import { NAME } from './IBind';
import { EventType } from '../../../ti-core-assets/lib/Events';
import { TiUtils } from '../../../ti-core-assets/lib/TiUtils';
import { TiConsole } from '../../../ti-core-assets/lib/TiConsole';
;
;
;
;
;
export const userEditEvent = new EventType('user edit');
class EditOperation {
    constructor(bind, oldValue, newValue, time) {
        this.bind = bind;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.time = time;
    }
    ;
    undo() {
        this.bind.setValue(this.oldValue);
    }
    ;
    redo() {
        this.bind.setValue(this.newValue);
    }
    ;
    toString() {
        return 'edit';
    }
    ;
    canMergeOperation(bind, newValue, now) {
        // make sure it's also different from original value; e.g.,
        // checkbox toggled quickly.
        return bind === this.bind && now - this.time < 250 && this.oldValue !== newValue;
    }
    ;
    mergeOperation(newValue, time) {
        this.newValue = newValue;
        this.time = time;
        this.redo(); // perform action now.
    }
    ;
}
;
class WidgetBindValue extends AbstractBindValue {
    constructor(widget, widgetProperty, initialValue) {
        super();
        this.widgetProperty = widgetProperty;
        this.excludeFromStorageProviderData = true;
        this.doUserEditOperation = () => {
            const widget = this.widget;
            if (widget) {
                const oldValue = this.getValue();
                const newValue = widget[this.widgetProperty];
                if (oldValue !== newValue) {
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    WidgetModel.doUserEditOperation(this, newValue, oldValue);
                    this.excludeFromStorageProviderData = false;
                }
            }
        };
        this.onFirstValueChangedListenerAdded = () => {
            const widget = this.widget;
            if (widget) {
                widget.addEventListener(this.changedPropertyEventName, this.doUserEditOperation);
                const oldStatus = this.status;
                if (oldStatus) {
                    // restore status indicators for the new widget.
                    widget.errorMessage = oldStatus.message;
                }
            }
        };
        this.onLastValueChangedListenerRemoved = () => {
            const widget = this.widget;
            if (widget) {
                widget.removeEventListener(this.changedPropertyEventName, this.doUserEditOperation);
                const oldStatus = this.status;
                if (oldStatus) {
                    // remove status indicators that are tied to this widget
                    widget.errorMessage = undefined;
                }
                // next time we have to bind to the widget, lets use a fresh widget pointer
                // this way we support unbind from widgets, recreate widgets, then bind to new widgets.
                this._widget = undefined;
            }
        };
        this.widgetId = widget.id;
        this._widget = widget;
        this.cachedValue = initialValue;
        this.changedPropertyEventName = TiUtils.camelToDashCase(widgetProperty) + '-changed';
        this.addEventListenerOnFirstAdded(valueChangedEventType, this.onFirstValueChangedListenerAdded);
        this.addEventListenerOnLastRemoved(valueChangedEventType, this.onLastValueChangedListenerRemoved);
        const streamingListener = widget[widgetProperty + 'StreamingDataListener'];
        if (streamingListener && typeof streamingListener === 'function') {
            this.onStreamingDataReceived = streamingListener.bind(widget);
        }
    }
    ;
    onValueChanged(details) {
        this.excludeFromStorageProviderData = true;
        const widget = this.widget;
        if (widget) {
            // widget available, so update property
            widget[this.widgetProperty] = details.newValue;
        }
    }
    ;
    get widget() {
        this._widget = this._widget || document.querySelector('#' + this.widgetId) || undefined;
        return this._widget;
    }
    ;
    onStatusChanged(details) {
        if (this.widget) {
            if (details.oldStatus && this.widget) {
                this.widget.errorMessage = undefined;
            }
            if (details.newStatus) {
                this.widget.errorMessage = details.newStatus.message;
            }
        }
    }
    ;
}
;
export class WidgetModel extends AbstractBindFactory {
    constructor() {
        super('widget');
    }
    ;
    static findWidgetShallow(parent, uri) {
        const query = '#' + uri.split('.').join(' #');
        const result = ((window.Polymer && Polymer.dom) ? Polymer.dom(parent) : parent).querySelector(query);
        if (!result) {
            TiConsole.error(NAME, `Failed to find widget ${query}.`);
        }
        return result;
    }
    ;
    static findWidget(deepUri) {
        const shallowUri = deepUri.split('.$.');
        // @ts-ignore
        let result = this.findWidgetShallow(document, shallowUri[0]);
        for (let i = 1; result && i < shallowUri.length; i++) {
            if (result.shadowRoot) {
                result = this.findWidgetShallow(result.shadowRoot, shallowUri[i]);
            }
            else if (window.Polymer && Polymer.dom) {
                result = this.findWidgetShallow(result, shallowUri[i]);
            }
            else {
                TiConsole.error(NAME, `Cannot access shadow dom of widget ${shallowUri[i - 1]} in ${deepUri}`);
                return null;
            }
        }
        return result;
    }
    ;
    createNewBind(name) {
        let bind = null;
        const pos = name.lastIndexOf('.');
        if (pos > 0) {
            const widgetName = name.substring(0, pos);
            const widgetProperty = name.substring(pos + 1);
            const widget = WidgetModel.findWidget(widgetName);
            if (widget) {
                bind = new WidgetBindValue(widget, widgetProperty, widget[widgetProperty]);
            }
        }
        return bind;
    }
    ;
    static clearLastUserEditOperattion() {
        this.lastUndoOperation = undefined;
    }
    ;
    static doUserEditOperation(bind, newValue, oldValue) {
        const lastOperation = this.lastUndoOperation;
        const now = Date.now();
        if (lastOperation && lastOperation.canMergeOperation(bind, newValue, now)) {
            lastOperation.mergeOperation(newValue, now);
        }
        else if (oldValue !== undefined && newValue !== undefined && !blockNewEditUndoOperationCreation) {
            const operation = new EditOperation(bind, oldValue, newValue, now);
            this.instance.fireEvent(userEditEvent, { operation: operation });
            operation.redo();
            this.lastUndoOperation = operation;
        }
        else {
            bind.setValue(newValue);
        }
    }
}
WidgetModel.instance = new WidgetModel();
;
//# sourceMappingURL=WidgetModel.js.map
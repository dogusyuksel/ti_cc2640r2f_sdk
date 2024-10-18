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
import { DSEvalBind } from './internal/DSEvalBind';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { EncoderType, DecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
import { AbstractPollingDataModel, VariableBindValue, valueChangedEventType, QUALIFIER, bindingRegistry } from '../../ti-core-databind/lib/CoreDatabind';
;
;
;
export const ProgramModelDecoderType = new DecoderType('pm');
export const ProgramModelEncoderType = new EncoderType('GEL');
class QualifiedBindFactory {
    constructor(qualifier) {
        this.qualifier = qualifier;
    }
    create(bind) {
        if (!bind.setQualifier) {
            return null;
        }
        else {
            bind.setQualifier(this.qualifier);
            return bind;
        }
    }
}
;
export class ProgramModel extends AbstractPollingDataModel {
    constructor(params) {
        super(params.id || 'pm');
        this.decoderInputType = ProgramModelDecoderType;
        this.decoderOutputType = ProgramModelEncoderType;
        const activeDebugContext = new VariableBindValue('');
        this.modelBindings.set('$active_context_name', activeDebugContext);
        activeDebugContext.addEventListener(valueChangedEventType, () => {
            // clear out critical errors on every context change
            const bindings = this.getAllBindings();
            bindings.forEach((bind) => {
                if (bind && bind.onDisconnected) {
                    bind.onDisconnected();
                }
            });
            // force a read on all bindings for the new context.
            this.doRefreshAllBindngs();
        });
        for (const qualifier in QUALIFIER) {
            this.addQualifier(qualifier, new QualifiedBindFactory(qualifier));
        }
        bindingRegistry.registerModel(this);
        CodecRegistry.register(this);
    }
    ;
    createNewBind(uri) {
        let result = super.createNewBind(uri);
        result = result || new DSEvalBind(uri, this.defaultRefreshBinding, this);
        return result;
    }
    ;
    async invokeMethod(method, args) {
        var _a;
        let expression = method.trim();
        if (expression.startsWith('GEL_')) {
            expression = expression + '(' + (args ? args.join(', ') : '') + ')';
        }
        if (!this.isConnected()) {
            await this.whenConnected();
        }
        return (_a = this.codec) === null || _a === void 0 ? void 0 : _a.readValue(expression).then(function (data) {
            try {
                return Number.parseInt(data, 16);
            }
            catch (e) {
                return -1;
            }
        });
    }
    ;
    setParentEncoder(parent) {
        this.codec = parent;
    }
    ;
    deconfigure() {
        this.codec = undefined;
    }
}
;
//# sourceMappingURL=ProgramModel.js.map
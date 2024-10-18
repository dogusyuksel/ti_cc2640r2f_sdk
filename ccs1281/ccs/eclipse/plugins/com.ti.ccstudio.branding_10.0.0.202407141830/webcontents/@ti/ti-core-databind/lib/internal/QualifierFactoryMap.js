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
const QUALIFIER_PREFIX = '.$';
const QUALIFIER_PARAM_REGEX = /\d+$/;
export class QualifierFactoryMap {
    constructor() {
        this.instanceQualifierFactoryMap = {};
    }
    static add(name, factory) {
        this.globalQualifierFactoryMap[QUALIFIER_PREFIX + name] = factory;
    }
    ;
    add(name, factory) {
        this.instanceQualifierFactoryMap[QUALIFIER_PREFIX + name] = factory;
    }
    ;
    static getQualifier(name, instanceQualifierFactoryMap) {
        const pos = name.lastIndexOf(QUALIFIER_PREFIX);
        if (pos > 0) {
            let qualifierName = name.substring(pos).toLowerCase();
            const paramArray = qualifierName.match(QUALIFIER_PARAM_REGEX);
            let param;
            if (paramArray) {
                qualifierName = qualifierName.substring(0, qualifierName.length - paramArray[0].length);
                param = +paramArray[0];
            }
            let qualifierFactory = this.globalQualifierFactoryMap[qualifierName];
            if (instanceQualifierFactoryMap) {
                qualifierFactory = instanceQualifierFactoryMap[qualifierName] || qualifierFactory;
            }
            if (qualifierFactory) {
                return { bindName: name.substring(0, pos), qualifier: qualifierFactory, param: param };
            }
        }
        return { bindName: name };
    }
    ;
    getQualifier(name) {
        return QualifierFactoryMap.getQualifier(name, this.instanceQualifierFactoryMap);
    }
    ;
}
QualifierFactoryMap.globalQualifierFactoryMap = {};
;
//# sourceMappingURL=QualifierFactoryMap.js.map
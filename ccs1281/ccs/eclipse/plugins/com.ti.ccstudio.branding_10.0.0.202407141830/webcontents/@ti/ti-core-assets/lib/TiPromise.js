/*
    Copyright (c) 2020, Texas Instruments Incorporated
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

    *   Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
    *   Neither the name of Texas Instruments Incorporated nor the names of
        its contributors may be used to endorse or promote products derived
        from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
    THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
    CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
    EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
    OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
    WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
    OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
;
;
/**
 * Helper functions to aid in migration from Q promises to ES6 promises
 *
 */
export class TiPromise extends Promise {
    static defer() {
        let resolveFn = function (value) { };
        let rejectFn = function (reason) { };
        const promise = new TiPromise(function (resolve, reject) {
            resolveFn = resolve;
            rejectFn = reject;
        });
        return {
            resolve: resolveFn,
            reject: rejectFn,
            promise: promise
        };
    }
    ;
    static allSettled(promises) {
        const wrappedPromises = promises.map((p) => this.resolve(p).then((val) => ({ state: 'fulfilled', value: val }), (err) => ({ state: 'rejected', reason: err })));
        return this.all(wrappedPromises);
    }
    ;
    static timeout(promise, time, message) {
        const defered = TiPromise.defer();
        let done = false;
        const timer = window.setTimeout(() => {
            if (!done) {
                done = true;
                defered.reject(message);
            }
        }, time);
        promise.then(value => {
            if (!done) {
                done = true;
                window.clearTimeout(timer);
                defered.resolve(value);
            }
        }).catch(reason => {
            if (!done) {
                done = true;
                window.clearTimeout(timer);
                defered.reject(reason);
            }
        });
        return defered.promise;
    }
}
;
//# sourceMappingURL=TiPromise.js.map
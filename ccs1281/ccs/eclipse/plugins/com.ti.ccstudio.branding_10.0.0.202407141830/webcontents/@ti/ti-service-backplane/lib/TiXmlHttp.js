/*
    Copyright (c) 2015-2020, Texas Instruments Incorporated
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
import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
/**
 * xmlhttp helper functions
 *
 * @namespace
 */
const TiXmlHttp = {
    /*
     * call this if you know the URL is not for the localhost and do not want to wait
     * for a timeout to occur if the user is not online
     */
    httpGetIfOnline(theUrl, responseType) {
        if (!navigator.onLine) {
            throw new Error('httpGet: not online');
        }
        else {
            return TiXmlHttp.httpGet(theUrl, responseType);
        }
    },
    async httpGet(theUrl, responseType) {
        const deferred = TiPromise.defer();
        const xmlhttp = new XMLHttpRequest();
        if (xmlhttp.open !== undefined) {
            xmlhttp.onreadystatechange = function () {
                const successStatusCode = 200;
                if (xmlhttp.readyState === 4) {
                    switch (xmlhttp.status) {
                        case successStatusCode:
                            deferred.resolve(xmlhttp.responseText);
                            break;
                        default:
                            if ((xmlhttp.status < 300) || (xmlhttp.status > 400)) {
                                let msg = xmlhttp.responseText;
                                if ((!msg) || (msg.length === 0)) {
                                    msg = 'httpGet: readyState = 4, status = ' + xmlhttp.status + ' for url=' + theUrl;
                                }
                                deferred.reject(msg);
                            }
                            else {
                                TiConsole.debug('TiXmlHttp', 'httpGet: readyState=4, statusCode=' + xmlhttp.status + ' (treating as redirect...)');
                            }
                            break;
                    }
                }
            };
            xmlhttp.open('GET', theUrl, true); // async request specified by 3rd param = true
            if (responseType) {
                xmlhttp.responseType = responseType;
            }
            else {
                xmlhttp.responseType = 'text';
            }
            xmlhttp.send();
        }
        else {
            deferred.reject('Not running in a browser');
        }
        return deferred.promise;
    },
    postData(params, async, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/analytics', async);
        //Send the proper header information along with the request
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (callback) {
                    callback(xhr.responseText);
                }
            }
        };
        xhr.send(params);
    },
    pingJSONFile(file, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', file);
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                /*Check if response is json string*/
                try {
                    JSON.parse(xhr.response);
                    callback(file);
                }
                catch (e) {
                    callback(null);
                }
            }
            else {
                callback(null);
            }
        };
        xhr.onerror = function () {
            callback(null);
        };
        xhr.send();
    }
};
export { TiXmlHttp };
// window.TiXmlHttp = TiXmlHttp;
//# sourceMappingURL=TiXmlHttp.js.map
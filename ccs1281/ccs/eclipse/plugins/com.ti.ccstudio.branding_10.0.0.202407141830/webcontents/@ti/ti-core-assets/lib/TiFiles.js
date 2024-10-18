/**
 *  Copyright (c) 2019-2020 Texas Instruments Incorporated
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
const MODULE_NODE = 'TiFiles';
const console = new TiConsole(MODULE_NODE);
const cache = {};
const nullParser = (data) => {
    return data;
};
const saveFile = (fileURL, data, formatter) => {
    // TODO: do we need to support writing a binary file?
    // TODO: do we need to handle nw differently?
    /* NodeJS save */
    if (TiUtils.isNodeJS) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs-extra');
        cache[fileURL] = fs.writeFile(fileURL, formatter(data));
        /* browser save */
    }
    else {
        cache[fileURL] = new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.onerror = (event) => {
                const message = `file failed to write file contents due to: ${event.error}`;
                console.error(message);
                reject(message);
            };
            req.onload = () => {
                resolve(data);
            };
            req.open('PUT', fileURL, true);
            req.send(formatter(data));
        });
    }
    return cache[fileURL];
};
const unloadFile = (fileURL) => {
    delete cache[fileURL];
};
const loadFile = (fileURL, parser, responseType, force) => {
    // TODO: do we need to handle nw differently?
    if (force)
        unloadFile(fileURL);
    let promise = cache[fileURL];
    if (!promise) {
        /* NodeJS read */
        if (TiUtils.isNodeJS) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const fs = require('fs-extra');
            promise = fs.readFile(fileURL, responseType !== 'blob' ? 'utf-8' : undefined);
            /* browser read */
        }
        else {
            promise = new Promise((resolve, reject) => {
                const xmlHttp = new XMLHttpRequest();
                xmlHttp.onloadend = () => {
                    if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 0)) {
                        try {
                            resolve(responseType ? xmlHttp.response : xmlHttp.responseText);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                    else {
                        reject(`Can't read file: ${fileURL}.  Status Code = ${xmlHttp.status}`);
                    }
                };
                xmlHttp.open('GET', fileURL, true);
                if (responseType) {
                    xmlHttp.responseType = responseType;
                }
                xmlHttp.send();
            });
        }
        cache[fileURL] = promise = promise.then((data) => {
            try {
                return parser(data);
            }
            catch (e) {
                console.error(`file parse error: ${e.toString()}`);
                throw e;
            }
        }).catch((e) => {
            console.error(e.toString());
            unloadFile(fileURL);
            throw e;
        });
    }
    return promise;
};
/**
 * Provides file access API for the application.
 */
export class TiFiles {
    /**
     * Read a JSON file and return the JSON object.
     *
     * @param {string} fileURL the URL to read the file
     * @param {boolean} force force a read, otherwise return the cached value
     * @return {Promise<object>} a promise
     */
    static readJsonFile(fileURL, force = true) {
        return loadFile(fileURL, JSON.parse, 'text', force);
    }
    /**
     * Read a text file.
     *
     * @param {string} fileURL the URL to read the file
     * @param {boolean} force force a read, otherwise return the cached value
     * @returns {Promise<string>} a promise
     */
    static readTextFile(fileURL, force = true) {
        return loadFile(fileURL, nullParser, 'text', force);
    }
    /**
     * Read a binary file.
     *
     * @param {string} fileURL the URL to read the binary
     * @param {boolean} force force a read, otherwise return the cached value
     * @returns {Promise<Buffer>} a promise
     */
    static readBinaryFile(fileURL, force = true) {
        return loadFile(fileURL, nullParser, 'blob', force).then(data => {
            if (data instanceof Blob) {
                // @ts-ignore
                return data.arrayBuffer();
            }
            else {
                return data;
            }
        });
    }
    /**
     * Write a JSON object to a file.
     *
     * @param {string} fileURL the URL to write the file
     * @param {object} jsonData the JSON object
     * @returns {Promise<string>} a promise
     */
    static writeJsonFile(fileURL, jsonData) {
        return saveFile(fileURL, jsonData, data => JSON.stringify(data, null, 4));
    }
    /**
     * Write the text to a file.
     *
     * @param {string} fileURL the URL to write the file
     * @param {string} textData the text to write
     * @returns {Promise<string>} a promise
     */
    static writeTextFile(fileURL, textData) {
        return saveFile(fileURL, textData, nullParser);
    }
}
//# sourceMappingURL=TiFiles.js.map
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
import { TiLocalStorage } from '../../ti-core-assets/lib/TiLocalStorage';
let outputListener = console;
let outputMode = 'log';
const STORAGE_NAME = 'TiConsole';
const getStorageItem = () => JSON.parse(TiLocalStorage.getItem(STORAGE_NAME) || '{}');
let moduleLogLevels = getStorageItem();
const trace = (options, message, params) => {
    const { moduleName, type, level, style } = options;
    let msg;
    if (!moduleName || (moduleLogLevels['all'] && (moduleLogLevels['all'] >= level)) ||
        (moduleLogLevels[moduleName] && (moduleLogLevels[moduleName] >= level))) {
        msg = '[' + moduleName + '] ' + type + ': ' + (typeof message === 'function' ? message.call(null, ...params) : message);
    }
    if (msg) {
        if (outputMode === 'trace') {
            outputListener.groupCollapsed('%c' + msg, style);
            outputListener.trace('%c[' + moduleName + ' - callstack', 'font-weight: 100;');
            outputListener.groupEnd();
        }
        else {
            outputListener.log(msg);
        }
    }
};
/**
 * Provides console logging API.
 */
export class TiConsole {
    constructor(moduleName) {
        this.moduleName = moduleName;
    }
    /**
     * Helper method to log an API.
     *
     * @param methodName the name of the method
     * @param params the method parameters
     */
    logAPI(methodName, ...params) {
        this.debug(() => {
            const _params = params.filter((e) => e !== undefined).map((p) => {
                if (typeof p === 'string' && p.length > 128) {
                    return `${p.substr(0, 128)}...`;
                }
                else if (Array.isArray(p)) {
                    return '[' + p.reduce((data, item, index, array) => {
                        const text = item.toString();
                        return index === 0 ? text :
                            data + ',' + ((index === array.length - 1) ? text : text);
                    }, '') + ']';
                }
                else if (typeof p === 'object') {
                    return JSON.stringify(p);
                }
                else {
                    return p.toString();
                }
            });
            return `${methodName}(${Array.prototype.slice.call(_params)})`;
        });
    }
    /**
     * Logs a `log` message to the console.
     *
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    log(message, ...params) {
        TiConsole.log(this.moduleName, message, ...params);
    }
    /**
     * Logs an `info` message to the console.
     *
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    info(message, ...params) {
        TiConsole.info(this.moduleName, message, ...params);
    }
    /**
     * Logs an `error` message to the console.
     *
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    error(message, ...params) {
        TiConsole.error(this.moduleName, message, ...params);
    }
    /**
     * Log a `warning` message to the console.
     *
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    warning(message, ...params) {
        TiConsole.warning(this.moduleName, message, ...params);
    }
    /**
     * Logs a `debug` message to the console.
     *
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    debug(message, ...params) {
        TiConsole.debug(this.moduleName, message, ...params);
    }
    /**
     * Sets the logging level for a specific module.
     *
     * @param {string|number} level one of the supported log level, errors|warnings|info|logs|debug|off or 0-5
     */
    setLevel(level) {
        TiConsole.setLevel(this.moduleName, level);
    }
    /**
     * Logs a `log` message to the console.
     *
     * @param {string} moduleName the name of the module
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    static log(moduleName, message, ...params) {
        trace({ moduleName: moduleName, style: 'font-weight: 100;', type: 'log', level: 4 }, message, params);
    }
    /**
     * Logs an `info` message to the console.
     *
     * @param {string} moduleName the name of the module
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    static info(moduleName, message, ...params) {
        trace({ moduleName: moduleName, style: 'font-weight: 100;', type: 'info', level: 3 }, message, params);
    }
    /**
     * Logs an `error` message to the console.
     *
     * @param {string} moduleName the name of the module
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    static error(moduleName, message, ...params) {
        trace({ moduleName: moduleName, style: 'color: #CC0000; font-weight: 100;', type: 'error', level: 1 }, message, params);
    }
    /**
     * Logs a `warning` message to the console.
     *
     * @param {string} moduleName the name of the module
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    static warning(moduleName, message, ...params) {
        trace({ moduleName: moduleName, style: 'color: #ff8000; font-weight: 100;', type: 'warn', level: 2 }, message, params);
    }
    /**
     * Logs a `debug` message to the console.
     *
     * @param {string} moduleName the name of the module
     * @param {string|MessageCallback} message the message or a callback function that returns the message
     * @param {...any} params the message callback function parameters
     */
    static debug(moduleName, message, ...params) {
        trace({ moduleName: moduleName, style: 'color: #007DCC; font-weight: 100;', type: 'debug', level: 5 }, message, params);
    }
    /**
     * Resets all module log levels.
     */
    static reset() {
        TiLocalStorage.removeItem(STORAGE_NAME);
        moduleLogLevels = {};
    }
    /**
     * Returns the log level for all the modules.
     *
     * @returns { Array<string> } the log levels
     */
    static getLevels() {
        const result = [];
        const item = getStorageItem();
        for (const [key, value] of Object.entries(item)) {
            let tmp = key + '=' + value;
            switch (value) {
                case 0:
                    tmp += ' (off)';
                    break;
                case 1:
                    tmp += ' (errors)';
                    break;
                case 2:
                    tmp += ' (errors & warnings)';
                    break;
                case 3:
                    tmp += ' (errors, warnings & info)';
                    break;
                case 4:
                    tmp += ' (errors, warnings, info & generic logs)';
                    break;
                case 5:
                    tmp += ' (all logs, including debug)';
                    break;
            }
            result.push(tmp);
        }
        return result;
    }
    /**
     * Sets the logging level for a specific module.
     *
     * @param {string} moduleName the module name to enable logging, `all` to enable for all modules
     * @param {string|number} level one of the supported log level, errors|warnings|info|logs|debug|off or 0-5
     */
    static setLevel(moduleName, level) {
        if (typeof level === 'string') {
            const val = '' + level;
            switch (val.toLowerCase()) {
                case 'errors':
                    level = 1;
                    break;
                case 'warnings':
                    level = 2;
                    break;
                case 'info':
                    level = 3;
                    break;
                case 'logs':
                    level = 4;
                    break;
                case 'debug':
                    level = 5;
                    break;
                case 'off':
                    level = 0;
                    break;
                default: level = Number(val);
            }
        }
        moduleLogLevels[moduleName] = level;
        TiLocalStorage.setItem(STORAGE_NAME, JSON.stringify(moduleLogLevels));
    }
    /**
     * Sets the output listener, can be use to override the default STDOUT behavior.
     *
     * @param listener the listener
     */
    static setOutputListener(listener) {
        outputListener = listener || console;
    }
    /**
     * Sets the console log mode.
     *
     * @param mode one of the log mode
     */
    static setMode(mode) {
        outputMode = mode;
    }
    /**
     * Prints the help text in the console.
     */
    static help() {
        const result = 'Help for TiConsole:\n' +
            '  - To see logs for a particular module, set a logging level for that module name (e.g. TiConsole.setLevel"ti-core-backplane", 5)).\n' +
            '  - To see logs for all modules, use a module name of "all" (e.g. TiConsole.setLevel("all", 5) ).\n' +
            '  - To see the location that logged the message, click on the triangle to the left of the message to expand the stack trace.\n\n' +
            'Colors: Red: error, Orange: warning, Black: info or a generic log, Blue: debug.\n\n' +
            'Commands: the following function calls can be called from the Chrome dev tools console window command line:\n' +
            'TiConsole.setLevel(moduleName, <0-5>)\n' +
            '  - creates a logging level for the specified module name. Use "all" for all modules.\n' +
            '  - value: 0 = remove logging, 1 = only errors, 2 = errors and warnings, 3 = errors, warnings, info, 4 = errors, warnings, info, logs, 5 = all\n' +
            'TiConsole.getLevels()\n' +
            '  - returns a list of all currently active module with logging enabled and its levels.\n' +
            'TiConsole.log(moduleName, msg)\n' +
            '  - To log messages, use TiConsole.log / TiConsole.error / TiConsole.warning / TiConsole.info / TiConsole.debug\n';
        outputListener.log(result);
    }
}
if (!TiUtils.isCCS && !TiUtils.isNodeJS)
    TiConsole.help();
//# sourceMappingURL=TiConsole.js.map
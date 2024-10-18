/**
 *  Copyright (c) 2019-2020, Texas Instruments Incorporated
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
/* eslint-disable prefer-rest-params */
/**
 * `ProgramLoaderService` handles downloading a binary file, erasing the target flash and burning the program into flash.
 * ### Usage
 * ```javascript
 * const service = ServicesRegistry.getService(programLoaderServiceType);
 * await service.loadProgram(debugCore, './target/myprogram.out');
 * await service.loadSymbols(debugCore, './target/mysymbols.out');
 * await service.loadBin(debugCore, './target/mybinary.bin');
 * await service.flash({
 *      coreName: 'Texas Instruments XDS110 USB Debug Probe_0/CORTEX_M4_0',
 *      connectionId: 'TIXDS110_Connection',
 *      deviceId: 'msp432p401r1',
 *      programOrBinPath: './target/myprogram.out'
 * });
 * ```
 * @packageDocumentation
 */
import { ServiceType, ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { Events } from '../../ti-core-assets/lib/Events';
import { dsServiceType, statusMessageEventType, Location, debugCoreType } from '../../ti-service-ds/lib/DSService';
import { TiFiles } from '../../ti-core-assets/lib/TiFiles';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
import { targetConfigServiceType } from '../../ti-service-target-config/lib/TargetConfigService';
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
export { statusMessageEventType } from '../../ti-service-ds/lib/DSService';
const TIMEOUT_MESSAGE = (param1) => `Timeout while loading ${param1}.`;
const DEFAULT_TIMEOUT = 75000;
const MODULE_NAME = 'ti-service-program-loader';
const console = new TiConsole(MODULE_NAME);
const updateFlashProgress = (monitor, message, progress) => {
    if (monitor.cancelled) {
        console.info('Flash aborted!');
        throw Error('Flash aborted!');
    }
    else {
        console.info(message);
        monitor.onProgress(message, progress);
    }
};
;
const DefaultProgressMonitor = new class {
    get cancelled() {
        return false;
    }
    onProgress(status, progress) {
        return true;
    }
};
;
export const programLoaderServiceType = new ServiceType(MODULE_NAME);
class ProgramLoaderService extends Events {
    constructor() {
        super(...arguments);
        this.dsService = ServicesRegistry.getService(dsServiceType);
        this.targetConfigService = ServicesRegistry.getService(targetConfigServiceType);
    }
    addEventListener(type, listener) {
        console.logAPI(`${ProgramLoaderService.name}::${this.addEventListener.name}`, ...arguments);
        switch (type) {
            case statusMessageEventType:
                this.dsService.addEventListener(statusMessageEventType, listener);
                break;
        }
        super.addEventListener(type, listener);
    }
    removeEventListener(type, listener) {
        console.logAPI(`${ProgramLoaderService.name}::${this.removeEventListener.name}`, ...arguments);
        switch (type) {
            case statusMessageEventType:
                this.dsService.removeEventListener(statusMessageEventType, listener);
                break;
        }
        super.removeEventListener(type, listener);
    }
    async loadProgram(core, programPath, verifyProgram = false, timeout = DEFAULT_TIMEOUT) {
        console.logAPI(this.loadProgram.name, ...arguments);
        this.fireEvent(statusMessageEventType, { type: 'info', message: 'Loading program...' });
        const binFile = await TiFiles.readBinaryFile(programPath);
        return await TiPromise.timeout(core.loadProgram(binFile, false, verifyProgram), timeout, TIMEOUT_MESSAGE('program')).catch(err => {
            this.fireEvent(statusMessageEventType, { type: 'error', message: TIMEOUT_MESSAGE('program') });
            throw err;
        });
    }
    ;
    async loadSymbols(core, symbolsPath, timeout = DEFAULT_TIMEOUT) {
        console.logAPI(this.loadSymbols.name, ...arguments);
        this.fireEvent(statusMessageEventType, { type: 'info', message: 'Loading symbols...' });
        const symbolsFile = await TiFiles.readBinaryFile(symbolsPath);
        return await TiPromise.timeout(core.loadProgram(symbolsFile, true, false), timeout, TIMEOUT_MESSAGE('symbols')).catch(err => {
            this.fireEvent(statusMessageEventType, { type: 'error', message: TIMEOUT_MESSAGE('symbols') });
            throw err;
        });
    }
    async loadBin(core, binPath, location, verifyProgramPath, timeout = DEFAULT_TIMEOUT) {
        console.logAPI(this.loadBin.name, ...arguments);
        this.fireEvent(statusMessageEventType, { type: 'info', message: 'Loading binary...' });
        if (verifyProgramPath) {
            try {
                const verifyProgramFile = await TiFiles.readBinaryFile(verifyProgramPath);
                await core.verifyProgram(verifyProgramFile);
                this.fireEvent(statusMessageEventType, { type: 'info', message: 'Verify program passed, skip loading program.' });
                return;
            }
            catch (e) {
                const message = 'Verify program failed, continue loading program.';
                console.info(message);
                this.fireEvent(statusMessageEventType, { type: 'info', message: message });
            }
        }
        const binFile = await TiFiles.readBinaryFile(binPath);
        return await TiPromise.timeout(core.loadBin(binFile, location, true), timeout, TIMEOUT_MESSAGE('bin')).catch(err => {
            this.fireEvent(statusMessageEventType, { type: 'error', message: TIMEOUT_MESSAGE('bin') });
        });
    }
    async flash(params, monitor = DefaultProgressMonitor, timeout = DEFAULT_TIMEOUT) {
        var _a;
        console.logAPI(this.flash.name, ...arguments);
        let doDeconfig = false;
        try {
            updateFlashProgress(monitor, 'Preparing device configuration file...', 0);
            let ccxml = undefined;
            if (params.ccxmlPath) {
                ccxml = await TiFiles.readTextFile(params.ccxmlPath);
            }
            else if (params.deviceId && params.connectionId) {
                ccxml = await this.targetConfigService.getConfig(TiUtils.OS, params.connectionId, params.deviceId);
            }
            else {
                throw Error('Invalid ccxml file input.');
            }
            updateFlashProgress(monitor, 'Configuring device...', 15);
            await this.dsService.configure(ccxml);
            doDeconfig = true;
            updateFlashProgress(monitor, 'Listing device cores...', 35);
            const [core] = (await this.dsService.listCores(debugCoreType)).filter(core => core.name === params.coreName);
            updateFlashProgress(monitor, `Connecting to core ${core.name}...`, 50);
            core.connect();
            updateFlashProgress(monitor, 'Flashing device...', 75);
            if (params.programOrBinPath.endsWith('.bin')) {
                await this.loadBin(core, params.programOrBinPath, new Location((_a = params.loadAddress) !== null && _a !== void 0 ? _a : 0), params.verifyProgramPath, params.timeout);
            }
            else if (params.symbolsOnly) {
                await this.loadSymbols(core, params.programOrBinPath, params.timeout);
            }
            else {
                await this.loadProgram(core, params.programOrBinPath, true, params.timeout);
            }
            updateFlashProgress(monitor, 'Flash completed!', 100);
        }
        finally {
            if (doDeconfig) {
                await this.dsService.deConfigure();
            }
        }
    }
}
;
ServicesRegistry.register(programLoaderServiceType, ProgramLoaderService);
//# sourceMappingURL=ProgramLoaderService.js.map
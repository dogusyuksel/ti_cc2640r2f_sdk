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
import { backplaneServiceType } from '../../ti-service-backplane/lib/BackplaneService';
import { ServicesRegistry, ServiceType } from '../../ti-core-services/lib/ServicesRegistry';
import { DebugCore, NonDebugCore } from './Core';
import { MODULE_NAME, AbstractDSModule, DSEventType } from './AbstractDSModule';
export * from './AbstractDSModule';
export * from './Core';
export const gelOutputEventType = new DSEventType('gelOutput');
export const configChangedEventType = new DSEventType('configChanged');
export const statusMessageEventType = new DSEventType('statusMessage');
export const dsServiceType = new ServiceType(MODULE_NAME);
/**
 * DS service implementation
 */
const backplaneService = ServicesRegistry.getService(backplaneServiceType);
class DSService extends AbstractDSModule {
    constructor(cores = []) {
        super('DS');
        this.cores = cores;
    }
    async configure(ccxml) {
        this.prolog(this.configure.name, ...arguments);
        // cache the DS module
        this.dsModule = await backplaneService.getSubModule('DS');
        // get the file module and write the ccxml file
        const fileModule = await backplaneService.getSubModule('File');
        const { path: ccxmlPath } = await fileModule.write('ds-service.ccxml', await (await backplaneService.getUtil()).encodeAsBase64(ccxml));
        // configure the ds module with the ccxml path
        const { cores, nonDebugCores } = await this.dsModule.configure(ccxmlPath);
        // get the core module for each core
        this.cores.push(...await Promise.all(cores.map(async (name) => new DebugCore(fileModule, name, await this.dsModule.getSubModule(name)))));
        this.cores.push(...await Promise.all(nonDebugCores.map(async (name) => new NonDebugCore(fileModule, name, await this.dsModule.getSubModule(name)))));
    }
    async deConfigure() {
        this.prolog(this.deConfigure.name, ...arguments);
        if (this.dsModule) {
            this.cores.splice(0, this.cores.length);
            await this.dsModule.deConfigure();
        }
    }
    async listCores(coreType) {
        this.prolog(this.listCores.name, ...arguments);
        return this.cores.filter(e => !coreType || coreType.asCore(e));
    }
}
ServicesRegistry.register(dsServiceType, DSService);
//# sourceMappingURL=DSService.js.map
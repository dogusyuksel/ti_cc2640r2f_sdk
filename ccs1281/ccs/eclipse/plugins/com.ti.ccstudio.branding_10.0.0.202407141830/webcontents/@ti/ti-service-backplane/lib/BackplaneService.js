/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-async-promise-executor */
import { ServicesRegistry, ServiceType } from '../../ti-core-services/lib/ServicesRegistry';
import { Events } from '../../ti-core-assets/lib/Events';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
import '../../../assets/lib/q.js'; // requried by agent.js
const MODULE_NAME = 'ti-service-backplane';
const console = new TiConsole(MODULE_NAME);
/**
 * Backplane service type.
 */
export const backplaneServiceType = new ServiceType(MODULE_NAME);
;
class BackplaneService extends Events {
    async init() {
        if (!this.initPromise) {
            console.logAPI(this.init.name, ...arguments);
            this.initPromise = new Promise(async (resolve, reject) => {
                let agent, TICloudAgent;
                try {
                    /* NodeJs environment */
                    if (TiUtils.isNodeJS) {
                        require('../../ti-core-assets/lib/NodeJSEnv');
                        require('../../../../../../runtime/ticloudagent/server/public/agent');
                        const agentHost = require('../../../../../../runtime/TICloudAgentHostApp/src/host_agent');
                        const info = await agentHost.start();
                        agent = await global.TICloudAgent.createClientModule(info.port);
                        TICloudAgent = global.TICloudAgent;
                        /* Browser environment */
                    }
                    else {
                        //@ts-ignore
                        await import('/ticloudagent/agent.js');
                        TICloudAgent = window.parent.TICloudAgent || window.TICloudAgent;
                        agent = await TICloudAgent.Init();
                    }
                    resolve({ agent: agent, TICloudAgent: TICloudAgent });
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        return this.initPromise;
    }
    async getSubModule(name) {
        console.logAPI(this.getSubModule.name, ...arguments);
        const { agent } = await this.init();
        return agent.getSubModule(name);
    }
    async getUtil() {
        console.logAPI(this.getUtil.name, ...arguments);
        const { TICloudAgent } = await this.init();
        return Promise.resolve(TICloudAgent.Util);
    }
}
ServicesRegistry.register(backplaneServiceType, BackplaneService);
//# sourceMappingURL=BackplaneService.js.map
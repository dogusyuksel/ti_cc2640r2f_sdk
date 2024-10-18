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
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-var-requires */
import { TiUtils } from '../../ti-core-assets/lib/TiUtils';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { ServicesRegistry, ServiceType } from '../../ti-core-services/lib/ServicesRegistry';
import { Events } from '../../ti-core-assets/lib/Events';
const MODULE_NAME = 'ti-service-target-configuration';
const console = new TiConsole(MODULE_NAME);
export const targetConfigServiceType = new ServiceType(MODULE_NAME);
export class TargetConfigService extends Events {
    constructor() {
        super();
        if (TiUtils.isNodeJS) {
            const path = require('path');
            const TargetConfig = require('./internal/TargetConfig').TargetConfig;
            this.targetConfig = new TargetConfig(path.resolve(__dirname, '../../../../../../runtime'));
        }
    }
    async getConfig(OS, connectionID, deviceID) {
        console.logAPI(this.getConfig.name, ...arguments);
        if (TiUtils.isNodeJS && this.targetConfig) {
            return await this.targetConfig.getConfig(OS, connectionID, deviceID);
        }
        else {
            const response = await fetch(`/ticloudagent/getConfig/${OS}/${connectionID}/${deviceID}`);
            return await response.text();
        }
    }
    async getConfigInfo(OS) {
        console.logAPI(this.getConfigInfo.name, ...arguments);
        if (TiUtils.isNodeJS && this.targetConfig) {
            return await this.targetConfig.getConfigInfo(OS);
        }
        else {
            const response = await fetch(`/ticloudagent/getConfigInfo?os=${OS}`);
            return await response.text();
        }
    }
}
ServicesRegistry.register(targetConfigServiceType, TargetConfigService);
//# sourceMappingURL=TargetConfigService.js.map
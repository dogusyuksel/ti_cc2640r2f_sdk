import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import { processArgs, ARG_DEVICE_NAME, ARG_ENABLE_LOG } from '../../ti-core-assets/test/TestArgs';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { dsServiceType, IDebugCore, debugCoreType, IGelOutputEvent, gelOutputEventType, IStatusMessageEvent, statusMessageEventType, IConfigChangedEvent, configChangedEventType } from '../lib/DSService';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { IListener } from '../../ti-core-assets/lib/Events';

/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('ti-service-ds', processArgs[ARG_ENABLE_LOG] as number);
/** *************************************************************************************************************************** */
describe('DSServiceTest', () => {
    const dsService = ServicesRegistry.getService(dsServiceType);
    let ccxml: string;

    before(async function() {
        if (processArgs[ARG_DEVICE_NAME] !== 'MSP432P401R') this.skip();
        ccxml = fs.readFileSync(path.join(__dirname, `assets/${processArgs[ARG_DEVICE_NAME]}.ccxml`), 'utf-8');
    });

    beforeEach(async function() {
        await dsService.configure(ccxml);
    });

    afterEach(async function() {
        await dsService.deConfigure();
    });

    it('config/deconfig', async function() {
        await dsService.deConfigure();
        await dsService.configure(ccxml);
    });

    it('listCores', async function() {
        const cores = await dsService.listCores();
        expect(cores).length.greaterThan(0);
    });

    it('gelOutputEvent', async function() {
        let received = 0;
        const [core] = await dsService.listCores<IDebugCore>(debugCoreType);
        const listener: IListener<IGelOutputEvent> = ( detail: IGelOutputEvent ) => {
            dsService.removeEventListener(gelOutputEventType, listener);
            received++;
        };
        dsService.addEventListener(gelOutputEventType, listener);

        await core.connect();
        expect(received).equal(1);
    });

    it('configChangedEvent', async function() {
        let received = 0;
        const listener: IListener<IConfigChangedEvent> = ( detail: IConfigChangedEvent ) => {
            dsService.removeEventListener(configChangedEventType, listener);
            received++;
        };
        dsService.addEventListener(configChangedEventType, listener);

        await dsService.deConfigure();
        await dsService.configure(ccxml);
        expect(received).equal(1);
    });

    it('statusMessageEvent', async function() {
        this.skip(); // required DEBUG_ForceGTIError(0) or DEBUG_ForceGTIStatus(2)

        let received = 0;
        const [core] = await dsService.listCores<IDebugCore>(debugCoreType);
        const listener: IListener<IStatusMessageEvent> = ( detail: IStatusMessageEvent ) => {
            core.removeEventListener(statusMessageEventType, listener);
            received++;
        };
        core.addEventListener(statusMessageEventType, listener);

        await core.connect();
        await core.loadProgram(fs.readFileSync(path.join(__dirname, 'assets/MSP432P401R_Blink.out')), false);
        expect(received).equal(1);
    });
});
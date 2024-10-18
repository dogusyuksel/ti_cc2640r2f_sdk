import path from 'path';
import { processArgs, ARG_ENABLE_LOG, ARG_DEVICE_NAME } from '../../ti-core-assets/test/TestArgs';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { programLoaderServiceType } from '../lib/ProgramLoaderService';
import { dsServiceType, debugCoreType, statusMessageEventType, Location } from '../../ti-service-ds/lib/DSService';
import { TiFiles } from '../../ti-core-assets/lib/TiFiles';
/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('programLoaderService', processArgs[ARG_ENABLE_LOG]);
/** *************************************************************************************************************************** */
describe('ProgramLoaderService', () => {
    const dsService = ServicesRegistry.getService(dsServiceType);
    const programLoaderService = ServicesRegistry.getService(programLoaderServiceType);
    const outFilePath = path.join(__dirname, `assets/${processArgs[ARG_DEVICE_NAME]}_Blink.out`);
    const binFilePath = path.join(__dirname, `assets/${processArgs[ARG_DEVICE_NAME]}_Blink.bin`);
    const ccxmlPath = path.join(__dirname, `assets/${processArgs[ARG_DEVICE_NAME]}.ccxml`);
    let core;
    before(async function () {
        if (processArgs[ARG_DEVICE_NAME] !== 'MSP432P401R')
            this.skip();
        const ccxml = await TiFiles.readTextFile(ccxmlPath);
        await dsService.configure(ccxml);
        const [aCore] = await dsService.listCores(debugCoreType);
        core = aCore;
        await core.connect();
    });
    it('loadProgram', function (done) {
        (async () => {
            try {
                await programLoaderService.loadProgram(core, outFilePath);
                const blinkAddr = await core.evaluate('&blink');
                if (!blinkAddr || blinkAddr.type !== 'int *') {
                    throw new Error('Failed to evaluate &blink');
                }
                done();
            }
            catch (e) {
                done(e);
            }
        })();
    });
    it('loadSymbol', function (done) {
        (async () => {
            try {
                await programLoaderService.loadSymbols(core, outFilePath);
                const blinkAddr = await core.evaluate('&blink');
                if (!blinkAddr || blinkAddr.type !== 'int *') {
                    throw new Error('Failed to evaluate &blink');
                }
                done();
            }
            catch (e) {
                done(e);
            }
        })();
    });
    it('loadBin', function (done) {
        (async () => {
            let verifyFailedCount = 0;
            const listener = (detail) => {
                if (detail.message.indexOf('Verify program failed') !== -1) {
                    verifyFailedCount++;
                }
            };
            programLoaderService.addEventListener(statusMessageEventType, listener);
            const tmpOutFilePath = path.join(__dirname, `assets/${processArgs[ARG_DEVICE_NAME]}_Expressions.out`);
            try {
                /* prime the device with an out file */
                await programLoaderService.loadProgram(core, tmpOutFilePath);
                /*  verify failed case */
                await programLoaderService.loadBin(core, binFilePath, new Location(0), outFilePath);
                if (verifyFailedCount !== 1) {
                    return done('loadBin should failed to verify program and load the program.');
                }
                /* verify passed case */
                await programLoaderService.loadBin(core, binFilePath, new Location(0), outFilePath);
                if (verifyFailedCount !== 1) {
                    return done('loadBin should sucessfully verify the program and not load the program again.');
                }
                done();
            }
            catch (e) {
                done(e);
            }
            finally {
                programLoaderService.removeEventListener(statusMessageEventType, listener);
            }
        })();
    });
    it('flash', function (done) {
        /* this test should be run last so that ds is deconfig before running the test */
        (async () => {
            try {
                await dsService.deConfigure();
                const connectionId = 'TIXDS110_Connection';
                const deviceId = 'msp432p401r';
                const coreName = 'Texas Instruments XDS110 USB Debug Probe_0/CORTEX_M4_0';
                /* load .bin file */
                await programLoaderService.flash({ ccxmlPath: ccxmlPath, coreName: coreName, programOrBinPath: binFilePath, loadAddress: 0 });
                /* load program */
                await programLoaderService.flash({ ccxmlPath: ccxmlPath, connectionId: connectionId, deviceId: deviceId, coreName: coreName, programOrBinPath: outFilePath });
                /* load symbols with creating ccxml file */
                await programLoaderService.flash({ connectionId: connectionId, deviceId: deviceId, coreName: coreName.replace('Probe_0', 'Probe'), programOrBinPath: outFilePath, symbolsOnly: true });
                done();
            }
            catch (e) {
                done(e);
            }
        })();
    });
});
//# sourceMappingURL=ProgramLoaderService.spec.js.map
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { expect } from 'chai';
import { backplaneServiceType } from '../lib/BackplaneService';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
//-------------------------------------------------------------------------------------------------------------------------------
// Enable Logging
const [logLevel] = Array.prototype.slice.call(process.argv).filter(e => e.startsWith('--enableLog')).map(e => e.split('=')[1]);
TiConsole.setLevel('ti-service-backplane', logLevel);
//-------------------------------------------------------------------------------------------------------------------------------
describe('BackplaneServiceTest', () => {
    let service;
    before(() => {
        service = ServicesRegistry.getService(backplaneServiceType);
        expect(service).is.not.null;
    });
    it('getSubModule', done => {
        (async () => {
            const file = await service.getSubModule('File');
            !file ? done('File SubModule not found.') : done();
        })();
    });
    it('getUtil', done => {
        (async () => {
            const util = await service.getUtil();
            !util ? done('Failed to get Util object.') : done();
        })();
    });
});
//# sourceMappingURL=Backplane.spec.js.map
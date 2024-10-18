import TiCcxml from '../lib/TiCcxml';
import { expect } from 'chai';
describe('Ccxml File Generation and Fixup', async function () {
    before(function () {
        this.skip(); // TODO: remove TiCcxml.ts and these test cases.
    });
    const deviceName = 'MSP430F5529';
    const connectionId = 'TIMSP430-USB';
    it('should return a valid ccxml file for F5529 device', async () => {
        const ccxmlFile = await TiCcxml.generateCcxmlFile(deviceName, connectionId);
        expect(ccxmlFile).to.not.be.undefined;
        expect(ccxmlFile).to.not.be.null;
        const expectedFile = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
            '\n<configurations XML_version="1.2" id="configurations_0">' +
            '\n<configuration XML_version="1.2" id="TI MSP430 USB1_0">' +
            '\n<instance XML_version="1.2" desc="TI MSP430 USB1_0" href="connections/TIMSP430-USB.xml" id="TI MSP430 USB1_0" xml="TIMSP430-USB.xml" xmlpath="connections"/>' +
            '\n<connection XML_version="1.2" id="TI MSP430 USB1_0">' +
            '\n<instance XML_version="1.2" href="drivers/msp430_emu.xml" id="drivers" xml="msp430_emu.xml" xmlpath="drivers"/>' +
            '\n<platform XML_version="1.2" id="platform_0">' +
            '\n<instance XML_version="1.2" desc="MSP430F5529_0" href="devices/MSP430F5529.xml" id="MSP430F5529_0" xml="MSP430F5529.xml" xmlpath="devices"/>' +
            '\n</platform>' +
            '\n</connection>' +
            '\n</configuration>' +
            '\n</configurations>';
        expect(ccxmlFile).to.contain(expectedFile);
    });
});
//# sourceMappingURL=sanity-ccxml.spec.js.map
import '../../ti-core-assets/lib/NodeJSEnv';
import { expect } from 'chai';
import { UsbTransport, filterPortsEventType, selectedPortEventType } from '../lib/UsbTransport';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { processArgs, ARG_DEVICE_NAME } from '../../ti-core-assets/test/TestArgs';
import { AbstractDataDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
import { binaryOrBufferDataType, bufferDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
class TestCodec extends AbstractDataDecoder {
    constructor(id) {
        super(id, binaryOrBufferDataType, bufferDataType);
    }
    decode(data) {
        if (this.lastPacketReceived) {
            this.lastPacketReceived.resolve(data);
        }
        return true;
    }
    ;
    encode(data) {
        this.targetEncoder.encode(data);
        this.lastPacketReceived = TiPromise.defer();
    }
    ;
}
;
describe('UsbTransport', () => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    let testCodec;
    let usbTransport;
    before(function () {
        const deviceName = processArgs[ARG_DEVICE_NAME];
        if (deviceName !== 'MSP432P401R' && deviceName !== 'TMP117') {
            this.skip();
        }
        testCodec = new TestCodec('test');
        usbTransport = new UsbTransport({ hid: processArgs[ARG_DEVICE_NAME] === 'TMP117' ? true : false });
    });
    it('configure', () => {
        expect(() => {
            CodecRegistry.configure('usb+test');
        }).to.not.throw();
        expect(CodecRegistry.isActive('test')).to.be.true;
    });
    it('connect', async () => {
        let onFilterEventHit = false;
        let onSelectEventHit = false;
        const onFilterPorts = (details) => {
            onFilterEventHit = true;
            expect(details.ports).to.be.not.empty;
            expect(usbTransport.isConnecting()).to.be.true;
        };
        const onSelectedPort = (details) => {
            onSelectEventHit = true;
            expect(details.port).to.exist;
            expect(usbTransport.isConnecting()).to.be.true;
        };
        usbTransport.addEventListener(filterPortsEventType, onFilterPorts);
        usbTransport.addEventListener(selectedPortEventType, onSelectedPort);
        await usbTransport.connect();
        expect(onFilterEventHit).to.be.true;
        expect(onSelectEventHit).to.be.true;
        expect(usbTransport.isConnected()).to.be.true;
    });
    it('sendCommand', async function () {
        var _a;
        const deviceName = processArgs[ARG_DEVICE_NAME];
        if (deviceName !== 'TMP117') {
            this.skip();
        }
        testCodec.encode([0x54, 0x70, 4, 1, 0, 1, 0, 0x6a, 0, 0, 0, 0]);
        expect(testCodec.lastPacketReceived).to.exist;
        const data = await TiPromise.timeout((_a = testCodec.lastPacketReceived) === null || _a === void 0 ? void 0 : _a.promise, 1000, 'Timeout on HID packet received');
        expect(data).to.deep.equal([0x54, 0xeb, 1, 2, 0, 1, 0, 0x6a, 1]);
    });
    it('disconnect', async () => {
        await usbTransport.disconnect();
        expect(usbTransport.isDisconnected()).to.be.true;
    });
});
//# sourceMappingURL=UsbTransport.spec.js.map
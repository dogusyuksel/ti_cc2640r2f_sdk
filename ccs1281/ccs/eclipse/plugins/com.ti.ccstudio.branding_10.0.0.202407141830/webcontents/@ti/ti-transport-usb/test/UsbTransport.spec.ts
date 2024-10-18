import '../../ti-core-assets/lib/NodeJSEnv';
import { expect } from 'chai';
import { UsbTransport, filterPortsEventType, IFilterUsbPorts, ISelectedUsbPort, selectedPortEventType } from '../lib/UsbTransport';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { IListener } from '../../ti-core-assets/lib/Events';
import { processArgs, ARG_DEVICE_NAME } from '../../ti-core-assets/test/TestArgs';
import { AbstractDataDecoder } from '../../ti-target-configuration/lib/AbstractCodec';
import { binaryOrBufferDataType, bufferDataType } from '../../ti-target-configuration/lib/CodecDataTypes';
import { IDeferedPromise, TiPromise } from '../../ti-core-assets/lib/TiPromise';

class TestCodec extends AbstractDataDecoder<Uint8Array | Buffer | number[], number[] | Buffer> {
    lastPacketReceived?: IDeferedPromise<Uint8Array | Buffer | number[]>;

    constructor(id: string ) {
        super(id, binaryOrBufferDataType, bufferDataType);
    }

    decode(data: number[] | Buffer | Uint8Array): boolean | Error {
        if (this.lastPacketReceived) {
            this.lastPacketReceived.resolve(data);
        }
        return true;
    };

    encode(data: number[]) {
        this.targetEncoder.encode(data);
        this.lastPacketReceived = TiPromise.defer<Uint8Array | Buffer | number[]>();
    };
};

describe('UsbTransport', () => {

    /* eslint-disable @typescript-eslint/no-unused-vars */
    let testCodec: TestCodec;
    let usbTransport: UsbTransport;

    before(function() {
        const deviceName = processArgs[ARG_DEVICE_NAME];
        if (deviceName !== 'MSP432P401R' && deviceName !== 'TMP117' ) {
            this.skip();
        }

        testCodec = new TestCodec('test');
        usbTransport = new UsbTransport({hid: processArgs[ARG_DEVICE_NAME] === 'TMP117' ? true: false });
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

        const onFilterPorts: IListener<IFilterUsbPorts> = (details) => {
            onFilterEventHit = true;
            expect(details.ports).to.be.not.empty;
            expect(usbTransport.isConnecting()).to.be.true;
        };

        const onSelectedPort: IListener<ISelectedUsbPort> = (details) => {
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

    it('sendCommand', async function() {
        const deviceName = processArgs[ARG_DEVICE_NAME];
        if (deviceName !== 'TMP117') {
            this.skip();
        }

        testCodec.encode([0x54, 0x70, 4, 1, 0, 1, 0, 0x6a, 0, 0, 0, 0]);
        expect(testCodec.lastPacketReceived).to.exist;
        const data = await TiPromise.timeout(testCodec.lastPacketReceived?.promise!, 1000, 'Timeout on HID packet received');
        expect(data).to.deep.equal([0x54, 0xeb, 1, 2, 0, 1, 0, 0x6a, 1]);
    });

    it('disconnect', async () => {
        await usbTransport.disconnect();
        expect(usbTransport.isDisconnected()).to.be.true;
    });
});
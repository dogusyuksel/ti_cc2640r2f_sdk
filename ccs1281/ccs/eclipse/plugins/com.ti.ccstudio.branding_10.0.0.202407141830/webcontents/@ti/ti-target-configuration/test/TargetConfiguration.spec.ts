import { expect } from 'chai';
import '../../ti-core-assets/lib/NodeJSEnv';
import { JsonCodec } from '../../ti-codec-json/lib/JsonCodec';
import { DelimitedTextCodec } from '../../ti-codec-delimited-text/lib/DelimitedTextCodec';
import { Base64PacketCodec } from '../../ti-codec-base64/lib/Base64PacketCodec';
import { UsbTransport } from '../../ti-transport-usb/lib/UsbTransport';
import { StreamingDataModel } from '../../ti-model-streaming/lib/StreamingDataModel';
import { IBindFactory } from '../../ti-core-databind/lib/CoreDatabind';
import { CodecRegistry } from '../lib/CodecRegistry';
import { AbstractDataCodec, IConnectionLog } from '../lib/AbstractCodec';
import { PrimitiveDataType } from '../lib/CodecDataTypes';

const numberDataType = new PrimitiveDataType<number>('number');

interface CodecStubParams {
    id: string;
    optional?: boolean;
    deviceId?: string;
};

class NullConnectionLogger implements IConnectionLog {
    assertStillConnecting(): void {
    };
    addProgressMessage(message: string) {
    };
    addErrorMessage(message: string) {
    };
    addWarningMessage(message: string) {
    };
    addDebugMessage(message: string) {
    };
};

class CodecStub extends AbstractDataCodec<number, number, number, number> {
    public configured = false;
    public connected = false;
    public disconnected = false;
    public pinged = false;

    constructor(private params: CodecStubParams) {
        super(params.id, numberDataType, numberDataType, numberDataType, numberDataType);
    };

    encode(data: number): void {
        this.targetEncoder.encode(data);

    };
    decode(data: number): boolean | Error {
        return this.targetDecoder.decode(data);
    };

    get optional() {
        return this.params.optional;
    };

    get deviceId() {
        return this.params.deviceId;
    };

    deconfigure() {
        super.deconfigure();
        this.configured = false;
        this.connected = false;
        this.disconnected = false;
        this.pinged = false;
    };
};

describe('TargetConfiguration', () => {

    let jsonCodec: JsonCodec;
    let cr: DelimitedTextCodec;
    let usbTransport: UsbTransport;
    let model: IBindFactory;
    let base64: Base64PacketCodec;
    let A: CodecStub;
    let B: CodecStub;
    let C: CodecStub;
    let D: CodecStub;
    let E: CodecStub;
    let F: CodecStub;
    let G: CodecStub;

    before(() => {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (CodecRegistry as any).clear();   // clear the registery to avoid other tests clashing with this one.

        jsonCodec = new JsonCodec({});
        cr = new DelimitedTextCodec({ id: 'cr', delimiter: '\n' });
        usbTransport = new UsbTransport({});
        model = new StreamingDataModel({});
        base64 = new Base64PacketCodec({});

        A = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'A', optional: true});
            }
            configure() {
                this.configured = true;
            }
        })();

        B = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'B', deviceId: 'B' });
            }
            doConnect(): Promise<void> {
                this.connected = true;
                return Promise.resolve();
            }
            doDisconnect(): Promise<void> {
                this.disconnected = true;
                return Promise.resolve();
            }
        })();

        C = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'C' });
            }
            doConnect(): Promise<void> {
                this.connected = true;
                return Promise.reject('Codec "C" failed to connect');
            }
            doDisconnect(): Promise<void> {
                this.disconnected = true;
                return Promise.resolve();
            }
        })();
        D = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'D', optional: true, deviceId: 'DE' });
            }
            ping() {
                this.pinged = true;
                return Promise.resolve(this.pinged);
            }
        })();
        E = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'E', deviceId: 'DE' });
            }
            doConnect(): Promise<void> {
                this.connected = true;
                return Promise.reject('Codec "E" failed to connect');
            }
            doDisconnect(): Promise<void> {
                this.disconnected = true;
                return Promise.resolve();
            }
        })();

        F = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'F', optional: true, deviceId: 'F' });
            }
            doConnect(): Promise<void> {
                this.connected = true;
                return Promise.reject('Code "F" failed to connect');
            }
            ping() {
                this.pinged = true;
                return Promise.resolve(this.pinged);
            }
        })();
        G = new (class extends CodecStub {
            public configured = false;
            constructor() {
                super({ id: 'G', optional: false, deviceId: '' });
            }
            configure() {
                this.configured = true;
            }
            doConnect(): Promise<void> {
                this.connected = true;
                return Promise.resolve();
            }
            doDisconnect(): Promise<void> {
                this.disconnected = true;
                return Promise.resolve();
            }
        })();

    });

    const logger = new NullConnectionLogger();

    it('getInstance', () => {
        expect(CodecRegistry.getInstance('json')).to.equal(jsonCodec);
        expect(CodecRegistry.getInstance('cr')).to.equal(cr);
        expect(CodecRegistry.getInstance('usb')).to.equal(usbTransport);
        expect(CodecRegistry.getInstance('uart')).to.equal(model);
        expect(CodecRegistry.getInstance('base64')).to.equal(base64);
    });

    it('configure', () => {
        expect(() => {
            CodecRegistry.configure('usb+cr+json+uart');
        }).to.not.throw();
        expect(CodecRegistry.isActive('json')).to.be.true;
        expect(CodecRegistry.isActive('cr')).to.be.true;
        expect(CodecRegistry.isActive('usb')).to.be.true;
        expect(CodecRegistry.isActive('uart')).to.be.true;
        expect(CodecRegistry.isActive('base64')).to.be.false;
    });

    it('Codec used twice error', () => {
        expect(() => {
            CodecRegistry.configure('usb+cr(json+uart,uart)');
        }).to.throw('Invalid Configuration specified:  Codec id=uart is used twice, in usb+cr(json+uart,uart)');
    });

    it('Bad Codec Name', () => {
        expect(() => {
            new DelimitedTextCodec({ id: 'cr+', delimiter: '\n' });
        }).to.throw('Bad identifier cr+.  Identifiers for Codecs, models, and transports must only contain numbers, letters, underscore, period, or $ characters');
    });

    it('reconfigure', () => {
        expect(() => {
            CodecRegistry.configure('cr+json');
        }).to.not.throw();
        expect(CodecRegistry.isActive('json')).to.be.true;
        expect(CodecRegistry.isActive('cr')).to.be.true;
        expect(CodecRegistry.isActive('usb')).to.be.false;
        expect(CodecRegistry.isActive('uart')).to.be.false;
        expect(CodecRegistry.isActive('base64')).to.be.false;
    });

    it('whenConfigurationReady', async () => {
        let isReady = false;
        CodecRegistry.whenConfigurationReady(' cr  ( blob , usb ,test ) ').then(() => {
            isReady = true;
        });
        expect(isReady).to.be.false;
        new JsonCodec({id: 'bloB'});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(isReady).to.be.false;
        new JsonCodec({id: 'TEST'});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(isReady).to.be.true;

        isReady = false;
        CodecRegistry.whenConfigurationReady(' cr  ( blob , usb ,test ) ').then(() => {
            isReady = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(isReady).to.be.true;
    });

    it('isOptional', () => {
        CodecRegistry.configure('A,B(D,F),G');

        expect(CodecRegistry.isOptional('A')).to.be.true;
        expect(CodecRegistry.isOptional('B')).to.be.true;
        expect(CodecRegistry.isOptional('C')).to.be.false;
        expect(CodecRegistry.isOptional('D')).to.be.true;
        expect(CodecRegistry.isOptional('E')).to.be.false;
        expect(CodecRegistry.isOptional('F')).to.be.true;
        expect(CodecRegistry.isOptional('G')).to.be.false;

        CodecRegistry.configure('A,B(D,F,E),G');
        expect(CodecRegistry.isOptional('B')).to.be.false;
    });

    it('isDeviceRequired', () => {
        expect(CodecRegistry.isDeviceRequired('A', 'B')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('B', 'B')).to.be.true;
        expect(CodecRegistry.isDeviceRequired('C', 'B')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('D', 'B')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('E', 'B')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('F', 'B')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('G', 'B')).to.be.false;

        expect(CodecRegistry.isDeviceRequired('A', 'F')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('B', 'F')).to.be.true;
        expect(CodecRegistry.isDeviceRequired('C', 'F')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('D', 'F')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('E', 'F')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('F', 'F')).to.be.true;
        expect(CodecRegistry.isDeviceRequired('G', 'F')).to.be.false;

        expect(CodecRegistry.isDeviceRequired('A', 'DE')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('B', 'DE')).to.be.true;
        expect(CodecRegistry.isDeviceRequired('C', 'DE')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('D', 'DE')).to.be.true;
        expect(CodecRegistry.isDeviceRequired('E', 'DE')).to.be.true;
        expect(CodecRegistry.isDeviceRequired('F', 'DE')).to.be.false;
        expect(CodecRegistry.isDeviceRequired('G', 'DE')).to.be.false;
    });

    it('connectTransport', async () => {
        CodecRegistry.configure('A,B(D,F),G');

        await CodecRegistry.connect('A', logger);
        expect(B.connected).to.be.false;
        expect(C.connected).to.be.false;
        expect(E.connected).to.be.false;
        expect(F.connected).to.be.false;
        expect(G.connected).to.be.false;

        await CodecRegistry.connect('B', logger);
        expect(B.connected).to.be.true;
        expect(C.connected).to.be.false;
        expect(E.connected).to.be.false;
        expect(F.connected).to.be.true;
        expect(G.connected).to.be.false;

        await CodecRegistry.connect('G', logger);
        expect(B.connected).to.be.true;
        expect(C.connected).to.be.false;
        expect(E.connected).to.be.false;
        expect(F.connected).to.be.true;
        expect(G.connected).to.be.true;
    });

    it('isConnected', () => {
        expect(CodecRegistry.isConnected('A')).to.be.true;
        expect(CodecRegistry.isConnected('B')).to.be.true;
        expect(CodecRegistry.isConnected('C')).to.be.false;
        expect(CodecRegistry.isConnected('D')).to.be.true;
        expect(CodecRegistry.isConnected('E')).to.be.false;
        expect(CodecRegistry.isConnected('F')).to.be.false;
        expect(CodecRegistry.isConnected('G')).to.be.true;
    });

    it('ping', async () => {
        await CodecRegistry.ping('A');
        expect(D.pinged).to.be.false;
        expect(F.pinged).to.be.false;

        await CodecRegistry.ping('B');
        expect(D.pinged).to.be.true;
        expect(F.pinged).to.be.false;

        await CodecRegistry.ping('G');
        expect(D.pinged).to.be.true;
        expect(F.pinged).to.be.false;
    });

    it('disconnectTransport', async () => {
        await CodecRegistry.disconnect('A', logger);
        expect(B.disconnected).to.be.false;
        expect(C.disconnected).to.be.false;
        expect(E.disconnected).to.be.false;
        expect(G.disconnected).to.be.false;

        await CodecRegistry.disconnect('B', logger);
        expect(B.disconnected).to.be.true;
        expect(C.disconnected).to.be.false;
        expect(E.disconnected).to.be.false;
        expect(G.disconnected).to.be.false;

        await CodecRegistry.disconnect('G', logger);
        expect(B.disconnected).to.be.true;
        expect(C.disconnected).to.be.false;
        expect(E.disconnected).to.be.false;
        expect(G.disconnected).to.be.true;
    });

    it('failed direct connect', async () => {
        CodecRegistry.configure('C');

        try {
            await CodecRegistry.connect('C', logger);
            throw 'Connection should have failed.';
        } catch (e) {
            expect(e.toString()).to.equal('Codec "C" failed to connect');
        }

        expect(B.connected).to.be.false;
        expect(C.connected).to.be.true;
        expect(E.connected).to.be.false;
        expect(F.connected).to.be.false;
        expect(G.connected).to.be.false;

        expect(CodecRegistry.isConnected('C')).to.be.false;

        await CodecRegistry.disconnect('C', logger);
        expect(B.disconnected).to.be.false;
        expect(C.disconnected).to.be.false;
        expect(E.disconnected).to.be.false;
        expect(G.disconnected).to.be.false;
    });

    it('failed indirect connect', async () => {
        CodecRegistry.configure('A,B(D,F,E),G');

        try {
            await CodecRegistry.connect('B', logger);
            throw 'Connection should have failed.';
        } catch (e) {
            expect(e.toString()).to.equal('Codec "E" failed to connect');
        }

        expect(B.connected).to.be.true;
        expect(E.connected).to.be.true;
        expect(F.connected).to.be.true;
        expect(G.connected).to.be.false;

        expect(CodecRegistry.isConnected('B')).to.be.true;
        expect(CodecRegistry.isConnected('D')).to.be.true;
        expect(CodecRegistry.isConnected('E')).to.be.false;
        expect(CodecRegistry.isConnected('F')).to.be.false;

        await CodecRegistry.disconnect('B', logger);
        expect(B.disconnected).to.be.true;
        expect(C.disconnected).to.be.false;
        expect(E.disconnected).to.be.false;
        expect(G.disconnected).to.be.false;

        expect(CodecRegistry.isConnected('B')).to.be.false;
        expect(CodecRegistry.isConnected('D')).to.be.false;
        expect(CodecRegistry.isConnected('E')).to.be.false;
        expect(CodecRegistry.isConnected('F')).to.be.false;

    });

});
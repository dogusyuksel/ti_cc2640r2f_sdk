import { processArgs, ARG_ENABLE_LOG, ARG_DEVICE_NAME } from '../../ti-core-assets/test/TestArgs';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { IUsbService, usbServiceType } from '../lib/UsbService';
import { IUsbDevice, IUsbDeviceInterface, rxErrorEventType, rxDataEventType, IRxErrorEvent, IRxDataEvent } from '../lib/UsbDevice';
import { expect } from 'chai';
import { IOpenedEvent, openedEventType, IClosedEvent, closedEventType } from '../lib/UsbHidPort';

/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('usbService', processArgs[ARG_ENABLE_LOG] as number);
TiConsole.setLevel('usb', processArgs[ARG_ENABLE_LOG] as number);
/** *************************************************************************************************************************** */

const DEVICE = processArgs['usbdevice'] as string || 'Texas Instruments:XDS110 (02.03.00.18) Embed with CMSIS-DAP S/N:M4321005';
describe('UsbDevice', () => {
    const usbService = ServicesRegistry.getService<IUsbService>(usbServiceType);
    let device: IUsbDevice;
    let bulkInterface: IUsbDeviceInterface;

    before(async function() {
        if (processArgs[ARG_DEVICE_NAME] !== 'MSP432P401R') this.skip();
        device = (await usbService.listDevices().then(devices => devices.filter(device => device.name === DEVICE )))[0];

        await device.open();
        bulkInterface = device.interfaces[6 /* this interface seems to response to sendCmd */];
        await device.close();
    });

    afterEach(async function() {
        try {
            await device.close();
        } catch (e) { /* ignore */ }
    });

    it('open', function(done) {
        (async () => {
            if (device.isOpened) return done('Device should not be opened');

            await device.open();
            let exception = null;
            try {
                await device.open();
            } catch (error) {
                exception = error;
            }

            done(exception ? null : 'Expecting device failed to open');
        })();
    });

    it('close', async function() {
        await device.open();
        await device.close();
    });

    it('getDescriptors', async function() {
        const descriptors = await device.getDescriptors();
        expect(descriptors.interfaceDescriptors.length).is.eq(7);
    });

    it('getStringDescriptor', async function() {
        await device.open();
        // const descriptors = await device.getDescriptors();

        const manufacture = await device.getStringDescriptor(1 /* descriptors.deviceDescriptor.iManufacturer */, 128);
        expect(manufacture).eq('Texas Instruments');

        const product = await device.getStringDescriptor(2 /* descriptors.deviceDescriptor.iProduct */, 128);
        expect(product).eq('XDS110 (02.03.00.18) Embed with CMSIS-DAP');

        const serial = await device.getStringDescriptor(3 /* descriptors.deviceDescriptor.iSerialNumber */, 128);
        expect(serial).is.not.null;
    });

    it('transferControl', async function() {
        await device.open();
        const data = await device.controlTransfer(128, 6, 0x0301, 0x0409, 255); // controlTransfer to get string descriptor for iManufacturer
        expect(data).is.not.empty;
    });

    it('list interfaces', async function() {
        await device.open();
        expect(device.interfaces).length.greaterThan(2);
    });

    it('reset', async function() {
        await device.open();
        await device.reset();
    });

    it('claim', function(done) {
        (async () => {
            let exception;
            try {
                await bulkInterface.claim();
            } catch (e) {
                exception = e;
            }
            if (!exception) return done('Need to open device before claiming an interface.');

            await device.open();
            await bulkInterface.claim();
            done();
        })();
    });

    it('release', function(done) {
        (async () => {
            await device.open();
            await bulkInterface.claim();
            await bulkInterface.release();
            done();
        })();
    });

    it('write', function(done) {
        (async () => {
            await device.open();
            await bulkInterface.claim();

            const rxDataHdlr = ( detail: { data: Buffer }) => {
                bulkInterface.removeEventListener(rxDataEventType, rxDataHdlr);
                done(String.fromCharCode(...detail.data) === '!dlroW olleH' ? null : 'Write data not matching expected value.');
            };
            bulkInterface.addEventListener<IRxDataEvent>(rxDataEventType, rxDataHdlr);
            await bulkInterface.write(Buffer.from('Hello World!'));
        })();
    });

    it('read', function(done) {
        this.skip();

        (async () => {
            await device.open();
            await bulkInterface.claim();
            const data = await bulkInterface.read(1);

            // TODO: valid return data
            done();
        })();
    });

    it('sendCmd', function(done) {
        (async () => {
            await device.open();
            await bulkInterface.claim();

            const result = await bulkInterface.sendCmd('RESET', 1000, (rxData: { data: Buffer }) => {
                return { result: rxData };
            });
            const str = String.fromCharCode(...result.data);
            return done(str === 'TESER' ? null : 'Expecting RESET to return TESER.');

        })();
    });

    it('eventListeners', function(done) {
        (async () => {
            let onOpened = false;
            let onClosed = false;
            let onData = false;
            let onError = false;

            const verifyDone = () => {
                if (onOpened && onClosed && onData /* && onError */) {
                    done();
                }
            };

            const rxErrorHdlr = () => {
                onError = true;
                bulkInterface.removeEventListener(rxErrorEventType, rxErrorHdlr);
                verifyDone();
            };
            const rxDataHdlr = (detail: { data: Buffer }) => {
                onData = true;
                bulkInterface.removeEventListener(rxDataEventType, rxDataHdlr);
                verifyDone();
            };

            const openedHdlr = () => {
                onOpened = true;
                device.removeEventListener(openedEventType, openedHdlr);
                verifyDone();
            };

            const closedHdlr = () => {
                onClosed = true;
                device.removeEventListener(closedEventType, closedHdlr);
                verifyDone();
            };

            device.addEventListener<IOpenedEvent>(openedEventType, openedHdlr);
            device.addEventListener<IClosedEvent>(closedEventType, closedHdlr);
            bulkInterface.addEventListener<IRxErrorEvent>(rxErrorEventType, rxErrorHdlr);
            bulkInterface.addEventListener<IRxDataEvent>(rxDataEventType, rxDataHdlr);

            await device.open();
            await bulkInterface.claim();
            await bulkInterface.sendCmd('RESET');
            // TODO: how to test ERROR???

            await bulkInterface.release();
            await device.close();
        })();
    });
});
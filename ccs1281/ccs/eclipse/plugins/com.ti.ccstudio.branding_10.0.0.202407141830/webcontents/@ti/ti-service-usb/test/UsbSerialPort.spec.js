import { describe, it } from 'mocha';
import * as path from 'path';
import * as fs from 'fs';
import { processArgs, ARG_ENABLE_LOG, ARG_DEVICE_NAME, ARG_COM_NAME } from '../../ti-core-assets/test/TestArgs';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { dsServiceType, debugCoreType } from '../../ti-service-ds/lib/DSService';
import { usbServiceType } from '../lib/UsbService';
import { usbSerialPortType, openedEventType, closedEventType, dataEventType } from '../lib/UsbSerialPort';
/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('usbService', processArgs[ARG_ENABLE_LOG]);
TiConsole.setLevel('usb', processArgs[ARG_ENABLE_LOG]);
/** *************************************************************************************************************************** */
const PORT = processArgs[ARG_COM_NAME];
describe('UsbSerialPort', () => {
    const usbService = ServicesRegistry.getService(usbServiceType);
    const dsService = ServicesRegistry.getService(dsServiceType);
    let port;
    const getPort = async (name) => {
        return usbService.listPorts({ type: usbSerialPortType }).then(serials => {
            return serials
                .filter(serial => serial.comName === name)
                .map(port => usbSerialPortType.asUsbPortType(port))[0];
        });
    };
    before(async function () {
        if (processArgs[ARG_DEVICE_NAME] !== 'MSP432P401R' || !PORT)
            this.skip();
        const ccxml = fs.readFileSync(path.join(__dirname, `assets/${processArgs[ARG_DEVICE_NAME]}.ccxml`), 'utf-8');
        await dsService.configure(ccxml);
        const [core] = await dsService.listCores(debugCoreType);
        const out = fs.readFileSync(path.join(__dirname, 'assets/MSP432P401R_Serial.out'));
        await core.connect();
        await core.loadProgram(out, false);
        await core.disconnect();
        port = await getPort(PORT);
    });
    after(async function () {
        try {
            await dsService.deConfigure();
        }
        catch (e) { /* ignore */ }
    });
    afterEach(async function () {
        try {
            await port.close();
        }
        catch (e) { /* ignore */ }
    });
    it('open', function (done) {
        (async () => {
            if (port.isOpened)
                return done('Port should not be opened');
            await port.open();
            let exception = null;
            try {
                await port.open();
            }
            catch (error) {
                exception = error;
            }
            done(exception ? null : 'Expecting serial port failed to open');
        })();
    });
    it('write', function (done) {
        (async () => {
            let exception = null;
            try {
                let off = false;
                let message = '';
                const port = await getPort(PORT);
                port.addEventListener(dataEventType, (detail) => {
                    message += String.fromCharCode(...detail.data);
                    if (message.indexOf('"blink":0')) {
                        off = true;
                    }
                });
                await port.open({ baudRate: 9600 });
                await port.write(JSON.stringify({ blink: 0 }) + '\r\n');
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!off)
                    return done('Failed to write to turn LED off');
                await port.write(JSON.stringify({ blink: 1 }) + '\r\n');
            }
            catch (error) {
                exception = error;
            }
            finally {
                done(exception);
            }
        })();
    });
    it('setBaudRate', function (done) {
        this.skip(); // TODO: not sure how to test
    });
    it('signals', function (done) {
        this.skip(); // need imageCreator device to test
        (async () => {
            try {
                await port.open();
                await port.setSignals({ cts: true, dsr: true });
                const signals = await port.getSignals();
                // TODO: test get signals matches the set signals values
                done();
            }
            catch (error) {
                done(error);
            }
        })();
    });
    it('eventListeners', function (done) {
        (async () => {
            let onOpened = false;
            let onClosed = false;
            let onData = false;
            const verifyDone = () => {
                if (onOpened && onClosed && onData) {
                    done();
                }
            };
            const onOpenHdlr = () => {
                onOpened = true;
                port.removeEventListener(openedEventType, onOpenHdlr);
                verifyDone();
            };
            const onCloseHdlr = () => {
                onClosed = true;
                port.removeEventListener(closedEventType, onCloseHdlr);
                verifyDone();
            };
            const onDataHdlr = () => {
                onData = true;
                port.removeEventListener(dataEventType, onDataHdlr);
                port.close();
                verifyDone();
            };
            port.addEventListener(openedEventType, onOpenHdlr);
            port.addEventListener(closedEventType, onCloseHdlr);
            port.addEventListener(dataEventType, onDataHdlr);
            await port.open({ baudRate: 9600 });
        })();
    });
});
//# sourceMappingURL=UsbSerialPort.spec.js.map
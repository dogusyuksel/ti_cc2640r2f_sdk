import { expect } from 'chai';
import { processArgs, ARG_ENABLE_LOG, ARG_DEVICE_NAME, ARG_COM_NAME } from '../../ti-core-assets/test/TestArgs';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { usbServiceType, deviceAttachedEventType, deviceDetachedEventType } from '../lib/UsbService';
import { usbSerialPortType } from '../lib/UsbSerialPort';

/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('usbService', processArgs[ARG_ENABLE_LOG] as number);
/** *************************************************************************************************************************** */

const PORT = processArgs[ARG_COM_NAME] as string;
describe('UsbService', () => {
    const usbService = ServicesRegistry.getService(usbServiceType);

    before(async function() {
        if (processArgs[ARG_DEVICE_NAME] !== 'MSP432P401R' || !PORT) this.skip();
    });

    it('listPorts', async function () {
        const serialUsbPorts = await usbService.listPorts().then(usbPorts => {
            return usbPorts
                .filter(usbPort => usbPort.type === usbSerialPortType && usbPort.comName === PORT)
                .map(usbSerialPort => usbSerialPortType.asUsbPortType(usbSerialPort))[0];
        });

        expect(serialUsbPorts).is.not.undefined;
    });

    it('listDevices', async function () {
        const devices = await usbService.listDevices();
        expect(devices).length.greaterThan(0);
    });

    it('getDefaultPort', function(done) {
        (async () => {
            const serialUsbPorts = (await usbService.listPorts())
                .filter(usbPort => usbPort.type === usbSerialPortType)
                .map(serialUsbPort => usbSerialPortType.asUsbPortType(serialUsbPort));
            const defaultSerialUsbPort = await usbService.getDefaultPort(serialUsbPorts, 'MSP432P401R');
            defaultSerialUsbPort ? done() : done('No default port found');
        })();
    });

    it('deviceDetection', function(done) {
        this.skip(); // TODO: need to find a way to enable or disable usb device

        (async () => {
            let attached = false, detached = false;
            const veirfyDone = () => {
                if (attached && detached)
                    done();
            };

            usbService.addEventListener(deviceAttachedEventType, (detail) => {
                attached = true;
                veirfyDone();
            });

            usbService.addEventListener(deviceDetachedEventType, (detail) => {
                detached = true;
                veirfyDone();
            });
        })();
    });
});
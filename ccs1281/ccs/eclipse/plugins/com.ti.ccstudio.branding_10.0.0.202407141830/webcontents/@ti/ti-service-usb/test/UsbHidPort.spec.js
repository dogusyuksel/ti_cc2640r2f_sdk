import { processArgs, ARG_ENABLE_LOG, ARG_DEVICE_NAME } from '../../ti-core-assets/test/TestArgs';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { usbServiceType } from '../lib/UsbService';
import { usbHidPortType, openedEventType, closedEventType, dataEventType } from '../lib/UsbHidPort';
/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('usbService', processArgs[ARG_ENABLE_LOG]);
TiConsole.setLevel('usb', processArgs[ARG_ENABLE_LOG]);
/** *************************************************************************************************************************** */
const PORT = processArgs['comname'] || 'USB2ANY/OneDemo device';
describe('UsbHidPort', () => {
    const usbService = ServicesRegistry.getService(usbServiceType);
    let port;
    const getPort = async (name) => {
        return usbService.listPorts({ type: usbHidPortType }).then(ports => {
            return ports
                .filter(port => port.comName === PORT)
                .map(port => usbHidPortType.asUsbPortType(port))[0];
        });
    };
    before(async function () {
        if (processArgs[ARG_DEVICE_NAME] !== 'TMP117')
            this.skip();
        port = await getPort(PORT);
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
            /* wait for response */
            const listener = () => {
                port.removeEventListener(dataEventType, listener);
                done();
            };
            port.addEventListener(dataEventType, listener);
            await port.open();
            await port.write([63, 12, 84, 186, 4, 1, 0, 2, 0, 10, 0, 0, 0, 0]);
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
            await port.open();
            try {
                await port.write([63, 12, 84, 186, 4, 1, 0, 2, 0, 10, 0, 0, 0, 0]);
                // TODO: [JIRA???] write causes the hidusb::write to reject
            }
            catch (e) {
                /* ignore */
            }
        })();
    });
});
//# sourceMappingURL=UsbHidPort.spec.js.map
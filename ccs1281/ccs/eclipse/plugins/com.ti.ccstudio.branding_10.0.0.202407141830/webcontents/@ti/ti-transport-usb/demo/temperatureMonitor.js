const { JsonCodec } = require("../../../@ti-Nlibs/ti-codec-json/lib/JsonCodec");
const { DelimitedTextCodec } = require("../../../@ti-Nlibs/ti-codec-delimited-text/lib/DelimitedTextCodec");
const { connectedStateChangedEventType } = require("../../../@ti-Nlibs/ti-target-connection-manager/lib/AbstractTransport");
const { UsbTransport, selectedPortEventType } = require("../../../@ti-Nlibs/ti-transport-usb/lib/UsbTransport");
const { StreamingDataModel } = require("../../../@ti-Nlibs/ti-model-streaming/lib/StreamingDataModel");
const { connectionManager } = require("../../../@ti-Nlibs/ti-target-connection-manager/lib/ConnectionManager");
const { streamingDataEventType } = require("../../../@ti-Nlibs/ti-core-databind/lib/IBindValue");
const { bindingRegistry } = require("../../../@ti-Nlibs/ti-core-databind/lib/BindingRegistry");

(async function run() {
    try {
        new JsonCodec({});
        new DelimitedTextCodec({ id: 'cr', delimiter: '\n' });
        let usbTransport = new UsbTransport({ deviceId: process.argv[2], usb: true });
        new StreamingDataModel({ id: 'model' });

        connectionManager.setActiveConfiguration('usb+cr+json+model');

        const bind = bindingRegistry.getBinding('model.temp.$dec1');
        bind.addEventListener(streamingDataEventType, async (details) => {
            console.log(`Temperature = ${bind.getValue()}` + String.fromCharCode(0xB0) + 'F');
        });

        connectionManager.addEventListener(connectedStateChangedEventType, (details) => {
            console.log(`Transport state = ${details.newState}.`);
        });

        usbTransport.addEventListener(selectedPortEventType, (details) => {
            console.log(`Selected port: ${details.port.comName}`);
        })

        if (process.argv[2]) {
            console.log(`Selected Device: ${process.argv[2]}`);
        }

        await connectionManager.connect();

        exitHandler = async () => {
            await usbTransport.disconnect();
            process.exit();
        };
        process.on('SIGINT', exitHandler);

    } catch (e) {
        console.error(e);
        process.exit();
    }
})();




import { expect } from 'chai';

import { USB2ANY, IUsb2anyCodecParams } from '../lib/Usb2anyCodec';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { UsbTransport } from '../../ti-transport-usb/lib/UsbTransport';
import { I2CInterface, IU2aI2CParams } from '../lib/I2CInterface';
import { IRegisterInfo } from '../../ti-model-register/lib/IRegisterInfo';
import { PowerInterface, IU2aPowerParams } from '../lib/PowerInterface';
import { processArgs, ARG_DEVICE_NAME } from '../../ti-core-assets/test/TestArgs';
describe('Usb2anyCodec', () => {

    let usbTransport: UsbTransport;

    let u2aId: string;
    let u2a: USB2ANY;
    let u2aParams: IUsb2anyCodecParams;

    let power: PowerInterface;
    let powerParams: IU2aPowerParams;

    let i2c: I2CInterface;
    let i2cParams: IU2aI2CParams;

    let regOffsetTemp: IRegisterInfo;

    before(() => {
        usbTransport = new UsbTransport({hid: true});

        u2aId = 'myu2a';
        u2aParams =  {
            // id: optional, default to 'u2a'
            id: u2aId,
            connectTimeout: 100
        };
        u2a = new USB2ANY(u2aParams);

        powerParams = {
            // id: optional, default to 'power'
            'V3.3': true,
            'V5.0': false,
            'Vadj': false
        };
        power = new PowerInterface(powerParams);

        i2cParams = {
            // id: optional, default to 'i2c'
            pullup: true,
            addrsBits: 7,
            speed: 400,
            deviceAddrs: 0x48
        };
        i2c = new I2CInterface(i2cParams);

        // a register from tmp117 register.json
        regOffsetTemp = {
            name: 'OFFSET_TEMP',
            size: 16,
            nBytes: 2, // TMP117 registers.json define size. GC v2 U2A's I2C defines nBytes
            addr: 0x07,
            mode: 'RW',
            value: 0x0000,
            default: 0x8000,
            // "title": "Temperature Offset",
            fields: [
                {
                    start: 0,
                    stop: 15,
                    name: 'OFFSETTEMP',
                    default: 0,
                    type: 'q7',
                    desc: 'This 16 bit register is to be used as a user-defined temperature offset register during system calibration. The offset will be added to the temperature result after linearization. It has a same resolution of 7.8125m°C and same range of +/-256°C as the temperature result register. If added result is out of boundary, then the temperature result will show as the maximum or minimum value.',
                    // mode: 'RW', // missing in IRegisterFieldInfo. TMP117 registers.json defines it
                    // anchor: "",
                    // attrs: {
                    //     isHidden: "0",
                    //     isReserved: "0",
                    //     isLocked: "0"
                    // },
                    // comments: ""
                }
            ]
        };
    });

    after(() => {
        usbTransport.isConnected() && usbTransport.disconnect();
    });

    it('getInstance', () => {
        expect(CodecRegistry.getInstance(u2aId)).to.equal(u2a);
    });

    it('API SendCommand and ReadResponse - validate encoded packet and decoded packet', async () => {
        const u2a = new USB2ANY({connectTimeout: 100});
        const packet = u2a.sendCommandPacket(106, [0, 0, 0, 0]);
        // [84, <crc8>, 4, 1, 0, 1, 0, 106, 0, 0, 0, 0]
        expect(packet.length, 'send packet length').eq(12);
        expect(packet[0], 'send packet identifier').eq(84);
        expect(packet[1], 'send packet pec byte').gt(0).lt(255);
        expect(packet.slice(2), 'send packet content').eql([4, 1, 0, 1, 0, 106, 0, 0, 0, 0]);

        const emulatedRxPacket = [84, 235, 1, 2, 0, 1, 0, 106, 1];
        (async () => {
            const rxPacket = await u2a.readResponse(packet);
            expect(rxPacket, 'read response packet').eql(emulatedRxPacket);
        })();
        // this pattern also works for people looking for this style.
        // u2a.readResponse(packet).then((rxPacket: number[]) => {
        //     expect(rxPacket).eql(emulatedRxPacket);
        // })

        // emulate u2a receiving packet
        u2a.decode(emulatedRxPacket);
    });

    it('configure u2a+i2c', () => {
        expect(() => {
            CodecRegistry.configure(u2aId+'+i2c');
        }).to.not.throw();
        expect(CodecRegistry.isActive(u2aId)).to.be.true;
        expect(CodecRegistry.isActive('i2c')).to.be.true;
    });

    it('reconfigure system', () => {
        // usb + u2a (power,i2c)
        CodecRegistry.configure('usb+'+u2aId+'(power,i2c)');
        expect(CodecRegistry.isActive(u2aId)).to.be.true;
        expect(CodecRegistry.isActive('power')).to.be.true;
        expect(CodecRegistry.isActive('i2c')).to.be.true;
    });

    describe('device TMP117', function()  {
        this.timeout(500);
        before(function() {
            const deviceName = processArgs[ARG_DEVICE_NAME];
            if (deviceName !== 'TMP117') {
                this.skip();
            }
        });

        it('system connect by usb connect', async function() {
            this.timeout(4000);
            await usbTransport.connect();
            expect(usbTransport.isConnected()).to.be.true;
        });

        it('i2c writeValue, readValue', async () => {
            const originalValue = await i2c.readValue(regOffsetTemp);
            expect(originalValue, 'first read value').gte(0).lte(0xffff);

            const writeValue = originalValue ^ 0xef;
            await i2c.writeValue(regOffsetTemp, writeValue);

            const readValue = await i2c.readValue(regOffsetTemp);
            expect(readValue).eq(writeValue);

            await i2c.writeValue(regOffsetTemp, originalValue);
        });

        it('i2c multiRegisterRead, 16 registers, internal loop of readValue', async () => {
            // tmp117 registers address 0x0 to 0xf. It is an internal loop of readValue when sequentialRead false.
            // If hw supports sequential read, we need to add another test case.
            const startRegInfo = {
                addr: 0x0,
                nBytes: 2,
                name: 'start of registers',
                fields: []
            };
            const regCount = 16;
            const readValues = await i2c.multiRegisterRead(startRegInfo, regCount);
            expect(readValues.length).eq(regCount);
        });
    });

});
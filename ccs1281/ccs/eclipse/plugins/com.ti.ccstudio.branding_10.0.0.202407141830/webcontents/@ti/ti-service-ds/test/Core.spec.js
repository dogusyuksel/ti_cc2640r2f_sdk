import { expect } from 'chai';
import * as path from 'path';
import { processArgs, ARG_DEVICE_NAME, ARG_ENABLE_LOG } from '../../ti-core-assets/test/TestArgs';
import { ServicesRegistry } from '../../ti-core-services/lib/ServicesRegistry';
import { dsServiceType, debugCoreType, targetStateChangedEventType, refreshEventType, Location } from '../lib/DSService';
import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
import { TiFiles } from '../../ti-core-assets/lib/TiFiles';
/** Enabled Logging *********************************************************************************************************** */
TiConsole.setLevel('ti-service-ds', processArgs[ARG_ENABLE_LOG]);
/** *************************************************************************************************************************** */
describe('CoreTest', () => {
    const dsService = ServicesRegistry.getService(dsServiceType);
    let ccxml;
    let core;
    before(async function () {
        if (processArgs[ARG_DEVICE_NAME] !== 'MSP432P401R')
            this.skip();
        ccxml = await TiFiles.readTextFile(path.join(__dirname, 'assets/MSP432P401R.ccxml'));
    });
    beforeEach(async function () {
        await dsService.configure(ccxml);
        [core] = await dsService.listCores(debugCoreType);
    });
    afterEach(async function () {
        await dsService.deConfigure();
    });
    it('getResets', async function () {
        const resets = await core.getResets();
        expect(resets).length.gte(3);
        expect(resets).to.include.deep.members([{ type: 'Reset Emulator', allowed: true }]);
    });
    it('reset', async function () {
        await core.reset('Reset Emulator');
    });
    it('connect', async function () {
        await core.connect();
    });
    it('disconnect', async function () {
        await core.connect();
        await core.disconnect();
    });
    it('run', async function () {
        await core.connect();
        await core.run();
        await core.halt();
        await core.run(true);
    });
    it('halt', async function () {
        await core.connect();
        await core.run();
        await core.halt();
    });
    it('loadProgram', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Blink.out'));
        await core.connect();
        /* load symbols only */
        await core.loadProgram(out, true);
        /* load program */
        await core.loadProgram(out, false);
        /* load program with verify */
        await core.loadProgram(out, false, true);
    });
    it('loadBin', async function () {
        const bin = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Blink.bin'));
        await core.connect();
        /* load bin */
        await core.loadBin(bin, new Location(0));
        /* load bin with verify */
        await core.loadBin(bin, new Location(0), true);
    });
    it('verifyProgram', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Blink.out'));
        await core.connect();
        /* load program */
        await core.loadProgram(out, false);
        /* verify program */
        await core.verifyProgram(out);
    });
    it('evaluate', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Expressions.out'));
        await core.connect();
        await core.loadProgram(out, false);
        let result = await core.evaluate('myStruct');
        expect(result).deep.include({
            arrayInfo: null,
            location: '0x200001BC',
            mayHaveCausedRefresh: false,
            members: [
                { expression: '(myStruct)._int', name: '_int' },
                { expression: '(myStruct)._bool', name: '_bool' },
            ],
            type: 'struct MYSTRUCT',
            value: '{...}'
        });
        result = await core.evaluate('_charArray');
        expect(result).deep.include({
            arrayInfo: {
                elementType: 'unsigned char',
                expression: '_charArray',
                size: 16
            },
            location: '0x2000017D',
            mayHaveCausedRefresh: false,
            members: [],
            type: 'unsigned char[16]',
            value: '0x2000017D'
        });
        result = await core.evaluate('_charPtr');
        expect(result).deep.include({
            arrayInfo: null,
            location: '0x20000190',
            mayHaveCausedRefresh: false,
            members: [],
            type: 'unsigned char *',
            value: '0x2000017D'
        });
        result = await core.evaluate('_int');
        expect(result).deep.include({
            arrayInfo: null,
            location: '0x200001A4',
            mayHaveCausedRefresh: false,
            members: [],
            type: 'int',
            value: '-2147483647'
        });
        result = await core.evaluate('_bool');
        expect(result).deep.include({
            arrayInfo: null,
            location: '0x2000017C',
            mayHaveCausedRefresh: false,
            members: [],
            type: 'unsigned char',
            value: '1'
        });
    });
    it('readValue', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Expressions.out'));
        await core.connect();
        await core.loadProgram(out, false);
        const myStruct = await core.readValue('myStruct');
        expect(myStruct).include({
            _int: 42,
            _bool: 1
        });
        const myEnum = await core.readValue('myEnum');
        expect(myEnum).is.eq(2);
        const _bool = await core.readValue('_bool');
        expect(_bool).is.eq(1);
        const _float = await core.readValue('_float');
        expect(_float).is.eq(3.14159274);
        const _double = await core.readValue('_double');
        expect(_double).is.eq(3.1415926540000001);
        const _charArray = await core.readValue('_charArray');
        expect(_charArray).to.have.ordered.members([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0]);
        const _charPtr = await core.readValue('_charPtr');
        expect(_charPtr).is.eq('Hello World!');
        const _2DIntArray = await core.readValue('_2DIntArray');
        expect(_2DIntArray).is.eql([[10, 11, 12, 13], [14, 15, 16, 17]]);
        const _2DStructArray = await core.readValue('_2DStructArray');
        expect(_2DStructArray).is.eql([{ _int: 1, _bool: 1 }, { _int: 2, _bool: 0 }]);
        const _short = await core.readValue('_short');
        expect(_short).is.eq(-32767);
        const _unsignedShort = await core.readValue('_unsigned_short');
        expect(_unsignedShort).is.eq(65535);
        const _int = await core.readValue('_int');
        expect(_int).is.eq(-2147483647);
        const _unsignedInt = await core.readValue('_unsigned_int');
        expect(_unsignedInt).is.eq(4294967295);
        const _long = await core.readValue('_long');
        expect(_long).is.eq(-2147483647);
        const _unsignedLong = await core.readValue('_unsigned_long');
        expect(_unsignedLong).is.eq(4294967295);
    });
    it('writeValue', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Expressions.out'));
        await core.connect();
        await core.loadProgram(out, false);
        await core.writeValue('_charArray', [42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 0]);
        const _charArray = await core.readValue('_charArray');
        expect(_charArray).is.to.have.members([42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 0]);
        await core.writeValue('_charArray', 'Hello World2!');
        const _charPtr = await core.readValue('_charPtr');
        expect(_charPtr).is.eq('Hello World2!');
        await core.writeValue('_int', 42);
        const _int = await core.readValue('_int');
        expect(_int).is.eq(42);
        await core.writeValue('myStruct', { _int: 1, _bool: 0 });
        const myStruct = await core.readValue('myStruct');
        expect(myStruct).include({
            _int: 1,
            _bool: 0
        });
    });
    it('readMemory', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Expressions.out'));
        await core.connect();
        await core.loadProgram(out, false);
        const addr = (await core.evaluate('&_charArray')).value;
        const array = await core.readMemory(new Location(addr), 'char', 16);
        expect(array.toString()).is.eq('72,101,108,108,111,32,87,111,114,108,100,33,0,0,0,0');
    });
    it('writeMemory', async function () {
        const out = await TiFiles.readBinaryFile(path.join(__dirname, 'assets/MSP432P401R_Expressions.out'));
        await core.connect();
        await core.loadProgram(out, false);
        const addr = (await core.evaluate('&_charArray')).value;
        await core.writeMemory(new Location(addr), 8, Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]));
        const array = await core.readMemory(new Location(addr), 'char', 16);
        expect(array.toString()).is.eq('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');
    });
    it('refreshEvent', async function () {
        let received = 0;
        const [core] = await dsService.listCores(debugCoreType);
        const listener = (detail) => {
            core.removeEventListener(refreshEventType, listener);
            received++;
        };
        core.addEventListener(refreshEventType, listener);
        await core.connect();
        expect(received).equal(1);
    });
    it('targetStateChangedEvent', async function () {
        let received = 0;
        const listener = (detail) => {
            core.removeEventListener(targetStateChangedEventType, listener);
            received++;
        };
        core.addEventListener(targetStateChangedEventType, listener);
        await core.connect();
        expect(received).equal(1);
    });
});
//# sourceMappingURL=Core.spec.js.map
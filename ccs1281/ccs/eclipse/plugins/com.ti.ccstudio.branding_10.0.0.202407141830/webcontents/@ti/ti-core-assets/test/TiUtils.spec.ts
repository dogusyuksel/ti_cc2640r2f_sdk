import { expect } from 'chai';
import { TiUtils } from '../lib/TiUtils';

describe('TiUtils', () => {
    it('string2value', () => {
        let result = TiUtils.string2value(undefined);
        expect(result).to.not.exist;
        result = TiUtils.string2value('0xdeadc0de');
        expect(result).to.be.equal(0xdeadc0de);
        result = TiUtils.string2value(0xdeadc0de);
        expect(result).to.be.equal(0xdeadc0de);
        result = TiUtils.string2value('12345678');
        expect(result).to.be.equal(12345678);
        result = TiUtils.string2value('test');
        expect(result).to.be.NaN;
        result = TiUtils.string2value('-0xbabeface');
        expect(result).to.be.equal(-0xbabeface);
    });

    it('bitField.getMask', () => {
        // TODO: support BigInt when cloud agent moves to 10.4+ nodejs version.
        // let result = TiUtils.bitField.getMask(39, 39);
        // expect(result).to.equal(0x8000000000);
        // result = TiUtils.bitField.getMask(39, 8);
        // expect(result).to.equal(0xFFFFFFFF00);

        let result = TiUtils.bitField.getMask(31, 31);
        expect(result).to.equal(0x80000000);
        result = TiUtils.bitField.getMask(0, 31);
        expect(result).to.equal(0xFFFFFFFF);
        result = TiUtils.bitField.getMask(15, 15);
        expect(result).to.equal(0x8000);
        result = TiUtils.bitField.getMask(1, 15);
        expect(result).to.equal(0xFFFE);
        result = TiUtils.bitField.getMask(7, 7);
        expect(result).to.equal(0x80);
        result = TiUtils.bitField.getMask(0, 7);
        expect(result).to.equal(0xFF);
        result = TiUtils.bitField.getMask(1, 1);
        expect(result).to.equal(0x2);
        result = TiUtils.bitField.getMask(0, 0);
        expect(result).to.equal(0x1);
    });

    it('bitField.readField', async () => {
        let result = TiUtils.bitField.readField(0xFFFFFFFF, 0x80000000, 0);
        expect(result).to.equal(0x80000000);
        result = TiUtils.bitField.readField(0xFFFFFFFF, 0x80000000, 31);
        expect(result).to.equal(1);
        result = TiUtils.bitField.readField(0xFFFFFFFF, 0x80000000, 0, 0x80000000);
        expect(result).to.equal(-0x80000000);
        result = TiUtils.bitField.readField(0xFFFFFFFF, 0x80000000, 31, 0x80000000);
        expect(result).to.equal(-1);
        result = TiUtils.bitField.readField(0xAAAAAAAA, 0xFFFF0000, 0);
        expect(result).to.equal(0xAAAA0000);
        result = TiUtils.bitField.readField(0xAAAAAAAA, 0xFFFF0000, 16);
        expect(result).to.equal(0xAAAA);
        result = TiUtils.bitField.readField(0xAAAAAAAA, 0xFFFF0000, 0, 0x80000000);
        expect(result).to.equal(-0x55560000);
        result = TiUtils.bitField.readField(0xAAAAAAAA, 0xFFFF0000, 16, 0x80000000);
        expect(result).to.equal(-0x5556);
        result = TiUtils.bitField.readField(0x55555555, 0x00FFFF00, 0);
        expect(result).to.equal(0x00555500);
        result = TiUtils.bitField.readField(0x55555555, 0x00FFFF00, 8);
        expect(result).to.equal(0x5555);
        result = TiUtils.bitField.readField(0x55555555, 0x00FFFF00, 0, 0x800000);
        expect(result).to.equal(0x00555500);
        result = TiUtils.bitField.readField(0x55555555, 0x00FFFF00, 8, 0x800000);
        expect(result).to.equal(0x5555);
        result = TiUtils.bitField.readField(-1, 0xFFFF, 0);
        expect(result).to.equal(0xFFFF);
        result = TiUtils.bitField.readField(-1, 0x2, 1);
        expect(result).to.equal(1);
        result = TiUtils.bitField.readField(-1, 0xFFFE, 0, 0x8000);
        expect(result).to.equal(-2);
        result = TiUtils.bitField.readField(-1, 0x1, 0, 0x1);
        expect(result).to.equal(-1);
    });

    it('bitField.writeField', async () => {
        let result = TiUtils.bitField.writeField(0x7FFFFFFF, 0x80000000, 0, 0x80000000);
        expect(result).to.equal(0xFFFFFFFF);
        result = TiUtils.bitField.writeField(0xFFFFFFFF, 0x80000000, 31, 0);
        expect(result).to.equal(0x7FFFFFFF);
        result = TiUtils.bitField.writeField(0x80000000, 0x80000000, 0, -1);
        expect(result).to.equal(0x80000000);
        result = TiUtils.bitField.writeField(0x80000000, 0x80000000, 31, -2);
        expect(result).to.equal(0);
        result = TiUtils.bitField.writeField(0xAAAAAAAA, 0xFFFF0000, 0, -1);
        expect(result).to.equal(0xFFFFAAAA);
        result = TiUtils.bitField.writeField(0xAAAAAAAA, 0xFFFF0000, 16, 0x5555);
        expect(result).to.equal(0x5555AAAA);
        result = TiUtils.bitField.writeField(0xAAAAAAAA, 0xFFFF0000, 0, 0x80000000);
        expect(result).to.equal(0x8000AAAA);
        result = TiUtils.bitField.writeField(0x5AAAAAAA, 0xFFFF0000, 16, 0x8000);
        expect(result).to.equal(0x8000AAAA);
        result = TiUtils.bitField.writeField(0x55555555, 0x00FFFF00, 0, 0x1234FF);
        expect(result).to.equal(0x55123455);
        result = TiUtils.bitField.writeField(0x55555555, 0x00FFFF00, 8, -0x1234);
        expect(result).to.equal(0x55EDCC55);
        result = TiUtils.bitField.writeField(0x55555555, 0x00FFFF00, 0, 0x0);
        expect(result).to.equal(0x55000055);
        result = TiUtils.bitField.writeField(0x55555555, 0x00FFFF00, 8, 0x8000);
        expect(result).to.equal(0x55800055);
        result = TiUtils.bitField.writeField(-1, 0xFFFF, 0, 0xBABE);
        expect(result).to.equal(0xFFFFBABE);
        result = TiUtils.bitField.writeField(-1, 0x2, 1, 0);
        expect(result).to.equal(0xFFFFFFFD);
        result = TiUtils.bitField.writeField(-1, 0xFFFE, 0, 0x321E);
        expect(result).to.equal(0xFFFF321F);
        result = TiUtils.bitField.writeField(-1, 0x1, 0, -0x321E);
        expect(result).to.equal(0xFFFFFFFE);
    });

});

import { expect } from 'chai';

import { TiLocalStorage } from '../lib/TiLocalStorage';

describe('TiLocalStorage', () => {
    beforeEach(() => {
        TiLocalStorage.clear();
    });

    it('setItem', () => {
        TiLocalStorage.setItem('patrickIsCool', 'true');
        TiLocalStorage.setItem('patrickIsAwesome', 'veryTrue');
        const cool = TiLocalStorage.getItem('patrickIsCool');
        const awesome = TiLocalStorage.getItem('patrickIsAwesome');

        expect(cool).is.equal('true');
        expect(awesome).is.equal('veryTrue');
    });

    it('getItem', () => {
        TiLocalStorage.setItem('not_empty', 'super duper');
        TiLocalStorage.setItem('empty', '');
        const notEmpty = TiLocalStorage.getItem('not_empty');
        const empty = TiLocalStorage.getItem('empty');
        const invalid = TiLocalStorage.getItem('invalid');

        expect(notEmpty).is.equal('super duper');
        expect(empty).is.equal('');
        expect(invalid).is.null;
    });

    it('removeItem', () => {
        TiLocalStorage.setItem('patrickIsCool', 'true');
        let cool = TiLocalStorage.getItem('patrickIsCool');
        expect(cool).is.equal('true');
        TiLocalStorage.removeItem('patrickIsCool');
        cool = TiLocalStorage.getItem('patrickIsCool');
        expect(cool).is.null;
    });

    it('length', () => {
        expect(TiLocalStorage.length).is.equal(0);
        TiLocalStorage.setItem('patrickIsCool', 'true');
        expect(TiLocalStorage.length).is.equal(1);
    });

    it('key', () => {
        TiLocalStorage.setItem('patrickIsCool1', 'true');
        TiLocalStorage.setItem('patrickIsCool2', 'true');
        TiLocalStorage.setItem('patrickIsCool3', 'true');
        expect(TiLocalStorage.key(0)).is.equal('patrickIsCool1');
        expect(TiLocalStorage.key(1)).is.equal('patrickIsCool2');
        expect(TiLocalStorage.key(2)).is.equal('patrickIsCool3');
    });
});

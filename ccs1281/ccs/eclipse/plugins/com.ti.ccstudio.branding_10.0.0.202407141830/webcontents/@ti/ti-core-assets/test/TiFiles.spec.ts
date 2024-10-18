import { expect } from 'chai';
import path from 'path';
import os from 'os';

import { TiFiles } from '../lib/TiFiles';

const jsonObj = {
    boolean: true,
    string: 'abc',
    number: 1,
    object: {
        foobar: 1
    }
};


const jsonObjFilePath = path.join(__dirname, 'assets/file.json');
const binFilePath = path.join(__dirname, '/assets/file.bin');

describe('TiFile', () => {
    it('readInvalidFile', done => {
        TiFiles.readTextFile('IAmNotAValidFile').then(() => {
            done('Expecting not to be able to read the file.');
        }).catch(() => done());
    });

    it('readJsonFile', () => {
        return TiFiles.readJsonFile(jsonObjFilePath).then(data => {
            expect(data).to.deep.equal(jsonObj);
        });
    });

    it('readTextFile', () => {
        return TiFiles.readTextFile(jsonObjFilePath).then(data => {
            expect(data.split('\r\n').join('\n')).to.equal(JSON.stringify(jsonObj, null, 4));
        });
    });

    it('readBinaryFile', () => {
        return TiFiles.readBinaryFile(binFilePath).then(data => {
            expect(data).to.deep.equal(Buffer.from(JSON.stringify(jsonObj)));
        });
    });

    it('writeJsonFile', () => {
        const filepath = path.join(os.tmpdir(), 'TiFile.json');
        return TiFiles.writeJsonFile(filepath, jsonObj).then(() => {
            return TiFiles.readJsonFile(filepath);
        }).then(data => {
            expect(data).to.deep.equal(jsonObj);
        });
    });

    it('writeTextFile', () => {
        const filepath = path.join(os.tmpdir(), 'TiFile.json');
        return TiFiles.writeTextFile(filepath, JSON.stringify(jsonObj, null, 4)).then(() => {
            return TiFiles.readTextFile(filepath);
        }).then(data => {
            expect(data).to.equal(JSON.stringify(jsonObj, null, 4));
        });
    });

});

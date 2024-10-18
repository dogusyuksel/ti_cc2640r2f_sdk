import { expect } from 'chai';
import '../../ti-core-assets/lib/NodeJSEnv';
import { JsonCodec } from '../../ti-codec-json/lib/JsonCodec';
import { connectionManager } from '../lib/ConnectionManager';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';

describe('Connection Manager', () => {

    before(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (CodecRegistry as any).clear();   // clear the registery to avoid other tests clashing with this one.
    });

    it('whenConfigurationReady', async () => {
        let isReady = false;
        connectionManager.whenConfigurationReady('config').then(() => {
            isReady = true;
        });

        expect(isReady).to.be.false;
        new JsonCodec({id: 'a'});
        new JsonCodec({id: 'b'});
        connectionManager.registerConfiguration('config', 'a+b+c');
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(isReady).to.be.false;
        new JsonCodec({id: 'c'});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(isReady).to.be.true;
    });
});

import { expect } from 'chai';

import { TiConsole, IOutputListener } from '../lib/TiConsole';

const MODULE_NAME = 'TiConsoleTest';
const console = new TiConsole(MODULE_NAME);

class NullOutputListener implements IOutputListener {
    groupCollapsed(groupText: string, style: string): void { /* do nothing */ }
    groupEnd(): void { /* do nothing */ }
    trace(text: string, style: string): void { /* do nothing */ }
    log(text: string): void { /* do nothing */ }
}

describe('TiConsoleTest', () => {
    before(() => {
        TiConsole.setOutputListener(new NullOutputListener);
    });

    after(() => {
        TiConsole.setOutputListener(null);
    });

    beforeEach(() => {
        console.setLevel(5);
    });

    it('console.log', () => {
        console.log('testing console.log');
        console.log((int: number, str: string) => {
            expect(int).is.equals(42);
            expect(str).is.equals('abc');
            return 'testing console.log';
        }, 42, 'abc');
    });

    it('console.info', () => {
        console.info('testing console.info');
        console.info((int: number, str: string) => {
            expect(int).is.equals(42);
            expect(str).is.equals('abc');
            return 'testing console.info';
        }, 42, 'abc');
    });

    it('console.error', () => {
        console.error('testing console.error');
        console.error((int: number, str: string) => {
            expect(int).is.equals(42);
            expect(str).is.equals('abc');
            return 'testing console.error';
        }, 42, 'abc');
    });

    it('console.warning', () => {
        console.warning('testing console.warning');
        console.warning((int: number, str: string) => {
            expect(int).is.equals(42);
            expect(str).is.equals('abc');
            return 'testing console.warning';
        }, 42, 'abc');
    });

    it('console.debug', () => {
        console.debug('testing console.debug');
        console.debug((int: number, str: string) => {
            expect(int).is.equals(42);
            expect(str).is.equals('abc');
            return 'testing console.debug';
        }, 42, 'abc');
    });

    it('getLevels/setLevel', () => {
        console.setLevel(1);
        const [level] = TiConsole.getLevels().filter(l => l.startsWith(MODULE_NAME));
        expect(level).is.equals(`${MODULE_NAME}=1 (errors)`);
    });

});
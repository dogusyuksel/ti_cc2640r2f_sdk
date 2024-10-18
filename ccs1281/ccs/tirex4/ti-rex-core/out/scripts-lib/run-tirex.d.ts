export function runTirex(config: any, callback?: () => void): void;
export var command: string;
export var describe: string;
export namespace builder {
    export namespace dinfra {
        export const describe: string;
        export const demandOption: boolean;
    }
    export const production: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const inspectBrk: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const inspect: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
}
export function handler(argv: any): void;

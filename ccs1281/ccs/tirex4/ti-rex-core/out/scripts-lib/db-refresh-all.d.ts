export function handler(argv: any): void;
export var command: string;
export var describe: string;
export namespace builder {
    export const dinfra: {
        describe: string;
        demandOption: boolean;
        default: string;
    };
    export const dconfig: {
        describe: string;
        demandOption: boolean;
        default: string;
    };
    export const appconfig: {
        describe: string;
        demandOption: boolean;
        default: string;
    };
    export const rediscoverOnly: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const defaultJson: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const validationType: {
        describe: string;
        default: string;
    };
    export namespace contentPath {
        export const describe: string;
    }
    export const noSyncPackages: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
}

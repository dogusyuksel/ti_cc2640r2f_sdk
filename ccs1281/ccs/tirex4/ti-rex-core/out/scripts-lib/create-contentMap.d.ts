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
}

export var command: string;
export var describe: string;
export namespace builder {
    export namespace remoteserverUrl {
        export const describe: string;
        export const demandOption: boolean;
    }
    export const dinfra: {
        demandOption: boolean;
        describe: string;
    };
    export namespace testMode {
        const describe_1: string;
        export { describe_1 as describe };
        export const choices: import("../util").TestMode[];
        const demandOption_1: boolean;
        export { demandOption_1 as demandOption };
    }
    export namespace testData {
        const describe_2: string;
        export { describe_2 as describe };
    }
}
export function handler(argv: any): void;

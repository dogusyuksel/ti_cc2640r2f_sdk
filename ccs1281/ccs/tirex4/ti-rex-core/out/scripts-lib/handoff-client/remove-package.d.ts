export var command: string;
export var describe: string;
export namespace builder {
    export namespace packageId {
        export const alias: string;
        export const describe: string;
        export const demandOption: boolean;
    }
    export const packageVersion: {
        describe: string;
        default: string;
    };
    export namespace url {
        const alias_1: string;
        export { alias_1 as alias };
        const describe_1: string;
        export { describe_1 as describe };
        const demandOption_1: boolean;
        export { demandOption_1 as demandOption };
    }
    export namespace email {
        const alias_2: string;
        export { alias_2 as alias };
        const describe_2: string;
        export { describe_2 as describe };
        export const array: boolean;
    }
}
export function handler(argv: any): void;

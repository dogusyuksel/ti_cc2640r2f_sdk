export function validateEntrySchema(entries: any): Error | null;
export var command: string;
export var describe: string;
export namespace builder {
    export namespace handoffFile {
        export const alias: string;
        export const describe: string;
        export const demandOption: boolean;
    }
    export namespace url {
        const alias_1: string;
        export { alias_1 as alias };
        const describe_1: string;
        export { describe_1 as describe };
        const demandOption_1: boolean;
        export { demandOption_1 as demandOption };
    }
}
export function handler(argv: any): void;

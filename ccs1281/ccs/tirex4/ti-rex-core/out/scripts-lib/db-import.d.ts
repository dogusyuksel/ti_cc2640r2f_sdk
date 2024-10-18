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
    export const verboseLogging: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const quiet: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const skipContent: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const skipMetadata: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const switchTablePrefix: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const dryRun: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export namespace dbTablePrefix {
        export const describe: string;
    }
    export const incremental: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const noDbCopies: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export namespace include {
        const describe_1: string;
        export { describe_1 as describe };
        export const array: boolean;
    }
    export namespace exclude {
        const describe_2: string;
        export { describe_2 as describe };
        const array_1: boolean;
        export { array_1 as array };
    }
    export const notify_forTestingOnly: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const appendOnly: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export const strictValidation: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    export namespace contentConfigFile {
        const describe_3: string;
        export { describe_3 as describe };
    }
}

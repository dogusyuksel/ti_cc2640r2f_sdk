export function testProjects(args: {
    tirexUrl: string;
    ccsUrl: string;
    packages: any;
    exclude: any;
    backupLocation: string;
    device: string;
    devtool: string;
    logFile: string;
    reportFile: string;
}, callback: any): void;
export var command: string;
export var describe: string;
export namespace builder {
    export namespace tirexUrl {
        export const alias: string;
        export const describe: string;
        export const demandOption: boolean;
    }
    export namespace ccsUrl {
        const alias_1: string;
        export { alias_1 as alias };
        const describe_1: string;
        export { describe_1 as describe };
        const demandOption_1: boolean;
        export { demandOption_1 as demandOption };
    }
    export namespace packages {
        const alias_2: string;
        export { alias_2 as alias };
        const describe_2: string;
        export { describe_2 as describe };
        export const array: boolean;
    }
    export namespace exclude {
        const describe_3: string;
        export { describe_3 as describe };
        const array_1: boolean;
        export { array_1 as array };
    }
    export namespace backupLocation {
        const describe_4: string;
        export { describe_4 as describe };
    }
    export namespace device {
        const describe_5: string;
        export { describe_5 as describe };
    }
    export namespace devtool {
        const alias_3: string;
        export { alias_3 as alias };
        const describe_6: string;
        export { describe_6 as describe };
    }
    export const logFile: {
        describe: string;
        default: string;
    };
    export const reportFile: {
        describe: string;
        default: string;
    };
}
export function handler(argv: any): void;
export type testProjectsCallback = (error: Error, result: Object, total: number, failed: number, log: string) => any;

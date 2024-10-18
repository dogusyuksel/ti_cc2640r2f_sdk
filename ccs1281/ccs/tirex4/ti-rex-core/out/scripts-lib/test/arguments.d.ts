export namespace options {
    export namespace remoteserverOptionsCommon {
        import dinfra = dinfra;
        export { dinfra };
        import files = files;
        export { files };
        import testMode = testMode;
        export { testMode };
        import timeout = timeout;
        export { timeout };
        import testData = testData;
        export { testData };
        export const consoleLog: {
            describe: string;
            default: boolean;
            boolean: boolean;
        };
        import verbose = verbose;
        export { verbose };
    }
    export namespace remoteserverOptionsMainProcess {
        import inspectBrk = inspectBrk;
        export { inspectBrk };
    }
    export namespace loadRemoteserverOptionsCommon {
        import dinfra_1 = dinfra;
        export { dinfra_1 as dinfra };
        import files_1 = files;
        export { files_1 as files };
        import remoteserverUrl = remoteserverUrl;
        export { remoteserverUrl };
        import testData_1 = testData;
        export { testData_1 as testData };
        export const reqLimit: {
            describe: string;
            default: number;
            number: boolean;
        };
        import testMode_1 = testMode;
        export { testMode_1 as testMode };
        import verbose_1 = verbose;
        export { verbose_1 as verbose };
    }
    export namespace loadRemoteserverMainProcess {
        import inspectBrk_1 = inspectBrk;
        export { inspectBrk_1 as inspectBrk };
    }
    export namespace serverIndependentOptionsCommon {
        import dinfra_2 = dinfra;
        export { dinfra_2 as dinfra };
        import files_2 = files;
        export { files_2 as files };
        import testMode_2 = testMode;
        export { testMode_2 as testMode };
        import timeout_1 = timeout;
        export { timeout_1 as timeout };
        import customTest = customTest;
        export { customTest };
        import testData_2 = testData;
        export { testData_2 as testData };
        import verbose_2 = verbose;
        export { verbose_2 as verbose };
    }
    export namespace serverIndependentOptionsMainProcess {
        import inspectBrk_2 = inspectBrk;
        export { inspectBrk_2 as inspectBrk };
    }
    export namespace e2eOptions {
        import inspectBrk_3 = inspectBrk;
        export { inspectBrk_3 as inspectBrk };
        import remoteserverUrl_1 = remoteserverUrl;
        export { remoteserverUrl_1 as remoteserverUrl };
        import testData_3 = testData;
        export { testData_3 as testData };
        import testMode_3 = testMode;
        export { testMode_3 as testMode };
    }
}
export namespace commandInfo {
    export namespace remoteserver {
        export const command: string;
        export const describe: string;
    }
    export namespace loadRemoteserver {
        const command_1: string;
        export { command_1 as command };
        const describe_1: string;
        export { describe_1 as describe };
    }
    export namespace serverIndependent {
        const command_2: string;
        export { command_2 as command };
        const describe_2: string;
        export { describe_2 as describe };
    }
    export namespace e2e {
        const command_3: string;
        export { command_3 as command };
        const describe_3: string;
        export { describe_3 as describe };
    }
}
export function getOptionsMainProcess(configuration: any): {
    dinfra: {
        demandOption: boolean;
        describe: string;
    };
    files: {
        describe: string;
        array: boolean;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    timeout: {
        describe: string;
        default: number;
    };
    testData: {
        describe: string;
        default: any;
    };
    consoleLog: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
    verbose: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
    inspectBrk: {
        describe: string;
    };
} | {
    dinfra: {
        demandOption: boolean;
        describe: string;
    };
    files: {
        describe: string;
        array: boolean;
    };
    remoteserverUrl: {
        describe: string;
        demandOption: boolean;
    };
    testData: {
        describe: string;
        default: any;
    };
    reqLimit: {
        describe: string;
        default: number;
        number: boolean;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    verbose: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
    inspectBrk: {
        describe: string;
    };
} | {
    dinfra: {
        demandOption: boolean;
        describe: string;
    };
    files: {
        describe: string;
        array: boolean;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    timeout: {
        describe: string;
        default: number;
    };
    customTest: {
        describe: string;
    };
    testData: {
        describe: string;
        default: any;
    };
    verbose: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
    inspectBrk: {
        describe: string;
    };
} | {
    inspectBrk: {
        describe: string;
    };
    remoteserverUrl: {
        describe: string;
        demandOption: boolean;
    };
    testData: {
        describe: string;
        default: any;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
};
export function getOptionsSubProcess(configuration: any): {
    dinfra: {
        demandOption: boolean;
        describe: string;
    };
    files: {
        describe: string;
        array: boolean;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    timeout: {
        describe: string;
        default: number;
    };
    testData: {
        describe: string;
        default: any;
    };
    consoleLog: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
    verbose: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
} | {
    dinfra: {
        demandOption: boolean;
        describe: string;
    };
    files: {
        describe: string;
        array: boolean;
    };
    remoteserverUrl: {
        describe: string;
        demandOption: boolean;
    };
    testData: {
        describe: string;
        default: any;
    };
    reqLimit: {
        describe: string;
        default: number;
        number: boolean;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    verbose: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
} | {
    dinfra: {
        demandOption: boolean;
        describe: string;
    };
    files: {
        describe: string;
        array: boolean;
    };
    testMode: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    timeout: {
        describe: string;
        default: number;
    };
    customTest: {
        describe: string;
    };
    testData: {
        describe: string;
        default: any;
    };
    verbose: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
};
declare namespace commonOptions {
    const dinfra_3: {
        demandOption: boolean;
        describe: string;
    };
    export { dinfra_3 as dinfra };
    export namespace files_3 {
        const describe_4: string;
        export { describe_4 as describe };
        export const array: boolean;
    }
    export { files_3 as files };
    export namespace inspectBrk_4 {
        const describe_5: string;
        export { describe_5 as describe };
    }
    export { inspectBrk_4 as inspectBrk };
    export namespace remoteserverUrl_2 {
        const describe_6: string;
        export { describe_6 as describe };
        export const demandOption: boolean;
    }
    export { remoteserverUrl_2 as remoteserverUrl };
    const testMode_4: {
        describe: string;
        default: import("../util").TestMode;
        choices: import("../util").TestMode[];
    };
    export { testMode_4 as testMode };
    export namespace customTest_1 {
        const describe_7: string;
        export { describe_7 as describe };
    }
    export { customTest_1 as customTest };
    const timeout_2: {
        describe: string;
        default: number;
    };
    export { timeout_2 as timeout };
    const verbose_3: {
        describe: string;
        default: boolean;
        boolean: boolean;
    };
    export { verbose_3 as verbose };
    const testData_4: {
        describe: string;
        default: any;
    };
    export { testData_4 as testData };
}
export {};

export function testProject({ ccsUrl, location, deviceId }: {
    ccsUrl: any;
    location: any;
    deviceId?: any;
}, callback: any): void;
export var command: string;
export var describe: string;
export namespace builder {
    export namespace ccsUrl {
        export const alias: string;
        export const describe: string;
        export const demandOption: boolean;
    }
    export namespace location {
        const alias_1: string;
        export { alias_1 as alias };
        const describe_1: string;
        export { describe_1 as describe };
        const demandOption_1: boolean;
        export { demandOption_1 as demandOption };
    }
    export namespace deviceId {
        const alias_2: string;
        export { alias_2 as alias };
        const describe_2: string;
        export { describe_2 as describe };
    }
}
export function handler(argv: any): void;

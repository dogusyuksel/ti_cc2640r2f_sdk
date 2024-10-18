export function generate({ logDir, summarize }: {
    logDir: any;
    summarize: any;
}): Promise<string[]>;
export var command: string;
export var describe: string;
export namespace builder {
    export const logDir: {
        describe: string;
        string: boolean;
        demandOption: boolean;
    };
    export const summarize: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
}
export function handler(argv: any): void;

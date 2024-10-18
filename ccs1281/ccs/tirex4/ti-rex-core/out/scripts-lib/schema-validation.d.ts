export var command: string;
export var describe: string;
export namespace builder {
    export namespace contentPath {
        export const describe: string;
        export const demandOption: boolean;
    }
    export const cfg: {
        describe: string;
        default: string;
    };
    export const full: {
        describe: string;
        default: boolean;
    };
}
export function handler(argv: any): void;

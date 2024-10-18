export namespace config {
    export const seleniumAddress: string;
    export const multiCapabilities: {
        browserName: string;
        loggingPrefs: {
            driver: string;
            browser: string;
        };
    }[];
    export const maxSessions: number;
    export const getPageTimeout: number;
    export const allScriptsTimeout: number;
    export const framework: string;
    export namespace mochaOpts {
        export const reporter: string;
        export namespace reporterOptions {
            export const inlineAssets: boolean;
            export const quiet: boolean;
            export const reportDir: string;
            export const reportFilename: string;
        }
    }
    export const specs: string[];
    export function onPrepare(): Promise<any>;
    export function onComplete(): void;
}

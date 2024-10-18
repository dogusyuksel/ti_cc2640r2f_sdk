export var projectRoot: string;
export var remoteServerLog: string;
export var webdriverLog: string;
export var protractorLog: string;
export var browserConsoleLog: string;
export var mochaLog: string;
export var tscLog: string;
export var npmLog: string;
export var logsDir: string;
export var mochaServerPort: number;
export var seleniumServerPort: number;
export var remoteServerDebugPort: number;
export var mochaHtmlReport: string;
export var mochaJSONReport: string;
export var protractorHtmlReport: string;
export var protractorJSONReport: string;
export var loadTestSummaryHtmlReport: string;
export var loadTestHtmlReportDir: string;
export var generatedDataFolder: string;
export var dataFolder: string;
export var mochaServer: string;
export namespace TestConfig {
    export const REMOTESERVER: string;
    export const LOADREMOTESERVER: string;
    export const SERVER_INDEPENDENT: string;
    export const E2E: string;
}
export namespace TestMode {
    export const LIGHT_WEIGHT: string;
    export const HEAVY: string;
    export const VERY_HEAVY: string;
}
export var siteStaticData: string;
export var webdriversPath: string;
export var defaultTestdataPath: string;
export var mochaServerDataFolder: string;
export function initMochaConfig(overriddenConfig: Object): void;
export function getMochaConfig(): {
    preset: string;
    mode: string;
    validationType: string;
    myHttpPort: string;
    contentPath: string;
    dbTablePrefix: string;
    dbPath: string;
    seoPath: string;
    logsDir: string;
    analyticsDir: string;
    contentPackagesConfig: string;
    remoteBundleZips: string;
    localBundleZips: string;
    myRole: string;
    no_proxy: string;
    refreshDB: string;
    allowRefreshFromWeb: string;
    mailingList: string;
    handoffServer: boolean;
    useConsole: string;
    dbResourcePrefix: string;
    serveContentFromFs: boolean;
    allowExit: boolean;
    testingServer: boolean;
    webComponentsServer: string;
    ccsCloudUrl: string;
    https_proxy: string;
    http_proxy: string;
    HTTP_PROXY: string;
    HTTPS_PROXY: string;
    NO_PROXY: string;
    seaportHostIP: string;
    seaportPort: string;
    dcontrol: null;
    serverMode: string;
};
export function initMochaDConfig(overriddenDconfig: any): void;
export function getMochaDconfig(): any;
export function setupLog(log: string, callback: any, { clear }?: Object): void;
export var ProcessManager: typeof ProcessManager;
export var processManager: ProcessManager;
export function resolvePath(p: string, { relative }?: {
    relative: string;
}): string;
export function setOptionDefault(option: any, optionList: any, value: any): any;
/**
 * Simplifies process management
 *
 */
declare class ProcessManager {
    /**
     * Redirect the processes output to the write stream
     *
     * @param {Object} p - An object returned by a child_process function
     *  i.e require('child_processes').spawn(..)
     * @param {stream.Writeable} out - The stream to write the processes output to
     *
     */
    static redirectProcessOutput({ child, out, name, exitMessage }: Object): void;
    /**
     * Register process and redirect to out.
     *
     * @param {Object} args
     *  @param {Object} args.child - An object returned by a child_process function
     *   i.e require('child_processes').spawn(..)
     *  @param {stream.Writeable} args.out - The stream to write the
     *   processes output to.
     *  @param {String} name
     *  @param {Boolean} exitMessage - if false suppress the exit code message
     *  @param {Boolean} restart - if false don't kill child when receiving restart signal
     */
    addProcess({ child, out, name, exitMessage, restart }: {
        child: Object;
        out: any;
    }): void;
}
export {};

/**
 * BuildType
 */
export type BuildType = string;
export namespace BuildType {
    export const FULL: string;
    export const INCREMENTAL: string;
    export const CLEAN: string;
}
export function testProjects({ tirexUrl, ccsUrl, logFile, reportFile, exclude, backupLocation, packages, device, devtool }: {
    tirexUrl: any;
    ccsUrl: any;
    logFile: any;
    reportFile: any;
    exclude?: any[] | undefined;
    backupLocation?: any;
    packages?: any;
    device?: any;
    devtool?: any;
}, callback: any): void;
export function testProject({ importable: { location, coreTypes }, ccsUrl, exclude, logStream, reportStream, backupLocation }: {
    importable: {
        location: any;
        coreTypes: any;
    };
    ccsUrl: any;
    exclude?: any[] | undefined;
    logStream: any;
    reportStream: any;
    backupLocation: any;
}): Promise<{
    total: any;
    failed: any;
    error: number;
    skipped: number;
}>;
export type getImportablesCallback = (error: Error, : any) => any;
/**
 * ResourceType
 */
export type ResourceType = string;

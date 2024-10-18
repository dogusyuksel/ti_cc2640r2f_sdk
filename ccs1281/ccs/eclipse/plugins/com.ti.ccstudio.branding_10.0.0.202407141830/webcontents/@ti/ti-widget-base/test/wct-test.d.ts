/**
 * Type declarations for WCT test APIs
 */
declare function fixture(fixture: string): any;
declare var assert: any;
declare function executeAndWait(runnable: (() => void)[] | (() => void), delay?: number): any;

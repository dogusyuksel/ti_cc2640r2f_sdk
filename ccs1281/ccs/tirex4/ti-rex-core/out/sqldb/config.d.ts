import { Omit } from '../shared/generic-types';
import { ConsoleVerbosity } from './manage';
export interface Config {
    dinfraPath: string;
    tablePrefix: string;
    logConfigPath?: string;
    trace: boolean;
    consoleVerbosity?: ConsoleVerbosity;
}
declare type PickKeysByType<T, T2> = {
    [K in keyof T]-?: T[K] extends T2 ? K : never;
}[keyof T];
declare type BooleanKeys = PickKeysByType<Config, boolean>;
export declare type PartialConfig = Partial<Config> & Omit<Config, BooleanKeys>;
export {};

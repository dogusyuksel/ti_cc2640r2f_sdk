/// <reference types="agent" />
import { EntryModule } from './entry-module';
import { Omit } from '../shared/generic-types';
export declare const rexCloudAgentModuleName = "Tirex";
export declare type RexCloudAgentModule = Omit<EntryModule, 'onClose' | '_getProgressManager' | '_notifyIDEPackagesChanged'> & TICloudAgent.Module;
export declare type AgentMode = 'desktop' | 'cloud';
export declare type AgentResponse<T extends keyof RexCloudAgentModule> = ReturnType<RexCloudAgentModule[T]>;
declare type PromiseResult<T> = T extends Promise<infer U> ? U : T;
export declare type AgentResult<T extends keyof RexCloudAgentModule> = PromiseResult<AgentResponse<T>>;
export {};

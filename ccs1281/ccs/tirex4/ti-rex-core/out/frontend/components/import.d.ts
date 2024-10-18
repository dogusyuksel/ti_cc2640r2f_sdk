import * as React from 'react';
import { Compiler, Nodes } from '../../shared/routes/response-data';
import { AppProps, CommonProps } from '../component-helpers/util';
export declare const enum ImportType {
    ONLINE = "Online",
    OFFLINE = "Offline"
}
export interface ImportPropsBase extends CommonProps {
    appProps: AppProps;
    node: Nodes.Node;
    projectName: string | null;
    onCloseFinal?: (importComplete: boolean) => void;
    onClose?: () => void;
    onInstall?: (progressIds: string[]) => void;
    skipInstallingMessage?: boolean;
}
interface ImportPropsOnline extends ImportPropsBase {
    importType: ImportType.ONLINE;
}
interface ImportPropsOffline extends ImportPropsBase {
    compiler: Compiler;
    deviceIds: string[];
    templateId: string;
    outputTypeId: string;
    importType: ImportType.OFFLINE;
}
export declare type ImportProps = ImportPropsOnline | ImportPropsOffline;
export declare const Import: React.ForwardRefExoticComponent<Pick<ImportProps, "key" | "node" | "id" | "onClose" | "style" | "appProps" | "projectName" | "className" | "skipInstallingMessage" | "importType" | "onCloseFinal" | "onInstall"> & React.RefAttributes<any>>;
export {};

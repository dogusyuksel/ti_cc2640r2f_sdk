import * as React from 'react';
import { AppProps, CommonProps, UseStylesClasses } from '../component-helpers/util';
import { PackageData } from '../apis/filter-types';
import { WithCloudAgentProps } from './with-cloud-agent';
import { InstallItem } from './confirm-install';
export interface InstallProps extends WithCloudAgentProps, CommonProps {
    appProps: AppProps;
    installItems: InstallItem[];
    onOpen: () => void;
    onClose: (progressIds: string[] | null, packageUids: string[] | null) => void;
    mode: 'button' | 'listItem';
    skipInstallingMessage?: boolean;
    modifyInstall?: boolean;
    classes?: UseStylesClasses<typeof useInstallStyles>;
}
declare const useInstallStyles: (props?: any) => Record<"button" | "root" | "buttonText" | "iconWithText", string>;
export declare const Install: (props: Pick<Pick<InstallProps, "key" | "id" | "onClose" | "style" | "agent" | "appProps" | "className" | "classes" | "mode" | "onOpen" | "isLoading" | "hasTooltip" | "installItems" | "skipInstallingMessage" | "modifyInstall"> & React.RefAttributes<any>, "key" | "id" | "onClose" | "ref" | "style" | "appProps" | "className" | "classes" | "mode" | "onOpen" | "installItems" | "skipInstallingMessage" | "modifyInstall"> & {
    agentProps: import("./with-cloud-agent").CloudAgentOnlyProps;
}) => JSX.Element;
export declare function getInstallItemsFromRequestedItem(packagePublicUid: string, packages: PackageData[]): InstallItem[];
export {};

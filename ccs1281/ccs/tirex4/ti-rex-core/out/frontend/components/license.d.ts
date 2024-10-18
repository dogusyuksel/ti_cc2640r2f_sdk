import * as React from 'react';
import { CommonProps, UseStylesClasses } from '../component-helpers/util';
interface LicenseProps extends CommonProps {
    onAgree: () => void;
    onDisagree: () => void;
    license: string[];
    classes?: UseStylesClasses<typeof useStyles>;
}
declare const useStyles: (props?: any) => Record<"iframe" | "root" | "agreeButton" | "disagreeButton" | "dialogContent", string>;
export declare const License: React.ForwardRefExoticComponent<Pick<LicenseProps, "key" | "id" | "license" | "style" | "className" | "classes" | "onAgree" | "onDisagree"> & React.RefAttributes<any>>;
export {};

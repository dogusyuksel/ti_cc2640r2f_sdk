import * as React from 'react';
import { Theme } from '../imports/material-ui-imports';
import { WithStyles } from '../imports/material-ui-styles-imports';
import { CommonProps } from '../component-helpers/util';
interface IframeProps extends CommonProps, WithStyles<typeof styles> {
    src?: string;
    srcDoc?: string;
    onLoad?: () => void;
}
declare const styles: (theme: Theme) => Record<"iframe" | "iframeContainer" | "loadingBar", import("@material-ui/styles/withStyles/withStyles").CSSProperties | import("@material-ui/styles").CreateCSSProperties<{}> | import("@material-ui/styles").PropsFunc<{}, import("@material-ui/styles").CreateCSSProperties<{}>>>;
export declare const Iframe: React.ComponentType<Pick<IframeProps, "key" | "id" | "ref" | "style" | "className" | "onLoad" | "src" | "srcDoc"> & import("@material-ui/styles/withStyles/withStyles").StyledComponentProps<"iframe" | "iframeContainer" | "loadingBar">>;
export {};

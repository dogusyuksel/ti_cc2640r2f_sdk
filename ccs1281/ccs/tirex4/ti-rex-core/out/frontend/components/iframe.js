"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Iframe = void 0;
// 3rd party
const classnames_1 = require("classnames");
const React = require("react");
// 3rd party components
const material_ui_imports_1 = require("../imports/material-ui-imports");
const material_ui_styles_imports_1 = require("../imports/material-ui-styles-imports");
// our modules
const theme_1 = require("../component-helpers/theme");
const util_1 = require("../component-helpers/util");
// our components
const base_component_1 = require("./base-component");
const styles_1 = require("../component-helpers/styles");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
const styles = (theme) => {
    const { verticalFlexContainer, flexItem } = styles_1.stylesCommon(theme);
    return material_ui_styles_imports_1.createStyles({
        iframeContainer: { ...verticalFlexContainer, ...flexItem },
        loadingBar: {
            position: 'absolute',
            zIndex: theme_1.zIndexLevel.min,
            width: '100%'
        },
        iframe: {
            position: 'inherit',
            color: 'white',
            backgroundColor: 'white'
        }
    });
};
// tslint:disable-next-line class-name
class _Iframe extends base_component_1.BaseComponent {
    constructor(props) {
        super(props);
        ///////////////////////////////////////////////////////////////////////////////
        /// Private methods
        ///////////////////////////////////////////////////////////////////////////////
        this.transitionIntoLoading = () => {
            if (this.transtitionIntoLoadingTimer) {
                clearTimeout(this.transtitionIntoLoadingTimer);
            }
            this.transtitionIntoLoadingTimer = window.setTimeout(() => {
                if (!this.state.loading) {
                    this.setState({ loading: true }, this.transtitionOutOfLoading);
                }
            }, util_1.LOADING_DELAY_MS);
            // tslint:disable-next-line:semicolon
        };
        this.transtitionOutOfLoading = () => {
            if (this.transtitionOutOfLoadingTimer) {
                clearTimeout(this.transtitionOutOfLoadingTimer);
            }
            this.transtitionOutOfLoadingTimer = window.setTimeout(() => {
                if (this.state.loading) {
                    this.setState({ loading: false });
                }
            }, _Iframe.TRANSTITION_OUT_OF_LOADING_TIMEOUT);
            // tslint:disable-next-line:semicolon
        };
        this.stopLoading = () => {
            if (this.transtitionIntoLoadingTimer) {
                clearTimeout(this.transtitionIntoLoadingTimer);
            }
            if (this.transtitionOutOfLoadingTimer) {
                clearTimeout(this.transtitionOutOfLoadingTimer);
            }
            if (this.state.loading) {
                this.setState({ loading: false });
            }
            // tslint:disable-next-line:semicolon
        };
        this.evtHandler = (onEvt) => {
            return () => {
                try {
                    onEvt();
                }
                catch (e) {
                    this.handleError(e);
                }
            };
            // tslint:disable-next-line:semicolon
        };
        this.state = { loading: false };
        if (props.src) {
            this.transitionIntoLoading();
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.src !== this.props.src) {
            this.transitionIntoLoading();
        }
    }
    handleRender() {
        const { className, classes, src, srcDoc, onLoad } = this.props;
        if (src == null && srcDoc == null) {
            throw new Error('No src or srcdoc defined');
        }
        return (React.createElement(React.Fragment, null,
            this.state.loading && React.createElement(material_ui_imports_1.LinearProgress, { className: classes.loadingBar }),
            React.createElement("iframe", Object.assign({ id: util_1.TEST_ID.iframeElement, onLoad: this.evtHandler(() => {
                    if (onLoad) {
                        onLoad();
                    }
                    this.stopLoading();
                }), className: classnames_1.default(classes.iframe, className) }, (src ? { src } : {}), (srcDoc ? { srcDoc } : {})))));
    }
}
_Iframe.TRANSTITION_OUT_OF_LOADING_TIMEOUT = 120000; // 2 minutes
exports.Iframe = material_ui_styles_imports_1.withStyles(styles)(_Iframe);

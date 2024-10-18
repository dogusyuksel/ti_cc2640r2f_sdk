"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedDropdownMenu = void 0;
// 3rd party
const React = require("react");
const classnames_1 = require("classnames");
// 3rd party components
const material_ui_imports_1 = require("../../imports/material-ui-imports");
const material_ui_styles_imports_1 = require("../../imports/material-ui-styles-imports");
// our modules
const context_1 = require("../../component-helpers/context");
const use_state_1 = require("../../component-helpers/use-state");
const util_1 = require("../../component-helpers/util");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
const useStyles = material_ui_styles_imports_1.makeStyles(() => {
    return {
        root: {
            position: 'relative'
        },
        paper: {
            position: 'absolute',
            overflow: 'auto',
            maxHeight: '75vh'
        }
    };
});
exports.NestedDropdownMenu = (props) => {
    // State
    const errorCallback = React.useRef(null);
    const [getState, setState] = use_state_1.useState({
        hovering: false,
        rootElement: null
    });
    // Hooks
    const classes = useStyles(props);
    // Events
    const onMouseOver = util_1.evtHandler((evt) => {
        if (listItemProps && listItemProps.onMouseOver) {
            listItemProps.onMouseOver(evt);
        }
        setState({ hovering: true });
    }, errorCallback);
    const onMouseLeave = util_1.evtHandler((evt) => {
        if (listItemProps && listItemProps.onMouseLeave) {
            listItemProps.onMouseLeave(evt);
        }
        setState({ hovering: false });
    }, errorCallback);
    // Render
    const { header, toggle, direction, listItemProps, listProps, children, className, classes: _classes, ...rest } = props;
    const { rootElement, hovering: isOpen } = getState();
    return (React.createElement(context_1.ErrorContextWrapper, { errorCallbackValue: value => {
            errorCallback.current = value;
        } },
        React.createElement("div", Object.assign({ className: classnames_1.default(classes.root, className) }, rest, { ref: (elem) => {
                if (!getState().rootElement) {
                    setState({ rootElement: elem });
                }
            } }),
            React.createElement(material_ui_imports_1.ListItem, Object.assign({}, null /* @ts-ignore - workaround for override strangness */, { button: true }, listItemProps, { onClick: (evt) => {
                    evt.preventDefault();
                    if (listItemProps && listItemProps.onClick) {
                        listItemProps.onClick(evt);
                    }
                }, onMouseOver: onMouseOver, onMouseLeave: onMouseLeave }),
                toggle,
                isOpen && (React.createElement(material_ui_imports_1.Paper, { className: classes.paper, elevation: 8, style: rootElement
                        ? {
                            top: 0,
                            ...(direction === "left" /* LEFT */
                                ? { right: rootElement.clientWidth }
                                : { left: rootElement.clientWidth })
                        }
                        : {} },
                    header,
                    React.createElement(material_ui_imports_1.List, Object.assign({}, listProps), children)))))));
};

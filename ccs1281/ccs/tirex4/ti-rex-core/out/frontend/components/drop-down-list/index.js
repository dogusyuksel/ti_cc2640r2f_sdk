"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropDownListCustomHeader = exports.DropDownList = void 0;
// 3rd party
const classnames_1 = require("classnames");
const React = require("react");
// 3rd party modules
const material_ui_icons_imports_1 = require("../../imports/material-ui-icons-imports");
const material_ui_imports_1 = require("../../imports/material-ui-imports");
const use_state_1 = require("../../component-helpers/use-state");
// our components
const DropdownMenu_1 = require("./DropdownMenu");
const NestedDropdownMenu_1 = require("./NestedDropdownMenu");
const util_1 = require("../../../shared/util");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
exports.DropDownList = React.forwardRef((props, ref) => {
    // State
    const [getState, setState] = use_state_1.useState({ open: false });
    const firstLoad = React.useRef(true);
    // Hooks
    React.useEffect(() => {
        if (!firstLoad.current && !getState().open && props.onClose) {
            props.onClose();
        }
    }, [getState().open]);
    React.useEffect(() => {
        firstLoad.current = false;
    }, []);
    // Events
    const onOpen = React.useCallback(() => {
        setState({ open: true });
    }, []);
    const onClose = React.useCallback(() => {
        setState({ open: false });
    }, []);
    // Render
    const { headerButtonProps, variant, classes, items, listProps, name, className, direction, popoverProps } = props;
    const { open } = getState();
    const toggle = (React.createElement(material_ui_imports_1.Button, Object.assign({}, headerButtonProps, { variant: variant, className: classes && classes.button, classes: {
            contained: classes && classes.contained
        } }, (open ? { variant: 'contained' } : {}), { onClick: onOpen }),
        name,
        " ",
        React.createElement(material_ui_icons_imports_1.ArrowDropDown, { style: { color: 'inherit' } })));
    const internalProps = {
        items,
        listProps,
        toggle,
        isOpen: open,
        direction: direction || "right" /* RIGHT */,
        onClose,
        popoverProps,
        dropDownType: "NonNested" /* NON_NESTED */,
        className: classnames_1.default(classes && classes.root, className),
        ref
    };
    return React.createElement(DropDownListInternal, Object.assign({}, internalProps));
});
function DropDownListCustomHeader(props) {
    const propsInternal = {
        items: props.items,
        toggle: props.header,
        isOpen: props.isOpen,
        direction: props.direction || "right" /* RIGHT */,
        onClose: () => {
            if (props.onClose) {
                props.onClose();
            }
        },
        popoverProps: props.popoverProps,
        listProps: props.listProps,
        dropDownType: "NonNested" /* NON_NESTED */
    };
    return React.createElement(DropDownListInternal, Object.assign({}, propsInternal));
}
exports.DropDownListCustomHeader = DropDownListCustomHeader;
function DropDownListInternal(props) {
    const children = props.items.map(item => {
        switch (item.elementType) {
            case "Nested" /* NESTED */: {
                const propsInner = {
                    items: item.items,
                    label: item.label,
                    dropDownType: "Nested" /* NESTED */,
                    requestClose: () => closeDropdown(props),
                    header: item.header,
                    direction: item.direction || "right" /* RIGHT */,
                    listItemProps: item.listItemProps,
                    listProps: props.listProps
                };
                return React.createElement(DropDownListInternal, Object.assign({}, propsInner, { key: item.id }));
            }
            case "NonNested" /* NON_NESTED */: {
                const { label, onClick, id, closeOnClick = true } = item;
                return (React.createElement(material_ui_imports_1.ListItem, Object.assign({}, null /* @ts-ignore - workaround for override strangeess */, { button: true }, item.listItemProps, { key: id, onClick: (evt) => {
                        if (item.listItemProps && item.listItemProps.onClick) {
                            item.listItemProps.onClick(evt);
                        }
                        evt.preventDefault();
                        if (closeOnClick) {
                            closeDropdown(props);
                        }
                        if (onClick) {
                            onClick();
                        }
                    } }),
                    item.leftIcon && React.createElement(material_ui_imports_1.ListItemIcon, null, item.leftIcon),
                    React.createElement(material_ui_imports_1.ListItemText, { primary: label, primaryTypographyProps: { noWrap: true } }),
                    item.rightIcon && React.createElement(material_ui_imports_1.ListItemIcon, null, item.rightIcon)));
            }
            case "Subheader" /* SUBHEADER */: {
                const { label, id } = item;
                return (React.createElement(material_ui_imports_1.ListSubheader, { key: id, style: { fontWeight: 'bold' } }, label));
            }
            case "CustomItem" /* CUSTOM_ITEM */: {
                const { id, item: CustomItem } = item;
                return React.createElement(CustomItem, { key: id, requestClose: () => closeDropdown(props) });
            }
            default:
                util_1.assertNever(item);
                throw new Error(`Unknown dropdown type ${item.elementType}`);
        }
    });
    switch (props.dropDownType) {
        case "Nested" /* NESTED */:
            const content = (React.createElement(material_ui_imports_1.ListItemText, { primary: props.label, primaryTypographyProps: { noWrap: true } }));
            return (React.createElement(NestedDropdownMenu_1.NestedDropdownMenu, { toggle: props.direction === "right" /* RIGHT */ ? (React.createElement(React.Fragment, null,
                    content,
                    React.createElement(material_ui_icons_imports_1.ChevronRight, null))) : (React.createElement(React.Fragment, null,
                    React.createElement(material_ui_icons_imports_1.ChevronLeft, null),
                    content)), direction: props.direction, header: props.header, listItemProps: props.listItemProps, listProps: props.listProps }, children));
        case "NonNested" /* NON_NESTED */:
            const { isOpen, onClose, toggle, listProps, direction, popoverProps } = props;
            return (React.createElement(DropdownMenu_1.DropdownMenu, { isOpen: isOpen, listProps: listProps, onClose: onClose, toggle: toggle, direction: direction, popoverProps: popoverProps }, children));
        default:
            util_1.assertNever(props);
            throw new Error(`Unknown dropdown type ${props.dropDownType}`);
    }
}
function closeDropdown(props) {
    if (props.dropDownType === "NonNested" /* NON_NESTED */) {
        props.onClose();
    }
    else {
        props.requestClose();
    }
}

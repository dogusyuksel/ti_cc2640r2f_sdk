"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrowRightLarge = exports.ArrowDropDownLarge = exports.AppsLarge = exports.PinSmall = exports.PinOffSmall = exports.MenuRightSmall = exports.MapMarkerSmall = exports.MenuDownSmall = exports.FunnelSmall = exports.CubeSmall = exports.ChevronDoubleRightSmall = exports.ChevronDoubleLeftSmall = exports.MoreVertSmall = exports.ExpandMoreSmall = exports.CloseSmall = exports.ChevronRightSmall = exports.ChevronLeftSmall = exports.ArrowRightSmall = exports.ArrowDropDownSmall = exports.AddSmall = exports.CircularProgressSmall = void 0;
// 3rd party
const React = require("react");
// 3rd party components
const material_ui_icons_imports_1 = require("../imports/material-ui-icons-imports");
const material_ui_imports_1 = require("../imports/material-ui-imports");
const mdi_material_ui_imports_1 = require("../imports/mdi-material-ui-imports");
// our modules
const theme_1 = require("../component-helpers/theme");
///////////////////////////////////////////////////////////////////////////////
/// Small Icons
///////////////////////////////////////////////////////////////////////////////
// material-ui
exports.CircularProgressSmall = (props) => {
    // can't use classes here because MuiCircularProgress uses the style prop
    // instead of classes to drive the width / height (this overides style)
    return (React.createElement(material_ui_imports_1.CircularProgress, Object.assign({}, props, { style: { width: theme_1.SMALL_ICON_SIZE, height: theme_1.SMALL_ICON_SIZE } })));
};
// material-ui-icons
exports.AddSmall = (props) => React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.Add, props: props });
exports.ArrowDropDownSmall = (props) => (React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.ArrowDropDown, props: props }));
exports.ArrowRightSmall = (props) => (React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.ArrowRight, props: props }));
exports.ChevronLeftSmall = (props) => (React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.ChevronLeft, props: props }));
exports.ChevronRightSmall = (props) => (React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.ChevronRight, props: props }));
exports.CloseSmall = (props) => React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.Close, props: props });
exports.ExpandMoreSmall = (props) => (React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.ExpandMore, props: props }));
exports.MoreVertSmall = (props) => (React.createElement(SmallIcon, { Icon: material_ui_icons_imports_1.MoreVert, props: props }));
// mdi-material-ui-icons
exports.ChevronDoubleLeftSmall = (props) => (React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.ChevronDoubleLeft, props: props }));
exports.ChevronDoubleRightSmall = (props) => (React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.ChevronDoubleRight, props: props }));
exports.CubeSmall = (props) => React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.Cube, props: props });
exports.FunnelSmall = (props) => React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.Funnel, props: props });
exports.MenuDownSmall = (props) => (React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.MenuDown, props: props }));
exports.MapMarkerSmall = (props) => (React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.MapMarker, props: props }));
exports.MenuRightSmall = (props) => (React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.MenuRight, props: props }));
exports.PinOffSmall = (props) => React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.PinOff, props: props });
exports.PinSmall = (props) => React.createElement(SmallIcon, { Icon: mdi_material_ui_imports_1.Pin, props: props });
///////////////////////////////////////////////////////////////////////////////
/// Large Icons
///////////////////////////////////////////////////////////////////////////////
exports.AppsLarge = (props) => React.createElement(LargeIcon, { Icon: material_ui_icons_imports_1.Apps, props: props });
exports.ArrowDropDownLarge = (props) => (React.createElement(LargeIcon, { Icon: material_ui_icons_imports_1.ArrowDropDown, props: props }));
exports.ArrowRightLarge = (props) => (React.createElement(LargeIcon, { Icon: material_ui_icons_imports_1.ArrowRight, props: props }));
///////////////////////////////////////////////////////////////////////////////
/// Helpers
///////////////////////////////////////////////////////////////////////////////
function SmallIcon(propsOuter) {
    const { props, Icon } = propsOuter;
    const { style, ...restProps } = props;
    return React.createElement(Icon, Object.assign({}, restProps, { style: { fontSize: theme_1.SMALL_ICON_SIZE, ...style } }));
}
function LargeIcon(propsOuter) {
    const { props, Icon } = propsOuter;
    const { style, ...restProps } = props;
    return React.createElement(Icon, Object.assign({}, restProps, { style: { fontSize: theme_1.LARGE_ICON_SIZE, ...style } }));
}

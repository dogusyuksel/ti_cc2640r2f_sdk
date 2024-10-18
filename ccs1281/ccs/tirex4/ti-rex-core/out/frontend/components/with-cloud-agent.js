"use strict";
// agent.js namespace
/// <reference types="agent" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCloudAgent = void 0;
// 3rd party
const React = require("react");
const cloud_agent_init_1 = require("./cloud-agent-init");
const use_cloud_agent_1 = require("../component-helpers/use-cloud-agent");
const counter_1 = require("../component-helpers/counter");
const use_state_1 = require("../component-helpers/use-state");
const context_1 = require("../component-helpers/context");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
function withCloudAgent(cloudAgentOptions) {
    return (Component) => {
        return function CloudAgentComponent(props) {
            return (React.createElement(CloudAgent, Object.assign({}, props, { Component: Component, cloudAgentOptions: cloudAgentOptions })));
        };
    };
}
exports.withCloudAgent = withCloudAgent;
function CloudAgent(props) {
    const { Component, cloudAgentOptions, agentProps, ...rest } = props;
    // State
    const [getState, setState] = use_state_1.useState({
        updateCounter: new counter_1.Counter(),
        forceUpdate: {}
    });
    const errorCallback = React.useRef(null);
    // Hooks
    const { shouldDisplayLoadingUI, result: agentState } = use_cloud_agent_1.useCloudAgent({
        dependencies: [getState().forceUpdate],
        errorCallback
    });
    // Events
    const onChangeHandler = React.useCallback(() => {
        setState({ forceUpdate: {} });
    }, []);
    // Render
    // @ts-ignore issue converting to T
    const componentProps = {
        ...rest,
        agent: agentState && agentState.agent,
        isLoading: shouldDisplayLoadingUI,
        hasTooltip: agentState
            ? // Check state (see CloudAgentInit for how it handles it)
                // Also if we haven't fetched agentState claim we have a tooltip as we're unsure and will update it when we know
                agentState.cloudAgentInitState === "AgentNotInstalled" /* AGENT_NOT_INSTALLED */ ||
                    agentState.cloudAgentInitState === "UnknownError" /* UNKNOWN_ERROR */
            : true
    };
    return (React.createElement(context_1.ErrorContextWrapper, { errorCallbackValue: value => {
            errorCallback.current = value;
        } },
        React.createElement(cloud_agent_init_1.CloudAgentInit, { agentState: agentState, onChange: onChangeHandler, mountComponentTemporarily: props.agentProps.appProps.mountComponentTemporarily, errorCallback: errorCallback },
            React.createElement(Component, Object.assign({}, componentProps)))));
}

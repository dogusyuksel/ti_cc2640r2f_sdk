"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTirexEventToTealium = void 0;
const util_1 = require("../../shared/util");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
let tryGetAnalyticsFnPromise = null;
function sendTirexEventToTealium(event) {
    return fetchAnalyticsFunction().then(analyticsFn => {
        switch (event.event_name) {
            case "tirex page view" /* PAGE_VIEW */:
            case "tirex search" /* SEARCH */:
            case "tirex filter" /* FILTER */:
            case "tirex package download" /* PACKAGE_DOWNLOAD */:
            case "tirex file download" /* FILE_DONWLOAD */:
            case "tirex package install" /* PACKAGE_INSTALL */:
            case "tirex project import" /* PROJECT_IMPORT */:
                analyticsFn('design tools', 'resource explorer', 'click', event);
                break;
            default: {
                util_1.assertNever(event);
                throw new Error(`Unknown event type for event ${event}`);
            }
        }
    });
}
exports.sendTirexEventToTealium = sendTirexEventToTealium;
function fetchAnalyticsFunction() {
    if (!tryGetAnalyticsFnPromise) {
        tryGetAnalyticsFnPromise = tryGetAnalytics();
    }
    return tryGetAnalyticsFnPromise;
}
function tryGetAnalytics() {
    const analyticsFn = getAnalyticsGlobal();
    if (analyticsFn) {
        return Promise.resolve(analyticsFn);
    }
    else {
        return new Promise((resolve, reject) => {
            let depth = 0;
            const intervalRef = setInterval(() => {
                const analyticsFn = getAnalyticsGlobal();
                if (analyticsFn) {
                    clearInterval(intervalRef);
                    resolve(analyticsFn);
                }
                else if (depth < 20) {
                    depth++;
                }
                else {
                    reject(new Error('Exceeded maximum wait time for utag'));
                }
            }, 500);
        });
    }
}
function getAnalyticsGlobal() {
    return window._tiAnalyticsTrack || null;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCSTheiaRequest = void 0;
// 3rd party
const url = require("url");
const path = require("path");
const request_helpers_1 = require("../shared/request-helpers");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
class CCSTheiaRequest {
    constructor(logger, theiaPort) {
        this.logger = logger;
        this.theiaPort = theiaPort;
    }
    rediscoverProducts() {
        return this.ccsRequest(constructUrl({ pathname: "/api/ccsserver/rediscoverProducts" /* REDISCOVER_PRODUCTS */, port: this.theiaPort }));
    }
    getProducts() {
        return this.ccsRequest(constructUrl({ pathname: "/api/ccsserver/getProducts" /* GET_PRODUCTS */, port: this.theiaPort }));
    }
    getProductDiscoveryPath() {
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/getProductDiscoveryPath" /* GET_PRODUCT_DISCOVERY_PATH */,
            port: this.theiaPort
        }));
    }
    getDevices(targetFilter) {
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/getDevices" /* GET_DEVICES */,
            port: this.theiaPort,
            queryObj: {
                ...(targetFilter ? { targetFilter } : {})
            }
        }));
    }
    // Critical for performance that this API isn't overused as it reads from ccs server's filesystem
    getDeviceDetail(deviceId) {
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/getDeviceDetails" /* GET_DEVICE_DETAILS */,
            port: this.theiaPort,
            queryObj: {
                deviceId
            }
        }));
    }
    getProjectTemplates(deviceId, toolVersion) {
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/getProjectTemplates" /* GET_PROJECT_TEMPLATES */,
            port: this.theiaPort,
            queryObj: {
                deviceId,
                toolVersion
            }
        }));
    }
    importProject(location, targetId, projectName) {
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/importProject" /* IMPORT_PROJECT */,
            port: this.theiaPort,
            queryObj: {
                location,
                ...(targetId ? { deviceId: targetId } : {}),
                ...(projectName ? { projectName } : {})
            }
        }));
    }
    createProject(location, targetId, projectName, templateId, toolVersion, outputType) {
        let actualProjectName;
        if (projectName) {
            actualProjectName = projectName;
        }
        else if (location) {
            actualProjectName = path.basename(location);
        }
        else {
            throw new Error('createProject: Either location or projectName must be provided');
        }
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/createProject" /* CREATE_PROJECT */,
            port: this.theiaPort,
            queryObj: {
                ...(location ? { copyFiles: location } : {}),
                projectName: actualProjectName,
                ...(targetId ? { deviceId: targetId } : {}),
                ...(toolVersion ? { toolVersion } : {}),
                ...(templateId ? { templateId } : {}),
                ...(outputType ? { outputType } : {})
            }
        }));
    }
    importSketch(location, targetId, projectName) {
        return this.ccsRequest(constructUrl({
            pathname: "/api/ccsserver/importSketch" /* IMPORT_SKETCH */,
            port: this.theiaPort,
            queryObj: {
                sketchFile: location,
                boardId: targetId,
                ...(projectName ? { projectName } : {})
            }
        }));
    }
    ///////////////////////////////////////////////////////////////////////////////
    /// Private methods
    ///////////////////////////////////////////////////////////////////////////////
    async ccsRequest(url) {
        const result = await request_helpers_1.doGetRequest(url);
        this.logger.info(`${url} returned ${result.data}`);
        return result.data;
    }
}
exports.CCSTheiaRequest = CCSTheiaRequest;
function constructUrl({ pathname, queryObj, port }) {
    const urlObj = {
        protocol: 'http',
        hostname: '127.0.0.1',
        port,
        pathname,
        query: queryObj
    };
    return url.format(urlObj);
}

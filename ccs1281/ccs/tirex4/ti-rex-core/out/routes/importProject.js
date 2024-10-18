"use strict";
/**
 *  Supports importProject, createProject
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
// 3rd party
const express_1 = require("express");
const vars_1 = require("../lib/vars");
const executeRoute_1 = require("./executeRoute");
const nodes_1 = require("./nodes");
const rexError_1 = require("../utils/rexError");
const HttpStatus = require("http-status-codes");
const helpers_1 = require("../shared/helpers");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
function getRoutes() {
    const routes = express_1.Router();
    routes.get(`/${"api/importProject" /* GET_IMPORT_PROJECT */}`, executeRoute_1.executeRoute(importProject, sendResponse));
    routes.get(`/${"api/importInfo" /* GET_IMPORT_INFO */}`, executeRoute_1.executeRoute(importInfo));
    return routes;
}
exports.getRoutes = getRoutes;
async function importInfo(sqldb, query, req) {
    // Get the resource
    const [id] = nodes_1.convertIdsForDB(query.dbId);
    const resource = await sqldb.getResourceOnNode(id);
    if (!resource || !resource.id) {
        throw new rexError_1.RexError({
            message: 'No resource id found: ' + req.originalUrl,
            httpCode: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
    return {
        location: resource.link || null,
        resourceType: resource.type || null,
        targets: await getTargets(sqldb, resource, query)
    };
}
/*
    importProject checks to see  what parameters we need to use for importProject
*/
async function importProject(sqldb, query, req) {
    const [id] = nodes_1.convertIdsForDB(query.dbId);
    const resource = await sqldb.getResourceOnNode(id);
    if (!resource || !resource.id) {
        throw new rexError_1.RexError({
            message: 'No resource id found: ' + req.originalUrl,
            httpCode: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
    let resUrl = '//' + vars_1.Vars.CCS_CLOUD_URL;
    if (resource.importProjectCCS) {
        resUrl += resource.importProjectCCS;
    }
    else if (resource.createProjectCCS) {
        resUrl += resource.createProjectCCS;
    }
    if (query.targetId) {
        // import with core/device or board id (Energia sketch, projectspecs with regex)
        const re = new RegExp(vars_1.Vars.TARGET_ID_PLACEHOLDER, 'g');
        resUrl = resUrl.replace(re, query.targetId);
    }
    return resUrl;
}
/*
    sendResponse will be send as  a parameter to the executeRoute to be used as the custom response function
    The only thing that this functions needs to do is the redirect
*/
const sendResponse = function sendResponse(req, res, resUrl) {
    res.set({ 'Access-Control-Allow-Origin': req.headers.origin });
    res.redirect(resUrl.payload);
};
async function getTargets(sqldb, resource, query) {
    // Get the nodeDataPath
    const ned = await nodes_1.getNodeExtendedData(sqldb, { dbId: query.dbId });
    const nodeIdPaths = ned.dbIdToChildExtData[query.dbId].nodeDbIdPath;
    const nodeDataPath = await Promise.all(nodeIdPaths.map(item => sqldb.getNodePresentation(Number(item))));
    // Get the list of device / boards assocated with the resource
    const deviceDbIds = await sqldb.getDevicesOnResource(resource.id);
    const allDeviceRecords = sqldb.getDeviceVariantsSorted();
    const deviceRecords = deviceDbIds
        .map(dbId => allDeviceRecords.find(item => item.id === dbId))
        .filter((item) => {
        return !!item;
    });
    const devtoolDbIds = await sqldb.getDevtoolsOnResource(resource.id);
    const allDevtoolRecords = sqldb.getDevtoolBoardsSorted();
    const devtoolRecords = devtoolDbIds
        .map(dbId => allDevtoolRecords.find(item => item.id === dbId))
        .filter((item) => {
        return !!item;
    });
    // Return the matching target, or all if we can't narrow down
    const devtoolRecord = getMatchingDevtoolRecord(devtoolRecords);
    const deviceRecord = getMatchingDeviceRecord(deviceRecords);
    if (deviceRecord) {
        return [deviceRecord.publicId];
    }
    else if (devtoolRecord) {
        const deviceDbIds = devtoolRecord.devices;
        const deviceRecords = deviceDbIds
            .map(publicId => allDeviceRecords.find(item => item.publicId === publicId))
            .filter((item) => {
            return !!item;
        });
        return deviceRecords.map(item => item.publicId);
    }
    else {
        return [...deviceRecords, ...devtoolRecords].map(item => item.publicId);
    }
    function getMatchingDeviceRecord(deviceRecords) {
        const deviceRecordInPath = deviceRecords.find(findRecordInPath);
        const deviceRecordInFitler = deviceRecords.find(record => findRecordInFilter(record, 'filterDevice'));
        return deviceRecordInFitler || deviceRecordInPath;
    }
    function getMatchingDevtoolRecord(devtoolRecords) {
        const devtoolRecordInPath = devtoolRecords.find(findRecordInPath);
        const devtoolRecordInFilter = devtoolRecords.find(record => findRecordInFilter(record, 'filterDevtool'));
        return devtoolRecordInFilter || devtoolRecordInPath;
    }
    function findRecordInPath(record) {
        return !!nodeDataPath.find(nodeData => nodeData.name === record.name);
    }
    function findRecordInFilter(record, key) {
        return !!helpers_1.getQueryParamAsArray(query[key] || []).find(recordPublicId => record.publicId === recordPublicId);
    }
}

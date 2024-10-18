"use strict";
/*
 * Hooks the tests into the server-harness by using sinon.SinonFakeServer to fake
 * out responses to XMLHttpRequests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeServerInit = void 0;
// 3rd party
const _ = require("lodash");
const pathToRegexp = require("path-to-regexp");
const QueryString = require("query-string");
const errors_1 = require("../../shared/errors");
const helpers_1 = require("../../shared/helpers");
const initialize_server_harness_data_1 = require("../server-harness/initialize-server-harness-data");
const util_1 = require("../../shared/util");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
function fakeServerInit(server, dataIn, serverHarness) {
    const data = initialize_server_harness_data_1.initializeServerHarnessData(dataIn);
    server.autoRespond = true;
    server.respondWith('GET', pathToRegexp('api', undefined, { end: false }), xhr => {
        const path = xhr.url.split('?')[0];
        if (pathToRegexp(`${"api/nodesData" /* GET_NODES_DATA */}`).test(path)) {
            getNodesData(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/nodeExtendedData" /* GET_NODE_EXTENDED_DATA */}`).test(path)) {
            getExtendedNodesData(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/filteredChildrenNodeIds" /* GET_FILTERED_CHILDREN_NODE_IDS */}`).test(path)) {
            getFilteredChildrenNodeIds(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/expandedFilteredDescendantNodesData" /* GET_EXPANDED_FILTERED_DESCENDANT_NODES_DATA */}`).test(path)) {
            getExpandedFilteredDescendantNodesData(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/filteredTableItemsData" /* GET_FILTERED_TABLE_ITEMS_DATA */}`).test(path)) {
            getFilteredTableItemsData(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/nodeDataForTableItemVariant" /* GET_NODE_DATA_FOR_TABLE_ITEM_VARIANT */}`).test(path)) {
            getNodeDataForTableItemVariant(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/filterOptions" /* GET_FILTER_OPTIONS */}`).test(path)) {
            getFilterOptions(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/rootNode" /* GET_ROOT_NODE */}`).test(path)) {
            getRootNode(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/searchSuggestions" /* GET_SEARCH_SUGGESTIONS */}`).test(path)) {
            getSearchSuggestions(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/packages" /* GET_PACKAGES */}`).test(path)) {
            getPackages(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/packageGroups" /* GET_PACKAGE_GROUPS */}`).test(path)) {
            getPackageGroups(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/nodeDownload" /* GET_NODE_DOWNLOAD */}`).test(path)) {
            getNodeDownload(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/importProject" /* GET_IMPORT_PROJECT */}`).test(path)) {
            getImportProject(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/importInfo" /* GET_IMPORT_INFO */}`).test(path)) {
            getImportInfo(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/serverConfig" /* GET_SERVER_CONFIG */}`).test(path)) {
            getServerConfig(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/nodePublicIdToDbId" /* GET_NODE_PUBLIC_ID_TO_DB_ID */}`).test(path)) {
            getNodePublicIdToDbId(xhr, data, serverHarness);
        }
        else if (pathToRegexp(`${"api/rex3LinkToDbId" /* GET_REX3_LINK_TO_DB_ID */}`).test(path)) {
            getRex3LinkToDbId(xhr, data, serverHarness);
        }
        else {
            xhr.respond(404, {}, `Unhandled api ${xhr.url}`);
        }
    });
    return data;
}
exports.fakeServerInit = fakeServerInit;
function getNodesData(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const ids = helpers_1.getQueryParamAsArray(query.dbId);
    try {
        const response = serverHarness.getNodes({ ids, data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getExtendedNodesData(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    try {
        const response = serverHarness.getNodesExtended({ id: query.dbId, data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getFilteredChildrenNodeIds(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const parentIds = helpers_1.getQueryParamAsArray(query.parentDbId);
    const filter = getFilterFromUrlQuery(query);
    try {
        const response = serverHarness.getFilteredChildrenNodeIds({
            parentIds,
            filter,
            data
        });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getExpandedFilteredDescendantNodesData(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const parentId = query.parentDbId;
    const filter = getFilterFromUrlQuery(query);
    try {
        const response = serverHarness.getExpandedFilteredDescendantNodesData({
            parentId,
            filter,
            data
        });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getFilteredTableItemsData(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const parentId = query.parentDbId;
    const filter = getFilterFromUrlQuery(query);
    try {
        const response = serverHarness.getFilteredTableItemsData({
            parentNodeDbId: parentId,
            filter,
            data
        });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getNodeDataForTableItemVariant(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const { tableItemDbId, variantCompiler, variantKernel } = query;
    try {
        const response = serverHarness.getNodeDataForTableItemVariant({
            tableItemDbId,
            variantCompiler,
            variantKernel,
            data
        });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getFilterOptions(xhr, data, serverHarness) {
    try {
        const response = serverHarness.getFilterOptions({ data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getRootNode(xhr, data, serverHarness) {
    try {
        const response = serverHarness.getRootNode({ data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getSearchSuggestions(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const text = query.text;
    const filter = getFilterFromUrlQuery(query);
    try {
        const response = serverHarness.getSearchSuggestions({ data, text, filter });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getPackages(xhr, data, serverHarness) {
    try {
        const response = serverHarness.getPackages({ data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getPackageGroups(xhr, data, serverHarness) {
    try {
        const response = serverHarness.getPackageGroups({ data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getNodeDownload(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const dbId = query.dbId;
    try {
        const response = serverHarness.getNodeDownload({ data, dbId });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getImportProject(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const { dbId, targetId } = query;
    try {
        const response = serverHarness.getImportProject({ data, dbId, targetId });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getImportInfo(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    const filter = getFilterFromUrlQuery(query);
    try {
        const response = serverHarness.getImportInfo({ data, filter, id: query.dbId });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getServerConfig(xhr, data, serverHarness) {
    try {
        const response = serverHarness.getServerConfig({ data });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getNodePublicIdToDbId(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    try {
        if (query.toDbIdType === "ToDbIdNotLatest" /* TO_DB_ID_GROUP_NOT_LATEST */ ||
            query.toDbIdType === "ToDbIdLatest" /* TO_DB_ID_GROUP_LATEST */) {
            const response = serverHarness.getNodePublicIdToDbId({
                data,
                nodePublicId: query.nodePublicId,
                packageGroupPublicUid: query.packageGroupPublicUid
            });
            xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
        }
        else {
            const response = serverHarness.getNodePublicIdToDbId({
                data,
                nodePublicId: query.nodePublicId,
                packageGroupPublicUid: null
            });
            xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
        }
    }
    catch (err) {
        handleError(err, xhr);
    }
}
function getRex3LinkToDbId(xhr, data, serverHarness) {
    const query = getQuery(xhr.url);
    try {
        const response = serverHarness.getRex3LinkToDbId({
            data,
            linkField: query.linkField
        });
        xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    }
    catch (err) {
        handleError(err, xhr);
    }
}
///////////////////////////////////////////////////////////////////////////////
/// Helpers
///////////////////////////////////////////////////////////////////////////////
function handleError(err, xhr) {
    if (err instanceof errors_1.NetworkError) {
        xhr.respond(parseInt(err.statusCode), {}, getErrorAsString(err));
    }
    else {
        xhr.respond(500, {}, getErrorAsString(err));
    }
}
function getFilterFromUrlQuery(filter) {
    const result = { filterPackageGroup: [] };
    util_1.getObjectKeys(filter).map(key => {
        switch (key) {
            case 'filterSearch':
                result[key] = filter[key];
                break;
            case 'filterDevice':
            case 'filterDevtool':
            case 'filterPackageGroup':
            case 'filterCompiler':
            case 'filterIde':
            case 'filterKernel':
            case 'filterLanguage':
            case 'filterResourceClass':
                result[key] = helpers_1.getQueryParamAsArray(filter[key] || []);
                break;
            case 'filterNode':
                result[key] = helpers_1.getQueryParamAsArray(filter[key] || []);
                break;
            default: {
                util_1.assertNever(key);
                // Don't throw since we pass in the full query to this function (including other query paramaters)
                // throw new Error(`Unknown filter key ${key}`);
            }
        }
    });
    return result;
}
function getQuery(url) {
    const urlParts = url.split('?');
    const query = QueryString.parse(urlParts.length === 2 ? urlParts[1] : '');
    return query;
}
function getErrorAsString(err) {
    if (typeof err === 'string') {
        return err;
    }
    else if (_.includes(err.stack || '', err.message || '')) {
        return err.stack || '';
    }
    else {
        return `${err.message || ''}\n${err.stack || ''}`;
    }
}

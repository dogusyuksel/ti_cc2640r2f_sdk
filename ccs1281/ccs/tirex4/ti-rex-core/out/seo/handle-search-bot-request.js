"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSearchBotRequest = void 0;
// 3rd party
const _ = require("lodash");
const path = require("path");
const fs = require("fs-extra");
const pathToRegexp = require("path-to-regexp");
const QueryString = require("query-string");
// our modules
const vars_1 = require("../lib/vars");
const http_status_codes_1 = require("http-status-codes");
const promise_utils_1 = require("../utils/promise-utils");
const sitemapGenerator_1 = require("../lib/sitemapGenerator");
const page_1 = require("../shared/routes/page");
const nodes_1 = require("../routes/nodes");
const public_id_helpers_1 = require("../frontend/component-helpers/public-id-helpers");
const packages_1 = require("../routes/packages");
const custom_url_helpers_1 = require("../shared/custom-url-helpers");
const util_1 = require("./util");
const routing_helpers_1 = require("../frontend/component-helpers/routing-helpers");
function handleSearchBotRequest(logger, vars) {
    return async (req, res, next) => {
        try {
            if (!util_1.isSearchBot(req) || !req.sqldb) {
                next();
                return;
            }
            const packageGroups = await packages_1.getPackageGroups(req.sqldb, undefined, req);
            const packages = await packages_1.getPackages(req.sqldb, undefined, req);
            // Handle BU landing pages
            const doneAtLandingPages = await handleBuLandingPages(req, res, packageGroups, packages);
            if (doneAtLandingPages) {
                return;
            }
            // don't allow bot to index anything other than node urls
            // TODO: should be able to remove blocked /content route in robots.txt
            if (!req.query.node) {
                util_1.sendNoIndex(res);
                return;
            }
            // Get the data from the public id
            const info = util_1.handlePublicId(req, res, packageGroups, packages);
            if (!info) {
                util_1.sendNoIndex(res);
                return;
            }
            const { packageGroupPublicId, nodePublicId, packagePublicId } = info;
            // redirect to LATEST first
            const pkgData = await handleLatest(req, res, packageGroups, packages, info, vars);
            if (!pkgData) {
                return;
            }
            const { pkg, latestPkgGroup } = pkgData;
            const nodeDbId = await util_1.getNodeDbIdforLatestVersion(req.sqldb, packageGroupPublicId, nodePublicId, packagePublicId);
            if (!nodeDbId) {
                res.sendStatus(404);
                return;
            }
            // Handle duplicate links
            const resource = await req.sqldb.getResourceOnNode(nodeDbId);
            const duplicateLinks = await util_1.getDuplicateLinks(nodeDbId, req.sqldb);
            if (duplicateLinks) {
                if (duplicateLinks.duplicatePaths) {
                    const canonicalLinkFullPathsPublicId = Object.keys(duplicateLinks.duplicatePaths)[0];
                    const isDuplicate = nodePublicId !== canonicalLinkFullPathsPublicId;
                    const trimmedUrl = req.originalUrl.match(/(.*?node\?)/);
                    const canoicalPublicId = public_id_helpers_1.getPublicIdFromIds({
                        nodePublicId: canonicalLinkFullPathsPublicId,
                        packageGroupPublicUid: latestPkgGroup.packageGroupPublicUid,
                        packagePublicUid: pkg ? pkg.packagePublicUid : null,
                        allGroups: packageGroups,
                        allPackages: packages,
                        urlQuery: {}
                    });
                    const canonicalLink = `${req.protocol}://${req.headers.host}${trimmedUrl[0]}node=${canoicalPublicId}`;
                    if (isDuplicate) {
                        res.setHeader('link', `<${canonicalLink}>; rel="canonical"`);
                    }
                }
            }
            if (resource && resource.link && resource.linkType) {
                if (resource.linkType === 'local') {
                    if (resource.link.endsWith('.html')) {
                        await streamUpHtml(res, req.sqldb, resource);
                    }
                    else if (resource.type === 'projectSpec' ||
                        resource.type === 'project.ccs' ||
                        resource.type === 'project.energia' ||
                        resource.type === 'folder.importable') {
                        await getResourceDescriptionAndKeywords(req.sqldb, resource);
                    }
                    else {
                        await streamUpFile(resource, req.sqldb);
                    }
                }
                else if (!sitemapGenerator_1.isExcludedExternalSites(resource.linkType, resource.link)) {
                    // WARNING: NOT EVER do this for any other sites than www.ti.com and software-dl.ti.com
                    await getExternalSite(resource.link, vars);
                }
                else {
                    res.sendStatus(404);
                }
            }
            else if (resource && resource.shortDescription) {
                streamUpResourceDescription(resource);
            }
            else {
                res.sendStatus(404);
            }
        }
        catch (err) {
            logger.error(`handleSearchBotRequest: ${err}`);
            res.status(http_status_codes_1.INTERNAL_SERVER_ERROR);
            res.send(err.message);
        }
        // Private functions
        async function getResourceDescriptionAndKeywords(sqldb, resource) {
            const keywords = await getKeywords(sqldb, resource);
            const description = getDescriptionAndShortDescription(resource);
            let body;
            if (keywords && description) {
                body = `<p>${description} ${keywords}</p>`;
            }
            else if (description) {
                body = `<p>${description}</p>`;
            }
            else if (keywords) {
                body = `<p>${keywords}</p>`;
            }
            else {
                body = `<p>${resource.name}</p>`;
            }
            const newMetaTag = getKeywordAndDescriptionMeta(keywords, description);
            const htmlUpToTitle = `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${resource.name}</title>`;
            const insertedText = `${newMetaTag ? newMetaTag : ''}`;
            const rest = `
                    ${getViewPortMeta}
                </head>
                <body>` +
                body +
                '</body></html>';
            res.send(htmlUpToTitle + insertedText + rest);
        }
        function streamUpResourceDescription(resource) {
            let body;
            if (resource.description) {
                body = `<p>${resource.description}</p>`;
            }
            else if (resource.shortDescription) {
                body = `<p>${resource.shortDescription}</p>`;
            }
            else {
                body = `<p>${resource.name}</p>`;
            }
            const content = `<!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>${resource.name}</title>
                      <meta name = "description" content="${resource.shortDescription.replace(/\"/g, '&quot;')}">
                      ${getViewPortMeta}
                    </head>
                    <body>` +
                body +
                '</body></html>';
            res.send(content);
        }
        async function streamUpFile(resource, sqldb) {
            if (resource.link.includes('pdf')) {
                res.setHeader('content-type', 'application/pdf');
                await promise_utils_1.promisePipe([
                    fs.createReadStream(path.join(vars_1.Vars.CONTENT_BASE_PATH, resource.link)),
                    res
                ]);
            }
            else {
                const keywords = await getKeywords(sqldb, resource);
                const description = getDescriptionAndShortDescription(resource);
                const header = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta charset="UTF-8">
                          <title>${resource.name}</title>
                          ${getKeywordAndDescriptionMeta(keywords, description)}
                          ${getViewPortMeta}
                        </head> 
                        <body>
                        `;
                let content = await fs.readFile(path.join(vars_1.Vars.CONTENT_BASE_PATH, resource.link), 'utf8');
                // Replace every non alpha numeric character with its equivalent html encoding
                content = util_1.replaceCharactersWithHtmlEncoding(content);
                content =
                    header +
                        '<pre style="word-wrap: break-word; white-space: pre-wrap;">' +
                        content +
                        '</pre></body></html>';
                res.send(content);
            }
        }
        async function streamUpHtml(res, sqldb, resource) {
            const keywords = await getKeywords(sqldb, resource);
            const description = getDescriptionAndShortDescription(resource);
            const resourceLink = await getRealHTML(resource.link);
            const fileContent = await fs.readFile(path.join(vars_1.Vars.CONTENT_BASE_PATH, resourceLink), 'utf8');
            if (!fileContent.includes('<meta name="description" content=') &&
                (keywords || description)) {
                // splitFileContent is the file content split on a <head> tag
                const splitFileContent = /([\S\s]*?<head>)([\S\s]*)/.exec(fileContent);
                if (!splitFileContent) {
                    res.send(fileContent);
                }
                else {
                    const keywordAndDescriptionMeta = keywords
                        ? getKeywordAndDescriptionMeta(keywords)
                        : getKeywordAndDescriptionMeta(keywords, description);
                    const viewPortMeta = getViewPortMeta();
                    res.send(splitFileContent[1] +
                        keywordAndDescriptionMeta +
                        viewPortMeta +
                        splitFileContent[2]);
                }
            }
            else {
                await promise_utils_1.promisePipe([
                    fs.createReadStream(path.join(vars_1.Vars.CONTENT_BASE_PATH, resourceLink)),
                    res
                ]);
            }
        }
        function getKeywordAndDescriptionMeta(keywords, description) {
            if (description && keywords) {
                description = util_1.replaceCharactersWithHtmlEncoding(description);
                return `<meta name="description" content="${description} Keywords: ${keywords}">`;
            }
            else if (description) {
                description = util_1.replaceCharactersWithHtmlEncoding(description);
                return `<meta name="description" content="${description}">`;
            }
            else if (keywords) {
                return `<meta name="description" content="${keywords}">`;
            }
            else {
                return;
            }
        }
        function getViewPortMeta() {
            return '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        }
        async function getKeywords(sqldb, resource) {
            const keywords = [];
            const devices = await sqldb.getDeviceNamesOnResource(resource.id);
            const devtools = await sqldb.getDevtoolNamesOnResource(resource.id);
            // Family names are not stored in the nodeDb, so we no longer have those
            // Tags are no longer supported due to database performance reasons
            if (devices) {
                addKeywords(keywords, devices);
            }
            if (devtools) {
                addKeywords(keywords, devtools);
            }
            if (resource.compiler) {
                addKeywords(keywords, resource.compiler);
            }
            if (resource.kernel) {
                addKeywords(keywords, resource.kernel);
            }
            if (keywords.length < 1) {
                return;
            }
            return keywords.toString();
        }
        function getDescriptionAndShortDescription(resource) {
            let description = '';
            if (resource.description) {
                description = description + resource.description;
            }
            if (resource.shortDescription) {
                description = description + resource.shortDescription;
            }
            if (description.length < 1) {
                return;
            }
            return description;
        }
        function addKeywords(keywords, keywordsList) {
            for (const keyword of keywordsList) {
                keywords.push(keyword);
            }
        }
        async function getRealHTML(resourceLink) {
            const content = await fs.readFile(path.join(vars_1.Vars.CONTENT_BASE_PATH, resourceLink));
            // This is a specific workaround to find out whether the html file is only for redirection.
            // We need to come up with a test to notify us if the BU changes their ways for redirecting html files.
            if (content.includes('<meta http-equiv="refresh"') === false) {
                return resourceLink;
            }
            const head = content.toString().split('url=');
            const link = head[1].split('"');
            const relatedPaths = resourceLink.split('/');
            relatedPaths.pop();
            let realPath = '';
            for (const folder of relatedPaths) {
                realPath = path.join(realPath, folder);
            }
            if (link[0].includes("'")) {
                link[0] = link[0].slice(1, link[0].length - 1);
            }
            realPath = path.join(realPath, link[0]);
            return getRealHTML(realPath);
        }
        function getExternalSite(url, vars) {
            return new Promise((resolve, reject) => {
                vars.requestObj
                    .get(url, (err, resp, _data) => {
                    if (!err) {
                        if (resp) {
                            // tslint:disable-next-line:forin
                            for (const key in resp.headers) {
                                logger.info(`headers.${key}: ${resp.headers[key]}`);
                            }
                            logger.info(`statusCode: ${resp.statusCode} (${resp.statusMessage})`);
                        }
                        resolve();
                    }
                    else {
                        logger.error(`GetExternalSIte: ${err}`);
                        res.status(http_status_codes_1.INTERNAL_SERVER_ERROR);
                        res.send(err.message);
                        reject(err.message);
                    }
                })
                    .pipe(res);
            });
        }
    };
}
exports.handleSearchBotRequest = handleSearchBotRequest;
async function handleBuLandingPages(req, res, packageGroups, packages) {
    if (!req.sqldb) {
        return true;
    }
    if (pathToRegexp(`/${page_1.Page.CUSTOM_URL_PACKAGE_SCOPED_RESOURCE_ID}`).test(req.originalUrl)) {
        const { resourceId, packageId, ...rest } = custom_url_helpers_1.getPackageScopedResourceIdQuery(QueryString.stringify(req.query));
        if (!resourceId || !packageId) {
            util_1.sendNoIndex(res);
        }
        else {
            const query = {
                resourceId,
                packageId,
                ...rest
            };
            const data = await nodes_1.getNodeInfoForResourceId(req.sqldb, query);
            handleNodeInfo(data, req, res, packageGroups, packages);
        }
        return true;
    }
    else if (pathToRegexp(`/${page_1.Page.CUSTOM_URL_GLOBAL_RESOURCE_ID}`).test(req.originalUrl)) {
        const { globalId, ...rest } = custom_url_helpers_1.getGlobalResourceIdQuery(QueryString.stringify(req.query));
        if (!globalId) {
            util_1.sendNoIndex(res);
        }
        else {
            const query = { globalId, ...rest };
            const data = await nodes_1.getNodeInfoForGlobalId(req.sqldb, query);
            handleNodeInfo(data, req, res, packageGroups, packages);
        }
        return true;
    }
    else {
        return false;
    }
}
function handleNodeInfo(data, _req, res, packageGroups, packages) {
    const nodeInfo = _.first(data);
    if (!nodeInfo) {
        util_1.sendNoIndex(res);
        return;
    }
    const publicId = public_id_helpers_1.getPublicIdFromIds({
        nodePublicId: nodeInfo.hashedNodePublicId,
        packageGroupPublicUid: `${nodeInfo.packageGroup.publicId}__${nodeInfo.packageGroup.version}`,
        packagePublicUid: `${nodeInfo.package.publicId}__${nodeInfo.package.version}`,
        allGroups: packageGroups,
        allPackages: packages,
        urlQuery: {}
    });
    res.redirect(301, `${routing_helpers_1.getLinkPrefix()}/${page_1.Page.EXPLORE}/node?node=${publicId}`);
    return;
}
async function handleLatest(req, res, packageGroups, packages, { packageGroupPublicId, packageGroupVersion, nodePublicId, packagePublicId }, vars) {
    if (!req.sqldb) {
        util_1.sendNoIndex(res);
        return false;
    }
    const nodeDbIdforLatestVersion = await util_1.getNodeDbIdforLatestVersion(req.sqldb, packageGroupPublicId, nodePublicId, packagePublicId);
    const latestPkgGroup = packageGroups.find(item => item.packageGroupPublicId === packageGroupPublicId);
    if (!latestPkgGroup || !nodeDbIdforLatestVersion) {
        util_1.sendNoIndex(res);
        return false;
    }
    const nodeData = await req.sqldb.getNodePresentation(nodeDbIdforLatestVersion);
    const pkg = req.sqldb
        .getPackageRecords()
        .find(item => item.packageDbId === (nodeData.packageId && nodeData.packageId.toString()));
    if (latestPkgGroup.packageGroupVersion !== packageGroupVersion) {
        const targetPublicId = public_id_helpers_1.getPublicIdFromIds({
            nodePublicId,
            packageGroupPublicUid: latestPkgGroup.packageGroupPublicUid,
            packagePublicUid: pkg ? pkg.packagePublicUid : null,
            allGroups: packageGroups,
            allPackages: packages,
            urlQuery: {}
        });
        const prefix = vars.role;
        res.redirect(301, `${prefix}/${page_1.Page.EXPLORE}/node?node=${targetPublicId}`);
        return false;
    }
    return { latestPkgGroup, pkg: pkg || null };
}

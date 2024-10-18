'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLink = exports.getRoutes = void 0;
// 3rd party modules
const express = require("express");
const seo_1 = require("./seo");
const app_1 = require("./app");
const index_1 = require("./index");
const nodes_1 = require("./nodes");
const packages_1 = require("./packages");
const importProject_1 = require("./importProject");
const download_1 = require("./download");
const handoff_1 = require("./handoff");
const refresh_1 = require("./refresh");
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
function getRoutes({ rex, dinfra, config, desktopServer }) {
    const routes = express.Router();
    routes.use(seo_1.getRoutes(rex.log.userLogger, rex.vars));
    routes.use(app_1.getRoutes(dinfra, config, desktopServer));
    routes.use(index_1.getRoutes(dinfra));
    routes.use(nodes_1.getRoutes());
    routes.use(packages_1.getRoutes());
    routes.use(importProject_1.getRoutes());
    routes.use(download_1.getRoutes());
    // admin routes
    routes.use(handoff_1.getRoutes(rex));
    routes.use(refresh_1.getRoutes(rex.loggerManager));
    return routes;
}
exports.getRoutes = getRoutes;
function makeLink(link, linkType) {
    link = link.replace('http://', 'https://');
    return linkType === 'local' ? 'content/' + link : link; // TODO: use linkAPI for resource links
}
exports.makeLink = makeLink;

/**
 * Fixed configuration variables - they don't change at run-time
 */

'use strict';

require('rootpath')();

const os = require('os');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const logger = require('./logger')();

module.exports = Vars;

const projectRoot = path.join(__dirname, '..');

const Preset = {
    CONTENT_DEVELOPER: 'content-developer'
};

/**
 * Constructor
 *
 * init:
 * @property {String} contentPath
 * @property {String} ccsCloudUrl
 * @property {String} downloadsCache

 * @constructor
 */
function Vars(config={}) {
    Vars.projectRoot = projectRoot;    
    Vars.MODE = config.mode;

    Vars.VERSION_TIREX =  require(path.join(projectRoot, 'package.json')).version;

    Vars.RESOURCE_OT_FOUND_MSG = 'Resource not found. Click on the TI Resource Explorer Home Button to refresh all resources.';
    Vars.BUNDLE_LIST_DELIMITER = '::';
    Vars.BUNDLE_ID_VERSION_DELIMITER = '__';
    Vars.SUPPORT_MULTIPLE_VERSIONS = true;

    Vars.RELOCATE_PACKAGES = config.relocatePackages;

    Vars.MAILING_LIST = config.mailingList;

    ///////////////////////////////////////////////////////////////////////////
    // Preset dependent config
    ///////////////////////////////////////////////////////////////////////////     
    if (config.preset === Preset.CONTENT_DEVELOPER) {
        Vars.ALLOW_REFRESH_FROM_WEB = 'true';
        Vars.REFRESH_DB = 'false';
        Vars.HANDOFF_SERVER = 'true';
    }
    else {
        Vars.ALLOW_REFRESH_FROM_WEB = config.allowRefreshFromWeb;
        Vars.REFRESH_DB = config.refreshDB;
        Vars.HANDOFF_SERVER = config.handoffServer;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Things that should be deprecated
    ///////////////////////////////////////////////////////////////////////////

    Vars.LOCALSERVER = config.mode;
    Vars.HOST = os.platform();
    Vars.PACKAGE_LIST_DELIMITER = '::';
    Vars.PACKAGE_ID_VERSION_DELIMITER = '__';
    Vars.ROLE = config.myRole;
    
    ///////////////////////////////////////////////////////////////////////////
    // URLs
    ///////////////////////////////////////////////////////////////////////////

    Vars.LOCALSERVER_USER_AGENT_PREFIX = 'TirexServer';
    if (config.mode === 'localserver') {
        Vars.LOCALSERVER_USER_AGENT = `${Vars.LOCALSERVER_USER_AGENT_PREFIX}/${Vars.VERSION_TIREX} (${os.platform()})`;
        if (config.startInOfflineMode) {
            Vars.START_IN_OFFLINE_MODE = true;
        }
    }
    
    Vars.REQUEST_DEFAULTS = {
        forever: true,
        jar: true,
        headers: {
            'User-Agent': Vars.LOCALSERVER_USER_AGENT || ''
        }
    };
    
    Vars.WEBCOMPONENTSSERVER_BASEURL = config.webComponentsServer;
    Vars.REMOTE_BUNDLE_ZIPS = config.remoteBundleZips;
    Vars.REMOTESERVER_BASEURL = config.remoteserverHost;

    ///////////////////////////////////////////////////////////////////////////
    // For content / zips
    ///////////////////////////////////////////////////////////////////////////

    Vars.CONTENT_BASE_PATH = path.normalize(config.contentPath);
    Vars.DEFAULT_CONTENT_BASE_PATH = Vars.CONTENT_BASE_PATH; // remember the default value from config
    Vars.ZIPS_FOLDER = config.localBundleZips ?
        config.localBundleZips : path.join(Vars.CONTENT_BASE_PATH, 'zips');
    {
        const _path = path.isAbsolute(config.contentPackagesConfig) ?
              config.contentPackagesConfig :
              path.join(projectRoot, config.contentPackagesConfig);
        Vars.CONTENT_PACKAGES_CONFIG = _path;
    }
    
    Vars.PACKAGE_MANAGER_FILE = path.join(
        path.dirname(Vars.CONTENT_PACKAGES_CONFIG), 'package-manager.tirex.json'
    );
    Vars.HANDOFF_FILE = path.join(
        path.dirname(Vars.CONTENT_PACKAGES_CONFIG), 'package-manager-diff.tirex.json'
    );

    ///////////////////////////////////////////////////////////////////////////
    // Paths
    ///////////////////////////////////////////////////////////////////////////
    
    Vars.DB_BASE_PATH = path.normalize(config.dbPath);
    Vars.DB_LOGS_BASE_PATH = path.join(Vars.DB_BASE_PATH, 'logs');
    Vars.SITEMAP_PATH = path.join(Vars.DB_BASE_PATH, 'sitemap');
    Vars.DOWNLOADS_BASE_PATH = config.downloadsCache; // ensure this is a fast/local drive for better performance
    Vars.BIN_BASE_PATH = path.join(projectRoot, 'bin');
    
    ///////////////////////////////////////////////////////////////////////////
    // CCS Related
    ///////////////////////////////////////////////////////////////////////////

    Vars.CCS_CLOUD_URL = config.ccsCloudUrl;
    Vars.CCS_LOCALPORT = config.ccs_port;
    Vars.CCS_CLOUD_IMPORT_PATH = '@ti-rex-content'; // the path as it exists on the CCS Cloud proxy
    Vars.TARGET_ID_PLACEHOLDER = '_deviceplaceholder_';
    Vars.CCS_CLOUD_API_BASE = '/ide/api/ccsserver/';
    Vars.CCS_DESKTOP_API_BASE = Vars.CCS_CLOUD_API_BASE + 'ide/';
    Vars.CCS_CREATE_PROJECT_API = Vars.CCS_CLOUD_API_BASE + 'createProject';
    Vars.CCS_IMPORT_PROJECT_API = Vars.CCS_CLOUD_API_BASE + 'importProject';
    Vars.CCS_IMPORT_SKETCH_API  = Vars.CCS_CLOUD_API_BASE + 'importSketch';

    ///////////////////////////////////////////////////////////////////////////
    // Package metadata related
    ///////////////////////////////////////////////////////////////////////////

    Vars.METADATA_DIR = path.join('.metadata', '.tirex'); 
    Vars.DEPENDENCY_DIR = path.join('.dependencies'); // relative to the METADATA_DIR
    Vars.IMPLICIT_DEPENDENCY_MAPPING_FILE = 'dependency-mapping.json'; // relative to the DEPENDENCY_DIR
    Vars.META_2_1_TOP_CATEGORY = {
        software: {id:'software', text:'Software'},
        devices:  {id:'devices',  text:'Device Documentation'},
        devtools: {id:'devtools', text:'Development Tools'},
        getByText: function(text) {
            if (text === Vars.META_2_1_TOP_CATEGORY.software.text) {
                return Vars.META_2_1_TOP_CATEGORY.software;
            }
            else if (text === Vars.META_2_1_TOP_CATEGORY.devices.text) {
                return Vars.META_2_1_TOP_CATEGORY.devices;
            }
            else if (text === Vars.META_2_1_TOP_CATEGORY.devtools.text) {
                return Vars.META_2_1_TOP_CATEGORY.devtools;
            }
            else {
                return null;
            }
        }
    };

    // predefined fields in package.tirex.json
    Vars.METADATA_PKG_DOWNLOAD_ONLY = 'desktopOnly';
    Vars.METADATA_PKG_IMPORT_ONLY = 'desktopImportOnly';

    return Vars;
}

Vars.createDirs = function () {
    logger.info(`content dir: ${Vars.CONTENT_BASE_PATH}`);
    if (fs.existsSync(Vars.DB_BASE_PATH) === false) {
        mkdirp.sync(Vars.DB_BASE_PATH);
    }
    logger.info(`db dir: ${Vars.DB_BASE_PATH}`);

    if (fs.existsSync(Vars.DB_LOGS_BASE_PATH) === false) {
        mkdirp.sync(Vars.DB_LOGS_BASE_PATH);
    }
    logger.info(`db logs dir: ${Vars.DB_LOGS_BASE_PATH}`);

    if (fs.existsSync(Vars.SITEMAP_PATH) === false) {
        mkdirp.sync(Vars.SITEMAP_PATH);
    }
    logger.info(`sitemap dir: ${Vars.SITEMAP_PATH}`);

    if (fs.existsSync(Vars.DOWNLOADS_BASE_PATH) === false) {
        mkdirp.sync(Vars.DOWNLOADS_BASE_PATH);
    }
    logger.info(`downloads dir: ${Vars.DOWNLOADS_BASE_PATH}`);
};

/**
 * Get the dir the metadata folder is located relative to the package folder.
 * 
 * We expect all the .tirex.json files to be located
 * in the METADATA_DIR folder if it exists, otherwise they will all be
 * in the root of the package directory.
 *
 * @param {string} packagePath - the package's path relative to the content folder.
 * @param callback(metadataDir)
 */
Vars.getMetadataDir = function (packagePath, callback) {
    const packageRoot = path.join(Vars.CONTENT_BASE_PATH, packagePath);
    const metadataPath = path.join(packageRoot, Vars.METADATA_DIR);
    fs.stat(metadataPath, function (err, stats) {
        callback(err ? '' : Vars.METADATA_DIR);
    });
};


Vars.restoreDefaultContentBasePath = function () {
    Vars.CONTENT_BASE_PATH = Vars.DEFAULT_CONTENT_BASE_PATH;
};

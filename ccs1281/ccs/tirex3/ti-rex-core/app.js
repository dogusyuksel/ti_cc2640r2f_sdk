/**
 * TIREX Server
 */

'use strict';
require('rootpath')();

// no tirex module that make use of logger here; move their require after logger is initialized
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const async = require('async');
const mkdirp = require('mkdirp'); process.umask(0); // needed so that we can set 0777 permissions, see https://github.com/substack/node-mkdirp/issues/38
const rimraf = require('rimraf');
const sortStable = require('stable'); // Array.sort is not 'stable' (i.e. equal comparisons may be re-ordered)
const seaport = require('seaport');
const child_process = require('child_process');
const semver = require('semver');
const urlParser = require('url');
const opn = require('opn');

const versioning = require('./lib/versioning');

let vars;
let multer; // needs vars.CONTENT_BASE_PATH
let request; // needs vars.HTTP_PROXY
let dbReady = false;

/**
 * Setup tirex
 *
 * @param {Object} args
 *  @param {Object} args.config
 *  @param {Object} args.dinfra
 *  @param {Object} args.dconfig
 * @param callback(err, rex)
 */
exports.setupTirex = function({config, dinfra, dconfig}, callback) {
    const configPassedIn = config;
    config = require('config/app_default.json');
    Object.keys(configPassedIn).forEach((key) => {
        config[key] = configPassedIn[key];
    });
    
    // process config properties
    for (var prop in config) {
        // note: below path disassemble & reassemble codes won't work for network address, ex: http://
        if (typeof config[prop] === 'string' && config[prop] !== '') {
            if(config[prop].indexOf('http') === 0) {
                // not a file path, use as-is
                continue;
            }
            var p = path.normalize(config[prop]).split(path.sep);
            // resolve '~' (linux and win) to user home dir
            if (p[0] === '~') {
                p[0] = os.homedir();
            } else if (p[0] === '') {
                p[0] = '/';
            }
            // resolve environment variables
            for (var i = 0; i < p.length; i++) {
                if (p[i][0] === '$') {
                    var evar = p[i].substr(1);
                    if (process.env[evar]) {
                        p[i] = process.env[evar];
                    }
                }
            }
            // re-assemble path
            config[prop] = path.join.apply(path, p);
        }
    }

    if (config.longStackTraces === 'true') {
        require('longjohn');
    }

    const logger = dinfra.logger('tirex');
    require('./lib/logger')(logger);
    if (config.useConsole === 'true') {
        dinfra.dlog.console(); // duplicate all messages to console; set already when using dcontrol run
    }
    if (config.logsDir && !fs.existsSync(config.logsDir)) {
        console.log('Creating logs dir: ' + config.logsDir);
        mkdirp.sync(config.logsDir, '0777'); // when we install as root, run as user
    }
    if (config.logsDir && !dconfig.logging) {
        dconfig.logging = {};
        dconfig.logging.indent = 4;
        dconfig.logging['loose'] = true;
        dconfig.logging['base-path'] = path.join(config.logsDir, 'tirex');
    }

    let rex = null;
    async.series([(callback) => {
        dinfra.configure(dconfig, callback);
    }, (callback) => {
        initApp({ myHttpPort: config.myHttpPort, config, dinfra, dconfig, logger }, (err, _rex) => {
            rex = _rex;
            callback(err);
        });
    }, (callback) => {
        // wait for DB to be ready before registering with dinfra
        logger.info('Waiting for DB ready...');
        const interval = setInterval(() => {
            if (dbReady) {
                logger.info('DB ready');
                clearInterval(interval);
                callback();
            }
        }, 500);
    }], (err) => {
        if (err) {
            // probably a more serious error at this init stage...
            console.error(err);
            logger.error(err);
            return callback(err);
        }
        if (config.myRole !== '') {
            const serviceName = dconfig.origin.serviceName; // always "<scope>/<service>"
            const serviceVersion = vars.VERSION_TIREX;
            const params = {
                type: 'application',
                protocol: 'http',
                port: parseInt(config.myHttpPort),
                role: config.myRole,
                host: dinfra.address
            };
            logger.info('Registering service with dinfra');
            dinfra.registerService(serviceName, serviceVersion, params);
        }
        callback(null, rex);
    });
};

function initApp({ config, dinfra, dconfig, myHttpPort, logger }, callback) {
    logger.setPriority(dinfra.dlog.PRIORITY.INFO);

    if (config.uncaught) {
        // uncaught exceptions are not reliably logged by dinfra: force it to all possible streams...
        // dinfra.uncaught(true);
        if (!config.logsDirUncaughtException) {
            config.logsDirUncaughtException = config.logsDir;
        }
        process.on('uncaughtException', (err) => {
            const date = new Date();
            const dateStr = date.toISOString().replace(/:/g, ''); // safe for file names
            // note: JSON.stringify not working well for error object since stack trace on single line
            let errMsg = 'TIREX UNCAUGHT EXCEPTION\n';
            errMsg += `date: ${date}\n`;
            errMsg += `tirexVersion: ${vars ? vars.VERSION_TIREX : '?'}\n`;
            errMsg += `nodeVersion: ${process.version}\n`;
            errMsg += `nodePlatform: ${process.platform}\n`;
            errMsg += `nodeArch: ${process.arch}\n`;
            if (config.mode === 'localserver') {
                errMsg += `tirexPluginVersion: ${config.tirexPluginVersion}\n`;
                errMsg += `ccsVersion: ${config.ccsVersion}\n`;
                errMsg += `myHttpPort: ${config.myHttpPort}\n`;
                errMsg += `ccs_port: ${config.ccs_port}\n`;
            }
            Object.getOwnPropertyNames(err).forEach((key) => {
                errMsg += `${key}: ${err[key]}\n`;
            });
            if (config.mode === 'localserver' && err.readwritecheck) {
                errMsg += `NOTE: Deleting DB folder due to possible corruption of DB files: ${config.dbPath}\n`;
            }
            console.error(errMsg);
            logger.error(errMsg); // not reliable ...
            if (config.logsDirUncaughtException) {
                fs.writeFileSync(path.join(config.logsDirUncaughtException, `tirex_uncaughtException_${dateStr}.log`),
                    errMsg);
            } else {
                console.error('config.logsDir not defined, not generating a tirex_uncaughtException log file');
            }
            if (config.mode === 'localserver' && err.readwritecheck) {
                try {
                    fs.removeSync(config.dbPath);
                } catch (err) {
                    console.err(err.message);
                }
            }
            process.exit(1);
        });
    }

    process.on('exit', function (code) {
        console.log('About to exit with code: ', code);
        logger.info('About to exit with code: ' + code);
    });

    // the remainder of the dinfra stuff is for cloud landscape deployment only
    //  - for desktop dconfig.paths should be set to {};
    //  - for standalone or debug remote server dconfig.paths can also be set to {} to be able to use abs. paths in the tirex config
    // prefix our paths based on dinfra
    if (config.mode === 'remoteserver') {
        if (dinfra.paths != null) {
            if (dinfra.paths.data != null) {
                config.contentPath = path.join(dinfra.paths.data, config.contentPath);
                config.dbPath = path.join(dinfra.paths.data, config.dbPath);
            }
            if (dinfra.paths.temp != null) {
                config.downloadsCache = path.join(dinfra.paths.temp, config.downloadsCache);
            }
        }
        config.ccsCloudUrl = dinfra.landscape;
        if (config.dcontrol != null) { // the section patched in by dcontrol in front ouf the tirex config properties
            config.seaportHostIP = config.dcontrol.legacy.seaport.address;
            config.seaportPort = config.dcontrol.legacy.seaport.port;
        }
    }

    // --install: create CCS desktop content discovery file and exit
    // REX-894 & 1026 : ~user/ti/CCSExternalReferences/TIREX_2 doesn't apply to multiple or switched user
    //     Temp workaround before better CCS interaction mechanism established: create the file if not exists
    if (config.mode === 'localserver') {
        // check folder
        var ccsExtRefDir = path.join(os.homedir(), 'ti/CCSExternalReferences');
        if (fs.existsSync(ccsExtRefDir) === false) {
            // create the folder
            mkdirp.sync(ccsExtRefDir, '0777');
        }
        var tirex_2_file = path.join(ccsExtRefDir, 'TIRex_2');
        // Check file existence and 'install'
        if ('install' in config || fs.existsSync(tirex_2_file) === false) {
            // Create/overwrite the file during install time or if it doesn't exist
            logger.info('INSTALL MODE: Creating ' + tirex_2_file);
            // prepare file contents
            var searchBase = 'searchpath=' + config.contentPath;
            var body =
                'ti-rex-content=' + config.contentPath + '\n' +
                'ti-products[TI_PRODUCTS_DIR]=' + config.contentPath + '\n' +
                // product specific folder if needed,
                //   ex: path.join(searchBase, 'mspware') + '\n' +
                path.join(searchBase) + '\n';   // root path, tirex-content

            // write
            fs.writeFileSync(tirex_2_file, body);
        }
        if ('install' in config) {
            // exit
            process.exit(0);
        }
    }

    var startUpMessage = '-----TI-REX started at ' + new Date().toString();
    logger.info(startUpMessage);
    console.log(startUpMessage);
    console.error(startUpMessage);

    var adminAuth = express.basicAuth('tirex', 'jurassic');

    // support for basic authentication (needed for external server)
    var development = process.env.NODE_ENV === 'development';
    if (development) {
        try {
            var userid = new RegExp(process.env.BASIC_AUTH_USERID.toLowerCase());
            var password = new RegExp(process.env.BASIC_AUTH_PASSWORD.toLowerCase());
            express.basicAuth(function (user, pass) {
                return userid.test(user.toLowerCase()) && password.test(pass.toLowerCase());
            }, 'Development authentication is required!');
        } catch (e) {
            logger.error('Invalid BasicAuth credential! ' +
                         'Please set \'BASIC_AUTH_USERID\' and \'BASIC_AUTH_PASSWORD\' environment variables and restart server.'
                        );
        }
    }

    var app = express();

    vars = require('lib/vars');
    vars(config);

    dinfra.registerStatusResponder('TIREX', vars.VERSION_TIREX)
        .withDefaultChecks().withExpressHandler(app, '/status/');
    dinfra.addShutdownJob(_shutdown);

    // --- TIREX modules ---
    // setup the common vars before loading all other modules; to access them in a module simply add the require call
    process.env.HTTP_PROXY = config.HTTP_PROXY ||
        config.http_proxy ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy;
    process.env.HTTPS_PROXY = config.HTTPS_PROXY ||
        config.https_proxy ||
        process.env.HTTPS_PROXY ||
        process.env.https_proxy;
    process.env.NO_PROXY = config.NO_PROXY ||
        config.no_proxy ||
        process.env.NO_PROXY ||
        process.env.no_proxy;

    // IMPORTANT: must delete the property if it's falsey
    if (!process.env.HTTP_PROXY || process.env.HTTP_PROXY === 'undefined') {
        delete process.env.HTTP_PROXY;
    }
    if (!process.env.HTTPS_PROXY || process.env.HTTPS_PROXY === 'undefined') {
        delete process.env.HTTPS_PROXY;
    }
    if (!process.env.NO_PROXY || process.env.NO_PROXY === 'undefined') {
        delete process.env.NO_PROXY;
    }

    logger.info(`process.env.HTTP_PROXY=${process.env.HTTP_PROXY}`);
    logger.info(`process.env.HTTPS_PROXY=${process.env.HTTPS_PROXY}`);
    logger.info(`process.env.NO_PROXY=${process.env.NO_PROXY}`);

    request = require('request').defaults(vars.REQUEST_DEFAULTS);
    multer = require('multer')({dest: vars.ZIPS_FOLDER});

    // now require all the other modules
    const state = require('lib/state');
    const rexdb = require('rexdb/lib/rexdb');
    const rexdb_split = require('rexdb/lib/rexdb-split');
    const query = require('lib/query');
    const download = require('lib/download');
    const localserver = require('lib/localserver');
    const lsBundles = require('lib/localserver/bundles');
    const jsonstream = require('lib/jsonstream');
    const refresh = require('lib/refresh');
    const logging = require('lib/logging');
    const pathHelpers = require('./lib/path-helpers');
    const ValueCache = require('lib/value-cache'); // used in WORKAROUND for long latency of api/packages request that is made with every api/resources request
    let requestCache;

    var serverState = state.ServerState;
    // include version in serverState
    serverState.version = require('package.json').version;
    logger.info('Version: ' + serverState.version);
    //
    serverState.updateServerStatus(state.ServerStatus.INITIALIZING, config);
    // include default package-offline path
    serverState.defaultContentPath = vars.MODE === 'localserver' ? vars.CONTENT_BASE_PATH : '';

    // delete DBs and/or content folders if requested
    if (config.deleteContent) {
        logger.info('DELETING content dir');
        rimraf.sync(config.contentPath);
    }
    if (config.deleteDb) {
        logger.info('DELETING db dir');
        rimraf.sync(config.dbPath);
    }

    // always delete download cache on start up: easiest way to keep download folder and download.db in sync
    logger.info('DELETING downloads dir');
    rimraf.sync(config.downloadsCache);
    logger.info('DELETING downloads.db');
    rimraf.sync(path.join(config.dbPath, 'downloads.db'));
    rimraf.sync(path.join(config.dbPath, 'downloads.db.index'));

    // create any missing dirs
    vars.createDirs();

    if (config.mode === 'localserver') {
        rexdb.setThrowConcurrentWriteException(true);
        rexdb_split.setThrowConcurrentWriteException(true);
    }

    dbReady = false;

    // check if there's backed up DB folder and restore it
    rexdb.restoreFromBackup(vars.DB_BASE_PATH);

    var dbDevices = new rexdb(path.join(vars.DB_BASE_PATH, 'devices.db'));
    var dbDevtools = new rexdb(path.join(vars.DB_BASE_PATH, 'devtools.db'));
    var dbOverviews = new rexdb(path.join(vars.DB_BASE_PATH, 'overviews.db'));
    var dbPureBundles = new rexdb(path.join(vars.DB_BASE_PATH, 'bundles.db'));
    var dbDownloads = new rexdb(path.join(vars.DB_BASE_PATH, 'downloads.db'));
    var dbResources; // loaded later as split db

    // [ TIREX_3.0, Metadata_2.1

    // ----- override save() to add some preparation for hidden H/W packages, for performance purposes
    //       new varaiables for dbOverviews: hwPackages, hwPackagesID, hwPackagesIDString
    dbOverviews.originalSave = dbOverviews.save;
    dbOverviews.save = function(callback) {
        // TODO ... developing ...
        this.originalSave( (err) => {
            this._cacheHWSWPacakges( function(err2) {
                // ignore error from this operation (err2)
                callback(err);
            });

        });
    };

    // ----- dbOverviews private utility function to remember hidden H/W package names
    dbOverviews._cacheHWSWPacakges = function(callback) {
        var queryHW = {resourceType: 'packageOverview', type: {$in:[vars.META_2_1_TOP_CATEGORY.devices.id, vars.META_2_1_TOP_CATEGORY.devtools.id]}};
        var querySW = {resourceType: 'packageOverview', type: {$in:[vars.META_2_1_TOP_CATEGORY.software.id]}};

        this.find(queryHW, (err, packages) => {   // use ES6 arrow operator
            let packagesHW = packages;
            // async operation
            if(!err) {
                this.find(querySW, (err, packages) => {
                    if(!err) {
                        let packagesSW = packages;
                        _update(this, packagesHW, packagesSW);
                        callback(err);
                    }
                    else {
                        callback(err);
                    }
                });
            }
            else {
                callback(err);
            }
        });
        function _update(db, packagesHW, packagesSW) { // private local
            delete db.hwPackages;
            delete db.hwPackagesID;
            delete db.hwPackagesIDString;
            if(packagesHW.length > 0) {
                db.hwPackages = packagesHW;
                db.hwPackagesID = [];
                packagesHW.forEach((e) => {
                    if (db.hwPackagesID.indexOf(e.packageUId) < 0) {
                        db.hwPackagesID.push(e.packageUId);
                    }
                });
                db.hwPackagesID.sort();
                db.hwPackagesIDString = db.hwPackagesID.join(vars.PACKAGE_LIST_DELIMITER);
            }
            delete db.swPackages;
            delete db.swPackagesID;
            delete db.swPackagesIDString;
            delete db.swLatestPackagesID;
            delete db.swLatestPackagesIDString;
            if(packagesSW.length > 0) {
                db.swPackages = packagesSW;
                db.swPackagesID = [];
                db.swPackagesIDString = '';    // pppp__vvvv::pppp__vvvv::pppp_vvvv
                db.swPackages.forEach ( (e) => {
                    if (!e.restrictions || e.restrictions.indexOf(vars.METADATA_PKG_IMPORT_ONLY) < 0) {
                        if (db.swPackagesID.indexOf(e.packageUId) < 0) {
                            db.swPackagesID.push(e.packageUId);
                        }
                    }
                });
                db.swPackagesID.sort();
                db.swPackagesIDString = db.swPackagesID.join(vars.PACKAGE_LIST_DELIMITER);

                let swLatestPackages = {};
                db.swPackagesID.forEach( (e) => {
                    let puid = e.split(vars.BUNDLE_ID_VERSION_DELIMITER);
                    swLatestPackages[puid[0]] = puid[1];  // already sorted, newer version comes later
                });
                db.swLatestPackagesID = [];
                Object.keys(swLatestPackages).forEach((e) => {
                    db.swLatestPackagesID.push(e + vars.BUNDLE_ID_VERSION_DELIMITER + swLatestPackages[e]);
                });
                db.swLatestPackagesIDString = db.swLatestPackagesID.join(vars.PACKAGE_LIST_DELIMITER);
            }
        }
    };

    // ----- dbOverviews utility function to append hidden H/W package string to query.package
    dbOverviews.appendPackagesString = function(pkgString) {
        if(this.hwPackagesIDString == null) {
            return pkgString;
        }
        if(pkgString == null) {
            pkgString = '';
        }
        if (pkgString.length !== 0) {
            pkgString += vars.PACKAGE_LIST_DELIMITER;
        }
        pkgString += this.hwPackagesIDString;
        return pkgString;
    };
    // ----- dbOverviews utility function to apply filter by restriction to the package string
    dbOverviews.applyPackageRestrictions = function(pkgString, restriction) {
        // split
        let inPkgUIds = pkgString.split(vars.PACKAGE_LIST_DELIMITER);
        // filter
        let outPkgUIds = inPkgUIds.filter( (pid) => {
            if (this.swPackages) {
                for (let j = 0; j < this.swPackages.length; j++) {
                    let swPackage = this.swPackages[j];
                    if (swPackage.packageUId === pid) {
                        if (swPackage.restrictions && swPackage.restrictions.indexOf(restriction) >= 0) {
                            return false;
                        }
                        break;
                    }
                }
            }
            return true;
        });
        // reconstruct
        let outString = '';
        for( let j=0; j<outPkgUIds.length; j++) {
            if (j !== 0) {
                outString += vars.PACKAGE_LIST_DELIMITER;
            }
            outString += outPkgUIds[j];
        }
        return outString;
    };
    // ----- dbOverviews utility function to find package by UID "synchronously", intended for frequent short operations
    dbOverviews._findSWPackageByUid = function(pid) {
        if (this.swPackages) {
            for (let j = 0; j < this.swPackages.length; j++) {
                let swPackage = this.swPackages[j];
                if (swPackage.packageUId === pid) {
                    return swPackage;
                }
            }
        }
        return null;
    };

    dbOverviews._cacheHWSWPacakges( (err) => {});  // call once at startup

    function checkClientVersion(req) {
        if (config.mode === 'remoteserver' && req.headers['user-agent'] != null) {
            // extract version from user-agent string which has this format:
            // 'TirexServer/3.2.11-alpha+001<space>....'  --> version = '3.2.11-alpha+001'
            const regex = /TirexServer\/(\S*)/; // TirexServer/<anything up to next space>
            const regexMatches = regex.exec(req.headers['user-agent']);
            if (regexMatches && regexMatches.length >= 2) {
                const clientSemver = regexMatches[1] ? semver.valid(regexMatches[1]) : null;
                delete serverState.rejected;
                if (clientSemver) {
                    if (semver.major(clientSemver) !== semver.major(serverState.version)) {
                        serverState.rejected = 'Incompatible version. Please upgrade.';
                    } else if (semver.lt(clientSemver, '3.7.0')) {
                        serverState.rejected =
                            'For CCS 9.0: Go to CCS Help Menu -> Check for Updates and update to CCS9.0.1.' +
                            '................................... ' +
                            'For CCS 7.x and 8.x: See update instructions here http://software-dl.ti.com/ccs/esd/documents/ccs_tirex_update.html';
                        serverState.updateUrl = 'http://software-dl.ti.com/ccs/esd/documents/ccs_tirex_update.html';
                    }
                }
            }
        }
    }

    var desktopServer;

    if (config.mode === 'remoteserver') {
        dbResources = new rexdb_split(path.join(vars.DB_BASE_PATH, 'resources.db'));
        dbResources.useAll(function () {
            dbOverviews._cacheHWSWPacakges(function () {
                preCacheTopNodes(function () {
                    dbReady = true;
                    logger.info('Set dbReady=true');
                });
            });
        });
    } else if (config.mode === 'localserver') {
        dbResources = new rexdb_split(path.join(vars.DB_BASE_PATH, 'resources.db'));
        dbResources.useHidden(dbOverviews.hwPackagesID);
        async.series([
            (callback) => {
                dbResources.use([], callback);
            },
            (callback) => {
                dbOverviews._cacheHWSWPacakges(callback);
            },
            (callback) => {
                desktopServer = new localserver();
                desktopServer.init(vars, dbs, myHttpPort, function (connected) {
                    if (connected === true) {
                        serverState.updateConnectionState(state.ConnectionState.CONNECTED, config);
                        serverState.useRemoteContent = true;
                    } else {
                        // not connected to remote server
                        serverState.updateConnectionState(state.ConnectionState.OFFLINE, config);
                        serverState.useRemoteContent = false;
                    }
                    callback();
                });
            }],
            (err) => {
                if (err) {
                    logger.error(JSON.stringify(err));
                }
                dbReady = true;
                logger.info('Set dbReady=true');
            }
        );
    }

    function preCacheTopNodes(callback) {
        // Pre-cache top nodes by mimiking the high runner requests from client
        //   - making the package list empty "?package=" will force picking the latest packages.
        const _req = {
            headers: {},
            route: { method: 'get', path: '/api/resources' },
            query: {}
        };
        async.series([
            (callback) => {
                // pre-cache root
                _req.url = '/api/resources?package=';
                _doQuery(_req, null, callback);
            },
            (callback) => {
                // pre-cache "Software"
                delete _req.query.package;
                _req.query.path = vars.META_2_1_TOP_CATEGORY.software.text;
                _req.url = '/api/resources?path=' + vars.META_2_1_TOP_CATEGORY.software.text + '&package=';
                _doQuery(_req, null, callback);
            },
            (callback) => {
                // pre-cache "Devices"
                delete _req.query.package;
                _req.query.path = vars.META_2_1_TOP_CATEGORY.devices.text;
                _req.url = '/api/resources?path=' + vars.META_2_1_TOP_CATEGORY.devices.text + '&package=';
                _doQuery(_req, null, callback);
            },
            (callback) => {
                // pre-cache "Development Tools"
                delete _req.query.package;
                _req.query.path = vars.META_2_1_TOP_CATEGORY.devtools.text;
                _req.url = '/api/resources?path=' + vars.META_2_1_TOP_CATEGORY.devtools.text + '&package=';
                _doQuery(_req, null, callback);
            },
        ], callback);
    }

    var dbs = {
        dbDevices: dbDevices,
        dbDevtools: dbDevtools,
        dbResources: dbResources,
        dbOverviews: dbOverviews,
        dbPureBundles: dbPureBundles,
        dbDownloads: dbDownloads
    };

    const rex = require('lib/rex')({config, dbs, logger, multer});

    app.set('port', myHttpPort);
    app.enable('trust proxy'); // tell express we're sitting behind the seaport proxy (needed by analytics to get clients' IP addresses)
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.favicon());
    //app.use(express.logger('dev'));
    app.use(express.json({limit: '10mb'}));
    app.use(express.urlencoded({limit: '10mb'}));
    app.use(express.methodOverride());
    app.use(block());
    const whitelist = [
        '/api/add-package/',
        '/api/delete-package/',
        '/api/maintenance-mode/',
        '/api/resume-service/',
        
        // For backwards compatibility
        '/api/stage/',
        '/api/stage-upload/',
    ];
    function block() {
        return function(req, res, next) {
            if (whitelist.indexOf(req.url) > -1 || whitelist.indexOf(req.url + '/') > -1) {
                return next();
            }
            if (dbReady === false) {
                rex.log.debugLogger.info(`block(): dbReady=false: sending 503 for url ${req.url}`);
                const msg = 'TIREX is temporarily unavailable while database initialization is in progress. Please try again later.';
                rex.log.userLogger.error(msg);
                res.send(503, msg);
            }
            else if (rex.refreshManager.isRefreshing()) {
                rex.log.debugLogger.info(`block(): active refresh: sending 503 for url ${req.url}`);
                const msg = 'TIREX is temporarily unavailable while a database refresh is in progress. Please try again later.';
                rex.log.userLogger.error(msg);
                res.send(503, msg);
            } else {
                next();
            }
        };
    }

    app.use(app.router);

    app.use(express.static(path.join(vars.projectRoot, 'public')));
    app.use('/scripts', express.static(path.join(
        // should move everything to node_modules
        vars.projectRoot, '3rd_party', 'shared', 'front_end_modules') +
                                       path.sep));
    app.use('/scripts2', express.static(
        path.join(vars.projectRoot, 'node_modules') + path.sep));

    app.use('/zips', express.static(vars.ZIPS_FOLDER + path.sep));

    // development only
    if ('development' === app.get('env')) {
        app.use(express.errorHandler());
    }

    function testRemoteServer(callback) {
        if (config.mode !== 'localserver') {
            serverState.useRemoteContent = false; // disable remote access
            callback(serverState.connectionState);
        }
        else {
            desktopServer.testRemoteConnection(function (connected) {
                if (connected) {
                    serverState.updateConnectionState(state.ConnectionState.CONNECTED, config);
                } else {
                    // not connected to remote server
                    serverState.updateConnectionState(state.ConnectionState.OFFLINE, config);
                    serverState.useRemoteContent = false; // disable remote access
                }
                callback(serverState.connectionState);
            });
        }
    }

    // API : /content static file serving; if file doesn't exist locally, pipe it from remoteserver
    app.use('/content', function (req, res) {
        if (req.url == null || req.url === '/') {
            res.send(404);
            return;
        }
        // [ REX-1070: just keep the document path, not the query
        const urlParts = urlParser.parse(req.url, true);
        if (urlParts.search && urlParts.search !== '') {
            req.url = urlParts.pathname;
        }
        // ]
        let filepath = vars.CONTENT_BASE_PATH + decodeURIComponent(req.url);

        if (config.mode === 'localserver') {
            filepath = desktopServer.translateContentPath(req.url);
        }

        fs.exists(filepath, function (exists) {
            if (exists) {
                if (req.headers.origin != null) {
                    // echos the origin domain which effectively allows ALL domains access
                    // needed because request may come from a tirex server on a user's desktop (see below)
                    res.set({'Access-Control-Allow-Origin': req.headers.origin});
                }
                if (filepath.indexOf('.svg') > -1) {
                    res.setHeader('content-type', 'image/svg+xml');
                }
                fs.createReadStream(filepath)
                    .on('error', handleStreamError)
                    .pipe(res)
                    .on('error', handleStreamError);
            } else if (config.mode === 'localserver' && serverState.useRemoteContent === true) {
                if (filepath.indexOf('.svg') > -1) {
                    res.setHeader('content-type', 'image/svg+xml');
                }
                request.get({
                    url: vars.REMOTESERVER_BASEURL + req.originalUrl
                })
                    .on('error', handleStreamError)
                    .pipe(res)
                    .on('error', handleStreamError);
            } else {
                res.send(404);
            }
        });

        function handleStreamError(err) {
            logger.error('/content stream error:' + JSON.stringify(err));
            if (!res.headersSent) {
                res.send(404); // pipe not closed automatically on error
            }
        }
    });

    // API : /components static file forwarding from cloud web components server
    app.use('/components', function (req, res) {
        let alreadyResSend = false;
        if (config.mode === 'remoteserver' ||  // will only happen if tirex runs as a standalone remote server
            (config.mode === 'localserver' && serverState.useRemoteContent === true) &&
            vars.WEBCOMPONENTSSERVER_BASEURL != null) {
            // [ REX-843 - temporary block flash tools until supported
            if(config.mode === 'localserver' && (req.url.indexOf('ti-widget-flashtool') >= 0 || req.url.indexOf('ti-core-backplane') >= 0)) {
                res.send(404);
                return;
            }
            // ]
            request.get(vars.WEBCOMPONENTSSERVER_BASEURL + req.url)
                .on('error', handleStreamError)
                .pipe(res)
                .on('error', handleStreamError);
        } else {
            res.send(404);
        }

        function handleStreamError(err) {
            logger.error('/content stream error:' + JSON.stringify(err));
            if (!alreadyResSend) {
                alreadyResSend = true;
                res.send(404); // pipe not closed automatically on error
            }
        }
    });

    app.get('/loading', function(req, res) {
	res.redirect('/loading.html');
    });

    app.get('/uninstall', function(req, res) {
	res.redirect('/uninstall.html');
    })

    if (vars.HANDOFF_SERVER === 'true') {
        require('routes/handoff')(app);
    }

    /**
     * API : GET => get serverstate
     *
     */
    app.get('/api/serverstate', function (req, res) {
        var serverstate = serverState;
        serverstate.serverMode = config.mode;
        // TIREX_3.0 - pre-process checking
        checkClientVersion(req);
        res.send(serverstate);
    });

    /**
     * API : POST => set serverstate
     *
     * Update server states that are not read-only
     *
     */
    app.post('/api/serverstate', function (req, res) {
        if (config.mode !== 'localserver' || req.body.useRemoteContent == null) {
            return res.end();
        }
        console.log('setting to ' , req.body.useRemoteContent);
        // test the connection before switching
        testRemoteServer(function (connectionState) {
            if (connectionState === state.ConnectionState.CONNECTED) {
                // ok
                serverState.useRemoteContent = req.body.useRemoteContent;
                serverState.updateConnectionState(
                    serverState.useRemoteContent ?
                        state.ConnectionState.CONNECTED :
                        state.ConnectionState.OFFLINE,
                    config);
            }
            else {
                // failed, use remote content not allowed
                serverState.useRemoteContent = false;
            }
            res.end();
        });
    });

    /**
     * API : GET => get resources
     *
     *  query parameters:
     *      device: a device name
     *      devtool: a devtool name
     *      path: a tree path (based on results of previous calls)
     *      download: if 'true' this is a download request (see response below)
     *      makeoffline: if 'true' this is a makeoffline request (see response below)
     *      progressId: generated by the client if download=true or makeoffline=true
     *      dumpImportables: if 'true' send json with all importable projects and source files (for testing)
     *      language
     *      ide
     *      tags
     *
     *  response:
     *      browsing mode: JSON with folders and resources that are directly (i.e. no subfolder recursion) in the specified path
     *      download mode: A URL to api/download where the client can pick up the zip archive: {link: 'api/download/...'},
     *      makeoffline mode: JSON with unprocessed resource records from the DB for all hits: {resources: [...], overviews: [...]}
     */
    const pendingResourcesReqs = {};
    app.get('/api/resources', function (req, res) {
        if (!pendingResourcesReqs[req.url]) {
            // first request
            pendingResourcesReqs[req.url] = [];
            pendingResourcesReqs[req.url].push(res);
        } else {
            // repeated request
            pendingResourcesReqs[req.url].push(res);
            return;
        }

        if (req.query.download === 'true') {
            // 'Acknowledge' to browser and continue; browser will poll via api/downloadprogress to get progress and eventially the result when done
            res.send(202);
            download.downloadAssets(dbResources, dbOverviews, dbPureBundles, dbDownloads, req.query.progressId, req, res);
        } else if (req.query.makeoffline === 'true') {
            if (config.mode === 'remoteserver') {
                // sends resource and overview records; client is then expected to send back a list of files needed for download using api/archivefiles
                query.makeofflineOrDownloadQuery(dbResources, dbOverviews, dbPureBundles, req.query, function (err, result) {
                    sendStream(err, result); // stream possibly very large arrays to reduce memory pressure caused by stringify entire data at once
                });
            } else if (config.mode === 'localserver') {
                // partial makeoffline only, which is disabled
                desktopServer.makeofflineResources(req, res);
            }
        } else if (req.query.removeoffline === 'true') {
            if (config.mode === 'localserver') {
                desktopServer.removeofflineResources(req, res);
            }
        } else if (req.query.dumpImportables === 'true') {
            query.dumpImportablesForTesting(dbDevtools, dbResources, req.query, function(err, result) {
                sendStream(err, {
                    result: result
                });
            });
        } else {
            _doQuery(req, res, (err, result) => {
                send(err, result);
            });
        }

        function send(errMsg, result) {
            for (const res of pendingResourcesReqs[req.url]) {
                if (!errMsg) {
                    res.send(result);
                } else {
                    logger.error(req.originalUrl + ': ' + errMsg);
                    res.send(500, errMsg);
                }
            }
            delete pendingResourcesReqs[req.url];
        }
        function sendStream(errMsg, result) {
            for (const res of pendingResourcesReqs[req.url]) {
                if (!errMsg) {
                    var js = new jsonstream(result);
                    js.pipe(res);
                } else {
                    logger.error(req.originalUrl + ': ' + errMsg);
                    res.send(500, errMsg);
                }
            }
            delete pendingResourcesReqs[req.url];
        }
    });

    // resources query monitor
    function resourcesQueryMonitor() {
        this.seqNo = 0;
        this.active = new Map();
        this.threshPerQuestRespondTime = 5000;  // thresholds (ms) used for considering long response

        // start a resource query request
        this.start = function(req) {
            let time = Date.now();
            req._tirexReqSeqNo = this.seqNo;
            this.seqNo = (this.seqNo+1) & 0xFFFFFFFF;
            if(this.active.size === 0) {
                // first one, start serving
                this.activeStart = time;
            }
            // assign a seqNo and log the start time
            this.active.set(req._tirexReqSeqNo, {req: req, start: time});
            // TODO: if needed, can log the number of outstanding transactions
        };
        // end a resource query request
        this.end = function(req) {
            let time = Date.now();
            let elm = this.active.get(req._tirexReqSeqNo);
            this.active.delete(req._tirexReqSeqNo);
            delete req._tirexReqSeqNo;
            let elmDuration = time - elm.start;
            // log long response
            if (this.threshPerQuestRespondTime > 0) {
                if (elmDuration >= this.threshPerQuestRespondTime) {
                    let msg = {
                        message: 'Long query response',
                        timespan: elmDuration,
                        outstandingRequests: this.active.size,
                        url: req.url
                    };
                    logger.info(msg);
                }
            }
            if (this.active.size === 0) {
                // last one being served
                this.activeEnd = time;
                let activeDuration = this.activeEnd - this.activeStart;
                // TODO: if needed, can log the time spent for all parallel transactions
            }
        }
    }
    var resMon = new resourcesQueryMonitor();

    function _doQuery(req, res, callback) {
        _forceAllSWPackages(req, (packagesReq) => { // TODO WORKAROUND for packages deselected in package picker
            req.query.package = packagesReq;
            if (dbOverviews.appendPackagesString) {
                req.query.package = dbOverviews.appendPackagesString(req.query.package);
            }
            if (config.mode === 'remoteserver' && isUseragentTirex(req) === false) {
                // Cloud client, apply restriction
                if (dbOverviews.applyPackageRestrictions) {
                    req.query.package = dbOverviews.applyPackageRestrictions(req.query.package, vars.METADATA_PKG_DOWNLOAD_ONLY);
                }
            }

            // just regular browsing
            const usePackages = _sortQueryPackage(req.query.package);
            req.query.package = usePackages;
            resMon.start(req);
            _findPackageInPath(req, function(_pkgInPath) {
                // optimization: package(s) specific query
                if (Object.keys(_pkgInPath).length) {  // not empty
                    if (_pkgInPath.packageType === vars.META_2_1_TOP_CATEGORY.software) {
                        // single SW package, remove all other packages from the list
                        if (_pkgInPath.packageObj) {
                            const _pids = [];
                            _pkgInPath.packageObj.forEach((pkg) => {
                                _pids.push(pkg.packageUId);
                            });
                            req.query.package = _pids.join(vars.BUNDLE_LIST_DELIMITER);
                        }
                        else {
                            // TODO: can further optimize for "Software" root, remove H/W packages if possible
                        }
                    }
                    else if (_pkgInPath.packageType === vars.META_2_1_TOP_CATEGORY.devices
                             || _pkgInPath.packageType === vars.META_2_1_TOP_CATEGORY.devtools) {
                        // HW packages, remove all software packages
                        if (dbOverviews.hwPackagesIDString) {
                            req.query.package = dbOverviews.hwPackagesIDString ? dbOverviews.hwPackagesIDString : '';
                        }
                        else {
                            req.query.package = '';
                        }
                    }
                }

                if (config.mode === 'remoteserver') {
                    query.doQuery(dbResources, dbOverviews, dbDevices, dbDevtools, dbDownloads, req, res, function (err, result) {
                        resMon.end(req);
                        callback(err, result);
                    });
                } else if (config.mode === 'localserver') {
                    if (!serverState.dbUseCalled) {
                        // WORKAROUND for front-end calling api/use too late
                        serverState.dbUseCalled = true;
                        dbResources.use(usePackages.split(vars.BUNDLE_LIST_DELIMITER), function () {
                            desktopServer.doQuery(req, res, function (err, result) {
                                resMon.end(req);
                                callback(err, result);
                            });
                        });
                    } else {
                        desktopServer.doQuery(req, res, function (err, result) {
                            resMon.end(req);
                            callback(err, result);
                        });
                    }
                }
            });
        });

        // inspect the path and find out packages applies to the query
        function _findPackageInPath(req, callback) {
            const result = {};
            if (req.query.path && req.query.path.length !== 0 && req.query.package) {
                // by path & picked packages
                const pathCats = req.query.path.split('/');
                if (pathCats[0] === vars.META_2_1_TOP_CATEGORY.devices.text
                    || pathCats[0] === vars.META_2_1_TOP_CATEGORY.devtools.text) {
                    // HW top nodes
                    result.packageType = vars.META_2_1_TOP_CATEGORY.getByText(pathCats[0]);
                    return setImmediate(callback, result);
                }

                if (pathCats[0] !== vars.META_2_1_TOP_CATEGORY.software.text) {
                    // not HW or SW, do nothing
                    return setImmediate(callback, result);
                }

                // SW path
                result.packageType = vars.META_2_1_TOP_CATEGORY.software;
                const packagesToUse = req.query.package.split(vars.BUNDLE_LIST_DELIMITER);
                dbs.dbOverviews.find({ resourceType: 'packageOverview' }, function (err, _packages) {
                    for (let np = 0; np < _packages.length; np++) {
                        const pkg = _packages[np];
                        if (packagesToUse.indexOf(pkg.packageUId) === -1) {
                            // not in the package picker list
                            continue;
                        }
                        // find all matches
                        let matched = true;
                        for (let nc = 1; nc < pathCats.length; nc++) {
                            if (pkg.rootCategory[nc] !== pathCats[nc]) {
                                matched = false;
                                break;
                            }
                        }
                        if (!matched) {
                            continue;
                        }
                        if (!result.packageObj) {
                            // first found
                            result.packageObj = [];
                        }
                        result.packageObj.push(pkg);
                    }
                    callback(result);
                });
            } else {
                return setImmediate(callback, result);
            }
        }
    }

    function _sortQueryPackage(pkgs) {
        const pkgList = pkgs.split(vars.BUNDLE_LIST_DELIMITER);
        pkgList.sort();
        return pkgList.join(vars.BUNDLE_LIST_DELIMITER);
    }

    // WORKAROUND for packages deselected in package picker
    function _forceAllSWPackages(req, callback) {
        getPackages(req, (packagesInDb) => {
            let packageUIds = (req.query.package && req.query.package !== '') ?
                req.query.package.split(vars.PACKAGE_LIST_DELIMITER) : [];
            packageUIds = packageUIds.concat(_getMissingPackages(packageUIds, packagesInDb));
            packageUIds = packageUIds.concat(_getSuplementalPackages(packageUIds, packagesInDb));
            packageUIds = packageUIds.concat(_getOfflineSuplementalPackagesWithoutParentPackage(packageUIds, packagesInDb));
            const finalPackages = packageUIds.join(vars.PACKAGE_LIST_DELIMITER);
            callback(finalPackages);
        });
    }

    /**
     * Return a list of the latest valid versions of the packages supplementing the requested packages
     *
     * @param {Array.String} packageUIds - The requested packages
     * @param {Array.Object} packagesInDb - Latest version appears first
     *
     * @returns {Array.String} supplementalPackages - The latest valid versions of the supplemental packages
     */
    function _getSuplementalPackages(packageUIds, packagesInDb) {
        // remove all supplemental packages from the list
        const supplementalPackages = packagesInDb.filter(pkg => pkg.supplements);
        const requestedPackages = packageUIds
              .filter((packageUId) => {
                  const isSuplemental = supplementalPackages.find((supplementalPackage) => {
                      const suppStr = supplementalPackage.id + vars.PACKAGE_ID_VERSION_DELIMITER;
                      return packageUId.indexOf(suppStr) === 0;
                  });
                  return !isSuplemental;
              })
              .map((packageUId) => {
                  return packagesInDb.find(dbPkg => packageUId === dbPkg.packageUId);
              })
              .filter(pkg => pkg);

        // determine the relevant supplemental packages
        // Note: go in reverse order so we get the newest version first
        const relevantSupplementalPackages = [];
        supplementalPackages.slice().reverse().map((supplementalPackage) => {
            const parentId = supplementalPackage.supplements.packageId;
            const parentVersion = supplementalPackage.supplements.versionRange;

            const isRelevant = requestedPackages.find((requestedPackage) => {
                return requestedPackage.id === parentId &&
                    versioning.satisfies(requestedPackage.version, parentVersion);
            });
            if (isRelevant) {
                // Only need latest relevant since we only support supplementing one package at a time.
                // Note: packagesInDB is sorted by increasing package version so we will always
                // be the latest if no other exist (since we traverse the list in reverse)
                const isLatest = !relevantSupplementalPackages.find((pkg) => {
                    return pkg.id === supplementalPackage.id;
                });
                if (isLatest) {
                    relevantSupplementalPackages.push(supplementalPackage);
                }
            }
        });
        return relevantSupplementalPackages.map(({packageUId}) => {
            return packageUId;
        });
    }

    /**
     * Return a list of the latest version of the missing packages in the requested packages
     *
     * @param {Array.String} packageUIdsRequested - The requested packages
     * @param {Array.Object} packagesInDb - all package records in the DB
     *
     * @returns {Array.String} missingPackagesLatest - The latest version of the missing packages
     */
    function _getMissingPackages(packageUIdsRequested, packageRecords) {
        const missingPackagesLatest = {};

        const packageIdsRequested = packageUIdsRequested.map(uid =>
                                                             uid.split(vars.PACKAGE_ID_VERSION_DELIMITER)[0]);

        for (const packageRecord of packageRecords) {
            if (packageRecord.supplements) {
                continue;
            }
            if (packageIdsRequested.indexOf(packageRecord.id) === -1) {
                const missingLatestVersion = missingPackagesLatest[packageRecord.id];
                if (!missingLatestVersion) {
                    missingPackagesLatest[packageRecord.id] = packageRecord.version;
                } else {
                    if (versioning.compare(packageRecord.version, missingLatestVersion) === 1) {
                        missingPackagesLatest[packageRecord.id] = packageRecord.version;
                    }
                }
            }
        }

        const missingPackagesLatestArr = [];
        for (const id of Object.keys(missingPackagesLatest)) {
            missingPackagesLatestArr.push(id + vars.PACKAGE_ID_VERSION_DELIMITER +
                                          missingPackagesLatest[id]);
        }
        return missingPackagesLatestArr;
    }

    /**
     * Return a list of the offline supplemental packages that don't have the parent package also offline.
     *
     * @param {Array.String} packageUIds - The requested packages
     * @param {Array.Object} packagesInDb - Latest version appears first
     *
     * @returns {Array.String} missingPackagesLatest - The latest version of the missing packages
     */
    function _getOfflineSuplementalPackagesWithoutParentPackage(packageUIds, packagesInDb) {
        return packagesInDb
            .filter((pkg) => {
                if (pkg.supplements &&
                    (pkg.local && pkg.local !== 'false' && serverState.connectionState === state.ConnectionState.OFFLINE)) {
                    const parentId = pkg.supplements.packageId;
                    const isParentOffline = packagesInDb.find(({id}) => {
                        return id === parentId;
                    })
                    return !isParentOffline;
                }
                else {
                    return false;
                }
            })
            .map((pkg) => {
                return pkg.packageUId;
            });
    }

    /**
     * API : GET => get a bundle
     *
     *  query:
     *      vid: <id>[__version]  - version is optional
     *      download: if 'true' this is a download request (see response below)
     *      makeoffline: if 'true' this is a makeoffline request (see response below)
     *      progressId: generated by the client if download=true
     *
     *  response:
     *      regular mode: just the bundle record itself
     *      download mode: A URL to api/download where the client can pick up the zip archive: {link: 'api/download/...'},
     *      makeoffline mode: JSON with unprocessed resource records from the DB for all hits: {resources: [...], overviews: [...]}
     */
    app.get('/api/bundle', function (req, res) {
        if (!req.query.vid) {
            const errMsg = 'vid query parameter missing';
            logger.error(req.originalUrl + ':' + errMsg);
            res.send(500, errMsg);
            return;
        }
        var id = req.query.vid.split(vars.BUNDLE_ID_VERSION_DELIMITER)[0];
        var version = req.query.vid.split(vars.BUNDLE_ID_VERSION_DELIMITER)[1]; // version may be null
        query.findBundle({id, version, dbOverviews, dbPureBundles, dbResources}, function (err, bundle) {
            if (err || bundle == null) {
                var errMsg = 'Bundle ' + req.query.vid + ' not found:' + JSON.stringify(err);
                logger.error(req.originalUrl + ':' + errMsg);
                res.send(500, errMsg);
                return;
            }
            if (req.query.download === 'true') {
                // 'Acknowledge' to browser and continue; browser will poll via api/downloadprogress to get progress and eventually the result when done
                res.send(202);
                // TODO: creating a file list from resources is not done at the moment:
                // download.downloadAssets(dbResources, dbOverviews, dbDownloads, req.query.progressId, req, res);
                download.archiveFiles(bundle.includedFilesForDownload, dbDownloads, req.query.progressId, req.query.os, true);
            } else if (req.query.makeoffline === 'true') {
                if (config.mode === 'remoteserver') {
                    // 'Acknowledge' to browser and continue; browser will poll via api/downloadprogress to get progress and eventually the result when done
                    res.send(202);
                    download.archiveMetadata(bundle.includedResources, dbResources, dbOverviews, dbPureBundles, dbDownloads, req.query.progressId);
                } else {
                    res.send(500, 'API supported by remoteserver only. Use /api/bundles instead.');
                }
            } else {
                // regular mode: just the bundle record itself
                send(null, bundle);
            }
        });

        function send(errMsg, result) {
            if (!errMsg) {
                res.send(result);
            } else {
                sendError(errMsg);
            }
        }
        function sendStream(errMsg, result) {
            if (!errMsg) {
                var js = new jsonstream(result);
                js.pipe(res);
            } else {
                sendError(errMsg);
            }
        }
        function sendError(errMsg) {
            logger.error(req.originalUrl + ':' + errMsg);
            res.send(500, errMsg);
        }
    });

    /**
     * LOCALSERVER ONLY
     *
     * API : GET => get multiple bundles
     *
     *  query:
     *      vids: <id1>[__version1]::<id2>[__version2]::...
     *      progressId: generated by the client
     *
     *  response:
     */
    app.get('/api/bundles', function (req, res) {
        if (config.mode === 'localserver') {
            // 'Acknowledge' to browser and continue; browser will poll via api/downloadprogress to get progress and eventually the result when done
            res.send(202);
            // REX-921: support user picked folder
            lsBundles.makeOfflineBundles(req.query.vids, req.query.progressId, dbDevices, dbDevtools, dbOverviews, dbResources, dbPureBundles, req.query.location);
            if (req.query.location) {
                desktopServer.packageImporter.addSearchPath(req.query.location, false);
            }
        } else {
            res.send(500, 'API supported by localserver only. Use /api/bundle instead.');
        }
    });

    /**
     * LOCALSERVER ONLY
     *
     * API : GET => choose package DBs to load into memory
     *
     *  query:
     *      package: <id1>[__version1]::<id2>[__version2]::...
     *
     *  response: -
     */
    app.get('/api/use', function (req, res) {
        if (config.mode === 'localserver') {
            logger.info('/api/use called');
            _forceAllSWPackages(req, (packagesReq) => { // TODO WORKAROUND for packages deselected in package picker
                let usePackages;
                if (dbOverviews.appendPackagesString) {
                    usePackages = dbOverviews.appendPackagesString(packagesReq);
                }
                usePackages = _sortQueryPackage(usePackages);
                dbResources.use(usePackages.split(vars.BUNDLE_LIST_DELIMITER), function () {
                    res.send(200);
                });
            });
        } else {
            res.send(500, 'API supported by localserver only.');
        }
    });

    /**
     * Req body is array of file paths to be zipped up.
     * Intended for Make Available Offline. Uses the same async queue as the regular download
     *
     *  body:
     *      array of file paths
     *  query parameters:
     *      progressId: generated by the client
     *
     *  response:
     *      A URL to api/download where the client can pick up the zip archive: {link: 'api/download/...'},
     */
    app.post('/api/archivefiles', function (req, res) {
        // 'Acknowledge' to client and continue; browser will poll via api/downloadprogress to get progress and eventially the result when done
        res.send(202);
        download.archiveFiles(req.body, dbDownloads, req.query.progressId, vars.HOST, false);
    });

    /**
     * API : GET => download
     *  The URL for this API is generated by the server and sent to client when the download file is ready. The client then
     *  has a chance to cancel the download. If not cancelled, client calls this API which initiates the file download.
     *
     *  query parameters:
     *      source
     *      file
     *      clientfile
     *
     */
    app.get('/api/download', function (req, res) {
        var file;
        if (req.query.source === 'cache') { // zip file (always cached)
            file = path.join(vars.DOWNLOADS_BASE_PATH, req.query.file);
        } else if (req.query.source === 'content') { // single file, unzipped
            file = path.join(vars.CONTENT_BASE_PATH, req.query.file);
        } else if (req.query.source === 'local') { // e.g. NothingToDownload.txt
            file = req.query.file;
        } else {
            res.send(500, 'Illegal source: ' + req.query.source);
            return;
        }
        res.download(file, req.query.clientfile, function (err) {
            if (err) {
                // handle error, keep in mind the response may be partially-sent so check res.headersSent
                logger.error('Error downloading: ' + JSON.stringify(err));
                res.send(500, 'Error downloading: ' + JSON.stringify(err));
            }
        });
    });

    /**
     * API: GET => downloadprogress (returns progress in percent)
     *
     * TODO: use ProgressInfo from progress.js as /api/bundlesprogress
     *
     * params:
     *  id: the progress id (that was initially provided by the client as part of the download resource query)
     */
    app.get('/api/downloadprogress/:id', function (req, res) {
        var total = 0;
        var worked = 0;

        // [ Bruce
        if (config.mode === 'localserver') {
            var _offlineProgressInfo = desktopServer.getOfflineProgressInfo(req.params.id);
            if (_offlineProgressInfo) {
                // doing makeOffline
                desktopServer.getOfflineProgress(_offlineProgressInfo, function (result) {
                    if (result.progress === null || result.task === '') {
                        // done
                        if(_offlineProgressInfo.error != null) {
                            res.send(200, {result: _offlineProgressInfo.result, done: true, error: _offlineProgressInfo.error});
                        }
                        else {
                            res.send(200, {result: _offlineProgressInfo.result, done: true});
                        }
                    }
                    else {
                        res.send(206, {progress: result.progress, message: result.task});
                    }
                });
                return;
            }
        }
        // ]

        var downloadQueueProgress_clone = download.downloadQueueProgress.concat(); // make shallow copy since array is modified in the result callback (don't make deep copy otherwise indexOf() will fail...)
        async.detectSeries(downloadQueueProgress_clone, (progressInfo, callback) => {
            // estimate progress by assuming each record will cause one corresponding line in the zipListFile and zipLogFile
            // (this is obviously not true if a record points to a filesystem folder)
            // takes queue position into account by summing up total and worked of all downloads that are ahead of the requested download
            total += progressInfo.totalToZip * 2;
            if (progressInfo.active === true) {
                getLineCount(progressInfo.zipListFile, function (lineCountOfList) {
                    getLineCount(progressInfo.zipLogFile, function (lineCountOfLog) {
                        worked += lineCountOfList + lineCountOfLog;
                        if (progressInfo.id === req.params.id) {
                            callback(null, true); // break out of the loop
                        } else {
                            callback(null);
                        }
                    });

                });
            }
            else if (progressInfo.id === req.params.id) {
                setImmediate(callback, null, true);
            } else {
                setImmediate(callback, null);
            }
        }, function (err, progressInfo) {
            if (progressInfo == null) {
                var errMsg = 'progressInfo is null - aborting download operation';
                logger.error(errMsg);
                res.send(500, errMsg); // TODO: browser to listen to 500, abort and report an error to user
                return;
            }
            var progress = Math.floor(100 * worked / total);
            // cap at some % below 100 since the number of lines could be more than the number of records...
            if (progress >= 100) {
                progress = 99;
            }

            if (progress >= 99) {
                progressInfo.message = 'Finishing Download';
            }

            if (progressInfo.done === true) {
                res.send(200, {result: progressInfo.result, done: true});
                download.downloadQueueProgress.splice(download.downloadQueueProgress.indexOf(progressInfo), 1); // remove
                logger.info('finished processing download: progressId=' + progressInfo.id + ', download URL:' + progressInfo.result);
            } else {
                res.send(206, {progress: progress, message: progressInfo.message});
            }
        });

        function getLineCount(filename, callback) {
            var lineCount = 0;
            try {
                fs.createReadStream(filename)
                    .on('data', function (chunk) {
                        for (var c = 0; c < chunk.length; c++) {
                            if (chunk[c] === 10) { // '\n'
                                lineCount++;
                            }
                        }
                    })
                    .on('end', function () {
                        callback(lineCount);
                    })
                    .on('error', function () {
                        callback(0);
                    });
            } catch (err) {
                callback(0);
            }
        }
    });

    require('routes/progress')(app);

    /**
     * LOCALSERVER ONLY
     *
     * API: GET => bundlesprogress (returns progress in percent)
     *
     * params:
     *  id: the progress id (that was initially provided by the client as part of the api/bundles request)
     */
    app.get('/api/bundlesprogress/:id', function (req, res) {
        if (config.mode === 'localserver') {
            var progressInfo = lsBundles.bundlesProgressInfos[req.params.id];

            if (progressInfo == null) {
                var errMsg = 'progressInfo is null - aborting operation';
                logger.error(errMsg);
                res.send(500, errMsg); // TODO: browser to listen to 500, abort and report an error to user
                return;
            }
            if (req.query.cancel === 'true') {
                progressInfo.cancel = true;
                res.send(200);
                return;
            }
            if (progressInfo.done === true) {
                //res.send(200, {result: progressInfo.result, done: true});
                //delete lsBundles.bundlesProgressInfos[req.params.id];
                if (progressInfo.error != null) {
                    logger.error('finished progressId=' + req.params.id + ' with error: ' + progressInfo.error);
                    res.send(200, {result: progressInfo.result, done: true, error: progressInfo.error});
                } else {
                    logger.info('finished progressId=' + req.params.id);
                    res.send(200, {result: progressInfo.result, done: true});
                }
                delete lsBundles.bundlesProgressInfos[req.params.id];
                //logger.info('Rediscover products request made localserver');
                //desktopServer.ccsAdapter.notifyRefUpdate();
            } else {
                res.send(206, {progress: progressInfo.getProgressPercent(), message: progressInfo.message, canCancel: progressInfo.canCancel});
            }
        } else {
            res.send(500, 'API supported by localserver only.');
        }
    });

    /**
     * LOCALSERVER ONLY
     *
     * API: GET => force exit of node process
     */
    if (config.mode === 'localserver' || config.allowExit) {
        app.get('/api/exit', function (req, res) {
            res.send(200); // can't respond after shutting down
            _shutdown();
        });
    }

    /**
     * API: GET => has visited (returns true if this is the first time
     * this get request was issues since the local server started).
     *
     * Note: this is a temp workaround for differentiating between
     * user page refreshes and internal (i.e on click) refreshes
     */
    var hasVisited = false;
    app.get('/api/hasVisited', function(req, res) {
        if (config.mode === 'localserver') {
            res.send(200, {hasVisited: hasVisited});
            hasVisited = true;
        }
        else {
            res.send(500, 'API supported by localserver only.');
        }
    });

    app.get('/api/isTirexContent/:path', function (req, res) {
        res.send(200, true);
    });

    /**
     * API: GET => runOffline (run the executable resource).
     * Note: currently the resource must be offline before calling
     * the route (James: should we handle making it offline in the backend?)
     *
     * params:
     *  id: the resource id
     */
    app.get('/api/runOffline/:id', function(req, res) {
        res.set({'Access-Control-Allow-Origin': req.headers.origin});
        if (config.mode === 'localserver') {
            dbResources.findOne({'_id': req.params.id}, function (err, resource)  {
                if (err || resource == null) {
                    const errorMsg = 'Failed to get node for resource.';
                    logger.error(errorMsg);
                    logger.error(err);
                    res.send(500, errorMsg);
                }
                else {
                    if (path.isAbsolute(resource.link)) {
                        let error = null;
                        try {
                            child_process.spawn(resource.link);
                        }
                        catch(err) {
                            error = err;
                        }
                        finally {
                            if (error) {
                                const errorMsg = 'Failed to execute file.';
                                logger.error(errorMsg);
                                logger.error(error);
                                res.send(500, errorMsg);
                            }
                            else {
                                res.end();
                            }
                        }
                    } else {
                        const errorMsg = 'Resource path is not absolute.';
                        logger.error(errorMsg);
                        res.send(500, errorMsg);
                    }
                }
            });
        }
        else {
            // James: 406 => 'not acceptable' - does this make sense ?
            logger.error('Trying to run executable without local server');
            res.send(406);
        }
    });

    app.get('/api/runOffline', (req, res) => {
        if (config.mode === 'localserver') {
            const filepath = desktopServer.translateContentPath(req.query.location.replace('/content',''));
            //const child = child_process.spawn(filepath);
            const child = child_process.spawn(filepath, {
                cwd: path.dirname(filepath)
            });

            //processManager.addProcess({child, out: process.out});
            return res.send(200);
        }
        else {
            return res.send(400);
        }
    });

    /**
     * Makes the actual native OS command to open a web resource using the opn module (https://www.npmjs.com/package/opn)
     *
     * params:
     *  link: opens the link in the user's default browser
     *  res: used to send success/error messages and status codes to the API called
     */
    function callOpnModule(link, res) {
        let opnOptions = {
            wait: false //doesn't wait for user to close browser to fire the success callback
        };
        opn(link, opnOptions)
            .then(function() {
                logger.info('Opened web resource in browser: ' + link);
                res.send(200);
            })
            .catch(function() {
                logger.error('Resource does not have link field');
                res.send(500, errMsg);
            });
    }

    /**
     * Open a given link in the user's local browser
     *
     * params:
     *  req: used to extract resource id from the client request
     *  res: used to send success/error messages and status codes to the API called
     *  link: open the url string in the user's default browser;
     *          if link is null, the remote dbResources databse is queried to get the true link of the web resource
     */
    function openInDefaultBrowser(req, res, link) {
        let errMsg = 'Could not open web resource in browser';

        if (!link) {
            const url = `${vars.REMOTESERVER_BASEURL}/api/resources?id=${req.params.id}`;
            request.get(url, function(err, res1, body) {
                if (err) {
                    logger.error(errMsg + ': ', err);
                    res.send(500, errMsg);
                } else {
                    if(res1.statusCode != 200) {
                        logger.error(res1.body);
                        res.send(500, errMsg);
                    } else {
                        try {
                            // using the first object since API returns a list of resources but we only request one resource
                            let parsedBody = JSON.parse(body)[0];
                            let resourceLink = parsedBody.link;
                            if (resourceLink) {
                                // check if link is within TIREX or external
                                if (parsedBody.linkType === 'local') {
                                    resourceLink = req.headers.referer + 'content/' + resourceLink;
                                }
                                callOpnModule(resourceLink, res);

                            } else {
                                logger.error('Resource does not have link field');
                                res.send(500, errMsg);
                            }
                        } catch(e) {
                            logger.error('Could not parse resource JSON: ' + e);
                            res.send(500, errMsg);
                        }
                    }
                }
            });
        } else {
            callOpnModule(link, res);
        }
    }

    //API : GET => linkTo resource
    app.get('/api/linkTo/:id', function (req, res) {
        // check if openInBrowser query is present
        let openInBrowser = req.query.openInBrowser === 'true';

        // FIRST QUERY THE LOCAL DATABASE
        dbResources.findOne({'_id': req.params.id}, function (err, resource) {
            if (resource != null) {
                // echos the origin domain which effectively allows ALL domains access
                // needed because request may come from a tirex server on a user's desktop (see below)
                res.set({'Access-Control-Allow-Origin': req.headers.origin});

                // CHECK IF LINK TYPE IS LOCAL
                if (resource.linkType === 'local') {
                    // Temporary fix for older browsers with difficulties handling win style paths in links
                    resource.link = resource.link.replace(/\\/g, '/');
                    // check if TIREX is running in the landscape
                    if (config.myRole !== '') {
                        // if so, add 'tirex/content' suffix to the local link
                        if(openInBrowser) {
                            // also append host if we want to open link in user's default browser
                            openInDefaultBrowser(req, res, req.headers.referer + 'content/' + resource.link);
                        } else {
                            res.redirect(config.myRole + '/content/' + resource.link);
                        }
                    } else {
                        // if not running in landscape, add 'content/' suffix to local link
                        if(openInBrowser) {
                            // also append host if we want to open link in user's default browser
                            openInDefaultBrowser(req, res, req.headers.referer + 'content/' + resource.link);
                        } else {
                            res.redirect('content/' + resource.link);
                        }
                    }
                } else {
                    if(openInBrowser) {
                        openInDefaultBrowser(req, res, resource.link);
                    } else {
                        res.redirect(resource.link);
                    }
                }
            }

            // NOW QUERY REMOTE DATABASE
            else if (config.mode === 'localserver' && serverState.useRemoteContent === true) {
                if(openInBrowser) {
                    openInDefaultBrowser(req, res, null);
                } else {
                    res.redirect(vars.REMOTESERVER_BASEURL + req.originalUrl);
                }
            }

            // RESOURCE LINK NOT FOUND IN REMOTE OR LOCAL DATABASE
            else {
                var msg = 'Resource not found: ' + req.originalUrl;
                logger.error(msg);
                res.send(404, vars.RESOURCE_OT_FOUND_MSG);
            }
        });
    });

    //API : GET => import project (projects and projectspecs)
    app.get('/api/importProject/:id', function (req, res) {
        dbResources.findOne({'_id': req.params.id}, function (err, resource) {
            if (resource == null) {
                var msg = 'Resource not found: ' + req.originalUrl;
                logger.error(msg);
                res.send(404, vars.RESOURCE_OT_FOUND_MSG);
                return;
            }
            var importProjectAPI = '//' + vars.CCS_CLOUD_URL + resource._importProjectCCS;
            // if (config.mode === 'localserver') {
            //     var re = new RegExp( vars.CCS_CLOUD_API_BASE, 'g');
            //     importProjectAPI = importProjectAPI.replace(re, vars.CCS_DESKTOP_API_BASE);
            // }

            res.set({'Access-Control-Allow-Origin': req.headers.origin});

            // optional connection type
            if (req.query.connection != null) {
                importProjectAPI += '&connection=' + req.query.connection;
            }

            if (config.mode === 'localserver') {
                //var re = new RegExp( ".*/ide/api/ccsserver/", 'g');
                //importProjectAPI = importProjectAPI.replace(re, "http://localhost:" + config.ccs_port + "/");
                importProjectAPI = desktopServer.translateProjectAPI(importProjectAPI);
            }

            if (config.mode === 'localserver') {
                // workaround for Mac: redirect to CCS port not working for unknown reason
                request.get(importProjectAPI, function (err, res1, body) {
                    logger.error(JSON.stringify(err));
                    if(res1 == null){
                        res.send(500, '<pre>Error: CCS server not responding.</pre>');
                    }else{
                        res.send(res1.statusCode, res1.body);
                    }
                });
            } else {
                res.redirect(importProjectAPI);
            }
        });
    });

    //API : GET => import with core/device or board id (Energia sketch, projectspecs with regex)
    app.get('/api/importProject/:id/:targetId', function (req, res) {
        dbResources.findOne({'_id': req.params.id}, function (err, resource) {
            if (resource == null) {
                var msg = 'Resource not found: ' + req.originalUrl;
                logger.error(msg);
                res.send(404, vars.RESOURCE_OT_FOUND_MSG);
                return;
            }
            var re = new RegExp(vars.TARGET_ID_PLACEHOLDER, 'g');
            var importProjectAPI = '//' + vars.CCS_CLOUD_URL + resource._importProjectCCS.replace(re, req.params.targetId);
            // if (config.mode === 'localserver') {
            //     var re = new RegExp( vars.CCS_CLOUD_API_BASE, 'g');
            //     importProjectAPI = importProjectAPI.replace(re, vars.CCS_DESKTOP_API_BASE);
            // }
            // optional connection type
            if (req.query.connection != null) {
                importProjectAPI += '&connection=' + req.query.connection;
            }

            if (config.mode === 'localserver') {
                //re = new RegExp( ".*/ide/api/ccsserver/", 'g');
                //importProjectAPI = importProjectAPI.replace(re, "http://localhost:" + config.ccs_port + "/");
                importProjectAPI = desktopServer.translateProjectAPI(importProjectAPI);
            }

            if (config.mode === 'localserver') {
                // workaround for Mac: redirect to CCS port not working for unknown reason
                request.get(importProjectAPI, function (err, res1, body) {
                    logger.error(JSON.stringify(err));
                    //logger.info(JSON.stringify(res));
                    //logger.info(JSON.stringify(body));
                    if (res1 == null){
                        res.send(500, '<pre>Reason: CCS server not responding.</pre>');
                    } else {
                        res.send(res1.statusCode, res1.body);
                    }
                });
            } else {
                res.redirect(importProjectAPI);
            }
        });
    });

    // API : GET => create and import project (file.importable, folder.importable)
    app.get('/api/createProject/:id/:targetId', function (req, res) {
        dbResources.findOne({'_id': req.params.id}, function (err, resource) {
            if (resource == null) {
                var msg = 'Resource not found: ' + req.originalUrl;
                logger.error(msg);
                res.send(404, vars.RESOURCE_OT_FOUND_MSG);
                return;
            }
            var re = new RegExp(vars.TARGET_ID_PLACEHOLDER, 'g');
            var createProjectAPI = '//' + vars.CCS_CLOUD_URL + resource._createProjectCCS.replace(re, req.params.targetId);
            // if (config.mode === 'localserver') {
            //     var re = new RegExp( vars.CCS_CLOUD_API_BASE, 'g');
            //     createProjectAPI = createProjectAPI.replace(re, vars.CCS_DESKTOP_API_BASE);
            // }

            if (config.mode === 'localserver') {
                //re = new RegExp( "/ide/api/ccsserver/", 'g');
                //createProjectAPI = createProjectAPI.replace(re, "http://localhost:" + config.ccs_port + "/");
                createProjectAPI = desktopServer.translateProjectAPI(createProjectAPI);
            }
            if (config.mode === 'localserver') {
                // workaround for Mac: redirect to CCS port not working for unknown reason
                request.get(createProjectAPI, function (err, res1, body) {
                    logger.error(JSON.stringify(err));
                    // logger.info(JSON.stringify(res1));
                    // logger.info(JSON.stringify(body));
                    if(res1 == null){
                        res.send(500, '<pre>Reason: CCS server not responding.</pre>');
                    }else{
                        res.send(res1.statusCode, res1.body);
                    }
                });
            } else {
                res.redirect(createProjectAPI);
            }

        });
    });

    // [ CCSIDE-2956
    // General API: redirect to CCS, the API subpath should be matched with CCS spec
    // Intended for CCS project server initially:
    //   createProject(), importProject(), buildProject(), debugProject(), importSketch()
    /*
     * - client responsible for constructing resource's full path
     *   - use 'location.pathnsme' to get the HTML page location
     *     - Ex: '/content/msp432_sdk_1_00_00_00/examples/index.html'
     *   - locate the target file (ex: ./example1/test.projectspec)
     *     - Ex: '/content/msp432_sdk_1_00_00_00/examples/example1/test.projectspec'
     *   - construct CCS call
     *     - '/api/ccs/importProject?location=/content/msp432_sdk_1_00_00_00/examples/example1/test.projectspec&...'
     * - server
     *   - resolve the content path, example:
     *     - from: '/importProject?location=/content/msp432_sdk_1_00_00_00/examples/example1/test.projectspec&...'
     *     - to" '/importProject?location=c:/ti/tirex-content/msp432_sdk_1_00_00_00/examples/example1/test.projectspec&...'
     *   - redirect to CCS server
     *     - 'http://localhost:1234/importProject?location=c:/ti/tirex-content/msp432_sdk_1_00_00_00/examples/example1/test.projectspec&...'
     * - Limitations
     *     - Client cannot use 'content' in their file paths.
     */
    app.use('/api/ccs', function (req, res) {
        // resolve content path
        // TODO: If user has its own subpath 'content', how to identify it and prevent replacement?
        //
        // redirect
        if (config.mode === 'remoteserver') {
            let reContent = new RegExp('/content/', 'g');
            let newUrl = decodeURIComponent(req.url).replace(reContent, vars.CONTENT_BASE_PATH+'/');
            newUrl = '//' + vars.CCS_CLOUD_URL + vars.CCS_CLOUD_API_BASE + newUrl;
            res.redirect(newUrl);
        }
        else if (config.mode === 'localserver') {
            desktopServer.ccsAdapter.redirectAPI('/', '/ide/', req, res);   // CCS7.2 IDE
        }
        else {
            res.send(404);
        }
    });

    //API : GET => full device DB
    app.get('/api/devices', function (req, res) {
        dbDevices.find({}, function (err, result) {
            res.send(result);
        });
    });

    //API : GET => full devtool DB
    app.get('/api/devtools', function (req, res) {
        dbDevtools.find({}, function (err, result) {
            res.send(result);
        });
    });

    //API : GET => /devices/families
    app.get('/api/devices/families', function (req, res) {
        dbDevices.find({'parent': null}, function (err, result) {
            deleteUnwantedProperties(result);
            res.send(result);
        });
    });

    //API : GET => device record
    app.get('/api/devices/:name', function (req, res) {
        dbDevices.find({'name': req.params.name}, function (err, result) {
            deleteUnwantedProperties([result]);
            res.send(result);
        });
    });

    //API : GET => subfamilies
    app.get('/api/devices/:family/subfamilies', function (req, res) {
        // TODO: verify that a :family is a root item
        dbDevices.find({'parent': req.params.family}, function (err, result) {
            deleteUnwantedProperties(result);
            res.send(result);
        });
    });

    //API : GET => variants
    app.get('/api/devices/:subfamily/variants', function (req, res) {
        // TODO: verify that a :subfamily is a 2nd level item
        dbDevices.find({'parent': req.params.subfamily}, function (err, result) {
            deleteUnwantedProperties(result);
            res.send(result);
        });
    });

    //API : GET => all variants and devtools
    app.get('/api/devicesanddevtools', function (req, res) {
        if (config.mode === 'remoteserver' || (config.mode === 'localserver' && serverState.useRemoteContent === false)) {
            var find = {children: null};
            dbDevices.find(find, function (err, variants) {
                delete find.children;
                dbDevtools.find(find, function (err, devtools) {
                    deleteUnwantedProperties(variants);
                    deleteUnwantedProperties(devtools);
                    sortStable.inplace(variants, function (a, b) {
                        return String(a.name).localeCompare(b.name);
                    });
                    sortStable.inplace(devtools, function (a, b) {
                        return String(a.name).localeCompare(b.name);
                    });
                    // remvoe duplicates from (sorted)variants and devtools
                    for(var i =1; i< devtools.length; i++){
                        if(devtools[i -1].name === devtools[i].name){
                            devtools.splice(i,1);
                            i--;
                        }
                    }
                    for(var j =1; j< variants.length; j++){
                        if(variants[j -1].name === variants[j].name){
                            variants.splice(j,1);
                            j--;
                        }
                    }
                    devtools = devtools.filter((devtool) => {
                        return devtool.type === 'board';
                    });
                    res.send({devices: variants, devtools});
                });
            });
        } else if (config.mode === 'localserver' && serverState.useRemoteContent === true) {
            request.get({
                url:vars.REMOTESERVER_BASEURL + req.originalUrl,
            })
                .on('error', (err) => {
                    logger.error(err);
                })
                .pipe(res);
        }
    });

    //API : GET => all packages
    app.get('/api/packages', function (req, res) {
        if (config.mode === 'localserver' && req.query.scan) {
            // initiate a scanning
            // Deprecate: use Post /localpkg/scan instead
            desktopServer.packageImporter.scan(function (result) {
                res.send(desktopServer.packageImporter.getNewPackages());
            });
        } else if (config.mode === 'localserver' && req.query.discovered) {
            // get a list of discovered packages available for import
            res.send(desktopServer.packageImporter.getNewPackages());
        } else if (config.mode === 'localserver' && req.query.importAll != null) {
            // import all newly discovered packages
            // Deprecate: use Post /localpkg/importAll instead
            desktopServer.packageImporter.importAll(req.query.progressId);
            res.send(202);
        } else {
            getPackages(req, packages => {
                if (!req.query.supplements) {
                    packages = packages.filter((pkg) => {
                        return !pkg.supplements;
                    });
                }
                res.send(packages);
            });
        }
    });

    /**
     * Retrieve a sorted list of available packages
     * Sorting is done by package order then by semver (increasing)
     *
     * @param req
     * @param callback
     */
    function getPackages(req, callback) {
        var resultPackages = [];
        if (config.mode === 'remoteserver') {
            dbOverviews.find({ resourceType: 'packageOverview', type: 'software'}, function (err, packages) {
                if (isUseragentTirex(req)) {
                    // from desktop server, return everything
                    resultPackages = packages;
                }
                else {
                    // from cloud client, remove desktop import only items
                    resultPackages = packages.filter(_filterPackageImportOnly);
                }
                callback(_sortPackages(resultPackages));
            });
        }
        else if (config.mode === 'localserver') {
            if (serverState.useRemoteContent) {
                if (!requestCache) {
                    requestCache = new ValueCache(60 * 1000, _updatePackagesList);
                }
                requestCache.getValue(({err1, res1, body}) => {
                    dbOverviews.find({resourceType: 'packageOverview', type: 'software'}, function (err, packages) {
                        if (err1 || !res1) {
                            return callback(_sortPackages(packages));
                        }
                        let onlinePackages = [];
                        if (res1.statusCode === 200 && body) {
                            try {
                                onlinePackages = JSON.parse(body);
                            } catch (e) {
                                return callback(_sortPackages(packages));
                            }
                        } else {
                            return callback(_sortPackages(packages));
                        }
                        const offlinePackages = packages;
                        for (var i = 0; i < onlinePackages.length; i++) {
                            for (var j = 0; j < offlinePackages.length; j++) {
                                if (onlinePackages[i].packageUId === offlinePackages[j].packageUId) {
                                    // if the package is offline use the offline record but retain the most recent order from online (REX-2047)
                                    const packageOrder = onlinePackages[i].packageOrder;
                                    onlinePackages[i] = offlinePackages[j];
                                    onlinePackages[i].packageOrder = packageOrder;
                                }
                            }
                        }
                        resultPackages = onlinePackages.filter(_filterPackageImportOnly);
                        callback(_sortPackages(resultPackages));
                    });
                });
            }
            else if (serverState.useRemoteContent === false) {
                dbOverviews.find({resourceType: 'packageOverview', type: 'software'}, function (err, packages) {
                    callback(_sortPackages(packages));
                });
            }
        }

        function _updatePackagesList(callback) {
            request.get({
                url: vars.REMOTESERVER_BASEURL + '/api/packages?supplements=true'
            }, function (err1, res1, body) {
                callback({err1, res1, body});
            });
        }

        function _filterPackageImportOnly(pkg) {
            // TODO - to be implemented
            if (pkg.local === 'full') {
                return true;
            }
            if (pkg.restrictions && pkg.restrictions.indexOf(vars.METADATA_PKG_IMPORT_ONLY) >= 0) {
                return false;
            }
            return true;
        }

        /**
         * This sorting is for the benefit of the client:
         *  - in package picker show order of packages in original specified order (i.e. same as tree)
         *  - sort packages by increasing semver because package picker assumes last version in
         *    the list is the "latest"
         *  Why:
         *  - only rexdb returns results in the original order (from default.json), can't rely
         *    on any other DB to do this
         *  - rexdb also may not return in original order for a client in offline mode since
         *    packages are stored in rexdb in the order they were made offline (i.e. package
         *    picker's "latest" version may be incorrect)
         *
         * Note: If versions of a package are not grouped together (i.e. have consecutive ordering numbers),
         * then depending on the sort algorithm any one of the occurrences may be chosen as an anchor
         * around which all other versions will be clustered. To get predictable sorting results it's best
         * to group all versions of a package together.
         *
         * TODO: move this code to the client
         *
         * @param packages
         */
        function _sortPackages(packages) {
            // restore originally specified package order; also pre-requisite for second sorting step below
            packages.sort((p1, p2) => p1.packageOrder - p2.packageOrder);

            // order versions of package by increasing semver
            // use stable sort so that a 0 comparison result (i.e. equality) doesn't cause re-order among different packages
            sortStable.inplace(packages, (p1, p2) => {
                if (p1.id === p2.id) {
                    return versioning.compare(p1.version, p2.version);
                } else {
                    return 0;
                }
            });
            return packages;
        }
    }

    // [ REX-1052
    // Utility function to check if request is originated from TIREX server
    function isUseragentTirex(req) {
        return (req.headers['user-agent'] != null &&
                req.headers['user-agent'].indexOf(vars.LOCALSERVER_USER_AGENT_PREFIX) >= 0);
    }
    // ]

    // [ TODO Bruce: local package importer APIs
    app.get('/localpkg', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        if (req.query.discovered != null) {
            // get a list of discovered packages available for import
            res.send({
                added: desktopServer.packageImporter.getNewPackages(),
                removed: desktopServer.packageImporter.listPR
            });
            return;
        }
        if (req.query.searchpath != null) {
            // get a list of discovered packages available for import
            res.send(desktopServer.packageImporter.getSearchPaths());
            return;
        }
        res.send(404);
    });
    // REX-1315: add API for cleaning metadata
    app.post('/localpkg/cleanmeta', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        if (serverState.connectionState !== state.ConnectionState.CONNECTED) {
            res.send(404);
            return;
        }
        desktopServer.packageImporter.clean(function (result) {
            res.send(result);
        });
    });
    var _scanning = false;
    app.post('/localpkg/scan', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }

        if(_scanning) {
            // multiple scanning is not allowed
            res.send(404);
            return;
        }
        _scanning = true;
        desktopServer.packageImporter.scan(function (result) {
            //res.send(desktopServer.packageImporter.getNewPackages());
            _scanning = false;
            res.send(result);
        });
    });
    app.post('/localpkg/importAll', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        desktopServer.packageImporter.importAll(req.query.progressId);
        res.send(202);
    });
    app.post('/localpkg/import', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        var packageHeaders = [];
        if (Array.isArray(req.body.p)) {
            packageHeaders = req.body.p;
        } else {
            packageHeaders = [req.body.p];
        }
        desktopServer.packageImporter.import(packageHeaders, req.query.progressId);
        res.send(202);
    });
    app.put('/localpkg/addPath', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        if (req.body.searchpath) {
            desktopServer.packageImporter.addSearchPath(req.body.searchpath, true);
        }
        res.send(200);
    });
    app.put('/localpkg/removePath', function (req, res) {
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        if (req.body.searchpath) {
            desktopServer.packageImporter.removeSearchPath(req.body.searchpath, true);
        }
        res.send(200);
    });
    app.post('/ide/rediscoverProducts', function (req, res) {
        logger.info('Rediscover products request made by client');
        if (config.mode !== 'localserver') {
            res.send(404);
            return;
        }
        desktopServer.ccsAdapter.notifyRefUpdate();
        res.send(200);
    });
    /*

     */
    if (config.mode === 'localserver') {
        // Ex: http://localhost:3001/ide/clearEvent?name=productsChanged
        app.get('/ide/clearEvent', function (req, res) {
            desktopServer.ccsAdapter.onClearEvent(req, res);
        });
        // Ex: http://localhost:3001/ccsEvent?name=productsChanged
        app.get('/ccsEvent', function (req, res) {
            desktopServer.ccsAdapter.onEvent(req, res);
        });
    }

    function deleteUnwantedProperties(records) {
        for (var i = 0; i < records.length; i++) {
            var item = records[i];
            delete item.parent;
            delete item.ancestors;
            delete item.children;
            delete item._id;
        }
    }

    // For using Server-Sent Events, write appropriate headers and send data in specified format
    var startSSEs = function(res) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');

        return function sendSSE(eventName, data) {
            res.write('event: ' + eventName + '\n');
            res.write('data: ' + data + '\n\n');
        }
    };

    //API : GET => refresh database
    if (vars.ALLOW_REFRESH_FROM_WEB === 'true') {
        app.get('/api/refresh', adminAuth, function (req, res) {
            const log = new logging.Log({
                userLogger: rex.loggerManager.createLogger('refreshUser'),
                debugLogger: rex.loggerManager.createLogger('refreshDebug')
            });
            const typeColors = {
                'info': '#FCD116', // yellow
                'warning': 'orange',
                'error': 'red'
            };
            if (req.query.p && req.query.mode) {
                let SSE = startSSEs(res);
                let SSEID = -1;
                log.userLogger.on('data', (message) => {
                    const {data, type, tags} = JSON.parse(message.toString());
                    SSEID++;
                    //Need to slice data since it contains escape character '\n'
                    const eventData = JSON.stringify({
                        id: SSEID,
                        data: data.slice(0, data.length-1),
                        type: type,
                        tags: tags
                    });
                    SSE('data', eventData);
                });
                log.userLogger.on('end', ()=> {
                    SSE('data', JSON.stringify({
                        id: ++SSEID,
                        data: '**** Process Complete ****',
                        type: 'info',
                        tags: []
                    }));
                });
                log.userLogger.on('error', ()=> {
                    SSE('data', JSON.stringify({
                        id: ++SSEID,
                        data: '**** Could not refresh ****',
                        type: 'error',
                        tags: []
                    }));
                });
            }
            else {
                log.userLogger.on('data', (message) => {
                    const {data, type, tags} = JSON.parse(message.toString());
                    const msg = `<b style="color: ${typeColors[type] || "black"}">[${type.toUpperCase()}] </b> <p style="display:inline">${data} </p><br>`;
                    res.write(msg);
                });
            }

            if (!req.query.p) {
                res.send('Usage: <br> ' +
                         'api/refresh?p=all - refresh all packages listed in default.json <br> ' +
                         'api/refresh?p=[packagename1]&p=[packagename2]... - refesh specified packages only <br>' +
                         'Refresh Package can only be used if Refresh All was invoked at least once before AND there are: <br>' +
                         '  - no changes to devices.tirex.json and devtools.tirex.json <br>' +
                         '  - no changes to rootCategory in the package header <br>');
            }
            else if (req.query.p === 'all') {
                rex.refreshManager.refreshDatabase({log}, (err) => {
                    log.closeLoggers();
                    res.end();
                });
            }
            else {
                rex.refreshManager.refreshDatabase({
                    log,
                    packageNames: (Array.isArray(req.query.p) ?
                                   req.query.p : [req.query.p]),
                    refreshAll: false,
                    clearAllData: false
                }, (err) => {
                    log.closeLoggers();
                    res.end();
                });
            }
        });
    }

    let lastRefreshTime;

    app.post('/api/setLastRefreshTime', function (req, res) {
        lastRefreshTime = req.body.date;
        res.end();
    });

    app.get('/api/getLastRefreshTime', function (req, res) {
        res.send(lastRefreshTime);
    });

    app.get('/sitemap_index.xml', function (req, res) {
        var file = path.join(vars.SITEMAP_PATH, 'sitemap_index.xml');
        if (fs.existsSync(file) === true) {
            res.sendfile(file);
        } else {
            res.send(404, 'Not found.');
        }
    });

    app.get('/sitemap.xml/:id', function (req, res) {
        var file = path.join(vars.SITEMAP_PATH, 'sitemap' + req.params.id + '.xml');
        if (fs.existsSync(file) === true) {
            res.sendfile(file);
        } else {
            res.send(404, 'Not found.');
        }
    });

    /**
     * sitemap for Google
     * sitemaps with more than 50,000 entires need to be split up
     */
    function createSitemap(dbResources) {
        logger.info('Preparing new sitemap.xml');
        var numUrls = 0;
        var fileCounter = -1;
        var fileStrings = [];
        var fileHeader = '<?xml version="1.0" encoding="UTF-8"?>\r\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r\n';
        dbResources.find({}, function (err, resources) {
            if (err == null) {
                for (var i = 0; i < resources.length; i++) {
                    for (var j = 0; j < resources[i].fullPaths.length; j++) {
                        if (numUrls === 0) {
                            fileStrings[++fileCounter] = fileHeader;
                        }
                        var link = resources[i].fullPaths[j].join('/') + '/' + resources[i].name;
                        var url = 'http://dev.ti.com/#/?link=' + encodeURIComponent(link);
                        fileStrings[fileCounter] += '<url><loc>' + url + '</loc></url>\r\n';
                        numUrls++;
                        if (numUrls === 50000) {
                            fileStrings[fileCounter] += '</urlset>';
                            numUrls = 0;
                        }
                    }
                }
                if (numUrls > 0) {
                    fileStrings[fileCounter] += '</urlset>';
                }

                var indexFile = '<?xml version="1.0" encoding="UTF-8"?>\r\n' +
                    '<sitemapindex xmlns="http://www.google.com/schemas/sitemap/0.84">\r\n';
                var index = -1;
                async.eachSeries(fileStrings, function (fileString, callback) {
                    index++;
                    fs.writeFile(path.join(vars.SITEMAP_PATH, 'sitemap' + index + '.xml'), fileString, function (err) {
                        if (err) {
                            logger.error('An error occured with writing the sitemap.xml: ' + JSON.stringify(err));
                        } else {
                            logger.info('Sitemap written successfully!');
                            indexFile += '<sitemap>\r\n' +
                                '<loc>http://dev.ti.com/tirex/sitemap.xml/' + index + '</loc>\r\n' +
                                '</sitemap>\r\n';
                        }
                        callback(err);
                    });
                }, function (err) {
                    if (!err) {
                        indexFile += '</sitemapindex>';
                        fs.writeFile(path.join(vars.SITEMAP_PATH, './sitemap_index.xml'), indexFile, function (err) {
                            if (err) {
                                logger.error('an error occured with writing the sitemap index file: ' + JSON.stringify(err));
                            } else {
                                logger.info('Sitemap index written successfully');
                            }
                        });
                    }
                });
            }
        });
    }

    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    app.get('/runexec', function (req, res) {
        exec(req.body.path, function (error, stdout, stderr) {
            logger.error('error running exec: ' + error);
        });
        res.send(200);
    });

    const isCreateServer = app.get('port') != null && app.get('port') !== '';
    if (isCreateServer) {
        // bind to 0.0.0.0 to force IPv4, see REX-1614 TIREX Listening on IPv6, not IPv4
        var _httpserver = http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
            logger.info('Express server listening on port ' + _httpserver.address().port);
            console.log('TIREX server listening on port ' + _httpserver.address().port);
            serverState.updateServerStatus(state.ServerStatus.UP, config);
        });
    }

    if (config.refreshDB === 'true') {
        rex.refreshManager.refreshDatabase({log: rex.log}, (err) => {
            if (isCreateServer) {
                callback(err, rex);
            } else {
                if (err) {
                    logger.error('Error: ' + err);
                }
                logger.info('Not starting a server: exiting...');
                process.exit(0);
            }
        });
    } else if (isCreateServer) {
        callback(null, rex);
    } else {
        logger.info('Neither refreshing DB nor starting a server: exiting...');
        process.exit(0);
    }

    // shutdown job, clean up and reports ...
    function _shutdown() {
        if (config.mode === 'localserver') {
            // TODO:  dinfra-desktop
            process.exit();
        }
        else {
            // query.report();
            dinfra.shutdown();
        }
    }
}

if (require.main === module) {
    // Invocation: node app.js <path/to/dinfra.js> <path/to/dconfig> <path/to/tirex-config>
    //   - desktop server (dconfig not needed): cd ti-rex-core; node app.js dinfra-desktop/dinfra.js x config/app_localserver.json
    //   - e.g. remote server in dev-env:  node app.js <path/to/dinfra.js> config/dconfig_auser.json config/app_remoteserver.json

    let config = {};
    var overrideConfigFile = process.argv[4];
    if (fs.existsSync(overrideConfigFile)) {
        config = require(overrideConfigFile);
    } else {
        console.log('WARNING: config file not found: ' + overrideConfigFile);
    }

    // process config overrides from cmd line, e.g. --refreshDB=true
    for (var o = 5; o < process.argv.length; o++) {
        if (process.argv[o].slice(0, 2) === '--') {
            var or = process.argv[o].slice(2).split('=');
            config[or[0]] = or[1];
        }
    }

    // configure dinfra and dinfra logging
    // use a localhost dconfig if dconfig file not found
    var dinfra = require(process.argv[2]);
    var dconfig;
    try {
        dconfig = require(process.argv[3]);
    } catch(e) {
        dconfig = {
            origin: { landscape: 'localhost', cluster: 'none', instance: 'localhost' },
            paths: {}
        };
    }

    exports.setupTirex({config, dinfra, dconfig}, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

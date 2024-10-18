'use strict';
require('rootpath')();

const path = require('path');
const fs = require('fs-extra');
const async = require('async');

const vars = require('lib/vars');
const rexdb_split = require('../../rexdb/lib/rexdb-split');

var macros; // macro store

/**
 * Refresh the database.
 *
 * @param {Object} config
 * @param {Log} log
 * @param {Array.String} contentPackages
 * @param {Object} dbs
 * @param {Boolean} clearAllData
 * @param callback(err)
 */
exports._refreshDatabase = function({log, contentPackages, dbs, clearAllData}, callback) {

    if (contentPackages.length === 0) {
        log.userLogger.info('No packages to refresh.');
        callback();
        return;
    }

    const {
        dbDevices,
        dbDevtools,
        dbResources,
        dbOverviews,
        dbPureBundles,
        dbDownloads
    } = dbs;

    var macrosBuilder = require('./macros');
    var devicesBuilder = require('./devices');
    var devtoolsBuilder = require('./devtools');
    var resourcesBuilder = require('./resources');
    var indexer = require('./indexer');
    var compacter = require('./compacter');

    log.userLogger.info('Refreshing databases. Please wait...');

    async.series([
        (callback) => {
            if (clearAllData === true) {
                devicesBuilder.clearLog();
                devtoolsBuilder.clearLog();
                resourcesBuilder.clearLog();
                macrosBuilder.clearLog();
                macros = {};
                async.eachSeries([
                    dbDevices,
                    dbDevtools,
                    dbResources,
                    dbOverviews,
                    dbPureBundles
                ], (dbItem, callback) => {
                    dbItem.remove({}, callback);
                }, callback);
            } else {
                // only clear resources, overviews, bundles and downloads (keep macros, devices, devtools)
                resourcesBuilder.clearLog();
                macros = {};
                async.eachSeries(contentPackages, (contentPackage, callback) => {
                    async.eachSeries([
                        dbResources,
                        dbOverviews,
                        dbPureBundles
                    ], (dbItem, callback) => {
                        dbItem.remove({
                            'package': contentPackage.name
                        }, callback); // TODO change to packageid
                    }, callback);
                }, err => setImmediate(callback, err));
            }
        },
        (callback) => {
            dbDownloads.remove({}, callback);
        },
        (callback) => {
            fs.remove(vars.DOWNLOADS_BASE_PATH, callback);
        },
        (callback) => {
            fs.ensureDir(vars.DOWNLOADS_BASE_PATH, callback);
        },
        (callback) => {
            async.eachSeries(contentPackages, (contentPackage, callback) => {
                macrosBuilder.refresh(contentPackage.path, macros, log, (err) => {
                    callback(err);
                });
            }, function(err) {
                if (!err) {
                    log.userLogger.info('Done refreshing macros.');
                }
                log.handleError(
                    arguments, callback,
                    {userMessage: 'An error occurred while refreshing macros'});
            });
        },
        (callback) => {
            if (!clearAllData) {
                return setImmediate(callback);
            }
            async.eachSeries(contentPackages, (contentPackage, callback) => {
                devicesBuilder.refresh(
                    contentPackage.path,
                    dbs.dbDevices,
                    macros[contentPackage.path],
                    log, (err) => {
                        callback(err);
                    });
            }, function(err) {
                if (!err) {
                    log.userLogger.info('Done refreshing devices.');
                }
                log.handleError(
                    arguments, callback,
                    {userMessage: 'An error occured while refreshing devices'});
            });
        },
        (callback) => {
            if (!clearAllData) {
                return setImmediate(callback);
            }
            async.eachSeries(contentPackages, (contentPackage, callback) => {
                devtoolsBuilder.refresh(
                    'main',
                    contentPackage.path,
                    dbs.dbDevtools,
                    dbs.dbDevices,
                    macros[contentPackage.path],
                    log,
                    callback);
            }, function(err) {
                if (!err) {
                    log.userLogger.info('Done refreshing devtools from \'main\' files.');
                }
                log.handleError(
                    arguments, callback,
                    {userMessage: 'An error occurred while refreshing devtools'}
                );
            });
        },
        (callback) => {
            if (!clearAllData) {
                return setImmediate(callback);
            }
            async.eachSeries(contentPackages, (contentPackage, callback) => {
                devtoolsBuilder.refresh(
                    'aux',
                    contentPackage.path,
                    dbs.dbDevtools,
                    dbs.dbDevices,
                    macros[contentPackage.path],
                    log,
                    callback);
            }, function(err) {
                if (!err) {
                    log.userLogger.info('Done refreshing devtools from ' +
                        '\'main\' and \'aux\' files.');
                }
                log.handleError(
                    arguments, callback,
                    {userMessage: 'An error occurred while refreshing devtools'});
            });
        },
        (callback) => {
            let orderedPackages = contentPackages.slice();
            async.eachSeries(contentPackages, (contentPackage, callback) => {
                async.waterfall([(callback) => {
                    vars.getMetadataDir(contentPackage.path, (metadataDir) => {
                        callback(null, metadataDir);
                    });
                }, (metadataDir, callback) => {
                    fs.readJson(
                        path.join(
                            vars.CONTENT_BASE_PATH, contentPackage.path, metadataDir, 'package.tirex.json'
                        ), callback);
                }, ([{supplements}], callback) => {
                    if (supplements) {
                        // put supplemental packages at the end
                        orderedPackages = orderedPackages.filter((pkg) => {
                            return pkg.path !== contentPackage.path;
                        });
                        orderedPackages.push(contentPackage);
                    }
                    setImmediate(callback);
                }], callback);
            }, (err) => {
                if (err) {
                    return callback(err);
                }
                async.eachSeries(orderedPackages, (contentPackage, callback) => {
                    async.series(
                        [
                            callback => {
                                resourcesBuilder.refresh(
                                    contentPackage.path,
                                    contentPackage.order,
                                    dbs.dbResources,
                                    dbs.dbOverviews,
                                    dbs.dbPureBundles,
                                    dbs.dbDevices,
                                    dbs.dbDevtools,
                                    macros[contentPackage.path],
                                    log,
                                    callback
                                );
                            },
                            callback => {
                                dbResources.save(callback);
                            },
                            callback => {
                                // unload refreshed resources to ease memory pressure
                                dbResources.use([], callback);
                            }
                        ],
                        callback
                    );
                }, function(err) {
                    if (!err) {
                        log.userLogger.info('Done refreshing resources.');
                    }
                    log.handleError(arguments, callback,
                        {userMessage: 'An error occurred while refreshing resources. Should not have occurred since resource errors should not abort refresh! This is likely a bug.'});
                });
            });
        },
        // save databases
        (callback) => {
            log.userLogger.info('Done refreshing all databases.');
            log.userLogger.info('Saving databases...');
            if (clearAllData) {
                dbs.dbDevices.save(function() {
                    dbs.dbDevtools.save(callback);
                });
            }
            else {
                setImmediate(callback);
            }
        },
        (callback) => {
            async.eachSeries([dbOverviews, dbPureBundles, dbDownloads],
                (dbItem, callback) => {
                    dbItem.save(callback);
                }, callback);
        },
        // generate indices for resource and overview DBs (uses overviews.db and resources.db)
        (callback) => {
            log.userLogger.info('Generating indices...');
            indexer.index(vars.DB_BASE_PATH, log.userLogger, err => {
                if (err) {
                    log.userLogger.error('Indexing aborted due to error: ' + err.message);
                }
                callback(err);
            });
        }, 
        callback => {
            log.userLogger.info('Compacting resources.db ');
            compacter.compact(vars.DB_BASE_PATH, log.userLogger, err => {
                if (err) {
                    log.userLogger.error('Compacting aborted due to error: ' + err.message);
                }
                callback(err);
            });
        },
        callback => {
            // load compacted resource.db
            log.userLogger.info('Loading compacted resources.db ');
            dbResources.use([], () => {
                dbResources.useAll(callback);
            });
        },
        // load indices into memory
        (callback) => {
            log.userLogger.info('Loading indices into memory...');
            async.eachSeries([dbResources, dbOverviews],
                (dbItem, callback) => {
                    dbItem.loadIndices(callback);
                }, callback);
        }], (err) => {
        if (!err) {
            log.userLogger.info('Success!');
        }
        callback(err);
    });
};

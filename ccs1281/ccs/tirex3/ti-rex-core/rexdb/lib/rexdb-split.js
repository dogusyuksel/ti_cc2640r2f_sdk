/**
 *
 * osohm, 7/12/2016
 */

'use strict';

var logger = require('../../lib/logger')();
var fse = require('fs-extra');
var path = require('path');
var async = require('async');

var rexdb = require('./rexdb');

var UNLOADED = 'UNLOADED';
var ALL = 'ALL';

const ReadWriteCheck = require('./readWriteCheck');
const rwcheck = new ReadWriteCheck('REXDB-SPLIT');
const READ = ReadWriteCheck.READ;
const WRITE = ReadWriteCheck.WRITE;
const DONT_RWCHECK = ReadWriteCheck.DONT_RWCHECK;

RexDBSplit.setThrowConcurrentWriteException = function (bool) {
    rwcheck.setThrowConcurrentWriteException(bool);
};

/**
 * Constructor
 * @param {String} dir to put the individual DB files (abs. path)
 * @constructor
 */
function RexDBSplit(dir) {
    // fields
    this.dir = dir;
    this.dbs = {};
    this.lastPackageUIdsToUse = [];
    this.hiddenPackageUIdsToUse = [];   // Metadata_2.1 : hidden H/W packages
    fse.ensureDirSync(dir);
}

module.exports = RexDBSplit; // object that's returned by a require call

/**
 *
 * @param {Array} packageUIdsToUse
 * @param callback
 */
RexDBSplit.prototype.using = function () {
    return this.lastPackageUIdsToUse;
};

/**
 *
 * @param {Array} packageUIdsToUse
 * @param callback(err, changes)
 */
RexDBSplit.prototype.use = function (packageUIdsToUse, callback) {
    logger.info('DB: use() called with ' + JSON.stringify(packageUIdsToUse));
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    this._use(packageUIdsToUse, false, (err, changes) => {
        rwcheck.exit(ACCESS_TYPE, callback, err, changes);
    });
};

/**
 *
 * @param {Array} packageUIdsToUse
 * @param callback(err, changes): true if changes occurred and call of use() would result in loading
 *   and/or unloading DBs
 */
RexDBSplit.prototype.useCheckOnly = function (packageUIdsToUse, callback) {
    this._use(packageUIdsToUse, true, callback);
};

/**
 *
 * @param {Array} packageUIdsToUse
 * @param callback (err, changes)
 * @private
 */
RexDBSplit.prototype._use = function (packageUIdsToUse, checkOnly, callback) {
    const that = this;
    let changes = false;
    this.lastPackageUIdsToUse = packageUIdsToUse;
    // unload packages: do in series since not performance sensitive and we want to be very conservative
    // with avoiding concurrent removes (even of separate rexdb instances)
    async.eachOfSeries(this.dbs, function (db, key, callback) {
        if (db != null && db !== UNLOADED) {
            if (packageUIdsToUse.indexOf(key) === -1 &&
                    that.hiddenPackageUIdsToUse.indexOf(key) === -1) {  // Metadata_2.1 : hidden H/W pacakges
                changes = true;
                if (!checkOnly) {
                    logger.info('DB: Unloading ' + key);
                    db.remove({}, function () {
                        that.dbs[key] = UNLOADED;
                        callback();
                    }, DONT_RWCHECK);
                    // DONT_CHECK: assume that all child DBs are accessed properly only through
                    // rexdb-split. This loosens R/W checking rules to allow access to other DBs
                    // (i.e. non rexdb-split DBs) to occur concurrently
                } else {
                    setImmediate(callback);
                }
            } else {
                setImmediate(callback);
            }
        } else {
            setImmediate(callback);
        }
    }, function () {
        // load packages
        // [ Metadata_2.1 : append hidden H/W pacakges
        for (const h of that.hiddenPackageUIdsToUse) {
            packageUIdsToUse.push(h);
        }

        // ]
        for (let i = 0; i < packageUIdsToUse.length; i++) {
            const packageUId = packageUIdsToUse[i];
            if (that.dbs[packageUId] == null || that.dbs[packageUId] === UNLOADED) {
                const dbFile = path.join(that.dir, packageUId);
                if (fse.existsSync(dbFile) === true) {
                    changes = true;
                    if (!checkOnly) {
                        logger.info('DB: Loading ' + packageUId);
                        that.dbs[packageUId] = new rexdb(dbFile);
                    }
                }
            }
        }
        if (!checkOnly) {
            logger.info('DB: status ' + JSON.stringify(that.dbs, function (key, value) {
                if (key !== '' && typeof value === 'object') {
                    return 'LOADED';
                }
                return value;
            }));
        }
        callback(null, changes);
    });
};

/**
 *
 * @param callback
 */
RexDBSplit.prototype.useAll = function (callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    logger.info('DB: useAll() called');
    this.lastPackageUIdsToUse = [ALL];
    var that = this;
    fse.readdir(this.dir, function(err, files) {
        if (err || files == null) {
            logger.info('DB: useAll() error: ', err);
            return rwcheck.exit(ACCESS_TYPE, callback, err);
        }
        for (var i = 0; i < files.length; i++) {
            if (path.extname(files[i]) !== '.index') {
                var packageUId = files[i];
                var dbFile = path.join(that.dir, packageUId);
                logger.info('DB: Loading ' + packageUId);
                that.dbs[packageUId] = new rexdb(dbFile);
            }
        }
        rwcheck.exit(ACCESS_TYPE, callback);
    });
};

/**
 *
 * @param callback
 */
RexDBSplit.prototype.loadIndices = function (callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    async.eachOf(this.dbs, function (db, key, callback) {
        if (db != null && db !== UNLOADED) {
            db.loadIndices(callback);
        } else {
            setImmediate(callback);
        }
    }, (err) => {
        rwcheck.exit(ACCESS_TYPE, callback, err);
    });
};

/**
 * Save the individual databases currently loaded in memory, then call use() to remove any packages
 * that might have been loaded during a previous insert/update/upsert
 * @param {Function} callback(err)
 */
RexDBSplit.prototype.save = function (callback) {
    const ACCESS_TYPE = WRITE; // not read because we call _use()
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    async.eachOf(this.dbs, function (db, key, callback) {
        if (db != null && db !== UNLOADED) {
            db.save(callback);
        } else {
            setImmediate(callback);
        }
    }, function (err) {
        if (that.lastPackageUIdsToUse[0] !== ALL) {
            that._use(that.lastPackageUIdsToUse, false, () => {
                rwcheck.exit(ACCESS_TYPE, callback);
            });
        } else {
            setImmediate(() => {
                rwcheck.exit(ACCESS_TYPE, callback);
            });
        }
    });
};

/**
 * Insert single document or array of documents.
 *
 * If a package DB is not loaded, it will be loaded.
 * If a package DB doesn't exist, it will be created
 *
 *  * _id field is optional; if present it will be indexed
 *
 * @param {Array} newDocs
 * @param {Function} callback
 */
RexDBSplit.prototype.insert = function (newDocs, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    setImmediate(() => {
        for (const doc of newDocs) {
            if (doc == null) {
                return callback('RexDBSplit.insert: doc is null/undefined');
            }
            if (doc.packageUId == null) {
                return callback('RexDBSplit.insert: doc.packageUId is null/undefined');
            }
            if (that.dbs[doc.packageUId] == null || that.dbs[doc.packageUId] === UNLOADED) {
                logger.info('RexDBSplit: insert(): creating new DB ' + doc.packageUId);
                that.dbs[doc.packageUId] = new rexdb(path.join(that.dir, doc.packageUId));
            }
            that.dbs[doc.packageUId]._insertSync(doc);
        }
        rwcheck.exit(ACCESS_TYPE, callback);
    });
};

/**
 * Update a single document
 *
 * If a package DB is not loaded, it will be loaded.
 * If a package DB doesn't exist, it will fail.
 *
 * @param {Object} query: only '_id' is supported
 * @param {Object} record: the updated record to put (the whole record is replaced with the updated record)
 * @param {Function} callback(err)
 */
RexDBSplit.prototype.update = function (query, record, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    setImmediate(function () {
        if (record == null) {
            return rwcheck.exit(ACCESS_TYPE, callback, 'RexDBSplit.update: record is null/undefined');
        }
        if (record.packageUId == null) {
            return rwcheck.exit(ACCESS_TYPE, callback, 'RexDBSplit.update: record.packageUId is null/undefined');
        }
        if (that.dbs[record.packageUId] == null) {
            return rwcheck.exit(ACCESS_TYPE, callback, 'RexDBSplit.update: ' + record.packageUId + ' doesn`t exist');
        }
        if (that.dbs[record.packageUId] === UNLOADED) {
            logger.info('RexDBSplit: update(): creating new DB ' + record.packageUId);
            that.dbs[record.packageUId] = new rexdb(path.join(that.dir, record.packageUId));
        }
        that.dbs[record.packageUId].update(query, record, (err) => {
            rwcheck.exit(ACCESS_TYPE, callback, err);
        });
    });
};

/**
 * Update or insert a single document
 *
 * If a package DB is not loaded, it will be loaded.
 * If a package DB doesn't exist, it will be created.
 *
 * @param {Object} query: only '_id' is supported
 * @param {Object} record: the updated record to put (the whole record is replaced with the updated record or a new one is created if none is found)
 * @param {Function} callback(err)
 */
RexDBSplit.prototype.upsert = function (query, record, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    setImmediate(function() {
        if (record == null) {
            return rwcheck.exit(ACCESS_TYPE, callback, 'RexDBSplit.upsert: record is null/undefined');
        }
        if (record.packageUId == null) {
            return rwcheck.exit(ACCESS_TYPE, callback, 'RexDBSplit.upsert: record.packageUId is null/undefined');
        }
        if (that.dbs[record.packageUId] == null || that.dbs[record.packageUId] === UNLOADED) {
            logger.info('RexDBSplit: upsert(): creating new DB ' + record.packageUId);
            that.dbs[record.packageUId] = new rexdb(path.join(that.dir, record.packageUId));
        }
        that.dbs[record.packageUId].upsert(query, record, (err) => {
            rwcheck.exit(ACCESS_TYPE, callback, err);
        });
    });
};

/**
 * Remove a SINGLE specified package or ALL packages
 * In the query either specify packageId/packageVersion or packageUId; or {} to remove all packages
 *
 * If a package DB is not loaded, it will NOT be loaded.
 *
 * @param {Object} query
 * @param {Function} callback
 * @api public
 */
RexDBSplit.prototype.remove = function (query, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    if (Object.keys(query).length !== 0) { // i.e. query is {}
        if ((query.packageId != null && query.packageVersion == null) ||
            (query.packageId == null && query.packageVersion != null) ||
            (query.packageId == null && query.packageVersion == null && query.packageUId == null)) {
            throw new Error('RexDBSplit: Remove only works with entire packages. Either speciy packageId/packageVersion or packageUId');
        }
    }
    if (Object.keys(query).length === 0) { // i.e. query is {}
        // remove ALL packages
        // remove all loaded packages from memory
        async.eachOf(this.dbs, function (db, key, callback) {
            if (db != null && db !== UNLOADED) {
                db.remove({}, callback);
            } else {
                callback();
            }
        }, function () {
            // now remove all DB files
            that.dbs = {};
            fse.emptyDir(that.dir, function (err) {
                rwcheck.exit(ACCESS_TYPE, callback, err);
            });
        });
    } else {
        // remove SINGLE package
        var packageUId;
        if (query.packageUId != null) {
            packageUId = query.packageUId;
        } else {
            packageUId = query.packageId + '__' + query.packageVersion;
        }
        // remove DB file and index file
        fse.unlink(path.join(that.dir, packageUId), function (err) {
            fse.unlink(path.join(that.dir, packageUId + '.index'), function(err) {
                if (that.dbs[packageUId] != null) {
                    // remove from memory if loaded
                    if (that.dbs[packageUId] !== UNLOADED) {
                        that.dbs[packageUId].remove({}, function () {
                            delete that.dbs[packageUId];
                            rwcheck.exit(ACCESS_TYPE, callback, err);
                        });
                    } else {
                        delete that.dbs[packageUId];
                        rwcheck.exit(ACCESS_TYPE, callback, err);
                    }
                } else {
                    setImmediate(() => {
                        rwcheck.exit(ACCESS_TYPE, callback);
                    });
                }
            });
        });
    }
};

/**
 *
 * @param {Object} query
 * @param {Boolean} findOne
 * @param {Function} callback(err, Array:results)
 * @api private
 */
RexDBSplit.prototype._findInCache = function (query, findOne, callback) {
    var allResults = [];
    async.eachOf(this.dbs, function (db, key, callback) {
        if (db != null && db !== UNLOADED) {
            const andFilter = rexdb.convertToAndFilter(query);

            const andFilterNoPackageUId = [];
            const packageList = [];
            for (const filter of andFilter) {
                if (filter.packageUId) {
                    const packages = filter.packageUId.$in ? filter.packageUId.$in : [filter.packageUId];
                    for (const p of packages) {
                        packageList.push(p);
                    }
                } else {
                    andFilterNoPackageUId.push(filter);
                }
            }

            if (packageList.length > 0 && packageList.indexOf(db.dbName) < 0) {
                // not in the package list, skip
                return setImmediate(callback);
            }

            db._findInCache({ $and: andFilterNoPackageUId }, findOne, function(err, result) {
                if (err == null && result != null && result.length > 0) {
                    for (const r of result) {
                        allResults.push(r);
                    }
                    if (findOne === true) {
                        return callback('earlyexit');
                    }
                }
                callback(err);
            });
        } else {
            setImmediate(callback);
        }
    }, function (err) {
        if (err === 'earlyexit') {
            err = null;
        }
        setImmediate(callback, err, allResults);
    });
};

/**
 *
 * @param {Object} query
 * @param {Function} callback(err, Array:results)
 * @api public
 */
RexDBSplit.prototype.find = function (query, callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    this._findInCache(query, false, function(err, results) {
        rwcheck.exit(ACCESS_TYPE, callback, err, that.deepCopy(results));

    });
};

/**
 * Faster and less memory intensive find() avoiding the deep copy
 * The results cannot be modified, if attempted a freeze exception is thrown
 *
 * @param {Object} query
 * @param {Function} callback(err, Array:results)
 * @api public
 */
RexDBSplit.prototype.findNoDeepCopy = function(query, callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    this._findInCache(query, false, function(err, results) {
        rwcheck.exit(ACCESS_TYPE, callback, err, results == null ? null : Object.freeze(results));

    });
};

/**
 *
 * @param {Object} query
 * @param {Function} callback(err, Object: result)
 * @api public
 */
RexDBSplit.prototype.findOne = function (query, callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    var that = this;
    this._findInCache(query, true, function(err, results) {
        if (results.length === 0) {
            rwcheck.exit(ACCESS_TYPE, callback, err, null);
        } else {
            rwcheck.exit(ACCESS_TYPE, callback, err, that.deepCopy(results[0]));
        }
    });
};

/**
 * Based on http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
 * Note: it doesn't copy functions, Date and Regex's
 * @param obj
 * @returns {*}
 */
RexDBSplit.prototype.deepCopy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

// [ Metadata_2.1 : hidden H/W pacakges
/**
 *
 */
RexDBSplit.prototype.usingHidden = function() {
    return this.hiddenPackageUIdsToUse;
};

/**
 *
 * @param {Array} packageUIdsToUse
 */
RexDBSplit.prototype.useHidden = function (packageUIdsToUse) {
    if (packageUIdsToUse == null) {
        packageUIdsToUse = [];
    }
    this.hiddenPackageUIdsToUse = packageUIdsToUse;
};
// ]

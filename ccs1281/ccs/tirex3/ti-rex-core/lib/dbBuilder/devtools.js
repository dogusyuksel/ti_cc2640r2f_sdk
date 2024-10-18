/**
 *
 * Devtool Database schema
 * ======================
 * @property {String} name (mandatory)
 * @property {String} description
 * @property {String} descriptionLocation: path to html file containing description
 * @property {String} image
 * @property {Array} devices: list of devices that can be used with this devtool
 * @property {Array} connections: list of names of the connection XML files, as it appears in the
 *                   <ccs>\ccsv6\ccs_base\common\targetdb\connections\ directory. The first entry
 *                   will be used as the default.
 * @property {Array} energiaBoards
 *      @property {String} id
 *      @property {String} description
 */

const fs = require('fs');
const path = require('path');
const async = require('async');

const vars = require('../vars');
const idHelper = require('./idHelper');
const preproc = require('./preproc');
const utils = require('./dbBuilderUtils');
const devices = require('./devices');

const loggerDevtools = {
    log() {
    },
};


/**
 * Clear log
 */
exports.clearLog = function () {

};

/**
 * Refresh devtools database - IMPORTANT: Any main files MUST BE parsed FIRST, followed by the aux
 * files.
 *
 * @param mainOrAux: main devtool tree files add new records whereas aux files only can update
 * existing records with new fields.
 *  Aux files restrictions:
 *      - an aux file cannot add records
 *      - an aux file cannot contain fields that are already specified in another main or aux json
 *        file.
 *  Any entry and/or field that doesn’t conform will be rejected.
 * @param packagePath
 * @param dbDevtools - the dev tools database.
 * @param callback(err, logFile)
 * @param dbDevices
 * @param packageMacros
 * @param log
 */
exports.refresh = function (mainOrAux, packagePath, dbDevtools, dbDevices, packageMacros, log,
                            callback) {
    loggerDevtools.log = (type, message) => {
        if (type === 'debug') {
            return;
        }
        if (log.userLogger[type]) {
            log.userLogger[type](message);
        } else {
            log.userLogger.info(message);
        }
    };

    vars.getMetadataDir(packagePath, function (metadataDir) {
        utils.getPackageMetadata(packagePath, metadataDir, packageMacros, loggerDevtools,
            function (err, vID, metadata) {
                if (err || !metadata) {
                    return callback(err); // abort refresh for all packages
                }
                if (metadata.type !== vars.META_2_1_TOP_CATEGORY.devtools.id) {
                    return callback(null);
                }
                const devtoolsFileName = (mainOrAux === 'main') ? 'devtools.tirex.json' : 'devtools-aux.tirex.json';
                const devtoolsFile = path.join(
                    vars.CONTENT_BASE_PATH, packagePath, metadataDir, devtoolsFileName);
                preproc.processFile(devtoolsFile, packageMacros, loggerDevtools, (err, preprocResult) => {
                    if (err || !preprocResult) {
                        return callback(err); // abort refresh for all packages
                    }
                    exports._process(devtoolsFile, preprocResult.records, packagePath, metadataDir,
                        dbDevtools, dbDevices, mainOrAux, vID, callback);
                });
            });
    });
};

exports._process = function (devtoolsFile, devtoolList, packagePath, metadataDir, dbDevtools,
                             dbDevices, mainOrAux, header, callback) {
    async.eachSeries(devtoolList, function (devtoolRecord, callback) {
        if (mainOrAux === 'main') {
            devtoolRecord.packageVersion = header.packageVersion;
            devtoolRecord._id = idHelper.createUuid(devtoolRecord).idVal;
            devtoolRecord.packageId = header.packageId;
            devtoolRecord.packageUId = header.packageId + vars.PACKAGE_ID_VERSION_DELIMITER
                + header.packageVersion;
        }

        if (devtoolRecord.id == null) {
            loggerDevtools.log('critical', `Devtool has no id field: ${JSON.stringify(devtoolRecord)}`);
            return setImmediate(callback, 'Aborting due to error'); // TODO: make messages consistent
        }
        if (devtoolRecord.name == null && mainOrAux === 'main') {
            loggerDevtools.log('warning', `No devtool name specified, using id instead: ${JSON.stringify(devtoolRecord)}`);
            devtoolRecord.name = devtoolRecord.id;
        }

        // prefix image path or remove if file doesn't exist (UI should display a default image in this
        // case)
        if ('image' in devtoolRecord) {
            devtoolRecord.image = path.join(packagePath, metadataDir, devtoolRecord.image);
            if (fs.existsSync(path.join(vars.CONTENT_BASE_PATH, devtoolRecord.image)) === false) {
                loggerDevtools.log('error', `File not found. Skipping property 'image'. File: ${devtoolRecord.descriptionLocation}`);
                delete devtoolRecord.image;
            }
        }
        // prefix descriptionLocation or remove if file doesn't exist
        if ('descriptionLocation' in devtoolRecord) {
            devtoolRecord.descriptionLocation = path.join(packagePath, metadataDir,
                devtoolRecord.descriptionLocation);
            if (fs.existsSync(path.join(
                    vars.CONTENT_BASE_PATH, devtoolRecord.descriptionLocation)) === false) {
                loggerDevtools.log('error', `File not found. Skipping property 'descriptionLocation'. File: ${devtoolRecord.descriptionLocation}`);
                delete devtoolRecord.descriptionLocation;
            }
        }

        async.series([
            (callback) => {
                // look up device names based on IDs
                if (devtoolRecord.devices != null) {
                    devices.getNames(dbDevices, devtoolRecord.devices, (err, deviceNames) => {
                        devtoolRecord.devices = deviceNames;
                        callback(err);
                    });
                } else {
                    setImmediate(callback);
                }
            },
            (callback) => {
                // expand family/subfamily/etc in 'devices' into its variants (leafs) and
                // move family/subfamily/etc out into 'devicesAncestors'
                if (devtoolRecord.devices != null) {
                    devtoolRecord.devicesVariants = [];
                    async.each(devtoolRecord.devices, function (deviceName, callback) {
                        utils.expandDevices(dbDevices, devtoolRecord, deviceName, loggerDevtools, callback);
                    }, err => {
                        devtoolRecord.devices = devtoolRecord.devicesVariants;
                        delete devtoolRecord.devicesVariants;
                        delete devtoolRecord.devicesAncestors;
                        setImmediate(callback, err);
                    });
                } else {
                    setImmediate(callback);
                }
            },
            (callback) => {
                // check if there's an existing record for this devtool
                dbDevtools.findOne({
                    id: devtoolRecord.id,
                }, function (err, existingDevtoolRecord) {
                    if (err) {
                        loggerDevtools.log('critical', `An error with inserting a devtool record has occurred: ${JSON.stringify(err)}`);
                        return callback(err);
                    }
                    // process main devtool tree files
                    if (mainOrAux === 'main') {
                        if (existingDevtoolRecord != null) {
                            loggerDevtools.log('critical', `A main tree file cannot override existing records. Skipping record, offending record: ${JSON.stringify(devtoolRecord)}`);
                            return callback(err);
                        }
                        // add to database
                        dbDevtools.insert(devtoolRecord, function (err, result) {
                            if (err) {
                                loggerDevtools.log('critical', `An error with inserting a devtool record has occurred: ${JSON.stringify(err)}`);
                            } else {
                                loggerDevtools.log('debug', `Inserted: ${JSON.stringify(result)}`);
                            }
                            callback(err);
                        });
                    } else if (mainOrAux === 'aux') {
                        // process auxiliary devtool tree files
                        if (existingDevtoolRecord == null) {
                            loggerDevtools.log('critical', `An aux tree file cannot add new records. Skipping record. File: ${devtoolsFile}, offending record: ${JSON.stringify(devtoolRecord)}`);
                            return callback(err);
                        }
                        // add the new properties from the aux file; only property 'energiaBoards' is allowed
                        // to not pollute/corrupt the global product tree
                        Object.keys(devtoolRecord).forEach((newProp) => {
                            if (newProp !== 'id') { // id needs to be in aux, but is never copied over
                                if (existingDevtoolRecord[newProp] != null) {
                                    loggerDevtools.log('error', `An aux file cannot override existing properties. Skipping property. File: ${devtoolsFile}, record: ${JSON.stringify(devtoolRecord)}, offending property: ${newProp}`);
                                } else if (newProp !== 'energiaBoards') {
                                    loggerDevtools.log('error', `An aux file can only add the property 'energiaBoards'. Skipping property. File: ${devtoolsFile}, record: ${JSON.stringify(devtoolRecord)}, offending property: ${newProp}`);
                                } else {
                                    existingDevtoolRecord[newProp] = devtoolRecord[newProp];
                                }
                            }
                        });

                        // update database
                        dbDevtools.update({ _id: existingDevtoolRecord._id }, existingDevtoolRecord, (err) => {
                            if (err) {
                                loggerDevtools.log('critical', `An error with updating a devtool record has occurred: ${JSON.stringify(err)}`);
                            }
                            callback(err);
                        });
                    } else {
                        loggerDevtools.log('critical', `devtool file must be either main or aux. Not recognized: ${mainOrAux}`);
                        return callback(err);
                    }
                });
            }], callback);
    }, (err) => {
        loggerDevtools.log('info', 'Created devtool database');
        setImmediate(callback, err);
    });
};

/**
 *
 * @param dbDevtools
 * @param devtoolIds
 * @param callback(err, devtoolNames)
 */
exports.getNames = function (dbDevtool, devtoolIds, callback) {
    dbDevtool.find({ id: { $in: devtoolIds } }, function (err, devtools) {
        if (err) {
            loggerDevtools.log('critical', `Query error: ${JSON.stringify(err)}`);
            return callback(err);
        }
        if (devtools == null) {
            return callback(null, null);
        }
        const devtoolNames = [];
        for (let i = 0; i < devtools.length; i++) {
            devtoolNames.push(devtools[i].name);
        }
        callback(null, devtoolNames);
    });
};

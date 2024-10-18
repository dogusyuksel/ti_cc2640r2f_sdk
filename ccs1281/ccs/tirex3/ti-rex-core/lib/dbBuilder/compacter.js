
'use strict';

const path = require('path');
const fs = require('fs-extra');
const JSONStream = require('JSONStream');
const async = require('async');
const jsonStableStringify = require('json-stable-stringify');

const fsutils = require('../localserver/fsutils');
const utils = require('./dbBuilderUtils');

if (require.main === module) {
    const dbPath = process.argv[2];
    if (!dbPath) {
        console.log('Must specify path to db folder.');
    } else {
        compact(dbPath, null, err => {
            if (err) {
                console.error(err)
            } else {
                console.log('Done');
            }
        });
    }
}

function log(logger, logMsg) {
    if (logger) {
        logger.info(logMsg);
    } else {
        console.log(logMsg);
    }
}

exports.compact = compact;

/**
 *
 * @param dbPath
 * @param logger
 * @param callback
 */
function compact(dbPath, logger, callback) {
    const resourceDbDir = path.join(dbPath, 'resources.db');
    const resourceDbFullDir = path.join(dbPath, 'resources_full.db');
    const regexNotIndex = /^((?!index).)*$/;

    async.series([
        callback => {
            // move db files to another dir before compacting them
            fs.emptyDirSync(resourceDbFullDir);
            const resourceDbFiles = fsutils.readDirRecursive(resourceDbDir, regexNotIndex, 1);
            async.each(resourceDbFiles, (file, callback) => {
                fs.move(path.join(resourceDbDir, file), path.join(resourceDbFullDir, file),
                    { clobber: true }, callback);
            }, callback);
        },
        callback => {
            // compact resources_full.db/xxx -> resources.db/xxx
            const resourceDbFullFiles = fsutils.readDirRecursive(resourceDbFullDir, regexNotIndex, 1);
            async.eachSeries(resourceDbFullFiles,
                (file, callback) => {
                    log(logger, 'Compacting DB for ' + file);
                    const compactDBArray = [];
                    fs.createReadStream(path.join(resourceDbFullDir, file)) // read from full DB
                        .pipe(JSONStream.parse('$*'))
                        .on('data', ({value: record}) => {
                            compactRecord(record);
                            compactDBArray.push(record);
                        })
                        .on('close', () => {
                            writeStreamDB(path.join(resourceDbDir, file), compactDBArray, callback);
                        })
                        .on('error', (err) => {
                            callback(err);
                        });
                }, callback);
        }
    ], callback);
}

function compactRecord(record) {
    // fields that can be removed now since they were indexed
    delete record.compiler;
    delete record.kernel;

    // fields that are needed for importable resources only
    if (!utils.isImportableResource(record)) {
        // Workaround for REX-2566 (Unable to import projects from CCS ReX if the board/device filter is enabled (Desktop))
        // Better solution: keep those 2 fields removed and start using filter/search index on desktop
        // delete record.devtools;
        // delete record.devices;
        delete record.devicesVariants;
        delete record.coreTypes;
    }
}

function writeStreamDB(file, documents, callback) {
    const ws = fs.createWriteStream(file)
        .on('open', function () {
                ws.write('[\n');
                async.forEachOfSeries(documents, function (document, index, callback) {
                    setImmediate(function () {
                        const isDrained = ws.write(jsonStableStringify(document, {space: 1}));
                        if (index < documents.length - 1) {
                            ws.write(',');
                        }
                        if (isDrained === true) {
                            callback();
                        } else {
                            ws.once('drain', callback);
                        }
                    });
                }, function () {
                    ws.end('\n]', function () {
                        callback();
                    });
                });
            }
        );
}

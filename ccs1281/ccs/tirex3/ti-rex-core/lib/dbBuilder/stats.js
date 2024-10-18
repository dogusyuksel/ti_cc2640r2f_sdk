
'use strict';

const path = require('path');
const fs = require('fs');
const fsutils = require('../localserver/fsutils');
const sizeof = require('object-sizeof');
const JSONStream = require('JSONStream');
const async = require('async');

if (require.main === module) {
    const dbPath = process.argv[2];
    if (!dbPath) {
        console.log('Must specify path to db folder.');
    } else {
        stats(dbPath, null, (fieldStats, err) => {
            if (err) {
                console.error(err)
            } else {
                console.log(fieldStats);
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

/**
 * Calculates total occurrence count and size of each field (including key and value) in the specified JSON DB
 *
 * @param dbPath
 * @param logger
 * @param callback (fieldStats: {fieldName: { size, count } }, error)
 */
function stats(dbPath, logger, callback) {
    const resourceDbDir = path.join(dbPath, 'resources.db');
    const regexNotIndex = /^((?!index).)*$/; // exclude the indices
    const resourceDbFiles = fsutils.readDirRecursive(resourceDbDir, regexNotIndex, 1);
    const dbFilePaths = resourceDbFiles.map(file => path.join(resourceDbDir, file));
    // dbFilePaths.push(path.join(dbPath, 'overviews.db'));
    const fieldStats = {};

    async.eachSeries(dbFilePaths,
        (dbFilePath, callback) => {
            log(logger, 'Calculating field sizes for ' + path.basename(dbFilePath));
            // const jsonArray = fse.readJsonSync(dbFilePath);
            fs.createReadStream(dbFilePath)
                .pipe(JSONStream.parse('$*'))
                .on('data', ({ value: record }) => {
                    if (record) {
                        for (const field of Object.keys(record)) {
                            if (!fieldStats[field]) {
                                fieldStats[field] = { size: 0, count: 0 };
                            }
                            fieldStats[field].size += (sizeof(record[field]) + sizeof(field)) / 1024 / 1024; // MB
                            fieldStats[field].count++;
                        }
                    }
                })
                .on('close', () => {
                    callback();
                })
                .on('error', (err) => {
                    callback(err);
                });
        }, err => {
            callback(fieldStats, err);
        });
}

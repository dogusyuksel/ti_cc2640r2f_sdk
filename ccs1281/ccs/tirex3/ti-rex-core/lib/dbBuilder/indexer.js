
'use strict';

const path = require('path');
const fs = require('fs-extra');
const fsutils = require('../localserver/fsutils');
const JSONStream = require('JSONStream');
const async = require('async');
const jsonStableStringify = require('json-stable-stringify');

const tokenizer = require('../../rexdb/lib/rexdb').tokenizer;

const MINIMUM_STRING_LENGTH = 3;
const MAXIMUM_STRING_LENGTH = 30;

const FILTER_TYPE_DEVICE = 'devices';
const FILTER_TYPE_DEVTOOL = 'devtools';
const FILTER_TYPE_PACKAGEUID = 'packageUId';
const FILTER_TYPE_FULLPATHS = 'fullPaths';
const FILTER_TYPES = [FILTER_TYPE_DEVICE, FILTER_TYPE_DEVTOOL, FILTER_TYPE_PACKAGEUID,
    FILTER_TYPE_FULLPATHS];
const SEARCH_TYPE = 'search';

if (require.main === module) {
    const dbPath = process.argv[2];
    if (!dbPath) {
        console.log('Must specify path to db folder.');
    } else {
        index(dbPath, null, err => {
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

exports.index = index;

/**
 *
 * @param dbPath
 * @param logger
 * @param callback
 */
function index(dbPath, logger, callback) {
    const resourceDbDir = path.join(dbPath, 'resources.db');
    const regexNotIndex = /^((?!index).)*$/;
    const resourceDbFiles = fsutils.readDirRecursive(resourceDbDir, regexNotIndex, 1);
    const dbFilePaths = resourceDbFiles.map(file => path.join(resourceDbDir, file));
    dbFilePaths.push(path.join(dbPath, 'overviews.db'));
    async.eachSeries(dbFilePaths,
        (dbFilePath, callback) => {
            log(logger, 'Forming filter and search indices for ' + path.basename(dbFilePath));
            const filterIndex = {};
            const searchIndex = {};
            fs.createReadStream(dbFilePath)
                .pipe(JSONStream.parse('$*'))
                .on('data', ({ value: record, key: recordIndex }) => {
                    for (const filterIndexType of FILTER_TYPES) {
                        addRecordToIndex(record, recordIndex, filterIndexType, filterIndex);
                    }
                    addRecordToIndex(record, recordIndex, SEARCH_TYPE, searchIndex);
                })
                .on('close', () => {
                    writeIndex(dbFilePath + '.filter.index', filterIndex);
                    writeIndex(dbFilePath + '.search.index', searchIndex);
                    callback();
                })
                .on('error', (err) => {
                    callback(err);
                });
        }, callback);
}

function writeIndex(filename, index) {
    fs.writeFileSync(
        filename,
        jsonStableStringify(index, {
            space: 0, cmp: (a, b) => {
                return a.key < b.key ? -1 : 1; // sort ascending
            }
        })
    );
}

/**
 *
 * @param jsonArray
 * @param type: search, device, devtool, packageUid, fullPaths
 * @param indexTable
 * @returns word to resource index map
 */
function addRecordToIndex(record, recordIndex, type, indexTable) {
    let words = [];

    if (type === FILTER_TYPE_PACKAGEUID && record.packageUId) {
        words = words.concat(record.packageUId);
    }

    if (type === FILTER_TYPE_FULLPATHS && record.fullPaths) {
        for (let c = 0; c < record.fullPaths.length; c++) {
            words = words.concat(record.fullPaths[c]);
        }
    }

    if (type === FILTER_TYPE_DEVTOOL && record.devtools) {
        words = words.concat(record.devtools);
    }

    if (type === FILTER_TYPE_DEVICE && record.devices) {
        words = words.concat(record.devices);
    }

    if (type === SEARCH_TYPE) {
        if (record.fullPaths) {
            for (const fullPath of record.fullPaths) {
                words = words.concat(tokenizeArray(fullPath));
            }
        }

        if (record.devtools) {
            words = words.concat(tokenizeArray(record.devtools));
        }

        if (record.devices) {
            words = words.concat(tokenizeArray(record.devices));
        }

        if (record.coreTypes) {
            words = words.concat(tokenizeArray(record.coreTypes));
        }

        if (record.tags) {
            words = words.concat(tokenizeArray(record.tags));
        }

        if (record.compiler) {
            words = words.concat(tokenizeArray(record.compiler));
        }

        if (record.kernel) {
            words = words.concat(tokenizeArray(record.kernel));
        }

        if (record.description) {
            words = words.concat(record.description.split(tokenizer));
        }

        if (record.name) {
            words = words.concat(record.name.split(tokenizer));
        }
    }

    const uniqueWords = {};

    for (const _word of words) {
        if (typeof _word !== 'string') {
            continue;
        }
        let word;
        if (type === SEARCH_TYPE) {
            word = _word.toLowerCase();
            if (word.charAt(0) === '.') {
                word = word.substr(1);
            }
            if (word.length < MINIMUM_STRING_LENGTH) {
                continue;
            } else if (word.length > MAXIMUM_STRING_LENGTH) {
                continue;
            } else if (word.search(/.*\w.*/) === -1) {
                continue;
            }
        } else {
            word = _word;
        }
        uniqueWords[word] = true;
    }

    for (const word of Object.keys(uniqueWords)) {
        if (!indexTable[type]) {
            indexTable[type] = {};
        }
        if (!indexTable[type][word]) {
            indexTable[type][word] = [];
        }
        indexTable[type][word].push(recordIndex);
    }
}

function tokenizeArray(array) {
    const tokens = [].concat(...array.map(v => v.split ? v.split(tokenizer) : []));
    return tokens;
}

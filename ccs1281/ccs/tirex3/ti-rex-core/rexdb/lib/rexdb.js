/**
 * rexdb - small in-memory database with file system persistence and optional query cache
 * Always returns a deep copy of documents
 *
 * Note: CACHING IS TURNED OFF
 *
 * APIs are similar to MongoDB
 *
 * osohm, 7/21/2014
 */

'use strict';

const logger = require('../../lib/logger')();
const fs = require('fs');
const path = require('path');
const lruCache = require('lru-cache');
const jsonStableStringify = require('json-stable-stringify');
const async = require('async');

const fse5 = require('fs-extra'); // fs-extra 5.0.0 from unmanaged private node_modules folder in rexdb

const ReadWriteCheck = require('./readWriteCheck');
const rwcheck = new ReadWriteCheck('REXDB');
const READ = ReadWriteCheck.READ;
const WRITE = ReadWriteCheck.WRITE;

RexDB.setThrowConcurrentWriteException = function (bool) {
    rwcheck.setThrowConcurrentWriteException(bool);
};

const BACKUP_INPROGRESS = '_backup_inprogress';
const BACKUP_VALID = '_backup_valid';
const BACKUP_DELETE = '_backup_delete';

/**
 * Call before any sequence of db.save() calls to protect DB files from corruption due
 * to process termination during the save operation
 *
 * Only one valid backup can be active at any given time
 *
 * @param dbPath
 */
RexDB.makeBackup = function (dbPath) {
    // try {
    //     if (fse5.existsSync(dbPath + BACKUP_VALID)) {
    //         throw new Error('A valid backup is already active!');
    //     }
    //
    //     // try to clean up old folders again...
    //     RexDB._removeTmpBackups(dbPath);
    //
    //     // first mark the folder as 'in progress' so that if we crash in here we know the backup is no good
    //     fse5.emptyDirSync(dbPath + BACKUP_INPROGRESS);
    //     fse5.copySync(dbPath, dbPath + BACKUP_INPROGRESS);
    //     fse5.renameSync(dbPath + BACKUP_INPROGRESS, dbPath + BACKUP_VALID);
    // } catch (err) {
    //     err.message = 'Error while making DB backup: ' + err.message;
    //     throw new Error(err);
    // }
};

/**
 * Call after any sequence of successful db.save() calls
 *
 * @param dbPath
 */
RexDB.removeBackup = function (dbPath) {
    // try {
    //     // first mark the folder as 'to be deleted' so that if we crash in here we know the backup is no good
    //     fse5.renameSync(dbPath + BACKUP_VALID, dbPath + BACKUP_DELETE);
    //     RexDB._removeTmpBackups(dbPath);
    // } catch (err) {
    //     // not fatal at this point, makeBackup will throw if it still can't remove the tmp folders
    //     logger.error('Error while removing DB backup: ' + err.message);
    // }
};

/**
 * Call at server startup before DB files are being read
 *
 * @param dbPath
 */
RexDB.restoreFromBackup = function (dbPath) {
    // // first get rid of any invalid back up folders
    // try {
    //     RexDB._removeTmpBackups(dbPath);
    // } catch (err) {
    //     // not fatal at this point, makeBackup will throw if it still can't remove the tmp folders
    //     logger.error('Error while restoring corrupted DB from backup: Unable to remove old backup: ' + err.message);
    // }
    //
    // // if a valid backup exists, make it the current DB
    // try {
    //     if (fse5.existsSync(dbPath + BACKUP_VALID)) {
    //         fse5.renameSync(dbPath, dbPath + BACKUP_DELETE);
    //         fse5.renameSync(dbPath + BACKUP_VALID, dbPath);
    //     }
    // } catch (err) {
    //     err.message = 'Error while restoring corrupted DB from backup: ' + err.message;
    //     throw new Error(err);
    // }
    //
    // // now delete the old DB
    // try {
    //     RexDB._removeTmpBackups(dbPath);
    // } catch (err) {
    //     // not fatal at this point, makeBackup will throw if it still can't remove the tmp folders
    //     logger.error('DB restored from backup but unable to remove old DB: ' + err.message);
    // }
};

RexDB._removeTmpBackups = function (dbPath) {
    if (fse5.existsSync(dbPath + BACKUP_DELETE)) {
        fse5.removeSync(dbPath + BACKUP_DELETE);
    }
    if (fse5.existsSync(dbPath + BACKUP_INPROGRESS)) {
        fse5.removeSync(dbPath + BACKUP_INPROGRESS);
    }
};

/**
 * Constructor
 * @param {String} file name - if null then this is new a in-memory database
 * @constructor
 */
function RexDB(file) {
    // fields
    this.useCache = false; // CACHING IS TURNED OFF
    this.file = file;
    this.dbName = this.file ? path.basename(this.file) : '';
    this.documents = [];
    this.indices = { _id: {} };
    // caches the references, not the documents themselves
    this.cache = lruCache({
        max: (2 * 1024 * 1024) / 8,
        /* 2 MB / 8 bytes = ~ 260k documents (memory requirement is assuming the size of an object
        ref is 64 bits...) */
        length(n) {
            if (n && n.length) {
                return n.length;
            } 
                return 1;
        },
        dispose(key, n) {
            logger.tracefiner('rexdb ' + this.dbName + ' cache disposing:' + key);
        }
    });

    if (file != null) {
        try {
            let data = fs.readFileSync(file, 'utf8');
            this.documents = JSON.parse(data);
            data = fs.readFileSync(file + '.index', 'utf8');
            this.indices = JSON.parse(data);
        } catch (err) {
            // ignore
            logger.tracefiner(err);
        }

        loadIndices(file, this.indices);
    }
}

function loadIndices(file, indices) {
    try {
        const data = fs.readFileSync(file + '.filter.index', 'utf8');
        const filterIndex = JSON.parse(data);
        for (const key of Object.keys(filterIndex)) {
            indices[key] = filterIndex[key];
        }
    } catch (err) {
        // ignore
        logger.tracefiner(err);
    }

    try {
        const data = fs.readFileSync(file + '.search.index', 'utf8');
        const searchIndex = JSON.parse(data);
        indices.search = searchIndex.search;
    } catch (err) {
        // ignore
        logger.tracefiner(err);
    }
}

module.exports = RexDB; // object that's returned by a require call

RexDB.tokenizer = /[ ,;:\n\t\r<>%(){}#!"&$/*+|~?'\\\[\]]/;

RexDB.prototype._setIndices = function (indices) {
    this.indices = indices;
};

/**
 *
 * @param callback
 */
RexDB.prototype.loadIndices = function (callback) {
    setImmediate(() => {
        loadIndices(this.file, this.indices);
        callback();
    });
};

/**
 * Save the database to the file
 * @param {Function} callback(err)
 */
RexDB.prototype.save = function (callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    const that = this;
    if (this.file == null) {
        throw new Error('Cannot save. Database is in-memory only');
    }
    // avoid creating one huge string here that may result in memory allocation failure
    // instead write record by record and importantly allow to drain before writing more data
    const ws = fs.createWriteStream(this.file)
        .on('open', function () {
            ws.write('[\n');
            async.forEachOfSeries(that.documents, function (document, index, callback) {
                setImmediate(function () {
                    const isDrained = ws.write(jsonStableStringify(document, {space: 2}));
                    if (index < that.documents.length - 1) {
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
                    fs.writeFile(that.file + '.index', JSON.stringify(that.indices), 'utf8',
                        (err) => {
                            rwcheck.exit(ACCESS_TYPE, callback, err);
                        });
                });
            });
        }
    );
};

/**
 * Insert single document or array of document
 *
 *  * _id field is optional; if present it will be indexed
 *
 * @param {Array} newDocs
 * @param {Function} callback
 */
RexDB.prototype.insert = function (newDocs, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    // simulate async
    const that = this; // see http://stackoverflow.com/questions/346015/javascript-closures-and-this-context
    setImmediate(function () {
        that._insertSync(newDocs);
        rwcheck.exit(ACCESS_TYPE, callback, null, that.documents);
    });
};

/**
 * Update a single document
 * @param {Object} query: only '_id' is supported
 * @param {Object} update: the updated record to put (the whole record is replaced with the updated
 * record)
 * @param {Function} callback(err)
 */
RexDB.prototype.update = function (query, update, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    // simulate async
    const that = this; // see http://stackoverflow.com/questions/346015/javascript-closures-and-this-context
    setImmediate(function () {
        let i;
        if (query._id == null) {
            rwcheck.exit(ACCESS_TYPE, callback, { message: '_id field required' });
        } else if ((i = that.indices._id[query._id]) == null) {
            rwcheck.exit(ACCESS_TYPE, callback, { message: '_id ' + query._id + ' does not exist', notexist: true });
        } else {
            update._id = query._id; // make sure they stay in sync...
            that.documents[i] = update;
            that.cache.reset();
            rwcheck.exit(ACCESS_TYPE, callback);
        }
    });
};

/**
 * Update or insert a single document
 * @param {Object} query: only '_id' is supported
 * @param {Object} update: the updated record to put (the whole record is replaced with the updated
 * record or a new one is created if none is found)
 * @param {Function} callback(err)
 */
RexDB.prototype.upsert = function (query, update, callback) {
    const ACCESS_TYPE = WRITE;
    rwcheck.entry(ACCESS_TYPE);
    // simulate async
    const that = this; // see http://stackoverflow.com/questions/346015/javascript-closures-and-this-context
    setImmediate(function () {
        let i;
        if (query._id == null) {
            rwcheck.exit(ACCESS_TYPE, callback, { message: '_id field required' });
        } else if ((i = that.indices._id[query._id]) == null) {
            that._insertSync(update);
            rwcheck.exit(ACCESS_TYPE, callback, null, that.documents);
        } else {
            update._id = query._id; // make sure they stay in sync...
            that.documents[i] = update;
            that.cache.reset();
            rwcheck.exit(ACCESS_TYPE, callback);
        }
    });
};

/**
 * Insert single document or array of document (synchronous)
 *
 * _id field is optional; if present it will be indexed
 *
 * @param {Array} newDocs
 * @private
 */
RexDB.prototype._insertSync = function (newDocs) {
    if (Array.isArray(newDocs)) {
        for (let i = 0; i < newDocs.length; i++) {
            if (newDocs[i]._id != null) {
                if (this.indices._id[newDocs[i]._id] != null) {
                    logger.warn('rexdb insert: _id already exists: ' + newDocs[i]._id + '(' + newDocs[i].name + '). Skipping.');
                    continue;
                }
                this.indices._id[newDocs[i]._id] = this.documents.length;
            }
            this.documents.push(newDocs[i]);
        }
    } else {
        if (newDocs._id != null) {
            if (this.indices._id[newDocs._id] != null) {
                logger.warn('rexdb insert: _id already exists: ' + newDocs._id + '(' + newDocs.name + '). Skipping.');
                return;
            }
            this.indices._id[newDocs._id] = this.documents.length;
        }
        this.documents.push(newDocs);
    }
    this.cache.reset();
};

/**
 * Insert or skip single document or array of document (synchronous)
 *
 * _id field is mandatory
 *
 * @param {Array} newDocs
 * @private
 */
RexDB.prototype._insertOrSkipSync = function (newDocs) {
    if (Array.isArray(newDocs)) {
        for (let i = 0; i < newDocs.length; i++) {
            insertOne.call(this, newDocs[i]);
        }
    } else {
        insertOne.call(this, newDocs);
    }
    this.cache.reset();

    function insertOne(newDoc) {
        if (!newDoc._id) {
            // only work with element with ID
            return;
        }
        const _e = this.indices._id[newDoc._id];
        if (_e != null) {
            // skip
            return;
        }
        
            this.indices._id[newDoc._id] = this.documents.length;
            this.documents.push(newDoc);
    }
};

/**
 * Always removes documents matching the query
 * @param {Object} query: {} - remove all
 * @param {Function} callback
 * @api public
 */
RexDB.prototype.remove = function (query, callback, accessType = WRITE) {
    rwcheck.entry(accessType);
    // simulate async
    const that = this; // see http://stackoverflow.com/questions/346015/javascript-closures-and-this-context
    setImmediate(function () {
        if (Object.keys(query).length === 0) { // i.e. query is {}
            that.documents.length = 0;
            that.indices = { _id: {} };
            that.cache.reset();
            rwcheck.exit(accessType, callback);
        } else {
            that._find(query, false, true, () => {
                that.cache.reset();
                rwcheck.exit(accessType, callback);
            });
        }
    });
};

RexDB.convertToAndFilter = function (query) {
    let andFilter = [];
    if ('$and' in query) {
        andFilter = query.$and;
    } else {
        // if query in simple format, build the andFilter array
        for (const property in query) {
            if (query.hasOwnProperty(property)) {
                const filter = {};
                filter[property] = query[property];
                andFilter.push(filter);
            }
        }
    }
    return andFilter;
};

/**
 *
 * @param {Object} query: filter values can be a RegExp
 * @param {Boolean} findOne
 * @param {Boolean} del: true - all matching records will be set to null
 * @param {Function} callback(err:String, result:Array)
 * @api private
 */
RexDB.prototype._find = function (query, findOne, del, callback) {
    const that = this;
    const result = [];

    if (this.documents.length === 0) {
        return setImmediate(callback, null, []);
    }

    const andFilter = RexDB.convertToAndFilter(query);

    // empty query: return all docs
    if (andFilter.length === 0) {
        for (let dd = 0; dd < this.documents.length; dd++) {
            if (this.documents[dd] != null) {
                result.push(this.documents[dd]);
            }
        }
        return setImmediate(callback, null, result);
    }

    // optimization if query has ONLY _id specified: use the index
    if (andFilter[0]._id != null && andFilter.length === 1) {
        const d = this.indices._id[andFilter[0]._id];
        if (d != null) {
            result.push(this.documents[d]);
            if (del === true) {
                delete this.indices._id[this.documents[d]._id];
                this.documents[d] = null; // must keep array structure as is
            }
            return setImmediate(callback, null, result);
        } 
            return setImmediate(callback, 'Error: Index ' + andFilter[0]._id + ' not found', null);
    }

    // tokenize $text.$search string
    // for more on mongodb $text search: http://docs.mongodb.org/manual/reference/operator/query/text/#op._S_text
    for (let ff = 0; ff < andFilter.length; ff++) {
        if (Object.keys(andFilter[ff])[0] === '$text') {
            let $searchWords = andFilter[ff].$text.$search.split(RexDB.tokenizer);
            $searchWords = $searchWords.filter(token => token !== '');
            for (let ss = 0; ss < $searchWords.length; ss++) {
                $searchWords[ss] = $searchWords[ss].toLowerCase().trim();
            }
            andFilter[ff].$text.$searchWords = $searchWords;
        }
    }

    // do the INDEXED-BASED FIND: searching (if search index table exists)
    // and filtering (for those fields that have index tables)
    const { indexedResult, andFilterRemaining } = this._indexedFind(andFilter);

    if (indexedResult && indexedResult.length === 0) {
        // indexed find was performed, but no results: done
        return setImmediate(callback, null, []);
    } else if (indexedResult && andFilterRemaining.length === 0) {
        // indexed find was performed, no remaining filter left: done
        for (const d of indexedResult) {
            const document = this.documents[d];
            if (del === true) {
                if (document._id != null) {
                    delete this.indices._id[document._id];
                }
                this.documents[d] = null; // must keep array structure as is
            } else if (document) {
                result.push(document);
            }
            if (findOne) {
                break;
            }
        }
        return setImmediate(callback, null, result);
    } else {
        // only if there are remaining filters: do EXHAUSTIVE FIND
        // NOTE: if an indexed find was indeed performed, only do the exhaustive find on that by
        // iterating over indexedResult instead of the documents array directly
        let iterateLength;
        if (indexedResult) {
            iterateLength = indexedResult.length;
        } else {
            iterateLength = that.documents.length;
        }
        // break up find loop into multiple async pages to not block other requests
        const PAGE_SIZE = 10000;
        let allResults = [];
        let start = 0;
        let pageLength;
        async.doWhilst(
            function (callback) {
                pageLength = Math.min(PAGE_SIZE, iterateLength - start);
                const pageResults = that._findLoop(andFilter, start, pageLength, findOne, del,
                    indexedResult);
                for (const r of pageResults) {
                    allResults.push(r);
                }
                setImmediate(callback, null, allResults);
            },
            function () {
                if (findOne && allResults.length > 0) {
                    return false;
                }
                if (start + pageLength >= iterateLength) {
                    return false;
                }
                start += PAGE_SIZE;
                return true;
            },
            function (err, allResults) {
                setImmediate(callback, err, allResults);
            });
    }
};


/**
 * Limitation: if a filter value is null that filter falls back to exhaustive search
 *
 * @param andFilter
 * @returns {Array} indices of matching docs; null if no searching or filtering was performed
 *                  (due to lack of required index tables)
 */
RexDB.prototype._indexedFind = function (andFilter) {
    const andFilterRemaining = [];

    // index-based filter (for device, devtool, etc)
    let indexedFilterResult = null;
    for (let ff = 0; ff < andFilter.length; ff++) {
        const filterField = Object.keys(andFilter[ff])[0];
        if (filterField !== '$text') {
            if (this.indices[filterField]) {
                let resultForField = [];
                let filterValues = [];
                const filterValue = andFilter[ff][filterField];
                if (filterValue && filterValue.$in) {
                    filterValues = filterValue.$in;
                } else {
                    filterValues = [filterValue];
                }
                let filterValueIsNull = false;
                for (const filterValue of filterValues) {
                    if (!filterValue) {
                        // if null or undefined: abort and defer to exhaustive search
                        filterValueIsNull = true;
                        resultForField = [];
                        andFilterRemaining.push(andFilter[ff]);
                        break;
                    }
                    if (this.indices[filterField][filterValue]) {
                        for (const r of this.indices[filterField][filterValue]) {
                            resultForField.push(r);
                        }
                    }
                }
                if (filterValueIsNull) {
                    continue;
                }
                if (resultForField.length === 0) {
                    indexedFilterResult = [];
                    break; // we're done here since all filters are ANDed
                } else {
                    indexedFilterResult = intersectArrays(indexedFilterResult,
                        resultForField.sort((a, b) => a - b));
                    // AND filters
                }
            } else {
                andFilterRemaining.push(andFilter[ff]);
            }
        }
    }

    // indexed-based search: strings within a $text are ANDed, and multiple $text are ORed
    // (NOTE that this is opposed to exhaustive search which would OR and then AND them...)
    let indexedSearchResult = null;
    for (let ff = 0; ff < andFilter.length; ff++) {
        if (Object.keys(andFilter[ff])[0] === '$text') {
            if (this.indices.search) {
                if (!indexedSearchResult) {
                    indexedSearchResult = [];
                }
                const searchIndexKeys = Object.keys(this.indices.search);
                let resultFor$Text;
                for (const $searchWord of andFilter[ff].$text.$searchWords) {
                    let resultForWord = [];
                    for (const key of searchIndexKeys) {
                        if (key.indexOf($searchWord) !== -1) {
                            for (const r of this.indices.search[key]) {
                                resultForWord.push(r);
                            }
                            // OR partials
                        }
                    }
                    resultForWord = Array.from(new Set(resultForWord)); // remove duplicates
                    resultFor$Text = intersectArrays(resultFor$Text,
                        resultForWord.sort((a, b) => a - b));
                    // AND words
                }
                if (resultFor$Text) {
                    for (const r of resultFor$Text) {
                        indexedSearchResult.push(r); // OR $texts
                    }
                }
            } else {
                andFilterRemaining.push(andFilter[ff]);
            }
        }
    }

    // intersect filter and search results
    const indexedResult = intersectArrays(indexedFilterResult, indexedSearchResult);

    return { indexedResult, andFilterRemaining };
};

/**
 *
 * @param a: sorted array, no duplicates (null means don't care)
 * @param b: sorted array, no duplicates (null means don't care)
 * @returns array with elements that occur in both a and b; null if both a and b are null/undefined
 */
function intersectArrays(a, b) {
    if (!a && !b) {
        return null;
    }

    if (!a) {
        return b;
    }

    if (!b) {
        return a;
    }

    let ai = 0;
    let bi = 0;
    const result = [];

    while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) {
            ai++;
        } else if (a[ai] > b[bi]) {
            bi++;
        } else {
            result.push(a[ai]);
            ai++;
            bi++;
        }
    }
    return result;
}

/**
 *
 * @param andFilter
 * @param start
 * @param pageLength
 * @param del
 * @returns {Array} results
 * @private
 */
RexDB.prototype._findLoop = function (andFilter, start, pageLength, findOne, del, indexedResult) {
    const results = [];
    let matched = false;
    for (let i = start; i < start + pageLength; i++) {
        let d;
        if (indexedResult) {
            d = indexedResult[i];
        } else {
            d = i;
        }
        const document = this.documents[d];
        if (document == null) {
            continue;
        }
        for (let f = 0; f < andFilter.length; f++) {
            const key = Object.keys(andFilter[f])[0];
            if (key === '$text') {
                // handle $text search
                let $searchMatch = false;
                for (const field in document) {
                    if (document.hasOwnProperty(field) && document[field] != null) {
                        const docString = document[field].toString().toLowerCase();
                        for (let s = 0; s < andFilter[f].$text.$searchWords.length; s++) {
                            if (docString.indexOf(andFilter[f].$text.$searchWords[s]) !== -1) {
                                $searchMatch = true;
                                break;
                            }
                        }
                        if ($searchMatch === true) {
                            break;
                        }
                    }
                }
                matched = $searchMatch;
            } else {
                // handle all other searches
                const valueDoc = (key in document) ? document[key] : null;
                // to match mongodb behaviour: http://docs.mongodb.org/manual/faq/developers/#faq-developers-query-for-nulls
                const valueFilter = andFilter[f][key];
                if (typeof valueFilter === 'object' && valueFilter != null && valueFilter.$in != null) {
                    // handle $in
                    const $inList = valueFilter.$in;
                    let $inListMatch = false;
                    for (let i = 0; i < $inList.length; i++) {
                        $inListMatch = this._match(valueDoc, $inList[i]);
                        if ($inListMatch === true) {
                            break;
                        }
                    }
                    matched = $inListMatch;
                } else if (typeof valueFilter !== 'undefined') { // if undefined treat as DON'T CARE
                    // handle regular field/value
                    matched = this._match(valueDoc, valueFilter);
                }
            }
            if (matched === false) {
                break;
            }
        }
        if (matched === true) {
            if (del === true) {
                if (document._id != null) {
                    delete this.indices._id[document._id];
                }
                this.documents[d] = null; // must keep array structure as is
            } else {
                results.push(document);
                if (findOne === true) {
                    break;
                }
            }
        }
    }
    return results;
};

/**
 *
 * @api private
 */
RexDB.prototype._match = function (valueDoc, valueFilter) {
    if (Array.isArray(valueDoc) === false) {
        if (valueFilter instanceof RegExp) {
            return valueFilter.test(valueDoc);
        } 
            return (valueDoc === valueFilter);
    } 
        for (let i = 0; i < valueDoc.length; i++) {
            if (this._match(valueDoc[i], valueFilter) === true) {
                return true;
            }
        }
    
    return false;
};

/**
 *
 * @param {Object} query
 * @param {Function} callback(err, Array:results)
 * @api public
 */
RexDB.prototype.find = function (query, callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    const that = this;
    this._findInCache(query, false, function (err, results) {
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
RexDB.prototype.findNoDeepCopy = function (query, callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    this._findInCache(query, false, function (err, results) {
        rwcheck.exit(ACCESS_TYPE, callback, err, results == null ? null : Object.freeze(results));
    });
};

/**
 *
 * @param {Object} query
 * @param {Function} callback(err, Object:result)
 * @api public
 */
RexDB.prototype.findOne = function (query, callback) {
    const ACCESS_TYPE = READ;
    rwcheck.entry(ACCESS_TYPE);
    const that = this;
    this._findInCache(query, true, function (err, results) {
        if (err || !results) {
            return rwcheck.exit(ACCESS_TYPE, callback, err);
        }
        if (results.length === 0) {
            rwcheck.exit(ACCESS_TYPE, callback, err, null);
        } else {
            rwcheck.exit(ACCESS_TYPE, callback, err, that.deepCopy(results[0]));
        }
    });
};

/**
 *
 * @param {Object} query
 * @param {Boolean} findOne
 * @param {Function} callback(err, Array:results)
 * @api private
 */
RexDB.prototype._findInCache = function (query, findOne, callback) {
    // simulate async
    const that = this; // see http://stackoverflow.com/questions/346015/javascript-closures-and-this-context
    let result;
    const queryString = jsonStableStringify(query);
    if (that.cache.has(queryString)) {
        logger.tracefiner('rexdb ' + that.dbName + ' cache hit: ' + queryString);
        result = that.cache.get(queryString);
        setImmediate(callback, null, result);
    } else {
        logger.tracefiner('rexdb ' + that.dbName + ' cache miss: ' + queryString);
        that._find(query, findOne, false, function (err, results) {
            if (this.useCache) {
                that.cache.set(queryString, results);
            }
            callback(null, results);
        });
    }
};

/**
 * Based on http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
 * Note: it doesn't copy functions, Date and Regex's
 * @param obj
 * @returns {*}
 */
RexDB.prototype.deepCopy = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

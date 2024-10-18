/**
 * @module scripts/ccs-dependent/util
 * 
 */
'use strict';
require('rootpath')();

const p = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const request = require('request');
const async = require('async');

const helpers = require('lib/util');
const util = require('scripts/util');

const processManager = new util.ProcessManager();

/**
 * @readonly
 * @enum {String} BuildType
 */
exports.BuildType = {
    /**  */
    FULL: 'full',
    /**  */
    INCREMENTAL: 'incremental',
    /**  */
    CLEAN: 'clean'
};

/**
 * @readonly
 * @enum {string} ResourceType
 */
exports.ResourceType = {
    /** A project spec file */
    PROJECT_SPEC: 'projectSpec',
    /** A folder containing an energia project */
    PROJECT_ENERGIA: 'project.energia',
    /** A folder containing a ccs project */
    PROJECT_CCS: 'project.ccs',
    /** An importable file */
    FILE_IMPORTABLE: 'file.importable'
};

/**
 * @callback getImportablesCallback
 * @param {Error} error
 * @param {Array.module:scripts/ccs-dependent/test-projects~Importable} importables
 */

/**
 * Get the importables for all devtools
 *
 * @param {Object} args
 *  @param {String} args.tirexUrl
 *  @param {Array.String} args.packages
 * @param {module:scripts/ccs-dependent/util~getImportablesCallback} callback
 */
exports.getImportables = function({tirexUrl, packages=[]}, callback) {
    packages = packages.join('::');
    async.waterfall([(callback) => {
        request.get(tirexUrl + 'api/devtools', (err, response, data) => {
            handleRequest(err, response, data, (err, data=[]) => {
                callback(err, {devtools: data.map(({name}) => {
                    return name;
                })});
            });
        });
    }, ({devtools}, callback) => {
        const maxRequests = 50;
        const requestQueue = async.queue(({devtool}, callback) => {
            request.get(`${tirexUrl}api/resources?dumpImportables=true&devtool=${devtool}` +
                        (packages.length > 0 ? `&package=${packages}` : ''),
                        (err, response, data) => {
                            handleRequest(err, response, data, callback);
                        });
        }, maxRequests);
        async.map(devtools, (devtool, callback) => {
            requestQueue.push({devtool}, callback);
        }, (err, results=[]) => {
            const importables = results
                  .filter(({result}) => {
                      return result.length > 0;
                  })
                  .reduce((accum, {result}) => {
                      return accum.concat(result);
                  }, []);
            const locations = importables
                  .map(({location}) => {
                      return location;
                  });
            const uniqueImportables = importables
                  .filter(({location}, index) => {
                      // unique by location (indexOf always returns the first index)
                      return locations.indexOf(location) === index;
                  });
            callback(err, uniqueImportables);
        });
    }], callback);
}

/**
 * @callback testProjectCallback
 * @param {Error} error
 * @param {Object} result
 *   @param {Integer} result.total
 *   @param {Integer} result.failed
 *   @param {Integer} result.error
 */

/**
 * @param {Object} importable
 *   @param {String} importable.location
 *   @param {Array.String} importable.coreTypes
 *  @param {String} ccsUrl
 *  @param {Stream.Writable} logStream
 * @param {module:scripts/ccs-dependent/util~testProjectCallback} callback
 */
function testProject({importable: {location, coreTypes}, ccsUrl, logStream}, callback) {
    async.waterfall([(callback) => {
        if (!coreTypes || coreTypes.length === 0) {
            _testProject({location, ccsUrl, out: logStream}, callback);
        }
        else {
            async.mapSeries(coreTypes, (variant, callback) => {
                _testProject({location, deviceId: variant, ccsUrl, out: logStream}, callback);
            }, (err, result) => {
                const sum = result
                      .filter(item => item)
                      .reduce((item1, item2) => {
                          return {
                              total: item1.total + item2.total,
                              failed: item1.failed + item2.failed,
                              error: item1.error + item2.error
                          };
                      }, {total: 0, failed: 0, error: 0});
                callback(err, sum);
            });
        }
    }], (err, {total=0, failed=0, error=0}={}) => {
        if (err) {
            return callback(err);
        }
        callback(err, {total, failed, error});
    });
} exports.testProject = testProject;

function handleRequest(err, response, data, callback, {json=true}={}) {
    if (err) {
        callback(err);
    }
    else if (response.statusCode !== 200) {
        callback(new Error(`got status code ${response.statusCode}`));
    }
    else {
        callback(err, json ? JSON.parse(data) : data);
    }
} exports.handleRequest = handleRequest;

///////////////////////////////////////////////////////////////////////////////
/// Internal functions
///////////////////////////////////////////////////////////////////////////////

function _testProject({location, ccsUrl, deviceId=null, out}, callback) {
    let result = {total: 0, failed: 0, error: 0};
    async.waterfall([(callback) => {
        const importUrl =  deviceId ?
              `${ccsUrl}importProject?location=${location}&deviceId=${deviceId}&sync=true` :
              `${ccsUrl}importProject?location=${location}&sync=true`
        request.get(importUrl, (err, response, data) => {
            handleRequest(err, response, data, callback);
        });
    }, (importData, callback) => {
        if (importData.error) {
            return setImmediate(callback, null, {error: importData.error});
        }
        const buildUrl = `${ccsUrl}buildProjects?buildType=${exports.BuildType.FULL}&sync=true`;
        request.get(buildUrl, (err, response, data) => {
            handleRequest(err, response, data, callback);
        });
    }, (data, callback) => {
        if (data.error) {
            out.write(data.error + '\n');
            result = {total: 0, failed: 0, error: 1};
            return setImmediate(callback);
        }
        const {verdict: {failed, total}} = data;
        result = {failed, total, error: 0};
        out.write(data.output);
        setImmediate(callback);
    }, (callback) => {
        const deleteUrl = `${ccsUrl}deleteProjects`;
        request.get(deleteUrl, (err, response, data) => {
            handleRequest(err, response, data, callback);
        });
    }], err => {
        callback(err, result);
    });
}

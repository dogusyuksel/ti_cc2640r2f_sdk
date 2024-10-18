'use strict';
require('rootpath')();

const os = require('os');
const path = require('path');
const fs = require('fs-extra');

const async = require('async');
const request = require('request').defaults();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const util = require('./util');
const scriptsUtil = require('scripts/util');

/**
 * @callback testProjectsCloudCallback
 * @param {Error} error
 * @param {Object} result
 *  @param {number} result.total - The total number of projects tested.
 *  @param {number} result.failed - The total number of projects that failed to import / build.
 *  @param {String} result.log - The log file with all import and build output.
 */

/**
 * Test projects by importing and building them.
 *
 * @param {Object} args
 *  @param {String} args.tirexUrl
 *  @param {String} args.ccsHttpAdapterUrl
 *  @param {Array.String} args.packages - The set of packages we want to test.
 *  @param {stream.Writable} args.out - Where to output.
 * @param {module:scripts/ccs-dependent/test-projects~testProjectsCloudCallback} callback
 */
exports.testProjectsCloud = function({tirexUrl, ccsHttpAdapterUrl, packages=null, out=process.stdout}, callback) {
    { // process args
        if (!tirexUrl.endsWith('/')) {
            tirexUrl += '/';
        }
        if (!ccsHttpAdapterUrl.endsWith('/')) {
            ccsHttpAdapterUrl += '/';
        }
    }
    const logFile = path.join(process.cwd(), 'result.log');
    const args = {};
    async.waterfall([(callback) => {
        async.parallel([(callback) => {
            util.getImportables({
                tirexUrl,
                packages: packages || []
            }, callback);
        }, (callback) => {
            scriptsUtil.setupLog(logFile, callback);
        }], callback);
    }, ([importables, logStream], callback) => { // clear all the existing projects
        args.importables = importables.filter(({resourceType}) => {
            return resourceType === util.ResourceType.PROJECT_CCS ||
                resourceType === util.ResourceType.PROJECT_SPEC;
        });
        args.logStream = logStream;
        const deleteUrl = `${ccsHttpAdapterUrl}deleteProjects`;
        request.get(deleteUrl, (err, response, data) => {
            util.handleRequest(err, response, data, callback);
        });
    }, (_, callback) => {
        async.waterfall([(callback) => {
            async.mapSeries(args.importables, (importable, callback) => {
                async.waterfall([(callback) => {
                    util.testProject({
                        importable, ccsUrl: ccsHttpAdapterUrl, logStream: args.logStream
                    }, callback);
                }, (result, callback) => {
                    if (result.failed > 0) {
                        out.write(`[failed] ${importable.location}\n`);
                    }
                    if (result.error > 0) {
                        out.write(`[error] ${importable.location}\n`);
                    }
                    setImmediate(callback, null, result);
                }], callback);
            }, callback);
        }, (result, callback) => {
            const sum = result.reduce((item1, item2) => {
                return {
                    total: item1.total + item2.total,
                    failed: item1.failed + item2.failed,
                    error: item1.error + item2.error
                };
            }, {total: 0, failed: 0, error: 0});
            setImmediate(callback, null, sum);
        }], callback);
    }], (err, {total=0, failed=0, error=0}={}) => {
        if (err) {
            return callback(err);
        }
        callback(err, {total, failed, error, log: logFile});
    });
}

///
// Yargs Command config
///
exports.command = 'test-projects-cloud [options]';
exports.describe = 'Test all the projects in tirex in a cloud environment';
exports.builder = {
    tirexUrl: {
        alias: 't',
        describe: 'The url of the tirex server to connect to',
        demand: true
    },
    ccsHttpAdapterUrl: {
        alias: 'c',
        describe: 'The url of the ccs http adapter to connect to',
        demand: true
    },
    packages: {
        alias: 'p',
        describe: 'A space separated list of packages in the format packageId__packageVersion (i,.e com.ti.CORE_MSP432_SDK__3.01.00.11_eng)',
        array: true
    }
};
exports.handler = function(argv) {
    exports.testProjectsCloud(argv, (err, {total, failed, error, log}={}) => {
        if (err) {
	    console.log(err);
            process.exit(1);
	}
	else {
            console.log(`Total items imported and built (including dependent items): ${total}`);
            console.log(`Number of items that failed to import and build (including dependent items): ${failed}`);
            console.log(`Number of projects that were not imported and/or built (i.e invalid projectspec, missing dependent product, etc): ${error}`);
            console.log(`Finished testing projects; see ${log} for details`);
            process.exit(0);
        }
    });
};

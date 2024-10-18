'use strict';
require('rootpath')();

const fs = require('fs-extra');
const path = require('path');

const async = require('async');
const request = require('request');

const util = require('scripts/util');

function main({handoffFile, url}, callback) {
    if (url.indexOf('/api/stage') > -1) {
        url = url.slice(0, url.indexOf('/api/stage'));
        console.log('Note: you no longer need to prefix the url with /api/stage');
    }
    if (!url.endsWith('/')) {
        url = url + '/';
    }
    const file = util.resolvePath(handoffFile);
    async.waterfall([(callback) => {
        fs.readJSON(file, callback);
    }, (json, callback) => {
        async.map(json, (data, callback) => {
            handoff(data, {
                relativePath: path.dirname(file), url
            }, callback);
        }, callback);
    }], callback);
}

/**
 * Handoff with zips on the local fs
 * 
 * @param {Object} data
 *  @param {Array.String} data.localAssets - The zips on the local fs to upload
 *  @param {Array.String} data.assets
 *  @param {String} data.email
 *  @param {String} data.replace
 * @param {Object} args
 *  @param {String} args.url
 *  @param {String} args.relativePath - If a zip had a relative path; this is its point of reference
 * @param callback(err, statusCode)
 */
function handoff({localAssets=[], assets=[], email='', replace=false}, {relativePath, url}, callback) {
    const absZips = localAssets.map((zip) => {
        return util.resolvePath(zip, {relative: relativePath});
    });
    async.waterfall([(callback) => {
        async.map(absZips, (zip, callback) => {
            fs.stat(zip, (err) => {
                if (err) {
                    console.log(`Error: zip ${zip} does not exist`);
                }
                callback(err);
            });
        }, callback);
    }, (_, callback) => {
        const formData = {
            attachments: absZips.map((zip) => {
                return fs.createReadStream(zip);
            }),
            email,
            replace: replace.toString(),
            assets: JSON.stringify(assets)
        }
        let called = false;
        request
            .post({url: `${url}api/add-package`, formData})
            .on('response', (response) => {
                if (!called) {
                    called = true;
                    callback(null, response.statusCode);   
                }
            })
            .on('error', (err) => {
                if (!called) {
                    called = true;
                    callback(err);
                }
            });
    }], callback);
}

///
// Yargs Command config
///
exports.command = 'handoff [options]';
exports.describe = 'A simple client to handoff package(s)';
exports.builder = {
    handoffFile: {
        alias: 'f',
        describe: 'The json file to handoff (absolute or relative to the current working directory)',
        demand: true
    },
    url: {
        alias: 'u',
        describe: 'The url to POST to (http://tirex-bu-handoff.toro.design.ti.com/tirex/ for offical handoff or http://tirex-bu-develop-1.toro.design.ti.com/tirex/ for development / testing)',
        demand: true
    }
};
exports.handler = function(argv) {
    main(argv, (err, statusCodes) => {
        if (err) {
            console.log(err);
            console.log('Failed to handoff');
        }
        else {
            console.log('status codes ', statusCodes);
            const failures = statusCodes.filter((code) => {
                return code !== 200;
            });
            if (failures.length === 0) {
                console.log('Successfully sent handoff; wait for an email to see the results');
            }
            else {
                console.log('Failed to handoff');
            }
        }
    });
};

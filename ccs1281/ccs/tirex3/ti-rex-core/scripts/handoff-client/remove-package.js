'use strict';
require('rootpath')();

const request = require('request');
const async = require('async');

function main({packageId, packageVersion, url, email}, callback) {
    if (url.indexOf('/api/remove-package') > -1) {
        url = url.slice(0, url.indexOf('/api/remove-package'));
        console.log('Note: you no longer need to prefix the url with /api/remove-package');
    }
    if (!url.endsWith('/')) {
        url = url + '/';
    }
    let called = false;
    request
        .delete(`${url}api/remove-package?id=${packageId}&version=${packageVersion}&email=${email}`)
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
}

///
// Yargs Command config
///
exports.command = 'remove-package [options]';
exports.describe = 'A simple client to remove a package';
exports.builder = {
    packageId: {
        alias: 'id',
        describe: 'The id of the package to remove',
        demand: true
    },
    packageVersion: {
        alias: 'version',
        describe: 'The version of the package to remove (use all to remove all versions)',
        default: '*'
    },
    url: {
        alias: 'u',
        describe: 'The url to DELETE to (http://tirex-bu-handoff.toro.design.ti.com/tirex/ for offical handoff or http://tirex-bu-develop-1.toro.design.ti.com/tirex/ for development / testing)',
        demand: true
    },
    email: {
        alias: 'e',
        describe: 'An email (or space separated list of emails) to send the result of the deletion to',
        array: true
    }
};
exports.handler = function(argv) {
    main(argv, (err, statusCode) => {
        if (err) {
            console.log(err);
            console.log('Failed to delete package');
        }
        else {
            console.log('status code', statusCode);
            if (statusCode === 200) {
                console.log('Successfully sent delete package request');
            }
            else {
                console.log('Failed to delete package');
            }
        }
    });
};

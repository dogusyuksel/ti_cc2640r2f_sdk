/** 
 * @module scripts/build
 */
'use strict';
require('rootpath')();

const request = require('request').defaults();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

exports.updateDB = function({tirexUrl}, callback) {
    { // process args
        if (!tirexUrl.endsWith('/')) {
            tirexUrl += '/';
        }
    }
    const refreshUrl = `${tirexUrl}api/refresh?p=all`;
    request.get(refreshUrl, (err, response, data) => {
        if (err) {
            callback(err);
        }
        else if (response.statusCode !== 200) {
            callback(new Error(`got status code ${response.statusCode}`));
        }
        else {
            callback();
        }
    });
}

///
// Yargs Command config
///
exports.command = 'update-db [options]';
exports.describe = 'Update tirex DB';
exports.builder = {
    tirexUrl: {
        alias: 't',
        describe: 'The url of the tirex server to update',
        demand: true
    },
};
exports.handler = function(argv) {
    exports.updateDB(argv, (err) => {
        if (err) {
	    console.log('An error while updating the DB');
	    console.log(err);
            process.exit(1);
	}
	else {
	    console.log('Update DB Successful!');
            process.exit(0);
        }
    });
};

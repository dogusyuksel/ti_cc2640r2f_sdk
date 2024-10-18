'use strict';
require('rootpath')();

const yargs = require('yargs');
const async = require('async');
const request = require('request').defaults();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

exports.waitForTirex = function({tirexUrl}, callback) {
    { // process args
        if (!tirexUrl.endsWith('/')) {
            tirexUrl += '/';
        }
    }
    const attempts = [];
    for (let i = 0; i < 10; i++) {
        attempts.push(i);
    }
    async.mapSeries(attempts, (attempt, callback) => {
        console.log('Attempt number ', attempt);
        const refreshUrl = `${tirexUrl}api/resources`;
        request.get(refreshUrl, (err, response, data) => {
            if (err) {
                console.log('Got err');
                console.log(err);
                setTimeout(() => {
                    callback();
                }, 1000*60*2);
            }
            else if (response.statusCode !== 200) {
                console.log(new Error(`got status code ${response.statusCode}`));
                callback();
            }
            else {
                callback('early exit');
            }
        });
    }, err => {
        if (err && err !== 'early exit') {
            callback(err);
        } else if (err === 'early exit') {
            callback();
        } else {
            callback(new Error('Exceeded max number of attempts'));
        }
    });
}

//////////////////////////////////////////////////////////////////////////////
//  Yargs Command config
//////////////////////////////////////////////////////////////////////////////
const yargsModule = {
    command: '$0 [options]',
    describe:  'Wait for tirex at the specified url',
    builder: {
        tirexUrl: {
            describe: 'url of the server to wait for',
            demandOption: true
        }
    },
    handler: argv => {
        exports.waitForTirex(argv, err => {
            if (err) {
                console.log('Failed to wait for tirex');
                console.error(err);
                process.exit(1);
            } else {
                console.log('Tirex is good to go');
                process.exit(0);
            }
        });
    }
};

if (require.main === module) {
    yargs
        .command(yargsModule)
        .help('h')
        .alias('h', 'help')
        .argv;
}

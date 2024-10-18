'use strict';
require('rootpath')();

const yargs = require('yargs');
const request = require('request').defaults();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

exports.killTirex = function({tirexUrl}, callback) {
    { // process args
        if (!tirexUrl.endsWith('/')) {
            tirexUrl += '/';
        }
    }
    const refreshUrl = `${tirexUrl}api/exit`;
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

//////////////////////////////////////////////////////////////////////////////
//  Yargs Command config
//////////////////////////////////////////////////////////////////////////////
const yargsModule = {
    command: '$0 [options]',
    describe:  'Kill the tirex at the specified url',
    builder: {
        tirexUrl: {
            describe: 'url of the server to kill',
            demandOption: true
        }
    },
    handler: argv => {
        exports.killTirex(argv, err => {
            if (err) {
                console.log('Failed to kill Tirex');
                console.error(err);
                process.exit(1);
            } else {
                console.log('Killed Tirex successfully');
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

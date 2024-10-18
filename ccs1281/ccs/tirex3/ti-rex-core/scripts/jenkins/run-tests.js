'use strict';

// native modules
const os = require('os');

// 3rd party modules
const async = require('async');
const yargs = require('yargs');

// our modules
const { Configs, runTests } = require('../../test/run-tests');

function runJenkinsTests({ buildUrl, email, remoteserverUrl }, callback) {
    async.series([(callback) => {
        if (os.platform() === 'linux') {
            runTests({configuration: Configs.REMOTESERVER}, callback);
        } else {
            setImmediate(callback);
        }
    }, (callback) => {
        runTests({
            configuration: Configs.LOCALSERVER,
            remoteserverUrl
        }, callback);
    }, (callback) => {
        runTests({
            configuration: Configs.E2E,
            remoteserverUrl,
            mode: 'remoteserver'
        }, callback);
    }, (callback) => {
        runTests({
            configuration: Configs.E2E,
            remoteserverUrl,
            mode: 'localserver'
        }, callback);
    }], callback);
}

//////////////////////////////////////////////////////////////////////////////
//  Yargs Command config
//////////////////////////////////////////////////////////////////////////////
const yargsModule = {
    command: '$0 [options]',
    describe:  'Run tests and figure out test configuration based on operating system',
    builder: {
        email: {
            alias: 'e',
            describe: 'email(s) to send reports to (may be a csv list of emails)',
            default: ''
        },
        remoteserverUrl: {
            describe: 'url of the remote server to test on',
            demandOption: true
        }
    },
    handler: argv => {
        runJenkinsTests(argv, err => {
            if (err) {
                console.log('Failed to run tests');
                console.error(err);
                process.exit(1);
            } else {
                console.log('Ran tests successfully');
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

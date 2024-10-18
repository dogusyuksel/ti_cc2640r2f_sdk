#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

if (require.main === module) {
    if (process.argv.indexOf('build') > -1 ||
        process.argv.indexOf('clean') > -1 ||
        process.argv.indexOf('update-webdrivers') > -1) {
        const yargs = require(path.join(
            __dirname, '..', '3rd_party', 'shared', 'node_modules', 'yargs'
        ));
        yargs
            .usage('Usage: $0 <command> [options]')
            .command(require('./build'))
            .command(require('./clean'))
            .command(require('./update-webdrivers'))
            .demandCommand(1)
            .help('h')
            .alias('h', 'help')
            .argv;
    } else {
        require('rootpath')();
        const yargs = require('yargs');
        yargs
            .usage('Usage: $0 <command> [options]')
            .command(require('./run-tirex'))
            .command(require('test/run-tests'))
            .command(require('./build'))
            .command(require('./update-webdrivers'))
            .command(require('./clean'))
            .command(require('./update-db'))
            .command(require('./refresh-db'))
            .demandCommand(1)
            .help('h')
            .alias('h', 'help')
            .argv;
    }
}

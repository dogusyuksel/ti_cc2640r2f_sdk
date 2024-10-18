#!/usr/bin/env node

'use strict';
require('rootpath')();

const fs = require('fs-extra');
const async = require('async');
const semver = require('semver');
const path = require('path');

const util = require('scripts/util');

function setBuildNumber({buildNumber}, callback) {
    const packageJson = path.join(util.projectRoot, 'package.json');
    async.waterfall([(callback) => {
        fs.readJson(packageJson, callback)
    }, (json, callback) => {
        if (!semver.valid(json.version)) {
            return setImmediate(callback, new Error(`Version is not semver compliant ${json.version}`));
        }
        json.version = `${semver.clean(json.version)}+${buildNumber}`;
        fs.writeJSON(packageJson, json, callback);
    }], callback);
}

if (require.main === module) {
    const argv = require('yargs')
          .usage('Usage: $0 [options]')

          .alias('b', 'buildNumber')
          .describe('b', 'The build number')
          .demandOption(['b'])
    
          .help('h')
          .alias('h', 'help')
	  .argv;
    
    setBuildNumber(argv, (err) => {
        if (err) {
            console.log(err);
            return process.exit(1);
        }
        console.log('Set build number successfully!');
        process.exit(0);
    });
}

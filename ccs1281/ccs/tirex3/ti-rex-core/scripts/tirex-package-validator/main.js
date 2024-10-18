'use strict';
require('rootpath')();

const singleJsonFileValidation = require('scripts/tirex-package-validator/singleJsonFileValidation');
const packageValidation = require('scripts/tirex-package-validator/packageValidation');

const glob = require('glob');
const fsutils = require('lib/localserver/fsutils');
const path = require('path');

function validate(packagePath, type) {
  if (type === 'package') {
      new packageValidation(packagePath).validate();
  } else {
      new singleJsonFileValidation(packagePath).validate();
  }
}

if (require.main === module) {
    if (process.argv.length !== 4) {
        process.exit(1);
    }
    if (process.argv[2] === '-p') {
        validate(process.argv[3], 'package');
    } else if (process.argv[2] === '-f') {
        validate(process.argv[3], 'file');
    }
}

exports.command = 'validate [options]';
exports.describe = 'Validate Metadata';
exports.builder = {
    packagefolder: {
        alias: 'p',
        describe: 'path to package folder'
    },
    file: {
        alias: 'f',
        describe: 'path to single "<type>.tirex.json" file.'
    }
};
exports.handler = function(argv) {
    if (argv.p) {
        validate(argv.p, 'package');
    }else if(argv.f) {
        validate(argv.f, 'file');
    }
};
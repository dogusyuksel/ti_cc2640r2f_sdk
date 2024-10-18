#!/usr/bin/env node

'use strict';
require('rootpath')();

const fs = require('fs');
const path = require('path');

if (require.main === module) {
    const yargs = require('yargs');
    yargs
	.usage('Usage: $0 <command> [options]')
        .command(require('./handoff-client/add-package'))
        .command(require('./handoff-client/remove-package'))
        .command(require('./ccs-dependent/test-projects'))
        .command(require('./ccs-dependent/test-projects-cloud'))
        .command(require('./tirex-package-validator/main'))
        .demandCommand(1)
	.help('h')
	.alias('h', 'help')
	.argv;
}

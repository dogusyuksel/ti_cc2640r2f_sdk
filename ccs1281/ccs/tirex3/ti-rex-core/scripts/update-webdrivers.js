'use strict';
const os = require('os');
const path = require('path');
const p = require('child_process');

const util = require('./util');

const processManager = new util.ProcessManager();

function updateWebdrivers({ platform, arch, nodeVersion }, callback) {
    const webdriverExe = path.join(
        util.projectRoot, '3rd_party', 'shared', 'node_modules', 'protractor', 'bin', 'webdriver-manager'
    );
    const installPath = path.join(
        util.projectRoot, '3rd_party', platform, arch, nodeVersion, 'bin', 'webdrivers'
    );
    let args = [webdriverExe, 'update',
                `--out_dir=${installPath}`, '--proxy=http://wwwgate.ti.com:80/'];
    if (platform === 'win32') {
        args.push('--ie', '--versions.standalone=3.4.0', '--versions.ie=3.4.0');
    }
    const updater = p.spawn(process.execPath, args);
    processManager.addProcess({
        child: updater,
        out: process.stdout,
        name: 'webdriver-updater'
    });
    updater.once('exit', (code) => {
        if (code === 0) {
            console.log(`Installed webdrivers into ${installPath} \n`);
        } else {
            console.log(`Failed to install webdrivers into ${installPath} \n`);
        }
        callback(code);
    });
}

///////////////////////////////////////////////////////////////////////////////
// Yargs Command config
///////////////////////////////////////////////////////////////////////////////

exports.command = 'update-webdrivers [options]';
exports.describe = 'Update webdrivers';
exports.builder = {
    platform: {
        alias: 'p',
        describe: 'The target platform',
        choices: ['darwin', 'linux', 'win32'],
        default: os.platform()
    },
    arch: {
        alias: 'a',
        describe: 'The target architecture',
        choices: ['ia32', 'x64'],
        default: os.arch()
    },
    nodeVersion: {
        alias: 'n',
        describe: 'e.g. v0.10.26 (same as process.version)',
        default: process.version
    },
};
exports.handler = function(argv) {
    updateWebdrivers(argv, (code) => {
        process.exit(code);
    });
};

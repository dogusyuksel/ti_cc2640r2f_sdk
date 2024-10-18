'use strict';
require('rootpath')();

const path = require('path');
const fs = require('fs-extra');

const async = require('async');

const util = require('./util');

function genSiteData({destinationFolder}, callback) {
    if (destinationFolder) {
        destinationFolder = util.resolvePath(destinationFolder);
    }
    async.waterfall([(callback) => {
        transferFiles(util.siteStaticData, destinationFolder, callback);
    }, (callback) => {
        async.map([
            {src: path.dirname(util.mochaHtmlReport), dst: path.join(destinationFolder, 'public', 'unit-integration')},
            {src: path.dirname(util.protractorHtmlReport), dst: path.join(destinationFolder, 'public', 'e2e')}
        ], ({src, dst}, callback) => {
            transferFiles(src, dst, callback);
        }, callback);
    }], callback);

    function transferFiles(src, dst, callback) {
        if (fs.existsSync(src)) {
            fs.emptyDir(dst, (err) => {
                if (err) {
                    return callback(err);
                }
                fs.copy(src, dst, err => callback(err));
            });
        } else {
            setImmediate(callback);
        }
    }
}

if (require.main === module) {
    const argv = require('yargs')
          .usage('Usage: $0 [options]')
          .help('h')
          .alias('h', 'help')

          .describe('destinationFolder', 'The folder to put the generated site data')
          .alias('destinationFolder', 'd')
          .demand(['d'])
    
	  .argv;
    genSiteData(argv, (err) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        else {
            console.log('Generated site data successfully!');
            process.exit(0);
        }
    });
}

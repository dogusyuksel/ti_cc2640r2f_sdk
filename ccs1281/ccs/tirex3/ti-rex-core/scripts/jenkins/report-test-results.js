'use strict';

// native modules
const os = require('os');
const path = require('path');
const fs = require('fs-extra');

// 3rd party modules
const async = require('async');
const yargs = require('yargs');
const glob = require('glob');

// our modules
const scriptsUtil = require('../util');
const libUtiil = require('../../lib/util');

function prepareTestResults({email, buildUrl}, callback) {
    _prepareTestResults({
        jsonReportGlob: scriptsUtil.JSONReportGlob,
        logFileGlob: scriptsUtil.logFileGlob,
        email,
        buildUrl
    }, callback);
}

function _prepareTestResults({jsonReportGlob, logFileGlob, email, buildUrl}, callback) {
    async.waterfall([(callback) => {
        async.parallel([(callback) => {
            getPercentPass(jsonReportGlob, callback);
        }, (callback) => {
            getLogFiles(logFileGlob, callback);
        }], callback);
    }, ([{overallPercentPass, indvidualPercentPass}, logFiles], callback) => {
        createEmail({overallPercentPass, indvidualPercentPass, logFiles, buildUrl}, callback);
    }, ({body, subject, attachments}, callback) => {
        libUtiil.email({
            sender: 'no-reply@ti.com',
            receiver: email,
            subject,
            payload: body,
            attachments,
            html: false
        }, callback);
    }], callback);
}

function getPercentPass(jsonReportGlob, callback) {
    async.waterfall([(callback) => {
        glob(jsonReportGlob, null, callback);
    }, (jsonReports, callback) => {
        async.waterfall([(callback) => {
            async.map(jsonReports, (report, callback) => {
                async.waterfall([(callback) => {
                    fs.readJson(report, callback);
                }, ({stats: {passPercent}}, callback) => {
                    setImmediate(callback, null, {
                        percentPass: passPercent, report
                    });
                }], callback);
            }, callback);
        }, (result, callback) => {
            const { count, percentSum } = result
                  .map(({percentPass}) => percentPass)
                  .reduce(({count, percentSum}, currPercent) => {
                      return {
                          count: count + 1,
                          percentSum: percentSum + currPercent
                      };
                  }, {count: 0, percentSum: 0});
            const overallPercentPass = (count ? percentSum / count : 0).toFixed(2);
            const indvidualPercentPass = {};
            result.map(({percentPass, report}) => {
                indvidualPercentPass[path.basename(report)] = percentPass.toFixed(2);
            });
            setImmediate(callback, null, {overallPercentPass, indvidualPercentPass});
        }], callback);
    }], callback);
}

function getLogFiles(logFileGlob, callback) {
    glob(logFileGlob, null, callback);
}

function createEmail({overallPercentPass, indvidualPercentPass, logFiles, buildUrl}, callback) {
    async.waterfall([(callback) => {
        fs.readJSON(path.join(scriptsUtil.projectRoot, 'package.json'), callback);
    }, ({version}, callback) => {
        const summary = ['']
              .concat(Object.keys(indvidualPercentPass).map(
                  (reportName) => `${reportName} - ${indvidualPercentPass[reportName]}%`
              ))
              .join('\n\t');
        setImmediate(callback, null, {
            subject: `[${os.platform()} - ${overallPercentPass}%, Tirex version: ${version}] Automated test results`,
            body: `See Attached logs or ${buildUrl}HTML_Report for detailed results. \n Summary:${summary}`,
            attachments: logFiles.map(logFile => {
                return {path: logFile, filename: path.basename(logFile)};
            })
        });
    }], callback);
}

//////////////////////////////////////////////////////////////////////////////
//  Yargs Command config
//////////////////////////////////////////////////////////////////////////////
const yargsModule = {
    command: '$0 [options]',
    describe: 'Gather the test results',
    builder: {
        buildUrl: {
            describe: 'build url of current jenkins build',
            demandOption: true
        },
        email: {
            alias: 'e',
            describe: 'email(s) to send reports to (may be a csv list of emails)',
            demandOptions: true
        }
    },
    handler: argv => {
        prepareTestResults(argv, err => {
            if (err) {
                console.log('Failed to prepare test results');
                console.error(err);
                process.exit(1);
            } else {
                console.log('Prepared test results successfully');
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

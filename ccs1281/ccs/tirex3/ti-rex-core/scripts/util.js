'use strict';

const path = require('path');
const os = require('os');

const projectRoot = path.join(__dirname, '..'); exports.projectRoot = projectRoot;

// Log files
const logsDir = path.join(projectRoot, 'logs');
exports.remoteServerLog = path.join(logsDir, 'remoteserver.log');
exports.localServerLog = path.join(logsDir, 'localserver.log');
exports.webdriverLog = path.join(logsDir, 'webdriver.log');
exports.protractorLog = path.join(logsDir, 'e2e.log');
exports.mochaLog = path.join(logsDir, 'unit-integration.log');

// Ports
exports.remoteServerDebugPort = 6000;
exports.localServerDebugPort = 6001;
exports.seleniumServerPort = 4004;

exports.backendJsItems = ['app.js', 'lib', 'rexdb', 'routes'].map((item) => {
    return path.join(projectRoot, item);
});

exports.siteStaticData = path.join(projectRoot, 'scripts', 'data', 'site');

// Where mocha should write reports
const reportDir = path.join(projectRoot, 'reports');
exports.mochaHtmlReport = path.join(reportDir, 'unit-integration-report.html');
exports.mochaJSONReport = path.join(reportDir, 'unit-integration-report.json');
exports.protractorHtmlReport = path.join(reportDir, 'e2e-report.html');
exports.protractorJSONReport = path.join(reportDir, 'e2e-report.json');

// Globs for reports - reports get renamed per configuration (browser, server mode, etc)
exports.htmlReportGlob = path.join(reportDir, '*-report*.html');
exports.JSONReportGlob = path.join(reportDir, '*-report*.json');

// Globs for test logs - logs get renamed per configuration (browser, server mode, etc)
exports.logFileGlob = path.join(logsDir, '@(e2e|unit-integration)*.log');

/**
 * Clears the log file and opens a writeable stream to write to the log.
 *
 * @param {String} log 
 * @param callback(err, logStream)
 * @param {Object} options
 */
exports.setupLog = function(log, callback, {clear=true}={}) {
    const fs = require('fs-extra');
    const async = require('async');
    async.series([(callback) => {
        if (clear) {
            fs.outputFile(log, '', callback);
        }
        else {
            fs.ensureFile(log, callback);
        }
    }, (callback) => {
        const logStream = fs.createWriteStream(log, {'flags': 'a'});
        let callbackCalled = false;
        logStream.on('open', () => {
            if (!callbackCalled) {
                callbackCalled = true;
                callback(null, logStream);
            }
        });
        logStream.on('error', (err) => {
            if (!callbackCalled) {
                callbackCalled = true;
                callback(err);
            }
        });
    }], (err, [_, logstream]) => {
        callback(err, logstream);
    });    
};

/**
 * Simplifies process management
 *
 */
exports.ProcessManager = class ProcessManager {
    constructor() {
        this._childProcesses = [];
        process.once('exit', () => {
            this._childProcesses.map((child) => {
                child.kill();
            });
        });
    }

    /**
     * Register process and redirect to out.
     *
     * @param {Object} args
     *  @param {Object} args.child - An object returned by a child_process function
     *   i.e require('child_processes').spawn(..)
     *  @param {stream.Writeable} args.out - The stream to write the 
     *   processes output to.
     *  @param {String} name 
     *  @param {Boolean} exitMessage - if false suppress the exit code message
     */
    addProcess({child, out, name='', exitMessage=true}) {
        this._childProcesses.push(child);
        ProcessManager._redirectProcessOutput({
            child,
            out,
            name,
            exitMessage
        });
    }

    /**
     * Redirect the processes output to the write stream 
     *
     * @param {Object} p - An object returned by a child_process function
     *  i.e require('child_processes').spawn(..)
     * @param {stream.Writeable} out - The stream to write the processes output to
     *
     */
    static _redirectProcessOutput({child, out, name, exitMessage}) {
        child.stdout.pipe(out);
        child.stderr.pipe(out);
        child.on('error', (err) => {
            out.write(err);
        });
        child.on('close', (code) => {
            if (exitMessage) {
                out.write(`${name} exited with code ${code}\n`);
            }
        });
        // received when nodemon restarts our script
        process.once('SIGUSR2', (code) => {
            child.kill();
        });
    }
};

/**
 * Resolves the path relative to the current working directory. This also handles ~ in paths.
 * 
 * @param {String} p - The path to resolve.
 * @param {Object} options
 *  @param {String} options.relative - The path to be relative to (default current working directory)
 *
 * @returns {String} resolvedPath - The absolute resolved path.
 */
exports.resolvePath = function(p, {relative}={}) {
    if (!relative) {
        relative = process.cwd();
    }
    
    if (path.isAbsolute(p)) {
        return p;
    }
    else if (p.indexOf('~') > -1) {
        return path.normalize(p.replace('~', os.homedir()));
    }
    else {
        const absPath = path.join(relative, p);
        return path.normalize(absPath);
    }
};

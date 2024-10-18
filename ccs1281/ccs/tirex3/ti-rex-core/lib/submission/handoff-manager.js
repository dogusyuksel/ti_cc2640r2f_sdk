'use strict';
require('rootpath')();

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

const async = require('async');

const vars = require('lib/vars');
const rex = require('lib/rex')();
const logging = require('lib/logging');
const pathHelpers = require('lib/path-helpers');
const util = require('../util');
const SubmissionManager = require('./submission-manager');
const {ProgressManager, ProgressState} = require('./progress-manager');

const request = require('request').defaults(vars.REQUEST_DEFAULTS);

const HandoffManagerState = {
    UP: 'up',
    TEARDOWN: 'teardown',
    MAINTANCE_MODE: 'maintanceMode'
}; exports.HandoffManagerState = HandoffManagerState;

const Tasks = {
    PROCESS_PACKAGE: 'processPackage',
    REMOVE_PACKAGE: 'removePackage'
};

const UploadPackageProgress = {
    LOADING: ProgressState.LOADING,
    PROCESSING: 'processing',
    DONE: ProgressState.DONE
};

const RemovePackageProgress = {
    LOADING: ProgressState.LOADING,
    PROCESSING: 'processing',
    DONE: ProgressState.DONE
};

class HandoffManagerEventEmitter extends EventEmitter {}

const HandoffManagerEvents = {
    STATE_CHANGE: 'stateChange'
};

/**
 * For managing handoffs.
 *
 */
class HandoffManager {
    /**
     * @typedef {Object} HandoffManager~Package
     * @property {Array.String} assets - Links to the zips associated with this package.
     * @property {String} email - An optional csv list of emails to send the results of submitting the package to.
     * @property {Boolean} replace - If true, allow replacing an existing same id / version package
     * @property {Array.SubmissionManager~ZipUpload} zipUploads
     * @property {String} submissionId
     */

    /**
     * 
     * 
     */
    constructor({refreshManager}) {
        this._submissionManager = new SubmissionManager({
            refreshManager,
            contentPackagesConfig: vars.CONTENT_PACKAGES_CONFIG,
            packageManagerFile: vars.PACKAGE_MANAGER_FILE,
            handoffFile: vars.HANDOFF_FILE,
            contentFolder: vars.CONTENT_BASE_PATH,
            zipsFolder: vars.ZIPS_FOLDER
        });
        this._processQueue = async.queue((task, callback) => {
            this._processTask(task, callback);
        });
        this._handoffProgressManager = new ProgressManager();
        this._handoffManagerState = HandoffManagerState.UP;
        this._handoffManagerEventEmitter = new HandoffManagerEventEmitter();
    }
    
    /**
     * Upload the package.
     * 
     * @param {HandoffManager~Package} package - The package metadata for uploading.
     * @param {Rex} rex
     * @param {ErrorCallback} callback
     */
    uploadPackage({assets=[], zipUploads=[], email, submissionId, replace}, callback=(() => {})) {
        const args = {
            assets, zipUploads,
            email, submissionId,
            replace
        };
        this._handoffProgressManager.setTaskState(submissionId, UploadPackageProgress.LOADING);
        async.waterfall([(callback) => {
            this._manageLogsSubmission(args, callback);
        }, ({log, refreshLog, onSubmissionDone}, callback) => {
            args.log = log;
            args.refreshLog = refreshLog;
            args.onSubmissionDone = onSubmissionDone;
            const {submissionId} = args;
            if (assets.length === 0 && zipUploads.length === 0) {
                const msg = 'No zip file(s) specified in submission. Please check submission metadata.';
                logMessage(log.userLogger.error, msg);
                return setImmediate(callback, null, new Error('Invalid submission'));
            }
            this._submissionManager.getSubmission({
                submissionFolderPrefix: `Submission-${submissionId}`,
                submission: {assets, zipUploads},
                submissionId,
                log
            }, (err, result={}) => {
                Object.keys(result).map((key) => {
                    args[key] = result[key];
                });
                callback(null, err);
            });
        }, (err, callback) => {
            if (err) {
                args.onSubmissionDone(err, (err2, success) => {
                    const err3 = err || err2 || !success;
                    logMessage(args.log.userLogger.error, 'Package failed to upload');
                    this._cleanupUpload(
                        args, err3, args.rollbackRefreshLog, callback
                    );
                });
            }
            else {
                this._processQueue.push({task: Tasks.PROCESS_PACKAGE, args}, callback);
            }
        }], err => {
            this._handoffProgressManager.setTaskState(submissionId, UploadPackageProgress.DONE);
            callback(err);
        });
    }
    
    /**
     * Get the progress for a package upload.
     * 
     * @param {String} submissionId
     * @returns {HandoffManager~uploadPackageProgressCallback} callback
     */
    uploadPackageProgress(submissionId) {
        return this._handoffProgressManager.getTaskState(submissionId);
    }
    
    /**
     * Remove the package.
     * 
     * @param {Object} args
     *  @param {PackageManager~PackageInfo} args.packageInfo
     *  @param {String} args.submissionId
     *  @param {String} args.email
     * @param {ErrorCallback} callback
     */
    removePackage(args, callback) {
        const {submissionId, email} = args;
        async.waterfall([(callback) => {
            this._handoffProgressManager.onAllDoneLoading((err) => {
                if (err) {
                    return setImmediate(callback, err);
                }
                this._processQueue.push({task: Tasks.REMOVE_PACKAGE, args}, callback);
            });
            this._handoffProgressManager.setTaskState(submissionId, RemovePackageProgress.LOADING);
        }], err => {
            this._handoffProgressManager.setTaskState(submissionId, RemovePackageProgress.DONE);
            callback(err);
        });
    }
    
    _removePackage({packageInfo, submissionId, email}, callback) {
        const args = {submissionId, email};
        async.waterfall([(callback) => {
            this._handoffProgressManager.setTaskState(submissionId, RemovePackageProgress.PROCESSING);
            this._manageLogsDeletion(args, callback);
        }, ({log, refreshLog, onSubmissionDone}, callback) => {
            args.onSubmissionDone = onSubmissionDone;
            this._submissionManager.removeSubmission({
                packageInfo, log, refreshLog
            }, callback);
        }], err => {
            if (args.onSubmissionDone) {
                args.onSubmissionDone(err, err2 => callback(err || err2));
            }
            else {
                setImmediate(callback, err);
            }
        });
    }

    /**
     * Get the progress for a package upload.
     * 
     * @param {String} submissionId
     * @returns {HandoffManager~uploadPackageProgressCallback} callback
     */
    removePackageProgress(submissionId) {
        return this._handoffProgressManager.getTaskState(submissionId);
    }

    /**
     * @returns {Boolean} acceptingSubmissions
     * 
     */
    acceptingSubmissions() {
        return this._handoffManagerState === HandoffManagerState.UP;
    }

    /**
     * @returns {String} handoffManagerState
     * 
     */
    getHandoffManagerState() {
        return this._handoffManagerState;
    }

    /**
     * Turn on maintenance mode. This will finish any ongoing processing and when done will return. 
     * Block any submissions after calling this function.
     *
     * @param {ErrorCallback} callback
     */
    maintenanceMode(callback) {
        if (this._handoffManagerState !== HandoffManagerState.UP) {
            return setImmediate(callback, new Error('Already in ${this._handoffManagerState}'));
        }
        this._handoffManagerState = HandoffManagerState.TEARDOWN;
        this._handoffManagerEventEmitter.emit(HandoffManagerEvents.STATE_CHANGE);
        this._handoffProgressManager.onAllDone(err => {
            this._handoffManagerState = HandoffManagerState.MAINTANCE_MODE;
            this._handoffManagerEventEmitter.emit(HandoffManagerEvents.STATE_CHANGE);
            callback(err);
        });
    }

    /**
     * Resume handoff services. It will take us out of maintenance mode and accept submissions again.
     *
     * @param {ErrorCallback} callback
     */
    resumeService(callback) {
        if (this._handoffManagerState === HandoffManagerState.UP) {
            setImmediate(callback, new Error('Already accepting submissions'));
        }
        else if (this._handoffManagerState === HandoffManagerState.MAINTANCE_MODE) {
            this._handoffManagerState = HandoffManagerState.UP;
            this._handoffManagerEventEmitter.emit(HandoffManagerEvents.STATE_CHANGE);
            setImmediate(callback);
        }
        else {
            async.doUntil((callback) => {
                this._handoffManagerEventEmitter.once(HandoffManagerEvents.STATE_CHANGE, callback);
            }, () => {
                return this._handoffManagerState !== HandoffManagerState.TEARDOWN;
            }, (err) => {
                if (err) {
                    return setImmediate(callback, err);
                }
                this._handoffManagerState = HandoffManagerState.UP;
                this._handoffManagerEventEmitter.emit(HandoffManagerEvents.STATE_CHANGE);
                callback(err);
            });
        }
    }
    
    ///////////////////////
    // Private Functions
    //////////////////////

    _processTask({args, task}, callback) {
        if (task === Tasks.REMOVE_PACKAGE) {
            this._removePackage(args, callback);
        }
        else if (task === Tasks.PROCESS_PACKAGE) {
            this._processPackage(args, callback);
        }
        else {
            setImmediate(callback, new Error(`Unknown task ${task}`));
        }
    }
    
    _processPackage(args, callback) {
        const {
            email, submissionId,
            downloadFolder, extractFolder,
            log, refreshLog, replace
        } = args;
        this._handoffProgressManager.setTaskState(submissionId, UploadPackageProgress.PROCESSING);
        async.waterfall([(callback) => {
            // Temp workaround for default.json being deleted 
            const config = vars.CONTENT_PACKAGES_CONFIG;
            const dst = path.join(path.dirname(config), `${path.basename(config)}-${submissionId}`); 
            fs.copy(config, dst, callback);
        }, (callback) => {
            const {packageFolders, zips} = args;
            this._submissionManager.stageSubmission({
                packageFolders, zips, submissionId, email,
                downloadFolder, extractFolder,
                log, replace
            }, callback);
        }, (entry, callback) => {            
            const newZips = entry.zips.map(zip => path.join(vars.ZIPS_FOLDER, zip));
            const newPackageFolders = entry.content.map(content => path.join(
                vars.CONTENT_BASE_PATH, content
            ));
            args.packageFolders = newPackageFolders; 
            args.zips = newZips;
            args.entry = entry;
            const msg = `Packages were discovered in the following folders: ${args.packageFolders.map(pkg => pathHelpers.getRelativePath(pkg, vars.CONTENT_BASE_PATH))}`;
            logMessage(log.userLogger.info, msg);
            this._submissionManager.loadSubmission({log, refreshLog}, callback);
        }], (err) => {
            const {packageFolders, zips} = args;
            async.waterfall([(callback) => {
                args.onSubmissionDone(err, (err2, success) => {
                    callback(null, err || err2 || !success);
                });
            }, (err, callback) => {
                if (err) {
                    return setImmediate(callback, null, err);
                }
                this._submissionManager.saveSubmission({
                    packageFolders, zips, submissionId, email,
                    log
                }, err => callback(null, err));
            }, (err, callback) => {
                this._cleanupUpload(args, err, rex.log, callback);
            }], callback);
        });
    }

    /**
     * @private 
     * @callback HandoffManager~_manageLogsSubmissionCallback
     * @param {Error} error
     * @param {Object} result
     * @param {Log} result.log
     * @param {Log} result.refreshLog
     * @param {ErrorCallback} result.onSubmissionDone - To call once the submission is complete
     */
    
    /**
     * Manage the logs for the submission. 
     *  Create the submission logs.
     *  Email the logs when submission is done.
     *  Close the loggers once we are complete.
     *
     * @private
     * @param {Object} args - will contain info accumulated during submission; which can be included in the email
     * @param {HandoffManager~_manageLogsSubmissionCallback} callback
     *
     */
    _manageLogsSubmission(args, callback) {
        const {submissionId, email} = args;
              
        // create the logs
        const log = new logging.Log({
            userLogger: rex.loggerManager.createLogger(`upload-${submissionId}-user`),
            debugLogger: rex.loggerManager.createLogger(`upload-${submissionId}-debug`)
        });
        const refreshLog = new logging.Log({
            userLogger: rex.loggerManager.createLogger(`upload-${submissionId}-user-refresh`),
            debugLogger: rex.loggerManager.createLogger(`upload-${submissionId}-debug-refresh`)
        });
        logMessage(log.userLogger.info, `Submission id: ${submissionId}`);

        // manage the logs
        let success = true;
        let messageBody = '';
        async.waterfall([(callback) => {
            HandoffManager._prepareRefreshLogfile(refreshLog, callback);
        }, (refreshLogFile, refreshOut, refreshPath, callback) => {
            refreshLog.userLogger.on('data', (message) => {
                const {type} = JSON.parse(message.toString());
                if (type === 'error' || type === 'critical') {
                    refreshOut.write(util.transformLogMessage(message));
                    success = false;
                }
            });
            log.userLogger.on('data', (message) => {
                messageBody += util.transformLogMessage(message);
                if (JSON.parse(message.toString()).type === 'error') {
                    success = false;
                }
            });
            const onSubmissionDone = (err, callback=()=>{}) => {
                if (success && !err) {
                    logMessage(log.userLogger.info, 'Submission successful');
                }
                else {
                    logMessage(log.userLogger.error, 'Package failed to upload');
                }
                const attachments = [{
                    path: refreshLogFile,
                    filename: path.basename(refreshLogFile)
                }];
                const packageName = args.entry ? args.entry.id : 'Unknown';
                async.series([(callback) => {
                    if (email || vars.MAILING_LIST) {
                        util.email({
                            sender: `no-reply@ti.com`,
                            receiver: `${email},${vars.MAILING_LIST}`,
                            subject: `Handoff to ${os.hostname()} of ${packageName} - ${success ? 'COMPLETED' : 'FAILED'}`,
                            payload: messageBody,
                            attachments : success ? [] : attachments
                        }, callback);
                    }
                    else {
                        setImmediate(callback);
                    }
                }, (callback) => {
                    const toRemove = attachments.concat({
                        path: refreshPath
                    });
                    async.map(toRemove, ({path}, callback) => {
                        // Note: ignore error here as with nfs there is a generated file, .nfx<numbers>, presumably a lock file
                        // which causes us to get an EBUSY
                        fs.remove(path, err => callback());
                    }, callback);
                }], err => callback(err, success));
            }
            setImmediate(callback, null, onSubmissionDone);
        }], (err, onSubmissionDone) => {
            callback(err, {onSubmissionDone, log, refreshLog});
        });
    }

    /**
     * @private 
     * @callback HandoffManager~_manageLogsDeletionCallback
     * @param {Error} error
     * @param {Object} result
     * @param {Log} result.log
     * @param {Log} result.refreshLog
     * @param {ErrorCallback} result.onSubmissionDone - To call once the submission is complete
     */
    
    /**
     * Manage the logs for the deletion. 
     *  Create the submission logs.
     *  Email the logs when submission is done.
     *  Close the loggers once we are complete.
     *
     * @private
     * @param {Object} args - will contain info accumulated during submission; which can be included in the email
     * @param {HandoffManager~_manageLogsDeletionCallback} callback
     *
     */
    _manageLogsDeletion(args, callback) {
        const {submissionId, email} = args;
        
        // create the logs
        const log = new logging.Log({
            userLogger: rex.loggerManager.createLogger(`upload-${submissionId}-user`),
            debugLogger: rex.loggerManager.createLogger(`upload-${submissionId}-debug`)
        });
        const refreshLog = new logging.Log({
            userLogger: rex.loggerManager.createLogger(`upload-${submissionId}-user-refresh`),
            debugLogger: rex.loggerManager.createLogger(`upload-${submissionId}-debug-refresh`)
        });
        logMessage(log.userLogger.info, `Submission id: ${submissionId}`);

        // manage the logs
        let success = true;
        let messageBody = '';
        async.waterfall([(callback) => {
            HandoffManager._prepareRefreshLogfile(refreshLog, callback);
        }, (refreshLogFile, refreshOut, refreshPath, callback) => {
            refreshLog.userLogger.on('data', (message) => {
                const {type} = JSON.parse(message.toString());
                if (type === 'error') {
                    refreshOut.write(util.transformLogMessage(message));
                    success = false;
                }
            });
            log.userLogger.on('data', (message) => {
                messageBody += util.transformLogMessage(message);
                if (JSON.parse(message.toString()).type === 'error') {
                    success = false;
                }
            });
            const onSubmissionDone = (err, callback=()=>{}) => {
                if (success && !err) {
                    logMessage(log.userLogger.info, 'Deletion successful');
                }
                else {
                    logMessage(log.userLogger.error, 'Deletion failed');
                }
                const attachments = [{
                    path: refreshLogFile,
                    filename: path.basename(refreshLogFile)
                }];
                const packageName = args.entry ? args.entry.id : 'Unknown';
                async.series([(callback) => {
                    if (email || vars.MAILING_LIST) {
                        util.email({
                            sender: `no-reply@ti.com`,
                            receiver: `${email},${vars.MAILING_LIST}`,
                            subject: `Deletion to ${os.hostname()} of ${packageName} - ${success ? 'COMPLETED' : 'FAILED'}`,
                            payload: messageBody,
                            attachments : success ? [] : attachments
                        }, callback);
                    }
                    else {
                        setImmediate(callback);
                    }
                }, (callback) => {
                    const toRemove = attachments.concat({
                        path: refreshPath
                    });
                    async.map(toRemove, ({path}, callback) => {
                        fs.remove(path, callback);
                    }, callback);
                }], err => callback(err, success));
            }
            setImmediate(callback, null, onSubmissionDone);
        }], (err, onSubmissionDone) => {
            callback(err, {onSubmissionDone, log, refreshLog});
        });
    }

    _cleanupUpload(args, errorOccured, rollbackRefreshLog, callback) {
        const {
            topLevelItems,
            packageFolders,
            downloadFolder,
            extractFolder,
            zipUploads,
            log,
            refreshLog,
            entry
        } = args;
        async.parallel([(callback) => {
            this._submissionManager.cleanupSubmission({
                topLevelItems,
                packageFolders,
                downloadFolder,
                extractFolder,
                log,
                errorOccured,
                entry,
                rollbackRefreshLog
            }, callback);
        }, (callback) => {
            async.map(zipUploads, (upload, callback) => {
                // Ignore the error (this will only exist if we exited before moving the upload to the zips folder)
                fs.remove(upload.path, err => callback());
            }, callback);
        }], (err) => {
            err = errorOccured || err;
            log && log.closeLoggers();
            refreshLog && refreshLog.closeLoggers();
            callback(err);
        });
    }

    static _prepareRefreshLogfile(refreshLog, callback) {
        async.waterfall([(callback) => {
            pathHelpers.getUniqueFolderPath(path.join(vars.CONTENT_BASE_PATH, 'tmp'), callback);
        }, (refreshPath, _, callback) => {
            const refreshLogfile = path.join(refreshPath, 'refresh.html');
            fs.ensureFile(refreshLogfile, (err) => {
                callback(err, refreshLogfile, refreshPath);
            });
        }, (refreshLogfile, refreshPath, callback) => {
            const refreshOut = fs.createWriteStream(refreshLogfile);
            refreshOut.on('open', () => {
                callback(null, refreshLogfile, refreshOut, refreshPath);
            });
        }], callback);
    }
} exports.HandoffManager = HandoffManager;

function logMessage(logMethod, message) {
    logMethod(message, ['handoff']);
}


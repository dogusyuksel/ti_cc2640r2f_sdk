'use strict';
require('rootpath')();

const path = require('path');
const async = require('async');
const fs = require('fs-extra');
const glob = require('glob');

const pathHelpers = require('lib/path-helpers');
const util = require('../util');
const {PackageManager, EntryState} = require('./package-manager');
const rex = require('lib/rex')();
const schemaValidator = require('../schema-validator');
const vars = require('../vars');

/**
 * For managing submissions.
 * Note: the methods of this class always take / return absolute paths.
 *
 */
class SubmissionManager {
    /**
     * @typedef {Object} SubmissionManager~ZipUpload
     * @property {String} path
     * @property {String} originalname
     */
    
    /**
     * @typedef {Object} SubmissionManager~Submission
     * @property {Array.String} assets - Links to the zips associated with this submission.
     * @property {SubmissionManager~ZipUpload} zipUploads - Uploaded zips associated with this submission.
     */

    /**
     * 
     * 
     */
    constructor({contentPackagesConfig,
                 packageManagerFile,
                 handoffFile,
                 contentFolder,
                 zipsFolder,
                 refreshManager}, callback=(()=>{})) {
        this._contentFolder = contentFolder;
        this._zipsFolder = zipsFolder;
        this._refreshManager = refreshManager;
        this._packageManager = new PackageManager(
            contentPackagesConfig,
            packageManagerFile,
            this._contentFolder,
            this._zipsFolder
        );
        this._packageManagerHandoffFile = new PackageManager(
            contentPackagesConfig,
            handoffFile,
            this._contentFolder,
            this._zipsFolder
        );
        this._startup(callback);
    }

    /////////////////////////////////////////
    /// Public Methods
    /////////////////////////////////////////    

    /**
     * @callback SubmissionManager~getSubmissionCallback
     * @param {Error} error
     * @param {Object} result
     *  @param {Array.String} result.zips
     *  @param {Array.String} result.packageFolders
     *  @param {Array.String} result.topLevelItems - The items extracted from the zips
     *  @param {String} result.downloadFolder - The folder the submission was downloaded to.
     *  @param {String} result.extractFolder - The folder the submssion's zips were extracted to
     *  @param {String} result.submissionSubfolder - The unique subfolder where the submssion's data is located relative to the download and extract folders.
     */
    
    /**
     * Retrieve the submission and do any fs operations to prepare its data.
     * 
     * @param {Object} args
     *  @param {SubmissionManager~Submission} args.submission
     *  @param {String} args.submissionFolderPrefix
     *  @param {String} args.submissionId
     *  @param {Log} log
     * @param {SubmissionManager~getSubmissionCallback} callback
     */
    getSubmission({submission: {assets, zipUploads},
                   submissionId,
                   submissionFolderPrefix='Submission',
                   log}, callback) {
        const args = {submissionId};
        async.waterfall([(callback) => {
            this._generateSubmissionFolders(submissionFolderPrefix, callback);
        }, ({downloadFolder, extractFolder, uniqueSubfolder}, callback) => {
            args.downloadFolder = downloadFolder;
            args.extractFolder = extractFolder;
            args.submissionSubfolder = uniqueSubfolder;
            async.parallel([(callback) => {
                async.map(assets, (asset, callback) => {
                    SubmissionManager._downloadAndExtractAsset({
                        asset, extractFolder, downloadFolder, log
                    }, callback);
                }, callback);
            }, (callback) => {
                async.map(zipUploads, (zipUpload, callback) => {
                    SubmissionManager._moveAndExtractZipUploadCallback({
                        zipUpload, extractFolder, downloadFolder, log
                    }, callback);
                }, callback);
            }], (err, results=[]) => {
                const finalResults = results.reduce((result1, result2) => {
                    return result1.concat(result2);
                }, []);
                callback(err, finalResults);
            });
        }, (results, callback) => {
            const validItems = results.filter((item) => {
                return item;
            });
            SubmissionManager._verifyZipCombinationValid({
                zips: validItems.map(item => item.zip), log
            }, err => callback(err, validItems));
        }, (validItems, callback) => {
            const {topLevelItems, zips} = validItems.reduce(({topLevelItems, zips}, current) => {
                const currTopLevelItems = current.topLevelItems;
                const currZip = current.zip;
                return {
                    topLevelItems: topLevelItems.concat(currTopLevelItems),
                    zips: zips.concat([currZip])
                };
            }, {topLevelItems: [], zips: []});
            SubmissionManager.getMissingZips({zips, log}, (err, zips) => {
                callback(err, {zips, topLevelItems});
            });
        }, ({topLevelItems, zips}, callback) => {
            args.topLevelItems = topLevelItems;
            args.zips = zips;
            PackageManager.getPackageFolders(topLevelItems, callback);
        }, (packageFolders, callback) => {
            async.map(packageFolders, (packageFolder, callback) => {
                async.waterfall([(callback) => {
                    const packageMetadataFile = path.join(
                        packageFolder, vars.METADATA_DIR, 'package.tirex.json'
                    );
                    fs.readFile(packageMetadataFile, 'utf8', (err, data) => {
                        callback(null, err, data);
                    });
                }, (err, data, callback) => {
                    if (err) {
                        const packageMetadataFile = path.join(packageFolder, 'package.tirex.json');
                        fs.readFile(packageMetadataFile, 'utf8', (err, data) => {
                            if (err) {
                                return callback('early exit');
                            }
                            callback(err, data);
                        });
                    }
                    else {
                        setImmediate(callback, null, data);
                    }
                }, (data, callback) => {
                    let json = null;
                    try {
                        json = JSON.parse(data);
                    }
                    catch (err) {
                        log.userLogger.error('JSON Syntax error in package.tirex.json');
                        log.userLogger.error(err);
                        return setImmediate(callback, err);
                    }
                    const errors = schemaValidator.validator(json, schemaValidator.SchemaType.PACKAGE_TIREX_JSON);
                    if (errors.length > 0) {
                        log.userLogger.error('Invalid package.tirex.json schema');
                        log.userLogger.error(errors);
                        return setImmediate(callback, errors);
                    }
                    setImmediate(callback, null, packageFolder);
                }], callback);
            }, callback);
        }, (packageFolders, callback) => { // verify no package folders === extract folder
            const packageNoBasefolder = packageFolders.find((pkg) => {
                return pathHelpers.normalize(pkg) === pathHelpers.normalize(args.extractFolder);
            });
            if (packageNoBasefolder) {
                const msg = 'Extracted package has no base folder, ensure the package zip includes the base folder';
                logMessage(log.userLogger.error, msg);
                setImmediate(callback, new Error(`No subfolder for ${packageNoBasefolder}`));
            }
            else {
                setImmediate(callback, null, packageFolders);
            }
        }, (packageFolders, callback) => {
            async.map(packageFolders, (packageFolder, callback) => {
                PackageManager.setupPackageFolderSubfolder({
                    packageFolder, extractFolder: args.extractFolder
                }, callback);
            }, callback);
        }, (packageFolders, callback) => {
            args.packageFolders = packageFolders;
            PackageManager.zipsMirrorPackageFolderStructure({
                downloadFolder: args.downloadFolder,
                extractFolder: args.extractFolder,
                zips: args.zips,
                packageFolders: args.packageFolders
            }, callback);
        }, (newZips, callback) => { // verify exactly 1 package in the submission
            args.zips = newZips;
            if (args.packageFolders.length === 0) {
                const msg = 'Could not find any tirex packages in the handoff. Please check that tirex metadata is included in the submission, i.e .metadata/.tirex is present.';
                logMessage(log.userLogger.error, msg);
                setImmediate(callback, new Error('Nothing to handoff'));
            }
            else if (args.packageFolders.length > 1) {
                SubmissionManager._verifySinglePackageInSubmission(args.packageFolders, log, callback);
            }
            else {
                setImmediate(callback);
            }
        }], (err) => {
            if (err) {
                async.each([args.extractFolder, args.downloadFolder], (item, callback) => {
                    if (item) {
                        fs.remove(item, () => callback());
                    }
                    else {
                        setImmediate(callback);
                    }
                }, () => callback(err));
            }
            else {
                callback(err, args);
            }
        });
    }

    /**
     * @callback SubmissionManager~stageSubmissionCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry
     */

    /**
     * Stage the submission.
     * 
     * @param {Object} args
     *  @param {Array.String} args.packageFolders
     *  @param {Array.String} args.zips
     *  @param {String} args.submissionId
     *  @param {String} args.email
     *  @param {String} args.downloadFolder
     *  @param {String} args.extractFolder
     *  @param {Log} args.log
     *  @param {Boolean} args.replace - If false, do not allow replacing a package
     * @param {SubmissionManager~stageSubmissionCallback} callback
     */
    stageSubmission({
        packageFolders, zips, submissionId, email,
        downloadFolder, extractFolder,
        log, replace=true
    }, callback) {
        const stageMappingZips = zips.map((src) => {
            const dst = path.join(
                this._zipsFolder,
                pathHelpers.getRelativePath(path.dirname(src), downloadFolder),
                path.basename(src)
            );
            const relDst = path.join(
                pathHelpers.getRelativePath(path.dirname(dst), this._zipsFolder),
                path.basename(dst)
            );
            return {src, dst, relDst};
        });        
        const stageMappingPackageFolders = packageFolders.map((src) => {
            const dst = path.join(
                this._contentFolder, 
                pathHelpers.getRelativePath(src, extractFolder)
            );
            const relDst = pathHelpers.getRelativePath(dst, this._contentFolder);
            return {src, dst, relDst};
        });

        let entry = null;
        async.waterfall([(callback) => {
            PackageManager.getPackageInfo(packageFolders[0], callback);
        }, (packageInfo, callback) => {
            if (!packageInfo) {
                return callback(new Error(`Package info is null; probably missing package folder ${packageFolders[0]}`));
            }
            this._packageManager.getPackageManagerFileEntry(packageInfo, (err, entry) => {
                callback(err, entry, packageInfo);
            });
        }, (entry, packageInfo, callback) => {
            if (entry && !replace) {
                const msg = `${entry.id} version ${entry.version} already exists on server. Please specify the replace option, remove existing version first, or increment the package version.`;
                logMessage(log.userLogger.error, msg);
                return setImmediate(callback, new Error(msg));
            }
            const contentItems = stageMappingPackageFolders
                  .map(item => item.dst)
                  .filter((item) => {
                      if (entry) {
                          const itemRelative = pathHelpers.getRelativePath(item, this._contentFolder)
                          return entry.content.indexOf(itemRelative) === -1;
                      }
                      else {
                          return true;
                      }
                  });
            const zipItems = stageMappingZips
                  .map(item => item.dst)
                  .filter((item) => {
                      if (entry) {
                          const itemRelative = pathHelpers.getRelativePath(item, this._zipsFolder)
                          return entry.zips.indexOf(itemRelative) === -1;
                      }
                      else {
                          return true;
                      }
                  });
            const items = zipItems.concat(contentItems);
            PackageManager.verifyItemsDoNotExist(items, (err, item) => {
                if (err) {
                    const msg = `${item} already exists on the server. Check that the zip file and package folder are named appropriately.`;
                    logMessage(log.userLogger.error, msg);
                    return callback(err);
                }
                callback(err, packageInfo);
            });
        }, ({id, version}, callback) => {
            entry = {
                id,
                version,
                content: stageMappingPackageFolders.map(mapping => mapping.relDst),
                zips: stageMappingZips.map(mapping => mapping.relDst),
                submissionId, email
            };
            this._packageManager.stagePackage({entry, log}, callback);
        }, (_entry, callback) => { // take the content / zips out of the extract / download folders
            entry = _entry;
            const items = stageMappingZips.concat(stageMappingPackageFolders);
            async.each(items, ({src, dst}, callback) => {
                fs.move(src, dst, callback);
            }, callback);
        }], err => callback(err, entry));
    }

    /**
     * @callback SubmissionManager~saveSubmissionCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Save the submission.
     * 
     * @param {Object} args
     *  @param {Array.String} args.packageFolders
     *  @param {Array.String} args.zips
     *  @param {String} args.submissionId
     *  @param {String} args.email
     *  @param {Log} args.log
     * @param {SubmissionManager~saveSubmissionCallback} callback
     */
    saveSubmission({packageFolders, zips, submissionId, email, log}, callback) {
        const relZips = zips.map((zip) => {
            const relZipFolder = pathHelpers.getRelativePath(
                path.dirname(zip), this._zipsFolder
            );
            return path.join(relZipFolder, path.basename(zip));
        });
        const relPackageFolders = packageFolders.map((pkg) => {
            return pathHelpers.getRelativePath(pkg, this._contentFolder);
        });
        async.waterfall([(callback) => {
            PackageManager.getPackageInfo(packageFolders[0], callback);
        }, ({id, version}, callback) => {
            const entry = {
                id,
                version,
                content: relPackageFolders,
                zips: relZips,
                submissionId, email
            };
            async.parallel([(callback) => {
                this._packageManager.updatePackage({entry, log}, callback);
            }, (callback) => {
                this._packageManagerHandoffFile.updatePackage({
                    entry, log, keepItems: true
                }, callback);
            }], (err, [entry]=[]) => {
                callback(err, entry);
            });
        }], callback);
    }
    
    /**
     * Load the submission into TIRex.
     * 
     * @param {Object} args
     *  @param {Log} args.log
     *  @param {Log} args.refreshLog - defaults to log
     * @param {ErrorCallback} callback
     */
    loadSubmission(args, callback) {
        this._loadSubmission(args, callback);
    }
    
    _loadSubmission({log, refreshLog=null}, callback) {
        if (!refreshLog) {
            refreshLog = log;
        }
        async.series([(callback) => {
            this._packageManager.sortPackagesFile(callback);
        }, (callback) => {
            this._refreshManager.refreshDatabase({log: refreshLog}, callback); 
        }], err => callback(err));
    }

    /**
     * Cleanup the submission after we are done with it.
     * 
     * @param {Object} args
     *  @param {String} args.downloadFolder
     *  @param {String} args.extractFolder
     *  @param {boolean} args.errorOccured
     *  @param {Object} args.entry
     *  @param {Log} args.log
     *  @param {Log} args.rollbackRefreshLog
     * @param {ErrorCallback} callback
     */
    cleanupSubmission({downloadFolder,
                       extractFolder,
                       errorOccured,
                       entry,
                       log,
                       rollbackRefreshLog}, callback) {
        async.parallel([(callback) => {
            if (errorOccured && entry && entry.state === EntryState.STAGED) {
                this._rollbackSubmission({entry, log, refreshLog: rollbackRefreshLog}, callback);
            }
            else {
                setImmediate(callback);
            }
        }, (callback) => {
            async.each([extractFolder, downloadFolder], (item, callback) => {
                if (item) {
                    fs.remove(item, () => callback());
                }
                else {
                    setImmediate(callback);
                }
            }, callback);
        }], callback);
    }

    /**
     * Remove the submission.
     * 
     * @param {Object} args
     *  @param {PackageManager~PackageInfo} args.packageInfo
     *  @param {Log} args.log
     *  @param {Log} args.refreshLog
     *  @param {String} args.submissionId
     * @param {ErrorCallback} callback
     */
    removeSubmission({packageInfo, log, refreshLog, submissionId=null}, callback) {
        const entry = packageInfo;
        entry.submissionId = submissionId;
        async.series([(callback) => {
            this._packageManager.deletePackage({entry, log}, callback);
        }, (callback) => {
            this._refreshManager.refreshDatabase({log: refreshLog}, callback); 
        }], callback);
    }

    /////////////////////////////////////////
    /// Private Methods
    /////////////////////////////////////////

    _startup(callback) {
        async.series([(callback) => {
            this._packageManager.syncPackagesFileToPackageManagerFile({
                log: rex.log
            }, callback);
        }], err => callback(err));
    }
    
    _rollbackSubmission({entry, log, refreshLog}, callback) {
        async.series([(callback) => {
            this._packageManager.rollbackPackage({entry, log}, callback); 
        }, (callback) => {
            this._loadSubmission({log, refreshLog}, callback);
        }], callback);
    }
    
    /**
     * @callback SubmissionManager~_getSubmissionFoldersCallback
     * @param {Error} error
     * @param {Object} result
     *  @param {String} downloadFolder
     *  @param {String} extractFolder
     *  @param {String} uniqueSubfolder
     */
    
    /**
     * Generate unique folders for a submission
     * 
     * @private
     * @param callback(err, {downloadFolder, extractFolder, uniqueSubfolder})
     */
    _generateSubmissionFolders(submissionFolderPrefix, callback) {
        async.waterfall([(callback) => { // get a unique folder to extract to
            pathHelpers.getUniqueFolderPath(
                path.join(this._contentFolder, submissionFolderPrefix),
                (err, extractFolder, uniqueSubfolder) => {
                    callback(err, {uniqueSubfolder, extractFolder});
                }
            );
        }, ({extractFolder, uniqueSubfolder}, callback) => { // ensure the download folder does not exist
            const downloadFolder = path.join(this._zipsFolder, uniqueSubfolder);
            fs.remove(downloadFolder, (err) => {
                callback(err, {downloadFolder, extractFolder, uniqueSubfolder});
            });
        }, ({downloadFolder, extractFolder, uniqueSubfolder}, callback) => {
            async.map([downloadFolder, extractFolder], fs.ensureDir, (err) => {
                callback(err, {downloadFolder, extractFolder, uniqueSubfolder});
            });
        }], callback);
    }

    /////////////////////////////////////////
    /// Static Private Methods
    /////////////////////////////////////////

    /**
     * @private
     * @callback SubmissionManager~_moveAndExtractZipUploadCallback
     * @param {Error} error
     * @param {Object} result
     * @param {Array.String} result.topLevelItems - all the top level files / folders that were extracted.
     * @param {String} result.zip
     */
    
    /**
     * Move and extract the zipUpload at the given url.
     *
     * @private
     * @param {Object} args
     *  @param {SubmissionManager~ZipUpload} args.zipUpload
     *  @param {String} args.extractFolder - The folder to extract the asset to.
     *  @param {String} args.downloadFolder - The folder to download the zip to.
     *  @param {Log} args.log
     * @param {SubmissionManager~_moveAndExtractZipUploadCallback} callback
     */ 
    static _moveAndExtractZipUploadCallback({zipUpload, extractFolder, downloadFolder, log}, callback) {
        async.waterfall([(callback) => {
            const zipDst = path.join(downloadFolder, zipUpload.originalname);
            fs.move(zipUpload.path, zipDst, (err) => {
                callback(err, zipDst);
            });
        }, (zip, callback) => {
            if (zip.indexOf('__linux') > -1 || zip.indexOf('__all') > -1) {
                // don't extract other platform zips
                // since we don't handle it in tirex anyways
                const msg = `Failed to extract ${zip}. Please ensure you are using the recommended zip utility.`;
                util.extract(
                    zip, extractFolder, null, (err, topLevelItems) => {
                        log.handleError(
                            [err, {topLevelItems, zip}], callback, {userMessage: msg}
                        );
                    }
                );
            }
            else {
                callback(null, {topLevelItems: [], zip});
            }
        }], callback); 
    }

    /**
     * @private
     * @callback SubmissionManager~_downloadAndExtractAssetCallback
     * @param {Error} error
     * @param {Object} result
     * @param {Array.String} result.topLevelItems - all the top level files / folders that were extracted.
     * @param {String} result.zip
     */
    
    /**
     * Download and extract the asset at the given url.
     *
     * @private
     * @param {Object} args
     *  @param {String} args.asset - The url to the asset (a zip file).
     *  @param {String} args.extractFolder - The folder to extract the asset to.
     *  @param {String} args.downloadFolder - The folder to download the zip to.
     *  @param {Log} args.log
     * @param {SubmissionManager~_downloadAndExtractAssetCallback} callback
     */
    static _downloadAndExtractAsset({asset,
                                     extractFolder,
                                     downloadFolder,
                                     log}, callback) {
        async.waterfall([(callback) => {
            util.downloadFile(
                asset, downloadFolder, function() {
                    const msg = `Failed to download ${asset}. Please verify the url and that it is accessible within ti.`;
                    log.handleError(arguments, callback, {userMessage: msg});
                }); 
        }, (zip, callback) => {
            if (zip.indexOf('__linux') > -1 || zip.indexOf('__all') > -1) {
                // don't extract other platform zips
                // since we don't handle it in tirex anyways
                util.extract(zip, extractFolder, null, (err, topLevelItems) => {
                    const msg = `Failed to extract ${zip}. Please ensure you are using the recommended zip utility.`;
                    log.handleError(
                        [err, {topLevelItems, zip}], callback, {userMessage: msg}
                    );
                });
            }
            else {
                callback(null, {topLevelItems: [], zip});
            }
        }], callback); 
    }

    /**
     * Verify the combination of zips submitted are valid.
     * 
     * @private
     * @param {Object} args
     *  @param {Array.String} args.zips
     *  @param {Log} args.log
     * @param {ErrorCallback} callback
     */
    static _verifyZipCombinationValid({zips, log}, callback) {
        const viewableZips = zips.filter(
            zip => zip.indexOf('__linux') > -1 || zip.indexOf('__all') > -1
        );
        if (viewableZips.length === 0) {
            const msg = `Could not find linux zip (minimum requirement). Please check that zip file(s) are following naming convention and a __linux.zip or __all.zip is included.`;
            logMessage(log.userLogger.error, msg);
            return setImmediate(callback, new Error('No __linux or __all zip in handoff'));
        }

        const allZips = zips.filter(
            zip => zip.indexOf('__all') > -1
        );
        const platformSpecifcZips = zips.filter(
            zip => zip.indexOf('__all') === -1
        );
        if (allZips.length > 0 && platformSpecifcZips.length > 0) {
            const msg = 'Mixture of platform specific (__win, __linux, __macos) and __all zip files are not supported. Please upload one or the other.';
            logMessage(log.userLogger.error, msg);
            return setImmediate(callback, new Error('Mix of __all & platform specify zips in handoff'));
        }
        else if (platformSpecifcZips.length > 0) {
            const macZips = platformSpecifcZips.filter(
                zip => zip.indexOf('__macos') > -1
            );
            const linuxZips = platformSpecifcZips.filter(
                zip => zip.indexOf('__linux') > -1
            );
            const winZips = platformSpecifcZips.filter(
                zip => zip.indexOf('__win') > -1
            );
            if (winZips.length === 0 || linuxZips.length === 0 || macZips.length === 0) {
                const msg = 'Submission does not include zip files for all os platforms. It is recommended to include all platforms.';
                logMessage(log.userLogger.warning, msg);
            }
        }

        return setImmediate(callback);
    }

    /**
     * @callback SubmissionManager~_getMissingZipsCallback
     * @param {Error} error
     * @param {Array.String} zips - The zips (including the missing ones which were added)
     */
    
    /**
     * Get the missing zips.
     *
     * @param {Object} args
     *  @pram {Array.String} args.zips
     *  @param {Log} args.log
     * @param {SubmissionManager~_downloadAndExtractAssetCallback} callback
     */
    static getMissingZips({zips, log}, callback) {
        async.waterfall([(callback) => {
            const zipFolders = Array.from(new Set(zips.map(zip => path.dirname(zip))));
            async.map(zipFolders, (zipFolder, callback) => {
                async.waterfall([(callback) => {
                    fs.readdir(zipFolder, callback);
                }, (zipFolderContents, callback) => {
                    async.map(zipFolderContents, (zipFolderContent, callback) => {
                        const zip = path.join(zipFolder, zipFolderContent);
                        fs.stat(zip, (err, stats) => {
                            if (err) {
                                // This can happen for broken links
                                return callback(null, null);
                            }
                            callback(err, stats.isFile() ? zip : null);
                        });  
                    }, callback);
                }], (err, zipFiles) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(err, zipFiles.filter(zipFile => zipFile));
                });
            }, callback);
        }, (zipFiles, callback) => {
            async.map(zipFiles, (zipFiles, callback) => {
                const allZip = zipFiles.find(zipFile => zipFile.indexOf('__all') > -1);
                if (allZip) {
                    const relativeAllZip = path.basename(allZip);
                    const missingZips = ['__linux', '__win', '__macos'].map((suffix) => {
                        return allZip.replace('__all', suffix);
                    });
                    async.each(missingZips, (missingZip, callback) => {
                        fs.symlink(relativeAllZip, missingZip, callback);
                    }, err => {
                        callback(err, zipFiles.concat(missingZips));
                    });
                }
                else {
                    setImmediate(callback, null, zipFiles);
                }
            }, (err, zipFiles) => {
                if (err) {
                    return callback(err);
                }
                const zips = zipFiles.reduce((item1, item2) => {
                    return item1.concat(item2);
                }, []);
                callback(err, zips);
            });
        }], callback);
    }

    /**
     * Verify that there is only one package in the submission
     * 
     * @private
     * @param {Array.String} packageFolders
     * @param {ErrorCallback} callback
     */
    static _verifySinglePackageInSubmission(packageFolders, log, callback) {
        if (packageFolders.length > 1) {
            async.waterfall([(callback) => {
                PackageManager.getPackageInfo(packageFolders[0], callback);
            }, ({id, version}, callback) => {
                async.map(packageFolders.slice(1), (folder, callback) => {
                    PackageManager.getPackageInfo(folder, (err, info) => {
                        if (info.id !== id || info.version !== version) {
                            const msg = 'Multiple packages in one submission'
                            logMessage(log.userLogger.error, msg);
                            return callback(new Error(msg));
                        }
                        callback();
                    });
                }, callback);
            }], err => callback(err));
        }
        else {
            setImmediate(callback);
        }
    }
}

module.exports = SubmissionManager;

function logMessage(logMethod, message) {
    logMethod(message, ['handoff']);
}

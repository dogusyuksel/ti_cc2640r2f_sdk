'use strict';
require('rootpath')();

const path = require('path');
const glob = require('glob');
const async = require('async');
const fs = require('fs-extra');

const vars = require('lib/vars');
const pathHelpers = require('lib/path-helpers');

const Tasks = {
    GET_PACKAGE_MANAGER_FILE_ENTRY: 'getPackageManagerFileEntry',
    UPDATE_PACKAGE: 'updatePackage',
    STAGE_PACKAGE: 'stagePackage',
    ROLLBACK_PACKAGE: 'rollbackPackage',
    DELETE_PACKAGE: 'deletePackage',
    UPDATE_PACKAGES_FILE: 'updatePackagesFile',
    SORT_PACKAGES_FILE: 'sortPackagesFile',
    SYNC_PACKAGES_FILE_TO_PACKAGE_MANAGER_FILE: 'syncPackagesFileToPackageManagerFile'
};

const EntryState = {
    STAGED: 'staged',
    VALID: 'valid' /* default */
}; exports.EntryState = EntryState;

/**
 * Manages packages in a content folder.
 * 
 */
class PackageManager {
    /**
     * @typedef {Object} PackageManager~Entry
     * @property {String} state - The entryState
     * @property {String} submissionId
     * @property {String} email
     * @property {String} id
     * @property {String} version
     * @property {Array.String} content - Relative to the content folder.
     * @property {Array.String} zips - Relative to the zips folder.
     * @property {Array.String} backupContent (for EntryState.STAGED only) - Relative to the content folder
     * @property {Array.String} backupZips (for EntryState.STAGED only) - Relative to the content folder
     * @property {String} backupFolder (for EntryState.STAGED only) - Relative to the content folder.
     */

    /**
     * @typedef {Object} PackageManager~PackageInfo
     * @property {String} id
     * @property {String} version
     * @property {String} type
     */
    
    /**
     * Note: All paths are absolute.
     *
     * @param {String} contentPackagesConfig - i.e default.json
     * @param {String} packageManagerFile - i.e tirex.json
     * @param {String} contentFolder
     */
    constructor(contentPackagesConfig, packageManagerFile, contentFolder, zipsFolder) {
        this._contentPackagesConfig = contentPackagesConfig;
        this._packageManagerFile = packageManagerFile;
        this._contentFolder = contentFolder;
        this._zipsFolder = zipsFolder;
        this._updateQueue = async.queue((task, callback) => {
            this._processTask(task, callback);
        });
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Public Functions
    ///////////////////////////////////////////////////////////////////////////

    /**
     * @callback PackageManager~getPackageManagerFileEntryCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry - null if not found
     * @param {integer} idx - -1 if not found
     */
    
    /**
     * Get the entry in the package manager file.
     * 
     * @param {PackageManager~PackageInfo} entry
     * @param {PackageManager~getPackageManagerFileEntryCallback} callback
     */
    getPackageManagerFileEntry(args, callback) {
        this._updateQueue.push({task: Tasks.GET_PACKAGE_MANAGER_FILE_ENTRY, args}, callback);
    }
    
    _getPackageManagerFileEntry({id, version}, callback) {
        const targetId = id;
        const targetVersion = version;
        PackageManager._readJson(this._packageManagerFile, (err, {packages}) => {
            if (err) {
                return callback(err);
            }
            const packageEntryIdx = packages.findIndex(({id, version}) => {
                return id === targetId && version === targetVersion;
            });
            callback(
                err,
                packageEntryIdx > -1 ? packages[packageEntryIdx] : null,
                packageEntryIdx
            );
        });
    }
    
    /**
     * @callback PackageManager~updatePackageCallback
     * @param {Error} err
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Update the package (may be a new package).
     *
     * @param {Object} args
     *  @param {PackageManager~Entry} args.entry - The entry to update.
     *  @param {Log} args.log
     *  @param {Boolean} args.rollback - This is a rollback.
     *  @param {Boolean} args.deletePackage - This is a delete.
     * @param {ErrorCallback} callback
     */
    updatePackage(args, callback) {
        this._updateQueue.push({task: Tasks.UPDATE_PACKAGE, args}, callback);
    }

    _updatePackage({entry, log, rollback=false, deletePackage=false, keepItems=false}, callback) {
        const {content} = entry;
        async.waterfall([(callback) => {
            this._updatePackageManagerFileEntry({
                entry, log, rollback, deletePackage, keepItems
            }, callback);
        }, (oldEntry, entry, callback) => {
            this._updatePackagesFile({
                addPackageFolders: content,
                removePackageFolders: (oldEntry ? oldEntry.content : []),
                log,
                mergeWithExisting: true
            }, err => callback(err, entry));
        }], callback);
    }

    /**
     * @callback PackageManager~stagePackageCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Stage the package (may be a new package). 
     * Note: you cannot stage a package that is already staged.
     * 
     * @param {Object} args
     *  @param {PackageManager~Entry} args.entry - The entry to stage.
     *  @param {Log} args.log
     * @param {ErrorCallback} callback
     */
    stagePackage(args, callback) {
        this._updateQueue.push({task: Tasks.STAGE_PACKAGE, args}, callback);
    }

    _stagePackage({entry, log}, callback) {
        const {content} = entry;
        async.waterfall([(callback) => {
            this._stagePackageManagerFileEntry({entry, log}, callback);
        }, (oldEntry, entry, callback) => {
            this._updatePackagesFile({
                addPackageFolders: content,
                removePackageFolders: (oldEntry ? oldEntry.content : []),
                log,
                mergeWithExisting: true
            }, err => callback(err, entry));
        }], callback);
    }

    /**
     * @callback PackageManager~rollbackPackageCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Revert the entry to the backup. Returns an error if the package is not staged. Deletes the package if we don't have the backup
     * 
     * @param {Object} args
     *  @param {PackageManager~Entry} args.entry
     *  @param {Log} args.log
     * @param {PackageManager~rollbackPackageCallback} callback
     */
    rollbackPackage(args, callback) {
        this._updateQueue.push({task: Tasks.ROLLBACK_PACKAGE, args}, callback);
    }

    _rollbackPackage({entry, log}, callback) {
        let newEntry = null;
        async.waterfall([(callback) => {
            this._getPackageManagerFileEntry(entry, callback);
        }, (_entry, idx, callback) => {
            if (entry.state !== EntryState.STAGED) {
                setImmediate(callback, new Error(`Trying to rollback an entry which is not staged ${JSON.stringify(entry)}`));
            }
            else if (entry.submissionId !== _entry.submissionId) {
                setImmediate(callback, new Error(`Submission Id does not match package manager file entry ${entry.submissionId}`));
            }
            else if (!entry.backupContent && !entry.backupZips) { // Nothing to rollback to
                setImmediate(callback, null, true);
            }
            else { // Verify backup still exists
                entry = _entry;
                const backupZips = entry.backupZips.map(item => path.join(this._contentFolder, item));
                const backupContent = entry.backupContent.map(item => path.join(this._contentFolder, item));
                const backupItems = backupZips.concat(backupContent);
                PackageManager.verifyItemsExist(backupItems, err => callback(null, err != null));   
            }
        }, (deletePackage, callback) => {
            if (deletePackage) {
                this._deletePackage({entry, log}, err => callback(err || 'early exit'));
            }
            else {
                setImmediate(callback);
            }
        }, (callback) => {
            const prevContent = entry.backupContent.map(
                content => getContentDst(content, entry.backupFolder)
            );
            const prevZips = entry.backupZips.map(
                zip => getZipDst(zip, entry.backupFolder)
            );
            newEntry = {
                id: entry.id,
                version: entry.version,
                content: prevContent,
                zips: prevZips
            };
            this._updatePackage({entry: newEntry, log, rollback: true}, (err, entry) => {
                newEntry = entry
                callback(err);
            });
        }, (callback) => { // move the backup to its original location
            async.parallel([(callback) => {
                async.each(entry.backupContent, (content, callback) => {
                    fs.move(path.join(this._contentFolder, content), path.join(
                        this._contentFolder, getContentDst(content, entry.backupFolder)
                    ), callback);
                }, callback);
            }, (callback) => {
                async.each(entry.backupZips, (zip, callback) => {
                    fs.move(path.join(this._contentFolder, zip), path.join(
                        this._zipsFolder, getZipDst(zip, entry.backupFolder)
                    ), callback);
                }, callback);
            }], err => callback(err));
        }, (callback) => {
            fs.remove(path.join(this._contentFolder, entry.backupFolder), callback);
        }], err => callback(err !== 'early exit' ? err : null, newEntry));

        function getZipDst(backupZip, backupFolder) {
            const zipDstRel = pathHelpers.getRelativePath(path.dirname(backupZip), path.join(backupFolder, 'zips'));
            return path.join(zipDstRel, path.basename(backupZip));
        }

        function getContentDst(backupContent, backupFolder) {
            return pathHelpers.getRelativePath(backupContent, path.join(backupFolder, 'content'));
        }
    }
    
    /**
     * @callback PackageManager~deletePackageCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Delete the package
     * 
     * @param {Object} args
     *  @param {PackageManager~Entry} args.entry - specify 'all' for version to delete all versions
     *  @param {Log} args.log
     * @param {PackageManager~deletePackageCallback} callback
     */
    deletePackage(args, callback) {
        this._updateQueue.push({task: Tasks.DELETE_PACKAGE, args}, callback);
    }

    _deletePackage({entry, log}, callback) {
        async.waterfall([(callback) => {
            if (entry.version !== 'all') {
                this._getPackageManagerFileEntry(entry, (err, entry) => {
                    callback(err, entry ? [entry] : null);
                });
            }
            else {
                const targetId = entry.id;
                PackageManager._readJson(this._packageManagerFile, (err, {packages}) => {
                    if (err) {
                        return callback(err);
                    }
                    const entries = packages.filter(({id}) => {
                        return id === targetId;
                    });
                    callback(err, entries.length > 0 ? entries : null);
                });
            }
        }, (entries, callback) => {
            if (!entries) {
                logMessage(log.userLogger.error, `Package does not exist on the server. Please ensure you have specified the correct package id and version to delete (received id: ${entry.id}, version: ${entry.version})`);
                return setImmediate(callback, new Error(`Entry ${JSON.stringify(entry)} does not exist`));
            }
            async.mapSeries(entries, (entry, callback) => {
                async.waterfall([(callback) => {
                    this._updatePackage({entry, log, deletePackage: true}, callback);
                }, (entry, callback) => {
                    this._updatePackagesFile({
                        addPackageFolders: [],
                        removePackageFolders: entry.content,
                        log,
                        mergeWithExisting: true
                    }, callback);
                }], callback);
            }, callback);
        }, (entries, callback) => {
            setImmediate(callback, entries[0]);
        }], callback);
    }

    /**
     * Update the contentPackagesConfig with the added / removed package folders
     *
     * @param {Object} args
     *  @param {Array.String} args.addPackageFolders - Any package folders we wish to add (relative to the content folder).
     *  @param {Array.String} args.removePackageFolders - Any package folders we wish to remove (relative to the content folder).
     *  @param {Log} args.log
     *  @param {Boolean} arg.mergeWithExisting - If true, keep existing package folders in the config file.
     * @param {ErrorCallback} callback
     *
     * Note: if you request to remove and add the same package folder, it will be added, not removed.
     */
    updatePackagesFile(args, callback) {
        this._updateQueue.push({task: Tasks.UPDATE_PACKAGES_FILE, args}, callback);
    }
    
    _updatePackagesFile({addPackageFolders=[],
                         removePackageFolders=[],
                         log,
                         mergeWithExisting=false}, callback) {
        addPackageFolders = addPackageFolders.map((pkg) => {
            return pathHelpers.normalize(pkg);
        });
        removePackageFolders = removePackageFolders
            .map((pkg) => {
                return pathHelpers.normalize(pkg);
            })
            .filter((pkg) => {
                return addPackageFolders.indexOf(pkg) < 0;
            });
        async.waterfall([(callback) => {
            if (mergeWithExisting) {
                PackageManager._readJson(this._contentPackagesConfig, (err, oldPackages) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(err, PackageManager._mergePackages(
                        oldPackages, addPackageFolders
                        )); 
                    });
            }
            else {
                setImmediate(callback, null, addPackageFolders);
            }
        }, (packages, callback) => {
            const finalPackageFolders = packages.filter((pkg) => {
                return removePackageFolders.indexOf(pkg) < 0;
            });
            fs.writeJson(this._contentPackagesConfig, finalPackageFolders, callback);
        }], callback);
    }

    /**
     * Sort the packages by the following rules:
     *     - Group the packages with the same id
     *     - Sort groups by the first occurrence of that id in the contentPackagesConfig 
     *
     * @param {ErrorCallback} callback
     */
    sortPackagesFile(callback) {
        this._updateQueue.push({task: Tasks.SORT_PACKAGES_FILE, args: null}, callback);
    }

    _sortPackagesFile(_, callback) {
        async.waterfall([(callback) => {
            fs.readJson(this._contentPackagesConfig, callback);
        }, (packages, callback) => {
            const fullPaths = packages.map((pkg) => {
                return {
                    fullPath: path.join(this._contentFolder, pkg), relativePath: pkg
                };
            });
            async.map(fullPaths, ({fullPath, relativePath}, callback) => {
                PackageManager.getPackageInfo(fullPath, (err, info) => {
                    callback(err, {relativePath, info});
                });
            }, callback);
        }, (result, callback) => {
            const infoResult = result.filter(item => item.info);
            
            // groups ordered by first occurrence of a package with that id
            let groups = [];
            infoResult.forEach(({info: {id}}) => {
                if (groups.indexOf(id) === -1) {
                    groups.push(id);
                }
            });

            const packagesNoData = result.filter(item => !item.info);
            const newEntries = groups
                  .map(id => infoResult.filter(item => item.info.id === id))
                  .reduce((accum, item) => accum.concat(item), [])
                  .concat(packagesNoData)
                  .map(item => item.relativePath);
            fs.writeJson(this._contentPackagesConfig, newEntries, callback);
        }], err => callback(err));
    }

    /**
     * Sync the packages file to the package manager file.
     *
     * @param {Object} args
     *  @param {Log} args.log
     * @param {ErrorCallback} callback
     */
    syncPackagesFileToPackageManagerFile(args, callback) {
        this._updateQueue.push({
            task: Tasks.SYNC_PACKAGES_FILE_TO_PACKAGE_MANAGER_FILE, args
        }, callback);
    }

    _syncPackagesFileToPackageManagerFile({log}, callback) {
        async.waterfall([(callback) => {
            async.parallel([(callback) => {
                PackageManager._readJson(this._packageManagerFile, callback);
            }, (callback) => {
                PackageManager._readJson(this._contentPackagesConfig, callback);
            }], callback);
        }, ([packageManagerFileJson, contentPackagesConfigJson], callback) => {
            PackageManager._getMissingPackages({
                packageManagerFileJson, contentPackagesConfigJson,
                contentFolder: this._contentFolder
            }, callback);
        }, (missingPackagesInfo, callback) => {
            async.map(missingPackagesInfo, (missingPackageInfo, callback) => {
                this._deduceZips(missingPackageInfo, callback);
            }, callback);
        }, (missingPackages, callback) => {
            async.eachSeries(missingPackages, (entry, callback) => {
                this._updatePackageManagerFileEntry({entry, log}, callback);
            }, callback);
        }], err => callback(err));
    }

    ////////////////////////////////////////
    /// Static Members
    ////////////////////////////////////////

    /**
     * @callback PackageManager~setupPackageFolderSubfolderCallback
     * @param {Error} error
     * @param {String} newPackageFolder
     */
    
    /**
     * Put the package folder into a subfolder under certain conditions.
     * Conditions:
     *  If it's a non-software package put it under the 'tirex-product-tree' subfolder
     * 
     * @param {Object} args
     *  @param {String} args.extractFolder
     *  @param {String} args.packageFolder 
     * @param {PackageFolder~setupPackageFolderSubfolderCallback} callback
     */
    static setupPackageFolderSubfolder({packageFolder, extractFolder}, callback) {
        async.waterfall([(callback) => {
            this.getPackageInfo(packageFolder, callback);
        }, ({type}, callback) => {
            if (type === 'software')  {
                setImmediate(callback, null, packageFolder);
            }
            else {
                const pkgPath = path.relative(extractFolder, packageFolder);
                const dst = path.join(extractFolder, 'tirex-product-tree', pkgPath);
                if (pathHelpers.isSubfolder(dst, packageFolder)) {
                    return setImmediate(callback, new Error(`Cannot have ${dst} be a subfolder of ${packageFolder}; this will cause move to fail and the folder to be deleted`));
                }
                fs.move(packageFolder, dst, (err) => {
                    callback(err, dst);
                });
            }
        }], callback);
    }
    
    /**
     * @callback PackageManager~zipsMirrorPackageFolderStructureCallback
     * @param {Error} error
     * @param {Array.String} newZips - absolute paths.
     */
    
    /**
     * Create a folder structure in the downloadFolder which mirrors the packages folder structure in the extractFolder, then move the zips into the folders structures in the downloadFolder. 
     * Note: all paths are absolute
     *
     * @param {Object} args
     *  @param {String} args.downloadFolder - Where the zips were downloaded.
     *  @param {String} args.extractFolder - Where the packages were extracted.
     *  @param {Array.String} args.zips
     *  @param {Array.String} args.packageFolders - Subfolders of extractFolder which are packages. (absolute paths, must be in the extractFolder).
     * @param {PackageManager~zipsMirrorPackageFolderStructureCallback} callback
     */
    static zipsMirrorPackageFolderStructure({downloadFolder,
                                             extractFolder,
                                             zips,
                                             packageFolders}, callback) {
        // TODO map zip folders to packageFolders so we don't need to copy
        // all the zips into every folder structure
        const relativePackageFolders = packageFolders
              .filter((pkg) => {
                  return pathHelpers.isSubfolder(pkg, extractFolder);
              })
              .map((pkg) => {
                  return pathHelpers.getRelativePath(pkg, extractFolder);
              })
        async.waterfall([(callback) => {
            async.map(relativePackageFolders, (pkgFolder, callback) => {
                const zipFolder = path.join(downloadFolder, pkgFolder);
                fs.ensureDir(zipFolder, (err) => {
                    callback(err, zipFolder);
                });
            }, callback);
        }, (zipFolders, callback) => {
            async.map(zipFolders, (zipFolder, callback) => {
                // shouldn't need to do this for every zip
                // only the ones for the package (TODO above).
                async.map(zips, (zip, callback) => {
                    const newZip = path.join(zipFolder, path.basename(zip));
                    fs.copy(zip, newZip, (err) => {
                        callback(err, newZip);
                    });
                }, callback);
            }, (err, newZipLists) => {
                const newZips = newZipLists.reduce((newZips1, newZips2) => {
                    return newZips1.concat(newZips2);
                }, []);
                callback(err, newZips);
            });
        }, (newZips, callback) => { // remove the original zips
            async.map(zips, (zip, callback) => {
                fs.remove(zip, callback);
            }, (err) => {
                callback(err, newZips);
            });
        }], callback);
    }

    /**
     * @callback PackageManager~getPackageFoldersCallback
     * @param {Error} error
     * @param {Array.string} packages - absolute paths.
     */
    
    /**
     * Search the items for packages (folders containing a package.tirex.json file).
     * Note: all paths are absolute.
     *
     * @param {Array.string} items - folders to search.
     *  Note: (may contain files, folders must end with path.sep)
     * @param {PackageManager~getPackageFoldersCallback} callback
     */
    static getPackageFolders(items, callback) {
        const folders = items.filter((item) => {
            return /(\/|\\)$/.test(item);
        });
        if (folders.length === 0) {
            callback(null, []);
            return;
        }
        async.map(folders, (folder, callback) => {
            glob(path.join(folder, '**/package.tirex.json'), {dot: true}, (err, files) => {
                if (err) {
                    return callback(err);
                }
                const pkgFolders = files.map((packageFile) => {
                    if (packageFile.indexOf(path.join(vars.METADATA_DIR, 'package.tirex.json')) > -1) {
                        return pathHelpers.removePathPiece(path.dirname(packageFile), vars.METADATA_DIR);
                    }
                    return pathHelpers.normalize(path.dirname(packageFile));
                });
                callback(err, pkgFolders);
            });
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            const result = results.reduce((r1, r2) => {
                return r1.concat(r2);
            });
            callback(err, result);
        });
    }

    /**
     * @callback getPackageInfoCallback
     * @param {Error} error
     * @param {PackageManager~PackageInfo} info - null if it does not exist
     */
    
    /**
     * Get the package.tirex.json based package info
     *
     * @param {String} packageFolder - absolute path to the package.
     * @param {PackageManager~PackageInfo} callback
     */
    static getPackageInfo(packageFolder, callback) {
        async.waterfall([(callback) => {
            const packageMetadataFile = path.join(
                packageFolder, vars.METADATA_DIR, 'package.tirex.json'
            );
            fs.readJson(packageMetadataFile, (err, data) => {
                callback(null, err, data);
            });
        }, (err, data, callback) => {
            if (err) {
                const packageMetadataFile = path.join(packageFolder, 'package.tirex.json');
                fs.readJson(packageMetadataFile, (err, data) => {
                    if (err) {
                        return callback('early exit');
                    }
                    callback(err, data);
                });
            }
            else {
                setImmediate(callback, null, data);
            }
        }, ([{id, version, type=null}], callback) => {
            // Version is only meaningful for software packages;
            // since we only support multiple versions for software packages.
            type = (!type || type === 'software') ? 'software' : type;
            if (type === 'software') {
                setImmediate(callback, null, {id, version, type});
            }
            else {
                setImmediate(callback, null, {id, version: '*', type});   
            }
        }], (err, info) => {
            if (err === 'early exit') { // not found; return null
                callback(null, null);
            }
            else {
                callback(err, info);
            }
        });
    }

    /**
     * Verify that the items do not exist
     * 
     * @param {Array.String} items - A list of absolute paths to files / folders
     * @param {ErrorCallback} callback
     */
    static verifyItemsDoNotExist(items, callback) {
        async.map(items, (item, callback) => {
            fs.stat(item, (err) => {
                callback(null, err ? null : item);
            });
        }, (err, results) => {
            const existingItem = results.find(result => result);
            if (existingItem) {
                callback(new Error(`The item ${existingItem} already exists`), existingItem);
            }
            else {
                callback();
            }
        });
    }

    /**
     * Verify that the items exist
     * 
     * @param {Array.String} items - A list of absolute paths to files / folders
     * @param {ErrorCallback} callback
     */
    static verifyItemsExist(items, callback) {
        async.map(items, (item, callback) => {
            fs.stat(item, (err) => {
                callback(null, err ? null : item);
            });
        }, (err, results) => {
            const existingItem = results.find(result => !result);
            if (existingItem) {
                callback(new Error(`The item ${existingItem} does not exists`));
            }
            else {
                callback();
            }
        });
    }

    ///////////////////////
    // Private Functions
    //////////////////////

    _processTask({args, task}, callback) {
        async.waterfall([(callback) => {
            async.parallel([(callback) => {
                this._initPackageManagerFile(callback);
            }, (callback) => {
                this._initPackagesFile(callback);
            }], err => callback(err));
        }, (callback) => {
            if (task === Tasks.GET_PACKAGE_MANAGER_FILE_ENTRY) {
                this._getPackageManagerFileEntry(args, callback);
            }
            else if (task === Tasks.UPDATE_PACKAGE) {
                this._updatePackage(args, callback);
            }
            else if (task === Tasks.STAGE_PACKAGE) {
                this._stagePackage(args, callback);
            }
            else if (task === Tasks.UPDATE_PACKAGES_FILE) {
                this._updatePackagesFile(args, callback);
            }
            else if (task === Tasks.SORT_PACKAGES_FILE) {
                this._sortPackagesFile(args, callback);
            }
            else if (task === Tasks.DELETE_PACKAGE) {
                this._deletePackage(args, callback);
            }
            else if (task === Tasks.ROLLBACK_PACKAGE) {
                this._rollbackPackage(args, callback);
            }
            else if (task === Tasks.SYNC_PACKAGES_FILE_TO_PACKAGE_MANAGER_FILE) {
                this._syncPackagesFileToPackageManagerFile(args, callback);
            }
            else {
                setImmediate(callback, new Error(`Unknown task ${task}`));
            }
        }], callback);
    }
    
    /**
     * @private
     * @callback PackageManager~_updatePackageManagerFileEntryCallback
     * @param {Error} error
     * @param {PackageManager~Entry} oldEntry
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Update the entry in the package manager file and it's content / zips (it may be a new entry).
     * By default this will:
     *    Update the entry in the package manager file.
     *    If the entry already existed & it is staged delete the backup content / zips. If it isn't staged delete the content / zips.
     * 
     * @private
     * @param {Object} args
     *  @param {PackageManager~Entry} args.entry
     *  @param {Log} args.log
     *  @param {Boolean} args.rollback - If true, rollback the staged entry. This will delete the staged content / zips and will revert the package manager file entry. Note: this does not copy back the old content / zips from the backup location; you can do so in the callback.
     *  @param {Boolean} args.deletePackage - If true, delete the entry in the package manger file along with it's content / zips.
     *  @param {Boolean} args.keepItems  - If true, don't delete the content / zips.
     * @param {PackageManager~_updatePackageManagerFileEntryCallback} callback
     */
    _updatePackageManagerFileEntry({entry, log, rollback=false, deletePackage=false, keepItems=false}, callback) {
        { // Make a shallow copy of entry; since we are going to add / remove properties from it
            const newEntry = {};
            Object.keys(entry).forEach((key) => {
                newEntry[key] = entry[key];
            });
            entry = newEntry;
        }
        const args = {};
        async.waterfall([(callback) => { // get the entry
            this._getPackageManagerFileEntry(entry, callback);
        }, (oldEntry, idx, callback) => { // update the list of packages
            args.oldEntry = oldEntry;
            PackageManager._readJson(this._packageManagerFile, (err, data) => {
                const {packages} = data;
                if (err) {
                    return callback(err);
                }
                if (idx > -1) {
                    if (!deletePackage)  {
                        packages[idx] = entry;
                    }
                    else {
                        packages.splice(idx, 1);
                    }
                }
                else if (!deletePackage) {
                    packages.push(entry);
                }
                args.data = data;
                args.entry = entry;
                callback();
            });
        }, (callback) => { // remove the old content & zips
            const {oldEntry} = args;
            if (!oldEntry || keepItems) {
                return setImmediate(callback);
            }

            // Ignore the errors for fs.remove (i.e if one item contains another then we try to delete it twice) or if it was manually deleted.
            if (oldEntry.state === EntryState.STAGED && !rollback && !deletePackage) {
                if (oldEntry.backupFolder) {
                    fs.remove(path.join(this._contentFolder, oldEntry.backupFolder), err => callback());
                }
                else {
                    setImmediate(callback);
                }
            }
            else {
                const {content, zips} = oldEntry;
                async.parallel([(callback) => {
                    async.each(content, (item, callback) => {
                        fs.remove(path.join(this._contentFolder, item), err => callback());
                    }, callback);
                }, (callback) => {
                    async.each(zips, (item, callback) => {
                        fs.remove(path.join(this._zipsFolder, item), err => callback());
                    }, callback);
                }], err => callback(err));
            }
        }, (callback) => { // update the package manager file
            const {data, oldEntry, entry} = args;
            entry.state = EntryState.VALID;
            delete args.entry.backupContent;
            delete args.entry.backupZips;
            delete args.entry.backupFolder;
            fs.writeJson(this._packageManagerFile, data, (err) => {
                callback(err, oldEntry, entry);
            });
        }], callback);
    }

    /**
     * @private
     * @callback PackageManager~_stagePackageManagerFileEntryCallback
     * @param {Error} error
     * @param {PackageManager~Entry} oldEntry
     * @param {PackageManager~Entry} entry
     */
    
    /**
     * Stage the entry in the package manager file (it may be a new entry)
     * 
     * @private
     * @param {Object} args
     *  @param {PackageManager~Entry} args.entry
     *  @param {Log} args.log
     * @param {PackageManager~_updatePackageManagerFileEntryCallback} callback
     */
    _stagePackageManagerFileEntry({entry, log}, callback) {
        { // Make a shallow copy of entry; since we are going to add / remove properties from it
            const newEntry = {};
            Object.keys(entry).forEach((key) => {
                newEntry[key] = entry[key];
            });
            entry = newEntry;
        }
        const args = {};
        async.waterfall([(callback) => { // get the entry
            this._getPackageManagerFileEntry(entry, callback);
        }, (oldEntry, idx, callback) => { // update the list of packages
            args.oldEntry = oldEntry;
            PackageManager._readJson(
                this._packageManagerFile, (err, data) => {
                    const {packages} = data;
                    if (err) {
                        return callback(err);
                    }
                    if (idx > -1) {
                        packages[idx] = entry;
                    }
                    else {
                        packages.push(entry);
                    }
                    data.packages = packages;
                    args.data = data;
                    args.entry = entry;
                    callback();
                }
            );
        }, (callback) => { // create a unique backup folder if we need one
            const {oldEntry, data} = args;
            if (!oldEntry) {
                return setImmediate(callback, null, null, null);
            }
            else if (oldEntry.state === EntryState.STAGED) {
                const msg = 'Trying to stage an already staged package';
                logMessage(log.debugLogger.error, msg);
                return setImmediate(callback, new Error(msg));
            }
            pathHelpers.getUniqueFolderPath(
                path.join(this._contentFolder, 'backup'), callback
            );
        }, (backupFolder, _, callback) => { // move the old content & zips
            const {oldEntry} = args;
            args.backupFolder = backupFolder;
            if (!oldEntry) {
                return setImmediate(callback, null, null);
            }

            // Put the backup zips in a 'zips' subfolder
            // Put the backup content in a 'content' subfolder
            // We do this incase there is an overlap in the paths and the content / zips merge
            const {content, zips} = oldEntry;
            async.parallel([(callback) => {
                async.map(content, (item, callback) => {
                    const backup = path.join(backupFolder, 'content', item);
                    fs.move(
                        path.join(this._contentFolder, item),
                        backup, () => callback(null, backup)
                    );
                }, callback);
            }, (callback) => {
                async.map(zips, (zip, callback) => {
                    const backup = path.join(backupFolder, 'zips', zip);
                    fs.move(
                        path.join(this._zipsFolder, zip),
                        backup, () => callback(null, backup)
                    );
                }, callback);
            }], (err, result) => {
                if (err) {
                    return callback(err);
                }
                const [contentBackups, zipBackups] = result;
                callback(err, {
                    content: contentBackups.map((pkg) => {
                        return pathHelpers.getRelativePath(pkg, this._contentFolder);
                    }),
                    zips: zipBackups.map((zip) => {
                        const relZipFolder = pathHelpers.getRelativePath(
                            path.dirname(zip), this._contentFolder
                        );
                        return path.join(relZipFolder, path.basename(zip));
                    })
                });
            });
        }, (backup, callback) => { // update the package manager file
            const {oldEntry, data, entry} = args;
            entry.state = EntryState.STAGED;
            if (oldEntry) {
                entry.backupContent = backup.content;
                entry.backupZips = backup.zips;
                entry.backupFolder = pathHelpers.getRelativePath(args.backupFolder, this._contentFolder);
            }
            fs.writeJson(this._packageManagerFile, data, (err) => {
                callback(err, oldEntry, entry);
            });
        }], callback);
    }

    /**
     * @private 
     * @callback PackageManager~_deduceZipsCallback
     * @param {Error} error
     * @param {PackageManager~Entry} entry
     */

    /**
     * Deduce the set of zips for a package based on the missing package info.
     * 
     * @param {PackageManager~_MissingPackageInfo} missingPackage
     * @param {PackageManager~_deduceZipsCallback} callback
     */
    _deduceZips(missingPackage, callback) {
        const zipFolders = missingPackage.content.map((packageFolder) => {
            return path.join(this._zipsFolder, packageFolder);
        });
        async.map(zipFolders, (zipFolder, callback) => {
            async.waterfall([(callback) => {
                fs.readdir(zipFolder, (err, contents) => {
                    if (err) {
                        callback('early exit');
                    }
                    else {
                        callback(err, contents);
                    }
                });
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
                if (err === 'early exit') {
                    return callback(null, null);
                }
                callback(err, zipFiles.filter(zipFile => zipFile));
            });
        }, (err, result) => {
            if (err) {
                return callback(err);
            }
            const zips = result
                  .filter(item => item)
                  .reduce((item1, item2) => {
                      return item1.concat(item2);
                  }, [])
                  .map((absZip) => {
                      return pathHelpers.getRelativePath(absZip, this._zipsFolder);
                  });
            callback(err, {
                id: missingPackage.id,
                version: missingPackage.version,
                content: missingPackage.content,
                zips
            });
        });
    }

    /**
     * Initialize the package manager file.
     *
     * @private
     * @param {ErrorCallback} callback
     */
    _initPackageManagerFile(callback) {
        async.series([(callback) => { // make sure the file exists
            fs.stat(this._packageManagerFile, (err) => {
                if (err) {
                    fs.outputFile(this._packageManagerFile, '', callback);
                }
                else {
                    callback();
                }
            });
        }, (callback) => { 
            PackageManager._readJson(this._packageManagerFile, (err, json) => {
                if (Array.isArray(json) && json.length === 0) { // un-initialized
                    fs.writeJson(this._packageManagerFile, {packages: []}, callback);
                }
                else {
                    setImmediate(callback);
                }
            });
        }], callback);
    }

    /**
     * Initialize the packages file.
     *
     * @private
     * @param {ErrorCallback} callback
     */
    _initPackagesFile(callback) {
        async.series([(callback) => { // make sure the file exists
            fs.stat(this._contentPackagesConfig, (err) => {
                if (err) {
                    // Try 1 more time before failing
                    fs.stat(this._contentPackagesConfig, err => callback(err));
                }
                else {
                    callback();
                }
            });
        }, (callback) => {
            async.waterfall([(callback) => {
                PackageManager._readJson(this._contentPackagesConfig, callback);
            }, (json, callback) => {
                if (Array.isArray(json) && json.length === 0) { // un-initalized
                    fs.writeJson(this._contentPackagesConfig, json, callback);
                }
                else {
                    setImmediate(callback);
                }
            }], callback);
        }], err => callback(err));
    }

    ///////////////////////////////////////////////////////////////////////////
    /// Private Static Functions
    ///////////////////////////////////////////////////////////////////////////
    
    /**
     * @private
     * @typedef {Object} PackageManager~_MissingPackageInfo
     * @property {String} id
     * @property {String} version
     * @property {Array.String} content
     */
    
    /**
     * @private 
     * @callback PackageManager~_getMissingPackagesCallback
     * @param {Error} error
     * @param {Array.PackagesManager~_MissingPackageInfo} missingPackageInfo
     */
    
    /**
     * Get the list of packages in contentPackagesConfigJson not in packageManagerFileJson
     * 
     * @private
     * @param {Object} args
     *  @param {Object} args.packageManagerFileJson
     *  @param {Object} args.contentPackagesConfigJson
     *  @param {Object} args.contentFolder
     * @param {PackageManager~_getMissingPackagesCallback} callback
     * 
     */
    static _getMissingPackages({packageManagerFileJson, contentPackagesConfigJson, contentFolder}, callback) {
        async.waterfall([(callback) => {
            let existingContentFolders = packageManagerFileJson.packages
                .map(pkg => pkg.content)
                .reduce((item1, item2) => {
                    return item1.concat(item2);
                }, [])
                .map(contentFolder => pathHelpers.normalize(contentFolder));
            existingContentFolders = Array.from(new Set(existingContentFolders));
            const missingContentFolders = contentPackagesConfigJson
                  .map(contentFolder => pathHelpers.normalize(contentFolder))
                  .filter(contentFolder => existingContentFolders.indexOf(contentFolder) === -1);
            async.map(missingContentFolders, (pkg, callback) => {
                PackageManager.getPackageInfo(path.join(contentFolder, pkg), (err, info) => {
                    if (err || !info) {
                        return callback(err, info);
                    }
                    info.content = [pkg];
                    callback(err, info);
                });
            }, callback);
        }, (potentialMissingPackages, callback) => {
            const missingPackages = potentialMissingPackages
                  .filter(item => item)
                  .filter(({id, version}) => {
                      const existingPackage = packageManagerFileJson.packages.find((pkg) => {
                          return pkg.id === id && pkg.version === version;
                      });
                      return !existingPackage;
                  });
            const groupedMissingPackages = {};
            missingPackages.forEach(({id, version, content}) => {
                if (groupedMissingPackages[[id, version]]) {
                    groupedMissingPackages[[id, version]].content =
                        groupedMissingPackages[[id, version]].content.concat(content);
                }
                else {
                    groupedMissingPackages[[id, version]] = {
                        id, version, content
                    };
                }
            });
            const finalMissingPackages = Object.keys(groupedMissingPackages)
                  .map(key => groupedMissingPackages[key])
            // This second map is a workaround since the entries are recorded without a trailing slash
                  .map(entry => {
                      entry.content = entry.content.map(item => {
                          if (item.endsWith(path.sep)) {
                              return item.substring(0, item.length - 1);
                          }
                          else {
                              return item;
                          }
                          return entry;
                      })
                      return entry;
                  });
            setImmediate(callback, null, finalMissingPackages);
        }], callback);
    }

    
    
    /** 
     * Read json from the file. Handles the case where the file is empty.
     *
     * @private
     * @param {String} file
     * @param callback(err, json)
     * @param {Object} emptyValue - The value of the json if the file is empty.
     */
    static _readJson(file, callback, emptyValue=[]) {
        fs.readFile(file, (err, data) => {
            if (err) {
                return callback(err);
            }
            callback(
                err,
                data.toString()
                    .replace(/(\r?\n|\r)|\'|\"/g, '')
                    .trim()
                    .length > 0 ? JSON.parse(data) : emptyValue
            );
        });
    }

    /**
     * Merge the packages into a unique set of packages.
     * 
     * @private
     * @param {Array.String} oldPackages - The old relative package folders.
     * @param {Array.String} newPackages - The new relative package folders.
     * 
     * @returns {Array.String} mergedPackages - The unique set of old and new
     *  packages.
     */
    static _mergePackages(oldPackages, newPackages) {
        let merged = oldPackages
            .concat(newPackages)
            .map((pkg) => {
                return pathHelpers.normalize(pkg);
            });

        // cast to a set for uniqueness
        return Array.from(new Set(merged));
    }
} exports.PackageManager = PackageManager;

function logMessage(logMethod, message) {
    logMethod(message, ['handoff']);
}

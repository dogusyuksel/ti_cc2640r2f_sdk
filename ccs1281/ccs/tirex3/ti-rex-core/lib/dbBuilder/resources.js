/**
 *
 * Resource Database schema
 * ========================
 * @property {String} name (mandatory) ('/' converted to '_')
 * @property {String} description
 * @property {Array}  categories (mandatory) : an array of paths ('/' converted to '_')
 * @property {String} location/link: link to the resource content (relative to the json file if
 *      local path) (the type of the link target is specified in resourceType)
 * @property {String} locationForDownload/linkForDownload: if a different link is to be used for
 *      OS-specific download: any, win, win32, win64, linux, linux32, linux64, macos (relative to
 *      the json file if local path)
 * @property {String} resourceType (mandatory): folder, folder.importable, file, file.importable,
 *     file.executable, project.ccs, project.energia, web.app, web.page, other, categoryInfo (aka
 *     overview), packageOverview, bundle
 * @property {Array}  devices: an array of references to an item in the 'device' tree table (forced
 *     to uppercase, '/' converted to '_') NOTE: metadataVersion >= 2.1: user specifies device ids,
 *     which is then replaced with device names during refresh metadataVersion = 2.0:  user
 *     specifies device names
 * @property {Array}  devtools: an array of references to an item in the 'devtool' tree table
 *     NOTE: metadataVersion >= 2.1: user specifies devtool ids, which is then replaced with
 *     devtool names during refresh metadataVersion = 2.0:  user specifies devtool names
 * @property {Array}  devtools_category: if present used for injection instead of devtools, then
 *     merged with devtools
 * @property {Array}  tags: array of strings
 * @property {String} image: path to image (relative to the json file if local path)
 * @property {String} language
 * @property {String} ide: "CCS 5.4", "CCS 5", "Energia", "IAR 2.2", etc
 *
 * resourceType 'categoryInfo/overview'
 * @property {String} name (mandatory) ('/' converted to '_')
 * @property {String} description: html
 * @property {Array}  categories (mandatory) : an array of paths ('/' converted to '_')
 * @property {String} resourceType: categoryInfo/overview
 * @property {String} image: path to image (relative to the json file if local path)
 *
 * Package header: (converted to 'packageOverview internally):
 * @property {String} name (-> package) (mandatory)
 * @property {String} id (mandatory): globally unique package id
 * @property {String} description
 * @property {String} version
 * @property {Array}  rootCategory (defaults to name; but can also be empty): the mount point (each
 *     resource's category paths will be prefixed with the root category)
 * @property {Array}  devices: devices this package applies to
 * @property {String} supplements
 * @property {String} image (relative to the json file if local path)
 * @property {String} license: path to the license file (relative to the json file if local path)
 * @property {String} tags
 * @property {Boolean} allowPartialDownload (defaults to false): if false the download request to
 *     any resource results in the download of the entire package
 *
 * resourceType 'bundle', and packages (packageOverview), categoryInfos (overview) and resources
 *     (all types)
 * @property {String} id
 * @property {String} name
 * @property {String} description: html
 * @property {String} version
 * @property {String} includedResources (aka resources)
 * @property {String, or Array} includedFiles (aka files):
 * @property {String} includedUrls (aka urls)
 * @property {String} require: 'optional', 'mandatory', 'implicit'}
 * @property {String} INTERNAL ONLY FOR NOW (how to deal with multiple messages for the same
 *     bundle?) message {String}: may be shown to the end user explaining why this bundle is
 *     optional or mandatory (not shown if implicit)
 * @property {Boolean} canBePartial
 * @property {String} resourceType: bundle
 *
 * the following fields will be added by the DB builder:
 * @property {String} linkType: local, external
 * @property {String} projectSpec: if resourceType is project.ccs and extension is .projectSpec
 * @property {String} fullPaths: array of all full paths for this resource item; a resource item's
 *     full path is made up of: device path + package + category path, e.g. msp430 / msp430f2xx /
 *     msp430f212 / msp430ware / documents / datasheets / ds.pdf
 * @property {String} importProject
 * @property {String} generateProject
 * @property {Number} order
 */

'use strict';

require('rootpath')();

const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const semver = require('semver');
const versioning = require('../versioning');
const vars = require('../vars');
const idHelper = require('./idHelper');
const preproc = require('./preproc');
const utils = require('./dbBuilderUtils');
const devices = require('./devices');
const devtools = require('./devtools');

const fsutils = require('../localserver/fsutils');

const loggerResources = {
    log() {
    }
};

/**
 * Clear log
 */
exports.clearLog = function () {
};

/**
 * Refresh the resource database
 * @param packagePath
 * @param packageOrder
 * @param dbResources - the resource database
 * @param dbOverviews - the overview database
 * @param dbPureBundles - the bundle database
 * @param dbDevices - the device database
 * @param dbDevtools - the devtools database
 * @param packageMacros
 * @param {Log} log
 * @param callback(err, logFile) - called when an error occurs.
 */
exports.refresh = function (packagePath, packageOrder, dbResources, dbOverviews, dbPureBundles,
                            dbDevices, dbDevtools, packageMacros, log, callback) {
    loggerResources.log = (type, message) => {
        if (type === 'debug') {
            return;
        }
        if (log.userLogger[type]) {
            log.userLogger[type](message);
        } else {
            log.userLogger.info(message);
        }
    };

    vars.getMetadataDir(packagePath, function (metadataDir) {
        utils.getPackageMetadata(packagePath, metadataDir, packageMacros, loggerResources, function (err, vID, packageMetadata) {
            if (err || !packageMetadata) {
                loggerResources.log('error', 'Skipping all resources in ' + packagePath + ' due to error: ' + JSON.stringify(err));
                return callback(); // abort resource refresh in this package, continue with next
            }
            const files = getFiles(metadataDir);
            let packageHeader = null;
            async.eachSeries(files, function (file, callback) {
                processFile(file, packageHeader, packageMetadata, function (err, newHeader) {
                    if (err || !newHeader) {
                        callback(err);
                    } else {
                        packageHeader = newHeader;
                        callback();
                    }
                });
            }, (err) => {
                if (err) {
                    loggerResources.log('error', 'Skipping all resources in ' + packagePath + ' due to error: ' + JSON.stringify(err));  // abort resource refresh in this package, continue with next
                }
                setImmediate(callback);
            });
        });
    });

    /**
     * Return the json files we need to processes, with
     * their paths relative to the package directory.
     *
     * @param {string} metadataDir - The metadata directory.
     *
     * @returns {Array.<string>} files - A list of files with their paths
     * relative to the package directory.
     */
    function getFiles(metadataDir) {
        const files = fsutils.readDirRecursive(path.join(vars.CONTENT_BASE_PATH, packagePath),
                                               // '*.content.tirex.json' OR 'content.tirex.json'
                                               /(.*\.content\.tirex\.json$)|(content\.tirex\.json$)/);

        // Metadata_2.1 : skip '2.0_devices.content.tirex.json' & '2.0_devtools.content.tirex.json'
        // handle the 'package.tirex.json' file
        // Note: we put it first so we can process it first
        const _files = [path.join(metadataDir, 'package.tirex.json')];
        /*
          files = [path.join(metadataDir, 'package.tirex.json')].concat(files);
          return files;
        */
        for (let i = 0; i < files.length; i++) {
            if (files[i].indexOf('2.0_devices.content.tirex.json') >= 0 ||
                files[i].indexOf('2.0_devtools.content.tirex.json') >= 0) {
                continue;
            }
            _files.push(files[i]);
        }
        return _files;
        // ]
    }

    /**
     * Process a json file
     *
     * @param {string} file - The filename relative to the package directory.
     * @param callback(err, newPackageHeader).
     *
     */
    function processFile(file, packageHeader, packageMetadata, callback) {
        const fileWithFullPath = path.join(vars.CONTENT_BASE_PATH, packagePath, file);
        preproc.processFile(fileWithFullPath, packageMacros, loggerResources,
                            function (err, preprocResult) {
                                if (err || !preprocResult) {
                                    return callback(err);
                                }
                                // jsonDir - relative to the json directory
                                const jsonDir = path.join(packagePath, path.dirname(file));
                                exports._process(
                                    preprocResult.records, packagePath, packageOrder,
                                    jsonDir, path.basename(file), dbResources, dbOverviews,
                                    dbPureBundles, dbDevices, dbDevtools,
                                    packageHeader, packageMetadata, callback
                                );
                            });
    }
};

exports._process = function (resourceList, packagePath, packageOrder, jsonDir, jsonFile,
                             dbResources, dbOverviews, dbPureBundles, dbDevices, dbDevtools,
                             packageHeader, packageMetadata, callbackFinal) {
    // James: would be nice if we passed callback to the functions rather than capturing it
    // so I wouldn't have to resort to this
    const callback = (err) => {
        callbackFinal(err, packageHeader);
    };

    const pureBundles = [];
    syncProcessing(resourceList, dbOverviews, (err, resourceList) => {
        if (err) {
            return callback(err);
        }
        // Async processing captures the callback and will call it
        asyncProcessing(resourceList);
    });

    /**
     * Check if a property is pointing to a local file or not. If yes, prefix it with the json dir
     * path. Otherwise assume it's an external link and leave it alone
     * @param obj
     * @param prop
     */
    function prefixAndSetLinkType(obj, prop) {
        const prefixedPath = path.join(jsonDir, obj[prop]);
        if (!packageHeader.restrictions ||
            packageHeader.restrictions.indexOf(vars.METADATA_PKG_IMPORT_ONLY) === -1) {
            if (fs.existsSync(path.join(vars.CONTENT_BASE_PATH, prefixedPath)) === true) {
                // local file
                obj[prop] = prefixedPath;
                if (prop === 'link') {
                    obj.linkType = 'local';
                }
            } else {
                // external resource
                if (prop === 'link') {
                    obj.linkType = 'external';
                }
                if (obj[prop].indexOf('://') === -1) {
                    loggerResources.log('warning', 'Not a local file and not a URL either: ' + obj[prop]);
                }
            }
        } else {
            // Import Only:
            // The package in the cloud may be metadata only; so the local links
            // may point to files that don't exist. 
            const isLocal = obj[prop].indexOf('://') === -1;
            if (prop === 'link') {
                obj.linkType = isLocal ? 'local' : 'external';
            }
            if (isLocal) {
                obj[prop] = prefixedPath;
            }
        }
    }


    /**
     * SYNC PROCESSING STEP (order is important!)
     */
    function syncProcessing(resourceList, dbOverviews, callback) {
        loggerResources.log('info', 'Starting Phase 1 (sync) processing');
        const includedFileResources = [];
        const folderResources = [];
        let implictDepedenciesMapping = null;

        try {
            const depDir = path.join(vars.CONTENT_BASE_PATH, jsonDir, vars.DEPENDENCY_DIR);
            implictDepedenciesMapping = fs.readJsonSync(
                path.join(depDir, vars.IMPLICIT_DEPENDENCY_MAPPING_FILE));
        } catch (err) {
            loggerResources.log('warning', JSON.stringify(err)); // does not exist, continue
        }

        let z = -1;
        async.eachSeries(resourceList, (resourceRecord, callback) => {
            z++;
            loggerResources.log('debug', 'Sync Processing ' + resourceRecord.name);

            // create uuid for record - IMPORTANT: do this before and without making any
            // modifications to the record!
            const resourceHashObj = idHelper.createUuid(resourceRecord, packageHeader);
            resourceRecord._id = resourceHashObj.idVal;

            const error = initalizeResourceRecordProperties(resourceRecord, z);
            if (error) {
                return setImmediate(callback, error);
            }
            renameResourceRecordProperties(resourceRecord);
            processCategories(resourceRecord, packageMetadata);

            // validation: check for missing or empty fields
            if (resourceRecord.package == null && resourceRecord.resourceType !== 'bundle') { // don't do this for package headers or bundles
                if (resourceRecord.name == null || resourceRecord.name === '') {
                    loggerResources.log('error', 'Field \'name\' is missing or empty. Skipping entry: ' + JSON.stringify(resourceRecord));
                    return setImmediate(callback); // TODO: skip it also in ASNYC PROC STEP
                }
                if (resourceRecord.resourceType == null || resourceRecord.resourceType === '') {
                    loggerResources.log('error', 'Field \'resourceType\' is missing or empty. Skipping entry: ' + JSON.stringify(resourceRecord));
                    return setImmediate(callback); // TODO: skip it also in ASNYC PROC STEP
                }
                if (resourceRecord.categories == null &&
                    Array.isArray(resourceRecord.categories) === false) {
                    loggerResources.log('error', 'Field \'categories\' is missing or empty. Skipping entry: ' + JSON.stringify(resourceRecord));
                    return setImmediate(callback); // TODO: skip it also in ASNYC PROC STEP
                }
                if (resourceRecord.resourceType !== 'overview' && (resourceRecord.link == null || resourceRecord.link === '')) {
                    loggerResources.log('warning', 'Field \'link\' is missing or empty: ' + JSON.stringify(resourceRecord));
                }
                // handle backward compatibility:
                // multiple category paths are deprecated (wrap single path in another array and
                // keep multiple paths in the code just in case...)
                if (Array.isArray(resourceRecord.categories[0]) === false) {
                    resourceRecord.categories = [resourceRecord.categories];
                }
            }
            if (resourceRecord.package && !resourceRecord.id) {
                resourceRecord.id = resourceRecord.package; // TODO: This is temporary only
                // TODO: id will be made mandatory, i.e. fail and exit here then
                // loggerResources.log('error', 'Field \'id\' is missing in package info. Skipping
                // package: ' + JSON.stringify(resourceRecord)); setImmediate(callback);
            }
            if (resourceRecord.supplements) {
                if (!resourceRecord.supplements.versionRange || !resourceRecord.supplements.packageId) {
                    const msg = `Missing field for supplements - package ${resourceRecord.id}`;
                    loggerResources.log('error', msg);
                    return setImmediate(callback, msg);
                } else if (!semver.validRange(resourceRecord.supplements.versionRange)) {
                    const msg = `Invalid semver range ${resourceRecord.supplements.versionRange} for ${resourceRecord.id}`;
                    loggerResources.log('error', msg);
                    return setImmediate(callback, msg);
                }
            }

            // Bundle Support: note that packages, categoryInfos, resources are all considered
            // bundles, but for any explicitly defined pure bundles (as separate record or inlined)
            // we just generate the id and skip the rest of the processing
            if (resourceRecord.resourceType === 'bundle') {
                if (resourceRecord.id != null) {
                    // remember in which package this bundle was defined
                    resourceRecord.packageId = packageHeader.packageId;
                    resourceRecord.packageVersion = packageHeader.packageVersion;
                    resourceRecord.packageUId = packageHeader.packageUId;
                    // add the full, unrecursed list to the record (i.e unfiltered, not recursed
                    // into dirs and which is to be used for downloading)
                    resourceRecord.includedFilesForDownload =
                        exports._processIncludedFiles(resourceRecord, packageHeader).forDownload;
                    pureBundles.push(resourceRecord);
                } else {
                    // w/o id they can't be referenced
                    loggerResources.log('warning', 'Pure bundles must have a id. Skipping: ' + JSON.stringify(resourceRecord));
                }
                return setImmediate(callback);
            }

            async.waterfall([(callback) => {
                // if there's a 'package' record as the very first record get the rootCategory for
                // where the records are to be mounted
                if (z === 0 && packageHeader == null) {
                    if (resourceRecord.package != null) {
                        async.series([(callback) => {
                            processRootCategory(resourceRecord, packageMetadata, callback);
                        }, (callback) => {
                            resourceRecord.allowPartialDownload = resourceRecord.allowPartialDownload === 'true';

                            // package header is passed on to all content json files
                            packageHeader = {
                                package: resourceRecord.package,
                                packageVersion: resourceRecord.version,
                                packageId: resourceRecord.id,
                                packageUId: resourceRecord.id + vars.PACKAGE_ID_VERSION_DELIMITER + resourceRecord.version,
                                root: resourceRecord.rootCategory,
                                packageLicense: resourceRecord.license,
                                devices: resourceRecord.devices,
                                devtools: resourceRecord.devtools,
                                devtools_category: resourceRecord.devtools_category,
                                tags: resourceRecord.tags,
                                coreDependencies: resourceRecord.coreDependencies,
                                allowPartialDownload: resourceRecord.allowPartialDownload,
                                deprecates: resourceRecord.deprecates,
                                restrictions: resourceRecord.restrictions
                            };

                            // convert the 'package' record to an 'packageOverview' record which
                            // additionally contains the same fields as regular 'overview' records
                            // to conform with regular overview records the last element of root
                            // categories is assumed to be the name and is dropped. If it's not
                            // equivalent to the name the overview will not be shown for the package
                            // which is intended
                            resourceRecord.name = resourceRecord.package;
                            const l = resourceRecord.rootCategory.length;
                            if (l > 0) {
                                resourceRecord.categories = [deepCopy(resourceRecord.rootCategory)];
                                resourceRecord.categories[0].splice(l - 1, 1);
                            } else {
                                resourceRecord.categories = [[]];
                            }
                            resourceRecord.packagePath = packagePath;
                            resourceRecord.packageOrder = packageOrder;
                            resourceRecord.resourceType = 'packageOverview';
                            // bundle: add all resources in the package as the default
                            if (resourceRecord.includedResources == null) {
                                resourceRecord.includedResources = [];
                            }
                            resourceRecord.includedResources.push({
                                package: resourceRecord.id + vars.BUNDLE_ID_VERSION_DELIMITER
                                    + resourceRecord.version
                            }); // a query
                            // bundle: add all files in the package as the default
                            if (resourceRecord.includedFiles == null) {
                                resourceRecord.includedFiles = [];
                            }
                            resourceRecord.includedFiles.push('.');
                            setImmediate(callback);
                        }], err => callback(err));
                    } else {
                        const err = 'First record must be a package header. Cannot proceed.';
                        loggerResources.log('error', err);
                        return setImmediate(callback, err);
                    }
                } else {
                    setImmediate(callback);
                }
            }, (callback) => {
                // discover inlined bundle definitions and create separate pure bundle records for
                // them TODO: some same processing here as for other resources; should collect all
                // inline bundles first and then run them through the regular processing in a 2nd
                // pass
                const depProps = ['dependencies', 'coreDependencies'];
                for (let dp = 0; dp < depProps.length; dp++) {
                    const depArr = resourceRecord[depProps[dp]];
                    if (depArr != null) {
                        for (let ds = 0; ds < depArr.length; ds++) {
                            const dep = depArr[ds];
                            if ('packageId' in dep) {
                                dep.refId = dep.packageId;
                                delete dep.packageId;
                            }
                            if (!('refId' in dep)) {
                                // no 'refId' property, i.e. this is a new bundle definition
                                // (packageId is an alias for refId for better usability)
                                const pureBundle = deepCopy(dep);
                                pureBundle._id
                                    = idHelper.createUuid(pureBundle, packageHeader).idVal;
                                // IMPORTANT: make sure the pureBundle is still unaltered, i.e. as
                                // specified by content provide in the metadata json
                                if (pureBundle.id == null) {
                                    pureBundle.id = pureBundle._id;
                                }

                                // TODO get rid of semver field; only for b/w compatibility
                                if (pureBundle.version == null) {
                                    pureBundle.version = 'UNVERSIONED';
                                    pureBundle.semver = '0.0.0';
                                } else {
                                    pureBundle.semver = versioning.convertToSemver(pureBundle.version) || '0.0.0';
                                }
                                // remember in which package this bundle was defined
                                pureBundle.packageId = packageHeader.packageId;
                                pureBundle.packageVersion = packageHeader.packageVersion;
                                pureBundle.packageUId = packageHeader.packageUId;
                                pureBundle.packagePath = packagePath;
                                // handle backward compatibility:
                                if (pureBundle.resources != null) {
                                    pureBundle.includedResources = pureBundle.resources;
                                    delete pureBundle.resources;
                                }
                                if (pureBundle.files != null) {
                                    pureBundle.includedFiles = pureBundle.files;
                                    delete pureBundle.files;
                                }
                                if (pureBundle.urls != null) {
                                    pureBundle.includedUrls = pureBundle.urls;
                                    delete pureBundle.urls;
                                }
                                pureBundle.includedFilesForDownload
                                    = exports._processIncludedFiles(pureBundle, packageHeader).forDownload;
                                pureBundle.resourceType = 'bundle';
                                depArr[ds] = { refId: pureBundle.id, version: pureBundle.version };
                                // replace the dep with a reference to the bundle
                                pureBundles.push(pureBundle);
                            }
                        }
                    }
                }

                // now put the package name, id, version and path in all resources (even in
                // packageOverview)
                resourceRecord.package = packageHeader.package;
                // TODO: once we switched fully to packageId no longer put package name in records
                resourceRecord.packageId = packageHeader.packageId;
                resourceRecord.packageVersion = packageHeader.packageVersion;
                resourceRecord.packageUId = packageHeader.packageUId;
                resourceRecord.packagePath = packagePath;
                resourceRecord.allowPartialDownload = packageHeader.allowPartialDownload;
                setImmediate(callback);
            }, (callback) => {
                if (resourceRecord.resourceType !== 'packageOverview') { // don't do this for the package header
                    // add package level core dependencies to each resource
                    if (packageHeader.coreDependencies != null) {
                        resourceRecord.dependencies
                            = resourceRecord.dependencies.concat(packageHeader.coreDependencies);
                    }
                    // prefix category paths with the package root
                    if (packageHeader.root != null && resourceRecord.categories != null) {
                        for (let c = 0; c < resourceRecord.categories.length; c++) {
                            if (resourceRecord.categories[c] != null) {
                                Array.prototype.splice.apply(resourceRecord.categories[c],
                                                             [0, 0].concat(packageHeader.root));
                            }
                        }
                    }
                    setImmediate(callback, null, null);
                } else if (resourceRecord.supplements) {
                    resourceRecord.dependencies.push({
                        refId: resourceRecord.supplements.packageId,
                        versionRange: resourceRecord.supplements.versionRange,
                        require: 'optional',

                        // for b/w compatibility
                        semver: resourceRecord.supplements.semver
                    });
                    getSuplementedPackages(resourceRecord, packageMetadata, callback);
                } else {
                    setImmediate(callback, null, null);
                }
            }, (supplementedOverviews, callback) => {
                if (!supplementedOverviews) {
                    return setImmediate(callback);
                }
                // Note we setup supplemental dependencies so the supplemented package only depends on the latest version which supplements it. We don't keep track of which dependencies were injected via supplemental vs explicit so if someone specifies an explicit dependency to a package which it is supplemented by only the latest version between the explicit dependency and the supplemental will be selected (the expected behaviour is likely to get both latest supplemental + explicit dependency). We don't really care since this isn't a real use case & we don't support this
                async.eachSeries(supplementedOverviews, (supplementedOverview, callback) => {
                    // check if there is a package dependency in the supplementedOverview to a newer version of resourceRecord.id
                    const newerVersionPresent = supplementedOverview.dependencies.find((dependency) => {
                        return resourceRecord.id === dependency.refId &&
                            versioning.ltr(resourceRecord.version, dependency.versionRange);
                    });
                    if (!newerVersionPresent) {
                        // remove any dependencies to older versions
                        supplementedOverview.dependencies = supplementedOverview.dependencies.filter(
                            dependency => dependency.refId !== resourceRecord.id
                        );

                        // add ourselves as a dependency
                        supplementedOverview.dependencies.push({
                            refId: resourceRecord.id,
                            versionRange: resourceRecord.version,
                            require: 'optional',

                            // for b/w compatibility
                            semver: resourceRecord.semver,
                            version: resourceRecord.version
                        });

                        // update the supplementedOverview
                        dbOverviews.update({ _id: supplementedOverview._id }, supplementedOverview, callback);
                    } else {
                        setImmediate(callback);
                    }
                }, err => callback(err));
            }, (callback) => {
                // keep track of original order of resources
                if (resourceRecord.resourceType !== 'packageOverview'
                    && resourceRecord.resourceType !== 'overview') {
                    resourceRecord.order = z;
                }
                // '/' not allowed in name
                if (resourceRecord.name != null) {
                    resourceRecord.name = resourceRecord.name.replace('/', '_');
                } else {
                    loggerResources.log('warning', 'Field \'name\' does not exist or is empty: ' + JSON.stringify(resourceRecord));
                }
                // '/', '&' not allowed in categories
                if (resourceRecord.categories != null) {
                    for (let cpath = 0; cpath < resourceRecord.categories.length; cpath++) {
                        if (resourceRecord.categories[cpath] != null) {
                            for (let element = 0; element < resourceRecord.categories[cpath].length; element++) {
                                resourceRecord.categories[cpath][element]
                                    = resourceRecord.categories[cpath][element].replace('/', '_');
                                resourceRecord.categories[cpath][element]
                                    = resourceRecord.categories[cpath][element].replace('&', 'and');
                            }
                        }
                    }
                }

                // prefix any paths with the json dir path; if the path can't be found locally we
                // assume it's a external link and don't prefix it.
                for (const prop in resourceRecord) {
                    if (prop === 'link' || prop === 'image' || prop === 'icon' || prop === 'license') { // TODO: put this list in vars and share with download/makeoffline
                        prefixAndSetLinkType(resourceRecord, prop);
                    } else if (prop === 'linkForDownload') {
                        for (const propLfd in resourceRecord.linkForDownload) {
                            if (resourceRecord.linkForDownload.hasOwnProperty(propLfd)) {
                                prefixAndSetLinkType(resourceRecord.linkForDownload, propLfd);
                            }
                        }
                    }
                }

                // implied dependency files: check if there's an implied dependency file and add
                // its path to the record if a mapping file exists for this content file, any
                // co-located dep files shall be ignored
                if (resourceRecord.link != null) {
                    if (implictDepedenciesMapping != null) {
                        // locate dep file through mapping file (case where all dep files are flat
                        // in the same dir)
                        const depDir = path.join(jsonDir, vars.DEPENDENCY_DIR);
                        const relLink = path.relative(depDir, resourceRecord.link).replace(/\\/g, '/');
                        const depFile = implictDepedenciesMapping[relLink];
                        if (depFile != null) {
                            resourceRecord.implictDependencyFile = path.join(depDir, depFile);
                        } else {
                            // loggerResources.log('warning', 'Could not look up filename in
                            // dependency mapping file: ' + relLink);
                        }
                    } else {
                        // locate dep file based on resource location (case where dep file is
                        // co-located with project/projectspec) could check if the link is a
                        // directory and avoid removing the extension in that scenario (i.e if we
                        // had a ccs.tirex folder)
                        const linkNoExt = path.join(
                            path.dirname(resourceRecord.link),
                            path.basename(resourceRecord.link).split('.')[0]
                        );
                        const depFile = linkNoExt + '.dependency.tirex.json';
                        if (fs.existsSync(path.join(vars.CONTENT_BASE_PATH, depFile))) {
                            resourceRecord.implictDependencyFile = depFile;
                        }
                    }
                }

                // folders: read folder contents from file system and create a record for each
                // file; convert original folder resource into overview
                if (resourceRecord.resourceType === 'folder') {
                    try {
                        const result = fsutils.readDirRecursive(
                            path.join(vars.CONTENT_BASE_PATH, resourceRecord.link));
                        for (let jj = 0; jj < result.length; jj++) {
                            const filePath = result[jj].split(path.sep);
                            const folderRecord = deepCopy(resourceRecord);
                            folderRecord.name = filePath[filePath.length - 1];
                            folderRecord.link = path.join(
                                folderRecord.link, filePath.join(path.sep));
                            // Create uuid: make a hash by adding the includedFile's path the
                            // existing parent uuid to make sure the uuid is unique also make sure
                            // that the file path is relative to the package root dir so that tirex
                            // desktop and other server installation that may have a different
                            // package path always arrive at the same hash
                            folderRecord._id = idHelper.updateUuid(resourceHashObj,
                                                                   { link: path.relative(packagePath, folderRecord.link) }).idVal;
                            let fileDir = filePath.slice(0, filePath.length - 1);
                            // workaround: don't do automatic device/devtools insertion for file
                            // folders
                            if (fileDir === 'Devices') {
                                fileDir = 'devices';
                            }
                            if (fileDir === 'Development Tools') {
                                fileDir = 'development tools';
                            }
                            for (let cc = 0; cc < folderRecord.categories.length; cc++) {
                                folderRecord.categories[cc] = folderRecord.categories[cc]
                                    .concat([resourceRecord.name]).concat(fileDir);
                            }
                            folderRecord.resourceType = 'file';
                            folderRecord.doNotCount = true;
                            delete folderRecord.description;
                            delete folderRecord.image;
                            delete folderRecord.linkForDownload;
                            folderResources.push(folderRecord);
                        }
                        // convert original folder resource into overview
                        resourceRecord.resourceType = 'overview';
                        delete resourceRecord.link;
                        delete resourceRecord.linkForDownload;
                    } catch (e) {
                        loggerResources.log('error', 'Cannot read folder ' + resourceRecord.link);
                    }
                }

                // versionRange = dep.semver or dep.version depending on what was specified in the metadata (exact match or range)
                // For b/w compatibility: convert dependency.version to dependency.semver if dependency.semver wasn't defined
                resourceRecord.dependencies.forEach((dep) => {
                    if (dep.semver) {
                        dep.versionRange = dep.semver;
                    }
                    else {
                        // TODO get rid of semver field; only for b/w compatibility (range check still valuable)
                        dep.semver = versioning.convertToSemver(dep.version) || '0.0.0';
                        dep.versionRange = dep.version;
                    }
                });

                const invalidDependency = resourceRecord.dependencies.find(
                    dep => !semver.validRange(dep.versionRange) && !versioning.valid(dep.versionRange)
                );
                if (invalidDependency) {
                    const msg = `Invalid dependency version / semver ${JSON.stringify(invalidDependency)} for ${resourceRecord.id}`;
                    loggerResources.log('error', msg);
                    return setImmediate(callback, msg);
                }

                // determine includedFiles (from embedded array or a dependency file if one exists)
                const results = exports._processIncludedFiles(resourceRecord, packageHeader);
                const includedFilesForDisplay = results.forDisplay;
                const includedFilesForDownload = results.forDownload;

                // if the resource points to a project folder, add folder files to
                // includedFilesForDisplay
                if (['project.ccs', 'folder.importable', 'project.energia'].indexOf(resourceRecord.resourceType) !== -1) {
                    try {
                        const folderFiles = fsutils.readDirRecursive(
                            path.join(vars.CONTENT_BASE_PATH, resourceRecord.link));
                        for (let i1 = 0; i1 < folderFiles.length; i1++) {
                            if (/\.c$|\.cpp$|\.h$|\.asm$|\.cmd$|\.ino$|\.txt$/ig.test(folderFiles[i1]) === true) {
                                includedFilesForDisplay.push({
                                    file: path.join(resourceRecord.link, folderFiles[i1]),
                                    mapTo: folderFiles[i1]
                                });
                            }
                        }
                    } catch (err) {
                        loggerResources.log('warning', 'Could not read dir content specified by \'link\': ' + JSON.stringify(err));
                    }
                }

                // for all resources except 'folder', create resource records for
                // includedFilesForDisplay
                if (resourceRecord.resourceType !== 'folder') { // TODO: can this be merged with 'folder' above?
                    for (let j = 0; j < includedFilesForDisplay.length; j++) {
                        const includedFileForDisplay = includedFilesForDisplay[j];
                        if (includedFileForDisplay == null) {
                            continue;
                        }
                        if (includedFileForDisplay.error != null) {
                            loggerResources.log('warning', 'Could not create record for includedFile: ' + JSON.stringify(includedFileForDisplay.error));
                            continue;
                        }
                        const childRecord = deepCopy(resourceRecord);
                        // Create uuid: make a hash by adding the included file's path the existing
                        // parent uuid to make sure the uuid is unique also make sure that the file
                        // path is relative to the package root dir so that tirex desktop and other
                        // server installation that may have a different package path always arrive
                        // at the same hash
                        childRecord._id = idHelper.updateUuid(resourceHashObj, {
                            link: path.relative(packagePath, includedFileForDisplay.file)
                        }).idVal;
                        childRecord.name = path.basename(includedFileForDisplay.mapTo);
                        childRecord.link = includedFileForDisplay.file;
                        for (let ll = 0; ll < childRecord.categories.length; ll++) {
                            childRecord.categories[ll] = childRecord.categories[ll]
                                .concat([resourceRecord.name]);
                            const dirname = path.dirname(includedFileForDisplay.mapTo);
                            if (dirname !== '.') {
                                childRecord.categories[ll] = childRecord.categories[ll]
                                    .concat(dirname.split('/'));
                            }
                        }
                        childRecord.parentID = resourceRecord._id;
                        childRecord.resourceType = 'file';
                        childRecord.doNotCount = true;
                        childRecord.isIncludedFile = true;
                        delete childRecord.description;
                        delete childRecord.image;
                        delete childRecord.linkForDownload;
                        includedFileResources.push(childRecord);
                    }

                    if (includedFilesForDisplay.length > 0) {
                        resourceRecord.hasIncludes = true;
                    }
                }

                let absPath;

                // CCS project create/import
                let projectName;
                let sourceFiles;
                if (resourceRecord.resourceType === 'project.ccs'
                    || (resourceRecord.resourceType === 'projectSpec'
                        && (!resourceRecord.advanced || !resourceRecord.advanced.overrideProjectSpecDeviceId))) {
                    absPath = path.join(vars.CCS_CLOUD_IMPORT_PATH, resourceRecord.link);
                    // to be called by the browser; redirects to login if needed, launches the
                    // IDE and imports:
                    resourceRecord._importProjectCCS = vars.CCS_IMPORT_PROJECT_API + '?location=' + absPath;
                    resourceRecord._originalJsonFile = path.join(jsonDir, jsonFile);
                    // intended for dependency script
                } else if (resourceRecord.resourceType === 'projectSpec' && resourceRecord.advanced
                        && resourceRecord.advanced.overrideProjectSpecDeviceId) {
                    absPath = path.join(vars.CCS_CLOUD_IMPORT_PATH, resourceRecord.link);
                    // to be called by the browser; redirects to login if needed, launches the
                    // IDE and imports:
                    resourceRecord._importProjectCCS = vars.CCS_IMPORT_PROJECT_API + '?location=' + absPath +
                        '&deviceId=' + vars.TARGET_ID_PLACEHOLDER;
                    resourceRecord._originalJsonFile = path.join(jsonDir, jsonFile);
                    // intended for dependency script
                } else if (resourceRecord.resourceType === 'project.energia') {
                    absPath = path.join(vars.CCS_CLOUD_IMPORT_PATH, resourceRecord.link);
                    // to be called by the browser; redirects to login if needed, launches the
                    // IDE and imports:
                    resourceRecord._importProjectCCS = vars.CCS_IMPORT_SKETCH_API + '?sketchFile=' + absPath +
                        '&boardId=' + vars.TARGET_ID_PLACEHOLDER;
                    if (resourceRecord.devtools == null
                        || resourceRecord.devtools.length === 0) {
                        loggerResources.log('error', 'Energia sketches must be tagged with a devtool: ' + JSON.stringify(resourceRecord));
                    }
                } else if (resourceRecord.resourceType === 'file.importable') {
                    // .c files: also need to create project
                    projectName = resourceRecord.name;
                    sourceFiles = path.join(vars.CCS_CLOUD_IMPORT_PATH, resourceRecord.link);
                    // to be called by browser
                    resourceRecord._createProjectCCS = vars.CCS_CREATE_PROJECT_API + '?' +
                        'projectName=' + projectName +
                        '&deviceId=' + vars.TARGET_ID_PLACEHOLDER +
                        '&copyFiles=' + sourceFiles;
                } else if (resourceRecord.resourceType === 'folder.importable') {
                    // folder with source files: also need to create project
                    projectName = resourceRecord.name;
                    const files = fsutils.readDirRecursive(
                        path.join(vars.CONTENT_BASE_PATH, resourceRecord.link));
                    sourceFiles = '';
                    for (let kk = 0; kk < files.length; kk++) {
                        sourceFiles += path.join(
                            vars.CCS_CLOUD_IMPORT_PATH, resourceRecord.link, files[kk]);
                        if (kk < files.length - 1) {
                            sourceFiles += ';';
                        }
                    }
                    // to be called by browser
                    resourceRecord._createProjectCCS = vars.CCS_CREATE_PROJECT_API + '?' +
                        'projectName=' + projectName +
                        '&deviceId=' + vars.TARGET_ID_PLACEHOLDER +
                        '&copyFiles=' + sourceFiles;
                }

                // IAR projects
                if (resourceRecord.resourceType === 'project.iar') {
                    resourceRecord._originalJsonFile = path.join(jsonDir, jsonFile);
                    // intended for dependency script
                }

                // add the full, unrecursed list to the record (i.e unfiltered, not recursed into
                // dirs and which is to be used for downloading) important: do this only after the
                // record was cloned for all children
                resourceRecord.includedFilesForDownload = includedFilesForDownload;
                setImmediate(callback);
            }], callback);
        }, (err) => {
            if (err) {
                return callback(err);
            }
            resourceList = resourceList.concat(includedFileResources).concat(folderResources);
            loggerResources.log('info', 'Done with Phase 1 (sync) processing');
            callback(err, resourceList);
        });
    }

    // //////////////////////////////////////////////////////////////
    // / Sync processing functions
    // //////////////////////////////////////////////////////////////

    // James: lets split sync processing up into functions here

    /**
     * Initialize resource record properties
     *
     * @param {Object} resourceRecord
     * @returns {Error|null} result
     *
     */
    function initalizeResourceRecordProperties(resourceRecord, i) {
        if (i === 0 && jsonFile === 'package.tirex.json') {
            resourceRecord.package = resourceRecord.name;
        }

        // semver here for b/w compatibility; check is important (even after we get rid of semver field)
        if (resourceRecord.version == null) {
            resourceRecord.version = 'UNVERSIONED';
            resourceRecord.semver = '0.0.0';
        } else {
            resourceRecord.semver = versioning.convertToSemver(resourceRecord.version) || '0.0.0';
            if (resourceRecord.semver === '0.0.0') {
                const msg = `Invalid version ${resourceRecord.version} - Skipping resource/bundle.`;
                loggerResources.log('error', msg);
                return new Error(msg);
            }
        }
        if (resourceRecord.advanced && Object.keys(resourceRecord.advanced).length === 0) {
            delete resourceRecord.advanced;
        }
        if (resourceRecord.dependencies == null) {
            resourceRecord.dependencies = [];
        }

        // devtools is superset of devtools_category
        if (resourceRecord.devtools_category == null && resourceRecord.devtools != null) {
            resourceRecord.devtools_category = resourceRecord.devtools;
        } else if (resourceRecord.devtools_category != null && resourceRecord.devtools == null) {
            resourceRecord.devtools = resourceRecord.devtools_category;
        } else if (resourceRecord.devtools_category != null && resourceRecord.devtools != null) {
            resourceRecord.devtools = utils.mergeMissingArrayElements(
                resourceRecord.devtools,
                resourceRecord.devtools_category
            );
        } else if (resourceRecord.devtools_category == null && resourceRecord.devtools == null) {
            // leave both null
        }
        return null;
    }

    /**
     * Rename metadata properties (property names changed overtime)
     *
     * @param {Object} resourceRecord
     *
     */
    function renameResourceRecordProperties(resourceRecord) {
        if (resourceRecord.core != null) {
            resourceRecord.coreDependencies = resourceRecord.core;
            delete resourceRecord.core;
        }
        // 'core' renamed to 'packageCore'
        // If both 'core' and 'packageCore' exist, let packageCore override the 'core' handled above
        if (resourceRecord.packageCore != null) {
            resourceRecord.coreDependencies = resourceRecord.packageCore;
            delete resourceRecord.packageCore;
        }
        if (resourceRecord.resources != null) {
            resourceRecord.includedResources = resourceRecord.resources;
            delete resourceRecord.resources;
        }
        if (resourceRecord.files != null) {
            resourceRecord.includedFiles = resourceRecord.files;
            delete resourceRecord.files;
        }
        if (resourceRecord.urls != null) {
            resourceRecord.includedUrls = resourceRecord.urls;
            delete resourceRecord.urls;
        }
        // resourceType 'package' is deprecated in metadata
        if (resourceRecord.resourceType === 'package') {
            resourceRecord.package = resourceRecord.name;
            delete resourceRecord.name;
            delete resourceRecord.resourceType;
        }
        // link field is deprecated in metadata
        if (resourceRecord.location != null) {
            resourceRecord.link = resourceRecord.location;
            delete resourceRecord.location;
        }
        // linkForDownload field is deprecated in metadata
        if (resourceRecord.locationForDownload != null) {
            resourceRecord.linkForDownload = resourceRecord.locationForDownload;
            delete resourceRecord.locationForDownload;
        }
        // content field is deprecated in metadata
        if (resourceRecord.resourceType === 'categoryInfo' || resourceRecord.resourceType === 'overview') {
            if ('content' in resourceRecord) {
                resourceRecord.description = resourceRecord.content;
                delete resourceRecord.content;
            }
        }
        // 'weblink' is deprecated in metadata
        if (resourceRecord.resourceType === 'weblink') {
            resourceRecord.resourceType = 'other';
        }
        // 'overview' is deprecated in metadata
        if (resourceRecord.resourceType === 'categoryInfo') {
            resourceRecord.resourceType = 'overview';
        }
        // 'project' is deprecated in metadata
        if (resourceRecord.resourceType === 'project') {
            resourceRecord.resourceType = 'project.ccs';
        }
        // 'projectSpec' is deprecated in metadata
        if (resourceRecord.resourceType === 'project.ccs' && path.extname(resourceRecord.link) === '.projectspec') {
            resourceRecord.resourceType = 'projectSpec';
        }
        // 'energiaSketch' is deprecated in metadata
        if (resourceRecord.resourceType === 'energiaSketch') {
            resourceRecord.resourceType = 'project.energia';
        }
        // actions field is deprecated in metadata
        if (resourceRecord.actions != null) {
            if (resourceRecord.resourceType === 'folder' && resourceRecord.actions.indexOf('import') !== -1) {
                resourceRecord.resourceType = 'folder.importable';
            }
            // actions field is deprecated in metadata
            if (resourceRecord.resourceType === 'file' && resourceRecord.actions.indexOf('import') !== -1) {
                resourceRecord.resourceType = 'file.importable';
            }
            delete resourceRecord.actions;
        }
        // 'executable' is deprecated in metadata
        if (resourceRecord.resourceType === 'executable') {
            resourceRecord.resourceType = 'file.executable';
        }
        // 'app' is deprecated in metadata
        if (resourceRecord.resourceType === 'app') {
            resourceRecord.resourceType = 'web.app';
        }
        if (resourceRecord.supplements) {
            resourceRecord.supplements.versionRange = resourceRecord.supplements.semver;

            // for b/w compatibility
            resourceRecord.supplements.id = resourceRecord.supplements.packageId;
            resourceRecord.supplements.version = resourceRecord.supplements.semver;
        }
    }

    /**
     * Process categories and transform main and sub categories into categories
     *
     * @param {Object} resourceRecord
     * @param {Object} packageMetadata
     */
    function processCategories(resourceRecord, packageMetadata) {
        if (resourceRecord.mainCategories != null) {
            // convert to array if necessary
            if (Array.isArray(resourceRecord.mainCategories[0]) === false) {
                resourceRecord.mainCategories = [resourceRecord.mainCategories];
            }

            // suppress all categories except "Devices" and "Development Tools" for handling later
            // (***) heer is just a temporary implementation for a specific hard coded case
            if (packageMetadata.type !== vars.META_2_1_TOP_CATEGORY.software.id) {
                const suppressedMainCategories = [];
                for (let i = 0; i < resourceRecord.mainCategories.length; i++) {
                    const cat = resourceRecord.mainCategories[i];
                    const newcat = [];
                    for (let j = 0; j < cat.length; j++) {
                        if (cat[j] !== 'Devices' && cat[j] !== 'Development Tools') {
                            continue;
                        }
                        newcat.push(cat[j]);
                    }
                    suppressedMainCategories.push(newcat);
                }
                resourceRecord.mainCategories = suppressedMainCategories;
            }

            // assign mainCategories to categories
            // (*) not a deep copy, change to categories also apply to mainCategories
            //     if maintaining the original mainCategories is needed then do deep copy
            resourceRecord.categories = resourceRecord.mainCategories;
            // append subCategories
            if (resourceRecord.subCategories != null) {
                if (Array.isArray(resourceRecord.subCategories[0]) === true) {
                    // not allow multiple, just pick the first one
                    resourceRecord.subCategories = resourceRecord.subCategories[0];
                }
                for (let ic = 0; ic < resourceRecord.categories.length; ic++) {
                    resourceRecord.categories[ic].push(...resourceRecord.subCategories);
                }
            }
            delete resourceRecord.mainCategories;
            delete resourceRecord.subCategories;
        }
    }

    /**
     * Process and possibly update the records rootCategory
     *
     * @param {Object} resourceRecord
     * @param {Object} packageMetadata
     * @param callback(err)
     */
    function processRootCategory(resourceRecord, packageMetadata, callback) {
        if (!resourceRecord.rootCategory) {
            resourceRecord.rootCategory = [];
        }

        if (packageMetadata.supplements) {
            // suffix rootCategory with package name
            resourceRecord.rootCategory = resourceRecord.rootCategory.concat([resourceRecord.package]);

            // prefix rootCategory with parent root category (requires parents to be processed
            // first)
            getSuplementedPackages(resourceRecord, packageMetadata, (err, supplementedOverviews) => {
                if (err) {
                    return callback(err);
                }
                const parentRoots = supplementedOverviews.map(overview => overview.rootCategory);
                { // Ensure all parents have same root category
                    let parentRootsEqual = true;
                    for (let i = 1; i < parentRoots.length; i++) {
                        parentRootsEqual = parentRootsEqual && parentRoots[i]
                            .map((piece, j) => piece === parentRoots[0][j])
                            .reduce((item1, item2) => item1 && item2, true);
                        if (!parentRootsEqual) {
                            break;
                        }
                    }
                    if (!parentRootsEqual) {
                        const message = `Supplemental package ${resourceRecord.id} has parents with different root categories`;
                        loggerResources.log('error', message);
                        return callback(message);
                    }
                }
                resourceRecord.rootCategory = parentRoots[0].concat(resourceRecord.rootCategory);
                callback(err);
            });
        } else {
            // Software Packages: use package name if no root category specified
            if (resourceRecord.rootCategory.length === 0 &&
                (!packageMetadata.type ||
                 packageMetadata.type === vars.META_2_1_TOP_CATEGORY.software.id)) {
                resourceRecord.rootCategory = [resourceRecord.package];
            }

            // prefix root category with the package type ("Software", "Device Documentation", etc.)
            if (packageMetadata && packageMetadata.typeName) {
                resourceRecord.rootCategory = [packageMetadata.typeName].concat(resourceRecord.rootCategory);
            }

            setImmediate(callback);
        }
    }

    /**
     * Get the set of packages that the package supplements.
     *
     * @param {Object} resourceRecord
     * @param {Object} packageMetadata
     * @param callback(err, supplementedOverviews)
     */
    function getSuplementedPackages(resourceRecord, packageMetadata, callback) {
        const { packageId, versionRange } = resourceRecord.supplements;
        dbOverviews.find({ resourceType: 'packageOverview', packageId }, (err, packageOverviews) => {
            if (err) {
                return callback(err);
            } else if (!packageOverviews || packageOverviews.length === 0) {
                const message = `Missing package to supplement ${packageId}`;
                loggerResources.log('error', message);
                return callback(message);
            }
            const supplementedOverviews = packageOverviews.filter(
                overview => versioning.satisfies(overview.version, versionRange)
            );

            if (supplementedOverviews.length === 0) {
                const message = `Supplementary package ${resourceRecord.id} has no packages to supplement`;
                loggerResources.log('error', message);
                return callback(message);
            }

            const supplementalOverview = supplementedOverviews.find(overview => overview.supplements);
            if (supplementalOverview) {
                const message = `Supplemental chain detected ${resourceRecord.id},${resourceRecord.version} -> ${supplementalOverview.id}, ${supplementalOverview.version} -> ${supplementalOverview.supplements.packageId}, ${supplementalOverview.supplements.versionRange}`;
                loggerResources.log('error', message);
                return callback(message);
            }

            callback(err, supplementedOverviews);
        });
    }

    /**
     * ASYNC PROCESSING STEP (device and devtool related)
     */
    function asyncProcessing(resourceList) {
        loggerResources.log('info', 'Starting Phase 2 (async) processing');
        const resources = [];
        const overviews = [];
        async.eachSeries(resourceList, function (resourceRecord, callback) {
            // use eachSeries to maintain original ordering resources
            loggerResources.log('debug', 'Async Processing ' + resourceRecord.name);

            resourceRecord.fullPaths = [];

            // if no devtools/devtools_category defined propagate from package header
            // (devtools being null implies devools_category is null too)
            if (resourceRecord.devtools == null && packageHeader.devtools != null) {
                resourceRecord.devtools = packageHeader.devtools;
                resourceRecord.devtools_category = packageHeader.devtools_category;
            }

            // if no devices defined propagate devices from package header
            if (resourceRecord.devices == null && resourceRecord.devtools == null
                && packageHeader.devices != null) {
                resourceRecord.devices = packageHeader.devices;
            }

            async.series([
                function (callback) {
                    // <<<<< look up device names based on IDs: .devices changes from id to name
                    // here! >>>>>>>
                    devices.getNames(dbDevices, resourceRecord.devices, (err, deviceNames) => {
                        if (deviceNames != null && deviceNames.length > 0) {
                            resourceRecord.devices = deviceNames;
                        }
                        callback(err);
                    });
                },
                function (callback) {
                    // <<<<< look up devtool names based on IDs: .devtools changes from id to name
                    // here! >>>>>>
                    devtools.getNames(dbDevtools, resourceRecord.devtools, (err, devtoolNames) => {
                        if (devtoolNames != null && devtoolNames.length > 0) {
                            resourceRecord.devtools = devtoolNames;
                        }
                        callback(err);
                    });
                },
                function (callback) {
                    // <<<<< look up devtool names based on IDs: .devtools_category changes from id
                    // to name here! >>>>>>
                    devtools.getNames(dbDevtools, resourceRecord.devtools_category, (err, devtoolNames) => {
                        if (devtoolNames != null && devtoolNames.length > 0) {
                            resourceRecord.devtools_category = devtoolNames;
                        }
                        callback(err);
                    });
                },
                function (callback) {
                    // expand core types specified as regex
                    let coreTypesExpanded;
                    async.each(resourceRecord.coreTypes, function (coreType, callback) {
                        coreTypesExpanded = [];
                        const regex = /^\/(.*?)\/$/; // check if coreType is specified as regex,
                        // e.g.: '/msp43?/'
                        if (regex.test(coreType) === false) {
                            coreTypesExpanded.push(coreType);
                            return setImmediate(callback);
                        }
                        const r = regex.exec(coreType);
                        const coreTypeRegex = new RegExp(r[1]);
                        dbDevices.find({
                            // packageUId: resourceRecord.packageUId,  // Metadata_2.1 : global H/W
                            // packages
                            coreTypes_id: coreTypeRegex
                        }, function (err, deviceRecords) {
                            if (err) {
                                loggerResources.log('error', 'Query error: ' + JSON.stringify(err));
                                return callback(err);
                            }
                            if (deviceRecords === null) {
                                loggerResources.log('warning', 'Device not found in the device db: ' + coreType + '. Skipping.');
                                return callback();
                            }
                            for (let i = 0; i < deviceRecords.length; i++) {
                                const deviceRecord = deviceRecords[i];
                                for (let j = 0; j < deviceRecord.coreTypes_id.length; j++) {
                                    const coreTypeId = deviceRecord.coreTypes_id[j];
                                    if (coreTypeRegex.test(coreTypeId) === true) {
                                        coreTypesExpanded.push(coreTypeId);
                                    }
                                }
                            }
                            callback();
                        });
                    }, function (err) {
                        resourceRecord.coreTypes = coreTypesExpanded;
                        setImmediate(callback, err);
                    });
                },
                function (callback) {
                    // add any missing devices based on specified coreTypes
                    if (resourceRecord.coreTypes != null) {
                        dbDevices.find({
                            // packageUId: resourceRecord.packageUId,  // Metadata_2.1 : global H/W
                            // packages
                            coreTypes_id: { $in: resourceRecord.coreTypes }
                        }, function (err, devices) {
                            if (!err && devices != null && devices.length > 0) {
                                if (resourceRecord.devices == null) {
                                    resourceRecord.devices = [];
                                }
                                for (let i = 0; i < devices.length; i++) {
                                    if (resourceRecord.devices.indexOf(devices[i].name) === -1) {
                                        resourceRecord.devices.push(devices[i].name);
                                    }
                                }
                            } else {
                                loggerResources.log('error', 'All or some core types not found in device DB:' + JSON.stringify(resourceRecord.coreTypes));
                            }
                            callback();
                        });
                    } else {
                        setImmediate(callback);
                    }
                },
                function (callback) {
                    // expand family/subfamily/etc in 'devices' into its variants (leafs) and
                    // move family/subfamily/etc out into 'devicesAncestors'
                    resourceRecord.devicesVariants = [];
                    resourceRecord.devicesAncestors = []; // list of common ancestors of all variants
                    if (resourceRecord.devices != null) {
                        async.each(resourceRecord.devices, function (deviceName, callback) {
                            utils.expandDevices(dbDevices, resourceRecord, deviceName, loggerResources, callback);
                        }, err => setImmediate(callback, err));
                    } else {
                        setImmediate(callback);
                    }
                },
                function (callback) {
                    // no devtools, but devices specified: populate with devtools that are
                    // associated with the devices
                    if (resourceRecord.devtools == null && resourceRecord.devices != null) {
                        dbDevtools.find({
                            devices: { $in: resourceRecord.devicesVariants }
                        }, function (err, result) {
                            if (!err && result != null && result.length > 0) {
                                resourceRecord.devtools = [];
                                resourceRecord.devtools_category = [];
                                for (let i = 0; i < result.length; i++) {
                                    const devtool = result[i];
                                    resourceRecord.devtools.push(devtool.name);
                                    resourceRecord.devtools_category.push(devtool.name);
                                }
                            }
                            callback();
                        });
                    } else {
                        setImmediate(callback);
                    }
                },
                function (callback) {
                    // no devices, but devtools specified: populate with devices that are
                    // associated with the devtools
                    if (resourceRecord.devices == null && resourceRecord.devtools != null) {
                        dbDevtools.find({
                            name: { $in: resourceRecord.devtools }
                        }, function (err, result) {
                            if (!err && result != null && result.length > 0) {
                                for (let i = 0; i < result.length; i++) {
                                    const devtool = result[i];
                                    if (devtool.devices != null) {
                                        resourceRecord.devicesVariants = resourceRecord.devicesVariants
                                            .concat(devtool.devices);
                                    }
                                }
                            }
                            callback();
                        });
                    } else {
                        setImmediate(callback);
                    }
                },
                function (callback) {
                    // build each possible combination of device variant path and category
                    // path for the resource item: the device hierarchy path will be
                    // inserted after 'Devices' path element but only if the latter
                    // exists;;; a core type will be appended if (a) the device has more
                    // than one core type and (b) the core type is specified in the
                    // coreTypes field
                    async.each(resourceRecord.devicesVariants,
                        function (deviceName, callback) {
                            insertFullPath(dbDevices, resourceRecord, 'Devices', null,
                                deviceName, null, packageMetadata.type, callback);
                        }, function (err) {
                            if (err) {
                                setImmediate(callback, err);
                                return;
                            }
                            // override devices with ancestors and variants
                            resourceRecord.devices = resourceRecord.devicesAncestors
                                .concat(resourceRecord.devicesVariants);
                            delete resourceRecord.devicesAncestors;
                            loggerResources.log('debug', 'Processed ' + resourceRecord.name);
                            setImmediate(callback, err);
                        }
                    );
                },
                function (callback) {
                    if (resourceRecord.devices != null && !resourceRecord.isIncludedFile) {
                        loggerResources.log('warning', 'The following resource does not have any \'devices\' specified and may ' +
                            'get excluded from filter/search results: ' + JSON.stringify(resourceRecord,
                                (key, value) => (key === 'name' || key === 'categories' || key === 'packagePath') ? value : undefined));
                    }
                    setImmediate(callback);
                },
                function (callback) {
                    // build each possible combination of devtool name and category path for
                    // the resource item: the devtool name will be inserted after 'Development
                    // Tools' path element but only if the latter exists a core type will be
                    // appended if (a) a device is specified in the mapping, (b) the device is
                    // specified in the devices field, (c) the device has more than one core
                    // type and (d) the core type is specified in the coreTypes field note: the
                    // device hierarchy will NOT be inserted to avoid too many category levels
                    // assumption: devtool db is a flat list, i.e. no hierarchy like devices
                    if (resourceRecord.devtools_category != null) {
                        dbDevtools.find({
                            name: { $in: resourceRecord.devtools_category }
                        }, function (err, result) {
                            if (!err && result != null && result.length > 0) {
                                async.each(result, function (devtoolRecord, callback) {
                                    if (devtoolRecord.devices != null) {
                                        async.each(devtoolRecord.devices,
                                                   function (deviceName, callback) {
                                                       if (resourceRecord.devices.indexOf(deviceName) !== -1) {
                                                           insertFullPath(dbDevices, resourceRecord, 'Development Tools', devtoolRecord.name, deviceName, devtoolRecord.type, packageMetadata.type, callback);  // Metadata_2.1 : passing metadata as well
                                                       } else {
                                                           setImmediate(callback);
                                                       }
                                                   }, err => setImmediate(callback, err));
                                    } else {
                                        insertFullPathDevtools(resourceRecord, 'Development Tools', devtoolRecord.name, devtoolRecord.type, packageMetadata.type);   // Metadata_2.1 : passing metadata as well
                                        setImmediate(callback);
                                    }
                                }, err => setImmediate(callback, err));
                            } else {
                                setImmediate(callback, err);
                            }
                        });
                    } else {
                        setImmediate(callback);
                    }
                },
                function (callback) {
                    // add in remaining category paths to full paths
                    // James: temp patch
                    if (resourceRecord.categories) {
                        for (let i = 0; i < resourceRecord.categories.length; i++) {
                            const categoryPath = resourceRecord.categories[i];
                            if (categoryPath.indexOf('Development Tools') === -1 && categoryPath.indexOf('Devices') === -1) {
                                resourceRecord.fullPaths.push(deepCopy(categoryPath));
                            }
                        }
                        // full paths must always be set
                        if (resourceRecord.fullPaths.length === 0) {
                            resourceRecord.fullPaths = deepCopy(resourceRecord.categories);
                        }
                    }
                    setImmediate(callback);
                }
            ], function (err) {
                if (err) {
                    loggerResources.log('error', 'An error with creating the resource database has occurred:' + JSON.stringify(err));
                    callback(err); // to async.each
                } else {
                    // split into resources and overviews (mainly for performance reasons since we
                    // need to query overviews w/o device/devtool/search and there are relatively
                    // few overview entries)
                    if (resourceRecord.resourceType === 'overview' || resourceRecord.resourceType === 'packageOverview') {
                        // [ Metadata_2.1 : Extract package type from metadata and put in the
                        // package overview here
                        if (resourceRecord.type == null && resourceRecord.resourceType === 'packageOverview') {
                            if (packageMetadata.type == null || packageMetadata.type === 'full') {
                                resourceRecord.type = vars.META_2_1_TOP_CATEGORY.software.id;
                            } else {
                                resourceRecord.type = packageMetadata.type;
                            }
                        }
                        // ]
                        overviews.push(resourceRecord);
                    } else {
                        resources.push(resourceRecord);
                    }
                    callback(); // to async.each resourceRecord
                }
            });
        }, function (err) {
            if (err) {
                loggerResources.log('error', 'An error with creating the resource database has occurred:' + JSON.stringify(err));
            } else {
                async.series([
                    function (callback) {
                        tagResourcesWithHeaderAndOverviewTags(resources, overviews, callback);
                    }
                ], function () {

                    // finally put the resource record into the resources and overviews DB
                    async.parallel([
                        function (callback) {
                            for (const resourceRecord of resources) {
                                deleteUnecessaryFields(resourceRecord);
                            }
                            dbResources.insert(resources, function (err) {
                                if (err) {
                                    err = 'An error with inserting resources has occurred:' + JSON.stringify(err);
                                }
                                callback(err);
                            });
                        },
                        function (callback) {
                            for (const overviewRecord of overviews) {
                                deleteUnecessaryFields(overviewRecord);
                            }
                            dbOverviews.insert(overviews, function (err) {
                                if (err) {
                                    err = 'An error with inserting overviews has occurred:' + JSON.stringify(err);
                                }
                                callback(err);
                            });
                        },
                        function (callback) {
                            dbPureBundles.insert(pureBundles, function (err) {
                                if (err) {
                                    err = 'An error with inserting pure bundles has occurred:' + JSON.stringify(err);
                                }
                                callback(err);
                            });
                        }
                    ], function (err) {
                        if (err) {
                            loggerResources.log('error', err);
                        } else {
                            loggerResources.log('info', 'Created resource database: ' + resourceList.length + ' entries.');
                        }
                        callback(err);
                    });
                });
            }

            /**
             * Delete unnecessary fields (not needed by rex 3 or rex 4 sqldb)
             * More files are removed by compacter.js later after the full records were indexed
             *
             * @param record
             */
            function deleteUnecessaryFields(record) {
                // only needed during refresh:
                delete record.devtools_category;
                delete record.categories;
                delete record.implictDependencyFile;
                delete record.isIncludedFile;
                // feature no longer supported:
                delete record.allowPartialDownload;
                if (record.resourceType !== 'packageOverview') {
                    // NOTE: removing these will effectively disable partial download
                    // // TODO: don't add them to resources in the first place
                    delete record.packagePath;
                    delete record.packageVersion;
                    delete record.packageId;
                    delete record.package;
                    delete record.includedFilesForDownload;
                    delete record.license;
                    delete record.dependencies;
                    delete record.semver;
                    delete record.version;
                }
            }

            function tagResourcesWithHeaderAndOverviewTags(resources, overviews, callback) {
                for (let r = 0; r < resources.length; r++) {
                    const resource = resources[r];
                    // inherit tags from the package header
                    if (packageHeader.tags != null) {
                        if (resource.tags == null) {
                            resource.tags = [];
                        }
                        resource.tags = resource.tags.concat(packageHeader.tags);
                    }
                    // inherit tags from overviews
                    for (let o = 0; o < overviews.length; o++) {
                        const overview = overviews[o];
                        if (overview.tags != null) {
                            for (let rc = 0; rc < resource.categories.length; rc++) {
                                const resourceCategories = resource.categories[rc];
                                const resourceCategoriesString = resourceCategories.join(',');
                                for (let oc = 0; oc < overview.categories.length; oc++) {
                                    const overviewCategories = overview.categories[oc];
                                    const overviewPathString = overviewCategories.join(',') + ',' + overview.name;
                                    if (resourceCategoriesString === overviewPathString) {
                                        if (resource.tags == null) {
                                            resource.tags = [];
                                        }
                                        resource.tags = resource.tags.concat(overview.tags);
                                    }
                                }
                            }
                        }
                    }
                }
                setImmediate(callback);
            }
        });
    }
};

/**
 * check record for includedFiles info in this order:
 * 1) inlined array
 *      Paths of files to be included are relative to the package root (TODO: should be
 *      content.tirex.json file location, but could break package core)
 * 2) explicit dependency file: file path specified
 *      Paths of files to be included are relative to the dep file location
 * 3) implicit dependency file:
 *      - same filename as link with extension replaced with '.dependency',
 *      OR
 *      - filename is specified in the dependency mapping file (flat dep
 *        files in same folder) In both cases the paths of files to be included are relative to the
 *        resource link
 *
 * Simple format:  One file path per line, paths must be relative to location of the dep file (for
 * 1 and 2) or relative to the content file (for 3). The first char of each line should be +, -, or
 * space.
 *
 * +|-|<space>file_path [-> category_path]
 *
 * <space>: the file or dir is designated for downloading
 * -: applies to dirs only: only the immediate files in this dir are designated for downloading
 * +: the file or dir is designated for downloading and displaying
 *
 * Note: Instead of <space> the path string may be started at the first column, but then any
 * filenames starting with + or - would not be found
 *
 * Example:
 *  +../../../Profiles -> PROFILES
 +  +../../../common/cc26xx/board_lcd.c -> Application/board_lcd.c
 *
 * - using either '/' or '\' separators
 * - DOS and UNIX line endings are handled
 * - Paths on either side can be files or dirs
 * - category_path is optional
 *
 * JSON format: The file list can also be wrapped inside a json file generated based on the
 * configurations of a project In this case the JSON is an array of configurations with the file
 * list specified in the 'file' property
 *
 * @param the record
 * @param packageHeader
 * @returns {forDisplay: for creating new resources to show in tree, fullUnrescursed: for download}
 *     all paths relative to CONTENT_BASE_PATH
 * @private
 */
exports._processIncludedFiles = function (record, packageHeader) {
    let lines;
    let dirName;
    const result = { forDisplay: [], forDownload: [] };

    if (Array.isArray(record.includedFiles)) { // 1) - Inlined Array
        lines = record.includedFiles;
        dirName = record.packagePath;
        // TODO: should be jsonDir, but need to verify first package core doesn't break
    } else { // look for a dependency file (2 or 3)
        let depFilePath;
        let data;
        if (record.includedFiles != null) { // 2) - explicit dependency file path
            dirName = path.dirname(path.join(record.packagePath, record.includedFiles));
            try {
                depFilePath =
                    path.join(vars.CONTENT_BASE_PATH, record.packagePath, record.includedFiles);
                // note: the includedFiles field is not automatically prefixed with package
                // path as other fields are
                data = fs.readFileSync(depFilePath, { encoding: 'utf8' });
            } catch (err) {
                return result;
            }
        } else if (record.implictDependencyFile != null) { // 3) - implied dependency file
            dirName = path.dirname(record.link);
            try {
                depFilePath = path.join(vars.CONTENT_BASE_PATH, record.implictDependencyFile);
                data = fs.readFileSync(depFilePath, { encoding: 'utf8' });
            } catch (err) {
                loggerResources.log('error', err);
                return result;
            }
        }
        if (data != null) {
            if (path.extname(depFilePath) === '.json') {
                lines = JSON.parse(data)[0].files; // TODO: pick the first configuration for now
            } else {
                lines = data.split('\n');
            }
        }
    }
    _process(lines, dirName, packageHeader);
    return result;

    function _process(lines, dirName, packageHeader) {
        if (lines == null) {
            return;
        }
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const makeVisible = (line.charAt(0) === '+');
            let dirRecursionDepth;
            switch (line.charAt(0)) {
            case '+':
                dirRecursionDepth = -1; // full depth
                line = line.slice(1); // remove char 0
                break;
            case '-':
                dirRecursionDepth = 1;
                line = line.slice(1); // remove char 0
                break;
            case ' ':
                dirRecursionDepth = 0;
                line = line.slice(1); // remove char 0
                break;
            default :
                dirRecursionDepth = 0; // no special char, treat the same as ' ' (but if
                // filenames start with + or - they would not be found)
            }
            const tmp = line.split('->');
            let relPath = tmp[0];
            let mapTo = (tmp[1] != null) ? tmp[1] : ''; // need to handle missing '->' or missing
            // arg after '->'
            relPath = relPath.replace(/\\/g, '/').replace(/\r/g, '').trim();
            mapTo = mapTo.replace(/\\/g, '/').replace(/\r/g, '').trim();
            if (relPath !== '') {
                // var depPath = path.join(path.dirname(link), relPath);
                const depPath = path.join(dirName, relPath);
                const absPath = path.join(vars.CONTENT_BASE_PATH, depPath);
                let stat;
                try {
                    stat = fs.statSync(absPath);
                } catch (err) {
                    if (packageHeader && packageHeader.allowPartialDownload === true) {
                        result.forDownload.push({ error: err });
                    }
                    if (makeVisible === true) {
                        result.forDisplay.push({ error: err });
                    }
                    continue;
                }
                if (stat.isFile() === true) {
                    result.forDownload.push(depPath);
                    if (makeVisible === true) {
                        result.forDisplay.push({
                            file: depPath,
                            mapTo: (mapTo === '') ? path.basename(depPath) : mapTo
                        });
                    }
                } else if (stat.isDirectory() === true) {
                    let dirFiles;
                    try {
                        dirFiles = fsutils.readDirRecursive(absPath, null, dirRecursionDepth);
                    } catch (err) {
                        if (packageHeader && packageHeader.allowPartialDownload === true) {
                            result.forDownload.push({ error: err });
                        }
                        if (makeVisible === true) {
                            result.forDisplay.push({ error: err });
                        }
                        continue;
                    }
                    if (dirRecursionDepth === 0) {
                        result.forDownload.push(depPath); // if no recursion, just keep the dir path
                    } else {
                        for (let k = 0; k < dirFiles.length; k++) {
                            result.forDownload.push(path.join(depPath, dirFiles[k]));
                        }
                    }
                    if (makeVisible === true) {
                        for (let j = 0; j < dirFiles.length; j++) {
                            // if no recursion, there are no files to make visible
                            result.forDisplay.push({
                                file: path.join(depPath, dirFiles[j]),
                                mapTo: path.join(mapTo, dirFiles[j])
                            });
                        }
                    }
                }
            }
        }
    }
};

/**
 *
 * @param dbDevices
 * @param resourceRecord
 * @param deviceVariantName
 * @param callback
 */
function insertFullPath(dbDevices, resourceRecord, keyCategory, devtoolName, deviceVariantName,
                        devtoolType, packageType, callback) {
    loggerResources.log('debug', resourceRecord.name, 'Finding device record for ' + deviceVariantName);
    dbDevices.findOne({
        // packageUId: resourceRecord.packageUId,  // Metadata_2.1 : global H/W packages
        name: deviceVariantName
    }, function (err, deviceVariantRecord) {
        if (err) {
            loggerResources.log('error', 'Query error: ' + JSON.stringify(err));
            callback(err);
            return;
        }
        if (deviceVariantRecord === null) {
            loggerResources.log('warning', 'Device not found in the device db: ' + deviceVariantName + '. Skipping.');
            callback();
            return;
        }

        // add any missing device ancestors - TODO: why is this needed?
        if (resourceRecord.devicesAncestors != null) {
            for (let k = 0; k < deviceVariantRecord.ancestors.length; k++) {
                const ancestor = deviceVariantRecord.ancestors[k];
                if (resourceRecord.devicesAncestors.indexOf(ancestor) === -1) {
                    resourceRecord.devicesAncestors.push(ancestor);
                }
            }
        }

        // generate the full paths (only done for variants, i.e. tree leaves)
        // the full path is the category path with the device hierarchy inserted after the
        // 'Devices' category element if 'Devices' doesn't exist fullpaths remains empty and should
        // be set to categoryPaths elsewhere
        const categoryPaths = resourceRecord.categories;
        for (let i = 0; i < categoryPaths.length; i++) {
            // [ Metadata_2.1 : The top category can be package type 'Development Tools"
            //   which collide with the reserved category name
            // var d = categoryPaths[i].indexOf(keyCategory);
            // if (d !== -1) {
            const d = categoryPaths[i].lastIndexOf(keyCategory);
            if (d > 0) {
                // ]
                let addedCoreType = false;
                // append any core types for this device only if they were specifically specified
                // in the metadata; if not only add device path
                if (resourceRecord.coreTypes != null && resourceRecord.coreTypes.length > 0) {
                    if (deviceVariantRecord.coreTypes_id != null) {
                        // only add core type if there's more than one for this device
                        if (deviceVariantRecord.coreTypes_id.length > 1) {
                            for (let l = 0; l < deviceVariantRecord.coreTypes_id.length; l++) {
                                const coreTypeId = deviceVariantRecord.coreTypes_id[l];
                                const coreTypeName = deviceVariantRecord.coreTypes_name[l];
                                if (resourceRecord.coreTypes.indexOf(coreTypeId) !== -1) {
                                    let coreTypePath;
                                    if (devtoolName == null) {
                                        coreTypePath = deviceVariantRecord.ancestors
                                            .concat(deviceVariantName).concat(coreTypeName);
                                    } else {
                                        coreTypePath = [devtoolName, coreTypeName];
                                    }
                                    add(coreTypePath, i, d);
                                    addedCoreType = true;
                                }
                            }
                        }
                    }
                }
                if (addedCoreType !== true) {
                    let devPath = [];
                    if (devtoolName == null) {
                        devPath = deviceVariantRecord.ancestors.concat(deviceVariantName);
                    } else {
                        devPath = [devtoolName];
                    }
                    add(devPath, i, d);
                }
            }
        }
        function add(devPath, i, d) {
            const fullPath = deepCopy(categoryPaths[i]);
            if (packageType !== vars.META_2_1_TOP_CATEGORY.software.id) {
                if (keyCategory === 'Devices') {
                    // remove "devices", append devPath
                    fullPath.splice(d, 1, ...devPath);
                } else if (keyCategory === 'Development Tools') {
                    if (devtoolType != null) {
                        // remove "devtools", add devtools.type, append devPath
                        fullPath.splice(d, 1, lookupDevtoolName(devtoolType), ...devPath);
                    } else {
                        // remove devtools, append devPath
                        fullPath.splice(d, 1, ...devPath);
                    }
                }
            } else {
                // append devPath
                fullPath.splice(d + 1, 0, ...devPath);
            }
            resourceRecord.fullPaths.push(fullPath);
        }

        // loggerResources.log('fine', 'Done building path with ' + deviceVariantName);
        callback();
    });
}

/**
 *
 * @param resourceRecord
 * @param devtoolName
 */
function insertFullPathDevtools(resourceRecord, keyCategory, devtoolName, devtoolType,
                                packageType) {
    // the full path is the category path with the devtool name inserted after the 'Development
    // Tools' category element if 'Development Tools' doesn't exist fullpaths remains empty and
    // should be set to categoryPaths elsewhere
    const categoryPaths = resourceRecord.categories;
    for (let i = 0; i < categoryPaths.length; i++) {
        // [ Metadata_2.1 : hide the category "Development Tools" & "Devices" for H/W packages
        // var d = categoryPaths[i].indexOf(keyCategory);
        // if (d !== -1) {
        //     var fullPath = deepCopy(categoryPaths[i]);
        //     fullPath.splice(d + 1, 0, devtoolName);
        //     resourceRecord.fullPaths.push(fullPath);
        // }
        const d = categoryPaths[i].lastIndexOf(keyCategory);
        if (d > 0) {
            const fullPath = deepCopy(categoryPaths[i]);
            if (packageType !== vars.META_2_1_TOP_CATEGORY.software.id && keyCategory === 'Development Tools') {
                if (devtoolType != null) {
                    // remove devtools, add devtools.type
                    fullPath.splice(d, 1, lookupDevtoolName(devtoolType), devtoolName);
                } else {
                    // remove devtools
                    fullPath.splice(d + 1, 0, devtoolName);
                }
            } else {
                fullPath.splice(d + 1, 0, devtoolName);
            }
            resourceRecord.fullPaths.push(fullPath);
        }
        // ]
    }
}

/**
 * Based on
 * http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
 * Note: it doesn't copy functions, Date and Regex's
 * @param obj
 * @returns {*}
 */
function deepCopy(obj) { // TODO: move into a util class
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Temporary lookup table.
 *
 * @param type
 */
function lookupDevtoolName(type) {
    let result = type;
    if (type === 'board') {
        result = 'Kits and Boards';
    } else if (type === 'ide') {
        result = 'Integrated Development Environments';
    } else if (type === 'probe') {
        result = 'Debug Probes';
    } else if (type === 'programmer') {
        result = 'Production Programmers';
    } else if (type === 'utility') {
        result = 'Utilities';
    } else {

    }
    return result;
}

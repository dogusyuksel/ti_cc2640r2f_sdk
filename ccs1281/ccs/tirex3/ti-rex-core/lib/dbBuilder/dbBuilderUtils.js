const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const async = require('async');
const stripJsonComments = require('strip-json-comments');

const vars = require('../vars');
const preproc = require('./preproc');

/**
 * Get the package metadata from package.tirex.json
 *
 * @param {string} packagePath
 * @param {string} metadataDir
 * @param packageMacros
 * @param {Object} logger
 * @param callback(err, vID, metadata)
 */
exports.getPackageMetadata = function (packagePath, metadataDir, packageMacros, logger, callback) {
  const packageFile = path.join(vars.CONTENT_BASE_PATH, packagePath, metadataDir, 'package.tirex.json');
  preproc.processFile(packageFile, packageMacros, logger, function (err, preprocResult) {
    if (err || !preprocResult) {
      return callback(err);
    }
    if (preprocResult != null && preprocResult.records.length > 0) {
      const packageMetadata = preprocResult.records[0];
      if (packageMetadata.metaDataVer == null) {
        // set to default version
        packageMetadata.metaDataVer = '1.0.0';
      }
      if (semver.lt(packageMetadata.metaDataVer, '2.1.0')) {
        // convert to new version
        packageMetadata.metaDataVer = '2.1.0';
        if (packageMetadata.type == null) {
          packageMetadata.type = 'software'; // legacy full package
        }
      }
      const vID = {
        packageVersion: packageMetadata.version,
        packageId: packageMetadata.id,
      };
      // default display name for packageType
      if (packageMetadata.type === vars.META_2_1_TOP_CATEGORY.software.id) {
        packageMetadata.typeName = vars.META_2_1_TOP_CATEGORY.software.text;
      } else if (packageMetadata.type === vars.META_2_1_TOP_CATEGORY.devices.id) {
        packageMetadata.typeName = vars.META_2_1_TOP_CATEGORY.devices.text;
      } else if (packageMetadata.type === vars.META_2_1_TOP_CATEGORY.devtools.id) {
        packageMetadata.typeName = vars.META_2_1_TOP_CATEGORY.devtools.text;
      }
      return callback(null, vID, packageMetadata);
    }
    return callback('Invalid package.tirex.json');
  });
};

/**
 * 1. expand devices specified as regex
 * 2. expand any device family/sub-family/ect into variants
 *
 * @param dbDevices
 * @param record
 * @param deviceName
 * @param callback
 */
exports.expandDevices = function (dbDevices, record, deviceName, logger, callback) {
    logger.log('debug', record.name, 'Finding device record for ' + deviceName);
    if (record.devicesVariants == null) {
        record.devicesVariants = [];
    }
    if (record.devicesAncestors == null) {
        record.devicesAncestors = [];
    }
    const regex = /^\/(.*?)\/$/; // check if device is specified as regex, e.g.: '/msp43?/'
    let _deviceName;
    if (regex.test(deviceName) === true) {
        const r = regex.exec(deviceName);
        r[1] = r[1].replace(/\//g, '_'); // '/' not allowed, TODO: can restriction be lifted once
        // client encodes URLs?
        _deviceName = new RegExp(r[1], 'i'); // device tags are stored uppercase and we can't
        // uppercase the regex, i.e. use 'i'
    } else {
        _deviceName = deviceName.toUpperCase()
        // force all device tags to upper case (to allow some latitude in how content providers
        // specify them across device tree and content db's)
            .replace(/\//g, '_');
        // '/' not allowed, TODO: can restriction be lifted once client encodes URLs?
    }

    dbDevices.find({
        name: _deviceName
    }, function (err, deviceRecords) {
        if (err) {
            logger.log('error', 'Query error: ' + JSON.stringify(err));
            callback(err);
            return;
        }
        if (deviceRecords === null) {
            logger.log('warning', 'Device not found in the device db: ' + deviceName + '. Skipping.');
            callback();
            return;
        }

        // expand any device family/sub-family/ect into variants
        async.each(deviceRecords, function (deviceRecord, callback) {
            if (deviceRecord.children == null || deviceRecord.children.length === 0) {
                record.devicesVariants.push(deviceRecord.name);
                callback();
            } else {
                if (record.devicesAncestors.indexOf(deviceRecord.name) === -1) {
                    record.devicesAncestors.push(deviceRecord.name);
                }
                async.each(deviceRecord.children, function (child, callback) {
                    exports.expandDevices(dbDevices, record, child, logger, callback);
                }, err => setImmediate(callback, err));
            }
        }, err => setImmediate(callback, err));
    });
};

exports.isImportableResource = function(resourceRecord) {
    return ['project.ccs', 'projectSpec', 'project.energia', 'file.importable', 'folder.importable']
        .indexOf(resourceRecord.resourceType) !== -1
};

exports.mergeMissingArrayElements = function (array1, array2) {
    return array1.concat(
        array2.filter(val2 => array1.indexOf(val2) === -1)
    );
};


exports.readJsonWithComments = function(file, callback) {
    fs.readFile(file, 'utf8', (err, text) => {
        if (err) {
            logger.error(err);
            callback(err);
        } else {
            callback(null, JSON.parse(stripJsonComments(text)));
        }
    });
};

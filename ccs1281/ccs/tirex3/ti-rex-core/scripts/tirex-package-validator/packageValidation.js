'use strict';

require('rootpath')();

// third party
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// our module
const singleFileValidator = require('scripts/tirex-package-validator/singleJsonFileValidation');
const fsutils = require('lib/localserver/fsutils');
const pathHelper = require('lib/path-helpers');
const metadaTIrexFolder = path.join('.metadata', '.tirex');

/**
 * Usage: new PackageValidator(filePath).validate();
 * */
class PackageValidator {
    constructor(packageFolder) {
        this.folder = packageFolder;
    }

    validate() {
        // read package.tirex.json first to get the metadata type. ie: software, devices, devtools
        const packageJsonPath = path.join(
            this.folder, metadaTIrexFolder, 'package.tirex.json'
        );
        this._readSingleFiles(packageJsonPath, (err, packageJson) => {
            this._readMetadataFiles(packageJson);
        });
    }

    /**
     * Reads a single file based on the file path
     * and validates the json file based on the type of metadata it is
     *
     * @param {string} file - The metadata directory.
     * @param {function} callback
     */
    _readSingleFiles(file, callback=()=>{}) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                console.log('Missing required file: ' + file);
                return;
            }

            const fileValidator = new singleFileValidator(file);
            const fileJson = fileValidator.parseJson(data);
            if (fileJson) {
                fileValidator.validateJson(fileJson);
                callback(null, fileJson);
            }
        });
    }

    /**
     * Loops through all the files that matched the file path regex
     * and validates the json file based on the type of metadata it is
     *
     * @param {array} files - The metadata files.
     */
    _readMultipleFiles(files) {
        files.forEach(function (file) {
            const singleFile = new singleFileValidator(pathHelper.normalizeFile(file));
            singleFile.validate();
        });
    }

    /**
     * Read and validates the content.tirex.json files for 3.0
     * Matches <any folder in pkg>/.metadata/.tirex/content.tirex.json
     * content.tirex.json can be prefixed with a string eg.myprefx.content.tirex.json
     * The prefix must not be 2.0_devtools or 2.0_devices for they are preserved for 2.1 metadata
     *
     * Check and notify user for misplaced files.
     */
    _readContentFiles() {
        const contentFiles = path.join(this.folder, '**/@(content|*.content).tirex.json');
        // {dot: true} allows glob to look through hidden folders}
        glob(contentFiles, {dot: true}, (er, files) => {
            let newContents = files.filter((file) => {
                return path.basename(file) !== '2.0_devices.content.tirex.json'
                    && path.basename(file) !== '2.0_devtools.content.tirex.json';
            });

            let validFiles = newContents.filter((file) => {
                return this._isMetadataTirexFolderSubfolder(file);
            });
            this._readMultipleFiles(validFiles);

            let invalidFiles = newContents.filter((file) => {
                return !this._isMetadataTirexFolderSubfolder(file);
            });
            this._logErrorForInvalidFiles(invalidFiles);
        });
    }

    /**
     * @param {String} file
     *
     * @returns {Boolean} isIndexOf
     *
     */
    _isMetadataTirexFolderSubfolder(file) {
        return pathHelper.normalizeFile(file).indexOf(
            pathHelper.normalizeFile(path.join(metadaTIrexFolder, path.basename(file)))) > -1;
    }

    _logErrorForInvalidFiles(files) {
        console.log('The following files are NOT VALIDATED. Please check the required parent folder or the naming convention of these file.');
        console.log(files);
    }

    /**
     * Read and validates the content.tirex.json files for 2.1 for compatibility
     * Matches <any folder in pkg>/.metadata/.tirex/2.0_devtools.content.tirex.json
     * or 2.0_devices.content.tirex.json
     *
     * Check and notify user for misplaced files.
     */
    _readOldContentFiles() {
        const oldContentFiles = path.join(this.folder, '**/2.0_@(devices|devtools).content.tirex.json');
        glob(oldContentFiles, {dot: true}, (er, files) => {
            let validFiles = files.filter((file) => {
                return this._isMetadataTirexFolderSubfolder(file);
            });
            this._readMultipleFiles(validFiles);

            let invalidFiles = files.filter((file) => {
                return !this._isMetadataTirexFolderSubfolder(file);
            });
            this._logErrorForInvalidFiles(invalidFiles);
        });
    }

    /**
     * Read and validates the devices.tirex.json files
     * Must be in format of <pkg root>/.metadata/.tirex/devices.tirex.json
     */
    _readDeviceFile() {
        this._readFilesInPkgRootFolder('devices.tirex.json', '**/devices.tirex.json');
    }

    /**
     * Read and validates the devtools.tirex.json files
     * Must be in format of <pkg root>/.metadata/.tirex/devtools.tirex.json
     */
    _readDevToolsFile() {
        this._readFilesInPkgRootFolder('devtools.tirex.json', '**/devtools.tirex.json');
    }

    /**
     * Read and validates the files that should be located in <pkg root>/.metadata/.tirex/xxx.tirex.json
     * Check and notify user for misplaced files.
     */
    _readFilesInPkgRootFolder(filename, globPattern) {
        const packageFolder = path.join(this.folder, metadaTIrexFolder);
        const validFile = pathHelper.normalizeFile(path.join(packageFolder, filename));
        self._readSingleFiles(validFile);

        const globPath = path.join(this.folder, globPattern);
        glob(globPath, {dot: true}, (er, files) => {
            let invalidFiles = files.filter((file) => {
                return pathHelper.normalizeFile(file) !== validFile;
            });
            self._logErrorForInvalidFiles(invalidFiles);
        });
    }

    _readMetadataFiles(packageJson) {
        switch (packageJson[0].type) {
        case 'devices':
            this._readDeviceFile();
            break;
        case 'devtools':
            this._readDevToolsFile();
            break;
        default:
            if (packageJson[0].metadataVersion.match("^([2][.][0]?[1][.][0]{1,2})$")) {
                this._readOldContentFiles();
            }
            break;
        }
        this._readContentFiles();
    }
}
module.exports = PackageValidator;

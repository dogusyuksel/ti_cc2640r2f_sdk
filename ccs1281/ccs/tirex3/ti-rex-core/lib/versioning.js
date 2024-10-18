'use strict';

/**
 * Wraps semvver APIs to handle 4+ digit versions. Only deals with semver ranges. See semver documentation for bellow functions.
 * 
 */

const semver = require('semver');

/**
 * @param {String} version1
 * @param {String} version2
 * 
 * @returns {Integer} result
 */
exports.compare = function(version1, version2) {
    const semver1 = convertToSemver(version1);
    const semver2 = convertToSemver(version2);

    const isSemver = semver.valid(version1) || semver.valid(version2);
    if (semver.eq(semver1, semver2) && !isSemver) {
        return fallbackCompare(version1, version2);
    }
    else {
        return semver.compare(semver1, semver2);
    }
};

/**
 * @param {String} version1
 * @param {String} version2
 * 
 * @returns {Integer} result
 */
exports.rcompare = function(version1, version2) {
    return exports.compare(version2, version1);
};

/**
 * @param {String} version
 * @param {String} versionRange
 * 
 * @returns {Boolean} result
 */
exports.gtr = function(version, versionRange) {
    return exports.outside(version, versionRange, '>');
};

/**
 * @param {String} version
 * @param {String} versionRange
 * 
 * @returns {Boolean} result
 */
exports.ltr = function(version, versionRange) {
    return exports.outside(version, versionRange, '<');
};

/**
 * @param {String} version
 * @param {String} versionRange
 * @param {String} hilo
 
 * @returns {Boolean} result
 */
exports.outside = function(version, versionRange, hilo) {
    if (semver.validRange(versionRange)) {
        const _semver = exports.convertToSemver(version);
        return semver.outside(_semver, versionRange, hilo);
    }
    else if (hilo === '>') {
        return exports.compare(version, versionRange) === 1;
    }
    else if (hilo === '<') {
        return exports.compare(version, versionRange) === -1;
    }
    else {
        throw new Error(`Unknown hilo ${hilo}`);
    }
}

/**
 * @param {Array.String} versions
 * @param {String} versionRange
 * 
 * @returns {String|null} result
 */
exports.maxSatisfying = function(versions, versionRange) {
    if (semver.validRange(versionRange)) {
        const result = versions.filter((version) => {
            const _semver = convertToSemver(version);
            return semver.satisfies(_semver, versionRange);
        }).sort((v1, v2) => {
            return exports.rcompare(v1, v2);
        });
        return result.length > 0 ? result[0] : null;
    }
    else {
        return versions.find((version) => {
            return version === versionRange;
        });
    }
};

/**
 * @param {String} version
 * @param {String} versionRange
 *
 * @returns {Boolean} result
 */
exports.satisfies = function(version, versionRange) {
    if (semver.validRange(versionRange)) {
        const _semver = convertToSemver(version);
        return semver.satisfies(_semver, versionRange);
    }
    else {
        return version === versionRange;
    }
};

/**
 * @param {String} version
 *
 * @returns {String|null} result
 */
exports.valid = function(version) {
    const isValid = semver.valid(version) ||
          (!/^\d+\.\d+\.\d+\.\d+\.\d+/.test(version) && /\d+\.\d+\.\d+\.\d+.*/.test(version))
    return isValid ? version : null;
}

///////////////////////////////////////////////////////////////////////////////
/// Helpers
///////////////////////////////////////////////////////////////////////////////

/**
 * Convert a bundle/resource version to semver format
 * Keep first 3 parts only and remove any leading zeros
 * 
 * @param {String} version
 * 
 * @returns {String|null} result - semver version or null if conversion unsuccessful
 */
function convertToSemver(version) {    
    if (version == null || !exports.valid(version)) {
        return null;
    }
    else if (semver.valid(version)) {
        return version;
    }
    else {
        const versionString = version + '';
        const versionArr = versionString.split('.').slice(0, 3);
        const semversion = versionArr.map(part => parseInt(part, 10)).join('.');
        return semver.clean(semversion);
    }
}; exports.convertToSemver = convertToSemver;

/**
 * Fallback to comparing 4th digit + trailing string in case where first 3 digits match
 * 
 * @param {String} version1
 * @param {String} version2
 *
 * @returns {Integer} result 
 *         1 if version1 > version2
 *         0 if version1 == version2
 *         -1 if version1 < version2
 */
function fallbackCompare(version1, version2) {
    const trailing1 = getTrailing(version1) || [];
    const trailing2 = getTrailing(version2) || [];
    if (trailing1.length !== trailing2.length) {
        throw new Error(`Cannot compare 2 versions with different number of digits ${version1} ${version2}`)
    }
    
    const length = Math.min(trailing1.length, trailing2.length);
    let result = null;
    for (let i = 0; i < length; i++) {
        if (typeof trailing1[i] === 'string') {
            if (trailing1[i] < trailing2[i]) {
                result = 1;
                break;
            }
            else if (trailing1[i] > trailing2[i]) {
                result = -1;
                break;
            }
        }
        else {
            if (trailing1[i] > trailing2[i]) {
                result = 1;
                break;
            }
            else if (trailing1[i] < trailing2[i]) {
                result = -1;
                break;
            }
        }
    }
    return result || 0; 
}

/**
 * Get the trailing 4th digit + trailing string as an array. 
 * 
 * @param {String} version
 * 
 * @returns {Array|null} trailing - null if version doesn't have 4 digits, [4th digit, trailing string] otherwise
 * 
 */
function getTrailing(version) {
    const versionArray = version.split('.');
    const numComponents = 4;
    if (versionArray.length >= numComponents) {
        const end = versionArray[numComponents - 1];
        const lastComponent = parseInt(end, 10);
        const additionalComponents = `.${versionArray.slice(4, versionArray.length).join('.')}`;
        const trailingString = end.replace(/[+|-]?\d+/, '') + (versionArray.length > numComponents ? additionalComponents : '');
        return [isNaN(lastComponent) ? Number.NEGATIVE_INFINITY : lastComponent, trailingString];
    }
    else {
        return null;
    }
}

if (require.main === module) {
    // TODO convert this to proper unit tests

    {
        const t1 = getTrailing('1.2.3.4rc');
        console.log(t1); // [4, rc]
        
        const t2 = getTrailing('1.2.3.4');
        console.log(t2); // [4, '']

        const t3 = getTrailing('1.2.3');
        console.log(t3); // null

        const t4 = getTrailing('1.2.3.567beta');
        console.log(t4); // [567, beta]

        const t5 = getTrailing('1.2.3.hello');
        console.log(t5); // [-Infinity, hello]
        
        console.log();
    }

    {
        const f1 = fallbackCompare('1.2.3.5', '1.2.3.4'); 
        console.log(f1); // 1

        const f2 = fallbackCompare('1.2.3.4', '1.2.3.4'); 
        console.log(f2); // 0

        const f3 = fallbackCompare('1.2.3.4', '1.2.3.5'); 
        console.log(f3); // -1

        const f5 = fallbackCompare('1.2.3.4apple', '1.2.3.4apricot');  
        console.log(f5); // 1
        
        const f4 = fallbackCompare('1.2.3.4apple', '1.2.3.4apple'); 
        console.log(f4); // 0

        const f6 = fallbackCompare('1.2.3.4apricot', '1.2.3.4apple');  
        console.log(f6); // -1

        const f7 = fallbackCompare('1.2.3.4', '1.2.3.4eng');
        console.log(f7); // 1

        const f8 = fallbackCompare('1.2.3.4eng', '1.2.3.4');
        console.log(f8); // -1
        
        console.log();
    }

    {
        const v1 = '1.2.3';
        console.log(exports.valid(v1)) // 1.2.3

        const v2 = '1.2.3eng';
        console.log(exports.valid(v2)) // null

        const v3 = '1.2.3.eng';
        console.log(exports.valid(v3)) // null

        const v4 = '1.2.3.4';
        console.log(exports.valid(v4)) // 1.2.3.4

        const v5 = '1.2.3.4.5';
        console.log(exports.valid(v5)) // null

        const v6 = '1.2.3.4eng';
        console.log(exports.valid(v6)) // 1.2.3.4eng

        const v7 = '1.2.3.4.eng';
        console.log(exports.valid(v7)) // 1.2.3.4.eng

        const v8 = '1.2.3.4eng.5';
        console.log(exports.valid(v8)) // 1.2.3.4eng.5

        const v9 = '1apple.2banana.3cucumber.4';
        console.log(exports.valid(v9)) // null

        const v10 = '1_2_3_4';
        console.log(exports.valid(v10)) // null
    }
    
}

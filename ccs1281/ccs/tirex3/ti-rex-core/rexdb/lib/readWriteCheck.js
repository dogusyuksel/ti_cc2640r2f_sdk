
'use strict';

module.exports = ReadWriteCheck;

const WRITE = 'write';
const READ = 'read';
const DONT_RWCHECK = 'dont check';
ReadWriteCheck.WRITE = WRITE;
ReadWriteCheck.READ = READ;
ReadWriteCheck.DONT_RWCHECK = DONT_RWCHECK;

/**
 *
 * @param throwException:boolean
 * @constructor
 */
function ReadWriteCheck(name) {
    this.name = name;
    this.throwOnIllegalConcurrentAccess = false;
    this.access = {};
    this.access[ReadWriteCheck.WRITE] = { time: null, stack: null };
    this.access[ReadWriteCheck.READ] = { time: null, stack: null };
}

ReadWriteCheck.prototype.setThrowConcurrentWriteException = function (bool) {
    this.throwOnIllegalConcurrentAccess = bool;
};

/**
 *
 * @param type:string
 */
ReadWriteCheck.prototype.entry = function (type) {
    if (this.throwOnIllegalConcurrentAccess && type !== DONT_RWCHECK) {
        if (type === WRITE && this.access[WRITE].time) {
            // two concurrent writes
            throw makeError(this.name + ': Write access attempted while write in progress', this.access);
        } else if (type === WRITE && this.access[READ].time) {
            // write while ongoing read
            throw makeError(this.name + ': Write access attempted while read in progress', this.access);
        } else if (type === READ && this.access[WRITE].time) {
            // read while ongoing write
            throw makeError(this.name + ': Read access attempted while write in progress', this.access);
        }
        // multiple concurrent reads are allowed
        // always the latest read access will replace the previous read access, which may still be in progress
        this.access[type].time = new Date();
        this.access[type].stack = new Error().stack;
    }
};

/**
 *
 * @param type:string
 * @param callback:function
 * @param err:object
 * @param result:object
 */
ReadWriteCheck.prototype.exit = function (type, callback, err, result) {
    if (this.throwOnIllegalConcurrentAccess && type !== DONT_RWCHECK) {
        this.access[type].time = null;
        this.access[type].stack = null;
    }
    if (callback) {
        callback(err, result);
    }
};

function makeError(message, accessInProgress) {
    const error = new Error(message);
    error.readwritecheck = true;
    error.writeInProgressTime = accessInProgress[WRITE].time;
    error.writeInProgressStack = accessInProgress[WRITE].stack;
    error.readInProgressTime = accessInProgress[READ].time;
    error.readInProgressStack = accessInProgress[READ].stack;
    return error;
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRexDB = void 0;
// tslint:disable:member-ordering
/**
 * rexdb - small in-memory database with file system persistence and optional query cache
 * Always returns a deep copy of documents
 *
 * APIs are similar to MongoDB
 *
 * osohm, 7/21/2014
 */
const promisifyAny_1 = require("../../utils/promisifyAny");
/**
 * Constructor
 * @param {String} file name - if null then this is new a in-memory database
 * @constructor
 */
class IRexDB {
    constructor() {
        this.saveAsync = promisifyAny_1.promisifyAny(this.save);
        this.insertAsync = promisifyAny_1.promisifyAny(this.insert);
        this.updateAsync = promisifyAny_1.promisifyAny(this.update);
        this.upsertAsync = promisifyAny_1.promisifyAny(this.upsert);
        this.removeAsync = promisifyAny_1.promisifyAny(this.remove);
        this._findAsync = promisifyAny_1.promisifyAny(this.find);
        this.findNoDeepCopyAsync = promisifyAny_1.promisifyAny(this.findNoDeepCopy);
        this.findOneAsync = promisifyAny_1.promisifyAny(this.findOne);
    }
    // wrapper to always return an array - TODO: fix in find() itself once converted to async
    async findAsync(query) {
        const result = await this._findAsync(query);
        return result ? result : [];
    }
}
exports.IRexDB = IRexDB;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Counter = void 0;
// our modules
const util_1 = require("./util");
// Autowrapping counter operating from [0, max - 1]
class Counter {
    constructor() {
        this.counter = 0;
        this.max = util_1.HIGHEST_SAFE_NUMBER;
    }
    getValue() {
        return this.counter;
    }
    setValue() {
        this.counter = (this.counter + 1) % this.max;
    }
}
exports.Counter = Counter;

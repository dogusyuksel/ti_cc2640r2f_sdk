
class ValueCache {
    
    /**
     * @param lifetime - in ms
     * @param updateFn(onUpdate(newValue))
     */
    constructor(lifetime, updateFn) {
        this.cachedValue = null;
        this.timeStamp = -Infinity;
        this.lifetime = lifetime;
        this.updateFn = updateFn;

        this.pending = false;
        this.onPendingDone = null;
    }

    /**
     * Retrieve the value 
     *
     * @param callback(value)
     */
    getValue(callback) {
        if (Date.now() - this.timeStamp > this.lifetime) {
            if (!this.pending) {
                const q = Promise.defer();
                this.pending = true;
                this.onPendingDone = q.promise;
                this.updateFn((newValue) => {
                    this.pending = false; 
                    this.timeStamp = Date.now();
                    this.cachedValue = newValue;
                    callback(this.cachedValue);
                    q.resolve(this.cachedValue);
                });   
            }
            else {
                this.onPendingDone.then(function(newValue) {
                    callback(newValue);
                });
            }
        }
        else {
            callback(this.cachedValue);
        }
    }

    /**
     * Retrieve the value (do not get a fresh value)
     *
     * @param callback(value)
     */    
    getValueStale(callback) {
        if (this.timeStamp === -Infinity) {
            // no cached value
            this.getValue(callback);
        }
        else {
            callback(this.cachedValue);
        }
    }
} module.exports = ValueCache;


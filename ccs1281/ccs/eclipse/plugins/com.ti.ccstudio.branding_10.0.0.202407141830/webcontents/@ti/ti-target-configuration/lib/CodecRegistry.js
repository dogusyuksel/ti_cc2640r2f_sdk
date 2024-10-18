import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
// eslint-disable-next-line no-useless-escape
const regExSplitOnCommaNotInParenthesis = /\,(?![^\)\()]*\))/;
const invalidNameRegEx = /[^0-9a-zA-Z_.$]/;
class CodecInfo {
    constructor(codec) {
        this.codec = codec;
        this.inUse = false;
        this.isConnected = false;
        this.children = [];
    }
    ;
    isDeviceRequired(deviceId) {
        let result = false;
        if (this.codec.deviceId === deviceId) {
            result = true;
        }
        else {
            result = this.children.reduce((isUsed, child) => isUsed || child.isDeviceRequired(deviceId), false);
        }
        return result;
    }
    ;
    isOptional() {
        if (this.codec.optional) {
            // case 1: specifically marked as optional
            return true;
        }
        else if (this.children.length === 0) {
            // case 2: no children and not optional
            return false;
        }
        else {
            // case 3: not optional, but all children are optional.
            return this.children.reduce((result, child) => result && child.isOptional(), true);
        }
    }
    async disconnect(logger) {
        for (let i = 0; i < this.children.length; i++) {
            try {
                const child = this.children[i];
                await child.disconnect(logger);
            }
            catch (err) {
                // ignore errors on child disconnect, there is no recovery for a failed disconnect.
            }
        }
        ;
        if (this.codec.doDisconnect && this.isConnected) {
            try {
                logger.addDebugMessage('Disconnecting ${this.codec.toString()}');
                await this.codec.doDisconnect(logger);
            }
            catch (err) {
                logger.addErrorMessage(`${this.codec.toString()} failed to disconnect: ${err}`);
            }
        }
        this.isConnected = false;
    }
    ;
    async connect(logger) {
        this.isConnected = false;
        if (this.codec.doConnect) {
            try {
                logger.addDebugMessage('Connecting ${this.codec.toString()}');
                await this.codec.doConnect(logger);
            }
            catch (err) {
                logger.addErrorMessage(`${this.codec.toString()} failed to connect: ${err}`);
                throw err;
            }
        }
        this.isConnected = true;
        let childConnectCount = 0;
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            try {
                await child.connect(logger);
                childConnectCount++;
            }
            catch (err) {
                if (!child.isOptional()) {
                    logger.addErrorMessage(`${this.codec.toString()} failed to connect because one or more child codecs failed`);
                    throw err;
                }
            }
        }
        ;
        if (childConnectCount === 0 && this.children.length > 0) {
            const errMsg = `${this.codec.toString()} failed to connect because all child codecs failed`;
            logger.addErrorMessage(errMsg);
            throw new Error(errMsg);
        }
    }
    ;
    async ping() {
        if (this.isConnected) {
            if (this.codec.ping) {
                await this.codec.ping();
            }
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                await child.ping();
            }
            ;
        }
    }
    ;
    doDeconfigure() {
        if (this.inUse && this.codec.deconfigure) {
            this.codec.deconfigure();
        }
        this.inUse = false;
        this.isConnected = false;
        this.children = [];
    }
    ;
    doConfigure(children) {
        if (this.codec.configure) {
            this.codec.configure();
        }
        this.inUse;
        this.inUse = true;
        this.children = children;
    }
    ;
}
;
export class CodecRegistry {
    static configure(configuration) {
        // deconfigure any existing configuration.
        this.instances.forEach((item) => item.doDeconfigure());
        // construct the new configuration.
        try {
            configuration = configuration.trim();
            if (configuration.length === 0) {
                throw new Error('The config specification was empty');
            }
            this.parseConfigurationList(configuration);
        }
        catch (e) {
            throw new Error(`Invalid Configuration specified:  ${e.message}, in ${configuration}`);
        }
    }
    ;
    static parseConfigurationChain(config, children) {
        const pos = config.indexOf('(');
        if (pos >= 0) {
            if (config.endsWith(')')) {
                if (children.length > 0) {
                    throw new Error(`The configuration must represent a tree, but child nodes found after: ${config}`);
                }
                const childConfig = config.substring(pos + 1, config.length - 1).trim();
                if (childConfig.length === 0) {
                    throw new Error('Operator () is empty, but was expecting a comma separated list of child nodes');
                }
                children = this.parseConfigurationList(childConfig);
                const parentChain = config.substring(0, pos).trim();
                if (parentChain.length === 0) {
                    throw new Error(`Operator () is missing the parent node, which was expected before the opening parentheses ${config}`);
                }
                return this.parseConfigurationChain(parentChain, children);
            }
            else {
                throw new Error(`Operator () is missing a closing paraenthesis ")" at the end of ${config}`);
            }
        }
        else {
            const nodes = config.split('+');
            let codecInfo;
            for (let i = nodes.length; i-- > 0;) {
                const nodeName = nodes[i].trim();
                if (nodeName.length === 0) {
                    if (i === 0) {
                        throw new Error(`Operator + is missing it's left parameter ${config}`);
                    }
                    throw new Error(`Operator + is missing it's right parameter ${nodes[i - 1]}+`);
                }
                codecInfo = this.getInstanceInfo(nodeName);
                if (codecInfo.inUse) {
                    throw new Error(`Codec id=${nodeName} is used twice`);
                }
                if (children.length > 0) {
                    const parent = codecInfo.codec;
                    if (!(parent.addChildDecoder && parent.encoderInputType && parent.encoderOutputType)) {
                        throw new Error(`Invalid parent node.  ${parent.id} is not an IEncoder`);
                    }
                    children.forEach((c) => {
                        const child = c.codec;
                        if (!(child.setParentEncoder && child.decoderInputType && child.decoderOutputType)) {
                            throw new Error(`Invalid child node.  ${child.id} is not an IDecoder`);
                        }
                        if (child.decoderInputType.isCompatible(parent.encoderOutputType)) {
                            if (parent.encoderInputType.isCompatible(child.decoderOutputType)) {
                                parent.addChildDecoder(child);
                                child.setParentEncoder(parent);
                            }
                            else {
                                throw new Error(`Type Mismatch: ${parent.id} input type ${parent.encoderInputType.name} is incompatable with ${child.id} output type ${child.decoderOutputType.name}.`);
                            }
                        }
                        else {
                            throw new Error(`Type Mismatch: ${parent.id} output type ${parent.encoderOutputType.name} is incompatable with ${child.id} input type ${child.decoderInputType.name}.`);
                        }
                    });
                }
                codecInfo.doConfigure(children);
                children = [codecInfo];
            }
            return codecInfo;
        }
    }
    ;
    /**
     * Method for creating Packet protocol chains.
     *
     * @param {string} codecName - the name identifying the protocol or packet codec chain to create.
     * @param {function} encoder - the transport method used to send packets of data after encoding.
     * @param {function} [decoder] - the model's handler to receive the target values after decoding.
     * @returns {object} the first codec in the chain with added encoder() and decoder() helper functions
     * for pushing data through the codec chain.
     */
    static parseConfigurationList(config) {
        let configs = config.split(regExSplitOnCommaNotInParenthesis);
        configs = configs.map((value) => value.trim());
        if (configs.reduce((state, value) => state || value.length === 0, false)) {
            throw new Error(`Missing at least one child in this comma separated list ${config}`);
        }
        return configs.map((child) => this.parseConfigurationChain(child, []));
    }
    ;
    static validateCodecName(name) {
        name = name.toLowerCase();
        if (!(name && name.match(invalidNameRegEx) === null)) {
            throw new Error(`Bad identifier ${name}.  Identifiers for Codecs, models, and transports must only contain numbers, letters, underscore, period, or $ characters`);
        }
        return name;
    }
    ;
    /**
     * Method for registering custom codec's for use by the create() method.
     *
     * @param {string} name - the name identifying the packet codec.
     * @param {function} constructor - the constructor functon for for the packet codec.
     *
     */
    static register(instance) {
        if (instance.id) {
            const id = this.validateCodecName(instance.id);
            this.instances.set(id, new CodecInfo(instance));
            const promise = this.waitForCodecs.get(id);
            if (promise) {
                promise.resolve();
            }
        }
    }
    ;
    static getInstanceInfo(name) {
        const id = this.validateCodecName(name);
        const result = this.instances.get(id);
        if (!result) {
            throw new Error(`Missing node ${name} in the codec registry.  There must be model, transport, or codec with id="${name}" somewhere in index.html`);
        }
        return result;
    }
    ;
    static getInstance(name) {
        return this.getInstanceInfo(name).codec;
    }
    ;
    static isActive(name) {
        return this.getInstanceInfo(name).inUse;
    }
    ;
    static isConnected(name) {
        return this.getInstanceInfo(name).isConnected;
    }
    ;
    static ping(name) {
        return this.getInstanceInfo(name).ping();
    }
    ;
    static connect(name, logger) {
        return this.getInstanceInfo(name).connect(logger);
    }
    ;
    static disconnect(name, logger) {
        return this.getInstanceInfo(name).disconnect(logger);
    }
    ;
    static isOptional(name) {
        return this.getInstanceInfo(name).isOptional();
    }
    ;
    static isDeviceRequired(name, deviceId) {
        return this.getInstanceInfo(name).isDeviceRequired(deviceId);
    }
    ;
    static async whenConfigurationReady(configuration) {
        const ids = configuration.toLowerCase().split(/[,()+]+/g);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i].trim();
            if (id && id.match(invalidNameRegEx) === null && !this.instances.get(id)) {
                if (!this.waitForCodecs.get(id)) {
                    this.waitForCodecs.set(id, TiPromise.defer());
                }
                await this.waitForCodecs.get(id).promise;
            }
        }
    }
    ;
    static clear() {
        this.instances = new Map();
        this.waitForCodecs = new Map();
    }
    ;
}
CodecRegistry.instances = new Map();
CodecRegistry.waitForCodecs = new Map();
;
//# sourceMappingURL=CodecRegistry.js.map
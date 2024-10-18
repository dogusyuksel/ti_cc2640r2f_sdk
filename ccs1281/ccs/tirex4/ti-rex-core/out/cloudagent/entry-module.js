"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.name = exports.EntryModule = exports._IDE_SERVER_PORT = exports.latestBoardsAndDevicesFileName = exports.defaultBoardsAndDevicesFileName = void 0;
// native modules
const path = require("path");
// 3rd party
const fs = require("fs-extra");
const PQueue = require("p-queue");
const open = require("open");
// our modules
const appConfig_1 = require("../lib/appConfig");
const vars_1 = require("../lib/vars");
const interface_1 = require("./interface");
const util_1 = require("./util");
const package_installer_1 = require("./package-installer");
const logging_1 = require("../utils/logging");
const progress_manager_1 = require("./progress-manager");
const offline_metadata_manager_1 = require("./offline-metadata-manager");
const response_data_1 = require("../shared/routes/response-data");
const ccs_adapter_1 = require("./ccs-adapter");
const util_2 = require("../shared/util");
const logger_1 = require("../utils/logger");
const logging_types_1 = require("../utils/logging-types");
const ExternalApis = require("./external-apis");
const request_helpers_1 = require("../shared/request-helpers");
// TODO? Move these filename constants somewhere more appropriate?
exports.defaultBoardsAndDevicesFileName = 'default-boards-and-devices.json';
exports.latestBoardsAndDevicesFileName = 'latest-boards-and-devices.json';
///////////////////////////////////////////////////////////////////////////////
/// Code
///////////////////////////////////////////////////////////////////////////////
// Exported for tests, TODO consider making data names an enum
exports._IDE_SERVER_PORT = 'ccs.ideServer.port';
/**
 * This is the cloud agent module that the browser talks to in order to do all local operations
 * Note:
 *  - all private functions must start with _ or will be exposed by agent.js (which uses
 *    run time reflection, not typescript)
 *  - all public functions must return a promise
 *
 */
class EntryModule {
    constructor(triggerEvent, loggerInput, eventBroker, config, rex3Config) {
        this.triggerEvent = triggerEvent;
        this.loggerInput = loggerInput;
        this.eventBroker = eventBroker;
        if (config) {
            this.config = config;
        }
        if (rex3Config) {
            this.rex3Config = rex3Config;
        }
    }
    async init({ ccsPort, proxy, isTheia }) {
        if (this.isInitalized) {
            return;
        }
        // Setup configs
        this.config = await this.getConfig();
        this.vars = new vars_1.Vars(this.config);
        this.rex3Config = appConfig_1.processConfig(this.rex3Config || (await fs.readJSON(this.vars.rex3Config)));
        this.logger = new logging_1.Logger('tirex-cloudagent-module', logger_1.createDefaultLogger(new LoggerAdapter(this.loggerInput)));
        await this._setupProxy(proxy);
        this.commonParams = {
            logger: this.logger,
            rex3Config: this.rex3Config,
            vars: this.vars,
            triggerEvent: this.triggerEvent,
            desktopQueue: new PQueue({ concurrency: 1 })
        };
        ccsPort = this.config.ccs_port ? parseInt(this.config.ccs_port, 10) : ccsPort;
        // Setup helper classes
        this.progressManager = new progress_manager_1.ProgressManager(this.triggerEvent, this.logger);
        this.offlineMetadataManager = new offline_metadata_manager_1.OfflineMetadataManager(this.commonParams);
        this.ccsAdapter = new ccs_adapter_1.CCSAdapter(this.commonParams.logger, this.commonParams.desktopQueue, ccsPort, isTheia, this.vars, this.offlineMetadataManager, this.progressManager, this.triggerEvent);
        await this.ccsAdapter.start();
        this.packageInstaller = new package_installer_1.PackageInstaller(this.commonParams, this.progressManager, this.ccsAdapter);
        this.isInitalized = true;
    }
    async getCCSEclipseInitValues() {
        const ccsPort = this.eventBroker.fetchData(EntryModule.IDE_SERVER_PORT);
        const httpProxy = this.eventBroker.hasData(EntryModule.HTTP_PROXY)
            ? this.eventBroker.fetchData(EntryModule.HTTP_PROXY)
            : '';
        const httpsProxy = this.eventBroker.hasData(EntryModule.HTTPS_PROXY)
            ? this.eventBroker.fetchData(EntryModule.HTTPS_PROXY)
            : '';
        return { ccsPort, httpProxy, httpsProxy };
    }
    /**
     * Called by cloud agent when the last client is gone to perform any clean up
     * Must be synchronous, or else cloud agent must be updated
     *
     */
    onClose() {
        if (!this.isInitalized) {
            return;
        }
        this.progressManager.close();
        this.ccsAdapter.close();
        this.logger.close();
    }
    // Getters
    async getPackageInstallInfo() {
        return handleResponse(this.ccsAdapter.getSearchPaths());
    }
    async getInstalledPackages() {
        return handleResponse(this.ccsAdapter.getInstalledPackages());
    }
    async getAgentMode() {
        return handleResponse(Promise.resolve(this.vars.mode === 'remoteserver' ? 'cloud' : 'desktop'));
    }
    async getProgress() {
        return handleResponse(Promise.resolve(this.progressManager.getProgress()));
    }
    async getVersion() {
        return handleResponse(Promise.resolve(vars_1.Vars.VERSION_TIREX));
    }
    // Actions
    async clearTaskProgress(progressId) {
        return handleResponse(Promise.resolve(this.progressManager.clearTaskProgress(progressId)));
    }
    async installPackage(pkg, installLocation) {
        return handleResponse(this.packageInstaller.installPackage(pkg, installLocation));
    }
    async uninstallPackage(pkg) {
        return handleResponse(this.packageInstaller.uninstallPackage(pkg));
    }
    async updateOfflineBoardsAndDevices() {
        return handleResponse(this._updateOfflineBoardsAndDevices());
    }
    async getCcsDevices(targetFilter) {
        return handleResponse(this.ccsAdapter.getDevices(targetFilter));
    }
    async getCcsDeviceDetail(deviceId) {
        return handleResponse(this.ccsAdapter.getDeviceDetail(deviceId));
    }
    async getProjectTemplates(deviceId, toolVersion) {
        return handleResponse(this.ccsAdapter.getProjectTemplates(deviceId, toolVersion));
    }
    async importProject(resourceType, packageUid, location, targetId, projectName) {
        return handleResponse(this.ccsAdapter.importProject(resourceType, packageUid, location, targetId, projectName));
    }
    /**
     * Import a CCS Project template.
     *
     * This actually *creates* a new CCS Project based on a template, but we are treating it as an
     * import to align with importProject() which also creates projects based on templates in some
     * cases (resource types FILE and FOLDER).
     */
    async importProjectTemplate(templateId, targetId, projectName, toolVersion, outputTypeId, location) {
        return handleResponse(this.ccsAdapter.importProjectTemplate(templateId, targetId, projectName, toolVersion, outputTypeId, location));
    }
    async openExternally(link) {
        return handleResponse(open(`${new URL(this.vars.remoteserverUrl)}${link}`).then(() => { }));
    }
    async onProductsChanged() {
        this.ccsAdapter.onProductsChanged();
        return handleResponse(Promise.resolve());
    }
    //
    // External APIs, careful changing these!! These will be called by other services, beyond tirex.
    //
    async getBoardAndDeviceInfo(options) {
        return handleResponse(ExternalApis.getBoardAndDeviceInfo(this.commonParams, options));
    }
    async getInstallInfoForPackageDependencies(packageInfo, options) {
        return handleResponse(ExternalApis.getInstallInfoForPackageDependencies(packageInfo, this.ccsAdapter, this.commonParams, options.excludePackageAsDependency));
    }
    async getInstallInfoForPackages(options) {
        return handleResponse(ExternalApis.getInstallInfoForPackages(this.ccsAdapter, this.commonParams, {
            targetDevice: options.targetDevice || undefined,
            targetBoard: options.targetBoard || undefined
        }));
    }
    async getConfig() {
        if (this.isInitalized) {
            return this.config;
        }
        else {
            return appConfig_1.processConfig(this.config || (await getConfig()));
        }
    }
    // For test purposes only
    async _addProgressTask() {
        // Should be implemented in the mock module
        throw new Error('Method for testing only');
    }
    // TODO! Move implementation deeper, maybe into a dedicated ts for offline (similarly to offline-metadata-manager.ts)
    async _updateOfflineBoardsAndDevices() {
        // Get latest board and device data from server as well as sessionId
        const tirex4RemoteserverUrl = this.commonParams.vars.remoteserverUrl;
        const responseData = await request_helpers_1.doGetRequest(`${tirex4RemoteserverUrl}${"api/boardsDevices" /* GET_BOARDS_AND_DEVICES */}`);
        const boardAndDeviceData = responseData.data.payload;
        const sessionId = responseData.data.sideBand.sessionId;
        // TODO!! Config dir should just for fallback, with a new config var used instead as the preferred location; did
        // consider dbPath, but since its used for the resource database better to distinguish it. Another option is to
        // use an externally defined data dir (possibly as the primary preferred dir).
        const latestBoardsAndDevicesFilePath = path.join(util_1.getConfigFolder(), exports.latestBoardsAndDevicesFileName);
        // Determine if the offlined board and device data is out of date and if so persist it
        // locally
        let updateNeeded = true;
        if (await fs.pathExists(latestBoardsAndDevicesFilePath)) {
            const json = await fs.readJSON(latestBoardsAndDevicesFilePath);
            if (json && json.sessionId && json.sessionId === sessionId) {
                updateNeeded = false;
            }
        }
        if (updateNeeded) {
            // Session id has changed, meaning that there's been a database update since. So we need
            // to update.
            await fs.writeJSON(latestBoardsAndDevicesFilePath, {
                ...boardAndDeviceData,
                sessionId
            });
        }
    }
    /**
     * Private Functions
     * Note: all private functions must start with _ or will be exposed by agent.js (which uses
     * run time reflection, not typescript)
     */
    async _setupProxy(proxy) {
        const httpProxy = proxy || '';
        const httpsProxy = proxy || '';
        const noProxy = 'localhost,127.0.0.1,.toro.design.ti.com,.dhcp.ti.com';
        process.env.HTTP_PROXY = httpProxy || process.env.HTTP_PROXY || process.env.http_proxy;
        process.env.HTTPS_PROXY = httpsProxy || process.env.HTTPS_PROXY || process.env.https_proxy;
        process.env.NO_PROXY = noProxy || process.env.NO_PROXY || process.env.no_proxy;
        // IMPORTANT: must delete the property if it's falsey
        if (!process.env.HTTP_PROXY || process.env.HTTP_PROXY === 'undefined') {
            delete process.env.HTTP_PROXY;
        }
        if (!process.env.HTTPS_PROXY || process.env.HTTPS_PROXY === 'undefined') {
            delete process.env.HTTPS_PROXY;
        }
        if (!process.env.NO_PROXY || process.env.NO_PROXY === 'undefined') {
            delete process.env.NO_PROXY;
        }
        this.logger.info(`httpProxy ${httpProxy} httpsProxy ${httpsProxy}`);
        this.logger.info(`process.env values (final): HTTP_PROXY ${process.env.HTTP_PROXY} NO_PROXY ${process.env.NO_PROXY} HTTPS_PROXY ${process.env.HTTPS_PROXY}`);
    }
}
exports.EntryModule = EntryModule;
EntryModule.IDE_SERVER_PORT = exports._IDE_SERVER_PORT;
EntryModule.HTTP_PROXY = 'HTTP_PROXY';
EntryModule.HTTPS_PROXY = 'HTTPS_PROXY';
// Export name and an instance function
// This is what cloud agent explicitly looks for to instantiate us
exports.name = interface_1.rexCloudAgentModuleName;
function instance(triggerEvent, _createSiblingModule, logger, eventBroker) {
    return {
        commands: new EntryModule(triggerEvent, logger, eventBroker)
    };
}
exports.instance = instance;
async function getConfig() {
    const isWindows = util_1.getPlatform() === response_data_1.Platform.WINDOWS;
    const fileName = `app_localserver${isWindows ? '_win' : ''}.json`;
    const filePath = path.join(util_1.getConfigFolder(), fileName);
    return fs.readJSON(filePath);
}
async function handleResponse(promise) {
    // await delay(1000); // For testing only
    return promise;
}
/**
 * Adapts cloud agent logger to the internal rex logger
 */
class LoggerAdapter {
    constructor(cloudAgentLogger) {
        this.cloudAgentLogger = cloudAgentLogger;
    }
    logger(name) {
        return {
            ...util_2.mapValues(logging_types_1.loggerLevelsDef, () => (...toLog) => {
                this.cloudAgentLogger.info(`${name}: ${toLog.map(item => JSON.stringify(item)).join(', ')}`);
                return {
                    stamp: Date.now()
                };
            }),
            setPriority: () => ({ stamp: Date.now() })
        };
    }
}

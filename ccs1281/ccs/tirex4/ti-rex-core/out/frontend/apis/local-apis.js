"use strict";
// agent.js namespace
/// <reference types="agent" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAPIs = void 0;
const all_off_1 = require("event-emitter/all-off");
const _ = require("lodash");
const interface_1 = require("../../cloudagent/interface");
const local_apis_cache_interface_1 = require("./local-apis-cache-interface");
const event_emitter_1 = require("../component-helpers/event-emitter");
const util_1 = require("../component-helpers/util");
const errors_1 = require("../../shared/errors");
const theme_config_1 = require("../component-helpers/theme-config");
const Versioning = require("../../lib/versioning");
/**
 * This file is equivilent to APIs, but it is local-only actions.  It is implemented by calling into
 * cloud agent to handle everything.
 *
 * Note: the tirex sub module won't be available in the cloud initially.
 * getLocalModule will return null for the cloud if it has an issue getting tirex.
 * The public methods defined here will return will handle this case by returning empty arrays, etc.
 */
class LocalAPIs {
    constructor(errorCallback) {
        this.errorCallback = errorCallback;
        this.modulePromise = null;
        this.cacheInterface = new local_apis_cache_interface_1.LocalApisCacheInterface();
        this.emitter = new event_emitter_1.default();
        // Handling Events
        this.handleInstalledPackagesUpdated = async (packages) => {
            try {
                const data = await this.cacheInterface.setInstalledPackages(Promise.resolve(packages));
                this.emitter.emit("OnInstalledPackagesUpdated" /* ON_INSTALLED_PACKAGES_UPDATED */, data);
            }
            catch (e) {
                util_1.handleError(e, this.errorCallback);
            }
            // tslint:disable-next-line:semicolon - bug in our version of tslint
        };
        this.handleInstallInfoUpdated = async (installInfo) => {
            try {
                const data = await this.cacheInterface.setInstallInfo(Promise.resolve(installInfo));
                this.emitter.emit("OnInstallInfoUpdated" /* ON_INSTALL_INFO_UPDATED */, data);
            }
            catch (e) {
                util_1.handleError(e, this.errorCallback);
            }
            // tslint:disable-next-line:semicolon - bug in our version of tslint
        };
        this.handleProgressUpdated = async (progress) => {
            try {
                const data = await this.cacheInterface.setProgress(Promise.resolve(progress));
                this.emitter.emit("OnProgressUpdated" /* ON_PROGRESS_UPDATED */, data);
            }
            catch (e) {
                util_1.handleError(e, this.errorCallback);
            }
            // tslint:disable-next-line:semicolon - bug in our version of tslint
        };
        this.handleModuleError = async (error) => {
            try {
                // We got an error from the tirex submodule.
                // Call close then let error boundary prompt the user to refresh the page which will launch a new instance.
                await this.doClose();
            }
            catch (e) {
                // Log this error, let the passed in error go to errorCallback
                console.error(e);
            }
            finally {
                util_1.handleError(util_1.convertToCloudAgentError(error), this.errorCallback);
            }
            // tslint:disable-next-line:semicolon - bug in our version of tslint
        };
        this.handleClose = async () => {
            try {
                // Call close then let error boundary prompt the user to refresh the page which will launch a new instance.
                await this.doClose();
            }
            catch (e) {
                // Log this error, let the passed in error go to errorCallback
                console.error(e);
            }
            finally {
                util_1.handleError(new errors_1.CloudAgentError('Connection closed'), this.errorCallback);
            }
            // tslint:disable-next-line:semicolon - bug in our version of tslint
        };
    }
    // APIs
    async getPackageInstallInfo(agent) {
        const cachedResult = this.cacheInterface.getInstallInfo();
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setInstallInfo(module ? module.getPackageInstallInfo() : Promise.resolve([]));
    }
    async getInstalledPackages(agent) {
        const cachedResult = this.cacheInterface.getInstalledPackages();
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setInstalledPackages(module ? module.getInstalledPackages() : Promise.resolve([]));
    }
    async updateOfflineBoardsAndDevices(agent) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('Failed to get Cloud Agent TIREX module');
        }
        try {
            return await tirexModule.updateOfflineBoardsAndDevices();
        }
        catch (e) {
            // Catching and simply logging error as we could run into an issue writing to the latest
            // boards-and-devices file (e.g. dir could be read-only), which should never be fatal.
            //
            // TODO? Consider instead reporting error to user in a non-intrusive way and with
            // instructions on how to change its location (once this is actually configurable); if
            // it becomes so before we move to a longer-term local persistence solution (although
            // possible that we may end up having to do this for that as well)
            console.error('Error persisting boards and devices data locally:', e);
        }
    }
    async getOfflineBoardsAndDevices(agent) {
        const cachedResult = this.cacheInterface.getBoardAndDeviceInfo();
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setBoardAndDeviceInfo(module
            ? module.getBoardAndDeviceInfo({ offline: true })
            : Promise.resolve({
                boards: [],
                devices: []
            }));
    }
    async getCcsDevices(agent, targetFilter) {
        const cachedResult = this.cacheInterface.getCcsDevices(targetFilter);
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setCcsDevices(targetFilter, module
            ? module.getCcsDevices(targetFilter)
            : Promise.resolve({
                devices: [],
                targetFilters: []
            }));
    }
    async getCcsDeviceDetail(agent, deviceId) {
        const cachedResult = this.cacheInterface.getCcsDeviceDetail(deviceId);
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setCcsDeviceDetail(deviceId, module
            ? module.getCcsDeviceDetail(deviceId)
            : Promise.resolve({
                id: '',
                name: '',
                family: '',
                variant: '',
                isa: '',
                isReal: false,
                toolVersions: []
            }));
    }
    async getProjectTemplates(agent, deviceId, toolVersion) {
        const cachedResult = this.cacheInterface.getProjectTemplates(deviceId, toolVersion);
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setProjectTemplates(deviceId, toolVersion, module
            ? module.getProjectTemplates(deviceId, toolVersion)
            : Promise.resolve({
                outputTypes: [],
                templateIndex: {}
            }));
    }
    async getAgentMode(agent) {
        const cachedResult = this.cacheInterface.getAgentMode();
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setAgentMode(module
            ? module.getAgentMode()
            : Promise.resolve(util_1.fallbackIsDesktop() ? 'desktop' : 'cloud'));
    }
    async getProgress(agent) {
        const cachedResult = this.cacheInterface.getProgress();
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setProgress(module ? module.getProgress() : Promise.resolve({}));
    }
    async getVersion(agent) {
        const cachedResult = this.cacheInterface.getVersion();
        if (cachedResult) {
            return cachedResult;
        }
        const module = await this.getLocalModule(agent);
        return this.cacheInterface.setVersion(module ? module.getVersion() : Promise.resolve(''));
    }
    async clearTaskProgress(agent, progressId) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('calling clearTaskProgress but tirexModule is null');
        }
        await tirexModule.clearTaskProgress(progressId);
    }
    async importProject(agent, resourceType, packageUid, location, targetId, projectName) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('calling importProject but tirexModule is null');
        }
        const version = await this.getVersion(agent);
        if (Versioning.satisfies(version, '^4.14.0')) {
            await tirexModule.importProject(resourceType, packageUid, location, targetId, projectName);
        }
        else {
            // @ts-ignore - for older tirex versions projectName isn't supported; will be addressed as part of REX-3587
            await tirexModule.importProject(resourceType, packageUid, location, targetId);
        }
    }
    async importProjectTemplate(agent, templateId, targetId, projectName, toolVersion, outputTypeId) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('calling importProject but tirexModule is null');
        }
        const version = await this.getVersion(agent);
        if (!Versioning.satisfies(version, '^4.14.0')) {
            throw new Error(`importProjectTemplate not supported on tirex module v${version}`);
        }
        await tirexModule.importProjectTemplate(templateId, targetId, projectName, toolVersion, outputTypeId, null);
    }
    async installPackage(agent, pkg, installLocation) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('calling installPackage but tirexModule is null');
        }
        return tirexModule.installPackage(pkg, installLocation);
    }
    async uninstallPackage(agent, pkg) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('calling uninstallPackage but tirexModule is null');
        }
        return tirexModule.uninstallPackage(pkg);
    }
    async openExternally(agent, link) {
        const tirexModule = await this.getLocalModule(agent);
        if (!tirexModule) {
            throw new Error('calling openExternally but tirexModule is null');
        }
        await tirexModule.openExternally(link);
        return true;
    }
    // Events
    onInstalledPackagesUpdated(fn) {
        return this.emitter.on("OnInstalledPackagesUpdated" /* ON_INSTALLED_PACKAGES_UPDATED */, fn);
    }
    onInstallInfoUpdated(fn) {
        return this.emitter.on("OnInstallInfoUpdated" /* ON_INSTALL_INFO_UPDATED */, fn);
    }
    onProgressUpdated(fn) {
        return this.emitter.on("OnProgressUpdated" /* ON_PROGRESS_UPDATED */, fn);
    }
    removeListener(event, listener) {
        this.emitter.off(event, listener);
    }
    // For test purposes only
    _clearCachedData() {
        this.cacheInterface.clearCache();
        this.modulePromise = null;
        all_off_1.default(this.emitter);
    }
    // Cloud agent interaction
    getLocalModule(agent) {
        if (!this.modulePromise) {
            this.modulePromise = this.fetchLocalModule(agent);
        }
        return this.modulePromise;
    }
    async fetchLocalModule(agent) {
        try {
            let proxy = null;
            const theiaPort = util_1.getTheiaPort();
            if (theiaPort > 0) {
                // CCS Theia communication
                const result = await Promise.resolve().then(() => require(/* webpackIgnore: true */ `http://localhost:${theiaPort}/ccs-webview/ccs-plugin-api.js`));
                if (result && result.init) {
                    // Events
                    const ccs = await result.init();
                    ccs.ide.addEventListener('products-refreshed', () => {
                        module.onProductsChanged().catch(err => console.error(err));
                    });
                    ccs.ide.addEventListener('theme-changed', (themeId) => {
                        this.syncTheme(themeId);
                    });
                    // Get the proxy
                    proxy = await ccs.ide.resolveProxy(window.location.origin);
                    if (proxy && typeof proxy === 'string') {
                        const proxyPieces = proxy.split(' ');
                        proxy = proxyPieces.length > 1 ? _.last(proxyPieces) || null : null;
                        proxy = proxy && !proxy.includes('://') ? `http://${proxy}` : proxy;
                    }
                    // Get & set the theme
                    const themeId = await ccs.ide.getCurrentThemeId();
                    this.syncTheme(themeId);
                }
            }
            else {
                // CCS Eclipse communication
                await new Promise(resolve => {
                    if (window.rexRegisterDataCallback) {
                        throw new Error('rexRegisterDataCallback already set');
                    }
                    if (window.rexRegisterData) {
                        window.rexRegisterDataCallback = () => {
                            resolve();
                        };
                        window.rexRegisterData('rexRegisterDataCallback');
                    }
                    else {
                        resolve();
                    }
                });
                const windowTi = window.ti;
                if (windowTi && windowTi.ui && windowTi.ui.theme) {
                    this.syncTheme(windowTi.ui.theme.endsWith('dark') ? 'dark' : 'light');
                }
                document.addEventListener('theme-changed', event => {
                    const eventDetail = event.detail;
                    if (eventDetail && eventDetail.theme) {
                        this.syncTheme(eventDetail.theme.endsWith('dark') ? 'dark' : 'light');
                    }
                });
            }
            const module = await agent.getSubModule(interface_1.rexCloudAgentModuleName);
            if (module.init) {
                // Older releases did not have this method.
                if (theiaPort > 0) {
                    await module.init({ ccsPort: theiaPort, proxy, isTheia: true });
                }
                else {
                    const { ccsPort, httpsProxy, httpProxy } = await module.getCCSEclipseInitValues();
                    await module.init({ ccsPort, proxy: httpsProxy || httpProxy, isTheia: false });
                }
            }
            this.onModuleFetched(module);
            return module;
        }
        catch (err) {
            if (util_1.fallbackIsDesktop()) {
                throw util_1.convertToCloudAgentError(err);
            }
            console.warn('Could not fetch local module, will use empty / placeholder data for apis');
            console.error(err);
            return null;
        }
    }
    onModuleFetched(module) {
        // These listeners never get removed, we assume only one instance of this page is created and is always used.
        // Otherwise we would need to clean these up
        module.addListener("OnInstalledPackagesUpdated" /* ON_INSTALLED_PACKAGES_UPDATED */, this.handleInstalledPackagesUpdated);
        module.addListener("OnInstallInfoUpdated" /* ON_INSTALL_INFO_UPDATED */, this.handleInstallInfoUpdated);
        module.addListener("OnProgressUpdated" /* ON_PROGRESS_UPDATED */, this.handleProgressUpdated);
        module.addListener("OnError" /* ON_ERROR */, this.handleModuleError);
        module.addListener('close', this.handleClose);
    }
    async doClose() {
        const CloudAgent = await util_1.getTICloudAgentObject();
        if (CloudAgent) {
            const agent = await CloudAgent.Init();
            try {
                const module = await this.fetchLocalModule(agent);
                if (module) {
                    module.removeListener('close', this.handleClose);
                    await module.close();
                }
            }
            finally {
                await agent.close();
            }
        }
    }
    syncTheme(themeId) {
        const targetTheme = themeId === 'dark' ? 'dark' : 'light';
        const currentTheme = theme_config_1.getTheme();
        if (currentTheme !== targetTheme) {
            theme_config_1.setTheme(targetTheme);
            theme_config_1.loadTheme();
        }
    }
}
exports.LocalAPIs = LocalAPIs;

'use strict';
require('rootpath')();

const fs = require('fs-extra');
const async = require('async');
let request;
const uuid = require('uuid/v4');

const vars = require('lib/vars');
const rex = require('lib/rex')();
const {HandoffManager, Role, HandoffManagerState} = require('lib/submission/handoff-manager');

request = require('request').defaults(vars.REQUEST_DEFAULTS);
const handoffManager = new HandoffManager({refreshManager: rex.refreshManager});
const multer = rex.multer;

module.exports = function(app) {
    app.post('/api/add-package', multer.any(), addPackage);
    app.get('/api/add-package-progress/:id', addPackageProgress);
    
    app.delete('/api/remove-package', removePackage);
    app.get('/api/remove-package-progress/:id', removePackageProgress);
    
    app.get('/api/maintenance-mode', maintanceMode);
    app.get('/api/get-maintenance-mode', getMaintenanceMode);
    // For backwards compatibility
    app.post('/api/stage-upload', multer.any(), addPackage);
    app.post('/api/stage', addPackage);
};

function addPackage(req, res) {
    if (vars.MODE !== 'remoteserver') {
        const msg = 'remoteserver only api';
        logMessage(rex.log.debugLogger.info, msg);
        removeFiles(req.files);
        return res.send(400);
    }
    else if (!handoffManager.acceptingSubmissions()) {
        removeFiles(req.files);
        return res.send(503, 'Not accepting submissions at this time');
    }
    
    const submissionId = uuid();
    const zipUploads = (req.files || []).map(({path, originalname}) => {
        return {path, originalname};
    });
    handoffManager.uploadPackage({
        assets: typeof(req.body.assets) === 'string' ?
            JSON.parse(req.body.assets) : req.body.assets,
        zipUploads, email: req.body.email,
        submissionId,
        replace: req.body.replace ?
            req.body.replace.toString() === 'true' : false
    }, (err) => {
        if (err) {
            return logMessage(rex.log.debugLogger.error, err);
        }
    });
    res.send({submissionId});
}

function addPackageProgress(req, res) {
    if (vars.MODE !== 'remoteserver') {
        const msg = 'remoteserver only api';
        logMessage(rex.log.debugLogger.info, msg);
        return res.send(400);
    }
    const progress = handoffManager.uploadPackageProgress(req.params.id);
    res.send({
        done: progress === 'done'
    });
}

function removePackage(req, res) {
    if (vars.MODE !== 'remoteserver') {
        const msg = 'remoteserver only api';
        logMessage(rex.log.debugLogger.info, msg);
        return res.send(400);
    }
    else if (!handoffManager.acceptingSubmissions()) {
        return res.send(503, 'Not accepting submissions at this time');
    }
    else if (!req.query.id || !req.query.version) {
        return res.send(400, 'Missing required field');
    }
    
    const submissionId = uuid();
    const {id, version, email} = req.query;
    handoffManager.removePackage({
        packageInfo: {id, version}, submissionId, email
    }, (err) => {
        if (err) {
            logMessage(rex.log.debugLogger.error, err);
        }
    });
    res.send({submissionId});
}

function removePackageProgress(req, res) {
    if (vars.MODE !== 'remoteserver') {
        const msg = 'remoteserver only api';
        logMessage(rex.log.debugLogger.info, msg);
        return res.send(400);
    }
    const progress = handoffManager.removePackageProgress(req.params.id);
    res.send({
        done: progress === 'done'
    });
}

function maintanceMode(req, res) {
    if (vars.MODE !== 'remoteserver') {
        const msg = 'remoteserver only api';
        logMessage(rex.log.debugLogger.info, msg);
        res.send(400, msg);
    }
    else if (!req.query.switch) {
        const msg = 'switch required';
        logMessage(rex.log.debugLogger.info, msg);
        res.send(400, msg);
    }
    else {
        const direction = req.query.switch;
        if (direction === 'on') {
            maintanceModeOn(req, res);
        }
        else {
            maintanceModeOff(req, res);
        }
    }
    
}

function getMaintenanceMode(req, res) {
    if (handoffManager.acceptingSubmissions()) {
        res.send("off");
    }
    else {
        res.send("on");
    }
}

///////////////////////////////////////////////////////////////////////////////
/// Helpers
///////////////////////////////////////////////////////////////////////////////

function maintanceModeOn(req, res) {
    const state = handoffManager.getHandoffManagerState();
    if (state === HandoffManagerState.TEARDOWN) {
        res.send(202, 'Tearing down');
    }
    else if (state === HandoffManagerState.MAINTANCE_MODE) {
        res.send(200, 'In maintenance mode');
    }
    else {
        handoffManager.maintenanceMode((err) => {
            if (err) {
                logMessage(rex.log.debugLogger.error, err);
                res.send(400, err);
            }
            else {
                res.send(200, 'Successfully went into maintenance mode');
            }
        });
    }
}

function maintanceModeOff(req, res) {    
    const state = handoffManager.getHandoffManagerState();
    if (state === HandoffManagerState.UP) {
        res.send(200, 'Accepting submissions');
    }
    else {
        handoffManager.resumeService((err) => {
            if (err) {
                logMessage(rex.log.debugLogger.error, err);
                res.send(400, err);
            }
            else {
                res.send(200, 'Successfully resumed service');
            }
        });
    }   
}

function removeFiles(files=null, callback=()=>{}) {
    files = files ? files.map(file => file.path) : [];
    async.map(files, fs.remove, callback);
}

function logMessage(logMethod, message) {
    logMethod(message, ['handoff']);
}

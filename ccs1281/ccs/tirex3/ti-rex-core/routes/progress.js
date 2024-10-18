'use strict';
require('rootpath')();

const vars = require('lib/vars');
const lsBundles = require('lib/localserver/bundles');

const ProgressType = {
    ADD_PACKAGE: 'addPackage',
    REMOVE_PACKAGE: 'removePackage'
};

module.exports = function(app) {
    app.get('/api/progress/:id', progress);
    app.get('/api/progress/:id/:type', progress);
}

/**
 * API: GET => progress (auto re-directs to the right progress API, downloadprogress or bundlesprogress
 * TODO: downloadprogress and bundlesprogress should merge into one single API
 *
 * params:
 *  id: the progress id (that was initially provided by the client as part of the api request)
 *  type: the progress type
 */
function progress(req, res) {
    const type = req.params.type;
    if (type) {
        if (type === ProgressType.ADD_PACKAGE) {
            res.redirect(`api/add-package-progress/${req.params.id}`);
        }
        else if (type === ProgressType.REMOVE_PACKAGE) {
            res.redirect(`api/remove-package-progress/${req.params.id}`);
        }
        else {
            res.send(400, 'Unknown progress type');
        }
    }
    else {
        let targetApi = null;
        if (lsBundles.bundlesProgressInfos[req.params.id] != null) {
            targetApi = req.originalUrl.replace('api/progress/', 'api/bundlesprogress/');
        } else {
            targetApi = req.originalUrl.replace('api/progress/', 'api/downloadprogress/');
        }
        if (vars.ROLE !== '') {
            res.redirect(vars.ROLE + '/' + targetApi);
        } else {
            res.redirect(targetApi);
        }
    }
}

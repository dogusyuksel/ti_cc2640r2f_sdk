'use strict';
require('rootpath')();

let rex = null;

const refresh = require('lib/refresh');
const logging = require('lib/logging');

module.exports = function(args=null) {
    if (args && !rex) {
        const {config, dbs, logger, multer} = args;        
        const refreshManager = new refresh.RefreshManager({dbs});
        const loggerManager = new logging.LoggerManager(logger);        
        rex = {
            refreshManager,
            log: new logging.Log({
                userLogger: loggerManager.createLogger('rexUser'),
                debugLogger:loggerManager.createLogger('rexDebug')
            }),
            loggerManager,
            multer
        };
        return rex;
    }
    else {
        return rex;
    }
}

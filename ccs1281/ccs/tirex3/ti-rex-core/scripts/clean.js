'use strict';
const p = require('child_process');

function clean(callback) {
    p.exec('git clean -Xfd', callback);
}

exports.command = 'clean';
exports.describe = 'clean all files and directories in .gitignore';
exports.handler = function() {
    clean(err => {
        if (err) {
            console.error(err);
            process.exit(1);
        } else {
            console.log('Cleaned!');
            process.exit(0);
        }
    });
};

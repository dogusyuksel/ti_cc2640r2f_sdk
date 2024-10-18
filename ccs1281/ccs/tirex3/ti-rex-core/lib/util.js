'use strict';
require('rootpath')();

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const vars = require('lib/vars');

const nodemailer = require('nodemailer');
const async = require('async');
const request = require('request').defaults(vars.REQUEST_DEFAULTS);

/**
 * Gets a random int between min (included) and max (excluded)
 *
 * @param {Integer} min
 * @param {Integer} max
 *
 * @returns {Integer} randomInt
 */
exports.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Gets the file from the provided url.
 *
 * @param {String} url - The url to download the zip from.
 * @param {String} dst - the destination folder.
 * @param callback(err, file)
 */
exports.downloadFile = function(url, dst, callback) {
    let fileName = path.join(dst, path.basename(url));
    let ws = fs.createWriteStream(fileName);
    async.parallel([(callback) => {
        ws.on('finish' , () => {
            callback(null);
        });
    }, (callback) => {
        try {
            request
                .get(url)
                .on('response', (response) => {
                    if (response.statusCode !== 200) {
                        callback('got status ' + response.statusCode +
                                 ' for url ' + url);
                    }
                    else {
                        callback(null);
                    }
                })
                .on('error', (err) => {
                    callback(err);
                })
                .pipe(ws);
        }
        catch (err) {
            callback(err);
        }
    }], (err, results) => {
        callback(err, fileName);
    });
};

/**
 * Extract the zip at the given location.
 *
 * @param {String} zip - The file name of the zip to extract.
 * @param {String} dst - the destination folder.
 * @param onEntry(entry) - called after an entry is processed
 * @param callback(err, topLevelItems) - where topLevelItems is the
 *  files / folders located at the root of the zip.
 */
exports.extract = function(zip, dst, onEntry, callback) {
    const yauzl = require('yauzl');
    yauzl.open(zip, {lazyEntries: true}, (err, zipfile) => {
        if (err) {
            return callback(err);
        }
        let topLevelItems = new Set();
        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
            if (/(\/|\\)$/.test(entry.fileName)) { // Directory
                topLevelItems.add(entry.fileName.split(path.sep)[0] + path.sep);
                let folder = path.join(dst, entry.fileName);
                fs.ensureDir(folder, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    setImmediate(() => {
                        zipfile.readEntry();
                    });
                });
            }
            else { // File
                topLevelItems.add(path.dirname(entry.fileName).split(path.sep)[0] + path.sep);
                if ((entry.fileName.match(/(\/|\\)/g) || []).length === 0) {
                    // Top level file
                    topLevelItems.add(entry.fileName);
                }
                const file = path.join(dst, entry.fileName);
                async.waterfall([(callback) => {
                    fs.ensureDir(path.dirname(file), callback);
                }, (_, callback) => {
                    fs.stat(file, (err, stats) => {
                        callback(null, err, stats);
                    });
                }, (err, stats, callback) => {
                    if (!err && stats.isDirectory()) {
                        const msg = 'error folder exists with same name and location as file ' + file;
                        return setImmediate(callback, msg);
                    }
                    zipfile.openReadStream(entry, callback);
                }, (readStream, callback) => {
                    const orignalMode = entry.externalFileAttributes >> 16 & 0xfff;
                    const mode = (orignalMode | parseInt('0444', 8)).toString(8); // add read permissions
                    readStream.pipe(fs.createWriteStream(
                        file,
                        (os.platform() !== 'win32') ? {mode} : {}
                    ));
                    readStream.on('end', () => {
                        callback();
                    });
                }], (err) => {
                    if (err) {
                        return callback(err);
                    }
                    if (onEntry) {
                        onEntry(entry);
                    }
                    setImmediate(() => { // to prevent too many open file handles
                        zipfile.readEntry();
                    });
                });
            }
        });
        zipfile.once('end', () => {
            const items = Array.from(topLevelItems).map((item) => {
                return path.join(dst, item);
            });
            callback(null, items);
        });
    });
};

/**
 * @callback emailCallback
 * @param {Error} error
 * @param {Object} res
 */

/**
 * Send an email with the given config.
 *
 * @param {Object}args
 *  @param {String} args.sender
 *  @param {String} args.receiver
 *  @param {String} args.subject
 *  @param {String} args.payload
 *  @param {Array.Object} args.attachments
 * @param {emailCallback} callback
 */
exports.email = function({sender,
                          receiver,
                          subject,
                          payload,
                          attachments,
                          html=true}, callback=(()=>{})) {
    if (receiver.trim().length === 0) {
        return setImmediate(callback);
    } 
    
    if (!exports.email.transporter) {
        // create reusable transporter object using the default SMTP transport
        const smtpConfig = {
            host: 'smtp.mail.ti.com',
            port: 25
        };
        exports.email.transporter = nodemailer.createTransport(smtpConfig);
    }
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        attachments
    };
    if (html) {
        mailOptions.html = payload;
    } else {
        mailOptions.text = payload;
    }

    // send mail with defined transport object
    exports.email.transporter.sendMail(mailOptions, callback);
};

/**
 * Prepare the message for the email.
 *
 * @param {Buffer} message - A log message.
 *
 * @returns {String} formatedMessage - The formatted result.
 *
 */
exports.transformLogMessage = function(message) {
    const {data, type, tags} = JSON.parse(message.toString());
    const typeColors = {
        'info': '#FCD116', // yellow
        'warning': 'orange',
        'error': 'red'
    };

    const msg = `<b style="color: ${typeColors[type] || "black"}">[${type.toUpperCase()}] </b> ${data} <br>`;
    return msg;
}

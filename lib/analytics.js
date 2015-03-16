/**
 * Analytics tracker object.
 *
 * @package webmaker
 * @author  Adam Lofting <adam@mozillafoundation.org>
 */

var xhr = require('xhr');
var localq = require('../node_modules/localq/src/');
var clone = require('clone');

var model = require('./model')();
var utils = require('./utils');
var network = require('./network');

var _config = require('../config');
var config = clone(_config);
var packageJSON = clone(config.package);
delete config.package;

var online = true;

/**
 * A note on offline mode and monitoring connectivity:
 *
 * If the app is 'installed', and wrapped with Cordova,
 * we use the network util to check for connectivity.
 *
 * But, if the app is being used in a browser, we use
 * failed calls to GA API to indicate the user is likely
 * offline (or less likely that GA API is down).
 *
 * In this case we 'hold' attempts to ping GA for a few
 * minutes after each fail, before checking again.
 *
 * In either case, if we can't ping GA, we store the hits
 * in a local queue to process when we have connectivity
 * later.
 */

/**
 * Utils for logging
 */

function _warn (message) {
    console.warn('[Error using analytics.js]', message);
}

function _log (message) {
    if (config.ANALYTICS_CONSOLE_LOGGING) {
        console.log('[analytics.js]', message);
    }
}


/**
 * Functions for building the requests, and sending them to GA
 */

var commonAppValues = {};
function getCommonAppValues () {
    if (commonAppValues.v) {
        return commonAppValues;
    }

    commonAppValues = {
        // Required
        v: 1,                               // MP Version
        tid: config.GA_TRACKING_ID,        // Tracking ID / Property ID.
        cid: model.data.session.guestId,   // Anonymous Client ID.

        // Additional values we want to use for App Specific measurement
        an: packageJSON.name,              // Application Name
        //aid: '',                         // Application ID
        av: packageJSON.version,           // Application Version
        //aiid: '',                        // Application Installer ID
        ds: 'app',                          // Data Source
        ul: model.data.session.locale.toLowerCase(),     // User Language
        ua: navigator.userAgent             // User Agent
    };
    return commonAppValues;
}

function checkIfHitWasOffline (hit) {
    if (hit.originalRequestTime) {
        // we're retrying an earlier request that failed
        // The value Queue Time (qt) represents the time delta (in milliseconds)
        // between when the hit being reported occurred and the time the hit was
        // sent.
        var now = new Date();
        var qt = now.getTime() - hit.originalRequestTime.getTime();
        hit.qt = qt;
        // use a custom dimension to note this was recorded while offline
        hit.cd1 = 'offline';
        return true;
    } else {
        hit.cd1 = 'online';
        return false;
    }
}

function attemptSendToGA (hit, callback) {
    console.log('attempting send to GA');

    var wasOffline = checkIfHitWasOffline(hit);
    var gaObj = utils.simpleObjectMerge(getCommonAppValues(), hit);
    var connectionText = (wasOffline) ? 'Offline' : 'Live';

    if (wasOffline) {
        // this value doens't need to go to GA
        delete gaObj.originalRequestTime;
    }

    // Convert obj to a string for POST request
    var gaBody = utils.toParameterString(gaObj);

    // Make a POST request to GA
    xhr({
        body: gaBody,
        uri: 'https://ssl.google-analytics.com/collect',
        method: 'POST'
    }, function (err, resp, body) {
        if (resp.statusCode === 200) {
            // we're got as far as GA (and must be online)
            _log('sent hit to GA', connectionText);
            return callback(true);
        }
        // Otherwise, something went wrong or we're offline
        //_log({err: err});
        return callback(false);
    });
}


/**
 * Local Q
 */
var queue = localq({
    expire: 86400000,   // how long until a job expires (ms) 1000 * 60 * 60 * 24
    timeout: 5000,      // how long until a job is considered "failed" (ms)
    retry: 3,           // how many times a job should be retried

    interval: 1000,     // speed at which the queue looks for new jobs (ms)
    size: 4980736,      // maximum size of the queue (bytes)
    name: 'appanalytics',     // name of the database within IndexedDB

    debug: true        // print status messages to the console
});

queue.worker = attemptSendToGA;

/**
 * Check if this install has a cordova wrapper with
 * connectivity awareness. If it does, listen for
 * network events
 */
if (network.connection) {
    _log('Cordova app with network awareness');

    network.on('online', function () {
        online = true;
        queue.start();
    });

    network.on('offline', function () {
        online = false;
        queue.pause();
    });
}



function recordNewHit (hit) {

    if (!online) {
        hit.originalRequestTime = new Date();
        queue.push(hit, function (err) {
            console.dir(err);
        });
        return;
    }

    // otherwise, assume we are online
    attemptSendToGA(hit, function (success) {
        if (!success) {

            // We weren't able to send to GA at this time
            _log('Failed sending hit to GA');

            // this is a first time attempt, record the original time
            hit.originalRequestTime = new Date();

            queue.push(hit, function (err) {
                console.dir(err);
            });
        }
    });
}



/*
 * Exposed Funcitons
 */
module.exports = {

    /**
     * screenView
     * obj.screenName = 'Awesome Page Title'
     */
    screenView: function (obj) {
        if (!obj || !obj.screenName) {
            _warn('screenName is required in analytics.screenView()');
            return;
        }
        // Build the GA version
        var hit = {
            t: 'screenview',        // hit type
            cd: encodeURIComponent(obj.screenName)      // screen name
        };
        recordNewHit(hit);
    },

    /**
     * event
     * obj.category = 'UX'
     * obj.action = e.g. 'Opened Side Menu'
     * obj.label = 'Using swipe gesture' (Optional)
     */
    event: function (obj) {
        if (!obj ||
            !obj.category ||
            !obj.action) {
            _warn('category and action are required in analytics.event()');
            return;
        }

        // Build the GA version
        var hit = {
            t: 'event',             // hit type
            ec: encodeURIComponent(obj.category),       // event category
            ea: encodeURIComponent(obj.action)          // event action
        };

        if (obj.label) {
            hit.el = encodeURIComponent(obj.label);     // event label
        }
        recordNewHit(hit);
    },

    newSession: function () {
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#sc

        // We need to attach a newSession action to a hit,
        // so we fire an arbitrary non-interaction event.
        var hit = {
            t: 'event',             // hit type
            ni: 1,                  // Non-interaction event
            ec: 'Session Control',  // event category
            ea: 'New Session',      // event action
            sc: 'start'             // Session Control
        };

        recordNewHit(hit);
    },

    changeLocale: function () {
        // TODO: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#ul
    },

    /**
     * timing
     * obj.category = e.g. 'Pageload'
     * obj.name = e.g. 'Homescreen'
     * obj.time = {Int} Time in milliseconds
     */
    userTiming: function (obj) {
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#utc
        if (!obj ||
            !obj.category ||
            !obj.name ||
            !obj.time) {
            _warn('category, name and time are required in analytics.timing()');
            return;
        }

        // Build the GA version
        var hit = {
            t: 'timing',                                    // hit type
            utc: encodeURIComponent(obj.category),          // User Timing Category
            utv: encodeURIComponent(obj.name),              // User Timing Variable Name
            utt: encodeURIComponent(obj.time)               // User Timing Time
        };
        recordNewHit(hit);
    },

    /**
     * error
     * obj.description = e.g. 'Error Sharing App'
     * obj.fatal = {Boolean} true if exception was fatal to the app
     */
    error: function (obj) {
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#exd
        if (!obj || !obj.description) {
            _warn('description is required in analytics.error()');
            return;
        }

        // Build the GA version
        var hit = {
            t: 'exception',                                 // hit type
            exd: encodeURIComponent(obj.description)        // Exception Description
        };

        if (obj.fatal) {
            hit.exf = 1;     // exception was fatal to app
        }
        recordNewHit(hit);
    }
};


/**
 * Data model provider.
 *
 * @package webmaker
 * @author  Andrew Sliwinski <a@mozillafoundation.org>
 */

var MakeDrive = require('makedrive');
var watch = require('watchjs').watch;
var config = require('../config');
var page = require('page');
var restorePath = require('./restore-path');

/**
 * Constructor
 */
function Model (options) {
    var self = this;

    if (!(self instanceof Model)) return new Model();

    // Options
    // memory: (false) Use memory provider for Makedrive
    // noConnect: () if true, will not connect to remote server
    self.options = options || {};

    if (!self.options.noConnect) {
        self.auth = require('./auth');
    }

    // Internal
    self._ns = '/_model.json';
    self._ready = false;
    self._logger = function (prefix, msg) {
        if (typeof msg === 'undefined') {
            msg = prefix;
            prefix = 'Model';
        }

        if (msg) console.log('[' + prefix + '] ' + msg);
    };

    // Public
    self.data = {};
    self.data.history = {
        ftu: true,
        path: '/sign-in'
    };
    self.data.locale = null;
    self.data.user = {};
    self.data.apps = [];
    self.data.offline = false;

    self._fs = MakeDrive.fs({
        memory: self.options.memory,
        interval: 10000
    });
    self._sync = self._fs.sync;

    self._sync.on('error', function (err) {
        self._logger(err);
    });

    self._sync.on('completed', function () {
        self._logger('Sync Completed');
        self._dirty = false;
    });
    self._sync.on('syncing', function () {
        self._logger('Syncing');
    });
}

// Utility function to determine if makedrive
// is currently connected
Model.prototype.isConnected = function () {
    var self = this;
    var isConnected = self._sync.SYNC_CONNECTED;
    var isConnecting = self._sync.SYNC_CONNECTING;
    return [isConnected, isConnecting].indexOf(self._sync.state) > -1;
};

// Utility function to clear local filesystem
Model.prototype.clearLocalFs = function clearLocalFs(cb) {
    var self = this;
    var fs = self._fs;
    var sh = fs.Shell();

    fs.stat('/', function (e, stat) {
        if (!stat.isDirectory()) {
            fs.unlink('/', cb);
        } else {
            sh.rm('/', {recursive: true}, cb);
        }
    });
};

// Read file as json
// If it doesn't exist, create it
// If can't parse as JSON, replace with defaultData
// Options
// - defaultData: (default: {}) If no file exist, write to this to file
Model.prototype.readFileAsJson = function (filename, options, callback) {
    var self = this;
    options = options || {};
    options.defaultData = options.defaultData || {};

    self._fs.readFile(filename, 'utf8', function (err, file) {
        function onRead(err) {
            if (err) console.log(err);
            // Try parsing it.
            try {
                file = JSON.parse(file);
            } catch (e) {
                file = options.defaultData;
            }
            // Call the callback!
            callback(file);
        }
        if (err && err.code === 'ENOENT') {
            self._logger('New file created: ' + self._ns);
            file = JSON.stringify(options.defaultData);
            self._fs.writeFile(filename, file, onRead);
        } else {
            onRead(err);
        }
    });
};

Model.prototype.restore = function (callback) {
    var self = this;

    // Set offline callback
    self.offlineConnect = function () {
        self._logger('Starting in offline mode');
        self.data.user = {};
        if (self._sync.state === self._sync.SYNC_CONNECTED) {
            self._sync.disconnect();
        }
        self.data.offline = true;
        callback();
        restorePath({
            history: self.data.history && self.data.history.path,
            offline: self.data.offline
        });
    };

    // First, read local filesystem.
    self.readFileAsJson(self._ns, {
        defaultData: self.data
    }, function (file) {
        // Restore to model.data
        if (typeof file.history !== 'undefined') {
            self.data.history = file.history;
        }
        if (typeof file.apps !== 'undefined') {
            self.data.apps = file.apps;
        }
        if (typeof file.locale !== 'undefined') {
            self.data.locale = file.locale;
        }
        if (typeof file.offline !== 'undefined') {
            self.data.offline = file.offline;
        }

        self._logger('Data restored');
        self.observe();
        self._ready = true;

        // Were we in offline mode? If so, restore it.
        // Just read locally if no connect
        if (self.data.offline ||
        self.options.noConnect ||
        global.location.search.match('offline=true') ||
        config.OFFLINE) {
            self.offlineConnect();
        }
        if (self.options.noConnect) {
            return;
        }

        function onLogin(user) {
            self.data.user = user;

            if (!self.isConnected()) {
                // Todo: Clear local FS if user was offline
                self.data.offline = false;
                self._sync.connect(config.MAKEDRIVE_URL);
                // After 10 seconds, switch to offline mode
                syncTimeout = global.setTimeout(function () {
                    self.offlineConnect();
                }, 10000);
                self._logger('Connecting...');
            }

            restorePath({
                history: self.data.history && self.data.history.path,
                offline: self.data.offline
            });
        }

        function onLogout() {
            self._logger('logout');
            self.data.user = {};
            if (self.data.offline) return;

            // Todo: clear local FS
            if (self.isConnected()) {
                self._sync.disconnect();
            }
            callback();
            page('/sign-in');
        }

        // Otherwise, let's set up a connection
        var syncTimeout;

        self._sync.on('connected', function () {
            global.clearTimeout(syncTimeout);
            self._logger('Makedrive connected');
            callback();
        });

        self.auth = require('./auth')();

        var setup = false;
        self.auth.on('verified', function (user) {
            self._logger('verified');
            if (setup) {
                return;
            } else if (user) {
                onLogin(user);
            } else {
                onLogout();
                setup = true;
            }
        });
        self.auth.on('login', function (user) {
            self._logger('login');
            onLogin(user);
        });
        self.auth.on('logout', function () {
            self._logger('logout');
            onLogout();
        });

    });
};

/**
 * Saves the current model state to localforage.
 *
 * @param  {Function} callback
 *
 * @return {void}
 */
Model.prototype.save = function (callback) {
    var self = this;
    callback = callback || function () {};

    var putItem = JSON.stringify(self.data);
    self._fs.writeFile(self._ns, putItem, function (item) {
        self._logger('Data saved');
        callback.call(self, null);
    });
};

/**
 * Starts observing ("watch"-ing) for object changes.
 *
 * @return {void}
 */
Model.prototype.observe = function () {
    var self = this;

    // Only run this once
    if (self.observing) return;
    self.observing = true;

    watch(self.data, function (diff) {
        self._dirty = true;
        self.save(self._logger);
    }, 10);
};

var model;
function instantiateModel (options) {
    // If the instance doesn't exist, create it.
    if (!model) model = new Model(options);
    return model;
}

module.exports = instantiateModel;

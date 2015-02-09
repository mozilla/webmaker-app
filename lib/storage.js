var Firebase = require('firebase');
var clone = require('clone');

var config = require('../config');
var utils = require('./utils');
var i18n = require('./i18n');
var templates = require('./templates.json');
var model = require('./model')();
var Blocks = require('./blocks');
var blocks = new Blocks();

var _firebase = new Firebase(config.FIREBASE_URL + '/apps');
var _appRefs = {};
var _queryRef = null;

function Store(vm) {
    var self = this;

    self._vm = vm;
    self._firebase = _firebase;
}

Store.prototype._log = function (text) {
    console.log('[Store] ', text);
};

Store.prototype._onSync = function _onSync(err) {
    var self = this;
    if (!err) return;
    console.error('[Store] ', err);
    self._vm.showAlert('Oops! We\'re having trouble syncing your data');
};

Store.prototype._processSnapshot = function _processSnapshot(snapshot) {
    var res = snapshot.val();
    if (!res) return null;
    res.id = snapshot.key();
    return res;
};

Store.prototype._createAppRef = function (id, fbRef, data) {
    if (_appRefs[id]) this._removeAppRef(id);

    var that = this;
    var process = that._processSnapshot;

    function newBlock(blockId) {
        var block = blocks[blockId];
        if (!block) return;
        var clonedBlock = clone(block);
        if (['text', 'phone', 'sms', 'submit'].indexOf(block.type) !== -1) {
            clonedBlock.attributes.innerHTML.value =
              i18n.get(clonedBlock.attributes.innerHTML.value);
        }
        return clonedBlock;
    }

    function App() {
        var self = this;

        function broadcast(snapshot) {
            var data = process(snapshot);
            self.data = data;
            that._vm.$broadcast(snapshot.key(), data);
        }

        self.id = id;
        self.data = data || null;
        self.firebase = fbRef || _firebase.child(id);
        self.firebase.on('value', broadcast);
    }

    App.prototype.update = function (properties, callback) {
        var self = this;
        properties = JSON.parse(JSON.stringify(properties));
        self.firebase.update(properties, function(error) {
            that._onSync(error);
            if (callback) {
                callback(error);
            }
        });
    };

    App.prototype.updateBlock = function (id, properties) {
        var self = this;
        properties = JSON.parse(JSON.stringify(properties));
        self.firebase.child('blocks/' + id).update(properties, that._onSync);
    };

    App.prototype.insert = function (type) {
        var self = this;
        var block = newBlock(type);
        if (!block) {
            console.error('Block type ' + type + ' not found.');
            return;
        }
        var ref = self.firebase.child('blocks');
        ref.once('value', function (snapshot) {
            var blocks = snapshot.val() || [];
            blocks.unshift(block);
            ref.set(blocks);
        });
    };

    App.prototype.remove = function (blockIndex) {
        var self = this;
        var ref = self.firebase.child('blocks');

        var msg = 'Block with index ' + blockIndex + ' does not exist.';
        ref.once('value', function (snapshot) {
            var blocks = snapshot.val();
            if (!blocks[blockIndex]) {
                console.error(msg);
                return;
            }
            blocks.splice(blockIndex, 1);
            ref.set(blocks, that._onSync);
        });
    };

    App.prototype.duplicate = function (blockIndex) {
        var self = this;
        var ref = self.firebase.child('blocks');

        var msg = 'Block with index ' + blockIndex + ' does not exist.';
        ref.once('value', function (snapshot) {
            var blocks = snapshot.val();
            if (!blocks[blockIndex]) {
                console.error(msg);
                return;
            }

            blocks.splice(blockIndex, 0, clone(blocks[blockIndex]));
            ref.set(blocks, that._onSync);
        });
    };

    App.prototype.move = function (blockIndex, steps) {
        var self = this;
        var ref = self.firebase.child('blocks');

        ref.once('value', function (snapshot) {
            var blocks = snapshot.val();

            if (blockIndex + steps < 0) {
                console.error('Can\'t move block to negative position');
                return;
            }

            if (blockIndex + steps > blocks.length - 1) {
                console.error('Block is already at the end of the list');
                return;
            }

            if (!blocks[blockIndex]) {
                console.error('Block ' + blockIndex + ' doesn\'t exist.');
                return;
            }

            var blockToMove = blocks[blockIndex];

            // remove block from array
            blocks.splice(blockIndex, 1);

            // Put block in new array position
            blocks.splice(blockIndex + steps, 0, blockToMove);

            ref.set(blocks, that._onSync);
        });
    };

    App.prototype.removeApp = function () {
        var self = this;
        self.firebase.remove(that._onSync);
        that._removeAppRef(id);
    };

    var app = new App();
    _appRefs[id] = app;

    return app;
};

Store.prototype._removeAppRef = function _removeAppRef(id) {
    if (!_appRefs[id]) return; // todo: throw? this shouldn't happen
    _appRefs[id].firebase.off('value');
    delete _appRefs[id];
};

// setQuery(userId)
// set up a query for all apps by a certain userId
Store.prototype.setQuery = function setQuery(userId) {
    if (!userId) return; // todo: throw? this shouldn't happen

    var self = this;
    var process = self._processSnapshot;

    if (_queryRef) self.unsetQuery();

    function onAdded(snapshot) {
        var id = snapshot.key();
        if (!_appRefs[id]) self.getApp(id);
        self._log('App added');
        self._vm.$broadcast('app_added', process(snapshot));
    }

    function onChanged(snapshot) {
        self._log('App changed');
        self._vm.$broadcast('app_changed', process(snapshot));
    }

    function onRemoved(snapshot) {
        var id = snapshot.key();
        if (_appRefs[id]) self._removeAppRef(id);
        self._log('App removed');
        self._vm.$broadcast('app_removed', process(snapshot));
    }

    var query = self._firebase
        .orderByChild('userId')
        .equalTo(userId);

    self._log('Query changed');
    self._vm.$broadcast('query_changed', userId);

    query.on('child_added', onAdded);
    query.on('child_changed', onChanged);
    query.on('child_removed', onRemoved);

    _queryRef = query;
};

// unsetQuery
// Removes all event listeners for a query
Store.prototype.unsetQuery = function unsetQuery() {
    if (!_queryRef) return; // todo: throw? this shouldn't happen
    var self = this;
    _queryRef.off('child_added');
    _queryRef.off('child_changed');
    _queryRef.off('child_removed');
    _queryRef = null;
    _appRefs = {};

    self._log('Query removed');
    self._vm.$broadcast('query_changed', null);
};

// getApps()
// Returns an array of all apps
Store.prototype.getApps = function getApps() {
    var res = Object.keys(_appRefs).map(function (key) {
        return clone(_appRefs[key].data);
    }).filter(function (item) {
        return !!item;
    });
    return res;
};

// getApp(id)
// Get an app reference given an ID
Store.prototype.getApp = function getApp(id) {
    if (_appRefs[id]) return _appRefs[id];
    return this._createAppRef(id);
};

// createApp(options)
//  - template: id of a template. Will overwrite options.data
//  - data: a set of app data to clone
//  - name: a name for the clone.
Store.prototype.createApp = function createApp(options) {
    var self = this;
    var templateId;
    options = options || {};

    var app = {};

    // Get the source of the app template
    if (options.template) {
        templateId = utils.findInArray(templates, 'id', options.template);
        options.data = templates[templateId];
    }
    if (!options.data) return;
    var appTemplate = clone(options.data);

    // Get current user info
    var user = model.data.session.user;
    var guestId = model.data.session.guestId;

    // Name, userId, author, icon
    app.name = options.name || i18n.get('My {{template}} App');
    app.name = app.name.replace('{{template}}', appTemplate.name);
    app.userId = user.id || guestId;
    app.author = {
        id: user.id || guestId,
        username: user.username || i18n.get('Guest')
    };
    app.icon = appTemplate.icon;
    app.iconImage = appTemplate.iconImage || 'blogger.png';
    app.iconColor = appTemplate.iconColor || '#1F9CDF';

    // Blocks
    app.blocks = appTemplate.blocks.map(function (blockTemplate) {
        var block = {};
        // .id is deprecated
        block.type = blockTemplate.type || blockTemplate.id;
        block.attributes = blockTemplate.attributes;
        return block;
    });

    var ref = _firebase.push(app, self._onSync);
    var key = ref.key();

    return self._createAppRef(key, ref);
};

module.exports = Store;

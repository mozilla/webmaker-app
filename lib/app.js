var Blocks = require('./blocks');
var utils = require('./utils');
var uuid = require('./uuid');
var clone = require('clone');
var templates = require('./templates.json');
var i18n = require('./i18n');

var model = require('./model')();
var blocks = new Blocks();

function newBlock(blockId) {
    var block = blocks[blockId];
    return block && clone(block);
}

function App (id) {
    var self = this;
    if (!model.data.apps || !model.data.apps.length) return;
    self.id = id;
    self.index = utils.findInArray(model.data.apps, 'id', self.id);
    self.data = model.data.apps[self.index];
}

// Global Methods

// createApp(options)
//  - template: id of a template. Will overwrite options.data
//  - data: a set of app data to clone
//  - name: a name for the clone.
App.createApp = function (options) {
    var templateId;
    options = options || {};
    if (options.template) {
        templateId = utils.findInArray(templates, 'id', options.template);
        options.data = templates[templateId];
    }
    if (!options.data) return;

    var app = clone(options.data);

    // Prepare the clone for use
    app.id = uuid();
    app.name = options.name || i18n.get('Create an app for a {{template}}');
    app.name = app.name.replace('{{template}}', options.data.name);
    app.author = model.data.user;

    // Add to model & redirect to editor
    model.data.apps.unshift(app);
    return new App(app.id);
};

// Instance Methods
App.prototype.insert = function (blockId) {
    var self = this;
    var block = newBlock(blockId);
    if (!block) {
        console.error('Block type ' + blockId + ' not found.');
        return;
    }
    self.data.blocks.unshift(block);
};

App.prototype.remove = function (blockIndex) {
    var self = this;
    if (!self.data.blocks[blockIndex]) {
        console.error('Block with index ' + blockIndex + ' does not exist.');
        return;
    }
    self.data.blocks.splice(blockIndex, 1);
};

App.prototype.removeApp = function () {
    var self = this;
    model.data.apps.splice(self.index, 1);
};

module.exports = App;

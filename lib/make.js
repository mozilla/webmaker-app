/**
 * Make abstraction.
 *
 * @package appmaker
 * @author  Andrew Sliwinski <a@mozillafoundation.org>
 */

var extend = require('extend');

var blocks = require('./blocks');
var model = require('./model');

/**
 * Returns an app from storage matching the provided ID.
 *
 * @param {string} id App ID
 *
 * @return {int}
 */
function getMakeIndex (id) {
    for (var i = 0; i < model.apps.length; i++) {
        if (model.apps[i].id !== id) continue;
        return i;
    }
}

/**
 * Returns an app clone from storage at the specified index.
 *
 * @param  {int} index App index
 *
 * @return {object}
 */
function getMakeMeta (i) {
    return JSON.parse(JSON.stringify(model.apps[i]));
}

/**
 * Returns a block clone matching the provided ID.
 *
 * @param {string} id Block ID
 *
 * @return {object}
 */
function getBlock (id) {
    for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].id !== id) continue;
        return JSON.parse(JSON.stringify(blocks[i]));
    }
}

/**
 * Constructor
 */
function Make (id) {
    var self = this;

    self.id = id;
    self.index = getMakeIndex(id);
    self.app = model.apps[self.index];
}

Make.prototype.insert = function (id) {
    var self = this;
    self.app.blocks.unshift(getBlock(id));
};

Make.prototype.update = function (index, attributes) {
    var self = this;
    if (!self.app || !self.app.blocks[index]) {
        // The app or block was probably deleted
        return;
    }
    self.app.blocks[index].attributes = attributes;
};

Make.prototype.remove = function (index) {
    var self = this;
    self.app.blocks.splice(index, 1);
};

/**
 * Export
 */
module.exports = Make;

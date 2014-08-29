var model = require('../../lib/model');
var templates = require('../../lib/templates.json');
var utils = require('../../lib/utils');
var view = require('../../lib/view');

var id = null;
var index = null;
var app = null;
var block = null;

module.exports = view.extend({
    id: 'block',
    template: require('./index.html'),
    components: {
        'string-editor': require('../../components/block-editors/string'),
        'color-editor': require('../../components/block-editors/color')
    },
    data: {
        title: 'Edit',
        back: true
    },
    created: function () {
        var self = this;

        // Fetch app
        id = self.$parent.$data.params.id;
        index = self.$parent.$data.params.index;
        app = utils.findInArray(model.apps, 'id', id);
        block = app.blocks[index];
        // Bind app
        self.$data.block = block;
        self.$data.index = index;
        self.$data.getEditor = function (type) {
            var editorKey = type + '-editor';
            var defaultEditor = 'string-editor';
            var legalComponents = this.$compiler.options.components;
            if (legalComponents[editorKey]) {
                return editorKey;
            }
            return defaultEditor;
        };
        self.$data.remove = function (e) {
            e.preventDefault();
            // app.remove(index); todo
            global.history.back();
        };
    }
});

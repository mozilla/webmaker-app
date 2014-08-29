var Make = require('../../lib/make');
var templates = require('../../lib/templates.json');
var view = require('../../lib/view');

module.exports = view.extend({
    id: 'play',
    template: require('./index.html'),
    created: function () {
        var self = this;

        // Fetch app
        var id = self.$parent.$data.params.id;
        var target = new Make(id).app;

        // Bind app
        self.$data.app = target;
        self.title = target.name;
    }
});

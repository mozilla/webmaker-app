var App = require('../../lib/app');
var view = require('../../lib/view');
var templates = require('../../lib/templates.json');
var utils = require('../../lib/utils');

module.exports = view.extend({
    id: 'detail',
    template: require('./index.html'),
    data: {
        back: true,
        title: 'App'
    },
    methods: {
        create: function () {
            var self = this;
            var app = App.createApp({
                data: self.$data.app
            });
            app.data.enteredEditorFrom = '/make/' + app.id + '/detail';
            self.page('/make/' + app.id + '/edit');
        }
    },
    created: function () {
        var self = this;
        // Fetch app
        var id = self.$parent.$data.params.id;
        var app = new App(id).data;
        if (!app) {
            app = templates[utils.findInArray(templates, 'id', id)] || {};
            self.$data.isTemplate = true;
        }

        // Bind app
        self.$data.id = id;
        self.$data.app = app;
    }
});

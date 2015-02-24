var view = require('../../lib/view');
var templates = require('../../lib/templates');
var clone = require('clone');

module.exports = view.extend({
    id: 'template-preview',
    template: require('./index.html'),
    data: {
        back: '/templates'
    },
    methods: {
        create: function (e) {
            if (e) {
                e.preventDefault();
            }
            var self = this;
            var options = {
                template: self.$root.params.id
            };
            var app = self.$root.storage.createApp(options);

            self.$data.create = false;
            self.$root.$data.enteredEditorFrom = '/templates';
            self.$root.isReady = false;
            setTimeout(function () {
                self.$root.isReady = true;
                self.page('/make/' + app.id);
            }, 100);

        }
    },
    created: function () {
        var self = this;
        var id = self.$root.params.id;
        self.model.data.session.previousId = id;

        if (id === 'blank') {
            self.create();
        }

        self.$data.id = id;
        templates.forEach(function (template) {
            var data;
            if (template.id === id) {
                data = clone(template);
                data.id = id;
                self.$data.app = data;
                self.$data.title = data.templateTitle;
            }
            self.$root.isReady = true;
        });
    }
});

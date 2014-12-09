var templates = require('../../lib/templates.json');
var view = require('../../lib/view');
var App = require('../../lib/app');

module.exports = view.extend({
    id: 'templates',
    template: require('./index.html'),
    data: {
        title: 'Make',
        templates: templates
    },
    ready: function () {
        var self = this;

        // Click handler
        function clickHandler (e) {
            e.preventDefault();
            var id = e.currentTarget.getAttribute('data-id');
            var app = App.createApp({template: id});
            app.data.enteredEditorFrom = '/templates';
            self.page('/make/' + app.id + '/edit');
        }

        // Apply click handler to each cell
        var targets = self.$el.getElementsByClassName('cell');
        for (var i = 0; i < targets.length; i++) {
            targets[i].addEventListener('click', clickHandler);
        }
    }
});

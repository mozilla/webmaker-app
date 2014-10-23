var templates = require('../../lib/templates.json');
var uuid = require('../../lib/uuid');
var view = require('../../lib/view');
var i18n = require('../../lib/i18n');

module.exports = view.extend({
    id: 'templates',
    template: require('./index.html'),
    data: {
        title: 'Make',
        templates: templates
    },
    ready: function () {
        var self = this;

        // Template clone helper
        function getTemplateClone (id) {
            for (var i = 0; i < templates.length; i++) {
                if (templates[i].id === id) {
                    return JSON.parse(JSON.stringify(templates[i]));
                }
            }
        }

        // Click handler
        function clickHandler (e) {
            e.preventDefault();

            var id = e.currentTarget.getAttribute('data-id');
            var clone = getTemplateClone(id);

            // Prepare the clone for use
            clone.id = uuid();
            clone.name = i18n.get('My') + " " + clone.name + " "  +  i18n.get('App');
            clone.author = self.model.data.user;

            // Add to model & redirect to editor
            self.model.data.apps.unshift(clone);
            self.page('/make/' + clone.id + '/play');
        }

        // Apply click handler to each cell
        var targets = self.$el.getElementsByClassName('cell');
        for (var i = 0; i < targets.length; i++) {
            targets[i].addEventListener('click', clickHandler);
        }
    }
});

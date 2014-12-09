var App = require('../../lib/app');
var view = require('../../lib/view');
var Blocks = require('../../lib/blocks');
var blocks = new Blocks();

var id = null;
var app = null;

module.exports = view.extend({
    id: 'add',
    template: require('./index.html'),
    data: {
        // Provide a specific sort order
        blocks: [
            blocks.text,
            blocks.image,
            blocks.sms,
            blocks.phone,

            // Include spacers for missing blocks
            undefined,
            undefined,

            // Form / data blocks
            blocks.input,
            blocks.spinner,
            blocks.submit
        ]
    },
    created: function () {
        var self = this;

        // Fetch app
        id = self.$parent.$data.params.id;
        app = new App(id);

        // Bind app
        self.$data.app = app.data;
        self.title = app.data.name;
    },
    ready: function () {
        var self = this;

        // Click handler
        function clickHandler (e) {
            e.preventDefault();

            // Attributes
            var blockId = e.currentTarget.getAttribute('data-block');
            var href = e.currentTarget.getAttribute('href');

            // Add block to make
            app.insert(blockId);

            // Add to model & redirect to editor
            self.page(href);
        }

        // Apply click handler to each cell
        var targets = self.$el.getElementsByTagName('a');
        for (var i = 0; i < targets.length; i++) {
            targets[i].addEventListener('click', clickHandler);
        }

        // Apply click handler to parent element
        self.$el.addEventListener('click', function (e) {
            if (e.target.id === 'add') {
                e.preventDefault();
                self.page('/make/' + id + '/edit');
            }
        });
    }
});

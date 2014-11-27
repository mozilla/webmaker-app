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
        app: {},
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
        id = self.$root.$data.params.id;
        app = new App(id);

        // Bind app
        app.storage.on('value', function (snapshot) {
            self.$root.isReady = true;
            if (!snapshot.val()) return;
            self.$data.app = snapshot.val() || {};
            self.$data.app.id = snapshot.key();

            self.title = snapshot.val().name;
        });
        self.$data.onDone = '/make/' + id + '/share?publish=true';
    },
    ready: function () {
        var self = this;

        // Click handler
        function clickHandler (e) {
            e.preventDefault();

            // Attributes
            var blockId = e.currentTarget.getAttribute('data-block');

            // Add block to make
            app.insert(blockId);

            // Add to model & redirect to block edit page.
            // Newly added block always in index 0.
            self.page('/make/' + id + '/block/0');
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

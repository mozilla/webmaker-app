var App = require('../../lib/app');
var view = require('../../lib/view');
var page = require('page');

// Available icon colors
var iconColors = [
    '#293233',
    '#092D74',
    '#024A97',
    '#1F9CDF',
    '#00C18A',
    '#FFE62C',
    '#FF8A45',
    '#FF5C5A',
    '#FF5A9C',
    '#682567'
];

module.exports = view.extend({
    id: 'name-icon-chooser',
    template: require('./index.html'),
    created: function() {
        var self = this;

        var id = self.$parent.$data.params.id;
        var app = new App(id);

        self.$data.app = app.data;

        // Temp: Save app name only
        self.$data.onDone = function() {
            if (!self.$data.app.name) {
                console.log('Empty name!');
                return;
            }

            //TODO: Save custom app icon and color

            page('/make/' + id + '/edit');
        };
    },
    data: {
        cancel: true,
        title: 'Name & Icon',
        iconColors: iconColors,
        onSelect: function(color) {
            var $data = this.$data;
            $data.selectedColor = color;
        },

        // Click on right arrow
        nextIcon: function() {
            //TODO: choose next icon
            console.log('next icon');
        },

        // Click on left arrow
        prevIcon: function() {
            //TODO: choose previous icon
            console.log('previous icon');
        }
    }
});
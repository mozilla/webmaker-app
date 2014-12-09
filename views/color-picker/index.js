var view = require('../../lib/view');
var App = require('../../lib/app');
var utils = require('../../lib/utils');

var colorGroups = [
    '#333444',
    '#FC5D5E',
    '#FEE444',
    '#1CB0B4',
    '#31ABDF'
];
var app = null;

module.exports = view.extend({
    id: 'color-picker',
    template: require('./index.html'),
    created: function () {
        var self = this;
        var $data = self.$data;
        var id = self.$parent.$data.params.id;
        app = new App(id);
        $data.blockIndex = self.$parent.$data.params.index;
        $data.block = app.data.blocks[$data.blockIndex];
        $data.selectedColor = $data.block.attributes.color.value;
        $data.colors.forEach(function (arr, i) {
            arr.forEach(function (color) {
                if (color === $data.selectedColor) {
                    $data.selectedGroup =  i;
                }
            });
            $data.selectedGroup = $data.selectedGroup || 0;
        });
    },
    data: {
        back: true,
        title: 'Select Color',
        onSelect: function (color) {
            var $data = this.$data;
            var attrs = $data.block.attributes;
            $data.selectedColor = color;
            attrs.color.value = $data.selectedColor;
        },
        onGroupSelect: function (i) {
            this.$data.selectedGroup = i;
            this.onSelect(colorGroups[i]);
        },
        colorGroups: colorGroups,
        colors: colorGroups.map(function (base) {
            var tints = [];
            for (var i = -5; i < 10; i++) {
                tints.push(utils.shadeColor(base, i * 6));
            }
            return tints;
        })
    }
});

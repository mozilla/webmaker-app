var Vue = require('vue');
var clone = require('clone');

var bulk = require('bulk-require');
var block = require('./block');

var componentList = {
    appCell: require('../components/appCell'),
    makeBar: require('../components/makeBar'),
    navigationBar: require('../components/navigationBar'),
    tabBar: require('../components/tabBar'),
    templateCell: require('../components/templateCell'),
    slideToggle: require('../components/slide-toggle'),
    alert: require('../components/alert'),
    dataRepresentation: require('../components/dataRepresentation'),
    switch: require('../components/switch'),
    loadingIndicator: require('../components/loadingIndicator')
};

// Add all blocks
var blocks = clone(bulk(__dirname + '/../blocks', '**/*.js'));

for (var id in blocks) {
    if (blocks.hasOwnProperty(id)) {
        componentList[id] = block.extend(blocks[id]);
    }
}

module.exports = Vue.extend({
    components: componentList,
    data: {},
    methods: {
        model: require('./model')(),
        page: require('page')
    }
});

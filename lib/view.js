var Vue = require('vue');
var clone = require('clone');

var bulk = require('bulk-require');
var block = require('./block');

var componentList = {
    appCell: require('../components/appCell'),
    makeBar: require('../components/makeBar'),
    navigationBar: require('../components/navigationBar'),
    tabBar: require('../components/tabBar'),
    templateCell: require('../components/templateCell')
    //toggle: require('../componets/toggle')
    //selector: require('../components/selector')
};

// Add all blocks
var blocks = clone(bulk(__dirname + '/../blocks', '**/*.js'));

for (var id in blocks) {
    componentList[id] = block.extend(blocks[id]);
}

module.exports = Vue.extend({
    components: componentList,
    data: {},
    methods: {
        model: require('./model')(),
        page: require('page')
    },
    created: function () {
        var self = this;

        self.$on('ping', function (e) {
            console.log(e);
            console.dir(self.user);
        });
    }
});

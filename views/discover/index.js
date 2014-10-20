var view = require('../../lib/view');
var fakeDiscovery  = require('../../lib/fake-discovery.json');

module.exports = view.extend({
    id: 'discover',
    template: require('./index.html'),
    data: {
        title: 'Discover',
        apps: fakeDiscovery,
        mode: 'featured'
    },
    created: function () {
        this.$data.created = this.model.data.apps;
    }
});

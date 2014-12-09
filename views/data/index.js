var App = require('../../lib/app');
var view = require('../../lib/view');
var Data = require('../../lib/data');

module.exports = view.extend({
    id: 'data',
    template: require('./index.html'),
    data: {
        initialDataLoaded: false
    },
    created: function () {
        var self = this;

        // Fetch app
        var id = self.$parent.$data.params.id;
        var app = new App(id);

        // Bind app
        self.$data.app = app.data;
        self.title = app.data.name;

        // Fetch collected Data
        var data = new Data(id);

        self.currentDataSets = [];
        data.getAllDataSets(function (currentDataSets) {
            self.$data.initialDataLoaded = true;
            self.currentDataSets = currentDataSets;
        });

        // listen for deletion requests
        self.$on('dataDelete', function (firebaseId) {
            data.delete(firebaseId);
        });
    }
});

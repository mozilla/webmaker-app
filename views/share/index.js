var App = require('../../lib/app');
var view = require('../../lib/view');
var i18n = require('../../lib/i18n');
var publish = require('../../lib/publish');
var auth = require('../../lib/auth');
var page = require('page');

module.exports = view.extend({
    id: 'share',
    template: require('./index.html'),
    data: {
        title: 'Share',
        cancel: true
    },
    methods: {
        login: function (e) {
            e.preventDefault();
            auth.login();
        }
    },
    created: function () {
        var self = this;

        // Fetch app
        var id = self.$parent.$data.params.id;
        var app = new App(id);

        // Bind app
        self.$data.app = app.data;

        // Bind user
        self.$data.user = self.model.data.user;

        // Share message
        var message = i18n.get('share_message').replace('{{app.name}}', app.data.name);
        self.$data.shareMessage = message;

        // Publish
        var sync = self.model._sync;
        self.$data.onDone = function () {
            if (self.$data.isPublishing) return;

            function onSynced() {
                publish(id, self.$data.user.username, function (err, data) {
                    self.$data.isPublishing = false;
                    if (err) return console.error(err);
                    app.data.url = data.url;
                    var sms = 'sms:?body=' + encodeURI(self.$data.shareMessage) + ' ' + data.url;
                    window.location = sms;
                    page('/make/' + id + '/detail');
                });
            }

            // Show spinner
            self.$data.isPublishing = true;

            // Sync makedrive - todo. Request doesn't seem to work
            // sync.once('completed', onSynced);
            // sync.request();
            onSynced();

        };

    }
});

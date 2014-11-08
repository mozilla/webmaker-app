var App = require('../../lib/app');
var view = require('../../lib/view');
var i18n = require('../../lib/i18n');
var publish = require('../../lib/publish');
var page = require('page');

var PUBLISH_TIMEOUT = 20000;

module.exports = view.extend({
    id: 'share',
    template: require('./index.html'),
    data: {
        title: 'Share',
        cancel: true,
        error: false,
        isPublishing: true,
        doneDisabled: true
    },
    methods: {
        login: function (e) {
            e.preventDefault();
            this.model.auth.login();
        },
        onDone: function () {
            var self = this;
            if (!self.$data.app.url) return;
            var sms = 'sms:?body=' +
                encodeURIComponent(self.$data.shareMessage);
            window.location = sms;
            page('/make/' + self.$parent.$data.params.id + '/detail');
        }
    },
    ready: function () {
        var self = this;

        // Fetch app
        var id = self.$parent.$data.params.id;
        var app = new App(id);

        // Bind app
        self.$data.app = app.data;

        // Bind user
        self.$data.user = self.model.data.user;

        // Share message
        var message = i18n
            .get('share_message')
            .replace('{{app.name}}', app.data.name);
        self.$data.shareMessage = message + ': ' + app.data.url;

        if (!global.location.search.match('publish=true') && app.data.url) {
            self.$data.isPublishing = false;
            return;
        }

        // Publish
        console.log('Starting publish...');
        self.$data.doneDisabled = true;

        var sync = self.model._sync;
        var syncTimeout;

        function onSynced() {
            publish(id, self.$data.user.username, function (err, data) {
                global.clearTimeout(syncTimeout);
                self.$data.isPublishing = false;
                if (err) {
                    console.error(err);
                    self.$data.error = (err.status || 'Error') +
                        ': ' + err.message;
                    return;
                }
                console.log('Published!');
                self.$data.error = false;
                self.$data.doneDisabled = false;
                app.data.url = data.url;
                self.$data.shareMessage = message + ': ' + data.url;
            });
        }

        syncTimeout = global.setTimeout(function () {
            console.log('timed out');
            self.$data.isPublishing = false;
            self.$data.error = 'Oops! Your publish is taking too long';
        }, PUBLISH_TIMEOUT);

        if (self.model._dirty) {
            sync.once('completed', onSynced);
        } else {
            onSynced();
        }

    }
});

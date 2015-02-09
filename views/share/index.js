var async = require('async');
var view = require('../../lib/view');
var i18n = require('../../lib/i18n');
var publish = require('../../lib/publish');
var page = require('page');
var config = require('../../config');
var localforage = require('localforage');
var xhr = require('xhr');
var app;

var PUBLISH_TIMEOUT = 20000;

var pre_publish_hooks = [
    function image_upload(app, user, hook_callback) {
        var app_data = app.data;
        var images = app_data.blocks.filter(function(block) {
            return block.type === 'image' && block.attributes.image.hash;
        });

        if (images.length === 0) {
            return hook_callback();
        }

        var q = async.queue(function(block, q_callback) {
            localforage.getItem('image/' + block.attributes.image.hash, function(error, file) {
                if (!file) {
                    q_callback();
                    return;
                }

                // Support dev mode for local publishing
                var request_body = {};
                if (config.PUBLISH_DEV_MODE) request_body.user = user;

                xhr({
                    method: 'POST',
                    url: config.IMAGE_REQUEST_ENDPOINT,
                    json: request_body,
                    withCredentials: true
                }, function(wp_error, response, data) {
                    data.starts_with.forEach(function(field) {
                      if (field === "Content-Type") {
                        data.fields[field] = file.type;
                      } else if (field === "key") {
                        data.fields[field] = data.fields[field] + "/${filename}";
                      }
                    });
                    var form = new FormData();

                    Object.keys(data.fields).forEach(function(field) {
                      form.append(field, data.fields[field]);
                    });
                    form.append("file", file);

                    xhr({
                        method: 'POST',
                        url: data.host,
                        body: form
                    }, function(s3_error, response, data) {
                        block.attributes.image.url = decodeURIComponent(response.headers.location);
                        q_callback();
                    });
                });
            });
        }, 1);
        q.drain = hook_callback;

        q.push(images);
    },
    function update_firebase(app, user, hook_callback) {
        app.update({
            blocks: app_data.blocks
        }, hook_callback)
    }
];

var start_prepublish = function(app_data, user, callback) {
    async.applyEach(pre_publish_hooks, app_data, user, function(prepublish_error) {
        if (prepublish_error) {
            throw prepublish_error;
        }

        callback();
    });
};

module.exports = view.extend({
    id: 'share',
    template: require('./index.html'),
    data: {
        title: 'Share',
        error: false,
        doneDisabled: true,
        showPicker: false,
        cancel: true,
        contacts: [],
        modeledContacts: {},
        isDiscoverable: false,
        disableDiscovery: false
    },
    methods: {
        login: function (e) {
            e.preventDefault();
            this.model.auth.login();
        },
        onDone: function () {
            this.sendSMS();
        },
        sendSMS: function () {
            var self = this;
            if (!self.$data.app.url) return;

            app.update({
                isDiscoverable: self.isDiscoverable
            });

            var contacts = [];
            Object.keys(self.modeledContacts).forEach(function (letter) {
                self.modeledContacts[letter].forEach(function (contact) {
                    if (contact.selected) contacts.push(contact);
                });
            });
            contacts = contacts.map(function (contact) {
                return contact.phoneNumbers[0].value;
            });

            if (!contacts.length) {
                self.$data.error = 'noContactsError';
                return;
            } else {
                self.$data.error = false;
            }

            window.SMS.sendSMS(contacts, self.shareMessage, function () {
                console.log('Sent!');
                page('/make/' + self.$parent.$data.params.id + '/detail');
            }, function (err) {
                console.log(err);
                self.$data.error = 'Sorry, there was a problem sending an SMS.';
                var id = self.$parent.$data.params.id;
                self.onDone = '/make/' + id + '/detail';
            });

        },
        onSMSClick: function (e) {
            e.preventDefault();
            this.$broadcast('openContactPicker');
        }
    },
    created: function () {
        this.$root.isReady = false;
    },
    ready: function () {
        var self = this;
        var id = self.$root.$data.params.id;

        app = self.$root.storage.getApp(id);

        self.$data.cancel = '/make/' + id;

        // Bind user
        self.$data.user = self.model.data.session.user;

        var message;

        var offlineError = 'We couldn\'t reach the publishing server. Sorry!';

        function startPublish() {
            var publishUrl = global.location.href.match('publish=true');

            if (!publishUrl && self.$data.app.url) {
                self.$root.isReady = true;
                return;
            }

            // Publish
            console.log('Starting publish...');
            self.$data.doneDisabled = true;

            var syncTimeout = global.setTimeout(function () {
                console.log('timed out');
                self.$root.isReady = true;
                self.$data.error = 'Oops! Your publish is taking too long';
            }, PUBLISH_TIMEOUT);

            publish(id, self.$data.user, function (err, data) {
                global.clearTimeout(syncTimeout);
                self.$root.isReady = true;
                if (err) {
                    console.error(err);
                    if (err.status === 0) {
                        self.$data.error = offlineError;
                    } else {
                        self.$data.error = (err.status || 'Error') +
                            ': ' + err.message;
                    }
                    return;
                }
                console.log('Published!');
                self.$data.error = false;
                self.$data.doneDisabled = false;
                app.update({
                    url: data.url
                });
                self.$data.shareMessage = message + ': ' + data.url;
            });
        }

        function onValue(val) {
            self.$data.app = val;
            // Share message
            message = i18n
                .get('share_message')
                .replace('{{app.name}}', val.name);

            if (val.url) {
                self.$data.shareMessage = message + ': ' + val.url;
            }

            start_prepublish(app, self.$data.user, startPublish);
        }

        // Bind app
        if (app.data) {
            onValue(app.data);
        } else {
            self.$once(id, onValue);
        }
    }
});

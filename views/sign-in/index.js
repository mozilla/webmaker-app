var view = require('../../lib/view');

module.exports = view.extend({
    id: 'sign-in',
    template: require('./index.html'),
    data: {
        loginError: false
    },
    computed: {
        username: function () {
            return this.model.data.user.username;
        },
        offline: function () {
            // Todo: detect internet connection
            return false;
        }
    },
    methods: {
        login: function (e) {
            e.preventDefault();
            this.model.auth.login();
        },
        create: function (e) {
            e.preventDefault();
            this.model.auth.create();
        },
        goOffline: function (e) {
            e.preventDefault();
            this.model.offlineConnect();
            this.page('/templates');
        }
    },
    created: function () {
        var self = this;
        self.model.auth.on('error', function (err) {
            console.log('Login error', err);
            self.$data.loginError = 'Oops, there was a problem logging in.';
        });
    }
});

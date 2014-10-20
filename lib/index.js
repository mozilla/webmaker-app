/**
 * An app that makes apps.
 *
 * @package webmaker
 * @author  Andrew Sliwinski <a@mozillafoundation.org>
 */

var Vue = require('vue');
var page = require('page');

var i18n = require('./i18n');
var locale = require('../locale');
var router = require('./router');
var model = require('./model')();
var restorePath = require('./restore-path');

// Register views
Vue.component('loader', require('../views/loader'));
Vue.component('ftu', require('../views/ftu'));
Vue.component('ftu-2', require('../views/ftu-2'));
Vue.component('ftu-3', require('../views/ftu-3'));

Vue.component('discover', require('../views/discover'));
Vue.component('templates', require('../views/templates'));
Vue.component('profile', require('../views/profile'));
Vue.component('sign-up', require('../views/sign-up'));

Vue.component('play', require('../views/play'));
Vue.component('edit', require('../views/edit'));
Vue.component('add', require('../views/add'));
Vue.component('block', require('../views/block'));
Vue.component('share', require('../views/share'));
Vue.component('detail', require('../views/detail'));

Vue.component('color-picker', require('../views/color-picker'));

Vue.component('slide-toggle', require('../components/slide-toggle'));

// Register localization
i18n.bind(locale, Vue);

// Create "app"
var app = new Vue({
    el: '#app',
    data: {
        currentView: 'loader',
        params: null
    },
    created: function () {
        model.restore(function onLogin(err) {
            if (err) console.error(err);

            // i18n
            i18n.setLocale(model.data.locale, true);

            // Route
            router(app);

            restorePath({
                history: model.data.history && model.data.history.path,
                offline: model.offline
            });

        }, function onLogout(err) {
            var self = this;

            // i18n
            i18n.setLocale(null, true);

            // Router
            router(app);

            // Redirect
            if (self._sync.state === self._sync.SYNC_CONNECTED) {
                self._sync.disconnect();
                page('/ftu-3');
            } else {
                page('/ftu');
            }

        });
    }
});

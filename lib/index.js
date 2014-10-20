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
Vue.component('name-icon-chooser', require('../views/name-icon-chooser'));


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

            var noRestore;
            if (model.offline) {
                noRestore = ['/', '/index.html'];
            } else {
                noRestore = ['/', '/index.html', '/ftu', '/ftu-2', '/ftu-3'];
            }
            var defaultPath = '/templates';

            var pathname = window.location.pathname;
            var history = model.data.history;

            // If cold start, restore from history... but not if history is in noRestore
            if (history && noRestore.indexOf(pathname) === -1) {
                page(history);
            // If cold start (no history), restore to default path
            } else if (noRestore.indexOf(pathname) > -1) {
                console.log('[Loader] You visited ' + pathname + ' but you are logged in. Redirecting to ' + defaultPath);
                page(defaultPath);
            }

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

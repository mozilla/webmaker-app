/**
 * An app that makes apps.
 *
 * @package webmaker
 * @author  Andrew Sliwinski <a@mozillafoundation.org>
 */

var Vue = require('vue');

var i18n = require('./i18n');
var locale = require('../locale');
var router = require('./router');
var model = require('./model')();

// Register views
Vue.component('loader', require('../views/loader'));
Vue.component('error', require('../views/error'));
Vue.component('sign-in', require('../views/sign-in'));
// Vue.component('ftu', require('../views/ftu'));
// Vue.component('ftu-2', require('../views/ftu-2'));
// Vue.component('ftu-3', require('../views/ftu-3'));

Vue.component('discover', require('../views/discover'));
Vue.component('templates', require('../views/templates'));
Vue.component('profile', require('../views/profile'));

Vue.component('play', require('../views/play'));
Vue.component('data', require('../views/data'));
Vue.component('edit', require('../views/edit'));
Vue.component('add', require('../views/add'));
Vue.component('block', require('../views/block'));
Vue.component('share', require('../views/share'));
Vue.component('detail', require('../views/detail'));

Vue.component('color-picker', require('../views/color-picker'));

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
        model.restore(function () {

            // i18n
            i18n.setLocale(model.data.locale, true);

            // Route
            router(app);

        });
    }
});

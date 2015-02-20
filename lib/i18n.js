/**
 * Localization!
 *
 */
var model = require('./model')();

// Spoof because navigator.language sucks
function getLocaleFromQueryString() {
    var regex = new RegExp('[\\?&]locale=([^&#]*)');
    var results = regex.exec(window.location.search);

    if (results === null) {
        return '';
    } else {
        return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
}

function Localize () {
    var self = this;

    self.defaultLang = 'en-US';
    self.locale = navigator.language;

    self.supportedLanguages = [];
    self.dictionary =  {};
    self.dictionaries = {};
    self.url = '';

    self.bind = function (langs, vue) {

        self.dictionaries = langs;
        for (var locale in langs) {
            if (locale) {
                self.supportedLanguages.push(locale);
            }
        }

        // Bind directives/filters
        if (vue) {
            vue.filter('i18n', self.i18nFilter);
            vue.directive('bind-i18n-html', self.bindHtml);
        }
    };

    self.supportedLangs = function () {
        return this.supportedLanguages;
    };

    self.setLocale = function (locale, autodetect) {
        var html = window.document.querySelector('html');

        // Try to autodetect locale
        if (autodetect) {
            var defaultLang = self.defaultLang;
            var navLocale = navigator.language;
            var spoof = getLocaleFromQueryString();
            self.locale = spoof || locale || navLocale || defaultLang;
            model.data.session.locale = self.locale;
        }

        // Set dictionary
        var currentLangDict = self.dictionaries[model.data.session.locale];
        var defaultLangDict = self.dictionaries[self.defaultLang];
        self.dictionary = currentLangDict || defaultLangDict;

        if (html) {
            html.setAttribute('lang', model.data.session.locale);
        }

    };

    self.get = function (key) {
        var dict = self.dictionary[key];
        var defaultLang = self.dictionaries[self.defaultLang][key];
        if (self.dictionaries[model.data.session.locale] !== undefined) {
            var localized = self.dictionaries[model.data.session.locale][key];
            if (!!localized) {
                return localized;
            }
        }
        var value = dict || defaultLang || key;
        if (!!value) {
            var macroReplace = function (pattern, term) {
                var replacement = !!macros ? macros[term] : false;
                return replacement ? replacement : pattern;
            };
            value = value.replace(/{{\s*([^}\s]+)\s*}}/g, macroReplace);
        }
        return value;
    };

    self.i18nFilter = function (key) {
        return self.get(key);
    };

    self.bindHtml = function (key) {
        var raw = self.get(key);
        this.el.innerHTML = raw;
    };
}

module.exports = new Localize();

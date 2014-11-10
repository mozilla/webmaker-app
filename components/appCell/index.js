var i18n = require('../../lib/i18n');

module.exports = {
    className: 'app-cell',
    template: require('./index.html'),
    paramAttributes: ['mode'],
    computed: {
        guestKey: function () {
            return i18n.get('Guest');
        }
    }
};

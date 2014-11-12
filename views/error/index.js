var view = require('../../lib/view');

module.exports = view.extend({
    id: 'error',
    template: require('./index.html'),
    computed: {
        message: function () {
            var code = +this.$root.params.code;
            var message;
            switch (code) {
                case 404:
                    message = 'error404';
                    break;
                default:
                    message = 'defaultError';
            }
            return message;
        }
    },
    created: function () {
        console.error('Error ' +
            this.$root.params.code +
            ': ' +
            global.location.pathname);
    }
});

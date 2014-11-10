module.exports = {
    className: 'alert-container',
    template: require('./index.html'),
    paramAttributes: ['type', 'message', 'no-margin'],
    computed: {
        icon: function () {
            var check = 'fa-check-circle';
            var circle = 'fa-times-circle';
            return this.type === 'success' ? check : circle;
        },
        classes: function () {
            var classes = 'alert alert-' + (this.$data.type || 'error');
            if (this.$data['no-margin'] || this.$data['no-margin'] === 0) {
                classes += ' no-margin';
            }
            return classes;
        }
    }
};

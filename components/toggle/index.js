module.exports = {
    className: 'toggle',
    template: require('./index.html'),
    paramAttributes: ['disabled', 'checked'],
    ready: function () {
        this.disabled = this.disabled === 'true' ? true : false;
    },
    data: {}
};

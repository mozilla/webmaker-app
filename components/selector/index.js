module.exports = {
    id: 'navigationBar',
    template: require('./index.html'),
    data: {
        goBack: function (e) {
            e.preventDefault();
            global.history.back();
        }
    }
};

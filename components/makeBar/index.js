module.exports = {
    id: 'makeBar',
    template: require('./index.html'),
    methods: {
        onClick: function (e) {
            var href = e.target.href;
            var section = href.split('/').pop();

            if (section === 'edit') {
                this.$el.className = 'edit';
            } else {
                this.$el.className = '';
            }
        }
        goBack: function (e) {
            e.preventDefault();
            global.history.back();
        }
    }
};

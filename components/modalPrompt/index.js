module.exports = {
    id: 'modal-prompt',
    ready: function () {
        var self = this;

        self.$on('openModalPrompt', function (event) {
            self.open(event.type);
        });

        self.$on('closeModalPrompt', function (event) {
            self.close();
        });
    },
    partials: {
        delete: require('./delete.html'),
        imagePicker: require('./image-picker.html')
    },
    methods: {
        open: function (type) {
            this.$data.type = type;
            this.isOpen = true;
            this.$el.classList.add('active');

        },
        close: function (event) {
            this.isOpen = false;
            this.$el.classList.remove('active');
            this.$dispatch('modalPromptClosed');
        },
        onConfirmClick: function (event) {
            this.$dispatch('onConfirmClick');
            this.close();
        }
    },
    data: {
        isOpen: false
    },
    template: require('./index.html')
};

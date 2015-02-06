module.exports = {
    className: 'toggle',
    template: require('./index.html'),
    paramAttributes: ['disabled', 'checked'],
    methods: {
        onClick: function (e) {
            e.preventDefault();
            if (this.disabled) return;
            this.checked = !this.checked;
            this.checked ?
                (this.$data.iconClass = 'ion-android-checkbox-outline') :
                (this.$data.iconClass = 'ion-android-checkbox-outline-blank');
        }
    },
    ready: function () {
        // parse non booleans
        // eg: values passed in as a "disabled" param instead of v-with
        if (typeof this.disabled === 'string') {
            this.disabled = this.disabled === 'true';
        }
    },
    data: {
        iconClass: 'ion-android-checkbox-outline-blank'
    }
};

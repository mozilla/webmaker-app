var Vue = require('vue');

module.exports = {
    className: 'slide-toggle',
    template: require('./index.html'),
    paramAttributes: ['model', 'left', 'right', 'left-label', 'right-label'],
    methods: {
        updateModel: function (val) {
            this.val = val;
        }
    },
    computed: {
        leftLabel: function () {
            return this['left-label'] || this.left;
        },
        rightLabel: function () {
            return this['right-label'] || this.right;
        },
        val: {
            $get: function() {
                return this.$parent[this.model];
            },
            $set: function (val) {
                this.$parent[this.model] = val;
                return val;
            }
        }
    },
    created: function () {
        if (!this.val) this.val = this.left;
    }
};

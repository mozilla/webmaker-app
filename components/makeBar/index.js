var Hammer = require('hammerjs');
var i18n = require('../../lib/i18n');
var page = require('page');

module.exports = {
    id: 'makeBar',
    template: require('./index.html'),
    initialized: false,
    data: {
        label: '',
        direction: ''
    },
    ready: function () {
        var that = this;

        this.toggle = new Hammer(this.$el.querySelector('.toggle'));
        this.toggle.on('swipe', function (ev) {
            that.toggleSwiped(ev);
        });

        this.previewLink = new Hammer(this.$el.querySelector('.preview'));
        this.previewLink.on('tap', function (ev) {
            that.changeToggle('left');
        });

        this.editLink = new Hammer(this.$el.querySelector('.edit'));
        this.editLink.on('tap', function (ev) {
            that.changeToggle('right');
        });

        this.mode = this.$root.params.mode;
        this.init();
    },
    methods: {
        init: function () {
            //Sets the toggle to the correct state when first loading
            //without an animation or triggering a page change.
            if (this.mode === 'edit') {
                this.changeToggle('right');
            } else {
                this.changeToggle('left');
            }
            this.$el.classList.add('loaded');
            this.initialized = true;
        },
        changeToggle: function (direction) {
            //Moves the toggle to the correct position and changes the label.
            //Navigates to correct page if initialized.
            this.direction = direction;

            if (direction === 'right') {
                this.label = i18n.get('Edit');
            } else {
                this.label = i18n.get('Preview');
            }
            if (this.initialized) {
                this.navigate();
            }
        },
        navigate: function () {
            //Navigates with a delay to allow slide toggle to finish moving.
            var that = this;
            setTimeout(function () {
                if (that.direction === 'left') {
                    page('/make/' + that.$data.app.id + '/play');
                } else {
                    page('/make/' + that.$data.app.id + '/edit');
                }
            }, 250);
        },
        toggleSwiped: function (ev) {
            var swipeDirection = ev.offsetDirection === 4 ? 'left' : 'right';
            if (this.direction === 'left' && swipeDirection === 'right') {
                this.changeToggle('right');
                this.navigate();
            }
            if (this.direction === 'right' && swipeDirection === 'left') {
                this.changeToggle('left');
                this.navigate();
            }
        }
    }
};

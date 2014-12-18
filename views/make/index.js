var view = require('../../lib/view');
var Data = require('../../lib/data');
var throttle = require('lodash.throttle');
var Sortable = require('sortable');

var sort;
var app;

var iconColors = [
    '#333444',
    '#1e79da',
    '#1F9CDF',
    '#18dea6',
    '#39d91f',
    '#e7ce17',
    '#ea6517',
    '#e71a18',
    '#ec1a6e',
    '#d91fd6'
];

var iconImages = [
    'activist.png',
    'blogger.png',
    'howto.png',
    'journalist.png',
    'puppy.png',
    'safety.png',
    'scientist.png',
    'music.png',
    'teacher.png',
    'vendor.png',
    'family.png'
];

module.exports = view.extend({
    id: 'make',
    template: require('./index.html'),
    partials: {
        navigation: require('./navigation.html'),
        settings: require('./settings.html')
    },
    methods: {
        goBack: function (e) {
            e.preventDefault();
            if (this.$data.mode === 'settings') {
                this.$data.changeMode('edit');
            } else {
                this.page('/profile');
            }
        },
        updateName: throttle(function (newVal) {
            app.update({
                name: newVal
            });
        }, 3000),
        previousIconImage: function () {
            this.selectIconImage('previous');
        },
        nextIconImage: function () {
            this.selectIconImage('next');
        },
        selectIconImage: function (direction) {

            var data = this.$data;
            var index = data.iconImages.indexOf(data.app.iconImage) || 0;
            var maxIndex = data.iconImages.length - 1;

            direction === 'next' ? index++ : index--;
            if (index < 0) { index = maxIndex; }
            if (index > maxIndex) { index = 0; }

            app.update({
                iconImage: data.iconImages[index]
            });

            this.$data.currentIconIndex = index;
        },
        onSelectIconColor: function (color) {
            app.update({
                iconColor: color
            });
        },
        removeApp: function () {
            app.removeApp();
            this.page('/profile');
        }
    },
    created: function () {
        var self = this;
        var id = self.$root.$data.params.id;
        var storage = self.$root.storage;
        var isDragging = false;

        app = storage.getApp(id);

        self.$data.iconColors = iconColors;
        self.$data.iconImages = iconImages;

        var list = self.$el.querySelector('#blocks');

        self.$data.onDone = '/make/' + id + '/share?publish=true';
        self.$data.offlineUser = this.model.data.session.offline;

        function getIndex(nodeList, el) {
            for (var i = 0; i < nodeList.length; i++) {
                if (nodeList[i] === el) {
                    return i;
                }
            }
        }

        function onValue(val) {
            console.log('onValue');

            self.$root.isReady = true;

            if (isDragging) return;

            if (!val) return;
            self.$data.app = val;

            var blocks = val.blocks;

            try {
                if (sort) sort.destroy();
            } catch (e) {
                console.log('sort error', e);
            }

            sort = new Sortable(list, {
                handle: '.draggable-handle',
                scroll: self.$root.$el,
                onStart: function () {
                    isDragging = true;
                },
                onEnd: function (e) {
                    isDragging = false;

                    var el = e.target;
                    var lis = list.querySelectorAll('li');
                    var start = el.getAttribute('index');
                    var end = getIndex(lis, el);

                    isDragging = false;

                    blocks.splice(end, 0, blocks.splice(start, 1)[0]);
                    // update
                    app.update({
                        blocks: blocks
                    });
                }
            });
        }

        if (app.data) {
            onValue(app.data);
        }

        self.$on(id, onValue);

        // Mode
        self.$data.changeMode = function (mode) {
            var modes = ['edit', 'play', 'data', 'settings'];
            if (modes.indexOf(mode) === -1) {
                console.log('warning: ' + mode + ' is not a valid mode');
                mode = 'edit';
            }
            if (mode === 'settings' && self.$data.mode === 'settings') {
                mode = 'edit';
            }
            self.$data.mode = mode;
            self.$root.isEditing = self.$data.mode === 'edit';
        };

        var regex = new RegExp('[\\?&]mode=([^&#]*)');
        var results = regex.exec(window.location.search);

        var mode = results ? results[1] : 'edit';
        self.$data.changeMode(mode);

        self.$data.goTo = function (href, $event) {
            if (self.$data.mode !== 'edit') return;
            self.page(href);
        };

        // Fetch collected Data
        var data = new Data(id);

        self.currentDataSets = [];
        data.getAllDataSets(function (currentDataSets) {
            self.$data.initialDataLoaded = true;
            self.currentDataSets = currentDataSets;
        });

        self.$on('dataChange', function (index, value, label) {
            data.collect(index, value, label);
        });

        self.$on('dataSave', function () {
            if (data.getCurrentCollectedCount() > 0) {
                data.save();
                self.$broadcast('dataSaveSuccess');
            }
        });

        // listen for deletion requests
        self.$on('dataDelete', function (firebaseId) {
            data.delete(firebaseId);
        });
    }
});

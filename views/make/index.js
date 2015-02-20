var view = require('../../lib/view');
var Data = require('../../lib/data');
var utils = require('../../lib/utils');
var throttle = require('lodash.throttle');
var Sortable = require('sortable');
var publish = require('../../lib/publish');
var i18n = require('../../lib/i18n');
var ua = require('../../lib/ua');
var analytics = require('../../lib/analytics');
var network = require('../../lib/network');

var sort;
var app;
var iconColors = utils.baseColors;

var iconImages = [
    'activist.svg',
    'blogger.svg',
    'howto.svg',
    'journalist.svg',
    'puppy.svg',
    'safety.svg',
    'scientist.svg',
    'music.svg',
    'teacher.svg',
    'vendor.svg',
    'family.svg'
].map(function (icon) {
    return 'images/icons/' + icon;
});

module.exports = view.extend({
    id: 'make',
    data:{
        isOnline : network.isOnline
    },
    template: require('./index.html'),
    partials: {
        navigation: require('./navigation.html'),
        settings: require('./settings.html')
    },
    computed: {
        noBlock: function () {
            return this.$data.app.blocks ? this.$data.app.blocks.length : 0;
        }
    },
    methods: {
        showMenu: function () {
            this.$parent.$broadcast('openSideMenu');
            this.$parent.$broadcast('openShim');
        },
        goBack: function (e, isCancel) {
            e.preventDefault();
            if (this.$data.mode === 'settings') {
                // Restore original data for a cancellation
                if (isCancel) {
                    app.update({
                        iconImage: this.$data.originalIconImage,
                        iconColor: this.$data.originalIconColor,
                        name: this.$data.originalName
                    });
                } else {
                    this.$data.originalIconImage = app.data.iconImage;
                    this.$data.originalIconColor = app.data.iconColor;
                    this.$data.originalName = app.data.name;
                }

                this.$data.changeMode('edit');
            } else {
                this.page('/profile');
            }
        },
        goPreviousView: function (e) {
            global.history.back();
        },
        enableSave: function () {
            this.$data.saveDisabled = false;
        },
        hideSpeech: function () {
            this.$data.app.faded = true;
        },
        onSave: function (e) {
            this.goBack(e, false);
            this.updateName(this.$data.app.name);
        },
        onCancel: function (e) {
            this.goBack(e, true);
        },
        updateName: throttle(function (newVal) {
            this.enableSave();
            app.update({
                name: newVal
            });
            analytics.event({ category: 'App Name & Icon', action: 'Name (autosaves)', label: newVal});
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
            if (index < 0) {
                index = maxIndex;
            }
            if (index > maxIndex) {
                index = 0;
            }
            this.enableSave();
            app.update({
                iconImage: data.iconImages[index]
            });

        },
        onSelectIconColor: function (color) {
            this.enableSave();
            app.update({
                iconColor: color
            });
            analytics.event({category: 'App Name & Icon', action: 'Color', label: color});
        },
        saveAppSettings: function () {
            if (this.$data.mode === 'settings') {
                this.$data.changeMode('edit');
            }
        },
        removeApp: function () {
            app.removeApp();
            this.page('/profile');
        },
        publish: function () {
            var self = this;
            var id = self.$root.$data.params.id;
            var user = this.model.data.session.user;
            var root = self.$root;

            // Publish
            if (!self.$data.isOnline) {
                root.$broadcast('publishOffline');
                return;
            }
            root.$broadcast('publishingStarted');
            publish(id, user, function (err, data) {

                if (err) {
                    root.$broadcast('publishingError', err);
                    return;
                }

                root.$broadcast('publishingDone');
                console.log('[Publish]', data.url);

                // callback funciton for social share success
                function shareSuccess () {
                    analytics.event({ category: 'Social', action: 'Share Success', label: 'Android'});
                }

                // Native Sharing (Android / iOS) or dispatch SMS (FirefoxOS)
                var msg = i18n.get('share_message', { "app.name": app.name });
                var url = data.url;
                if (typeof window.plugins === 'undefined') return;
                if (typeof window.plugins.socialsharing === 'undefined') return;
                if (ua.isFirefoxOS) {
                    analytics.screenView({screenName: 'Social Share View FirefoxOS (sms)'});
                    window.location.href = 'sms:?body=' + msg + ' ' + url;
                } else {
                    analytics.screenView({screenName: 'Social Share View Android'});
                    window.plugins.socialsharing.share(msg, null, null, url, shareSuccess);
                }
            });
        },
        fadeOut: function (element) {
            this.hideSpeech();

            var op = 1;  // initial opacity
            var timer = setInterval(function () {
                if (op <= 0.1) {
                    clearInterval(timer);
                    element.style.display = 'none';
                }
                element.style.opacity = op;
                element.style.filter = 'alpha(opacity=' + op * 100 + ')';
                op -= op * 0.1;
            }, 50);
        }
    },
    ready: function () {
        var self = this;
        var element = self.$el.querySelector('.fadeAway');

        if (element) {
            setTimeout(function () {
                self.fadeOut(element);
            }, 3000);
        }

        self.$on('sideMenuDeleteClick', function (event) {
            self.$dispatch('openModalPrompt', {type: 'delete'});
        });

        self.$on('sideMenuShareClick', function (event) {
            self.publish();
        });

        self.$on('sideMenuDataClick', function (event) {
            this.mode = 'data';
        });

        self.$on('onConfirmClick', function (event) {
            console.warn('Deleting app!');
            self.removeApp();
        });

        // Broadcast individual editor starts to all inline editors
        // This is so that they know to hide if another one opens
        self.$on('inlineEditorStarted', function (event) {
            self.$broadcast('inlineEditorStarted', event);
        });
    },
    created: function () {
        var self = this;
        var id = self.$root.$data.params.id;
        var storage = self.$root.storage;
        var isDragging = false;

        app = storage.getApp(id);

        self.$data.saveDisabled = true;
        self.$data.iconColors = iconColors;
        self.$data.iconImages = iconImages;

        var list = self.$el.querySelector('.blocks');

        function getIndex(nodeList, el) {
            for (var i = 0; i < nodeList.length; i++) {
                if (nodeList[i] === el) {
                    return i;
                }
            }
        }

        function onValue(val) {
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
            self.$data.originalIconImage = self.$data.app.iconImage;
            self.$data.originalIconColor = self.$data.app.iconColor;
            self.$data.originalName = self.$data.app.name;
        }

        self.$on(id, onValue);

        // Modes
        // ---------------------------------------------------------------------
        self.$data.changeMode = function (mode) {
            var modes = ['edit', 'settings'];
            if (modes.indexOf(mode) === -1) {
                console.log('warning: ' + mode + ' is not a valid mode');
                mode = 'edit';
            }
            if (mode === 'settings' && self.$data.mode === 'settings') {
                mode = 'edit';
            }
            self.$data.saveDisabled = true;
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

        // Handle save events
        // ---------------------------------------------------------------------
        var data = new Data(id);
        self.$on('dataSave', function () {
            if (!self.$data.isOnline) {
                self.$broadcast('publishOffline');
                return;
            }
            data.collect(this.$el, function onDataSave(err) {
                if (err) {
                    analytics.error({description: 'Firebase Save Error'});
                    return console.log('[Firebase] ' + err);
                }
                self.$broadcast('dataSaveSuccess');
            });
        });
    }
});

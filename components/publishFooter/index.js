module.exports = {
    id: 'publish-footer',
    template: require('./index.html'),
    data: {
        showFooter: false,
        showInstall: false
    },
    methods: {
        toggleShowFooter: function (e) {
            if (e) e.preventDefault();
            this.$data.showFooter = !this.$data.showFooter;
            this.toggleOverlay(this.$data.showFooter);
        },
        share: function (e) {
            e.preventDefault();
            window.location = 'sms:?body=' + window.location;
        }
    },
    created: function () {
        var self = this;

        // Todo: we should abstract this into a component or common method
        var overlay = document.createElement('div');
        overlay.id = 'publish-overlay';
        overlay.classList.add('overlay');
        self.$el.parentNode.insertBefore(overlay, self.$el);

        overlay.addEventListener('click', function () {
            self.toggleShowFooter();
        }, false);

        // Currently disabled due to single-app-per-origin restriction
        var allowInstall = false;

        if (allowInstall && navigator.mozApps) {
            var manifestUrl = location.href + 'manifest.webapp';
            self.$data.install = function install(e) {
                e.preventDefault();
                var installLocFind = navigator.mozApps.install(manifestUrl);
                installLocFind.onsuccess = function (data) {
                    self.$data.showInstall = false;
                };
                installLocFind.onerror = function () {
                    alert('Sorry, we could not install this app: ' +
                        installLocFind.error.name);
                };
            };
            var installCheck = navigator.mozApps.checkInstalled(manifestUrl);
            installCheck.onsuccess = function () {
                if (installCheck.result) {
                    self.$data.showInstall = false;
                } else {
                    self.$data.showInstall = true;
                }
            };
        }

        self.toggleOverlay = function (show) {
            if (show) {
                overlay.classList.add('on');
            } else {
                overlay.classList.remove('on');
            }
        };
    }
};

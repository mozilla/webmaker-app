var view = require('../../lib/view');
var page = require('page');

module.exports = view.extend({
    id: 'profile',
    template: require('./index.html'),
    data: {
        title: 'My Profile',
        back: false
    },
    computed: {
        user: function () {
            return this.model.data.user;
        },
        myApps: function () {
            // temporary hack to only show current user's data
            var username = this.model.data.user.username;
            var myApps = this.model.data.apps.filter(function (app) {
                if(app) {
                    return app.author.username === username;
                }
            });
            return myApps;
        }
    },
    methods: {
        logout: function (e) {
            e.preventDefault();
            this.model.auth.logout();
        },
        clean: function (e) {
            var self = this;

            var username = this.model.data.user.username;
            var apps_del = 0;
            this.model.data.apps.forEach(function (app, index) {
                if (app && app.author.username === username) {
                    delete self.model.data.apps[index]; 
                    apps_del++;               
                }                
            });
            
            self.model.save(function () {
                if (apps_del >0) {
                    alert("We deleted your apps."); 
                }
                location.reload();
            }); 
        }
    }
});

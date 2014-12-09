var page = require('page');
var model = require('./model')();

module.exports = function (app) {
    // Track history for session restoration
    page(function (e, next) {
        if (!model._ready) return next();
        model.data.history.path = e.path;
        next();
    });

    // Exterior
    // page('/ftu', function () {
    //     app.currentView = 'ftu';
    // });

    // page('/ftu-2', function () {
    //     app.currentView = 'ftu-2';
    // });

    // page('/ftu-3', function () {
    //     app.currentView = 'ftu-3';
    // });

    page('/sign-in', function () {
        app.currentView = 'sign-in';
    });

    page('/discover', function () {
        app.currentView = 'discover';
    });

    page('/templates', function () {
        app.currentView = 'templates';
    });

    page('/profile', function () {
        app.currentView = 'profile';
    });

    // Interior
    page('/make/:id/:mode', function (e) {
        app.currentView = e.params.mode;
        app.params = e.params;
    });

    page('/make/:id/block/:index', function (e) {
        app.currentView = 'block';
        app.params = e.params;
    });

    // Temp -- probably will be something else
    page('/make/:id/block/:index/color-picker', function (e) {
        app.currentView = 'color-picker';
        app.params = e.params;
    });

    // login
    page('/login', function () {
        app.currentView = 'loader';
    });

    // Configuration
    page('*', function () {
        app.currentView = 'error';
        app.params = {code: 404};
    });

    // Init
    setTimeout(function () {
        page({
            click: true,
            popstate: true
        });
    }, 250);
};

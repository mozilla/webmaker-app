var habitat = require('habitat');
var file = require('gulp-file');
var gulp = require('gulp');
var path = require('path');
var env = new habitat('publish');

// Which env variables can we expose to the client?
var expose = [
    'LOGIN_URL',
    'PUBLISH_ENDPOINT',
    'MAKEDRIVE_URL',
    'OFFLINE',
    'PUBLISH_DEV_MODE',
	'FIREBASE_URL'
];

module.exports = function () {

    // Load configuration
    var env = process.env.NODE_ENV;
    habitat.load('.env');
    if (env === 'MOFODEV') {
        habitat.load('./config/mofodev.env');
    }
    else if (env === 'STAGING' || env === 'NPM') {
        habitat.load('./config/staging.env');
    }
    habitat.load('./config/defaults.env');

    var keys = Object.keys(process.env);
    var all = {};

    keys.forEach(function (key) {
        if (expose.indexOf(key) > -1) all[key] = habitat.get(key);
    });

    var string = 'module.exports = ' + JSON.stringify(all) + ';';
    return file('index.js', string)
        .pipe(gulp.dest('./config'));
};


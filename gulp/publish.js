var gulp = require('gulp');

var fs = require('fs');
var file = require('./gulp-file');
var merge = require('merge-stream');
var handleErrors = require('./error');

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var templates = require('../lib/templates.json');
var json = templates[2];

module.exports = function () {
    var dest = './build/publish-assets';
    var browserified = browserify('./publish/index.js', {
        insertGlobals: false,
        transform: ['partialify', 'bulkify']
    });
    var js = browserified
        .bundle()
        .pipe(handleErrors())
        .pipe(source('index.js'))
        .pipe(buffer())
        .pipe(gulp.dest(dest));

    var html = gulp.src('./publish/index.html')
        .pipe(gulp.dest(dest));

    // Just for example
    var string = 'window.App=' + JSON.stringify(json) + ';';
    var app = file('app.js', string).pipe(gulp.dest(dest));

    return merge(js, html, app);
};

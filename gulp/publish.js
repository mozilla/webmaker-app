var gulp = require('gulp');
var browserify = require('gulp-browserify');
var fs = require('fs');
var file = require('gulp-file');
var merge = require('merge-stream');

var templates = require('../lib/templates.json');
var json = templates[2];

module.exports = function () {
    var dest = './build/publish-assets';
    var js = gulp.src('./publish/index.js')
        .pipe(browserify({
            insertGlobals: false,
            transform: ['partialify', 'bulkify']
        })).pipe(gulp.dest(dest));

    var html = gulp.src('./publish/index.html')
        .pipe(gulp.dest(dest));

    // Just for example
    var string = 'window.App=' + JSON.stringify(json) + ';';
    var app = file('app.js', string).pipe(gulp.dest(dest));

    return merge(js, html, app);
};

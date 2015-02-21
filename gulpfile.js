var gulp = require('gulp');
var webserver = require('gulp-webserver');
var sequence = require('run-sequence');

var config = require('./gulp/config');
var clean = require('./gulp/clean');
var downloadLocales = require('./gulp/download-locales');
var locale = require('./gulp/locale');
var template = require('./gulp/template');
var browserify = require('./gulp/browserify');
var less = require('./gulp/less');
var cache = require('./gulp/cache');
var publish = require('./gulp/publish');

var jshint = require('./gulp/jshint');
var jscs = require('./gulp/jscs');
var unit = require('./gulp/unit');

// Config
gulp.task('config', config);

// Prep and static assets
gulp.task('clean', clean);
gulp.task('locale', locale);
gulp.task('download-locales', downloadLocales)
gulp.task('build-locales', function (done) {
   sequence('download-locales', 'locale', done);
});
gulp.task('template', ['config'], template);
gulp.task('publish-assets', publish);
gulp.task('build-static', function (done) {
    sequence('clean', 'config', ['locale', 'publish-assets', 'template'], done);
});

// Browserify

// JS
var browserifyMain = browserify('./lib/index.js', './build/index.js');
var browserifyPublish = browserify('./publish/index.js', './build/publish-assets/index.js');

gulp.task('browserify', ['build-static'], browserifyMain);
gulp.task('browserify-publish', ['build-static'], browserifyPublish);

gulp.task('watchify', ['build-static'], browserify('./lib/index.js', './build/index.js', {sourceMaps: true, watch: true}));
gulp.task('watchify-publish', ['build-static'], browserify('./publish/index.js', './build/publish-assets/index.js', {sourceMaps: true, watch: true}));

// Less
gulp.task('less', less);
gulp.task('watch-less', ['less'], function () {
    gulp.watch('./{styles,components,blocks,views}/**/*.less', ['less']);
});

// Build
gulp.task('cache', cache);
gulp.task('build', function (done) {
    sequence('build-static', ['browserify', 'browserify-publish', 'less'], 'cache', done);
});

gulp.task('watch', function (done) {
    sequence('build-static', ['watchify', 'watchify-publish', 'watch-less'], 'cache', done);
});

// Test
gulp.task('jshint', jshint);
gulp.task('jscs', jscs);
gulp.task('lint', ['jshint', 'jscs']);
gulp.task('unit', ['build'], unit);
gulp.task('test', ['lint', 'unit']);

// Serve + Watch
gulp.task('dev', ['watch'], function() {
  return gulp.src('build')
    .pipe(webserver({
        host: '0.0.0.0',
        port: 8080,
        livereload: {
            port: 1520,
            enable: true
        },
        fallback: 'index.html'
    }));
});

var gulp = require('gulp');
var webserver = require('gulp-webserver');

var config = require('./gulp/config');
var clean = require('./gulp/clean');
var downloadLocales = require('./gulp/download-locales');
var locale = require('./gulp/locale');
var browserify = require('./gulp/browserify');
var less = require('./gulp/less');
var cache = require('./gulp/cache');
var publish = require('./gulp/publish');

var jshint = require('./gulp/jshint');
var jscs = require('./gulp/jscs');
var unit = require('./gulp/unit');

// Config
gulp.task('config', config);

// Build
gulp.task('clean', ['config'], clean);
gulp.task('download-locales', ['clean'], downloadLocales);
gulp.task('locale', ['download-locales'], locale);

gulp.task('less', ['clean'], less);
gulp.task('browserify', ['clean', 'locale'], browserify);
gulp.task('publish', ['less', 'locale'], publish);
gulp.task('build', ['less', 'browserify', 'publish'], cache);

gulp.task('re-locale', ['clean'], locale);
gulp.task('re-browserify', ['clean', 're-locale'], browserify);
gulp.task('re-publish', ['less', 're-locale'], publish);
gulp.task('re-build', ['less', 're-browserify', 're-publish'], cache);

// Test
gulp.task('jshint', jshint);
gulp.task('jscs', jscs);
gulp.task('lint', ['jshint', 'jscs']);
gulp.task('unit', ['re-build'], unit);
gulp.task('test', ['lint', 'unit']);

// Watch
gulp.task('watch', ['build'], function () {
    gulp.watch([
        './{blocks,components,lib,static,views,publish}/**/*.{js,json,less,html}',
        './locale/en_US/*.json',
        './config/*.env',
        '.env'
    ],['re-build']);
});

// Serve + Watch
gulp.task('dev', ['watch'], function() {
  gulp.src('build')
    .pipe(webserver({
        port: 8080,
        livereload: true,
        fallback: 'index.html'
    }));
});

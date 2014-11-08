var gulp = require('gulp');
var jshint = require('gulp-jshint');

module.exports = function () {
    return gulp.src('./{lib,blocks,components,views}/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
};

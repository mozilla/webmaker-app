var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

module.exports = function() {
    var src = gulp.src('./build/styles/common.less');
    var dest = gulp.dest('./build/styles');
    return src
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(dest)
        .pipe(gulp.dest('./build/publish-assets'));
};

var gulp = require('gulp');
var jscs = require('gulp-jscs');

module.exports = function () {
    return gulp.src('./{lib,blocks,components,views}/**/*.js')
        .pipe(jscs());
};

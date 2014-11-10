var gulp = require('gulp');
var browserify = require('gulp-browserify');

module.exports = function () {
    var src = gulp.src('./lib/index.js');
    var dest = gulp.dest('./build');

    return src.pipe(browserify({
        insertGlobals: false,
        transform: ['partialify', 'bulkify']
    })).pipe(dest);
};

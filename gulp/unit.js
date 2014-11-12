var gulp = require('gulp');
var exit = require('gulp-exit');
var mocha = require('gulp-mocha');

module.exports = function () {
    var src = gulp.src('./test/unit/*.js');
    return src.pipe(mocha({
        reporter: 'spec'
    })).pipe(exit());
};

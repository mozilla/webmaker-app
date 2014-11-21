var template = require('gulp-template');
var gulp = require('gulp');

module.exports = function () {
    var config = require('../config');
    return gulp.src('./static/index.html')
        .pipe(template(config))
        .pipe(gulp.dest('./build'));

};

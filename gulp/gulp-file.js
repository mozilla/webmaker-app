var gutil = require('gulp-util');
var stream = require('stream');

module.exports = function file(filename, string) {
  var src = stream.Readable({ objectMode: true });
  src._read = function () {
    this.push(new gutil.File({
        cwd: '',
        base: '',
        path: filename,
        contents: new Buffer(string)
    }));
    // End!
    this.push(null);
  };
  return src;
};

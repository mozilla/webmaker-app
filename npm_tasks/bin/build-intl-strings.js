var path = require('path');
var gaze = require('gaze');
var build = require('../build-intl-strings');

var SRC_DIR = path.join(__dirname, '../../app/src/main/res');
var OUTPUT_DIR = path.join(__dirname, '../../www_src/compiled/strings');
var DEFAULT_LANG = 'en';

var argv = require('minimist')(process.argv.slice(2), {
  default: {
    src: SRC_DIR,
    output: OUTPUT_DIR,
    defaultLang: DEFAULT_LANG
  }
});

if (argv.watch) {
  build(argv);
  console.log('Watching strings.xml...');
  gaze(argv.src + '/**/strings.xml', function () {
    this.on('all', function () {
      console.log('Rebuilding strings');
      build(argv);
    });
  });
} else {
  console.log('Building strings...')
  build(argv);
  console.log('Done.');
}

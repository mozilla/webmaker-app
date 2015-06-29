var fs = require('fs-extra');
var path = require('path');
var getPages = require('./get-pages');
require('colors');

// For the command line utility, look in npm_tasks/bin
module.exports = function (options) {
  options = options || {};
  var baseDir = options.baseDir || './app/src/main/assets/www/pages/';
  var template = options.template || fs.readFileSync('./node_modules/webmaker-core/html/index.html', {encoding: 'utf-8'});
  var pages = getPages();
  pages.forEach(function (page) {
    var html = template.replace('{{ js_src }}', '../../js/' + page + '.bundle.js');
    fs.outputFileSync(path.join(baseDir, page, '/index.html'), html);
  });
  console.log(('Built html for pages: ' + pages.join(', ') + '\n').green);
};

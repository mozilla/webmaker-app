var fs = require('fs-extra');
var PAGES_DIR = './node_modules/webmaker-core/pages/';
var path = require('path');

module.exports = function (pagesDir) {
  pagesDir = pagesDir || PAGES_DIR;
  var pages = fs.readdirSync(pagesDir);
  return pages.filter(function (page) {
    var dirPath = path.join(pagesDir, page);
    if (!fs.statSync(dirPath).isDirectory()) return false;
    if (fs.readdirSync(dirPath).indexOf(page + '.jsx') === -1) return false;
    return true;
  });
}

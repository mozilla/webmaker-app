var parse = require('xml-parser');
var fs = require('fs-extra');
var path = require('path');

function parseFile(raw) {
  var xml = parse(raw);
  var strings = xml.root && xml.root.children;
  var messages = {};
  if (!strings) {
    return messages;
  }
  strings.forEach(function (string) {
    var name = string.attributes && string.attributes.name;
    var content = string.content;
    if (!name || !content) {
      return;
    }
    messages[name] = content;
  });
  return messages;
}

module.exports = function(options) {
  var stringDirs = [];

  fs.readdirSync(options.src).forEach(function (dir) {
    var stats = fs.statSync(path.join(options.src, dir));
    if (dir.indexOf('values') === 0 && stats.isDirectory()) {
      fs.readdirSync(path.join(options.src, dir)).forEach(function (filename) {
        if (filename === 'strings.xml' && stringDirs.indexOf(dir) === -1) {
          stringDirs.push(dir);
        }
      });
    }
  });

  fs.removeSync(options.output);

  stringDirs.forEach(function (dir) {
    var raw = fs.readFileSync(path.join(options.src, dir, 'strings.xml'), 'utf8');
    var messages = parseFile(raw);
    var outputName = dir.replace('values', '') || options.defaultLang;
    fs.outputFileSync(path.join(options.output, outputName, 'strings.json'), JSON.stringify(messages), 'utf8');
  });
};

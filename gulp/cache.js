var Appcache = require('node-appcache-generator');
var fs = require('fs');
var gulp = require('gulp');

module.exports = function (callback) {
    var cache = new Appcache.Generator(
        null,
        ['*', 'http://*' ,'https://*'],
        ['/', 'fallback.html'],
        null
    );

    cache.generateFromDir('./build', function (err, content) {
        if (err) return callback(err);
        fs.writeFile('./build/manifest.appcache', content, callback);
    });
};

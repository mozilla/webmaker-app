var Appcache = require('node-appcache-generator');
var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');

module.exports = function (callback) {

    glob(
        '**/*.{html,js,css,png,jpg,svg,gif,woff}',
        {cwd: './build'},
        function (err, files) {
            if (err) return callback(err);
            var cache = new Appcache.Generator(
                files,
                ['*', 'http://*' ,'https://*'],
                ['/', 'fallback.html'],
                null
            );

            cache.generateFromDir('./build', function (err, content) {
                if (err) return callback(err);
                fs.writeFile('./build/manifest.appcache', content, callback);
            });
        }
    );
};

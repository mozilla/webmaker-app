var localforage;
try {
    localforage = require('localforage');
} catch (require_error) {
    console.log('localforage not loaded');
}

var URLCache = {};

module.exports = {
    getFile: function (key, callback) {
        // Do we already have a blob URL that we can use?
        if (URLCache[key]) {
            return process.nextTick(function () {
                callback(null, URLCache[key]);
            });
        }

        localforage.getItem(key, function (err, file) {
            if (!file) {
                return callback();
            }

            var blob_url = URL.createObjectURL(file);
            URLCache[key] = blob_url;

            callback(null, blob_url);
        });
    },
    putFile: function (key, file, callback) {
        // Do we already have a blob URL that we can use?
        if (URLCache[key]) {
            return process.nextTick(function () {
                callback(null, URLCache[key]);
            });
        }

        localforage.setItem(key, file, function (error, stored_file) {
            var blob_url = URL.createObjectURL(stored_file);
            URLCache[key] = blob_url;

            callback(null, blob_url);
        });
    }
};

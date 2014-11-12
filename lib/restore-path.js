var page = require('page');

module.exports = function (options) {
    options = options || {};

    var history = options.history;
    var offline = options.offline;
    var pathname = options.pathname || global.location.pathname;

    var defaultPath = '/templates';
    var coldStart = ['/', '/index.html'];
    var noRestore = offline ? coldStart : coldStart.concat(['/sign-in']);

    function isAllowed(path) {
        return noRestore.indexOf(path) === -1;
    }

    // Don't restore if pathname is allowed.
    if (isAllowed(pathname)) return;

    // Restore from history... but not if history is in noRestore
    var message;
    if (history && isAllowed(history)) {
        message = '[Loader] You visited ' +
            pathname +
            '; redirecting to your history, ' +
            history;
        console.log(message);
        page(history);
    } else {
        message = '[Loader] You visited ' +
            pathname +
            '; redirecting to ' +
            defaultPath;
        console.log(message);
        page(defaultPath);
    }

};

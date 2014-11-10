var WebmakerLogin = require('webmaker-login-ux');
var config = require('../config');

module.exports = function () {
    var auth = new WebmakerLogin({
        host: config.LOGIN_URL,
        showCTA: false
    });
    return auth;
};

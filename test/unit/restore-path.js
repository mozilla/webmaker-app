var assert = require('assert');
var mockrequire = require('mockrequire');
var restorePath = mockrequire('../../lib/restore-path', {
    page: function (path) {
        appPath = path;
    }
});

// Store the app's current path so we can check it.
var appPath;

describe('restorePath', function () {
    beforeEach(function () {
        appPath = '';
    });
    it('should restore / to /templates if there is no history', function () {
        restorePath({pathname: '/'});
        assert.equal(appPath, '/templates');
    });
    it('should restore / to history if it exists', function () {
        restorePath({pathname: '/', history: '/profile'});
        assert.equal(appPath, '/profile');
    });
    it('should not modify the appPath when path is /discover', function () {
        appPath = '/discover';
        restorePath({pathname: appPath, history: '/profile'});
        assert.equal(appPath, '/discover');
    });
    it('should redirect /sign-in to history or default /templates', function () {
        var path = '/sign-in'
        restorePath({pathname: path, history: '/profile'});
        assert.equal(appPath, '/profile');
        restorePath({pathname: path});
        assert.equal(appPath, '/templates');
    });
});

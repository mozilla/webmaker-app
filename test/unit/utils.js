window = {};

var assert = require('assert');
var utils = require('../../lib/utils');

var testArray = [
    {name: 'kate'},
    {name: 'andrew'}
];

describe('utils', function () {
    describe('findIndexInArray', function () {
        it('should find the index of an obj in an array', function () {
            assert.equal(utils.findInArray(testArray, 'name', 'kate'), 0);
        });
        it('should return undefined if obj not found', function () {
            var a = utils.findInArray(testArray, 'name', 'bobby');
            var b = utils.findInArray(testArray, 'NAME', 'andrew');
            assert.equal(a, undefined);
            assert.equal(b, undefined);
        });
    });

    describe('shadeColor', function () {
        it('should lighten a colour by 10%', function () {
            assert.equal(utils.shadeColor('#888888', 10), '#a2a2a2');
        });
        it('should darken a colour by 10%', function () {
            assert.equal(utils.shadeColor('#888888', -10), '#6f6f6f');
        });
        it('should stop at #000000 and #FFFFFF', function () {
            assert.equal(utils.shadeColor('#000000', -50), '#000000');
            assert.equal(utils.shadeColor('#ffffff', 50), '#ffffff');
        });
    });

});

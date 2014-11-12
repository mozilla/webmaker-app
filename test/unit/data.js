var assert = require('assert');
var Data = require('../../lib/data');

var data = new Data('000d1745-5d3c-4997-ac0c-15df68bbbecz');

describe('Data', function () {
    describe('interface', function () {
        it('should expose expected objects', function () {
            assert.equal(typeof data.appId, 'string');
            assert.equal(typeof data.collectedData, 'object');
        });

        it('should expose expected functions', function () {
            assert.equal(typeof data.collect, 'function');
            assert.equal(typeof data.save, 'function');
            assert.equal(typeof data.getAllDataSets, 'function');
        });
    });
    
    describe('collect', function () {
        
        var label = 'Foo';
        var index = 1;
        var value = 'Bar';
        
        data.collect(index, value, label);
        
        it('should store given label at given index', function () {
            assert.equal(data.collectedData[index]['label'], label);
        });
        
        it('should store internaleIndex at given index', function () {
            assert.equal(data.collectedData[index]['internalIndex'], label.replace(/ /g, '').toLowerCase() + '_' + index);
        });
        
        it('should store given value at given index', function () {
            assert.equal(data.collectedData[index]['value'], value);
        });
    });
    
    // describe('getAllDataSets', function () {
        
    //     var result = data.getAllDataSets();
        
    //     it('should return array', function () {
    //         assert.equal(result instanceof Array, true);
    //     });
        
    //     it('returned array contains only objects and no arrays', function () {
    //         for (var i = 0; i < result.length; i++) {
    //             assert.equal(typeof result[i], 'object');
    //             assert.equal(result[i] instanceof Array, false);
    //         }
    //     });
        
    //     it('objects in returned array have a property named dataBlocks of type array', function () {
    //         for (var i = 0; i < result.length; i++) {
    //             assert.equal(result[i].dataBlocks instanceof Array, true);
    //         }
    //     });
        
    //     it('dataBlocks should be of type Array', function () {
    //         for (var i = 0; i < result.length; i++) {
    //             assert.equal(result[i].dataBlocks instanceof Array, true);
    //         }
    //     });
    // });
});

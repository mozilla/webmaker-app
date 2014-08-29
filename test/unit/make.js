window = {};

var assert = require('assert');
var Make = require('../../lib/make');

var id = '000d1745-5d3c-4997-ac0c-15df68bbbecz';
var instance = new Make(id);

describe('Make', function () {
    describe('instance', function () {
        it('should exist', function () {
            assert.equal(typeof instance, 'object');
            assert.equal(typeof instance.app, 'object');
        });

        it('should include the expected metadata', function () {
            assert.equal(instance.app.id, id);
            assert.equal(instance.app.name, 'Sample App');
        });
    });

    describe('insert', function () {
        instance.insert('image');
        instance.insert('headline');
        instance.insert('paragraph');

        it('should include the inserted blocks', function () {
            assert.equal(instance.app.blocks.length, 3);
        });

        it('should be in the correct order', function () {
            var types = [];
            for (var i = 0; i < instance.app.blocks.length; i++) {
                types.push(instance.app.blocks[i].id);
            }
            assert.deepEqual(types, ['paragraph', 'headline', 'image']);
        });
    });

    describe('update', function () {
        instance.update(0, [
            {
                id: 'innerHTML',
                label: 'Text',
                type: 'string',
                value: 'Hello World'
            },
            {
                id: 'color',
                label: 'Color',
                type: 'color',
                value: '#f00'
            }
        ]);

        it('should update the block attributes', function () {
            assert.equal(
                instance.app.blocks[0].attributes[0].value,
                'Hello World'
            );
        });
    });
});

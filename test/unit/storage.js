var mockrequire = require('mockrequire');
var assert = require('assert');

var templates = require('../../lib/templates.json');
var mockId = '000d1745-5d3c-4997-ac0c-15df68bbbecz';
var mockId2 = '123123123';

function Fb(id) {
    this._id = id;
};
Fb.prototype.key = function () {
    return this._id;
};
Fb.prototype.on = function () {};
Fb.prototype.once = function () {};
Fb.prototype.update = function () {};
Fb.prototype.remove = function () {};
Fb.prototype.push = function (data) {
   var fb = new Fb(mockId2);
   fb._val = data;
   return fb;
};
Fb.prototype.child = function () {
    return new Fb();
};

var mockModelInstance = {
    data: { session: { user: {
        id: 1,
        username: 'kate'
    } } }
};
var mockModel = function() {
    return mockModelInstance;
};

// blocks doesn't frickin work because we can't require html files *cries*
var mockBlocks = function (id) {
    this.text = {
        type: 'text',
        className: 'text',
        template: '<p></p>',
          name: 'Text',
          icon: 'images/blocks_text.png',
          attributes: {
              innerHTML: {
                  label: 'Text',
                  type: 'string',
                  value: 'I am a Headline'
              },
              color: {
                  label: 'Color',
                  type: 'color',
                  value: '#333444'
              }
          }
    };
};

var Storage = mockrequire('../../lib/storage', {
    './model': mockModel,
    './blocks': mockBlocks,
    'firebase': Fb,
    'clone': require('clone'),
    './i18n': {
        get: function(key) {
            return key;
        }
    }
});

var mockEvents = [];
var mockVm = {
    $broadcast: function (eventName, data) {
        mockEvents.push({
            name: eventName,
            data: data
        });
    }
};


describe('Storage', function () {

    var storage = new Storage(mockVm);

    describe('#_log', function () {
        it('should be a function', function () {
            assert.equal(typeof storage._log, 'function');
        });
    });
    describe('#processSnapshot', function () {
        it('should be a function', function () {
            assert.equal(typeof storage.processSnapshot, 'function');
        });
        it('should return a data object given a Fb snapshot', function () {
            var snapshot = {
                key: function () { return '123'; },
                val: function() { return { name: 'Hello world' }; }
            };
            var result = storage.processSnapshot(snapshot)
            assert.equal(typeof storage.processSnapshot, 'function');
            assert.equal(result.id, 123);
            assert.equal(result.name, 'Hello world');
        });
    });
    describe('#_createAppRef -> App', function () {
        var app = storage._createAppRef(mockId);
        describe('interface', function () {
            it('should have expected properties', function () {
                assert.equal(app.id, mockId);
                assert.equal(app.data, null);
                assert(app.firebase instanceof Fb);
            });

            it('should have expected functions', function () {
                assert.equal(typeof app.insert, 'function');
                assert.equal(typeof app.remove, 'function');
                assert.equal(typeof app.update, 'function');
                assert.equal(typeof app.updateBlock, 'function');
                assert.equal(typeof app.removeApp, 'function');
            });
        });

        describe('insert', function () {
            it('should insert a block', function () {
                app.insert('text');
                //assert.equal(blocks[0].type, 'text');
            });
            it('should do nothing if the blockId does not exist', function () {
                app.insert('banana');
                //assert.equal(blocks.length, oldLength)
            });
        });

        describe('remove', function () {
            it('should remove a block', function () {
                app.remove(0);
                //assert.equal(blocks.length, 1);
            });
            it('should do nothing if the block index does not exist', function () {
                app.remove(100);
                //assert.equal(blocks.length, oldLength);
            });
        });
    });

    describe('#_removeAppRef', function () {
        it('should be a function', function () {
            assert.equal(typeof storage._removeAppRef, 'function');
        });
    });

    describe('#setQuery', function () {
        it('should be a function', function () {
            assert.equal(typeof storage.setQuery, 'function');
        });
    });

    describe('#unsetQuery', function () {
        it('should be a function', function () {
            assert.equal(typeof storage.unsetQuery, 'function');
        });
    });

    describe('#getApps', function () {
        it('should be a function', function () {
            assert.equal(typeof storage.getApps, 'function');
        });
        it('should return an empty array if there are no apps', function () {
            assert.deepEqual(storage.getApps(), []);
        });
    });

    describe('#getApp', function () {
        it('should be a function', function () {
            assert.equal(typeof storage.getApp, 'function');
        });
        it('should return an app reference', function () {
            var app = storage.getApp(mockId);
            assert.equal(app.id, mockId);
            assert.equal(app.data, null);
            assert(app.firebase instanceof Fb);
        });
    });

    describe('#createApp', function () {
        it('should be a function', function () {
            assert.equal(typeof storage.createApp, 'function');
        });
        it('should return undefined when no template or data is passed in', function () {
            assert.equal(typeof storage.createApp(), 'undefined');
            assert.equal(typeof storage.createApp({template: 'notrealid'}), 'undefined');
        });
        it('should return an app instance for valid template id', function () {
            var template = templates[2];
            var app = storage.createApp({template: template.id, name: 'Bob is my cat'});
            assert.ok(app.id && app.id !== template.id);
            assert.equal(app.data, null);
        });
    });
});

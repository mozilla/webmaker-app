var clone = require('clone');

function App(appref, id, fbRef, data, _firebase, _newBlock) {
  this.appref = appref;
  this.id = id;
  this.data = data || null;
  this.firebase = fbRef || _firebase.child(id);
  this.firebase.on('value', this.broadcast, this);
  this.newBlock = _newBlock;
}

App.prototype = {
  broadcast: function (snapshot) {
    this.data = this.appref.processSnapshot(snapshot);
    this.appref._vm.$broadcast(snapshot.key(), this.data);
  },

  update: function (properties) {
    properties = JSON.parse(JSON.stringify(properties));
    this.firebase.update(properties, this.appref._onSync);
  },

  updateBlock: function (id, properties) {
    properties = JSON.parse(JSON.stringify(properties));
    this.firebase.child('blocks/' + id).update(properties, this.appref._onSync);
  },

  insert: function (type) {
    var block = this.newBlock(type);
    if (!block) {
      console.error('Block type ' + type + ' not found.');
      return;
    }
    var ref = this.firebase.child('blocks');
    ref.once('value', function (snapshot) {
      var blocks = snapshot.val() || [];
      blocks.unshift(block);
      ref.set(blocks);
    });
  },

  remove: function (blockIndex) {
    var ref = this.firebase.child('blocks');

    var msg = 'Block with index ' + blockIndex + ' does not exist.';
    ref.once('value', function (snapshot) {
      var blocks = snapshot.val();
      if (!blocks[blockIndex]) {
        console.error(msg);
        return;
      }
      blocks.splice(blockIndex, 1);
      ref.set(blocks, this.appref._onSync);
    });
  },

  duplicate: function (blockIndex) {
    var ref = this.firebase.child('blocks');

    var msg = 'Block with index ' + blockIndex + ' does not exist.';
    ref.once('value', function (snapshot) {
      var blocks = snapshot.val();
      if (!blocks[blockIndex]) {
        console.error(msg);
        return;
      }

      blocks.splice(blockIndex, 0, clone(blocks[blockIndex]));
      ref.set(blocks, this.appref._onSync);
    });
  },

  move: function (blockIndex, steps) {
    var ref = this.firebase.child('blocks');

    ref.once('value', function (snapshot) {
      var blocks = snapshot.val();

      if (blockIndex + steps < 0) {
        console.error('Can\'t move block to negative position');
        return;
      }

      if (blockIndex + steps > blocks.length - 1) {
        console.error('Block is already at the end of the list');
        return;
      }

      if (!blocks[blockIndex]) {
        console.error('Block ' + blockIndex + ' doesn\'t exist.');
        return;
      }

      var blockToMove = blocks[blockIndex];

      // remove block from array
      blocks.splice(blockIndex, 1);

      // Put block in new array position
      blocks.splice(blockIndex + steps, 0, blockToMove);

      ref.set(blocks, this.appref._onSync);
    });
  },

  removeApp: function () {
    this.firebase.remove(this.appref._onSync);
    this.appref._removeAppRef(this.id);
  }
};

module.exports = App;

var Firebase = require('firebase');
var config = require('../config');

function Data (appId) {
    var self = this;

    self.appId = appId;
    self.collectedData = {};
    self.collectedDataSaved = false;

    self.firebaseConnection = new Firebase(config.FIREBASE_URL + '/' + appId);

    self._logger = function (prefix, msg) {
        if (typeof msg === 'undefined') {
            msg = prefix;
            prefix = 'Data';
        }

        if (msg) console.log('[' + prefix + '] ' + msg);
    };

    if (self.firebaseConnection.getAuth() === null) {
        self.firebaseConnection.authAnonymously(function (error, authData) {
            if (error) {
                self._logger('auth with FireBase failed: ', authData);
            } else {
                self._logger('auth with FireBase');
            }
        });
    } else {
        self._logger('skipping auth with FireBase');
    }
}

Data.prototype.collect = function (index, value, label) {
    var self = this;
    self._logger('collected some Data');

    // create object for index if it does not exist already
    if (typeof self.collectedData[index] === 'undefined') {
        self.collectedData[index] = {blockIndex: index};
    }

    // check for collection labels (true if exists)
    var colLabel = typeof label !== 'undefined';
    var locLabel = typeof self.collectedData[index].label !== 'undefined';

    if ((!colLabel && !locLabel) || colLabel) {
        if ((!colLabel && !locLabel) || label === '') {
            self.collectedData[index].label = 'unnamed';
        } else if (colLabel) {
            self.collectedData[index].label = label;
        }

        // label changed / update internalIndex
        var newLabel = self.collectedData[index].label;
        newLabel = newLabel.replace(/ /g, '').toLowerCase();
        self.collectedData[index].internalIndex = newLabel + '_' + index;
    }

    // set new value
    self.collectedData[index].value = value;
};

Data.prototype.save = function () {
    var self = this;

    if (self.collectedDataSaved === false) {
        self._logger('save');

        self.collectedDataSaved = true;
        self.firebaseConnection.push({
            submitted: Date.now(),
            dataBlocks: self.collectedData
        });
    }
};

Data.prototype.getCurrentCollectedCount = function () {
    var self = this;

    return Object.keys(self.collectedData).length;
};

Data.prototype.getAllDataSets = function (callback) {
    var self = this;

    self.firebaseConnection.on('value', function (dataSnapshot) {
        self._logger('received data sets for current app');

        var dataSets = [];
        if (dataSnapshot !== null) {
            dataSnapshot = dataSnapshot.val();

            for (var i in dataSnapshot) {
                if (dataSnapshot.hasOwnProperty(i)) {
                    dataSnapshot[i].firebaseId = i;
                    dataSets.push(dataSnapshot[i]);
                }
            }
        }

        callback(dataSets);
    });
};

Data.prototype.delete = function (firebaseId) {
    var self = this;

    self._logger('deleted child ' + firebaseId);
    self.firebaseConnection.child(firebaseId).remove();
};

module.exports = Data;

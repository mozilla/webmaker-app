module.exports = {
    // Returns index of an object in arr containing key and val
    findIndexInArray: function (arr, key, val) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i][key] === val) {
                return i;
            }
        }
    },
    // Like findIndexInArray, but returns actual object reference
    findInArray: function (arr, key, val) {
        var index = this.findIndexInArray(arr, key, val);
        return arr[index];
    },
    // Note: all colors are outputted as lowercase hex.
    shadeColor: function (color, percent) {
        var num = parseInt(color.slice(1), 16);
        var amt = Math.round(2.55 * percent);
        var R = (num >> 16) + amt;
        var G = (num >> 8 & 0x00FF) + amt;
        var B = (num & 0x0000FF) + amt;
        /* jshint ignore:start */
        // jscs:disable
        return ('#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1)).toLowerCase();
        /* jshint ignore:end */
        // jscs:enable
    }
};

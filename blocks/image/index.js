var cache = require("../../lib/local-cache");

module.exports = {
    className: 'image',
    template: require('./index.html'),
    data: {
        name: 'Image',
        icon: 'images/blocks_image.png',
        attributes: {
            // Because editors are per-attribute, I need to create an unused
            // image attribute and overload it with the actual attributes I'm
            // using (hash, url)
            image: {
                label: 'Image',
                type: 'image',
                value: '',
                skipAutoRender: true,
                hash: '',
                url: 'images/placeholder.png'
            }
        }
    },
    ready: function () {
        var element = this.$el.querySelector('img');

        if (this.$data.attributes.image.hash) {
            cache.getFile('image/' + this.$data.attributes.image.hash,
                function (error, url) {
                if (!url) {
                    element.src = this.$data.attributes.image.url;
                    return;
                }

                element.src = url;
            }.bind(this));
            return;
        }

        element.src = this.$data.attributes.image.url;
    }
};

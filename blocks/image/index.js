var cache = require("../../lib/local-cache");

module.exports = {
    className: 'image',
    template: require('./index.html'),
    data: {
        name: 'Image',
        icon: 'images/blocks_image.png',
        attributes: {
            // Because editors are per-attribute, I need to create an unused image
            // attribute and overload it with the actual attributes I'm using (hash, url)
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
    ready: function() {
        console.log(this.$data.attributes.image);
        if (this.$data.attributes.image.hash) {
            cache.getFile('image/' + this.$data.attributes.image.hash, function(error, url) {
                // url is always defined and defaults to the placeholder image
                if (!url) {
                    this.$el.querySelector('img').src = this.$data.attributes.image.url;
                    return;
                }

                this.$el.querySelector('img').src = url;
            }.bind(this));
            return;
        }

        this.$el.querySelector('img').src = this.$data.attributes.image.url;
    }
};

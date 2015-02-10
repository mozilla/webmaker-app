var cache = require("../../../lib/local-cache");
var Rusha = require("rusha");

var rusha_hash = new Rusha();

var get_image_from_input = function (callback) {
    var input = document.querySelector('input[name="hiddenfilepicker"]');
    input.addEventListener('change', function onChangeFileInput(e) {
        input.removeEventListener('change', onChangeFileInput);

        if (input.files.length > 0) {
            return callback(null, input.files[0]);
        }
        callback();
    });
    input.click();
};

var convert_file_to_arraybuffer = function (file, callback) {
    var fr = new FileReader();
    fr.addEventListener('load', function fileReaderGonnaRead(e) {
        fr.removeEventListener('load', fileReaderGonnaRead);

        callback(null, fr.result);
    });
    fr.readAsArrayBuffer(file);
};

var set_image_display = function (element, url) {
    element.style.backgroundImage = 'url("' + url + '")';
};

module.exports = {
    id: 'image-editor',
    template: require('./index.html'),
    methods: {
        stopPropagation: function (e) {
            e.stopPropagation();
        },
        getImage: function (e, sourceType) {
            e.preventDefault();

            var self = this;

            get_image_from_input(function (input_error, file) {
                // If the user cancelled the image selection
                if (!file) {
                    return;
                }

                // Hash the image and store it in local storage
                convert_file_to_arraybuffer(file, function (err, arraybuffer) {
                    var hash = rusha_hash.digest(arraybuffer);
                    var key = 'image/' + hash;

                    cache.putFile(key, file, function (error, blob_url) {
                        set_image_display(
                            self.$el.querySelector('.image-picker-frame'),
                        blob_url);
                        self.$data.hash = hash;
                        self.$data.editorOpen = false;
                    });
                });
            });
        },
        openEditor: function (e) {
            e.preventDefault();
            this.$data.editorOpen = true;
        },
        cancelEditor: function (e) {
            e.preventDefault();
            this.$data.editorOpen = false;
        }
    },
    data: {},
    ready: function () {
        var element = this.$el.querySelector('.image-picker-frame');

        if (this.$data.hash) {
            cache.getFile('image/' + this.$data.hash, function (error, url) {
                // url is always defined and defaults to the placeholder image
                if (!url) {
                    set_image_display(element, this.$data.url);
                    return;
                }

                set_image_display(element, url);
            }.bind(this));
            return;
        }

        set_image_display(element, this.$data.url);
    }
};

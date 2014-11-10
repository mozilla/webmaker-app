module.exports = {
    className: 'text',
    template: require('./index.html'),
    data: {
        name: 'Text',
        icon: '/images/blocks_text.png',
        attributes: {
            innerHTML: {
                label: 'Text',
                type: 'string',
                value: 'I am some text'
            },
            color: {
                label: 'Color',
                type: 'color',
                value: '#333444'
            },
            'font-size': {
                label: 'Font Size',
                type: 'font-size',
                value: '14'
            }
        }
    },
    // If we have multi-line text content, split it over several
    // paragraphs, preserving the user-intended line breaks.
    attached: function () {
        var data = this.$data.attributes.innerHTML.value;
        if (!!data) {
            data = data.trim();
            if (data.indexOf('\n') > -1) {
                var chunks = data.split('\n');
                this.$el.innerHTML = '';
                chunks.forEach(function (chunk) {
                    var p = document.createElement('p');
                    if (!!chunk) {
                        p.textContent = chunk;
                    } else {
                        p.innerHTML = '&nbsp;';
                    }
                    this.$el.appendChild(p);
                }.bind(this));
            }
        }
    }
};

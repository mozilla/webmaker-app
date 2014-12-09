module.exports = {
    className: 'phone',
    template: require('./index.html'),
    data: {
        name: 'Phone',
        icon: '/images/blocks_phone.png',
        attributes: {
            number: {
                label: 'Phone #',
                type: 'string',
                value: '+18005555555'
            },
            innerHTML: {
                label: 'Label',
                type: 'string',
                value: 'Place call'
            }
        }
    },
    created: function () {
        var self = this;

        // Set telephone URI
        self.$data.tel = 'tel:' + self.$data.attributes.number.value;

        // Disable if editing mode
        self.$data.onClick = function (e) {
            if (self.isEditing) e.preventDefault();
        };
    }
};

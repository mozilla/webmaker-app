module.exports = {
    className: 'phone',
    template: require('./index.html'),
    data: {
        name: 'phone',
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
};

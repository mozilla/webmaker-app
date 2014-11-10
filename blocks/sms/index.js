module.exports = {
    className: 'sms',
    template: require('./index.html'),
    data: {
        name: 'SMS',
        icon: '/images/blocks_sms.png',
        attributes: {
            value: {
                label: 'Phone #',
                type: 'string',
                value: '+18005555555'
            },
            messageBody: {
                label: 'Message',
                type: 'string',
                value: ''
            },
            innerHTML: {
                label: 'Label',
                type: 'string',
                value: 'Send SMS'
            }
        }
    },
    ready: function () {
        var self = this;
        self.$el.addEventListener('click', function (e) {
            if (self.isEditing) return;
            e.preventDefault();

            var number = self.$data.attributes.value.value;
            var body = self.$data.attributes.messageBody.value;
            window.location = 'sms:' + number + '?body=' + body;
        });
    }
};

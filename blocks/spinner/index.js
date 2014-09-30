module.exports = {
    className: 'spinner',
    template: require('./index.html'),
    data: {
        name: '+/- Button',
        icon: '/images/blocks_text.png',
        attributes: {
			min: {
				label: 'Minimum Number',
				type: 'number',
				value: '0',
				skipAutoRender: true
			},
			max: {
				label: 'Maximum Number',
				type: 'number',
				value: '100',
				skipAutoRender: true
			},
			step: {
				label: 'Steps when incrementing / decrementing',
				type: 'number',
				value: '1',
				skipAutoRender: true
			},
			label: {
				label: 'Label',
				type: 'string',
				value: 'I am your Label',
				skipAutoRender: true
			}
        }
    },
	ready: function() {
		var self = this;

		if(self.$parent.$parent.$data.params.mode !== 'play') {
			self.$el.querySelector('input').disabled = 'disabled';
		}
	}
};

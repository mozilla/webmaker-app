module.exports = {
    className: 'input-block',
    template: require('./index.html'),
    data: {
        name: 'Input',
        icon: '/images/blocks_text.png',
        attributes: {
			value: {
				label: 'Value',
				type: 'string',
				value: 'Default Value',
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
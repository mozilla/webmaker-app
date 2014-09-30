module.exports = {
    className: 'submit',
    template: require('./index.html'),
    data: {
        name: 'Submit',
        icon: '/images/blocks_text.png',
        attributes: {
			innerHTML: {
				label: 'Label',
				type: 'string',
				value: 'Submit Data'
			}
		}
    }
};

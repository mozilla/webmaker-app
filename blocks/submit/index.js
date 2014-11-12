module.exports = {
    className: 'submit',
    template: require('./index.html'),
    data: {
        name: 'Submit',
        icon: '/images/blocks_submit.png',
        attributes: {
			innerHTML: {
				label: 'Button Text',
				type: 'string',
				value: 'Submit',
                skipAutoRender: true
			},
            color: {
                label: 'Button Color',
                type: 'color',
                value: '#32B2D2',
                skipAutoRender: true
            }
		}
    },
	methods: {
		save: function(e) {
			var self = this;

			self.$dispatch('dataSave');
		}
	},
	created: function() {
		var self = this;

		self.$on('dataSaveSuccess', function() {
			self.$el.querySelector('button').disabled = 'disabled';
			self.$el.querySelector('button').style.pointerEvents = 'none';
			self.$el.querySelector('button').innerHTML = 'Data submitted!';
		});
	}
};

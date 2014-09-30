var Vue = require('vue');

module.exports = Vue.extend({
    created: function () {
        var attrs = this.$data.attributes;
        var target = this.$el.firstChild;

        for (var id in attrs) {
            if (attrs.hasOwnProperty(id) && attrs[id].skipAutoRender !== true) {
				target.setAttribute(id, attrs[id].value);

                switch (id) {
                case 'innerHTML':
                    target.innerHTML = attrs[id].value;
                    break;
                case 'color':
                    target.style.color = attrs[id].value;
                    break;
                case 'font-size':
                    target.style.fontSize = attrs[id].value + 'px';
                }
            }
        }
    }
});

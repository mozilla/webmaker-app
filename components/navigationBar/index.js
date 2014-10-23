var i18n = require('../../lib/i18n');

module.exports = {
    id: 'navigationBar',
    template: require('./index.html'),
    created : function(){
      var confirmAttribute = this.$el.getAttribute("confirmLabel");
      this.confirmLabel = i18n.get(confirmAttribute) || i18n.get("Done");
    },
    data: {
        goBack: function (e) {
            e.preventDefault();
            global.history.back();
        }
    }
};

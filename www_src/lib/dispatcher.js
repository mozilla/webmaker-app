module.exports = {
  fire: function (eventName, eventData) {
    var customEvent = new CustomEvent(eventName, {
      detail: eventData
    });

    window.dispatchEvent(customEvent);
  },
  on: function (eventName, callback) {
    window.addEventListener(eventName, function(e) {
      callback.call(this, e.detail);
    });
  }
};

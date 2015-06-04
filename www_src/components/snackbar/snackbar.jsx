var React = require('react/addons');

var Snackbar = React.createClass({
  getInitialState: function() {
    return {
      message: this.props.message,
      hidden: true
    };
  },
  render: function () {
    var className = "snackbar";
    if (this.state.hidden) {
      className = "hidden " + className;
    }
    return <div className={className}>{ this.state.message }</div>;
  },
  /**
   * Hide the snackbar from view
   */
  hide: function() {
    this.setState({
      hidden: true
    });
  },
  /**
   * Public API: show a message using the snackbar notification
   * system. This slides the message into view at the bottom of
   * the screen following the "snackbar" pattern from Material
   * Design, leaving the message up for 3 seconds before sliding
   * it back out of view.
   */
  showMessage: function(msg) {
    this.setState({
      message: msg,
      hidden: false
    }, function() {
      // TODO: ideally this is an event, but the duration is going
      //       to have to be hard coded *somewhere*, and it's probably
      //       best to keep that here, rather than in LESS code.
      setTimeout(_ => this.hide(), 3000);
    });
  }
});

module.exports = Snackbar;

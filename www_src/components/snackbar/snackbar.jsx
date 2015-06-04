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
  showMessage: function(msg) {
    this.setState({
      message: msg,
      hidden: false
    }, function() {
      setTimeout(() => {
        this.setState({
          hidden: true
        });
      }, 3000)
    });
  }
});

module.exports = Snackbar;

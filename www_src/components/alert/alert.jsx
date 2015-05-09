var React = require('react');

var Alert = React.createClass({
  getDefaultProps: function () {
    return {
      isVisible: false
    };
  },
  render: function () {
    return (
      <div className={'alert' + (this.props.isVisible ? '' : ' hidden') }>
        <div className="hidden dismiss"></div>
        <span className="text">{this.props.children}</span>
        <div onClick={this.hide} className="dismiss"></div>
      </div>
    );
  }
});

module.exports = Alert;

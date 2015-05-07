"use strict";

var React = require("react");

var Header = React.createClass({
  getInitialState: function() {
    return {
      value: this.props.value || ""
    };
  },

  render: function() {
    return <p>{this.state.value}</p>;
  },

  handleTap: function(diff) {
    console.log("tap tap tap "+diff);
    if (diff < 150) {
      var newtext = window.prompt("Enter Text", this.state.value);
      if (newtext && newtext !== this.state.value) {
        this.setState({
          value: newtext.trim()
        });
      }
    }
  }
});

module.exports = Header;

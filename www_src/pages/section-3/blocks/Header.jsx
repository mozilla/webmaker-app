"use strict";

var React = require("react");

var Header = React.createClass({
  getInitialState: function() {
    return {
      value: this.props.value || ""
    };
  },

  render: function() {
    return <h1>{this.state.value}</h1>;
  }
});

module.exports = Header;

"use strict";

var React = require("react");

var Image = React.createClass({
  getInitialState: function() {
    return {
      src: this.props.src || "",
      alt: this.props.alt || ""
    };
  },
  render: function() {
    return <img src={this.state.src} alt={this.state.alt} />
  }
});

module.exports = Image;

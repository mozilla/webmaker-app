"use strict";

var React = require("react");
var classes = require("classnames");

var Positionable = React.createClass({

  getInitialState: function() {
    var initial = {
      x: this.props.x || 0,
      y: this.props.y || 0,
      scale: this.props.scale || 1,
      angle: this.props.angle || 0,
      xoffset: this.props.parentWidth >>> 1 || 0,
      yoffset: this.props.parentHeight >>> 1 || 0,
      zIndex: (typeof this.props.zIndex !== "undefined") ? this.props.zIndex : 1,
      interactive: (typeof this.props.interactive !== "undefined") ? this.props.interactive : true,
      touchactive: false
    };
    return initial;
  },

  componentDidMount: function() {
    if(!this.state.interactive) return;
    var touchHandler = this.touchhandler = require("../../lib/touchhandler")(this);
    var dnode = this.getDOMNode();
    dnode.addEventListener("mousedown", touchHandler.startmark);
    dnode.addEventListener("mousemove", touchHandler.panmove);
    dnode.addEventListener("mouseup", touchHandler.endmark);

    // touch start enables the transform overlay, which handles
    // all the touch/mouse interaction as long as there are any
    // active fingers
    dnode.addEventListener("touchstart", touchHandler.startmark);
    dnode.addEventListener("touchmove", touchHandler.panmove);
    dnode.addEventListener("touchend", touchHandler.endmark);

    // the overlay handles all the two finger touch events
    var onode = this.refs.overlay.getDOMNode();
    onode.addEventListener("touchstart", touchHandler.secondFinger);
    onode.addEventListener("touchmove", touchHandler.panmove);
    onode.addEventListener("touchend", touchHandler.endmark);

    var dims = dnode.getBoundingClientRect();
    this.setState({
      xoffset: (this.props.parentWidth - dims.width)/2,
      yoffset: (this.props.parentHeight - dims.height)/2
    });
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(!prevState.touchactive && this.state.touchactive) {
      this.props.onUpdate(this.state);
    }
  },

  render: function() {
    var x = this.state.x,
        y = this.state.y,
        angle = this.state.angle * 180/Math.PI,
        scale = this.state.scale,
        zIndex = this.state.zIndex;

    var style = {
      transform: [
        "translate("+x+"px, "+y+"px)",
        "rotate("+angle+"deg)",
        "scale("+scale+")"
      ].join(" "),
      transformOrigin: "center",
      zIndex: zIndex
    };

    var className = classes({
      positionable: true,
      touchactive: this.state.touchactive,
      current: this.props.current
    });

    var mainstyle = {
      position: "absolute",
      left: this.state.xoffset,
      top: this.state.yoffset
    };

    return (
      <div className="positionableContainer" style={mainstyle} key={this.props.key}>
        <div ref="overlay" className="touchOverlay" hidden={!this.state.touchactive} />
        <div style={style} className={className}>
          { this.props.children }
        </div>
      </div>
    );
  },

  handleTranslation: function(x, y) {
    this.setState({
      x: x,
      y: y
    }, function() {
      if(this.props.onUpdate) {
        this.props.onUpdate(this.state);
      }
    });
  },

  handleRotationAndScale: function(angle, scale) {
    this.setState({
      angle: angle,
      scale: scale
    }, function() {
      if(this.props.onUpdate) {
        this.props.onUpdate(this.state);
      }
    });
  },

  handleZIndexChange: function(zIndex) {
    this.setState({
      zIndex: zIndex
    });
  }
});

module.exports = Positionable;

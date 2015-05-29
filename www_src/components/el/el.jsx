var React = require('react');
var classes = require('classnames');
var Spec = require('../../lib/spec');
var touchhandler = require("../../lib/touchhandler");
var dispatcher = require('../../lib/dispatcher');

var El = React.createClass({

  statics: {
    types: {
      image: require('./types/image.jsx'),
      text: require('./types/text.jsx'),
      link: require('./types/link.jsx')
    }
  },

  getDefaultProps: function () {
    return {
      interactive: false,
      x: 0,
      y: 0,
      scale: 1,
      angle: 0,
      zIndex: 1
    };
  },

  getInitialState: function() {
    var initial = {
      x: this.props.x,
      y: this.props.y,
      scale: this.props.scale,
      angle: this.props.angle,
      zIndex: this.props.zIndex,
      touchactive: false
    };
    return initial;
  },

  componentDidMount: function() {

    // Don't attach touch handlers for non-interactive elements
    if (!this.props.interactive) {
      return;
    }

    var touchHandler = this.touchhandler = touchhandler(this);
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
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(!prevState.touchactive && this.state.touchactive) {
      this.onUpdate();
    }

    if (this.props.type === 'link') {
      this.positionButton();
    }
  },

  // Button position is based on the rendered DOM, so we're setting it directly post-render
  positionButton: function () {
    var elWrapper = this.getDOMNode();
    var elStyleWrapper = elWrapper.querySelector('.style-wrapper');
    var elButton = elWrapper.querySelector('.meta-button');

    var boundingBox = elStyleWrapper.getBoundingClientRect();
    var buttonStyle = this.getInitialState();

    buttonStyle.y += (((boundingBox.bottom - boundingBox.top) / 2) + 40);
    buttonStyle.angle = 0;
    buttonStyle.scale = 1;

    elButton.style.transform = Spec.propsToPosition(buttonStyle).transform;
  },

  setLinkDestination: function () {
    dispatcher.fire('linkDestinationClicked', this.props);
  },

  render: function() {
    var state = this.getInitialState();

    var className = classes('el', 'el-' + this.props.type, {
      touchactive: this.state.touchactive,
      current: this.props.isCurrent
    });

    var Element = El.types[this.props.type];

    var setDestinationButton;

    if (this.props.type === 'link') {
      setDestinationButton = (
        <div className="el-container" key={this.props.key + '-2'}>
          {/* using onTouchEnd because onClick doesn't work for some reason...touchhandler.js preventing it? */}
          <button
            className="btn meta-button"
            onTouchEnd={this.setLinkDestination}>
              Set destination
          </button>
        </div>
      );
    }

    return (
      <div className="el-wrapper">
        <div className="el-container" key={this.props.key}>
          <div ref="overlay" className="touch-overlay" hidden={!this.state.touchactive} />
          <div className={className + ' style-wrapper'} style={Spec.propsToPosition(state)}>
            <Element {...this.props} />
          </div>
        </div>
        { setDestinationButton }
      </div>
    );
  },

  onTouchEnd: function () {
    if (this.props.onTouchEnd) {
      this.props.onTouchEnd();
    }
  },

  onUpdate: function () {
    if (this.props.onUpdate) {
      this.props.onUpdate(this.state);
    }
  },

  handleTranslation: function(x, y) {
    var thresh = 45;

    var width = document.body.getBoundingClientRect().width/2 - thresh;
    var height = document.body.getBoundingClientRect().height/2 - thresh;

    this.setState({
      x: x,
      y: y
    }, function() {

      var changed = false;
      var updatefunction = this.onUpdate;

      updatefunction();

      var x = this.state.x;
      var y = this.state.y;

      if (x > width ) {/* Moving right and we're already near the right edge */
        x = width;
        changed = true;
      }

      if (x < -width) { /* Moving left and we're already near the left edge */
        x = -width;
        changed = true;
      }

      if (y > height) { /* Moving down and we're already near the bottom */
        y = height;
        changed = true;
      }

      if (y < -height) {/* Moving up and we're already near the top */
          y = -height;
          changed = true;
      }

      if (changed) {
        this.setState({
            x: x,
            y: y
          }, updatefunction);
      }
    }.bind(this));
  },

  handleRotationAndScale: function(angle, scale) {
    this.setState({
      angle: angle,
      scale: scale
    }, function() {
      this.onUpdate();
    });
  },

  handleZIndexChange: function(zIndex) {
    this.setState({
      zIndex: zIndex
    });
  }
});

module.exports = El;

/**
 * FIXME: TODO: This file need heavy refactoring, as it's mixing props and state to
 *              a very entangle data thing, even tapping into getInitialState during
 *              render, which we should never be doing.
 */

var React = require('react');
var classes = require('classnames');
var Spec = require('../../lib/spec');
var touchhandler = require("../../lib/touchhandler");
var dispatcher = require('../../lib/dispatcher');

var BasicElement = React.createClass({
  mixins: [
    require('react-intl').IntlMixin
  ],

  statics: {
    types: {
      image: require('./types/image.jsx'),
      text: require('./types/text.jsx'),
      link: require('./types/link.jsx')
    },
    // the minimum size of the long-edge of an element, in pixels.
    minScaledEdgeLength: 100,
    maxScaledEdgeLength: window.innerWidth - 40,
    /**
     * A static function for determining whether a given scale will
     * be safe, or needs capping because it would lead to an element
     * that is visually too small to manipulate.
     */
    safifyScale: function(component, scale) {
      var node  = component.getDOMNode(),
          style = getComputedStyle(node,null),
          w = parseInt(style.getPropertyValue('width'), 10),
          h = parseInt(style.getPropertyValue('height'), 10),
          e = w>h ? w : h;
      if(e*scale < BasicElement.minScaledEdgeLength) {
        scale = BasicElement.minScaledEdgeLength/e;
      } else if (e*scale > BasicElement.maxScaledEdgeLength) {
        scale = BasicElement.maxScaledEdgeLength/e;
      }
      return scale;
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
    this.buttonStyle = initial;
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

    var threshold = 45;
    var bbox = document.body.getBoundingClientRect();
    this.dragLimits = {
      width: bbox.width/2 - threshold,
      height: bbox.height/2 - threshold
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(!prevState.touchactive && this.state.touchactive) {
      this.onUpdate();
    }

    if (this.props.type === 'link') {
      this.positionButton();
    }

    // Since basic elements never unmount, we need to make sure that
    // zIndex updates, which may occur outside of regular element
    // interaction, are reflected back into the element's state.
    //
    // TODO: this discovery might mean we need to do this for all
    //       transform properties too, but there haven't been any
    //       bugs filed about those (yet...?)
    if(this.props.zIndex !== this.state.zIndex) {
      this.setState({
        zIndex: this.props.zIndex
      });
    }
  },

  // Right now the button position is based on the rendered DOM, so we're setting it directly post-render.
  //
  // FIXME: TODO: This function needs to at the very least be moved to the link element,
  //              but should really be reengineered out of existence, as it's using old
  //              HTML+JS to solve a problem in React, which has very different ways of
  //              doing so.
  positionButton: function () {
    var boundingBox = this.refs.styleWrapper.getDOMNode().getBoundingClientRect();
    var buttonStyle = this.buttonStyle;
    buttonStyle.y += (((boundingBox.bottom - boundingBox.top) / 2) + 40);
    buttonStyle.angle = 0;
    buttonStyle.scale = 1;
    // FIXME: TODO: this should not be here. This data should be read from state (since we
    //              set it purely during the component's life time), and then use that to
    //              render the button with the correct style in render().
    this.refs.metaButton.getDOMNode().style.transform = Spec.propsToPosition(buttonStyle).transform;
  },

  onLinkDestClick: function () {
    if (this.props.targetPageId) {
      if (window.Android) {
        window.Android.setView(`/users/${this.props.targetUserId}/projects/${this.props.targetProjectId}/pages/${this.props.targetPageId}`);
      }
    } else {
      dispatcher.fire('linkDestinationClicked', this.props);
    }
  },

  generateDestinationButton: function() {
    return (
      <div className="el-container" key={this.props.key + '-2'}>
        {/* using onTouchEnd because onClick doesn't work for some reason...touchhandler.js preventing it? */}
        <button
          ref="metaButton"
          className="btn meta-button"
          onTouchEnd={this.onLinkDestClick}>
            <img className="icon" src="../../img/flag.svg" />
            {this.props.targetPageId ? this.getIntlMessage('follow_link') : this.getIntlMessage('set_destination')}
        </button>
      </div>
    );
  },

  generateElement: function() {
    var Element = BasicElement.types[this.props.type];
    return <Element ref="contentElement" {...this.props} />;
  },

  render: function() {
    var wrapperClass = classes(
      'el',
      'style-wrapper',
      'el-' + this.props.type, {
        touchactive: this.state.touchactive,
        current: this.props.isCurrent
      }
    );

    var wrapperStyle = Spec.propsToPosition(this.getInitialState());

    // Note: we're rending the element off of this.props, NOT this.state:
    return (
      <div className="el-wrapper">
        <div className="el-container" key={this.props.key}>
          <div ref="overlay" className="touch-overlay" hidden={!this.state.touchactive} />
          <div ref="styleWrapper" className={wrapperClass} style={wrapperStyle}>
            { this.generateElement() }
          </div>
        </div>
        { this.props.type === 'link' ? this.generateDestinationButton() : false }
      </div>
    );
  },

  /**
   * Propagate the touch end signal to the parent
   */
  onTouchEnd: function (modified) {
    if (this.props.onTouchEnd) {
      this.props.onTouchEnd(modified);
    }
  },

  /**
   * Translate an element on the page but prevent it from being dragged
   * off entirely, by forcing a "safe zone" into which elements get locked
   * if they'd otherwise run off the page.
   */
  handleTranslation: function(x, y) {
    var dl = this.dragLimits,
        w_edge = dl.width,
        h_edge = dl.height;
    x = (x > w_edge) ? w_edge : (x < -w_edge) ? -w_edge : x;
    y = (y > h_edge) ? h_edge : (y < -h_edge) ? -h_edge : y;
    this.setState({ x: x, y: y }, this.onUpdate);
  },

  handleRotationAndScale: function(angle, scale) {
    this.setState({
      angle: angle,
      scale: BasicElement.safifyScale(this.refs.contentElement, scale)
    }, function() {
      this.onUpdate();
    });
  },

  handleZIndexChange: function(zIndex) {
    this.setState({
      zIndex: zIndex
    });
    // FIXME: TODO: this appears to be lacking an onUpdate callback
  },

  /**
   * Propagate changes to this element to the parent
   */
  onUpdate: function () {
    if (this.props.onUpdate) {
      this.props.onUpdate(this.state);
    }
  }
});

module.exports = BasicElement;

var React = require('react');
var assign = require('react/lib/Object.assign');
var getContrastingColor = require('../../../lib/color').getContrastingColor;
var Spec = require('../../../lib/spec');

var spec = new Spec('link', assign({
  innerHTML: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: 'Tap me'
  },
  targetPageId: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  targetProjectId: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  href: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  fontFamily: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'sans-serif'
  },
  backgroundColor: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: '#69A0FC'
  },
  borderRadius: {
    category: 'styles',
    validation: React.PropTypes.number,
    default: 5
  }
}, Spec.getPositionProps()));

var Link = React.createClass({

  mixins: [
    require('./textedit')
  ],

  statics: {spec},

  propTypes: spec.getPropTypes(),

  getDefaultProps: function () {
    return assign(spec.getDefaultProps(), {
      active: false
    });
  },

  render: function() {
    var props = this.props;

    var style = {
      boxShadow: 'none',
      borderRadius: props.borderRadius,
      backgroundColor: props.backgroundColor,
      color: getContrastingColor(props.backgroundColor),
      fontFamily: props.fontFamily,
      whiteSpace: props.whiteSpace
    };

    var Element = this.props.activelink ? 'a' : 'span';
    var content = this.makeEditable(props.innerHTML, style);
    var onPClick = this.activate;
    if (this.state.editing) {
      onPClick = false;
    }

    return <Element className="btn" style={style} onClick={onPClick} href={props.href}>{content}</Element>;
  }
});

module.exports = Link;

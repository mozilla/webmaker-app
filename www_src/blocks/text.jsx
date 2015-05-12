var React = require('react');
var utils = require('../lib/propUtils');
var assign = require('react/lib/Object.assign');

var Text = React.createClass({
  statics: {
    defaults: {
      fontSize: 18,
      fontFamily: 'Roboto',
      color: '#645839',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      innerHTML: 'Hello world'
    }
  },

  mixins: [
    require('react-onclickoutside')
  ],

  getInitialState: function() {
    return {
      innerHTML: this.props.innerHTML
    };
  },

  getDefaultProps: function () {
    return this.defaults;
  },

  render: function() {
    var style = {};
    var props = this.props;
    ['fontSize', 'fontFamily', 'color', 'fontWeight', 'fontStyle', 'textDecoration', 'textAlign']
      .forEach(prop => style[prop] = props[prop]);

    if (props.position) {
      style = assign(style, utils.propsToPosition(props));
    }

    var inputStyle = assign({}, style);
    inputStyle.background = "transparent";
    inputStyle.border = "none";

    var content = this.state.innerHTML;
    if (this.props.editing) {
      content = <input ref="input" style={inputStyle} value={content} onChange={this.editText}/>;
    }

    return (
      <p style={style}>{ content }</p>
    );
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(this.props.editing) {
      this.refs.input.getDOMNode().focus();
    }
  },

  editText: function(evt) {
    var value = evt.target.value;
    this.setState({
      innerHTML: value
    });
  },

  handleClickOutside: function(evt) {
    if (this.props.onTextUpdate) {
      this.props.onTextUpdate( this.state.innerHTML );
    }
  }
});

module.exports = Text;

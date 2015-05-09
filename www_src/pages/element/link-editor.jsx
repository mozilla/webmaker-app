var React = require('react/addons');
var defaults = require('lodash.defaults');

var LinkBlock = require('../../blocks/link.jsx');
var Alert = require('../../components/alert/alert.jsx');
var ColorGroup = require('../../components/color-group/color-group.jsx');
var Range = require('../../components/range/range.jsx');

var LinkEditor = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin
  ],
  getInitialState: function () {
    var props = this.props.element || {};
    return defaults(props, LinkBlock.defaults);
  },
  componentDidUpdate: function () {
    this.props.save(this.state);
  },
  editText: function () {
    var text = window.prompt('Edit the text');
    this.setState({
      innerHTML: text
    });
  },
  onChangeLinkClick: function () {
    this.setState({showAlert: true});
  },
  render: function () {
    return (
      <div id="editor">
        <div className="editor-preview" onClick={this.editText}>
          <LinkBlock {...this.state} />
        </div>
        <div className="editor-options">
          <div className="form-group">
            <button onClick={this.onChangeLinkClick} className="btn btn-block">
              <img className="icon" src="../../img/change-image.svg" /> Set Link Destination
            </button>
            <Alert isVisible={this.state.showAlert} >Coming Soon!</Alert>
          </div>
          <div className="form-group">
            <label>Corners</label>
            <Range id="borderRadius" min={0} value={this.state.borderRadius} max={32} unit="px" linkState={this.linkState} />
          </div>
          <div className="form-group">
            <label>Font</label>
            <select className="select" valueLink={this.linkState('fontFamily')}>
              <option value="Roboto">Roboto</option>
              <option value="Bitter">Bitter</option>
              <option value="Pacifico">Pacifico</option>
            </select>
          </div>
          <div className="form-group">
            <label>Background Color</label>
            <ColorGroup id="backgroundColor" linkState={this.linkState} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LinkEditor;

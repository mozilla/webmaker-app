var React = require('react/addons');
var defaults = require('lodash.defaults');
var render = require('../../lib/render.jsx');
var Binding = require('../../lib/binding.jsx');

var TextBlock = require('../../blocks/text.jsx');
var Range = require('../../components/range/range.jsx');
var ColorGroup = require('../../components/color-group/color-group.jsx');
var {CheckboxSet, Radio} = require('../../components/option-panel/option-panel.jsx');

var TextEditor = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function () {
    var props = this.props.element || {};
    var initialState = defaults(props, TextBlock.defaults);
    console.log(JSON.stringify(initialState));
    return initialState;
  },
  componentDidUpdate: function () {
    this.props.save(this.state);
  },
  editText: function () {
    this.setState({
      editing: true
    });
  },
  commitText: function (text) {
    this.setState({
      editing: false,
      innerHTML: !!text.trim() ? text : this.state.innerHTML
    }, function() {
      // ... really?
      console.log("saving "+JSON.stringify(this.state));
      this.props.save(this.state)
    });
  },
  render: function () {
    var textStyleOptions = [
      {
        id: 'fontWeight',
        icon: '../../img/B.svg',
        uncheckedLabel: 'normal',
        checkedLabel: 'bold'
      },
      {
        id: 'fontStyle',
        icon: '../../img/I.svg',
        uncheckedLabel: 'normal',
        checkedLabel: 'italic'
      },
      {
        id: 'textDecoration',
        icon: '../../img/U.svg',
        uncheckedLabel: 'none',
        checkedLabel: 'underline'
      }
    ];
    var textAlignOptions = [
      {
        value: 'left',
        icon: '../../img/align-left.svg',
      },
      {
        value: 'center',
        icon: '../../img/align-center.svg',
      },
      {
        value: 'right',
        icon: '../../img/align-right.svg',
      }
    ];
    return (
      <div id="editor">
        <div className="editor-preview" onClick={this.editText}>
          <TextBlock {...this.state} onTextUpdate={this.commitText}/>
        </div>
        <div className="editor-options">
          <div className="form-group">
            <label>Text Size</label>
            <Range id="fontSize" min={10} max={32} unit="px" linkState={this.linkState} />
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
            <label>Color</label>
            <ColorGroup id="color" linkState={this.linkState} />
          </div>
          <div className="form-group">
            <label>Text Style</label>
            <CheckboxSet options={textStyleOptions} linkState={this.linkState} />
          </div>
          <div className="form-group">
            <label>Text Alignment</label>
            <Radio id="textAlign" options={textAlignOptions} linkState={this.linkState} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TextEditor;

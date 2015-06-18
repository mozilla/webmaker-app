var React = require('react/addons');

var TextBlock = require('../../components/basic-element/types/text.jsx');
var ColorGroup = require('../../components/color-group/color-group.jsx');
var {CheckboxSet, Radio} = require('../../components/option-panel/option-panel.jsx');

var colorChoices = ColorGroup.defaultColors.slice();
colorChoices[0] = '#444';

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

var textAlignOptions = ['left', 'center', 'right'].map(e => {
  return {
    value: e,
    icon: '../../img/align-'+e+'.svg'
  };
});

var TextEditor = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin,
    require('./witheditable'),
    require('./font-selector'),
    require('react-intl').IntlMixin
  ],
  getInitialState: function () {
    return TextBlock.spec.flatten(this.props.element, {defaults: true});
  },
  componentDidUpdate: function (prevProps) {
    this.props.cacheEdits(this.state);

    // Update state if parent properties change
    if (this.props.element !== prevProps.element) {
      var state = this.getInitialState();
      this.setState(state);
    }

  },
  render: function () {
    return (
      <div id="editor" onClick={this.stopEditing}>
        <form>
          <div className="editor-preview">
            <TextBlock {...this.state} ref="element" active={true} updateText={this.updateText} setEditMode={this.setEditing} />
          </div>
          <div className="editor-options">
            <div className="form-group">
              <button className="btn btn-block" onClick={this.editText}>{ this.state.editing? this.getIntlMessage('done') : this.getIntlMessage('edit_text')}</button>
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('font')}</label>
              { this.generateFontSelector() }
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('color')}</label>
              <ColorGroup id="color" linkState={this.linkState} colors={colorChoices} params={this.props.params} onLaunchTinker={this.props.save} />
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('text_style')}</label>
              <CheckboxSet options={textStyleOptions} linkState={this.linkState} />
            </div>
            {/* Hide the text alignment editor until multi-line text is added.*/}
            <div className="form-group" style={{display: 'none'}}>
              <label>{this.getIntlMessage('text_alignment')}</label>
              <Radio id="textAlign" options={textAlignOptions} linkState={this.linkState} />
            </div>
          </div>
        </form>
      </div>
    );
  }
});

module.exports = TextEditor;

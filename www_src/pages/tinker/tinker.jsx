var React = require('react/addons');

var color = require('../../lib/color.js');
var render = require('../../lib/render.jsx');
var router = require('../../lib/router.jsx');
var Slider = require('../../components/range/range.jsx');

var Tinker = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin,
    router
  ],
  getInitialState: function () {
    return {
      red: 200,
      green: 100,
      blue: 50,
      alpha: 1
    };
  },
  render: function () {
    return (
      <div id='tinker'>
        <div className='editor-preview'>
          <img src='../../img/toucan.svg' />
        </div>
        
        <div className='color-preview'>
          <code>color: {this.generateColorString()};</code>
          <div className='color-preview-right'>
            <div style={{backgroundColor: this.generateColorString()}} className='color-preview-swatch' />
          </div>
        </div>

        <div className='editor-options'>
          <div className='form-group'>
            <label>Red</label>
            <Slider id='red' max={255} linkState={this.linkState} />

            <label>Green</label>
            <Slider id='green' max={255} linkState={this.linkState} />

            <label>Blue</label>
            <Slider id='blue' max={255} linkState={this.linkState} />

            <label>Transparency</label>
            <Slider id='alpha' max={1} step={0.01} linkState={this.linkState} />
          </div>
        </div>
      </div>
    );
  },

  /**
   * Transform RGBA state into a valid CSS color.
   *
   * @return {string} HEX or RGBA color string
   */
  generateColorString: function () {
    // If alpha is less than "1.0", use "rgba()" syntax
    if (this.state.alpha < 1) {
      return color.rgbaToCss(this.state.red, this.state.green, this.state.blue, this.state.alpha);
    }
    
    return color.rgbToHex(this.state.red, this.state.green, this.state.blue);
  }
});

// Render!
render(Tinker);

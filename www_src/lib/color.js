var Color = require('color');

module.exports = {
  /**
   * Converts RGB color into a HEX string
   *
   * @param  {int} r Red
   * @param  {int} g Green
   * @param  {int} b Blue
   *
   * @return {string}
   */
  rgbToHex: function (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  /**
   * Converts RGBA color into an "rgba()" CSS string
   *
   * @param  {int} r Red
   * @param  {int} g Green
   * @param  {int} b Blue
   * @param  {float} a ALpha
   *
   * @return {string}
   */
  rgbaToCss: function (r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  },

  /**
   * Calculates a contrasting color.
   *
   * @param  {string} input Reference (hex) color value
   *
   * @return {string}
   */
  getContrastingColor: function (input) {
    var white = Color().rgb(255, 255, 255);
    var whiteCSS = white.rgbString();
    var black = Color().rgb(0, 0, 0);
    var blackCSS = black.rgbString();
    var minimumContrast = 2;

    var c = Color(input);
    var wc = white.contrast(c);
    var bc = black.contrast(c);

    return (wc < bc && wc >= minimumContrast) ? whiteCSS : blackCSS;
  }
};

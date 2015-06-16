var Cartesian = require('../../lib/cartesian');

var DEFAULT_ZOOM = 0.5;

module.exports = {
  statics: {
    DEFAULT_ZOOM: DEFAULT_ZOOM
  },

  componentWillMount: function () {
    var width = 320;
    var height = 440;
    var gutter = 20;

    this.cartesian = new Cartesian({
      allCoords: [],
      width,
      height,
      gutter
    });
  },

  /**
   * Get the coordinates for a particular page ID
   * @param  {String} id Page ID
   * @return {Object}    Coordinate object {x:Number, y:Number}
   */
  pageIdToCoords: function (id) {
    var coords;
    this.state.pages.some(p => {
      if (id === p.id) {
        coords = p.coords;
        return true;
      }
    });
    return coords;
  },

  zoomToPage: function (coords) {
    this.setState({
      camera: this.cartesian.getFocusTransform(coords, 1),
      zoom: 1,
      isPageZoomed: true,
      zoomedPageCoords: coords
    });
  },

  zoomFromPage: function () {
    this.setState({
      camera: this.cartesian.getFocusTransform(this.state.zoomedPageCoords, DEFAULT_ZOOM),
      zoom: DEFAULT_ZOOM,
      isPageZoomed: false
    });
  },

  /**
   * Zoom into a specified page while retaining the current mode (edit/play)
   *
   * @param  {object} coords Co-ordinates (x,y) for page
   *
   * @return {void}
   */
  zoomToSelection: function (coords) {
    this.setState({
      camera: this.cartesian.getFocusTransform(coords, 1),
      zoom: 1,
      zoomedPageCoords: coords
    });
  },

  zoomOut: function () {
    this.setState({zoom: this.state.zoom / 2});
  },

  zoomIn: function () {
    this.setState({zoom: this.state.zoom * 2});
  }
};

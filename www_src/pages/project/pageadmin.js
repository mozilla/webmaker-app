var React = require('react/addons');

var types = require('../../components/basic-element/basic-element.jsx').types;
var api = require('../../lib/api');
var update = React.addons.update;

var MAX_ZOOM = 0.8;
var DEFAULT_ZOOM = 0.5;

module.exports = {
  /**
   * Highlight a page in the UI and move camera to center it
   * @param  {Number|String} id ID of page
   * @param  {Number|String} type Type of highlight ("selected", "source")
   */
  highlightPage: function (id, type) {
    if (this.state.sourcePageID !== id) {
      var selectedPage;

      this.state.pages.forEach(function (page) {
        if (parseInt(page.id, 10) === parseInt(id, 10)) {
          selectedPage = page;
        }
      });

      if (!selectedPage) {
        console.warn('Page not found.');
        return;
      }

      var newState = {
        camera: this.cartesian.getFocusTransform(selectedPage.coords, this.state.zoom)
      };

      if (type === 'selected') {
        newState.selectedEl = id;
      } else if (type === 'source') {
        newState.sourcePageID = id;
      }

      this.setState(newState);
    }
  },

  formatPages: function (pages) {
    return pages.map(page => {

      page.coords = {
        x: page.x,
        y: page.y
      };

      page.elements = page.elements.map(element => {
        if (!types[element.type]) {
          return false;
        }
        return types[element.type].spec.flatten(element);
      }).filter(element => element);

      delete page.x;
      delete page.y;

      return page;
    });
  },


  addPage: function (coords) {
    return () => {
      var json = {
        x: coords.x,
        y: coords.y,
        styles: {backgroundColor: '#f2f6fc'}
      };
      this.setState({loading: true});
      api({
        method: 'post',
        uri: this.uri(),
        json
      }, (err, data) => {
        this.setState({loading: false});
        if (err) {
          return console.error('Error loading project', err);
        }

        if (!data || !data.page) {
          return console.error('No page id returned');
        }

        json.id = data.page.id;
        json.coords = {x: json.x, y: json.y};
        delete json.x;
        delete json.y;
        this.cartesian.allCoords.push(coords);
        this.setState({
          pages: update(this.state.pages, {$push: [json]}),
          camera: this.cartesian.getFocusTransform(coords, this.state.zoom),
          selectedEl: json.id
        });
      });
    };
  },

  removePage: function () {
    var currentId = this.state.selectedEl;
    var index;
    this.setState({loading: true});
    this.state.pages.forEach((el, i) => {
      if (el.id === currentId) {
        index = i;
      }
    });
    if (typeof index === 'undefined') {
      return;
    }

    // Don't delete test elements for real;
    if (parseInt(currentId, 10) === 1) {
      return window.alert('this is a test page, not deleting.');
    }

    api({
      method: 'delete',
      uri: `${this.uri()}/${currentId}`
    }, (err) => {
      this.setState({loading: false});
      if (err) {
        return console.error('There was an error deleting the page', err);
      }

      this.cartesian.allCoords.splice(index, 1);
      this.setState({
        pages: update(this.state.pages, {$splice: [[index, 1]]}),
        zoom: this.state.zoom >= MAX_ZOOM ? DEFAULT_ZOOM : this.state.zoom,
        selectedEl: ''
      });
    });
  },

  onPageClick: function (page) {
    if (this.state.params.mode === 'play') {
      if (!this.state.isPageZoomed ||
          this.state.zoomedPageCoords.x !== page.coords.x &&
          this.state.zoomedPageCoords.y !== page.coords.y) {
        this.zoomToPage(page.coords);
      }
    } else if (page.id === this.state.selectedEl && this.state.params.mode !== 'link') {
      this.zoomToSelection(page.coords);
    } else {
      this.highlightPage(page.id, 'selected');
    }
  },
};

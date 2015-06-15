var React = require('react/addons');
var update = React.addons.update;
var assign = require('react/lib/Object.assign');
var {parseJSON} = require('../../lib/jsonUtils');

var render = require('../../lib/render.jsx');
var Cartesian = require('../../lib/cartesian');
var Loading = require('../../components/loading/loading.jsx');

var {Menu, PrimaryButton, SecondaryButton, FullWidthButton} = require('../../components/action-menu/action-menu.jsx');
var types = require('../../components/basic-element/basic-element.jsx').types;

var dispatcher = require('../../lib/dispatcher');

var api = require('../../lib/api');
var calculateSwipe = require('../../lib/swipe.js');

var MAX_ZOOM = 0.8;
var MIN_ZOOM = 0.18;
var DEFAULT_ZOOM = 0.5;
var ZOOM_SENSITIVITY = 300;

var PageBlock = require("./pageblock.jsx");

var Project = React.createClass({
  statics: {
    findLandingPage: function(pages) {
      var result;
      // ... first, try to select 0, 0
      pages.forEach((page) => {
        if (page.coords.x === 0 && page.coords.y === 0) {
          result = page;
        }
      });
      // ... and if it was deleted, select the first page in the array
      return result || pages[0];
    }
  },
  mixins: [
    require('../../lib/router'),
    require('./transforms'),
    require('./remix')
  ],
  getInitialState: function () {
    return {
      loading: true,
      selectedEl: '',
      pages: [],
      camera: {},
      zoom: DEFAULT_ZOOM,
      isPageZoomed: false
    };
  },

  uri: function () {
    return `/users/${this.state.params.user}/projects/${this.state.params.project}/pages`;
  },

  componentWillMount: function () {
    this.load();
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }

    if (window.Android) {
      window.Android.setMemStorage('state', JSON.stringify(this.state));
    }
  },

  componentDidMount: function () {
    if (window.Android) {
      var state = window.Android.getMemStorage('state');
      if (this.state.params.mode === 'edit') {
        state = parseJSON(state);
        if (state.params && state.params.project === this.state.params.project) {
          this.setState({
            selectedEl: state.selectedEl,
            camera: state.camera,
            zoom: state.zoom
          });
        }
      }
    }

    // Handle button actions
    dispatcher.on('linkClicked', (event) => {
      if (event.targetPageId && this.state.isPageZoomed) {
        this.zoomToPage( this.pageIdToCoords(event.targetPageId) );
      } else {
        this.highlightPage(event.targetPageId, 'selected');
      }
    });
  },

  /**
   * Get the coordinates for a particular page ID
   * @param  {String} id Page ID
   * @return {Object}    Coordinate object {x:Number, y:Number}
   */
  pageIdToCoords: function (id) {
    var coords;

    for (var i = 0; i < this.state.pages.length; i++) {
      if (id === this.state.pages[i].id) {
        coords = this.state.pages[i].coords;
        break;
      }
    }

    return coords;
  },

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

  load: function () {
    this.setState({loading: true});
    api({uri: this.uri()}, (err, data) => {

      this.setState({loading: false});

      if (err) {
        console.error('Error loading project', err);
      } else if (!data || !data.pages) {
        console.error('No project found...');
      } else {
        var state = {};
        var pages = this.formatPages(data.pages);

        // Set cartesian coordinates
        this.cartesian.allCoords = pages.map(el => el.coords);

        state.pages = pages;

        var landingPage = Project.findLandingPage(pages);
        var focusTransform = this.cartesian.getFocusTransform(landingPage.coords, this.state.zoom);

        if (this.state.params.mode === 'edit' && !this.state.selectedEl) {
          state.selectedEl = landingPage.id;
          state.camera = focusTransform;
        } else if (typeof this.state.camera.x === 'undefined') {
          state.camera = focusTransform;
        }

        this.setState(state);

        // Highlight the source page if you're in link destination mode
        if (this.state.params.mode === 'link') {
          if (window.Android) {
            this.highlightPage(this.state.routeData.pageID, 'source');
          }
        }
      }
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

  setDestination: function () {
    var patchedState = this.state.routeData.linkState;

    patchedState = types.link.spec.expand(patchedState);

    // Patch old attributes object to prevent overwritten properties
    patchedState.attributes.targetPageId = this.state.selectedEl;
    patchedState.attributes.targetProjectId = this.state.params.project;
    patchedState.attributes.targetUserId = this.state.params.user;

    this.setState({loading: true});
    api({
      method: 'patch',
      uri: `/users/${this.state.routeData.userID}/projects/${this.state.routeData.projectID}/pages/${this.state.routeData.pageID}/elements/${this.state.routeData.elementID}`,
      json: {
        attributes: patchedState.attributes
      }
    }, (err, data) => {
      this.setState({loading: false});
      if (err) {
        console.error('There was an error updating the element', err);
      }

      if (window.Android) {
        window.Android.goBack();
      }
    });
  },

  render: function () {
    // Prevent pull to refresh
    document.body.style.overflowY = 'hidden';

    var self = this;

    var isPlayOnly = this.state.params.mode === 'play' || this.state.params.mode === 'link';

    var containerStyle = {
      width: this.cartesian.width + 'px',
      height: this.cartesian.height + 'px'
    };

    var boundingStyle = assign({
        transform: `translate(${this.state.camera.x || 0}px, ${this.state.camera.y || 0}px) scale(${this.state.zoom})`,
        opacity: this.state.pages.length ? 1 : 0
      },
      this.cartesian.getBoundingSize()
    );

    var pageUrl = `/users/${this.state.params.user}/projects/${this.state.params.project}/pages/${this.state.selectedEl}`;

    function generateAddContainers() {
      if (!isPlayOnly) {
        return self.cartesian.edges.map(coords => {
          return (<div className="page-container add" style={{transform: self.cartesian.getTransform(coords)}} onClick={self.addPage(coords)}>
            <img className="icon" src="../../img/plus.svg" />
          </div>);
        });
      }
    }

    var removePageButton = this.state.pages.length > 1 ? (
      <SecondaryButton side="left" off={isPlayOnly || !this.state.selectedEl} onClick={this.removePage} icon="../../img/trash.svg" />
    ) : false;

    return (
      <div id="map">
        <div ref="bounding" className="bounding" style={boundingStyle}>
          <div className="test-container" style={containerStyle}>
          {this.state.pages.map((page) => {
            var props = {
              page,
              selected: page.id === this.state.selectedEl,
              source: page.id === this.state.sourcePageID,
              target: page.id === this.state.selectedEl && this.state.params.mode === 'link',
              transform: this.cartesian.getTransform(page.coords),
              onClick: this.onPageClick.bind(this, page)
            };
            return (<PageBlock {...props} />);
          })}
          { generateAddContainers() }
          </div>
        </div>

        <Menu fullWidth={this.state.params.mode === 'link'}>
          {removePageButton}
          <PrimaryButton url={pageUrl} off={isPlayOnly || !this.state.selectedEl} href="/pages/page" icon="../../img/pencil.svg" />
          <PrimaryButton onClick={this.zoomFromPage} off={!this.state.isPageZoomed} icon="../../img/zoom-out.svg" />
          <FullWidthButton onClick={this.setDestination} off={this.state.params.mode !== 'link' || !this.state.selectedEl}>Set Destination</FullWidthButton>
        </Menu>

        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Project);

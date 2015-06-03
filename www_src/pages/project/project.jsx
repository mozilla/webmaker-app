var React = require('react/addons');
var update = React.addons.update;
var assign = require('react/lib/Object.assign');

var render = require('../../lib/render.jsx');
var router = require('../../lib/router.jsx');
var Cartesian = require('../../lib/cartesian');
var Loading = require('../../components/loading/loading.jsx');
var {Menu, PrimaryButton, SecondaryButton} = require('../../components/action-menu/action-menu.jsx');
var types = require('../../components/el/el.jsx').types;

var api = require('../../lib/api');
var calculateSwipe = require('../../lib/swipe.js');

var MAX_ZOOM = 0.8;
var MIN_ZOOM = 0.18;
var DEFAULT_ZOOM = 0.5;
var ZOOM_SENSITIVITY = 300;

var PageBlock = require("./pageblock.jsx");

var Project = React.createClass({
  mixins: [router],
  getInitialState: function () {
    return {
      loading: true,
      selectedEl: '',
      pages: [],
      camera: {
        x: 0,
        y: 0
      },
      zoom: DEFAULT_ZOOM,
      isPageZoomed: false
    };
  },

  uri: function () {
    return `/users/1/projects/${this.state.params.project}/pages`;
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
    var el = this.getDOMNode();
    var bounding = this.refs.bounding;
    var boundingEl = bounding.getDOMNode();
    var startX, startY, endX, endY, startDistance, currentX, currentY, currentZoom;
    var didMove = false;

    if (window.Android) {
      var state = window.Android.getMemStorage('state');
      if (typeof state !== 'undefined' && state !== '') {
        state = JSON.parse(state);

        if (state.params && state.params.page === this.state.params.page) {
          this.setState({
            selectedEl: state.selectedEl,
            camera: state.camera,
            zoom: state.zoom
          });
        }
      }
    }

    el.addEventListener('touchstart', (event) => {
      didMove = false;

      if (event.touches.length > 1) {
        var dx = event.touches[1].clientX - event.touches[0].clientX;
        var dy = event.touches[1].clientY - event.touches[0].clientY;
        startDistance = Math.sqrt(dx*dx + dy*dy);
      } else {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        boundingEl.style.transition = 'none';
      }

    });

    el.addEventListener('touchmove', (event) => {
      didMove = true;
      var translateStr = 'translate(' + this.state.camera.x + 'px, ' + this.state.camera.y + 'px)';
      var scaleStr = 'scale(' + this.state.zoom + ')';
      if (event.touches.length > 1) {
        currentZoom = this.state.zoom;
        var dx = event.touches[1].clientX - event.touches[0].clientX;
        var dy = event.touches[1].clientY - event.touches[0].clientY;
        var distance = Math.sqrt(dx*dx + dy*dy);

        currentZoom = currentZoom + ((distance - startDistance) / ZOOM_SENSITIVITY);
        currentZoom = Math.min(Math.max(currentZoom, MIN_ZOOM), MAX_ZOOM);
        scaleStr = 'scale(' + currentZoom + ')';
      }

      var x = this.state.camera.x;
      var y = this.state.camera.y;
      currentX = x + (event.touches[0].clientX - startX);
      currentY = y + (event.touches[0].clientY - startY);
      translateStr = 'translate(' + currentX + 'px, ' + currentY + 'px)';

      endX = event.touches[0].clientX;
      endY = event.touches[0].clientY;

      // Only pan the bounding box if you're not zoomed in on a page
      if (!this.state.isPageZoomed) {
        boundingEl.style.transform = translateStr + ' ' + scaleStr;
      }
    });

    el.addEventListener('touchend', (event) => {
      if (event.touches.length === 0) {
        boundingEl.style.transition = '';
        if (!didMove) {
          return;
        }

        if (!this.state.isPageZoomed) {
          var state = {camera: {
            x: currentX,
            y: currentY
          }};

          if (typeof currentZoom !== 'undefined') {
            state.zoom = currentZoom;
          }
          this.setState(state);

          startX = undefined;
          startY = undefined;
          startDistance = undefined;
          currentX = undefined;
          currentY = undefined;
          currentZoom = undefined;
        } else {
          // Handle swipe
          var swipeDirection = calculateSwipe(startX, startY, endX, endY);

          if (swipeDirection) {
            var panTargets = {
              LEFT: {x: this.state.zoomedPageCoords.x + 1, y: this.state.zoomedPageCoords.y},
              RIGHT: {x: this.state.zoomedPageCoords.x - 1, y: this.state.zoomedPageCoords.y},
              UP: {x: this.state.zoomedPageCoords.x, y: this.state.zoomedPageCoords.y + 1},
              DOWN: {x: this.state.zoomedPageCoords.x, y: this.state.zoomedPageCoords.y - 1}
            };

            // Determine if an adjacent page exists
            var isAdjacentPage = false;
            var target = panTargets[swipeDirection];

            this.state.pages.forEach(function (page) {
              if (page.coords.x === target.x && page.coords.y === target.y) {
                isAdjacentPage = true;
              }
            });

            if (isAdjacentPage) {
              this.zoomToPage(target);
            }
          }
        }
      } else {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        this.state.camera.x = currentX;
        this.state.camera.y = currentY;
        this.state.zoom = currentZoom;
      }

    });
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

  loadPages: function (pages) {
    var state = {loading: false};
    var pages = pages.map(page => {
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
    this.cartesian.allCoords = pages.map(el => el.coords);
    state.pages = pages;
    if (!this.state.selectedEl) {
      state.camera = this.cartesian.getFocusTransform({x: 0, y: 0}, this.state.zoom);
    }
    this.setState(state);

    // Highlight the source page if you're in link destination mode
    if (this.state.params.mode === 'link') {
      if (window.Android) {
        this.highlightPage(this.state.routeData.pageID, 'source');
      }
    }
  },

  load: function () {
    this.setState({loading: true});
    api({uri: this.uri()}, (err, data) => {
      if (err) {
        console.error('Error loading project', err);
        this.setState({loading: false});
      } else if (!data || !data.pages || !data.pages.length) {
        // Create the first page
        api({
          method: 'POST',
          uri: this.uri(),
          json: {
            x: 0,
            y: 0
          }
        }, (err, data) => {
          if (err) {
            console.error('Error creating first page', err);
            this.setState({loading: false});
          } else if (!data || !data.page) {
            console.error('No page id was returned');
            this.setState({loading: false});
          } else {
            this.loadPages([{
              id: data.page.id,
              x: 0,
              y: 0,
              selectedEl: data.page.id,
              styles: {},
              elements: []
            }]);
          }
        });
      } else {
        this.loadPages(data.pages);
      }
    });
  },

  addPage: function (coords) {
    return () => {
      var json = {
        x: coords.x,
        y: coords.y,
        styles: {backgroundColor: '#fafcff'}
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
      this.zoomToPage(page.coords);
    } else if (page.id === this.state.selectedEl && this.state.params.mode !== 'link') {
      this.zoomToSelection(page.coords);
    } else {
      this.highlightPage(page.id, 'selected');
    }
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
        transform: `translate(${this.state.camera.x}px, ${this.state.camera.y}px) scale(${this.state.zoom})`,
        opacity: this.state.pages.length ? 1 : 0
      },
      this.cartesian.getBoundingSize()
    );

    var pageUrl = `/projects/${this.state.params.project}/pages/${this.state.selectedEl}`;

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

        <Menu>
          {removePageButton}
          <PrimaryButton url={pageUrl} off={isPlayOnly || !this.state.selectedEl} href="/pages/page" icon="../../img/pencil.svg" />
          <PrimaryButton onClick={this.zoomFromPage} off={!this.state.isPageZoomed} icon="../../img/zoom-out.svg" />
        </Menu>

        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Project);

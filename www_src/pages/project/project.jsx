// FIXME: TODO: This file needs to be refactored, it is way too big.

var React = require('react/addons');
var update = React.addons.update;
var assign = require('react/lib/Object.assign');
var reportError = require('../../lib/errors');
var router = require('../../lib/router');
var Cartesian = require('../../lib/cartesian');
var dispatcher = require('../../lib/dispatcher');
var api = require('../../lib/api');
var calculateSwipe = require('../../lib/swipe');
var {parseJSON} = require('../../lib/jsonUtils');

var render = require('../../lib/render.jsx');
var Loading = require('../../components/loading/loading.jsx');
var {Menu, PrimaryButton, SecondaryButton, FullWidthButton} = require('../../components/action-menu/action-menu.jsx');
var types = require('../../components/basic-element/basic-element.jsx').types;
var PageBlock = require("./pageblock.jsx");

var MAX_ZOOM = 0.8;
var MIN_ZOOM = 0.18;
var DEFAULT_ZOOM = 0.5;
var ZOOM_SENSITIVITY = 300;


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
  mixins: [router, require('react-intl').IntlMixin],
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

    // Handle button actions
    dispatcher.on('linkClicked', (event) => {
      // Ignore button actions in link mode
      if (this.state.params.mode !== 'link') {
        // Only trigger button actions in non-link modes
        // Don't allow underlying page click action to trigger
        event.originalEvent.stopPropagation();

        if (event.props.targetPageId && this.state.isPageZoomed) {
          this.zoomToPage( this.pageIdToCoords(event.props.targetPageId) );
        } else {
          this.highlightPage(event.props.targetPageId, 'selected');
        }
      }
    });

    // Handle remix calls from Android wrapper
    window.createRemix = () => {
      var uri = `/users/${this.state.params.user}/projects/${this.state.params.project}/remixes`;

      // Duplicate project via API call
      api({
        method: 'post',
        uri: uri
      }, (err, data) => {
        if (err) {
          return console.error('Error remixing project', err);
        }

        var projectID = data.project.id;
        var projectTitle = data.project.title;

        // Get author's username
        api({
          method: 'GET',
          uri: `/users/${this.state.params.user}/projects/${this.state.params.project}`
        }, (err, moreData) => {
          if (err) {
            return console.error('Error remixing project', err);
          }

          if (window.Android) {
            window.Android.setView(
              `/users/${this.state.user.id}/projects/${projectID}`,
              JSON.stringify({
                isFreshRemix: true,
                title: projectTitle,
                originalAuthor: moreData.project.author.username
              })
            );
          }
        });
      });
    };

    if (this.android && this.state.routeData.isFreshRemix) {
      // Notify user that THIS IS A REEEEEEMIXXXXX
      dispatcher.fire('modal-confirm:show', {
        config: {
          header: 'Project Remix',
          body: `This is your copy of ${this.state.routeData.title}. You can add or change anything. The original will stay the same. Have fun!`,
          attribution: this.state.routeData.originalAuthor,
          icon: 'tinker.png',
          buttonText: 'OK, got it!'
        }
      });

      // Prepend "Remix of..." to project name

      var remixTitle = this.state.routeData.title;

      if (!remixTitle.match(/^Remix of/)) {
        remixTitle = 'Remix of ' + remixTitle;
      }

      api({
        method: 'PATCH',
        uri: `/users/${this.state.user.id}/projects/${this.state.params.project}`,
        json: {
          title: remixTitle
        }
      }, function (err, body) {
        if (err) {
          console.error('Could not update project settings.');
        }
      });
    }
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
        reportError('Error loading project', err);
      } else if (!data || !data.pages) {
        reportError('No project found...');
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
          return reportError('Error loading project', err);
        }

        if (!data || !data.page) {
          return reportError('No page id returned');
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
        return reportError('There was an error deleting the page', err);
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
        reportError('There was an error updating the element', err);
      }

      if (window.Android) {
        window.Android.goBack();
      }
    });
  },

  render: function () {
    // FIXME: TODO: this should be handled with a touch preventDefault,
    //              not by reaching into a DOM element.
    //
    // Prevent pull to refresh
    document.body.style.overflowY = 'hidden';

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

    // FIXME: TODO: We should ES6-ify things so we don't need this alias
    var self = this;

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
          <FullWidthButton onClick={this.setDestination} off={this.state.params.mode !== 'link' || !this.state.selectedEl}>{this.getIntlMessage('set_destination')}</FullWidthButton>
        </Menu>

        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Project);

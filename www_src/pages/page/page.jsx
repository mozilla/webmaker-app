// FIXME: TODO: This component is huge and needs further refactoring

var React = require('react');
var classNames = require('classnames');
var assign = require('react/lib/Object.assign');
var reportError = require('../../lib/errors');
var api = require('../../lib/api');
var dispatcher = require('../../lib/dispatcher');

var render = require('../../lib/render.jsx');
var types = require('../../components/basic-element/basic-element.jsx').types;
var Loading = require('../../components/loading/loading.jsx');
var ElementGroup = require('../../components/element-group/element-group.jsx');
var PageControls = require('./page-controls.jsx');

var Page = React.createClass({
  mixins: [
    require('../../lib/router'),
    require('./flattening'),
    require('react-intl').IntlMixin
  ],

  /**
   * URI generator - the app allows for user and project switching, so we cannot
   *                 cache these values.
   * @return {String} the API route URI for this page
   */
  uri: function () {
    var params = this.state.params;
    return `/users/${params.user}/projects/${params.project}/pages/${params.page}`;
  },

  getInitialState: function() {
    return {
      loading: true,
      elements: {},
      styles: {},
      currentElementId: -1,
      showAddMenu: false,
      dims: {
        width: 0,
        height: 0
      }
    };
  },

  componentWillMount: function() {
    this.load();
  },

  componentDidMount: function() {
    var bbox = this.refs.container.getDOMNode().getBoundingClientRect();
    if(bbox) {
      this.setState({
        dims: bbox
      });
    }
    dispatcher.on('linkDestinationClicked', (event) => {
      this.followLinkDestination(this.state.params.project, event.id);
    });
  },

  componentDidUpdate: function (prevProps, prevState) {
    // resume
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }

    // set parent back button state
    if (this.state.showAddMenu !== prevState.showAddMenu) {
      this.props.update({
        onBackPressed: this.state.showAddMenu ? this.toggleAddMenu : false
      });
    }
  },


  /**
   * Follow link destinations tied to a specific parent project
   * @param   {String} parentProjectID
   * @param   {String} elementID
   */
  followLinkDestination: function(parentProjectID, elementID) {
    // Data to pass to the Project Link activity to determine its initial state and where to return its data
    var metadata = {
      elementID: elementID,
      pageID: this.state.params.page,
      projectID: this.state.params.project,
      userID: this.state.params.user
    };

    if (window.Android) {
      window.Android.setView('/users/' + this.state.params.user + '/projects/' + parentProjectID + '/link', JSON.stringify(metadata));
    }
  },

  /**
   * Helper function for generating the JSX involved in rendering the pages-container
   */
  generatePagesContainer: function() {
    var innerStyle = {
      backgroundColor: this.state.styles.backgroundColor
    };
    return (
      <div className="pages-container">
        <div className="page">
          <div className="inner" style={innerStyle}>
            <ElementGroup
              ref="container"
              interactive={true}
              dims={this.state.dims}
              elements={this.state.elements}
              currentElementId={this.state.currentElementId}
              onTouchEnd={this.onTouchEnd}
              onUpdate={this.onUpdate}
              onDeselect={this.deselectAll} />
          </div>
        </div>
      </div>
    );
  },

  /**
   * Helper function for generating the JSX involved in rendering the page controls
   */
  generateControls: function() {
    // Url for link to element editor
    var elements = this.state.elements,
        currentId = this.state.currentElementId,
        currentElement = elements[currentId],
        type, href, url;
    if (currentElement) {
      type = currentElement.type;
      href = '/pages/element/#' + type;
      url = this.uri() + `/elements/${currentId}/editor/${type}`;
    }
    return (
      <PageControls addElement={this.addElement}
                    deleteElement={this.deleteElement}
                    toggleAddMenu={this.toggleAddMenu}
                    currentElementId={currentId}
                    showAddMenu={this.state.showAddMenu}
                    url={url}
                    href={href} />
    );
  },

  /**
   * Renders this component to the client
   */
  render: function () {
    return (
      <div id="project" className="demo">
        <div className={classNames({overlay: true, active: this.state.showAddMenu})} />
        { this.generatePagesContainer() }
        { this.generateControls() }
        <Loading on={this.state.loading} />
      </div>
    );
  },

  /**
   * Show, or hide, the menu for adding new elements to the page,
   * toggling between the two states.
   */
  toggleAddMenu: function () {
    this.setState({
      showAddMenu: !this.state.showAddMenu
    });
  },

  /**
   * Deselect the currently selected element(s) if there is/are any.
   */
  deselectAll: function () {
    this.setState({
      currentElementId: -1
    });
  },

  /**
   * Find the highest in-use zindex on the page, so that we can assign
   * elements added to the page a sensible zindex value.
   * @return {int} the highest in-use zindex on the page.
   */
  getHighestIndex: function() {
    return Object.keys(this.state.elements)
                 .map(e => this.state.elements[e].zIndex)
                 .reduce((a,b) => a > b ? a : b, 1);
  },

  /**
   * Elements need to save themselves on a touchend, but depending
   * on whether they were manipulated or not should make sure their
   * z-index is the highest index available for rendering: if an
   * element was only tapped, not manipulated, it should become the
   * highest visible element on the page.
   */
  onTouchEnd: function(elementId) {
    var localSave = this.save(elementId);

    return function saveOrReindex(modified) {
      if(modified) {
        return localSave();
      }

      // A plain tap without positional modificationss means we need
      // to raise this element's z-index to "the highest number".
      var elements = this.state.elements,
          element = elements[elementId],
          highestIndex = this.getHighestIndex();
      if (element.zIndex !== highestIndex) {
        element.zIndex = highestIndex + 1;
      }
      this.setState({ elements: elements }, localSave);
    }.bind(this);
  },

  /**
   * Factory function for generating functions that update elements
   * based on a change in their CSS transforms.
   */
  onUpdate: function (elementId) {
    // actual function, bound to a specific elementId:
    return (newProps) => {
      var elements = this.state.elements;
      var element = elements[elementId];
      elements[elementId] = assign(element, newProps);
      this.setState({
        elements: elements,
        currentElementId: elementId
      });
    };
  },

  /**
   * Factory function for adding elements of a particular type
   * to the page.
   */
  addElement: function(type) {
    var highestIndex = this.getHighestIndex();

    // actual function, bound to the element type
    return () => {
      var json = types[type].spec.generate();
      json.styles.zIndex = highestIndex + 1;
      this.setState({loading: true});

      api({spinOnLag: false, method: 'post', uri: this.uri() + '/elements', json}, (err, data) => {
        var state = {showAddMenu: false, loading: false};
        if (err) {
          reportError(this.getIntlMessage('error_create_element'), err);
        }
        var localSave = function(){};
        if (data && data.element) {
          var elementId = data.element.id;
          json.id = elementId;
          state.elements = this.state.elements;
          state.elements[elementId] = this.flatten(json);
          state.currentElementId = elementId;
          localSave = this.save(elementId);
        }
        this.setState(state, function() {
          localSave();
        });
      });
    };
  },

  /**
   * Remove the currently selected element from this page
   */
  deleteElement: function() {
    if (this.state.currentElementId === -1) {
      return;
    }

    var elements = this.state.elements;
    var id = this.state.currentElementId;

    // Don't delete test elements for real;
    if (parseInt(id, 10) <= 3) {
      return window.alert('this is a test element, not deleting.');
    }

    this.setState({loading: true});
    api({spinOnLag: false, method: 'delete', uri: this.uri() + '/elements/' + id}, (err, data) => {
      this.setState({loading: false});
      if (err) {
        return reportError(this.getIntlMessage('error_delete_element'));
      }

      elements[id] = false;
      var currentElementId = -1;
      delete elements[id];

      Object.keys(elements).some(function(e) {
        if (e.id) { currentElementId = e.id; }
        return !!e;
      });

      this.setState({
        elements: elements,
        currentElementId: currentElementId
      });
    });
  },

  // FIXME: TODO: load and save probably need to live somewhere else, either getting
  //              tacked onto the class via mixins, or being part of Base class functionality.

  load: function() {
    this.setState({loading: true});
    api({
      uri: this.uri()
    }, (err, data) => {
      this.setState({loading: false});
      if (err) {
        return reportError(this.getIntlMessage('error_page'), err);
      }

      if (!data || !data.page) {
        return reportError(this.getIntlMessage('error_page_404'));
      }

      var page = data.page;
      var styles = page.styles;
      var elements = {};

      page.elements.forEach(element => {
        var element = this.flatten(element);
        if(element) {
          elements[element.id] = element;
        }
      });

      this.setState({
        loading: false,
        styles,
        elements
      });
    });
  },

  save: function (elementId) {
    // generate a named function,
    return function saveElement() {
      var el = this.expand(this.state.elements[elementId]);
      api({
        spinOnLag: false,
        method: 'patch',
        uri: this.uri() + '/elements/' + elementId,
        json: {
          styles: el.styles
        }
      }, (err, data) => {
        if (err) {
          return reportError(this.getIntlMessage('error_update_element'), err);
        }

        if (!data || !data.element) {
          reportError(this.getIntlMessage('error_element_404'));
        }
      });
    }.bind(this);
  }
});

// Render!
render(Page);

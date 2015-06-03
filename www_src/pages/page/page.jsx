var React = require('react');
var classNames = require('classnames');
var assign = require('react/lib/Object.assign');
var render = require('../../lib/render.jsx');
var router = require('../../lib/router.jsx');
var api = require('../../lib/api.js');
var types = require('../../components/el/el.jsx').types;
var dispatcher = require('../../lib/dispatcher');

var Link = require('../../components/link/link.jsx');
var Loading = require('../../components/loading/loading.jsx');
var ElementGroup = require('../../components/element-group/element-group.jsx');

var Page = React.createClass({

  mixins: [router],

  uri: function () {
    var params = this.state.params;
    return `/users/1/projects/${params.project}/pages/${params.page}`;
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

  render: function () {
    var elements = this.state.elements;

    var secondaryClass = (name => {
      var names = {
        secondary: true,
        active: this.state.currentElementId > -1 && !this.state.showAddMenu
      };
      names[name] = true;
      return classNames(names);
    });

    // Url for link to element editor
    var href = '';
    var url = '';
    var currentEl = elements[this.state.currentElementId];
    if (typeof currentEl !== 'undefined') {
      href = '/pages/element/#' + currentEl.type;
      var params = this.state.params;
      url = `/projects/${params.project}/pages/${params.page}/elements/${currentEl.id}/editor/${currentEl.type}`;
    }

    return (<div id="project" className="demo">
      <div className="pages-container">
        <div className="page">
          <div className="inner" style={{backgroundColor: this.state.styles.backgroundColor}}>
            {/*<div ref="container" className="positionables">{ positionables }</div>*/}
            <ElementGroup
              ref="container"
              interactive={true}
              dims={this.state.dims}
              elements={this.state.elements}
              currentElementId={this.state.currentElementId}
              onTouchEnd={this.onTouchEnd}
              onUpdate={this.updateElement}
              onDeselect={this.deselectAll} />
          </div>
        </div>
      </div>

      <div className={classNames({overlay: true, active: this.state.showAddMenu})} onClick={this.toggleAddMenu}/>

      <div className={classNames({'controls': true, 'add-active': this.state.showAddMenu})}>
        <div className="add-menu">
          <button className="text" onClick={this.addElement('text')}><img className="icon" src="../../img/text.svg" /></button>
          <button className="image" onClick={this.addElement('image')}><img className="icon" src="../../img/camera.svg" /></button>
          <button className="link" onClick={this.addElement('link')}><img className="icon" src="../../img/link.svg" /></button>
        </div>
        <button className={secondaryClass("delete")} onClick={this.deleteElement} active={this.state.currentElementId===-1}>
          <img className="icon" src="../../img/trash.svg" />
        </button>
        <button className="add" onClick={this.toggleAddMenu}></button>
        <Link
          className={ secondaryClass("edit") }
          url={url}
          href={href}>
          <img className="icon" src="../../img/brush.svg" />
        </Link>
      </div>
      <Loading on={this.state.loading} />
    </div>);
  },

  componentDidMount: function() {
    var bbox = this.refs.container.getDOMNode().getBoundingClientRect();
    if(bbox) {
      this.setState({
        dims: bbox
      });
    }

    var parentProjectID = this.state.params.project;

    dispatcher.on('linkDestinationClicked', function (e) {
      // Data to pass to the Project Link activity to determine its initial state and where to return its data
      var metadata = {
        elementID: e.id,
        pageID: this.state.params.page
      };

      if (window.Android) {
        window.Android.setView('/projects/' + parentProjectID + '/link', JSON.stringify(metadata));
      }
    }.bind(this));
  },

  toggleAddMenu: function () {
    this.setState({
      showAddMenu: !this.state.showAddMenu
    });
  },

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

  addElement: function(type) {
    var highestIndex = this.getHighestIndex();

    return () => {
      var json = types[type].spec.generate();
      json.styles.zIndex = highestIndex + 1;

      api({method: 'post', uri: this.uri() + '/elements', json}, (err, data) => {
        var state = {showAddMenu: false};
        if (err) {
          console.log('There was an error creating an element', err);
        }
        if (data && data.element) {
          var id = data.element.id;
          json.id = id;
          state.elements = this.state.elements;
          state.elements[id] = this.flatten(json);
          state.currentElementId = id;
        }
        this.setState(state);
      });
    };
  },

  onTouchEnd: function(elementId) {
    // A plain tap without positional modificationss means we need
    // to raise this element's z-index to "the highest number".
    return (modified) => {
      if(!modified) {
        var elements = this.state.elements;
        var element = elements[elementId];
        element.zIndex = this.getHighestIndex() + 1;
        this.setState({ elements }, function() {
          this.save(elementId);
        });
      } else {
        this.save(elementId);
      }
    };
  },

  updateElement: function (elementId) {
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

    api({method: 'delete', uri: this.uri() + '/elements/' + id}, (err, data) => {
      if (err) {
        return console.error('There was a problem deleting the element');
      }

      elements[id] = false;
      var currentElementId = -1;
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

  flatten: function (element) {
    if (!types[element.type]) {
      return false;
    }

    return types[element.type].spec.flatten(element);
  },

  expand: function (element) {
    if (!types[element.type]) {
      return false;
    }

    return types[element.type].spec.expand(element);
  },

  load: function() {
    api({
      uri: this.uri()
    }, (err, data) => {
      if (err) {
        return console.error('There was an error getting the page to load', err);
      }

      if (!data || !data.page) {
        return console.error('Could not find the page to load');
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

  save: function (id) {
    return () => {
      var el = this.expand(this.state.elements[id]);
      api({
        method: 'patch',
        uri: this.uri() + '/elements/' + id,
        json: {
          styles: el.styles
        }
      }, (err, data) => {
        if (err) {
          return console.error('There was an error updating the element', err);
        }

        if (!data || !data.element) {
          console.error('Could not find the element to save');
        }
      });
    };
  }
});

// Render!
render(Page);

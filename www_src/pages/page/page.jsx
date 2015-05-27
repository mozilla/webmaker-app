var React = require('react');
var classNames = require('classnames');
var assign = require('react/lib/Object.assign');
var render = require('../../lib/render.jsx');
var router = require('../../lib/router.jsx');
var api = require('../../lib/api.js');
var types = require('../../components/el/el.jsx').types;

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
      currentElement: -1,
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
        active: this.state.currentElement > -1 && !this.state.showAddMenu
      };
      names[name] = true;
      return classNames(names);
    });

    // Url for link to element editor
    var href = '';
    var url = '';
    var currentEl = elements[this.state.currentElement];
    if (typeof currentEl !== 'undefined') {
      href = '/pages/element/#' + currentEl.type;
      var params = this.state.params;
      url = `/projects/${params.project}/pages/${params.page}/elements/${currentEl.id}/editor/${currentEl.type}`;
    }

    return (<div id="project" className="demo">
      <div className="pages-container">
        <div className="page">
          <div className="inner" style={{backgroundColor: this.state.styles.backgroundColor}}>
            <ElementGroup
              ref="container"
              interactive={true}
              dims={this.state.dims}
              elements={this.state.elements}
              currentElementId={this.state.currentElement}
              onTouchEnd={this.save}
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
        <button className={secondaryClass("delete")} onClick={this.deleteElement} active={this.state.currentElement===-1}>
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
  },

  toggleAddMenu: function () {
    this.setState({showAddMenu: !this.state.showAddMenu});
  },

  deselectAll: function () {
    this.setState({
      currentElement: -1
    });
  },

  addElement: function(type) {
    return () => {
      var json = types[type].spec.generate();

      api({method: 'post', uri: this.uri() + '/elements', json}, (err, data) => {
        var state = {showAddMenu: false};
        if (err) {
          console.error('There was an error creating an element', err);
        }
        if (data && data.element) {
          var id = data.element.id
          json.id = id;
          state.elements = this.state.elements;
          state.elements[id] = json;
          state.currentElement = id;
        }
        this.setState(state);
      });
    };
  },

  updateElement: function (id) {
    return (newProps) => {
      var elements = this.state.elements;
      var element = elements[id];
      elements[id] = assign(element, newProps);
      this.setState({
        elements: elements,
        currentElement: id
      });
    };
  },

  deleteElement: function() {
    if (this.state.currentElement === -1) {
      return;
    }

    var elements = this.state.elements;
    var id = this.state.currentElement;

    // FIXME: TODO: can we remove this code? This should not have landed in any PR?
    if (parseInt(id, 10) <= 3) {
      // Don't delete test elements for real;
      return window.alert('this is a test element, not deleting.');
    }

    api({method: 'delete', uri: this.uri() + '/elements/' + id}, (err, data) => {
      if (err) {
        return console.error('There was a problem deleting the element');
      }

      elements[id] = false;
      var currentElement = -1;
      Object.keys(elements).some(function(e) {
        if (e.id) { currentElement = e.id; }
        return !!e;
      });
      this.setState({
        elements,
        currentElement
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

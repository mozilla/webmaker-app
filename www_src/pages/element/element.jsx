var React = require('react/addons');
var reportError = require('../../lib/errors');
var router = require('../../lib/router');
var api = require('../../lib/api');

var Loading = require('../../components/loading/loading.jsx');
var render = require('../../lib/render.jsx');

var editors = {
  image: require('./image-editor.jsx'),
  link: require('./link-editor.jsx'),
  text: require('./text-editor.jsx')
};

var types = require('../../components/basic-element/basic-element.jsx').types;

var hash = window.location.hash && window.location.hash.replace('#', '');
var testIds = {
  image: 1,
  text: 2,
  link: 3
};

render(React.createClass({
  mixins: [
    router,
    require('react-intl').IntlMixin
  ],

  uri: function () {
    var params = this.state.params;
    var element = params.element;
    if (hash) {
      element = testIds[hash];
    }
    return `/users/${params.user}/projects/${params.project}/pages/${params.page}/elements/${element}`;
  },

  componentWillMount: function() {
    this.load();

    var saveBeforeSwitch = function() {
      var goBack = function() {
        window.Android.goBack();
      };
      if (!this.edits) {
        return goBack();
      }
      this.save(goBack);
    }.bind(this);

    this.props.update({
      onBackPressed: saveBeforeSwitch
    });
  },

  componentDidMount: function () {
    // FIXME: TODO: This should be handled with a touch preventDefault,
    //              not by reaching into the DOM.
    // Prevent pull to refresh
    document.body.style.overflowY = 'hidden';
  },

  componentDidUpdate: function (prevProps) {
    // resume
    if (this.props.isVisible && !prevProps.isVisible) {
      if (this.state.noDataRefresh) {
        this.setState({noDataRefresh: false});
      } else {
        this.load();
      }
    }
  },

  cacheEdits: function (edits) {
    this.edits = edits;
  },

  /**
   * Hack that allows us to temporarily cancel a new api call
   * after launching the camera activity.
   */
  cancelDataRefresh: function () {
    this.setState({
      noDataRefresh: true
    });
  },

  save: function (onSaveComplete) {
    var edits = this.edits;
    if (!edits) {
      if (typeof onSaveComplete === 'function') {
        onSaveComplete();
      }
      return;
    }
    var json = types[edits.type].spec.expand(edits);

    this.setState({loading: true});

    api({method: 'patch', uri: this.uri(), json: {
      styles: json.styles,
      attributes: json.attributes
    }}, (err, data) => {
      this.setState({loading: false});
      if (err) {
        reportError(this.getIntlMessage('error_update_element'), err);
      }

      this.setState({
        elements: edits
      });
      this.edits = false;

      if (typeof onSaveComplete === 'function') {
        onSaveComplete();
      }
    });
  },

  load: function () {
    this.setState({loading: true});
    api({uri: this.uri()}, (err, data) => {
      this.setState({loading: false});
      if (err) {
        return reportError(this.getIntlMessage('error_element'), err);
      }

      if (!data || !data.element) {
        return reportError(this.getIntlMessage('error_element_404'));
      }

      this.setState({element: data.element});
    });
  },

  render: function () {
    var Editor;
    var {params, element} = this.state;

    if (typeof element === 'undefined') {
      return (<Loading on={true} />);
    }

    Editor = editors[params.editor] || editors[hash] || editors.link;

    var props = {
      params,
      cacheEdits: this.cacheEdits,
      cancelDataRefresh: this.cancelDataRefresh,
      save: this.save
    };
    if (element) {
      props.element = element;
    }

    return (<div id="editor">
      <Editor {...props} />
      <button hidden={window.Android} onClick={this.save}>DEBUG:SAVE</button>
      <Loading on={this.state.loading}/>
    </div>);
  }
}));


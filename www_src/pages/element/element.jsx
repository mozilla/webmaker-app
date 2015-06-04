var React = require('react/addons');
var render = require('../../lib/render.jsx');
var api = require('../../lib/api.js');
var Loading = require('../../components/loading/loading.jsx');

var editors = {
  image: require('./image-editor.jsx'),
  link: require('./link-editor.jsx'),
  text: require('./text-editor.jsx')
};

var types = require('../../components/el/el.jsx').types;

var hash = window.location.hash && window.location.hash.replace('#', '');
var testIds = {
  image: 1,
  text: 2,
  link: 3
};

render(React.createClass({
  mixins: [
    require('../../lib/router.jsx'),
    require('../../lib/snackbar-mixin')
  ],
  uri: function () {
    var params = this.state.params;
    var element = params.element;
    if (hash) {
      element = testIds[hash];
    }
    return `/users/1/projects/${params.project}/pages/${params.page}/elements/${element}`;
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
  componentDidUpdate: function (prevProps) {
    // resume
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },
  cacheEdits: function (edits) {
    this.edits = edits;
  },
  save: function (postSave) {
    var edits = this.edits;
    var json = types[edits.type].spec.expand(edits);
    api({method: 'patch', uri: this.uri(), json: {
      styles: json.styles,
      attributes: json.attributes
    }}, (err, data) => {
      if (err) {
        return this.recordError('There was an error updating the element', err);
      }
      this.setState({
        elements: edits
      });
      this.edits = false;
      if (postSave) {
        postSave();
      }
    });
  },
  load: function () {
    api({uri: this.uri()}, (err, data) => {
      if (err) {
        return this.recordError('Error loading element', err);
      }
      if (!data || !data.element) {
        return this.recordError('No element found');
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

    var props = {params, cacheEdits: this.cacheEdits};
    if (element) {
      props.element = element;
    }

    return (<div>
      <Editor {...props} />
      { this.generateSnackbarTest() }
    </div>);
  }
}));

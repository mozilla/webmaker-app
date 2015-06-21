var React = require('react/addons');
var api = require('../../lib/api');
var reportError = require('../../lib/errors');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/loading/loading.jsx');

var Discover = React.createClass({
  mixins: [
    require('react-intl').IntlMixin
  ],
  getInitialState: function () {
    return {
      projects: [],
      loading: false
    };
  },
  load: function () {
    this.setState({loading: true});
    api({
      uri: '/discover?count=25',
      useCache: true
    }, (err, body) => {
      this.setState({loading: false});
      if (err) {
        return reportError(this.getIntlMessage('error_featured'), err);
      }

      if (!body || !body.projects || !body.projects.length) {
        return reportError(this.getIntlMessage('error_featured_404'));
      }

      this.setState({
        projects: body.projects
      });
    });
  },
  componentWillMount: function () {
    this.load();
  },
  render: function () {
    var cards = this.state.projects.map( project => {
      return (
        <Card
          key={project.id}
          url={"/users/" + project.author.id + "/projects/" + project.id + '/play'}
          href="/pages/project"
          thumbnail={project.thumbnail[320]}
          title={project.title}
          author={project.author.username} />
      );
    });

    return (
      <div id="discover">
        {cards}
        <div hidden={this.state.loading || this.state.projects}>Sorry, no projects found.</div>
        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Discover);

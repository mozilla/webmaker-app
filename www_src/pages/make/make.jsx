var React = require('react');
var api = require('../../lib/api');
var router = require('../../lib/router');
var dispatcher = require('../../lib/dispatcher');
var reportError = require('../../lib/errors');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/loading/loading.jsx');
var Link = require('../../components/link/link.jsx');

var Make = React.createClass({
  mixins: [router, require('react-intl').IntlMixin],
  getInitialState: function () {
    return {
      projects: [],
      loading: true
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },
  componentDidMount: function () {
    this.load();
  },
  onError: function (err) {
    reportError("Error loading projects", err);
    this.setState({loading: false});
  },
  onEmpty: function () {
    this.setState({loading: false});
  },
  load: function () {
    // No user found, so nothing to load.
    if (!this.state.user) {
      return this.onEmpty();
    }

    this.setState({loading: true});

    api({
      uri: `/users/${this.state.user.id}/projects`
    }, (err, body) => {
      if (err) {
        return this.onError(err);
      }

      if (!body || !body.projects || !body.projects.length) {
        return this.onEmpty();
      }

      this.setState({
        loading: false,
        projects: body.projects
      });
    });
  },
  addProject: function () {
    var defaultTitle = 'My project';
    var user = this.state.user;

    if (!user) {
      return reportError('Tried to create project when no session was found');
    }

    this.setState({loading: true});
    api({
      method: 'post',
      uri: `/users/${user.id}/projects`,
      json: {
        title: defaultTitle
      }
    }, (err, body) => {
      if (err) {
        return this.onError(err);
      }
      if (!body || !body.project) {
        return this.onEmpty();
      }
      if (window.Android) {
        window.Android.trackEvent('Make', 'Create a Project', 'New Project Started');
        window.Android.setView('/users/' + user.id + '/projects/' + body.project.id);
      }

      body.project.author = body.project.author || user;

      this.setState({
        loading: false,
        projects: [body.project].concat(this.state.projects)
      });
    });
  },

  logout: function () {
    if (window.Android) {
      window.Android.trackEvent('Login', 'Sign Out', 'Sign Out Success');
      window.Android.clearUserSession();
      window.Android.setView('/login/sign-in');
    }
  },

  cardActionClick: function (e) {
    dispatcher.fire('modal-switch:show', {
      config: {
        actions: ['Share', 'Delete'],
        callback: (event) => {
          if (event.label === 'Delete') {
            this.setState({loading: true});

            api({
              method: 'DELETE',
              uri: `/users/${this.state.user.id}/projects/${e.projectID}`
            }, (err, body) => {
              this.setState({loading: false});

              if (err) {
                return this.onError(err);
              }

              if (window.Android) {
                window.Android.trackEvent('Make', 'Delete Project', 'Project Deleted');
              }
              console.log('Deleted project: ' + e.projectID);
              this.load();
            });
          } else if (event.label === 'Share') {
            if (window.Android) {
              window.Android.shareProject(this.state.user.id, e.projectID);
            }
          }
        }
      }
    });
  },

  render: function () {

    var cards = this.state.projects.map(project => {
      return (
        <Card
          showButton={true}
          onActionsClick={this.cardActionClick}
          projectID={project.id}
          key={project.id}
          url={"/users/" + project.author.id + "/projects/" + project.id}
          href="/pages/project"
          thumbnail={project.thumbnail[320]}
          title={project.title}
          author={project.author.username} />
      );
    });
    return (
      <div id="make">
        <div className="profile-card">
          <h3>{this.state.user.username}</h3>
          <p><button className="btn" onClick={this.logout}>{this.getIntlMessage('log_out')}</button></p>
        </div>
        <button onClick={this.addProject} className="btn btn-create btn-block btn-teal">
          {'+ ' + this.getIntlMessage('create_a_project')}
        </button>
        {cards}
        <Loading on={this.state.loading} />
        <Link url="/style-guide" hidden={window.Android && !window.Android.isDebugBuild()} className="btn btn-create btn-block btn-teal">
           Open Style Guide
        </Link>
      </div>
    );
  }
});

// Render!
render(Make);

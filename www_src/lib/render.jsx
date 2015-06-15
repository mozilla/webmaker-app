var React = require('react');
var Spindicator = require('../components/spindicator/spindicator.jsx');
var ModalConfirm = require('../components/modal-confirm/modal-confirm.jsx');
var ModalSwitch = require('../components/modal-switch/modal-switch.jsx');
var Snackbar = require('../components/snackbar/snackbar.jsx');

var intlData = {
  locales: ['en-US'],
  messages: {
    sign_in: 'Sign In',
    sign_in_error: 'Looks like there might be a problem with your username or password.',
    dont_have_account: 'Don\'t have an account?',
    join_webmaker: 'Join Webmaker'
  }
};

var Base = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  onResume: function () {
    this.setState({isVisible: true});
  },
  onPause: function () {
    this.setState({isVisible: false});
  },
  onBackPressed: function() {
    if (this.state.onBackPressed) {
      return this.state.onBackPressed();
    } else if (window.Android) {
      window.Android.goBack();
    }
  },
  jsComm: function (event) {
    if (this[event]) {
      this[event]();
    }
  },
  getInitialState: function () {
    // Expose to android
    window.jsComm = this.jsComm;
    return {
      isVisible: true,
      onBackPressed: false
    };
  },
  update: function (state) {
    this.setState(state);
  },
  render: function () {
    var Route = this.props.route;
    return (<div className="container">
      <Snackbar/>
      <Spindicator/>
      <ModalConfirm/>
      <ModalSwitch/>
      <Route isVisible={this.state.isVisible} update={this.update} />
    </div>);
  }
});

module.exports = function (Route) {
  React.render(<Base route={Route} {...intlData} />, document.getElementById('app'));
};

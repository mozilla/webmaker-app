var React = require('react/addons');
var reportError = require('../../lib/errors');
var api = require('../../lib/api');
var keyboard = require('../../lib/keyboard');

var FormInput = require('./form-input.jsx');
var Link = require('../../components/link/link.jsx');

// <SignIn />
// Component for the Sign in user form. See Login view for usage.
var SignIn = React.createClass({

  mixins: [
    React.addons.LinkedStateMixin,
    require('../../lib/validators'),
    require('react-intl').IntlMixin
  ],

  // Props:
  //   show
  //     boolean
  //     Shows the entire component if true, hides if false
  //   setParentState
  //     function(state)
  //     Calls setState on parent component (Login) given a state object.
  //     Useful for setting the loading or mode state of the Login view.
  //
  // FIXME: TODO: this function doesn't actually do anything. Remove?
  getDefaultProps: function () {
    return {};
  },

  // State:
  //   globalError
  //     string or boolean
  //     Indicates whether or not a an error was received from the server.
  //   username
  //   password
  //     string
  //     These store state for the form input fields
  getInitialState: function () {
    return {
      globalError: false
    };
  },

  // FIXME: TODO: move to statics?
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'email',
      tabIndex: 1,
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      tabIndex: 2,
      required: true,
      helpText: <Link external="https://id.webmaker.org/reset-password?android=true">Reset Password</Link>
    }
  ],

  // Called when the form is submitted
  // Triggers an api call via api.authenticate
  // If an error is received, sets state.globalError
  // If success:
  //    1. resets form
  //    2. caches user session in Android
  //    3. redirects to /main
  onSubmit: function (e) {
    e.preventDefault();

    var errors = this.getValidationErrors();
    if (Object.keys(errors).length > 0) {
      return;
    }

    var json = {
      uid: this.state.username,
      password: this.state.password
    };

    this.props.setParentState({loading: true});
    api.authenticate({json}, (err, data) => {
      this.props.setParentState({loading: false});
      if (err) {
        if (window.Android) {
          window.Android.trackEvent('Login', 'Sign In', 'Sign In Error');
        }
        this.setState({globalError: true});
        return reportError("Error while trying to log in", err);
      }

      this.replaceState(this.getInitialState());

      if (window.Android) {
        window.Android.trackEvent('Login', 'Sign In', 'Sign In Success');
        window.Android.setUserSession(JSON.stringify(data));
        window.Android.setView('/main');
      }
    });
  },

  // Hack to get the Android WebView to use the "done" button to "tab" to the
  // next form input by tabIndex
  onDoneEditing: function () {
    keyboard.focusNextInputByTabIndex();
  },

  // Changes parent mode (Login component) to show sign-up
  changeMode: function (e) {
    e.preventDefault();
    this.props.setParentState({mode: 'sign-up'});
  },

  render: function () {

    var errors = this.getValidationErrors();
    var isValid = Object.keys(errors).length === 0;

    return (<form hidden={!this.props.show} className="editor-options" onSubmit={this.onSubmit}>
      {this.fields.map(field => {
        return <FormInput {...field}
          key={field.name}
          onReturn={this.onDoneEditing}
          errors={errors[field.name]}
          valueLink={this.linkState(field.name)} />;
      })}
      <div className="form-group">
        <button className="btn btn-block" disabled={!isValid} onClick={this.onSubmit}>
         {this.getIntlMessage('sign_in')}
        </button>
        <div className="error" hidden={!this.state.globalError}>
          {this.getIntlMessage('sign_in_error')}
        </div>
      </div>
      <div className="form-group text-center text-larger">
        {this.getIntlMessage('dont_have_account')} <a href="#" onClick={this.changeMode}>{this.getIntlMessage('join_webmaker')}</a>
      </div>
    </form>);
  }
});

module.exports = SignIn;

var React = require("react/addons");
var Snackbar = require('../components/snackbar/snackbar.jsx');

module.exports = {
  /**
   * Public API for getting an error sent to the user via a snackbar notice.
   * The snackbar will slide away after three seconds.
   *
   * @param {string} errorMsg The message to show the user
   * @param {object} details Additional details to log to the console for debugging
   */
  recordError: function(errorMsg, details) {
    if (this.refs.snackbar) {
      this.refs.snackbar.showMessage(errorMsg);
    } else {
      this.pendingError = errorMsg;
    }
    console.error(errorMsg, details);
  },

  /**
   * A generator function for components to use in order to get
   * the snackbar rendered without needing to load in the actual
   * component themselves.
   *
   * @return {JSX} The JSX object representing the Snackbar component
   */
  generateSnackbar: function() {
    return <Snackbar ref="snackbar" message={this.pendingError} /> ;
  },

  /**
   * INTERNAL FUNCITON: a test function that is called by the button in
   * the snackbar test, simulating an error being sent into the snackbar.
   */
  testSnackbar: function() {
    this.recordError("Oh dear someone pressed the button");
  },

  /**
   * A generator function for testing the snackbar functionality in
   * another component. Use this function rather than the normal
   * generateSnackbar() function in order to also render a button
   * that simulates an error being generated when pressed.
   *
   * @return {JSX} JSX objects for the Snackbar component, and a testing button.
   */
  generateSnackbarTest: function() {
    return <div>
      <button onClick={ this.testSnackbar }>generate error</button>
      { this.generateSnackbar() }
    </div>
  }
};

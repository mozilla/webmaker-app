var React = require("react/addons");
var Snackbar = require('../components/snackbar/snackbar.jsx');

module.exports = {
  /**
   * [recordError description]
   * @param  {[type]}
   * @param  {[type]}
   * @return {[type]}
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
   * [generateSnackbar description]
   * @param  {[type]}
   * @return {[type]}
   */
  generateSnackbar: function() {
    return <Snackbar ref="snackbar" message={this.pendingError} /> ;
  },

  /**
   * [testSnackbar description]
   * @return {[type]}
   */
  testSnackbar: function() {
    this.recordError("Oh dear someone pressed the button");
  },

  /**
   * [generateTestJSX description]
   * @return {[type]}
   */
  generateSnackbarTest: function() {
    return <div>
      <button onClick={ this.testSnackbar }>generate error</button>
      { this.generateSnackbar() }
    </div>
  }
}